import * as SQLite from 'expo-sqlite';

import type {
  MorningRoutineGoals,
  HabitYoutubeVideo,
  ReadingRecord,
  StairsRecord,
  PushupRecord,
} from '@/types/morning-routine';

import { getDatabase } from './setupDatabase';

/**
 * 목표 설정 조회
 */
export async function getMorningRoutineGoals(
  year: number
): Promise<MorningRoutineGoals | null> {
  const db = await getDatabase();
  if (!db) return null;

  try {
    const result = await db.getFirstAsync<MorningRoutineGoals>(
      `SELECT * FROM morning_routine_goals WHERE year = ?`,
      [year]
    );
    return result || null;
  } catch (error) {
    console.error('목표 설정 조회 실패:', error);
    return null;
  }
}

/**
 * 목표 설정 저장/수정
 */
export async function upsertMorningRoutineGoals(
  goals: Partial<MorningRoutineGoals> & { year: number }
): Promise<boolean> {
  const db = await getDatabase();
  if (!db) return false;

  try {
    const existing = await getMorningRoutineGoals(goals.year);

    if (existing) {
      // 업데이트
      await db.runAsync(
        `UPDATE morning_routine_goals 
         SET reading_initial_minutes = ?,
             reading_increment_minutes = ?,
             stairs_initial_floors = ?,
             stairs_increment_floors = ?,
             stairs_max_floors = ?,
             pushup_initial_count = ?,
             pushup_increment_count = ?,
             pushup_max_count = ?,
             updated_at = datetime('now')
         WHERE year = ?`,
        [
          goals.reading_initial_minutes ?? null,
          goals.reading_increment_minutes ?? null,
          goals.stairs_initial_floors ?? null,
          goals.stairs_increment_floors ?? null,
          goals.stairs_max_floors ?? null,
          goals.pushup_initial_count ?? null,
          goals.pushup_increment_count ?? null,
          goals.pushup_max_count ?? null,
          goals.year,
        ]
      );
    } else {
      // 삽입
      await db.runAsync(
        `INSERT INTO morning_routine_goals 
         (year, reading_initial_minutes, reading_increment_minutes,
          stairs_initial_floors, stairs_increment_floors, stairs_max_floors,
          pushup_initial_count, pushup_increment_count, pushup_max_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          goals.year,
          goals.reading_initial_minutes ?? null,
          goals.reading_increment_minutes ?? null,
          goals.stairs_initial_floors ?? null,
          goals.stairs_increment_floors ?? null,
          goals.stairs_max_floors ?? null,
          goals.pushup_initial_count ?? null,
          goals.pushup_increment_count ?? null,
          goals.pushup_max_count ?? null,
        ]
      );
    }
    return true;
  } catch (error) {
    console.error('목표 설정 저장 실패:', error);
    return false;
  }
}

/**
 * 습관별 유튜브 영상 조회
 */
export async function getHabitYoutubeVideo(
  habitType: 'reading' | 'stairs' | 'pushup'
): Promise<HabitYoutubeVideo | null> {
  const db = await getDatabase();
  if (!db) return null;

  try {
    const result = await db.getFirstAsync<HabitYoutubeVideo>(
      `SELECT * FROM habit_youtube_videos WHERE habit_type = ?`,
      [habitType]
    );
    return result || null;
  } catch (error) {
    console.error('유튜브 영상 조회 실패:', error);
    return null;
  }
}

/**
 * 습관별 유튜브 영상 저장/수정
 */
export async function upsertHabitYoutubeVideo(
  video: Omit<HabitYoutubeVideo, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  const db = await getDatabase();
  if (!db) return false;

  try {
    const existing = await getHabitYoutubeVideo(video.habit_type);

    if (existing) {
      // 업데이트
      await db.runAsync(
        `UPDATE habit_youtube_videos 
         SET video_id = ?,
             video_url = ?,
             is_shorts = ?,
             updated_at = datetime('now')
         WHERE habit_type = ?`,
        [
          video.video_id,
          video.video_url,
          video.is_shorts ? 1 : 0,
          video.habit_type,
        ]
      );
    } else {
      // 삽입
      await db.runAsync(
        `INSERT INTO habit_youtube_videos 
         (habit_type, video_id, video_url, is_shorts)
         VALUES (?, ?, ?, ?)`,
        [
          video.habit_type,
          video.video_id,
          video.video_url,
          video.is_shorts ? 1 : 0,
        ]
      );
    }
    return true;
  } catch (error) {
    console.error('유튜브 영상 저장 실패:', error);
    return false;
  }
}

/**
 * 오늘 독서 기록 조회
 */
export async function getTodayReadingRecord(
  date: string
): Promise<ReadingRecord | null> {
  const db = await getDatabase();
  if (!db) return null;

  try {
    const result = await db.getFirstAsync<ReadingRecord>(
      `SELECT * FROM reading_records WHERE date = ?`,
      [date]
    );
    return result || null;
  } catch (error) {
    console.error('독서 기록 조회 실패:', error);
    return null;
  }
}

/**
 * 독서 기록 저장/수정
 */
export async function upsertReadingRecord(
  record: Omit<ReadingRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  const db = await getDatabase();
  if (!db) return false;

  try {
    const existing = await getTodayReadingRecord(record.date);

    if (existing) {
      // 업데이트
      await db.runAsync(
        `UPDATE reading_records 
         SET book_name = ?,
             page_start = ?,
             page_end = ?,
             summary = ?,
             start_time = ?,
             end_time = ?,
             duration_minutes = ?,
             updated_at = datetime('now')
         WHERE date = ?`,
        [
          record.book_name,
          record.page_start,
          record.page_end,
          record.summary,
          record.start_time,
          record.end_time,
          record.duration_minutes,
          record.date,
        ]
      );
    } else {
      // 삽입
      await db.runAsync(
        `INSERT INTO reading_records 
         (date, book_name, page_start, page_end, summary, start_time, end_time, duration_minutes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.date,
          record.book_name,
          record.page_start,
          record.page_end,
          record.summary,
          record.start_time,
          record.end_time,
          record.duration_minutes,
        ]
      );
    }
    return true;
  } catch (error) {
    console.error('독서 기록 저장 실패:', error);
    return false;
  }
}

