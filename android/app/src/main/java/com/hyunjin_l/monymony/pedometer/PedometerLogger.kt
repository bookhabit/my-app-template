package com.hyunjin_l.monymony.pedometer

import android.content.Context
import android.util.Log

/**
 * 걸음수 측정 관련 로깅을 담당하는 유틸리티 클래스
 */
object PedometerLogger {
    
    private var isInitialized = false
    
    fun initialize(context: Context) {
        isInitialized = true
        Log.d("PedometerLogger", "✅ PedometerLogger 초기화 완료")
    }
    
    fun logPermission(granted: Boolean) {
        if (granted) {
            Log.d("PedometerLogger", "✅ ACTIVITY_RECOGNITION 권한 허용됨")
        } else {
            Log.w("PedometerLogger", "❌ ACTIVITY_RECOGNITION 권한 거부됨")
        }
    }
    
    fun logInitialize(date: String, steps: Long) {
        Log.d("PedometerLogger", "🔧 초기화: 날짜=$date, 걸음수=$steps")
    }
    
    fun logDateChange(yesterday: String, today: String, yesterdaySteps: Long) {
        Log.d("PedometerLogger", "🌅 날짜 변경: 어제=$yesterday, 오늘=$today, 어제 걸음수=$yesterdaySteps")
    }
    
    fun logFirstSensor(date: String, sensorValue: Long, todaySteps: Long) {
        Log.d("PedometerLogger", "🎯 첫 센서 데이터: 날짜=$date, 센서값=$sensorValue, 오늘 걸음수=$todaySteps")
    }
    
    fun logReboot(date: String, oldBaseline: Long, newBaseline: Long) {
        Log.d("PedometerLogger", "🔄 재부팅 감지: 날짜=$date, 이전 기준점=$oldBaseline, 새 기준점=$newBaseline")
    }
    
    fun logFinalSave(date: String, finalSteps: Long) {
        Log.d("PedometerLogger", "💾 최종 저장: 날짜=$date, 최종 걸음수=$finalSteps")
    }
}

