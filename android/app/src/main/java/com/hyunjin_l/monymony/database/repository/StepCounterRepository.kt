package com.hyunjin_l.monymony.database.repository

import android.content.Context
import android.util.Log
import com.hyunjin_l.monymony.database.local.DailyStepsDao
import com.hyunjin_l.monymony.database.local.DailyStepsEntity
import com.hyunjin_l.monymony.database.local.StepCounterDatabase
import kotlinx.coroutines.flow.Flow
import java.text.SimpleDateFormat
import java.util.*

class StepCounterRepository(context: Context) {
    
    private val database = StepCounterDatabase.getDatabase(context)
    private val dailyStepsDao: DailyStepsDao = database.dailyStepsDao()
    
    // 날짜 포맷터
    private val dateFormatter = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    
    // SharedPreferences (영구 저장용)
    private val prefs = context.getSharedPreferences("pedometer_prefs", Context.MODE_PRIVATE)
    
    // 마지막으로 체크한 날짜를 SharedPreferences에서 가져오기
    fun getLastCheckedDate(): String {
        return prefs.getString("last_checked_date", "") ?: ""
    }
    
    // 마지막으로 체크한 날짜를 SharedPreferences에 저장
    private fun setLastCheckedDate(date: String) {
        prefs.edit().putString("last_checked_date", date).apply()
    }
    
    /**
     * 오늘 날짜의 데이터 초기화 또는 업데이트
     * @param currentSensorSteps 현재 센서에서 읽은 걸음수
     */
    suspend fun initializeTodayData(currentSensorSteps: Long): Long {
        val today = getTodayDateString()
        val existingData = dailyStepsDao.getStepsByDate(today)
        
        Log.d("StepRepository", "🔧 오늘($today) 데이터 초기화 중... (센서값=$currentSensorSteps)")
        
        if (existingData == null) {
            // 새로운 날 - 데이터 생성
            val newData = DailyStepsEntity(
                date = today,
                todaySteps = 0L,
                sensorSteps = currentSensorSteps,
                timestamp = System.currentTimeMillis()
            )
            dailyStepsDao.insertOrUpdateSteps(newData)
            Log.d("StepRepository", "🆕 새로운 날($today) DB 데이터 생성: todaySteps=0, sensorSteps=$currentSensorSteps")
            Log.d("StepRepository", "🎯 오늘($today)은 0 걸음부터 시작!")
            return 0L
        } else {
            // 기존 날짜 - 백그라운드 걸음수 계산
            val backgroundSteps = currentSensorSteps - existingData.sensorSteps
            val newTodaySteps = existingData.todaySteps + backgroundSteps
            
            Log.d("StepRepository", "📊 오늘($today) 기존 DB 데이터 발견: todaySteps=${existingData.todaySteps}, sensorSteps=${existingData.sensorSteps}")
            
            if (backgroundSteps > 0) {
                Log.d("StepRepository", "🚶 백그라운드 걸음 감지 (날짜=$today)")
                Log.d("StepRepository", "   → 백그라운드 걸음: $backgroundSteps (센서: $currentSensorSteps - 저장된: ${existingData.sensorSteps})")
                Log.d("StepRepository", "   → 새 총 걸음수: $newTodaySteps")
                
                // 백그라운드 걸음수 반영
                dailyStepsDao.updateStepsAndSensorValue(today, newTodaySteps, currentSensorSteps)
                return newTodaySteps
            } else if (backgroundSteps < 0) {
                // 재부팅 감지 - 센서값 업데이트만
                Log.d("StepRepository", "🔄 재부팅 감지 (날짜=$today) - 센서값만 업데이트: $currentSensorSteps")
                dailyStepsDao.updateStepsAndSensorValue(today, existingData.todaySteps, currentSensorSteps)
                return existingData.todaySteps
            } else {
                // 변화 없음
                Log.d("StepRepository", "✅ 변화 없음 (날짜=$today, 걸음수=${existingData.todaySteps})")
                return existingData.todaySteps
            }
        }
    }
    