/**
 * 오늘 계단 기록 조회
 */
export async function getTodayStairsRecord(
  date: string
): Promise<StairsRecord | null> {
  const db = await getDatabase();
  if (!db) return null;

  try {
    const result = await db.getFirstAsync<StairsRecord>(
      `SELECT * FROM stairs_records WHERE date = ?`,
      [date]
    );
    return result || null;
  } catch (error) {
    console.error('계단 기록 조회 실패:', error);
    return null;
  }
}

/**
 * 계단 기록 저장/수정
 */
export async function upsertStairsRecord(
  record: Omit<StairsRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  const db = await getDatabase();
  if (!db) return false;

  try {
    const existing = await getTodayStairsRecord(record.date);

    if (existing) {
      // 업데이트
      await db.runAsync(
        `UPDATE stairs_records 
         SET week_number = ?,
             target_floors = ?,
             start_time = ?,
             end_time = ?,
             duration_minutes = ?,
             steps_count = ?,
             updated_at = datetime('now')
         WHERE date = ?`,
        [
          record.week_number,
          record.target_floors,
          record.start_time,
          record.end_time,
          record.duration_minutes,
          record.steps_count,
          record.date,
        ]
      );
    } else {
      // 삽입
      await db.runAsync(
        `INSERT INTO stairs_records 
         (date, week_number, target_floors, start_time, end_time, duration_minutes, steps_count)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          record.date,
          record.week_number,
          record.target_floors,
          record.start_time,
          record.end_time,
          record.duration_minutes,
          record.steps_count,
        ]
      );
    }
    return true;
  } catch (error) {
    console.error('계단 기록 저장 실패:', error);
    return false;
  }
}

/**
 * 오늘 푸쉬업 기록 조회
 */
export async function getTodayPushupRecord(
  date: string
): Promise<PushupRecord | null> {
  const db = await getDatabase();
  if (!db) return null;

  try {
    const result = await db.getFirstAsync<PushupRecord>(
      `SELECT * FROM pushup_records WHERE date = ?`,
      [date]
    );
    return result || null;
  } catch (error) {
    console.error('푸쉬업 기록 조회 실패:', error);
    return null;
  }
}

/**
 * 오늘 독서 기록 삭제
 */
export async function deleteTodayReadingRecord(date: string): Promise<boolean> {
  const db = await getDatabase();
  if (!db) return false;

  try {
    await db.runAsync(`DELETE FROM reading_records WHERE date = ?`, [date]);
    return true;
  } catch (error) {
    console.error('독서 기록 삭제 실패:', error);
    return false;
  }
}

/**
 * 오늘 계단 기록 삭제
 */
export async function deleteTodayStairsRecord(date: string): Promise<boolean> {
  const db = await getDatabase();
  if (!db) return false;

  try {
    await db.runAsync(`DELETE FROM stairs_records WHERE date = ?`, [date]);
    return true;
  } catch (error) {
    console.error('계단 기록 삭제 실패:', error);
    return false;
  }
}

/**
 * 오늘 푸쉬업 기록 삭제
 */
export async function deleteTodayPushupRecord(date: string): Promise<boolean> {
  const db = await getDatabase();
  if (!db) return false;

  try {
    await db.runAsync(`DELETE FROM pushup_records WHERE date = ?`, [date]);
    return true;
  } catch (error) {
    console.error('푸쉬업 기록 삭제 실패:', error);
    return false;
  }
}

/**
 * 푸쉬업 기록 저장/수정
 */
export async function upsertPushupRecord(
  record: Omit<PushupRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  const db = await getDatabase();
  if (!db) return false;

  try {
    const existing = await getTodayPushupRecord(record.date);

    if (existing) {
      // 업데이트
      await db.runAsync(
        `UPDATE pushup_records 
         SET week_number = ?,
             target_count = ?,
             start_time = ?,
             end_time = ?,
             duration_minutes = ?,
             updated_at = datetime('now')
         WHERE date = ?`,
        [
          record.week_number,
          record.target_count,
          record.start_time,
          record.end_time,
          record.duration_minutes,
          record.date,
        ]
      );
    } else {
      // 삽입
      await db.runAsync(
        `INSERT INTO pushup_records 
         (date, week_number, target_count, start_time, end_time, duration_minutes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          record.date,
          record.week_number,
          record.target_count,
          record.start_time,
          record.end_time,
          record.duration_minutes,
        ]
      );
    }
    return true;
  } catch (error) {
    console.error('푸쉬업 기록 저장 실패:', error);
    return false;
  }
}

