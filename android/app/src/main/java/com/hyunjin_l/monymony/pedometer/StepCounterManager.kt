package com.hyunjin_l.monymony.pedometer
import android.Manifest
import android.app.ActivityManager
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.util.Log
import androidx.core.content.ContextCompat
import com.hyunjin_l.monymony.database.repository.StepCounterRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

/**
 * 걸음수 측정 로직을 통합 관리하는 매니저 클래스
 * AOSPedometerModule과 StepCounterService에서 공통으로 사용
 * 싱글톤 패턴으로 구현하여 데이터 동기화 보장
 */
class StepCounterManager private constructor(
    private val context: Context,
    private val coroutineScope: CoroutineScope
) : SensorEventListener {
    
    private val repository = StepCounterRepository(context)
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    
    // 주기적 날짜 체크 Job
    private var dateCheckJob: Job? = null
    
    // 걸음수 측정 상태 (메모리 - 현재 센서값만 임시 저장)
    data class StepData(
        var currentSensorValue: Long = 0L,   // 현재 센서 값
        var baselineSteps: Long = -1L,       // 오늘의 기준점 (오늘 첫 센서값)
        var stepOffset: Long = 0L            // 재부팅 전 누적 걸음수 오프셋
    ) {
        // 오늘 걸음수는 항상 센서 기반으로 실시간 계산 (재부팅 오프셋 포함)
        fun getTodaySteps(): Long {
            return if (baselineSteps >= 0 && currentSensorValue >= baselineSteps) {
                Log.d("StepData", "오늘 걸음수 getTodaySteps 계산: currentSensorValue=$currentSensorValue, baselineSteps=$baselineSteps, stepOffset=$stepOffset")
                stepOffset + (currentSensorValue - baselineSteps)
            } else {
                stepOffset
            }
        }
    }
    
    private val stepData = StepData()
    
    // 마지막으로 저장한 걸음수 (중복 저장 방지)
    private var lastSavedDisplaySteps: Long = -1L
    
    // 콜백 인터페이스
    interface StepCounterCallback {
        fun onStepsUpdated(stepData: StepData)
        fun onStepsSaved(totalSteps: Long)
        fun onNewDayDetected()
        fun onRebootDetected()
    }
    
    private val callbacks = mutableListOf<StepCounterCallback>()
    
    // 싱글톤 인스턴스
    companion object {
        @Volatile
        private var INSTANCE: StepCounterManager? = null
        
        fun getInstance(context: Context, coroutineScope: CoroutineScope): StepCounterManager {
            return INSTANCE ?: synchronized(this) {
                val instance = StepCounterManager(context.applicationContext, coroutineScope)
                INSTANCE = instance
                instance
            }
        }
    }
    
    // 권한 체크
    private fun hasActivityRecognitionPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACTIVITY_RECOGNITION
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    // 초기화
    suspend fun initialize() {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        Log.d("StepCounterManager", "🔧🔧 StepCounterManager 초기화 시작 (오늘=$today) 🔧🔧")
        
        // ACTIVITY_RECOGNITION 권한 체크
        if (!hasActivityRecognitionPermission()) {
            Log.e("StepCounterManager", "❌ ACTIVITY_RECOGNITION 권한 없음 - 초기화 중단")
            return
        }
        
        Log.d("StepCounterManager", "✅ ACTIVITY_RECOGNITION 권한 확인됨")
        
        // 앱 시작 시 날짜 변경 체크 (앱 종료 후 다음날 실행 케이스)
        val dateChanged = repository.isNewDay()
        
        if (dateChanged) {
            Log.d("StepCounterManager", "🌅🌅 앱 시작 시 날짜 변경 감지! (오늘=$today)")
            
            // 날짜가 바뀌었으면 어제 데이터 저장 (DB 기준으로 계산)
            // DB에서 어제 최종 걸음수는 이미 저장되어 있으므로, 현재 센서값 기준으로 계산
            repository.handleDateChangeOnNewDay(0L)  // 어제 걸음수는 날짜 변경 감지 시점에 이미 계산되어 있음
            
            // 메모리 초기화 (DB 기준이므로 메모리는 현재 센서값만 저장)
            Log.d("StepCounterManager", "🔄 [변경] currentSensorValue: ${stepData.currentSensorValue} → 0L (날짜 변경 초기화)")
            stepData.currentSensorValue = 0L
            stepData.baselineSteps = -1L
            Log.d("StepCounterManager", "✅✅ 메모리 초기화 완료! baselineSteps=-1 (새로운 날 시작)")
            Log.d("StepCounterManager", "🎯 새로운 날($today) 걸음수 측정 시작 준비")
        } else {
            Log.d("StepCounterManager", "📅 같은 날 계속 ($today)")

            // 같은 날이면 DB에서 baselineSteps + todaySteps 로드
            // todaySteps → stepOffset으로 복원 (앱 업데이트/재시작 후에도 걸음수 유지)
            val sensorBaseline = repository.getTodayBaselineSteps()
            if (sensorBaseline != null) {
                stepData.baselineSteps = sensorBaseline
                stepData.stepOffset = repository.getTodaySteps()
                Log.d("StepCounterManager", "📊 DB에서 로드: baselineSteps=${stepData.baselineSteps}, stepOffset=${stepData.stepOffset} (날짜=$today)")
            }
        }
        
        // 센서 등록
        registerStepSensor()
        
        // 주기적 날짜 체크 시작
        startDateCheckTimer()
        
        Log.d("StepCounterManager", "✅ 초기화 완료 - 센서 대기 중 (오늘=$today)")
    }
    
    // 센서 등록
    private fun registerStepSensor() {
        // 권한 재체크 (보안 강화)
        if (!hasActivityRecognitionPermission()) {
            Log.e("StepCounterManager", "❌ 센서 등록 실패: ACTIVITY_RECOGNITION 권한 없음")
            return
        }

        // 1. 걸음수 센서 가져오기
        val stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
        
        if (stepSensor != null) {
            Log.d("StepCounterManager", "🔄 걸음 센서 등록")
            // 2. 리스너 등록 (콜백 방식)
            sensorManager.registerListener(
                this,                           // SensorEventListener 구현체
                stepSensor,                     // 센서
                SensorManager.SENSOR_DELAY_UI   // 업데이트 빈도
            )
        } else {
            Log.e("StepCounterManager", "❌ 걸음 센서 없음")
        }
    }
    
    // 센서 해제
    fun unregisterSensor() {
        Log.d("StepCounterManager", "🔄 센서 리스너 해제")
        sensorManager.unregisterListener(this)
        stopDateCheckTimer()
    }
    
    // 메모리 정보 가져오기
    private fun getMemoryInfo(): ActivityManager.MemoryInfo {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        return ActivityManager.MemoryInfo().also { memoryInfo ->
            activityManager.getMemoryInfo(memoryInfo)
        }
    }
    
    // 메모리 정보를 읽기 쉬운 형식으로 변환
    private fun formatMemorySize(bytes: Long): String {
        val mb = bytes / (1024 * 1024)
        return "${mb}MB"
    }
    
    // 주기적으로 날짜 변경을 체크하는 타이머 시작
    private fun startDateCheckTimer() {
        dateCheckJob?.cancel() // 기존 Job이 있으면 취소
        
        dateCheckJob = coroutineScope.launch {
            while (isActive) {
                // 1분마다 체크
                delay(60_000L) // 60초
                
                Log.d("StepCounterManager", "⏰ 주기적 날짜 체크 실행")
                
                // ✅ 메모리 상태 정보 로그
                val memoryInfo = getMemoryInfo()
                Log.d("StepCounterManager", "💾 메모리 상태:")
                Log.d("StepCounterManager", "   → 사용 가능: ${formatMemorySize(memoryInfo.availMem)} / 전체: ${formatMemorySize(memoryInfo.totalMem)}")
                Log.d("StepCounterManager", "   → 메모리 부족: ${if (memoryInfo.lowMemory) "⚠️ 예" else "✅ 아니오"}")
                Log.d("StepCounterManager", "   → 기준점: ${formatMemorySize(memoryInfo.threshold)}")
                
                // ✅ 현재 걸음수 메모리 상태 로그 (센서 기반)
                Log.d("StepCounterManager", "📊 현재 메모리 상태 (걸음수):")
                Log.d("StepCounterManager", "   → todaySteps: ${stepData.getTodaySteps()} (센서 기반 계산)")
                Log.d("StepCounterManager", "   → currentSensorValue: ${stepData.currentSensorValue}")
                Log.d("StepCounterManager", "   → baselineSteps: ${stepData.baselineSteps}")
                
                // 주기적 걸음수 DB 저장 (재부팅 복원을 위해 최신 걸음수 유지)
                if (stepData.baselineSteps >= 0) {
                    Log.d("StepCounterManager", "stepData.currentSensorValue: ${stepData.currentSensorValue}")
                    Log.d("StepCounterManager", "stepData.baselineSteps: $stepData.baselineSteps")
                    Log.d("StepCounterManager", "stepData.currentSensorValue - stepData.baselineSteps: ${stepData.currentSensorValue - stepData.baselineSteps}")
                    val currentSteps = stepData.getTodaySteps()
                    val currentSensorVal = stepData.currentSensorValue
                    
                    repository.saveTodaySteps(currentSteps, currentSensorVal)
                    Log.d("StepCounterManager", "⏰ 주기적 걸음수 DB 저장: $currentSteps , $currentSensorVal")
                }

                // 날짜가 변경되었는지 확인
                if (repository.isNewDay()) {
                    Log.d("StepCounterManager", "🌅 주기적 체크에서 날짜 변경 감지!")
                    handleDateChange(stepData.currentSensorValue)
                }
            }
        }
        
        Log.d("StepCounterManager", "⏰ 날짜 체크 타이머 시작됨 (1분 간격)")
    }
    
    // 타이머 중지
    private fun stopDateCheckTimer() {
        dateCheckJob?.cancel()
        dateCheckJob = null
        Log.d("StepCounterManager", "⏰ 날짜 체크 타이머 중지됨")
    }
    
    // 콜백 추가
    fun addCallback(callback: StepCounterCallback) {
        if (!callbacks.contains(callback)) {
            callbacks.add(callback)
            Log.d("StepCounterManager", "📞 콜백 추가됨, 총 ${callbacks.size}개")
        }
    }
    
    // 콜백 제거
    fun removeCallback(callback: StepCounterCallback) {
        callbacks.remove(callback)
        Log.d("StepCounterManager", "📞 콜백 제거됨, 총 ${callbacks.size}개")
    }
    
    // 현재 걸음수 데이터 가져오기
    fun getStepData(): StepData = stepData.copy()
    
    // UI에 표시할 총 걸음수 (DB 기준 실시간 계산)
    suspend fun getDisplaySteps(): Long {
        // DB의 todaySteps + (현재 센서값 - DB의 sensorSteps)
        // 재부팅 시에도 DB 값이 유지되므로 메모리 초기화와 무관하게 동작
        val dbTodaySteps = repository.getTodaySteps() // DB의 todaySteps
        val dbBaseline = repository.getTodayBaselineSteps() // DB의 sensorSteps

        Log.d("StepCounterManager", "💾 DB todaySteps=$dbTodaySteps, DB sensorSteps=$dbBaseline")
        
        if (dbBaseline != null && stepData.currentSensorValue >= dbBaseline) {
            // DB 기준점이 있고 현재 센서값이 더 큰 경우
            val currentSteps = stepData.currentSensorValue - dbBaseline
            Log.d("StepCounterManager", "💾 currentSteps=$currentSteps")
            return dbTodaySteps + currentSteps
        } else {
            // DB 값만 반환 (센서값이 아직 업데이트되지 않았거나 재부팅으로 감소한 경우)
            Log.d("StepCounterManager", "💾 DB 값만 반환: dbTodaySteps=$dbTodaySteps")
            return dbTodaySteps
        }
    }
    
    // 수동 저장 (날짜 변경 시에만 사용, 일반적으로는 불필요)
    suspend fun saveSteps() {
        val todaySteps = getDisplaySteps()
        // DB 기준이므로 현재 센서값을 DB에 저장
        repository.saveTodaySteps(todaySteps, stepData.currentSensorValue)
        Log.d("StepCounterManager", "💾 수동 저장 완료: todaySteps=$todaySteps, sensorSteps=${stepData.currentSensorValue}")
        callbacks.forEach { it.onStepsSaved(todaySteps) }
    }
    
    // 데이터 새로고침 (DB 기준이므로 불필요하지만 하위 호환성 유지)
    suspend fun refreshData() {
        Log.d("StepCounterManager", "🔄 데이터 새로고침 완료 (DB 기준으로 동작)")
    }
    
    // 초기화 (DB 기준이므로 메모리만 리셋)
    fun reset() {
        Log.d("StepCounterManager", "🔄 [변경] currentSensorValue: ${stepData.currentSensorValue} → 0L (리셋)")
        stepData.currentSensorValue = 0L
        Log.d("StepCounterManager", "🔄 초기화 완료 (DB 기준으로 동작)")
        Log.d("StepCounterManager", "📊 [현재값] currentSensorValue=${stepData.currentSensorValue}")
    }
    
    // 기간별 걸음수 조회
    suspend fun getDailySteps(startDateStr: String, endDateStr: String): List<com.hyunjin_l.monymony.database.repository.DailyStepData> {
        return repository.getDailyStepsInRange(startDateStr, endDateStr)
    }
    
    // 센서 이벤트 처리
    override fun onSensorChanged(event: SensorEvent?) {
        event ?: return
        
        // 권한 체크 (실시간 센서 데이터 처리 시에도)
        if (!hasActivityRecognitionPermission()) {
            Log.e("StepCounterManager", "❌ 센서 이벤트 처리 중단: ACTIVITY_RECOGNITION 권한 없음")
            unregisterSensor()
            return
        }
        
        if (event.sensor.type == Sensor.TYPE_STEP_COUNTER) {
            val currentSensorSteps = event.values[0].toLong()
            val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            
            Log.d("StepCounterManager", "👣 센서 업데이트: 센서값=$currentSensorSteps (날짜=$today)")
            Log.d("StepCounterManager", "🔄 [변경] currentSensorValue: ${stepData.currentSensorValue} → $currentSensorSteps (센서 이벤트)")
            stepData.currentSensorValue = currentSensorSteps
            Log.d("StepCounterManager", "📊 [현재값] currentSensorValue=${stepData.currentSensorValue}")
            
            // 🌅 날짜 변경 체크 (센서 이벤트 + 타이머 이중 안전장치)
            // 타이머는 1분마다, 센서 이벤트는 실시간 감지
            if (repository.isNewDay()) {
                Log.d("StepCounterManager", "🌅🌅🌅 센서 이벤트에서 날짜 변경 감지! (오늘=$today) 🌅🌅🌅")
                coroutineScope.launch {
                    handleDateChange(currentSensorSteps)
                }
                return
            }
            
            // DB 기준으로 재부팅 감지 및 초기화 처리
            coroutineScope.launch {
                val dbBaseline = repository.getTodayBaselineSteps()
                
                if (dbBaseline == null) {
                    // DB에 baseline이 없음 → 첫 센서 데이터 또는 새로운 날
                    Log.d("StepCounterManager", "🎯 첫 센서 데이터 또는 새로운 날 - 초기화 시작")
                    handleFirstSensorData(currentSensorSteps)
                    return@launch
                }
                
                // 재부팅 감지 (센서값이 DB baseline보다 작아짐)
                if (currentSensorSteps < dbBaseline) {
                    Log.d("StepCounterManager", "🔄 재부팅 감지: $currentSensorSteps < $dbBaseline (DB baseline)")
                    handleRebootDetection(currentSensorSteps)
                }
                return
            }
            
            // ✅ 센서 기반 실시간 걸음수 계산 (항상 업데이트)
            Log.d("StepCounterManager", "🔢 실시간 계산: $currentSensorSteps - ${stepData.baselineSteps} = $todaySteps")
            
            // 콜백으로 업데이트 알림 (항상 호출 - 센서 기반이므로)
            callbacks.forEach { it.onStepsUpdated(stepData) }
            
        }
    }
    
    // 날짜 변경 처리 (자정 넘김 감지) - DB 기준
    private suspend fun handleDateChange(currentSensorSteps: Long) {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        
        // ✅ 어제 걸음수는 DB 기준으로 계산
        val yesterdaySteps = repository.getTodaySteps()  // 실제로는 어제 걸음수 (날짜 변경 시점에)
        
        Log.d("StepCounterManager", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        Log.d("StepCounterManager", "🌅🌅 날짜 변경 처리 시작 (오늘=$today) 🌅🌅")
        Log.d("StepCounterManager", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        
        Log.d("StepCounterManager", "📊 [1/4] 어제 걸음수 (센서 기반): $yesterdaySteps 걸음")
        
        // 1. 어제 데이터 최종 저장 (날짜 변경 시에만 저장)
        Log.d("StepCounterManager", "💾 [2/4] 어제 데이터 DB 저장 중...")
        repository.handleDateChangeOnNewDay(yesterdaySteps)
        
        // 2. 메모리 초기화 (DB 기준이므로 메모리는 현재 센서값만 저장)
        Log.d("StepCounterManager", "🧹 [3/4] 메모리 초기화 중...")
        Log.d("StepCounterManager", "🔄 [변경] currentSensorValue: ${stepData.currentSensorValue} → $currentSensorSteps (날짜 변경)")
        stepData.currentSensorValue = currentSensorSteps
        stepData.baselineSteps = currentSensorSteps  // 오늘의 기준점 설정
        stepData.stepOffset = 0L                     // 새날 시작 시 오프셋 리셋
        Log.d("StepCounterManager", "✅ 메모리 초기화 완료: baselineSteps=$currentSensorSteps (오늘 시작점)")
        
        // 3. DB에 오늘 데이터 생성 (baseline만 저장)
        Log.d("StepCounterManager", "🆕 [4/4] 오늘($today) DB 데이터 생성 중...")
        repository.initializeTodayData(currentSensorSteps)
        
        // 날짜 변경 후 저장된 걸음수 업데이트
        lastSavedDisplaySteps = 0L
        
        // 4. 콜백 알림
        Log.d("StepCounterManager", "📢 React Native에 날짜 변경 알림 전송 중...")
        callbacks.forEach { it.onNewDayDetected() }
        callbacks.forEach { it.onStepsUpdated(stepData) }
        
        Log.d("StepCounterManager", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        Log.d("StepCounterManager", "✅✅ 날짜 변경 완료! 오늘($today) 0 걸음부터 새로 측정 시작 ✅✅")
        Log.d("StepCounterManager", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    }
    
    // 첫 센서 데이터 처리 - DB 기준
    private suspend fun handleFirstSensorData(currentSensorSteps: Long) {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        Log.d("StepCounterManager", "🎯🎯 첫 센서 데이터 처리 시작 (날짜=$today, 센서값=$currentSensorSteps)")
        
        // DB에 baseline 저장 및 오늘 걸음수 계산 (백그라운드 걸음수 포함)
        val todaySteps = repository.initializeTodayData(currentSensorSteps)
        
        // 메모리에 현재 센서값만 저장 (DB 기준으로 동작)
        Log.d("StepCounterManager", "🔄 [변경] currentSensorValue: ${stepData.currentSensorValue} → $currentSensorSteps (첫 센서 데이터)")
        stepData.currentSensorValue = currentSensorSteps
        Log.d("StepCounterManager", "📊 [현재값] currentSensorValue=${stepData.currentSensorValue}")
        Log.d("StepCounterManager", "   → DB todaySteps=$todaySteps (백그라운드 걸음수 포함)")
        
        val displaySteps = getDisplaySteps()
        Log.d("StepCounterManager", "   → DB 기준 계산 todaySteps=$displaySteps")
        
        // 초기화 시 저장된 걸음수 업데이트
        lastSavedDisplaySteps = displaySteps
        
        Log.d("StepCounterManager", "✅ 첫 센서 초기화 완료 (날짜=$today, DB 기준)")
        Log.d("StepCounterManager", "🎯 오늘($today) 걸음수 측정 시작!")
        
        // 콜백으로 업데이트 알림
        callbacks.forEach { it.onStepsUpdated(stepData) }
    }
    
    // 재부팅 감지 처리 - DB 기준
    private suspend fun handleRebootDetection(currentSensorSteps: Long) {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        Log.d("StepCounterManager", "🔄🔄 재부팅 감지! (날짜=$today, 센서값=$currentSensorSteps)")

        // DB에서 재부팅 전 걸음수 복원 (initializeTodayData가 existingData.todaySteps 반환)
        val preRebootSteps = repository.initializeTodayData(currentSensorSteps)

        // 새 baseline = 재부팅 후 센서 시작점, offset = 재부팅 전 누적 걸음수
        stepData.baselineSteps = currentSensorSteps
        stepData.currentSensorValue = currentSensorSteps
        stepData.stepOffset = preRebootSteps

        Log.d("StepCounterManager", "✅ 재부팅 후 초기화 완료 (날짜=$today)")
        Log.d("StepCounterManager", "   → preRebootSteps=$preRebootSteps (복원된 걸음수)")
        Log.d("StepCounterManager", "   → baselineSteps=$currentSensorSteps (새 시작점)")
        Log.d("StepCounterManager", "   → todaySteps=${stepData.getTodaySteps()} (오프셋 포함)")
        Log.d("StepCounterManager", "🎯 오늘($today) 걸음수 측정 재시작!")

        callbacks.forEach { it.onRebootDetected() }
        callbacks.forEach { it.onStepsUpdated(stepData) }
    }
    
    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        Log.d("StepCounterManager", "🎯 센서 정확도: $accuracy")
    }
}