    /**
     * 오늘 걸음수를 DB에 저장 (날짜 지정 가능, Race Condition 방지)
     * @param date 저장할 날짜 (yyyy-MM-dd)
     * @param todaySteps 저장할 걸음수
     * @param currentSensorSteps 현재 센서값
     */
    suspend fun saveTodayStepsForDate(date: String, todaySteps: Long, currentSensorSteps: Long = 0L) {
        val existingData = dailyStepsDao.getStepsByDate(date)
        
        if (existingData != null) {
            // 더 큰 값일 때만 업데이트 (실시간 저장이므로)
            if (todaySteps > existingData.todaySteps) {
                dailyStepsDao.updateStepsAndSensorValue(date, todaySteps, currentSensorSteps)
                Log.d("StepRepository", "💾 걸음수 DB 업데이트 (날짜=$date): $todaySteps (센서: $currentSensorSteps)")
            } else {
                // 센서값만 업데이트 (실시간 저장이므로)
                dailyStepsDao.updateStepsAndSensorValue(date, existingData.todaySteps, currentSensorSteps)
                Log.d("StepRepository", "💾 센서값만 업데이트 (날짜=$date): $currentSensorSteps")
            }
        } else {
            val newData = DailyStepsEntity(
                date = date,
                todaySteps = todaySteps,
                sensorSteps = currentSensorSteps,
                timestamp = System.currentTimeMillis()
            )
            dailyStepsDao.insertOrUpdateSteps(newData)
            Log.d("StepRepository", "💾 새로운 날짜 데이터 저장 (날짜=$date): $todaySteps (센서: $currentSensorSteps)")
        }
    }
    
    /**
     * 오늘 걸음수를 DB에 저장 (하위 호환성)
     */
    suspend fun saveTodaySteps(todaySteps: Long, currentSensorSteps: Long = 0L) {
        val today = getTodayDateString()
        saveTodayStepsForDate(today, todaySteps, currentSensorSteps)
    }
    
    /**
     * 오늘 걸음수 조회 (하위 호환성 - 기간별 조회용)
     */
    suspend fun getTodaySteps(): Long {
        val today = getTodayDateString()
        val steps = dailyStepsDao.getStepsByDate(today)?.todaySteps ?: 0L
        Log.d("StepRepository", "📊 오늘($today) 걸음수 조회: $steps 걸음")
        return steps
    }
    
    /**
     * 오늘의 baselineSteps 조회 (센서 기반 계산용)
     */
    suspend fun getTodayBaselineSteps(): Long? {
        val today = getTodayDateString()
        val sensorSteps = dailyStepsDao.getStepsByDate(today)?.sensorSteps
        Log.d("StepRepository", "📊 오늘($today) baselineSteps 조회: $sensorSteps")
        return sensorSteps
    }
    
    
    /**
     * 기간별 걸음수 조회 (날짜별 상세 데이터)
     */
    suspend fun getDailyStepsInRange(startDate: String, endDate: String): List<DailyStepData> {
        val dbResults = dailyStepsDao.getStepsBetweenDates(startDate, endDate)
        val resultMap = dbResults.associateBy { it.date }
        
        // 기간 내 모든 날짜에 대해 데이터 생성 (걸음수가 없는 날도 0으로 포함)
        val result = mutableListOf<DailyStepData>()
        val calendar = Calendar.getInstance()
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        
        calendar.time = sdf.parse(startDate) ?: Date()
        val endCalendar = Calendar.getInstance()
        endCalendar.time = sdf.parse(endDate) ?: Date()
        
        while (calendar.time <= endCalendar.time) {
            val dateString = sdf.format(calendar.time)
            val steps = resultMap[dateString]?.todaySteps ?: 0L
            
            result.add(DailyStepData(
                date = dateString,
                steps = steps
            ))
            
            calendar.add(Calendar.DAY_OF_MONTH, 1)
        }
        
        Log.d("StepRepository", "📊 기간별 조회: $startDate ~ $endDate → ${result.size}일 데이터")
        return result
    }

    
    
