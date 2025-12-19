package com.hyunjin_l.monymony.pedometer.module

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.hyunjin_l.monymony.database.repository.DailyStepData
import com.hyunjin_l.monymony.pedometer.StepCounterManager
import com.hyunjin_l.monymony.pedometer.service.PedometerService
import kotlinx.coroutines.*
import java.text.SimpleDateFormat
import java.util.*

class AOSPedometerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    // 코루틴 스코프
    private val moduleScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    
    // StepCounterManager 싱글톤 인스턴스
    private var stepCounterManager: StepCounterManager? = null

    override fun getName(): String = "AOSPedometerModule"
    
    @ReactMethod
    fun addListener(eventName: String) {
        // React Native 0.65+ 새로운 이벤트 시스템 요구사항
        Log.d("AOSPedometer", "🔔 이벤트 리스너 추가: $eventName")
    }
    
    @ReactMethod
    fun removeListeners(count: Int) {
        // React Native 0.65+ 새로운 이벤트 시스템 요구사항
        Log.d("AOSPedometer", "🔕 이벤트 리스너 제거: $count")
    }

    override fun initialize() {
        super.initialize()
        stepCounterManager = StepCounterManager.getInstance(reactApplicationContext, moduleScope)
        
        // StepCounterManager 콜백 추가
        stepCounterManager?.addCallback(object : StepCounterManager.StepCounterCallback {
            override fun onStepsUpdated(stepData: StepCounterManager.StepData) {
                // ✅ 센서 기반: 오늘 걸음수는 항상 실시간 계산
                val totalSteps = stepData.getTodaySteps()
                Log.d("AOSPedometer", "🔄 콜백 받음 - todaySteps: $totalSteps (센서 기반)")
                
                // React Native로 이벤트 전송
                sendEvent("StepUpdate", mapOf(
                    "totalSteps" to totalSteps.toInt()
                ))
                
                Log.d("AOSPedometer", "📡 React Native 이벤트 전송 완료: $totalSteps")
            }
            
            override fun onStepsSaved(totalSteps: Long) {
                Log.d("AOSPedometer", "💾 걸음수 저장됨: $totalSteps")
            }
            
            override fun onNewDayDetected() {
                Log.d("AOSPedometer", "🌅 새로운 날 감지됨")
            }
            
            override fun onRebootDetected() {
                Log.d("AOSPedometer", "🔄 재부팅 감지됨")
            }
        })
        
        Log.d("AOSPedometer", "📱 AOSPedometerModule 초기화 완료")
    }

    override fun invalidate() {
        super.invalidate()
        moduleScope.cancel()
        
        // ⚠️ Foreground Service가 실행 중이면 센서 리스너는 유지
        // Service가 센서를 관리하므로 해제하지 않음
        val isServiceRunning = PedometerService.isRunning()
        if (!isServiceRunning) {
            stepCounterManager?.unregisterSensor()
            Log.d("AOSPedometer", "🔄 invalidate: 센서 리스너 해제 (Foreground Service 미실행)")
        } else {
            Log.d("AOSPedometer", "⚠️ invalidate: Foreground Service 실행 중 - 센서 리스너 유지")
        }
        
        // 서비스 중지
        stopServiceInternal()
    }

    // 권한 체크
    private fun checkPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            reactApplicationContext,
            Manifest.permission.ACTIVITY_RECOGNITION
        ) == PackageManager.PERMISSION_GRANTED
    }

    // 오늘 걸음수 불러오기
    @ReactMethod
    fun loadTodaySteps(promise: Promise) {
        try {
            if (!checkPermission()) {
                promise.reject("PERMISSION_ERROR", "ACTIVITY_RECOGNITION 권한이 필요합니다")
                return
            }

            moduleScope.launch {
                try {
                    // StepCounterManager 초기화
                    stepCounterManager?.initialize()
                    
                    // ✅ 센서 기반: 오늘 걸음수는 항상 실시간 계산
                    val totalSteps = stepCounterManager?.getDisplaySteps() ?: 0L
                    
                    Log.d("AOSPedometer", "📊 오늘 걸음수 로드: $totalSteps (센서 기반)")
                    
                    sendEvent("StepUpdate", mapOf(
                        "totalSteps" to totalSteps.toInt()
                    ))
                    
                    val resultMap = Arguments.createMap()
                    resultMap.putBoolean("success", true)
                    resultMap.putInt("totalSteps", totalSteps.toInt())
                    promise.resolve(resultMap)
                } catch (e: Exception) {
                    Log.e("AOSPedometer", "오늘 걸음수 로드 실패", e)
                    promise.reject("LOAD_ERROR", e.message, e)
                }
            }
        } catch (e: Exception) {
            promise.reject("LOAD_ERROR", e.message, e)
        }
    }

    // 수동으로 오늘 걸음수 저장
    @ReactMethod
    fun saveTodaySteps(promise: Promise) {
        try {
            moduleScope.launch {
                try {
                    stepCounterManager?.saveSteps()
                    
                    Log.d("AOSPedometer", "💾 수동 저장 완료")
                    
                    val resultMap = Arguments.createMap()
                    resultMap.putBoolean("success", true)
                    resultMap.putString("message", "오늘 걸음수 저장 완료")
                    promise.resolve(resultMap)
                } catch (e: Exception) {
                    Log.e("AOSPedometer", "걸음수 저장 실패", e)
                    promise.reject("SAVE_ERROR", e.message, e)
                }
            }
        } catch (e: Exception) {
            promise.reject("SAVE_ERROR", e.message, e)
        }
    }

    // 실시간 업데이트 시작
    @ReactMethod
    fun startUpdates(promise: Promise) {
        try {
            Log.d("AOSPedometer", "🚀 startUpdates 시작")
            
            if (!checkPermission()) {
                Log.e("AOSPedometer", "❌ 권한 없음")
                promise.reject("PERMISSION_ERROR", "ACTIVITY_RECOGNITION 권한이 필요합니다")
                return
            }
            
            // StepCounterManager가 이미 센서를 관리하므로 단순히 성공 반환
            val resultMap = Arguments.createMap()
            resultMap.putBoolean("success", true)
            resultMap.putString("message", "실시간 업데이트 시작됨")
            promise.resolve(resultMap)
            
        } catch (e: Exception) {
            Log.e("AOSPedometer", "❌ startUpdates 예외 발생", e)
            promise.reject("START_ERROR", e.message, e)
        }
    }

    // 실시간 업데이트 중지
    @ReactMethod
    fun stopUpdates(promise: Promise) {
        try {
            // ⚠️ Foreground Service가 실행 중이면 센서 리스너를 해제하지 않음
            // Foreground Service가 센서를 관리하므로, 여기서 해제하면 백그라운드 측정이 불가능해짐
            val isServiceRunning = PedometerService.isRunning()
            
            moduleScope.launch {
                try {
                    // 항상 저장은 수행 (데이터 손실 방지)
                    stepCounterManager?.saveSteps()
                    
                    if (isServiceRunning) {
                        // Foreground Service가 실행 중이면 센서 리스너는 유지
                        // Service가 센서를 관리하므로 해제하지 않음
                        Log.d("AOSPedometer", "⚠️ Foreground Service 실행 중 - 센서 리스너 유지 (백그라운드 측정 계속)")
                    } else {
                        // Foreground Service가 실행 중이 아니면 센서 리스너 해제
                        stepCounterManager?.unregisterSensor()
                        Log.d("AOSPedometer", "🔄 센서 리스너 해제 및 저장 완료")
                    }
                } catch (e: Exception) {
                    Log.e("AOSPedometer", "중지 처리 실패", e)
                }
            }
            
            val resultMap = Arguments.createMap()
            resultMap.putBoolean("success", true)
            resultMap.putString("message", if (isServiceRunning) "실시간 업데이트 중지됨 (Foreground Service는 계속 실행)" else "실시간 업데이트 중지됨")
            promise.resolve(resultMap)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e.message, e)
        }
    }

    // 기간별 걸음수 조회
    @ReactMethod
    fun fetchDailySteps(startTimestamp: Double, endTimestamp: Double, promise: Promise) {
        try {
            moduleScope.launch {
                try {
                    val startDate = Date((startTimestamp).toLong())
                    val endDate = Date((endTimestamp).toLong())
                    val dateFormatter = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                    
                    val startDateStr = dateFormatter.format(startDate)
                    val endDateStr = dateFormatter.format(endDate)
                    
                    Log.d("AOSPedometer", "📊 기간별 조회: $startDateStr ~ $endDateStr")
                    
                    val dailyData = stepCounterManager?.getDailySteps(startDateStr, endDateStr) ?: emptyList()
                    
                    // 오늘 날짜 확인
                    val todayStr = dateFormatter.format(Date())
                    
                    // WritableArray로 변환하여 반환
                    val resultArray = Arguments.createArray()
                    dailyData.forEach { data ->
                        val itemMap = Arguments.createMap()
                        itemMap.putString("date", data.date)
                        
                        // 오늘 날짜인 경우 센서 기반 실시간 걸음수 반환
                        val stepsToReturn = if (data.date == todayStr) {
                            // 오늘은 센서 기반으로 실시간 계산
                            (stepCounterManager?.getDisplaySteps() ?: 0L).toInt()
                        } else {
                            // 과거 날짜는 DB에서 조회
                            data.steps.toInt()
                        }
                        
                        itemMap.putInt("steps", stepsToReturn)
                        resultArray.pushMap(itemMap)
                    }
                    
                    Log.d("AOSPedometer", "📊 조회 결과: ${resultArray.size()}일 데이터")
                    promise.resolve(resultArray)
                } catch (e: Exception) {
                    Log.e("AOSPedometer", "기간별 조회 실패", e)
                    promise.reject("FETCH_ERROR", e.message, e)
                }
            }
        } catch (e: Exception) {
            promise.reject("FETCH_ERROR", e.message, e)
        }
    }

    // Foreground Service 시작
    @ReactMethod
    fun startStepCounterService(promise: Promise) {
        try {
            Log.d("AOSPedometer", "🚀 Foreground Service 시작")
            PedometerService.startService(reactApplicationContext)
            
            val resultMap = Arguments.createMap()
            resultMap.putBoolean("success", true)
            resultMap.putString("message", "Foreground Service 시작됨")
            promise.resolve(resultMap)
        } catch (e: Exception) {
            Log.e("AOSPedometer", "❌ Foreground Service 시작 실패", e)
            promise.reject("SERVICE_START_ERROR", e.message, e)
        }
    }
    
    // Foreground Service 중지
    @ReactMethod
    fun stopStepCounterService(promise: Promise) {
        try {
            Log.d("AOSPedometer", "🛑 Foreground Service 중지")
            PedometerService.stopService(reactApplicationContext)
            
            val resultMap = Arguments.createMap()
            resultMap.putBoolean("success", true)
            resultMap.putString("message", "Foreground Service 중지됨")
            promise.resolve(resultMap)
        } catch (e: Exception) {
            Log.e("AOSPedometer", "❌ Foreground Service 중지 실패", e)
            promise.reject("SERVICE_STOP_ERROR", e.message, e)
        }
    }
    
    // Foreground Service 중지 (내부 메서드)
    private fun stopServiceInternal() {
        try {
            Log.d("AOSPedometer", "🛑 Foreground Service 중지 (내부)")
            PedometerService.stopService(reactApplicationContext)
        } catch (e: Exception) {
            Log.e("AOSPedometer", "❌ Foreground Service 중지 실패 (내부)", e)
        }
    }
    
    
    // 서비스 상태 확인 - 센서 기반
    @ReactMethod
    fun getServiceStatus(promise: Promise) {
        try {
            val totalSteps = stepCounterManager?.getDisplaySteps() ?: 0L
            
            // PedometerService의 static 메서드로 상태 확인
            val isServiceRunning = PedometerService.isRunning()
            
            val resultMap = Arguments.createMap()
            resultMap.putBoolean("success", true)
            resultMap.putInt("totalSteps", totalSteps.toInt())
            resultMap.putBoolean("isServiceRunning", isServiceRunning)
            resultMap.putString("serviceName", "PedometerService")
            
            Log.d("AOSPedometer", "📊 서비스 상태: $isServiceRunning, 걸음수: $totalSteps (센서 기반)")
            promise.resolve(resultMap)
        } catch (e: Exception) {
            Log.e("AOSPedometer", "❌ 서비스 상태 확인 실패", e)
            promise.reject("STATUS_ERROR", e.message, e)
        }
    }



    // React Native로 이벤트 전송
    private fun sendEvent(eventName: String, data: Map<String, Any>) {
        try {
            Log.d("AOSPedometer", "📡 이벤트 전송 시작: $eventName, 데이터: $data")
            
            val eventData = Arguments.createMap().apply {
                data.forEach { (key, value) ->
                    when (value) {
                        is String -> putString(key, value)
                        is Int -> putInt(key, value)
                        is Long -> putDouble(key, value.toDouble())
                        is Boolean -> putBoolean(key, value)
                        else -> putString(key, value.toString())
                    }
                }
            }
            
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, eventData)
                
            Log.d("AOSPedometer", "✅ 이벤트 전송 성공: $eventName")
        } catch (e: Exception) {
            Log.e("AOSPedometer", "❌ 이벤트 전송 실패: $eventName", e)
        }
    }
}
