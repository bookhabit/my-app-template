package com.hyunjin_l.monymony.pedometer.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.content.res.Resources
import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.IBinder
import android.util.Log
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.core.app.ServiceCompat
import android.app.ForegroundServiceStartNotAllowedException
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.hyunjin_l.monymony.R
import com.hyunjin_l.monymony.MainActivity
import com.hyunjin_l.monymony.pedometer.StepCounterManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.*

/**
 * 걸음수 측정을 위한 Foreground Service
 * 알림센터에 실시간 걸음수를 표시하고 업데이트
 */
class PedometerService : Service() {
    
    companion object {
        private const val NOTIFICATION_ID = 1001
        private const val CHANNEL_ID = "monymony_step_counter"
        private const val CHANNEL_NAME = "모니모니 걸음수 측정"
        private const val CHANNEL_DESCRIPTION = "실시간 걸음수 측정 서비스"
        
        // 서비스 중지 알림 관련 상수
        private const val SERVICE_STOPPED_NOTIFICATION_ID = 1002
        private const val SERVICE_STOPPED_CHANNEL_ID = "monymony_service_stopped"
        private const val SERVICE_STOPPED_CHANNEL_NAME = "만보기 서비스 상태"
        private const val SERVICE_STOPPED_CHANNEL_DESCRIPTION = "만보기 서비스 중지 알림"
        
        
        // 서비스 상태 관리
        @Volatile
        private var isServiceRunning = false
        
        // 마지막 서비스 시작 시도 시간 추적 (중복 호출 방지)
        @Volatile
        private var lastStartAttemptTime: Long = 0
        private const val START_ATTEMPT_COOLDOWN_MS = 2000L // 2초 쿨다운
        
        /**
         * 개선된 앱 포그라운드 상태 확인 메서드
         * 
         * Android 8.0+에서는 ActivityManager.getRunningAppProcesses()가 제한적으로 동작할 수 있으므로
         * 예외 처리 및 안전한 fallback을 포함합니다.
         * 
         * 참고: 더 정확한 포그라운드 상태 확인을 위해서는 ProcessLifecycleOwner를 사용할 수 있습니다.
         * ProcessLifecycleOwner를 사용하려면 build.gradle에 다음 의존성을 추가하세요:
         * implementation "androidx.lifecycle:lifecycle-process:2.6.2"
         * 
         * @param context 컨텍스트
         * @return 앱이 포그라운드에 있으면 true, 그렇지 않으면 false
         */
        fun isAppInForeground(context: Context): Boolean {
            return try {
                val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
                val runningAppProcesses = activityManager.runningAppProcesses
                
                if (runningAppProcesses == null) {
                    Log.w("PedometerService", "⚠️ runningAppProcesses가 null - 안전을 위해 false 반환")
                    return false
                }
                
                val packageName = context.packageName
                for (processInfo in runningAppProcesses) {
                    if (processInfo.processName == packageName &&
                        processInfo.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                        Log.d("PedometerService", "✅ 앱이 포그라운드에 있음")
                        return true
                    }
                }
                Log.d("PedometerService", "⚠️ 앱이 포그라운드에 있지 않음")
                false
            } catch (e: Exception) {
                Log.e("PedometerService", "❌ isAppInForeground() 확인 중 예외 발생: ${e.message}", e)
                // 예외 발생 시 안전을 위해 false 반환 (백그라운드로 간주)
                false
            }
        }
        
        /**
         * 개선된 서비스 시작 메서드
         * 
         * 주요 개선 사항:
         * 1. 반환 타입을 Boolean으로 변경하여 성공/실패 상태 반환
         * 2. 중복 호출 방지 (쿨다운 시간 적용)
         * 3. 예외 처리 강화 및 상세한 로깅
         * 4. IllegalStateException 발생 시 실제 서비스 상태 확인
         * 
         * @param context 컨텍스트
         * @return true: 서비스 시작 성공 또는 이미 실행 중, false: 서비스 시작 실패
         */
        fun startService(context: Context): Boolean {
            val currentTime = System.currentTimeMillis()
            
            // 중복 호출 방지 (쿨다운 시간 확인)
            if (currentTime - lastStartAttemptTime < START_ATTEMPT_COOLDOWN_MS) {
                Log.w("PedometerService", "⚠️ 서비스 시작 시도가 너무 빈번함 - 쿨다운 시간 대기 중 (${currentTime - lastStartAttemptTime}ms 경과)")
                return false
            }
            lastStartAttemptTime = currentTime
            
            // 알림 권한 확인
            if (!hasNotificationPermission(context)) {
                Log.w("PedometerService", "⚠️ 알림 권한이 없어서 서비스를 시작할 수 없습니다")
                return false
            }
            
            // ACTIVITY_RECOGNITION 권한 확인
            if (!hasActivityRecognitionPermission(context)) {
                Log.w("PedometerService", "⚠️ ACTIVITY_RECOGNITION 권한이 없어서 서비스를 시작할 수 없습니다")
                return false
            }
            
            // ✅ 서비스가 이미 실행 중이면 중복 호출 방지
            if (isRunning()) {
                Log.d("PedometerService", "✅ 이미 실행 중 - 재시작 안함")
                return true
            }
            
            // ✅ 백그라운드에서 startForegroundService 호출 방지 (Android 12+)
            // Android 12+ (API 31+)에서는 백그라운드에서 포그라운드 서비스 시작이 제한됨
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val isInForeground = isAppInForeground(context)
                if (!isInForeground) {
                    Log.w("PedometerService", "⚠️ 앱이 백그라운드에 있어서 포그라운드 서비스를 시작할 수 없습니다 (Android 12+)")
                    Log.w("PedometerService", "⚠️ 사용자가 앱을 포그라운드로 가져올 때 다시 시도하도록 함")
                    return false
                }
                Log.d("PedometerService", "✅ 앱이 포그라운드에 있음 - 서비스 시작 가능")
            }

            // ✅ 서비스 시작 (만보기 허용 기업 체크는 React Native에서 처리)
            val intent = Intent(context, PedometerService::class.java)
            return try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    Log.d("PedometerService", "🚀 startForegroundService() 호출 시작 (Android O+)")
                    ContextCompat.startForegroundService(context, intent)
                } else {
                    Log.d("PedometerService", "🚀 startService() 호출 시작 (Android O 미만)")
                    context.startService(intent)
                }
                Log.d("PedometerService", "✅ 서비스 시작 성공")
                true
            } catch (e: ForegroundServiceStartNotAllowedException) {
                // Android 12+ 백그라운드 제한 예외 처리
                Log.e("PedometerService", "❌ ForegroundServiceStartNotAllowedException 발생")
                Log.e("PedometerService", "❌ 원인: 앱이 백그라운드에 있거나 시스템이 서비스 시작을 제한함")
                Log.e("PedometerService", "❌ 메시지: ${e.message}")
                Log.e("PedometerService", "❌ 스택 트레이스:", e)
                
                // Crashlytics에 기록 (Firebase가 설정되어 있다면)
                try {
                    // Firebase Crashlytics에 기록하려면 여기에 추가
                    // FirebaseCrashlytics.getInstance().recordException(e)
                } catch (crashlyticsError: Exception) {
                    Log.w("PedometerService", "⚠️ Crashlytics 기록 실패: ${crashlyticsError.message}")
                }
                false
            } catch (e: IllegalStateException) {
                // IllegalStateException 처리 (백그라운드에서 서비스 시작 시도 시 발생)
                Log.e("PedometerService", "❌ IllegalStateException 발생")
                Log.e("PedometerService", "❌ 원인: 백그라운드에서 포그라운드 서비스 시작 불가 또는 서비스가 이미 시작 중")
                Log.e("PedometerService", "❌ 메시지: ${e.message}")
                Log.e("PedometerService", "❌ 스택 트레이스:", e)
                
                // IllegalStateException의 경우, 서비스가 이미 시작 중일 수도 있음
                // 실제 서비스 상태 확인
                val isActuallyRunning = try {
                    val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
                    val services = activityManager.getRunningServices(Integer.MAX_VALUE)
                    services.any { it.service.className == PedometerService::class.java.name }
                } catch (checkError: Exception) {
                    Log.w("PedometerService", "⚠️ 서비스 상태 확인 실패: ${checkError.message}")
                    false
                }
                
                if (isActuallyRunning) {
                    Log.w("PedometerService", "⚠️ 서비스가 실제로 실행 중임 - 상태 동기화")
                    setRunning(true)
                    return true
                }
                
            
                false
            } catch (e: SecurityException) {
                // 권한 관련 예외
                Log.e("PedometerService", "❌ SecurityException 발생: ${e.message}", e)
                false
            } catch (e: Exception) {
                // 기타 예외
                Log.e("PedometerService", "❌ 서비스 시작 실패: ${e.message}", e)
                Log.e("PedometerService", "❌ 예외 타입: ${e.javaClass.name}")
                false
            }
        }
        
        // 알림 권한 확인 메서드
        private fun hasNotificationPermission(context: Context): Boolean {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                // Android 13 이상에서는 POST_NOTIFICATIONS 권한 필요
                ContextCompat.checkSelfPermission(
                    context,
                    android.Manifest.permission.POST_NOTIFICATIONS
                ) == android.content.pm.PackageManager.PERMISSION_GRANTED
            } else {
                // Android 13 미만에서는 항상 true
                true
            }
        }
        
        // ACTIVITY_RECOGNITION 권한 확인 메서드
        private fun hasActivityRecognitionPermission(context: Context): Boolean {
            return ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACTIVITY_RECOGNITION
            ) == PackageManager.PERMISSION_GRANTED
        }
        
        fun stopService(context: Context) {
            val intent = Intent(context, PedometerService::class.java)
            try {
                context.stopService(intent)
                Log.d("PedometerService", "✅ 서비스 중지 요청")
            } catch (e: Exception) {
                Log.e("PedometerService", "❌ 서비스 중지 실패: ${e.message}", e)
            }
        }
        
        // 서비스 상태 확인
        fun isRunning(): Boolean = isServiceRunning
        
        // 서비스 상태 설정 (internal로 변경하여 companion object에서 접근 가능)
        internal fun setRunning(running: Boolean) {
            isServiceRunning = running
            Log.d("PedometerService", "📊 서비스 상태 변경: $running")
        }
        
    }
    
    private lateinit var notificationManager: NotificationManager
    private val serviceScope = CoroutineScope(Dispatchers.Main + Job())
    
    // StepCounterManager 싱글톤 인스턴스
    private var stepCounterManager: StepCounterManager? = null
    
    // startForeground() 호출 여부 추적
    private var isForegroundStarted = false
    
    override fun onCreate() {
        super.onCreate()
        Log.d("PedometerService", "🔧 서비스 생성")
        
        // ACTIVITY_RECOGNITION 권한 체크
        if (!hasActivityRecognitionPermission(this)) {
            Log.e("PedometerService", "❌ ACTIVITY_RECOGNITION 권한 없음 - 서비스 종료")
            // ✅ onDestroy()가 호출되기 전에 상태를 false로 설정
            setRunning(false)
            stopSelf()
            return
        }
        
        Log.d("PedometerService", "✅ ACTIVITY_RECOGNITION 권한 확인됨")
        
        // 초기화 - onCreate에서는 기본 설정만 수행
        notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // 알림 채널 생성 (한 번만 생성하면 되므로 onCreate가 적절)
        createNotificationChannel()
        createServiceStoppedNotificationChannel()
        
        // ✅ onCreate()에서 즉시 startForeground() 호출 (5초 제한 준수)
        // startForegroundService() 호출 후 5초 이내에 startForeground()를 호출해야 함
        // Android 8.0+ (API 26+): 이 규칙이 필수이며, 위반 시 ANR 발생 가능
        // onCreate()에서 호출하는 것이 가장 안전함 (onStartCommand() 전에 호출됨)
        val foregroundStarted = startForegroundWithType("onCreate()")
        if (!foregroundStarted) {
            // startForeground() 실패 시 onCreate()를 완료하지 않고 종료
            // onCreate()가 완료되지 않으면 onDestroy()가 호출되지 않으므로
            // 여기서 서비스 중지 알림 표시
            Log.e("PedometerService", "❌ onCreate()에서 startForeground() 실패 - 서비스 초기화 중단")
            try {
                showServiceStoppedNotification(this)
            } catch (e: Exception) {
                Log.e("PedometerService", "❌ 서비스 중지 알림 표시 실패: ${e.message}", e)
            }
            setRunning(false)
            // onCreate()가 완료되지 않은 상태에서 stopSelf() 호출
            // Android 시스템이 서비스를 자동으로 종료시킬 것임
            stopSelf()
            return
        }
        
        // StepCounterManager 인스턴스 가져오기
        stepCounterManager = StepCounterManager.getInstance(this, serviceScope)
        
        // StepCounterManager 콜백 추가
        stepCounterManager?.addCallback(object : StepCounterManager.StepCounterCallback {
            override fun onStepsUpdated(stepData: StepCounterManager.StepData) {
                // ✅ DB 기준: 오늘 걸음수는 DB 기준으로 실시간 계산
                serviceScope.launch {
                    val todaySteps = stepCounterManager?.getDisplaySteps() ?: 0L
                    updateSteps(todaySteps)
                }
            }
            
            override fun onStepsSaved(totalSteps: Long) {
                updateSteps(totalSteps)
            }
            
            override fun onNewDayDetected() {
                Log.d("PedometerService", "🌅 새로운 날 감지됨")
            }
            
            override fun onRebootDetected() {
                Log.d("PedometerService", "🔄 재부팅 감지됨")
            }
        })
        
        // 서비스 상태 설정
        setRunning(true)
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("PedometerService", "🚀 서비스 시작")
        
        // ✅ onCreate()가 호출되지 않은 경우(서비스가 이미 실행 중인 경우)를 대비
        // 하지만 일반적으로 onCreate()는 항상 호출되므로, 이 경우는 매우 드묾
        // 그럼에도 불구하고 방어 로직으로 startForeground()가 호출되지 않았다면 호출
        if (!isForegroundStarted) {
            Log.w("PedometerService", "⚠️ onCreate()에서 startForeground()가 호출되지 않음 - onStartCommand()에서 호출")
            val foregroundStarted = startForegroundWithType("onStartCommand()")
            if (!foregroundStarted) {
                // startForeground() 실패 시 서비스 종료
                Log.e("PedometerService", "❌ onStartCommand()에서 startForeground() 실패 - 서비스 종료")
                try {
                    showServiceStoppedNotification(this)
                } catch (e: Exception) {
                    Log.e("PedometerService", "❌ 서비스 중지 알림 표시 실패: ${e.message}", e)
                }
                setRunning(false)
                stopSelf()
                return START_NOT_STICKY // 재시작하지 않음
            }
        } else {
            Log.d("PedometerService", "✅ startForeground() 이미 호출됨")
        }
        
        // ✅ 방어 로직: onCreate()가 호출되지 않은 경우를 대비
        if (!isRunning()) {
            Log.w("PedometerService", "⚠️ onCreate()가 호출되지 않음 - 상태 설정")
            setRunning(true)
        } else {
            Log.d("PedometerService", "✅ 서비스 상태 확인됨 (이미 실행 중)")
        }
        
        // ✅ 센서 초기화 및 걸음수 업데이트
        serviceScope.launch {
            try {
                stepCounterManager?.initialize()
                // 초기화 완료 후 실제 걸음수로 업데이트 (DB 기준)
                val todaySteps = stepCounterManager?.getDisplaySteps() ?: 0L
                updateSteps(todaySteps)
            } catch (e: Exception) {
                Log.e("PedometerService", "❌ 초기화 중 오류", e)
                // 오류 발생시에도 서비스는 계속 실행
            }
        }
        
        // Intent 액션 처리
        intent?.action?.let { action ->
            when (action) {
                "UPDATE_STEPS" -> {
                    val totalSteps = intent.getLongExtra("totalSteps", 0L)
                    
                    Log.d("PedometerService", "📱 걸음수 업데이트 받음: $totalSteps")
                    updateSteps(totalSteps)
                    return START_STICKY
                }
                "UPDATE_NOTIFICATION" -> {
                    val title = intent.getStringExtra("title") ?: "0 걸음"
                    
                    Log.d("PedometerService", "📱 알림 업데이트 받음: $title")
                    updateNotification(title)
                    return START_STICKY
                }
                "RESTART_SERVICE" -> {
                    // onTaskRemoved에서 재시작 요청 시 처리
                    Log.d("PedometerService", "🔄 서비스 재시작 요청")
                    // 포그라운드 승격은 이미 onCreate에서 처리됨
                    return START_STICKY
                }
                else -> {
                    Log.d("PedometerService", "📱 기본 서비스 시작 (액션 없음)")
                    return START_STICKY
                }
            }
        }
        
        return START_STICKY // 서비스가 종료되면 자동으로 재시작
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
    
    override fun onDestroy() {
        super.onDestroy()
        Log.d("PedometerService", "🛑 서비스 종료")
        
        // 서비스 중지 알림 표시 (알림 제거 전에 표시)
        try {
            showServiceStoppedNotification(this)
            Log.d("PedometerService", "✅ 서비스 중지 알림 표시")
        } catch (e: Exception) {
            Log.e("PedometerService", "❌ 서비스 중지 알림 표시 실패: ${e.message}", e)
        }
        
        // 알림 제거 (Android 8.0+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && isForegroundStarted) {
            try {
                stopForeground(STOP_FOREGROUND_REMOVE)
                Log.d("PedometerService", "✅ 포그라운드 알림 제거 완료")
            } catch (e: Exception) {
                Log.e("PedometerService", "❌ stopForeground() 실패: ${e.message}", e)
            }
        }
        
        stepCounterManager?.unregisterSensor()
        setRunning(false)
        isForegroundStarted = false
    }
    
    /**
     * startForeground() 통합 호출 메서드
     * Android 버전별 요구사항:
     * - API 26-27 (Android 8.0-8.1): startForegroundService() 호출 후 5초 이내에 startForeground() 필수
     * - API 28 (Android 9.0): NotificationChannel 필수
     * - API 29+ (Android 10+): FOREGROUND_SERVICE_TYPE 필수
     * - API 31+ (Android 12+): 백그라운드 제한 (ForegroundServiceStartNotAllowedException 가능)
     * - API 34+ (Android 14+): 알림 리소스 문제 (RuntimeException으로 처리)
     * 
     * @param source 호출 위치를 나타내는 문자열 (로깅용)
     * @return true: 성공, false: 실패 (서비스 종료 필요)
     */
    private fun startForegroundWithType(source: String): Boolean {
        // 이미 호출되었다면 다시 호출하지 않음
        if (isForegroundStarted) {
            Log.d("PedometerService", "✅ startForeground() 이미 호출됨 - 재호출 생략 ($source)")
            return true
        }
        
        // ✅ 최소한의 알림 생성 (실패해도 기본 알림 사용)
        // RemoteViews 리소스 문제를 방지하기 위해 안전하게 처리
        val notification = try {
            // 리소스 존재 여부를 먼저 확인
            val layoutResourceId = try {
                R.layout.notification_pedometer
            } catch (e: Exception) {
                Log.e("PedometerService", "❌ R.layout.notification_pedometer 접근 실패: ${e.message}", e)
                0
            }
            
            if (layoutResourceId == 0) {
                Log.w("PedometerService", "⚠️ notification_pedometer 레이아웃 리소스 ID가 0 - 기본 알림 사용")
                createMinimalNotification()
            } else {
                // 리소스가 실제로 존재하는지 확인
                try {
                    val resourceName = resources.getResourceName(layoutResourceId)
                    Log.d("PedometerService", "✅ 리소스 확인 완료: $resourceName (ID: $layoutResourceId)")
                    createNotification("0 걸음")
                } catch (e: Resources.NotFoundException) {
                    Log.e("PedometerService", "❌ 리소스가 실제로 존재하지 않음 (ID: $layoutResourceId): ${e.message}", e)
                    createMinimalNotification()
                }
            }
        } catch (e: Resources.NotFoundException) {
            // 리소스를 찾을 수 없는 경우 기본 알림으로 대체
            Log.e("PedometerService", "❌ 알림 리소스를 찾을 수 없음, 기본 알림 사용: ${e.message}", e)
            Log.e("PedometerService", "❌ 스택 트레이스:", e)
            createMinimalNotification()
        } catch (e: RemoteViews.ActionException) {
            // RemoteViews 액션 예외
            Log.e("PedometerService", "❌ RemoteViews 액션 예외, 기본 알림 사용: ${e.message}", e)
            Log.e("PedometerService", "❌ 스택 트레이스:", e)
            createMinimalNotification()
        } catch (e: Exception) {
            Log.e("PedometerService", "❌ 알림 생성 실패, 기본 알림 사용: ${e.message}", e)
            Log.e("PedometerService", "❌ 예외 타입: ${e.javaClass.name}")
            Log.e("PedometerService", "❌ 스택 트레이스:", e)
            // 기본 알림 생성 (절대 실패하지 않도록)
            createMinimalNotification()
        }
        
        return try {
            // Android 10 (API 29) 이상: FOREGROUND_SERVICE_TYPE 필수
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ServiceCompat.startForeground(
                    this,
                    NOTIFICATION_ID,
                    notification,
                    android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH
                )
            } else {
                // Android 8.0-9.0 (API 26-28): 기본 startForeground() 사용
                startForeground(NOTIFICATION_ID, notification)
            }
            isForegroundStarted = true
            Log.d("PedometerService", "✅ startForeground() 호출 완료 ($source, API ${Build.VERSION.SDK_INT})")
            true
        } catch (e: ForegroundServiceStartNotAllowedException) {
            // Android 12+ (API 31+) 백그라운드 제한 예외 처리
            Log.e("PedometerService", "❌ ForegroundServiceStartNotAllowedException: ${e.message}")
            // onCreate()에서는 예외를 다시 throw하지 않고 false 반환
            // onStartCommand()에서 false를 받으면 서비스 종료
            false
        } catch (e: IllegalStateException) {
            // IllegalStateException: startForegroundService() 없이 startForeground() 호출 시 발생
            Log.e("PedometerService", "❌ IllegalStateException: ${e.message}")
            false
        } catch (e: RuntimeException) {
            // RuntimeException: BadForegroundServiceNotificationException (Android 14+) 또는 기타 런타임 예외
            // 예외 메시지를 확인하여 알림 리소스 문제인지 판단
            val exceptionMessage = e.message ?: ""
            val exceptionClassName = e.javaClass.name
            
            // 알림 관련 오류인지 확인 (Resources$NotFoundException, RemoteViews$ActionException 등)
            val isNotificationResourceError = exceptionMessage.contains("inflate", ignoreCase = true) ||
                    exceptionMessage.contains("RemoteViews", ignoreCase = true) ||
                    exceptionMessage.contains("Resources\$NotFoundException", ignoreCase = true) ||
                    exceptionMessage.contains("Resource ID", ignoreCase = true) ||
                    exceptionClassName.contains("BadForegroundServiceNotification", ignoreCase = true)
            
            if (isNotificationResourceError) {
                // 알림 리소스 문제 - 기본 알림으로 재시도
                Log.e("PedometerService", "❌ 알림 리소스 오류 감지 (RuntimeException)")
                Log.e("PedometerService", "❌ 예외 타입: $exceptionClassName")
                Log.e("PedometerService", "❌ 원인: 알림 리소스(레이아웃, 색상, drawable)를 찾을 수 없거나 알림에 문제가 있음")
                Log.e("PedometerService", "❌ 메시지: $exceptionMessage")
                Log.e("PedometerService", "❌ 스택 트레이스:", e)
                
                // 기본 알림으로 재시도
                try {
                    Log.w("PedometerService", "⚠️ 기본 알림으로 재시도")
                    val minimalNotification = createMinimalNotification()
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        ServiceCompat.startForeground(
                            this,
                            NOTIFICATION_ID,
                            minimalNotification,
                            android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH
                        )
                    } else {
                        startForeground(NOTIFICATION_ID, minimalNotification)
                    }
                    isForegroundStarted = true
                    Log.d("PedometerService", "✅ 기본 알림으로 startForeground() 성공")
                    return true
                } catch (retryException: Exception) {
                    Log.e("PedometerService", "❌ 기본 알림으로도 startForeground() 실패: ${retryException.message}", retryException)
                    return false
                }
            } else {
                // 기타 RuntimeException
                Log.e("PedometerService", "❌ RuntimeException: ${e.message}", e)
                Log.e("PedometerService", "❌ 예외 타입: $exceptionClassName")
                return false
            }
        } catch (e: Exception) {
            Log.e("PedometerService", "❌ startForeground() 호출 실패: ${e.message}", e)
            Log.e("PedometerService", "❌ 예외 타입: ${e.javaClass.name}")
            false
        }
    }
    
    /**
     * 최소한의 알림 생성 (절대 실패하지 않도록)
     * createNotification()이 실패할 경우를 대비한 안전장치
     */
    private fun createMinimalNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification_pedometer)
            .setContentTitle("걸음수 측정 중")
            .setContentText("서비스 실행 중...")
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setAutoCancel(false)
            .setShowWhen(false)
            .build()
    }
    
    
    /**
     * 알림 채널 생성
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_DEFAULT // LOW -> DEFAULT로 변경
            ).apply {
                description = CHANNEL_DESCRIPTION
                setShowBadge(false)
                enableLights(false)
                enableVibration(false)
                setSound(null, null)
            }
            notificationManager.createNotificationChannel(channel)
            Log.d("PedometerService", "✅ 알림 채널 생성 완료")
        }
    }
    
    /**
     * 서비스 중지 알림 채널 생성
     */
    private fun createServiceStoppedNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                SERVICE_STOPPED_CHANNEL_ID,
                SERVICE_STOPPED_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH // 사용자에게 중요한 알림이므로 HIGH
            ).apply {
                description = SERVICE_STOPPED_CHANNEL_DESCRIPTION
                setShowBadge(true)
                enableLights(true)
                enableVibration(true)
                // 기본 소리 사용 (사용자가 중요하게 인지할 수 있도록)
            }
            notificationManager.createNotificationChannel(channel)
            Log.d("PedometerService", "✅ 서비스 중지 알림 채널 생성 완료")
        }
    }
    
    /**
     * 서비스 중지 알림 표시
     * 서비스가 중지되었거나 ANR이 발생했을 때 사용자에게 알림을 표시
     */
    private fun showServiceStoppedNotification(context: Context) {
        try {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            
            // 메인 액티비티로 이동하는 Intent
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                // 딥링크를 통해 만보기 화면으로 이동하도록 설정
                data = android.net.Uri.parse("monymony://pedometer")
            }
            
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            // 알림 생성
            val notification = NotificationCompat.Builder(context, SERVICE_STOPPED_CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification_pedometer)
                .setContentTitle("만보기 기능이 중지되었습니다")
                .setContentText("앱을 실행해주세요")
                .setStyle(NotificationCompat.BigTextStyle()
                    .bigText("만보기 기능이 중지되었습니다. 정확한 걸음수 측정을 위해 앱을 실행해주세요."))
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_STATUS)
                .setAutoCancel(true) // 사용자가 클릭하면 알림 제거
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .build()
            
            notificationManager.notify(SERVICE_STOPPED_NOTIFICATION_ID, notification)
            Log.d("PedometerService", "✅ 서비스 중지 알림 표시 완료")
        } catch (e: Exception) {
            Log.e("PedometerService", "❌ 서비스 중지 알림 표시 실패: ${e.message}", e)
        }
    }
    
    
    
    /**
     * 걸음수에 콤마 추가 (천 단위 구분)
     */
    private fun formatStepsWithComma(steps: Long): String {
        val formatter = NumberFormat.getInstance(Locale.getDefault())
        return "${formatter.format(steps)} 걸음"
    }
    
    /**
     * 알림 생성 (RemoteViews 사용)
     * RemoteViews 생성 실패 시 기본 알림으로 대체
     * 
     * 주의: RemoteViews의 리소스 참조가 실패할 수 있으므로,
     * 모든 단계에서 예외 처리를 수행하고 실패 시 기본 알림으로 대체합니다.
     */
    private fun createNotification(title: String): Notification {
        // 메인 액티비티로 이동하는 Intent (기본 클릭)
        // 잠금화면에서도 실행 가능하도록 플래그 추가
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = (Intent.FLAG_ACTIVITY_NEW_TASK 
                or Intent.FLAG_ACTIVITY_CLEAR_TASK
                or Intent.FLAG_ACTIVITY_SINGLE_TOP
                or Intent.FLAG_ACTIVITY_CLEAR_TOP
                or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 
            0, 
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT 
                or PendingIntent.FLAG_IMMUTABLE
        )
        
        // RemoteViews 생성 시도 (예외 처리)
        return try {
            // 리소스 ID 확인
            val layoutId = R.layout.notification_pedometer
            val stepsNumberId = R.id.notification_steps_number
            val stepsTextId = R.id.notification_steps_text
            
            Log.d("PedometerService", "📱 RemoteViews 생성 시작 - layoutId=$layoutId")
            Log.d("PedometerService", "📱 리소스 ID 확인 - stepsNumberId=$stepsNumberId, stepsTextId=$stepsTextId")
            
            // RemoteViews 생성
            val remoteViews = RemoteViews(packageName, layoutId)
            Log.d("PedometerService", "✅ RemoteViews 객체 생성 완료")
            
            // title에서 숫자와 "걸음" 분리 (예: "1,234 걸음" -> "1,234"와 "걸음")
            val numberText = title.replace(" 걸음", "").trim()
            
            // RemoteViews에 데이터 설정
            try {
                remoteViews.setTextViewText(stepsNumberId, numberText)
                Log.d("PedometerService", "✅ notification_steps_number 설정 완료: $numberText")
            } catch (e: Exception) {
                Log.e("PedometerService", "❌ notification_steps_number 설정 실패: ${e.message}", e)
                throw e
            }
            
            try {
                remoteViews.setTextViewText(stepsTextId, "걸음")
                Log.d("PedometerService", "✅ notification_steps_text 설정 완료")
            } catch (e: Exception) {
                Log.e("PedometerService", "❌ notification_steps_text 설정 실패: ${e.message}", e)
                throw e
            }
            
            // 커스텀 RemoteViews를 사용한 알림 생성
            Log.d("PedometerService", "📱 NotificationCompat.Builder 생성 시작")
            val notification = NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification_pedometer)
                .setContentIntent(pendingIntent)
                .setCustomContentView(remoteViews) // 접힌 상태 (기본 영역)
                .setCustomBigContentView(remoteViews) // 확장 상태 (드래그 시)
                .setOngoing(true) // 사용자가 스와이프로 제거할 수 없음
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setAutoCancel(false)
                .setShowWhen(false) // 시간 표시 제거
                .build()
            
            Log.d("PedometerService", "✅ 커스텀 알림 생성 완료")
            return notification
        } catch (e: Resources.NotFoundException) {
            // 리소스를 찾을 수 없는 경우 기본 알림으로 대체
            Log.e("PedometerService", "❌ RemoteViews 리소스를 찾을 수 없음: ${e.message}", e)
            createDefaultNotification(title, pendingIntent)
        } catch (e: RemoteViews.ActionException) {
            // RemoteViews 액션 예외 처리
            Log.e("PedometerService", "❌ RemoteViews 액션 예외: ${e.message}", e)
            createDefaultNotification(title, pendingIntent)
        } catch (e: Exception) {
            // 기타 예외 처리
            Log.e("PedometerService", "❌ RemoteViews 생성 실패: ${e.message}", e)
            createDefaultNotification(title, pendingIntent)
        }
    }
    
    /**
     * 기본 알림 생성 (RemoteViews 실패 시 대체용)
     */
    private fun createDefaultNotification(
        title: String,
        contentIntent: PendingIntent
    ): Notification {
        // 기본 알림 생성 (RemoteViews 없이)
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification_pedometer)
            .setContentTitle(title)
            .setContentText("걸음수 측정 중")
            .setContentIntent(contentIntent)
            .setOngoing(true) // 사용자가 스와이프로 제거할 수 없음
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setAutoCancel(false)
            .setShowWhen(false) // 시간 표시 제거
            .build()
    }
    
    /**
     * 알림 업데이트
     */
    fun updateNotification(title: String) {
        try {
            val notification = createNotification(title)
            notificationManager.notify(NOTIFICATION_ID, notification)
            Log.d("PedometerService", "📱 알림 업데이트: $title")
        } catch (e: Exception) {
            Log.e("PedometerService", "❌ 알림 업데이트 실패", e)
        }
    }
    
    /**
     * 걸음수 업데이트 (StepCounterManager 콜백에서 호출) - 센서 기반
     */
    fun updateSteps(totalSteps: Long) {
        // 콤마가 포함된 걸음수 포맷팅
        val title = formatStepsWithComma(totalSteps)
        
        updateNotification(title)
        
        Log.d("PedometerService", "👣 걸음수 업데이트: $title")
    }
    
    
    /**
     * 서비스 상태 정보 - DB 기준
     */
    fun getServiceInfo(): WritableMap {
        // suspend 함수이므로 runBlocking 사용
        val totalSteps = kotlinx.coroutines.runBlocking {
            stepCounterManager?.getDisplaySteps() ?: 0L
        }
        
        return Arguments.createMap().apply {
            // ✅ 실제 서비스 상태 반환 (센서 기반)
            putBoolean("isRunning", isServiceRunning)
            putInt("totalSteps", totalSteps.toInt())
            putInt("todaySteps", totalSteps.toInt()) // 센서 기반이므로 totalSteps와 동일
            putString("serviceName", "PedometerService")
        }
    }
}
