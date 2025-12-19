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
import com.hyunjin_l.monymony.pedometer.PedometerLogger
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
    
    // 걸음수 측정 상태
    data class StepData(
        var currentSensorValue: Long = 0L,   // 현재 센서 값
        var baselineSteps: Long = -1L        // 오늘의 기준점 (오늘 첫 센서값)
    ) {
        // 오늘 걸음수는 항상 센서 기반으로 실시간 계산
        fun getTodaySteps(): Long {
            return if (baselineSteps >= 0 && currentSensorValue >= baselineSteps) {
                currentSensorValue - baselineSteps
            } else {
                0L
            }
        }
    }
    
    private val stepData = StepData()
    
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
        
        // 로거 초기화
        PedometerLogger.initialize(context)
        
        // ACTIVITY_RECOGNITION 권한 체크
        if (!hasActivityRecognitionPermission()) {
            Log.e("StepCounterManager", "❌ ACTIVITY_RECOGNITION 권한 없음 - 초기화 중단")
            PedometerLogger.logPermission(false)
            return
        }
        
        Log.d("StepCounterManager", "✅ ACTIVITY_RECOGNITION 권한 확인됨")
        PedometerLogger.logPermission(true)
        
        // 앱 시작 시 날짜 변경 체크 (앱 종료 후 다음날 실행 케이스)
        val dateChanged = repository.isNewDay()
        
        if (dateChanged) {
            Log.d("StepCounterManager", "🌅🌅 앱 시작 시 날짜 변경 감지! (오늘=$today)")
            
            // 날짜가 바뀌었으면 어제 데이터 저장 (센서 기반 계산)
            val yesterdaySteps = if (stepData.baselineSteps >= 0 && stepData.currentSensorValue >= stepData.baselineSteps) {
                stepData.currentSensorValue - stepData.baselineSteps
            } else {
                0L
            }
            repository.handleDateChangeOnNewDay(yesterdaySteps)
            
            // 메모리 초기화 (오늘은 센서 기반으로 새로 시작)
            stepData.currentSensorValue = 0L
            stepData.baselineSteps = -1L
            Log.d("StepCounterManager", "✅✅ 메모리 초기화 완료! baselineSteps=-1 (새로운 날 시작)")
            Log.d("StepCounterManager", "🎯 새로운 날($today) 걸음수 측정 시작 준비")
            
            // ✅ 날짜 변경 시에는 DB 로드 스킵 (센서 기반으로 새로 측정)
            PedometerLogger.logInitialize(today, 0)
        } else {
            Log.d("StepCounterManager", "📅 같은 날 계속 ($today)")
            
            // 같은 날이면 DB에서 오늘의 baselineSteps 로드 (재시작 시 백그라운드 걸음수 반영용)
            // 하지만 오늘 걸음수는 센서 기반으로 계산하므로 baseline만 필요
            val todayData = repository.getTodayBaselineSteps()
            if (todayData != null) {
                stepData.baselineSteps = todayData
                Log.d("StepCounterManager", "📊 DB에서 로드된 오늘($today) baselineSteps: ${stepData.baselineSteps}")
            }
            
            // 로거에 초기화 기록 (센서 값이 있으면 계산, 없으면 0)
            val todaySteps = stepData.getTodaySteps()
            PedometerLogger.logInitialize(today, todaySteps)
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
    
    // UI에 표시할 총 걸음수 (센서 기반 실시간 계산)
    fun getDisplaySteps(): Long = stepData.getTodaySteps()
    
    // 수동 저장 (날짜 변경 시에만 사용, 일반적으로는 불필요)
    suspend fun saveSteps() {
        val todaySteps = stepData.getTodaySteps()
        // 날짜 변경 시에만 저장하므로, 수동 저장은 baseline만 업데이트
        if (stepData.baselineSteps >= 0) {
            stepData.baselineSteps = stepData.currentSensorValue
            Log.d("StepCounterManager", "💾 수동 저장 완료: baselineSteps 업데이트 = ${stepData.baselineSteps}")
        }
        
        callbacks.forEach { it.onStepsSaved(todaySteps) }
    }
    
    // 데이터 새로고침 (센서 기반이므로 불필요하지만 하위 호환성 유지)
    suspend fun refreshData() {
        val todayData = repository.getTodayBaselineSteps()
        if (todayData != null) {
            stepData.baselineSteps = todayData
        }
        Log.d("StepCounterManager", "🔄 데이터 새로고침 완료 (baselineSteps: ${stepData.baselineSteps})")
    }
    
    // 초기화 (기준점 리셋)
    fun reset() {
        stepData.baselineSteps = -1L
        Log.d("StepCounterManager", "🔄 초기화 완료")
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
            stepData.currentSensorValue = currentSensorSteps
            val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            
            Log.d("StepCounterManager", "👣 센서 업데이트: 센서값=$currentSensorSteps (날짜=$today)")
            
            // 🌅 날짜 변경 체크 (센서 이벤트 + 타이머 이중 안전장치)
            // 타이머는 1분마다, 센서 이벤트는 실시간 감지
            if (repository.isNewDay()) {
                Log.d("StepCounterManager", "🌅🌅🌅 센서 이벤트에서 날짜 변경 감지! (오늘=$today) 🌅🌅🌅")
                coroutineScope.launch {
                    handleDateChange(currentSensorSteps)
                }
                return
            }
            
            val todaySteps = if (stepData.baselineSteps >= 0) {
                currentSensorSteps - stepData.baselineSteps
            } else {
                0L
            }
            
            Log.d("StepCounterManager", "🔍 현재 상태 (날짜=$today) - baselineSteps: ${stepData.baselineSteps}, currentSensorValue: $currentSensorSteps, todaySteps: $todaySteps")
            
            // 첫 센서 데이터 수신시 초기화
            if (stepData.baselineSteps == -1L) {
                Log.d("StepCounterManager", "🎯 첫 센서 데이터 - 초기화 시작")
                coroutineScope.launch {
                    handleFirstSensorData(currentSensorSteps)
                }
                return
            }
            
            // 재부팅 감지 (센서값이 기준점보다 작아짐)
            if (currentSensorSteps < stepData.baselineSteps) {
                Log.d("StepCounterManager", "🔄 재부팅 감지: $currentSensorSteps < ${stepData.baselineSteps}")
                coroutineScope.launch {
                    handleRebootDetection(currentSensorSteps)
                }
                return
            }
            
            // ✅ 센서 기반 실시간 걸음수 계산 (항상 업데이트)
            Log.d("StepCounterManager", "🔢 실시간 계산: $currentSensorSteps - ${stepData.baselineSteps} = $todaySteps")
            
            // 콜백으로 업데이트 알림 (항상 호출 - 센서 기반이므로)
            callbacks.forEach { it.onStepsUpdated(stepData) }
            
            // ✅ 주기적 저장 제거 - 날짜 변경 시에만 저장
        }
    }
    
    // 날짜 변경 처리 (자정 넘김 감지) - 센서 기반
    private suspend fun handleDateChange(currentSensorSteps: Long) {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        val yesterday = repository.getLastCheckedDate()
        
        // ✅ 어제 걸음수는 센서 기반으로 계산
        val yesterdaySteps = if (stepData.baselineSteps >= 0 && currentSensorSteps >= stepData.baselineSteps) {
            currentSensorSteps - stepData.baselineSteps
        } else {
            0L
        }
        
        Log.d("StepCounterManager", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        Log.d("StepCounterManager", "🌅🌅 날짜 변경 처리 시작 (오늘=$today) 🌅🌅")
        Log.d("StepCounterManager", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        
        Log.d("StepCounterManager", "📊 [1/4] 어제 걸음수 (센서 기반): $yesterdaySteps 걸음")
        
        // 로거에 날짜 변경 기록
        PedometerLogger.logDateChange(yesterday, today, yesterdaySteps)
        
        // 1. 어제 데이터 최종 저장 (날짜 변경 시에만 저장)
        Log.d("StepCounterManager", "💾 [2/4] 어제 데이터 DB 저장 중...")
        repository.handleDateChangeOnNewDay(yesterdaySteps)
        
        // 2. 메모리 완전 초기화 (오늘은 새로 시작)
        Log.d("StepCounterManager", "🧹 [3/4] 메모리 완전 초기화 중...")
        stepData.currentSensorValue = currentSensorSteps
        stepData.baselineSteps = currentSensorSteps  // 오늘의 기준점 설정
        Log.d("StepCounterManager", "✅ 메모리 초기화 완료: baselineSteps=$currentSensorSteps (오늘 시작점)")
        
        // 3. DB에 오늘 데이터 생성 (baseline만 저장)
        Log.d("StepCounterManager", "🆕 [4/4] 오늘($today) DB 데이터 생성 중...")
        repository.initializeTodayData(currentSensorSteps)
        
        // 4. 콜백 알림
        Log.d("StepCounterManager", "📢 React Native에 날짜 변경 알림 전송 중...")
        callbacks.forEach { it.onNewDayDetected() }
        callbacks.forEach { it.onStepsUpdated(stepData) }
        
        Log.d("StepCounterManager", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        Log.d("StepCounterManager", "✅✅ 날짜 변경 완료! 오늘($today) 0 걸음부터 새로 측정 시작 ✅✅")
        Log.d("StepCounterManager", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    }
    
    // 첫 센서 데이터 처리 - 센서 기반
    private suspend fun handleFirstSensorData(currentSensorSteps: Long) {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        Log.d("StepCounterManager", "🎯🎯 첫 센서 데이터 처리 시작 (날짜=$today, 센서값=$currentSensorSteps)")
        
        // ✅ 센서 기반: baseline만 설정 (오늘 걸음수는 항상 currentSensorSteps - baselineSteps로 계산)
        stepData.baselineSteps = currentSensorSteps
        stepData.currentSensorValue = currentSensorSteps
        
        // DB에 baseline 저장 (재시작 시 백그라운드 걸음수 계산용)
        repository.initializeTodayData(currentSensorSteps)
        
        Log.d("StepCounterManager", "✅ 첫 센서 초기화 완료 (날짜=$today)")
        Log.d("StepCounterManager", "   → baselineSteps=$currentSensorSteps (오늘 시작점)")
        Log.d("StepCounterManager", "   → todaySteps=0 (센서 기반 계산: $currentSensorSteps - $currentSensorSteps)")
        Log.d("StepCounterManager", "🎯 오늘($today) 걸음수 측정 시작!")
        
        // 로거에 첫 센서 기록
        PedometerLogger.logFirstSensor(today, currentSensorSteps, 0L)
        
        // 콜백으로 업데이트 알림
        callbacks.forEach { it.onStepsUpdated(stepData) }
    }
    
    // 재부팅 감지 처리 - 센서 기반
    private suspend fun handleRebootDetection(currentSensorSteps: Long) {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        Log.d("StepCounterManager", "🔄🔄 재부팅 감지! (날짜=$today, 센서값=$currentSensorSteps)")
        
        val oldBaseline = stepData.baselineSteps
        
        // ✅ 센서 기반: baseline만 재설정
        stepData.baselineSteps = currentSensorSteps
        stepData.currentSensorValue = currentSensorSteps
        
        // DB에 baseline 업데이트
        repository.initializeTodayData(currentSensorSteps)
        
        Log.d("StepCounterManager", "✅ 재부팅 후 초기화 완료 (날짜=$today)")
        Log.d("StepCounterManager", "   → baselineSteps=$currentSensorSteps (새 시작점)")
        Log.d("StepCounterManager", "   → todaySteps=0 (센서 기반 계산)")
        Log.d("StepCounterManager", "🎯 오늘($today) 걸음수 측정 재시작!")
        
        // 로거에 재부팅 기록
        PedometerLogger.logReboot(today, oldBaseline, currentSensorSteps)
        
        callbacks.forEach { it.onRebootDetected() }
        callbacks.forEach { it.onStepsUpdated(stepData) }
    }
    
    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        Log.d("StepCounterManager", "🎯 센서 정확도: $accuracy")
    }
}