/**
 * 월별 기록 조회
 */
export async function getMonthlyRecords(
  year: number,
  month: number
): Promise<{
  [date: string]: {
    reading: boolean;
    stairs: boolean;
    pushup: boolean;
  };
}> {
  const db = await getDatabase();
  if (!db) return {};

  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    // 독서 기록
    const readingRecords = await db.getAllAsync<{ date: string }>(
      `SELECT date FROM reading_records 
       WHERE date >= ? AND date <= ? AND end_time IS NOT NULL`,
      [startDate, endDate]
    );

    // 계단 기록
    const stairsRecords = await db.getAllAsync<{ date: string }>(
      `SELECT date FROM stairs_records 
       WHERE date >= ? AND date <= ? AND end_time IS NOT NULL`,
      [startDate, endDate]
    );

    // 푸쉬업 기록
    const pushupRecords = await db.getAllAsync<{ date: string }>(
      `SELECT date FROM pushup_records 
       WHERE date >= ? AND date <= ? AND end_time IS NOT NULL`,
      [startDate, endDate]
    );

    const records: {
      [date: string]: {
        reading: boolean;
        stairs: boolean;
        pushup: boolean;
      };
    } = {};

    // 모든 날짜에 대해 초기화
    const readingDates = new Set(readingRecords.map((r) => r.date));
    const stairsDates = new Set(stairsRecords.map((r) => r.date));
    const pushupDates = new Set(pushupRecords.map((r) => r.date));

    const allDates = new Set([...readingDates, ...stairsDates, ...pushupDates]);

    allDates.forEach((date) => {
      records[date] = {
        reading: readingDates.has(date),
        stairs: stairsDates.has(date),
        pushup: pushupDates.has(date),
      };
    });

    return records;
  } catch (error) {
    console.error('월별 기록 조회 실패:', error);
    return {};
  }
}

/**
 * 날짜별 기록 조회
 */
export async function getDateRecord(date: string): Promise<{
  reading: ReadingRecord | null;
  stairs: StairsRecord | null;
  pushup: PushupRecord | null;
}> {
  const db = await getDatabase();
  if (!db)
    return {
      reading: null,
      stairs: null,
      pushup: null,
    };

  try {
    const [reading, stairs, pushup] = await Promise.all([
      getTodayReadingRecord(date),
      getTodayStairsRecord(date),
      getTodayPushupRecord(date),
    ]);

    return {
      reading,
      stairs,
      pushup,
    };
  } catch (error) {
    console.error('날짜별 기록 조회 실패:', error);
    return {
      reading: null,
      stairs: null,
      pushup: null,
    };
  }
}
