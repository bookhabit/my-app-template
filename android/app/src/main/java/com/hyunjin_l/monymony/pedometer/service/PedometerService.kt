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
import com.hyunjin_l.monymony.MainActivity
import com.hyunjin_l.monymony.R
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
        private const val CHANNEL_NAME = "걸음수 측정"
        private const val CHANNEL_DESCRIPTION = "실시간 걸음수 측정 서비스"
        
        // 서비스 상태 관리
        @Volatile
        private var isServiceRunning = false
        
        // 앱이 포그라운드에 있는지 확인
        fun isAppInForeground(context: Context): Boolean {
            val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            val runningAppProcesses = activityManager.runningAppProcesses ?: return false
            
            val packageName = context.packageName
            for (processInfo in runningAppProcesses) {
                if (processInfo.processName == packageName &&
                    processInfo.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                    return true
                }
            }
            return false
        }
        
        // 서비스 제어 메서드
        fun startService(context: Context) {
            // 알림 권한 확인
            if (!hasNotificationPermission(context)) {
                Log.w("PedometerService", "⚠️ 알림 권한이 없어서 서비스를 시작할 수 없습니다")
                return
            }
            
            // ACTIVITY_RECOGNITION 권한 확인
            if (!hasActivityRecognitionPermission(context)) {
                Log.w("PedometerService", "⚠️ ACTIVITY_RECOGNITION 권한이 없어서 서비스를 시작할 수 없습니다")
                return
            }
            
            // Android 12+ (API 31+) 백그라운드 제한 확인
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (!isAppInForeground(context)) {
                    Log.w("PedometerService", "⚠️ 앱이 백그라운드에 있어서 포그라운드 서비스를 시작할 수 없습니다 (Android 12+)")
                    // 백그라운드에서는 서비스 시작을 시도하지 않음
                    // 사용자가 앱을 포그라운드로 가져올 때 다시 시도하도록 함
                    return
                }
            }
            
            // 이미 실행 중이면 그냥 무시
            // if (isRunning()) {
            //     Log.d("PedometerService", "이미 실행 중 - 재시작 안함")
            //     return
            // }
            // ✅ isRunning() 체크 제거 - startForegroundService()가 안전하게 처리
            // Android 시스템이 이미 실행 중인 서비스는 onStartCommand()만 호출함
            // onCreate()는 호출되지 않으므로 중복 초기화 걱정 없음

            // ✅ 서비스 시작 (만보기 허용 기업 체크는 React Native에서 처리)
            val intent = Intent(context, PedometerService::class.java)
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    ContextCompat.startForegroundService(context, intent)
                } else {
                    context.startService(intent)
                }
                Log.d("PedometerService", "✅ 서비스 시작")
            } catch (e: ForegroundServiceStartNotAllowedException) {
                // Android 12+ 백그라운드 제한 예외 처리
                Log.e("PedometerService", "❌ ForegroundServiceStartNotAllowedException: ${e.message}")
                // Crashlytics에 기록 (Firebase가 설정되어 있다면)
                try {
                    // Firebase Crashlytics에 기록하려면 여기에 추가
                    // crashlytics().recordException(e)
                } catch (crashlyticsError: Exception) {
                    // Crashlytics가 없어도 계속 진행
                }
            } catch (e: IllegalStateException) {
                // IllegalStateException 처리 (백그라운드에서 서비스 시작 시도 시 발생)
                Log.e("PedometerService", "❌ IllegalStateException: 백그라운드에서 포그라운드 서비스 시작 불가 - ${e.message}")
                // Crashlytics에 기록
                try {
                    // Firebase Crashlytics에 기록하려면 여기에 추가
                    // crashlytics().recordException(e)
                } catch (crashlyticsError: Exception) {
                    // Crashlytics가 없어도 계속 진행
                }
            } catch (e: Exception) {
                Log.e("PedometerService", "❌ 서비스 시작 실패: ${e.message}", e)
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
            context.stopService(intent)
        }
        
        // 서비스 상태 확인
        fun isRunning(): Boolean = isServiceRunning
        
        // 서비스 상태 설정
        private fun setRunning(running: Boolean) {
            isServiceRunning = running
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
        
        // ✅ onCreate()에서 즉시 startForeground() 호출 (5초 제한 준수)
        // Android 12+에서도 onCreate()에서 호출하는 것이 안전합니다.
        // 문제는 백그라운드에서 서비스를 시작하려고 할 때 발생하므로,
        // startService()에서 백그라운드 체크를 수행하고, onCreate()에서는 이미 시작된 서비스이므로
        // startForeground()를 호출해야 합니다.
        startForegroundImmediately()
        
        // StepCounterManager 인스턴스 가져오기
        stepCounterManager = StepCounterManager.getInstance(this, serviceScope)
        
        // StepCounterManager 콜백 추가
        stepCounterManager?.addCallback(object : StepCounterManager.StepCounterCallback {
            override fun onStepsUpdated(stepData: StepCounterManager.StepData) {
                // ✅ 센서 기반: 오늘 걸음수는 항상 실시간 계산
                val todaySteps = stepData.getTodaySteps()
                updateSteps(todaySteps)
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
        
        // ✅ onCreate()에서 이미 startForeground()를 호출했지만,
        // onCreate()가 호출되지 않은 경우(서비스가 이미 실행 중인 경우)를 대비하여
        // startForeground()가 호출되지 않았다면 호출합니다.
        if (!isForegroundStarted) {
            Log.w("PedometerService", "⚠️ onCreate()에서 startForeground()가 호출되지 않음 - onStartCommand()에서 호출")
            startForegroundSafely()
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
                // 초기화 완료 후 실제 걸음수로 업데이트 (센서 기반)
                val stepData = stepCounterManager?.getStepData()
                val todaySteps = stepData?.getTodaySteps() ?: 0L
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
        stepCounterManager?.unregisterSensor()
        setRunning(false)
        isForegroundStarted = false
    }
    
    /**
     * onCreate()에서 즉시 startForeground() 호출 (5초 제한 준수)
     * startForegroundService() 호출 후 5초 이내에 startForeground()를 호출해야 합니다.
     * 알림 생성 실패 시에도 기본 알림으로 startForeground()를 반드시 호출합니다.
     */
    private fun startForegroundImmediately() {
        // ✅ 최소한의 알림 생성 (실패해도 기본 알림 사용)
        val notification = try {
            createNotification("0 걸음")
        } catch (e: Exception) {
            Log.e("PedometerService", "❌ 알림 생성 실패, 기본 알림 사용: ${e.message}", e)
            // 기본 알림 생성 (절대 실패하지 않도록)
            createMinimalNotification()
        }
        
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ServiceCompat.startForeground(
                    this,
                    NOTIFICATION_ID,
                    notification,
                    android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH
                )
            } else {
                // Android 9 이하는 foregroundServiceType 파라미터 없음
                startForeground(NOTIFICATION_ID, notification)
            }
            isForegroundStarted = true
            Log.d("PedometerService", "✅ onCreate()에서 startForeground() 호출 완료")
        } catch (e: ForegroundServiceStartNotAllowedException) {
            // Android 12+ 백그라운드 제한 예외 처리
            Log.e("PedometerService", "❌ ForegroundServiceStartNotAllowedException: ${e.message}")
            // 서비스를 종료하고 나중에 다시 시도하도록 함
            setRunning(false)
            stopSelf()
        } catch (e: IllegalStateException) {
            // IllegalStateException 처리 (백그라운드에서 서비스 시작 시도 시 발생)
            Log.e("PedometerService", "❌ IllegalStateException: ${e.message}")
            setRunning(false)
            stopSelf()
        } catch (e: Exception) {
            Log.e("PedometerService", "❌ startForeground() 호출 실패: ${e.message}", e)
            // 예외 발생 시에도 서비스는 종료
            setRunning(false)
            stopSelf()
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
            .setSmallIcon(android.R.drawable.ic_dialog_info)
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
     * 안전하게 startForeground() 호출 (onStartCommand()에서 호출)
     * onCreate()에서 호출되지 않은 경우를 대비한 방어 로직
     */
    private fun startForegroundSafely() {
        // 이미 호출되었다면 다시 호출하지 않음
        if (isForegroundStarted) {
            Log.d("PedometerService", "✅ startForeground() 이미 호출됨 - 재호출 생략")
            return
        }
        
        // ✅ 최소한의 알림 생성 (실패해도 기본 알림 사용)
        val notification = try {
            createNotification("0 걸음")
        } catch (e: Exception) {
            Log.e("PedometerService", "❌ 알림 생성 실패, 기본 알림 사용: ${e.message}", e)
            // 기본 알림 생성 (절대 실패하지 않도록)
            createMinimalNotification()
        }
        
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ServiceCompat.startForeground(
                    this,
                    NOTIFICATION_ID,
                    notification,
                    android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH
                )
            } else {
                // Android 9 이하는 foregroundServiceType 파라미터 없음
                startForeground(NOTIFICATION_ID, notification)
            }
            isForegroundStarted = true
            Log.d("PedometerService", "✅ onStartCommand()에서 startForeground() 호출 완료")
        } catch (e: ForegroundServiceStartNotAllowedException) {
            // Android 12+ 백그라운드 제한 예외 처리
            Log.e("PedometerService", "❌ ForegroundServiceStartNotAllowedException: ${e.message}")
            // 서비스를 종료하고 나중에 다시 시도하도록 함
            setRunning(false)
            stopSelf()
        } catch (e: IllegalStateException) {
            // IllegalStateException 처리 (백그라운드에서 서비스 시작 시도 시 발생)
            Log.e("PedometerService", "❌ IllegalStateException: ${e.message}")
            setRunning(false)
            stopSelf()
        } catch (e: Exception) {
            Log.e("PedometerService", "❌ startForeground() 호출 실패: ${e.message}", e)
            // 예외 발생 시에도 서비스는 종료
            setRunning(false)
            stopSelf()
        }
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
     * 걸음수에 콤마 추가 (천 단위 구분)
     */
    private fun formatStepsWithComma(steps: Long): String {
        val formatter = NumberFormat.getInstance(Locale.getDefault())
        return "${formatter.format(steps)} 걸음"
    }
    
    /**
     * 알림 생성 (RemoteViews 사용)
     * RemoteViews 생성 실패 시 기본 알림으로 대체
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
        
        // 적립 버튼 클릭 시 앱으로 이동하는 Intent (딥링크)
        // 잠금화면에서도 실행 가능하도록 플래그 추가
        val earnButtonIntent = Intent(Intent.ACTION_VIEW).apply {
            data = android.net.Uri.parse("monymony://workout/today")
            // 잠금화면에서도 실행 가능하도록 플래그 추가
            flags = (Intent.FLAG_ACTIVITY_NEW_TASK 
                or Intent.FLAG_ACTIVITY_CLEAR_TASK 
                or Intent.FLAG_ACTIVITY_SINGLE_TOP
                or Intent.FLAG_ACTIVITY_CLEAR_TOP
                or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
            setPackage(packageName)
            // MainActivity로 명시적으로 전달하여 React Native가 딥링크를 처리하도록 함
            setClassName(packageName, "${packageName}.MainActivity")
        }
        // 잠금화면에서도 실행 가능하도록 PendingIntent 플래그 추가
        val earnButtonPendingIntent = PendingIntent.getActivity(
            this, 
            1, 
            earnButtonIntent,
            PendingIntent.FLAG_UPDATE_CURRENT 
                or PendingIntent.FLAG_IMMUTABLE
        )
        
        // RemoteViews 생성 시도 (예외 처리)
        return try {
            // RemoteViews 생성
            val remoteViews = RemoteViews(packageName, R.layout.notification_pedometer)
            
            // title에서 숫자와 "걸음" 분리 (예: "1,234 걸음" -> "1,234"와 "걸음")
            val numberText = title.replace(" 걸음", "").trim()
            
            // RemoteViews에 데이터 설정
            remoteViews.setTextViewText(R.id.notification_steps_number, numberText)
            remoteViews.setTextViewText(R.id.notification_steps_text, "걸음")
            
            // 커스텀 RemoteViews를 사용한 알림 생성
            NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentIntent(pendingIntent)
                .setCustomContentView(remoteViews) // 접힌 상태 (기본 영역)
                .setCustomBigContentView(remoteViews) // 확장 상태 (드래그 시)
                .setOngoing(true) // 사용자가 스와이프로 제거할 수 없음
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setAutoCancel(false)
                .setShowWhen(false) // 시간 표시 제거
                .build()
        } catch (e: Resources.NotFoundException) {
            // 리소스를 찾을 수 없는 경우 기본 알림으로 대체
            Log.e("PedometerService", "❌ RemoteViews 리소스를 찾을 수 없음: ${e.message}", e)
            createDefaultNotification(title, pendingIntent, earnButtonPendingIntent)
        } catch (e: RemoteViews.ActionException) {
            // RemoteViews 액션 예외 처리
            Log.e("PedometerService", "❌ RemoteViews 액션 예외: ${e.message}", e)
            createDefaultNotification(title, pendingIntent, earnButtonPendingIntent)
        } catch (e: Exception) {
            // 기타 예외 처리
            Log.e("PedometerService", "❌ RemoteViews 생성 실패: ${e.message}", e)
            createDefaultNotification(title, pendingIntent, earnButtonPendingIntent)
        }
    }
    
    /**
     * 기본 알림 생성 (RemoteViews 실패 시 대체용)
     */
    private fun createDefaultNotification(
        title: String,
        contentIntent: PendingIntent,
        earnButtonIntent: PendingIntent
    ): Notification {
        // 기본 알림 생성 (RemoteViews 없이)
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText("걸음수 측정 중")
            .setContentIntent(contentIntent)
            .addAction(
                android.R.drawable.ic_menu_view, // 아이콘 (기본 아이콘 사용)
                "운동 화면",
                earnButtonIntent
            )
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
     * 서비스 상태 정보 - 센서 기반
     */
    fun getServiceInfo(): WritableMap {
        val stepData = stepCounterManager?.getStepData()
        val totalSteps = stepCounterManager?.getDisplaySteps() ?: 0L
        
        return Arguments.createMap().apply {
            // ✅ 실제 서비스 상태 반환 (센서 기반)
            putBoolean("isRunning", isServiceRunning)
            putInt("totalSteps", totalSteps.toInt())
            putInt("todaySteps", totalSteps.toInt()) // 센서 기반이므로 totalSteps와 동일
            putString("serviceName", "PedometerService")
        }
    }
}
