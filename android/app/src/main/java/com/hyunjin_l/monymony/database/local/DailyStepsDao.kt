package com.hyunjin_l.monymony.database.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface DailyStepsDao {
    
    // 특정 날짜의 걸음수 조회
    @Query("SELECT * FROM daily_steps WHERE date = :date")
    suspend fun getStepsByDate(date: String): DailyStepsEntity?
    
    
    // 기간별 걸음수 조회
    @Query("SELECT * FROM daily_steps WHERE date BETWEEN :startDate AND :endDate ORDER BY date ASC")
    suspend fun getStepsBetweenDates(startDate: String, endDate: String): List<DailyStepsEntity>
    
    // 데이터 삽입 또는 업데이트
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateSteps(dailySteps: DailyStepsEntity)
    
    
    // 특정 날짜의 걸음수와 센서값 업데이트
    @Query("UPDATE daily_steps SET todaySteps = :todaySteps, sensorSteps = :sensorSteps, timestamp = :timestamp WHERE date = :date")
    suspend fun updateStepsAndSensorValue(date: String, todaySteps: Long, sensorSteps: Long, timestamp: Long = System.currentTimeMillis())
    
}