    /**
     * 새로운 날인지 체크 (실시간 감지용, 디스크 기반)
     * @return true: 새 날 시작됨, false: 같은 날
     */
    fun isNewDay(): Boolean {
        val today = getTodayDateString()
        val lastCheckedDate = getLastCheckedDate()
        
        Log.d("StepRepository", "📅 날짜 체크: 저장된 날짜=$lastCheckedDate, 오늘=$today")
        
        // 처음 체크하는 경우 (앱 최초 실행)
        if (lastCheckedDate.isEmpty()) {
            setLastCheckedDate(today)
            Log.d("StepRepository", "📅 날짜 체크 초기화: $today (디스크에 저장)")
            return false
        }
        
        // 날짜가 바뀐 경우
        if (lastCheckedDate != today) {
            Log.d("StepRepository", "🌅🌅🌅 날짜 변경 감지! 어제=$lastCheckedDate, 오늘=$today 🌅🌅🌅")
            return true
        }
        
        Log.d("StepRepository", "✅ 같은 날: $today")
        return false
    }
    
    /**
     * 날짜 변경 시 처리 (어제 데이터 저장 - 센서 기반)
     * @param yesterdaySteps 어제의 최종 걸음수 (currentSensorSteps - baselineSteps)
     */
    suspend fun handleDateChangeOnNewDay(yesterdaySteps: Long) {
        val yesterday = getLastCheckedDate()
        val today = getTodayDateString()
        
        Log.d("StepRepository", "📅📅 날짜 변경 처리 - 어제=$yesterday, 오늘=$today")
        Log.d("StepRepository", "📊 어제 걸음수 (센서 기반): $yesterdaySteps 걸음")
        
        if (yesterdaySteps > 0 && yesterday.isNotEmpty()) {
            // 어제 최종 걸음수 저장
            saveFinalStepsForDate(yesterday, yesterdaySteps)
            Log.d("StepRepository", "💾💾 어제($yesterday) 최종 걸음수 DB 저장 완료: $yesterdaySteps 걸음")
        } else {
            Log.d("StepRepository", "⏭️ 어제 데이터 저장 스킵 (걸음수=$yesterdaySteps, 날짜=$yesterday)")
        }
        
        // 날짜 업데이트 (디스크에 저장)
        setLastCheckedDate(today)
        Log.d("StepRepository", "🌅🌅 새로운 날 시작: $today → SharedPreferences에 저장 완료")
    }
    
    /**
     * 특정 날짜의 최종 걸음수 저장 (날짜 변경 시 사용)
     */
    private suspend fun saveFinalStepsForDate(date: String, finalSteps: Long) {
        val existingData = dailyStepsDao.getStepsByDate(date)
        
        if (existingData != null) {
            // 기존 데이터 업데이트 (최종값으로)
            dailyStepsDao.updateStepsAndSensorValue(date, finalSteps, existingData.sensorSteps)
            Log.d("StepRepository", "💾 날짜별 최종 저장: $date → $finalSteps")
        } else {
            // 새 데이터 생성
            val newData = DailyStepsEntity(
                date = date,
                todaySteps = finalSteps,
                sensorSteps = 0L, // 날짜 변경 시에는 센서값 0
                timestamp = System.currentTimeMillis()
            )
            dailyStepsDao.insertOrUpdateSteps(newData)
            Log.d("StepRepository", "💾 날짜별 새 데이터 저장: $date → $finalSteps")
        }
    }
    
    /**
     * 오늘 날짜 문자열 반환
     */
    private fun getTodayDateString(): String {
        return dateFormatter.format(Date())
    }
}

/**
 * 날짜별 걸음수 데이터 클래스
 */
data class DailyStepData(
    val date: String,
    val steps: Long
)