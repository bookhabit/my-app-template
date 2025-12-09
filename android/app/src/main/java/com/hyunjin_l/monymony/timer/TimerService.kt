package com.hyunjin_l.monymony.timer

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.RingtoneManager
import android.net.Uri
import android.os.Binder
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.hyunjin_l.monymony.MainActivity

class TimerService : Service() {
  
  private val binder = LocalBinder()
  private val handler = Handler(Looper.getMainLooper())
  private var timerRunnable: Runnable? = null
  private var audioManager: AudioManager? = null
  private var audioFocusRequest: AudioFocusRequest? = null
  private var vibrator: Vibrator? = null
  private var ringtone: android.media.Ringtone? = null
  private var alarmRunnable: Runnable? = null
  
  companion object {
    const val ACTION_START = "com.hyunjin_l.monymony.timer.START"
    const val ACTION_PAUSE = "com.hyunjin_l.monymony.timer.PAUSE"
    const val ACTION_RESUME = "com.hyunjin_l.monymony.timer.RESUME"
    const val ACTION_STOP = "com.hyunjin_l.monymony.timer.STOP"
    const val ACTION_STOP_ALARM = "com.hyunjin_l.monymony.timer.STOP_ALARM"
    const val EXTRA_TOTAL_SECONDS = "total_seconds"
    
    private const val NOTIFICATION_ID = 1001
    private const val CHANNEL_ID = "timer_channel"
    private const val CHANNEL_NAME = "휴식 타이머"
    
    @Volatile
    private var remainingSeconds: Int = 0
    
    @Volatile
    private var totalSeconds: Int = 0
    
    @Volatile
    private var isRunning: Boolean = false
    
    @Volatile
    private var isPaused: Boolean = false
    
    @Volatile
    private var isAlarming: Boolean = false
    
    @Volatile
    private var serviceInstance: TimerService? = null
    
    @Volatile
    private var reactContext: ReactApplicationContext? = null
    
    fun setReactContext(context: ReactApplicationContext?) {
      reactContext = context
    }
    
    fun getRemainingSeconds(): Int = remainingSeconds
    
    fun isRunning(): Boolean = isRunning
    
    fun isPaused(): Boolean = isPaused
    
    fun isAlarming(): Boolean = isAlarming
    
    private fun notifyUpdate() {
      serviceInstance?.let { service ->
        reactContext?.let { context ->
          NativeTimerModule.sendTimerUpdate(context, remainingSeconds, isRunning, isPaused)
        }
        service.updateNotification()
      }
    }
    
    private fun notifyFinished() {
      reactContext?.let { context ->
        NativeTimerModule.sendTimerFinished(context)
      }
    }
  }
  
  inner class LocalBinder : Binder() {
    fun getService(): TimerService = this@TimerService
  }
  
  override fun onCreate() {
    super.onCreate()
    createNotificationChannel()
    serviceInstance = this
    audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
    
    // Vibrator 초기화
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
      vibrator = vibratorManager.defaultVibrator
    } else {
      @Suppress("DEPRECATION")
      vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }
    
    // 알림음 초기화
    val alarmUri: Uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
    if (alarmUri == null) {
      ringtone = RingtoneManager.getRingtone(applicationContext, RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
    } else {
      ringtone = RingtoneManager.getRingtone(applicationContext, alarmUri)
    }
  }
  
  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_START -> {
        val totalSecs = intent.getIntExtra(EXTRA_TOTAL_SECONDS, 0)
        if (totalSecs > 0) {
          startTimer(totalSecs)
        }
      }
      ACTION_PAUSE -> pauseTimer()
      ACTION_RESUME -> resumeTimer()
      ACTION_STOP -> stopTimer()
      ACTION_STOP_ALARM -> {
        // 확인 버튼 클릭 시 모두 초기화
        stopTimer()
      }
    }
    return START_STICKY
  }
  override fun onBind(intent: Intent?): IBinder {
    return binder
  }
  
  override fun onDestroy() {
    super.onDestroy()
    stopAlarm()
    releaseAudioFocus()
    stopTimer()
    serviceInstance = null
  }
  
  private fun startTimer(totalSecs: Int) {
    // 기존 알람이 있으면 먼저 중지
    stopAlarm()
    
    totalSeconds = totalSecs
    remainingSeconds = totalSecs
    isRunning = true
    isPaused = false
    isAlarming = false
    
    // 타이머 시작 시에는 AudioFocus 요청하지 않음 (타이머만 표시)
    // 알람 시작 시에만 AudioFocus 요청
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      startForeground(NOTIFICATION_ID, createNotification(), android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SHORT_SERVICE)
    } else {
      startForeground(NOTIFICATION_ID, createNotification())
    }
    startTimerCountdown()
    notifyUpdate()
  }
  
  private fun pauseTimer() {
    if (isRunning && !isPaused) {
      isPaused = true
      stopTimerCountdown()
      updateNotification()
      notifyUpdate()
    }
  }
  
  private fun resumeTimer() {
    if (isRunning && isPaused) {
      isPaused = false
      startTimerCountdown()
      updateNotification()
      notifyUpdate()
    }
  }
  
  private fun stopTimer() {
    stopAlarm()
    isRunning = false
    isPaused = false
    remainingSeconds = 0
    totalSeconds = 0
    stopTimerCountdown()
    releaseAudioFocus()
    stopForeground(true)
    stopSelf()
    notifyUpdate()
  }
  
  private fun startAlarm() {
    // 이미 알람이 실행 중이면 중복 실행 방지
    if (isAlarming) {
      // 기존 알람이 있으면 먼저 정리
      vibrator?.cancel()
      alarmRunnable?.let {
        handler.removeCallbacks(it)
      }
    }
    
    isAlarming = true
    
    // 알람 시작 시 AudioFocus를 TRANSIENT로 요청하여 음악 완전히 중지
    requestAudioFocusForAlarm()
    
    // 진동 패턴 정의
    val vibrationPattern = longArrayOf(0, 300, 500, 200, 500)
    
    // 진동 시작
    vibrator?.let { v ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val vibrationEffect = VibrationEffect.createWaveform(vibrationPattern, 0)
        v.vibrate(vibrationEffect)
      } else {
        @Suppress("DEPRECATION")
        v.vibrate(vibrationPattern, 0)
      }
    }
    
    // 알림 반복 (진동 패턴 반복) - 확인 버튼을 누를 때까지 계속
    alarmRunnable = object : Runnable {
      override fun run() {
        // isAlarming이 false가 되면 중지
        if (!isAlarming) {
          alarmRunnable = null
          return
        }
        
        vibrator?.let { v ->
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val vibrationEffect = VibrationEffect.createWaveform(vibrationPattern, 0)
            v.vibrate(vibrationEffect)
          } else {
            @Suppress("DEPRECATION")
            v.vibrate(vibrationPattern, 0)
          }
        }
        
        // 다음 반복 스케줄링
        handler.postDelayed(this, 1500) // 1.5초마다 반복
      }
    }
    handler.postDelayed(alarmRunnable!!, 1500)
    
    // Notification 업데이트 (중지 버튼 표시)
    updateNotification()
  }
  
  private fun stopAlarm() {
    if (!isAlarming && alarmRunnable == null) return
    
    isAlarming = false
    
    // 진동 중지
    vibrator?.cancel()
    
    // 알림 반복 중지 (더 확실하게)
    alarmRunnable?.let {
      handler.removeCallbacks(it)
      alarmRunnable = null
    }
    
    // AudioFocus 해제하여 음악 재생 가능하게 함
    releaseAudioFocus()
    
    // Notification 업데이트
    updateNotification()
  }
  
  private fun requestAudioFocus() {
    // 타이머 실행 중에는 MAY_DUCK 사용 (음악 볼륨만 낮춤)
    audioManager?.let { am ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val audioAttributes = AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_MEDIA)
          .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
          .build()
        
        audioFocusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
          .setAudioAttributes(audioAttributes)
          .setAcceptsDelayedFocusGain(false)
          .setOnAudioFocusChangeListener { focusChange ->
            // AudioFocus 변경 처리 (필요시)
          }
          .build()
        
        audioFocusRequest?.let { request ->
          am.requestAudioFocus(request)
        }
      } else {
        @Suppress("DEPRECATION")
        am.requestAudioFocus(
          null,
          AudioManager.STREAM_MUSIC,
          AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
        )
      }
    }
  }
  
  private fun requestAudioFocusForAlarm() {
    // 알람 시작 시 TRANSIENT 사용 (음악 완전히 중지)
    audioManager?.let { am ->
      // 기존 AudioFocus 해제
      releaseAudioFocus()
      
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val audioAttributes = AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_ALARM)
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .build()
        
        audioFocusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
          .setAudioAttributes(audioAttributes)
          .setAcceptsDelayedFocusGain(false)
          .setOnAudioFocusChangeListener { focusChange ->
            // AudioFocus 변경 처리 (필요시)
          }
          .build()
        
        audioFocusRequest?.let { request ->
          am.requestAudioFocus(request)
        }
      } else {
        @Suppress("DEPRECATION")
        am.requestAudioFocus(
          null,
          AudioManager.STREAM_ALARM,
          AudioManager.AUDIOFOCUS_GAIN_TRANSIENT
        )
      }
    }
  }
  
  private fun releaseAudioFocus() {
    audioManager?.let { am ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        audioFocusRequest?.let { request ->
          am.abandonAudioFocusRequest(request)
        }
      } else {
        @Suppress("DEPRECATION")
        am.abandonAudioFocus(null)
      }
    }
    audioFocusRequest = null
  }
  
  private fun startTimerCountdown() {
    stopTimerCountdown()
    
    timerRunnable = object : Runnable {
      override fun run() {
        if (isRunning && !isPaused && remainingSeconds > 0) {
          remainingSeconds--
          updateNotification()
          notifyUpdate()
          
          if (remainingSeconds > 0) {
            handler.postDelayed(this, 1000)
          } else {
            // 타이머 종료 - 먼저 카운트다운 중지
            stopTimerCountdown()
            isRunning = false
            isPaused = false
            updateNotification()
            notifyUpdate()
            notifyFinished()
            // 진동과 소리 시작 (확인/중지 버튼을 누를 때까지 계속)
            startAlarm()
          }
        }
      }
    }
    
    handler.post(timerRunnable!!)
  }
  
  private fun stopTimerCountdown() {
    timerRunnable?.let {
      handler.removeCallbacks(it)
      timerRunnable = null
    }
  }
  
  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        CHANNEL_ID,
        CHANNEL_NAME,
        NotificationManager.IMPORTANCE_HIGH // 알림 시 높은 우선순위
      ).apply {
        description = "휴식 타이머 알림"
        setShowBadge(false)
        enableVibration(true)
        enableLights(true)
        setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM), null)
      }
      
      val notificationManager = getSystemService(NotificationManager::class.java)
      notificationManager.createNotificationChannel(channel)
    }
  }
  
  private fun createNotification(): Notification {
    // 알림 클릭 시 workout/today 화면으로 이동
    val deepLinkIntent = Intent(Intent.ACTION_VIEW).apply {
      data = android.net.Uri.parse("monymony://workout/today")
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
    }
    
    val pendingIntent = PendingIntent.getActivity(
      this,
      0,
      deepLinkIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
    
    val timeText = formatTime(remainingSeconds)
    val statusText = when {
      isAlarming -> "타이머 종료! 확인을 눌러주세요"
      isPaused -> "일시정지됨"
      isRunning -> "실행 중"
      else -> "종료됨"
    }
    
    val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("휴식 타이머")
      .setContentText("$timeText - $statusText")
      .setSmallIcon(android.R.drawable.ic_dialog_info)
      .setContentIntent(pendingIntent)
      .setOngoing(isRunning && !isPaused || isAlarming)
      .setPriority(if (isAlarming) NotificationCompat.PRIORITY_HIGH else NotificationCompat.PRIORITY_LOW)
      .setCategory(NotificationCompat.CATEGORY_SERVICE)
    
    // 알림 중일 때 중지 버튼 추가
    if (isAlarming) {
      val stopAlarmIntent = Intent(this, TimerService::class.java).apply {
        action = ACTION_STOP_ALARM
      }
      val stopAlarmPendingIntent = PendingIntent.getService(
        this,
        1,
        stopAlarmIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      
      // 운동 화면으로 이동하는 버튼
      val workoutIntent = Intent(Intent.ACTION_VIEW).apply {
        data = android.net.Uri.parse("monymony://workout/today")
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
      }
      val workoutPendingIntent = PendingIntent.getActivity(
        this,
        2,
        workoutIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      
      notificationBuilder
        .addAction(
          android.R.drawable.ic_menu_close_clear_cancel,
          "중지",
          stopAlarmPendingIntent
        )
        .addAction(
          android.R.drawable.ic_menu_view,
          "운동 화면",
          workoutPendingIntent
        )
        .setAutoCancel(false)
        .setDefaults(NotificationCompat.DEFAULT_ALL)
    }
    
    return notificationBuilder.build()
  }
  
  private fun updateNotification() {
    val notification = createNotification()
    val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    notificationManager.notify(NOTIFICATION_ID, notification)
  }
  
  private fun formatTime(totalSeconds: Int): String {
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return String.format("%02d:%02d", minutes, seconds)
  }
}

