import * as SQLite from 'expo-sqlite';

import { initialExercises, initialRoutines, seedDatabase } from './seedData';

const DB_NAME = 'workout_tracker.db';

/**
 * SQLite 데이터베이스 초기화
 */
export async function setupDatabase(): Promise<SQLite.SQLiteDatabase> {
  try {
    // DB 열기
    const db = await SQLite.openDatabaseAsync(DB_NAME);

    console.log('📦 데이터베이스 열기 성공:', DB_NAME);

    // 스키마 실행
    await executeSchema(db);
    console.log('✅ 스키마 생성 완료');

    // 초기 데이터 시드
    await seedDatabase(db);
    console.log('✅ 초기 데이터 삽입 완료');

    return db;
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    throw error;
  }
}

/**
 * 스키마 SQL 파일 실행
 */
async function executeSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  const schemaSQL = `
    -- 운동종목 테이블 (static)
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      muscle_group TEXT,
      default_increment REAL DEFAULT 5.0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 루틴 (A/B/C) 매핑 테이블
    CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 루틴-운동 매핑 테이블
    CREATE TABLE IF NOT EXISTS routine_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      position INTEGER DEFAULT 0,
      FOREIGN KEY (routine_id) REFERENCES routines(id),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id),
      UNIQUE(routine_id, exercise_id)
    );

    -- 날짜별 운동 세션 (한 날짜에 하나의 루틴)
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      routine_code TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(date, routine_code)
    );

    -- 세부 세트 기록 (각 운동별 5세트)
    CREATE TABLE IF NOT EXISTS workout_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      set_index INTEGER NOT NULL,
      weight REAL NOT NULL,
      reps INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES workout_sessions(id),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );

    -- 캐시용: 최근 성공 여부 또는 요약
    CREATE TABLE IF NOT EXISTS workout_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id INTEGER NOT NULL,
      last_date TEXT,
      last_weight REAL,
      last_success INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(exercise_id)
    );

    -- 일자별 메모 테이블
    CREATE TABLE IF NOT EXISTS workout_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 메모 히스토리 테이블
    CREATE TABLE IF NOT EXISTS memo_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 맨몸 운동 기록 테이블
    CREATE TABLE IF NOT EXISTS bodyweight_workout_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      exercise_type TEXT NOT NULL,
      set_index INTEGER NOT NULL,
      duration_seconds INTEGER,
      reps INTEGER,
      floors INTEGER,
      distance_km REAL,
      time_seconds INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(date, exercise_type, set_index)
    );

    -- 독서 기록 테이블
    CREATE TABLE IF NOT EXISTS reading_books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      memorable_quote TEXT DEFAULT '',
      review TEXT DEFAULT '',
      action_item TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 독서 배운점 테이블
    CREATE TABLE IF NOT EXISTS reading_learned_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (book_id) REFERENCES reading_books(id) ON DELETE CASCADE
    );

    -- 학습 목표 체크 테이블
    CREATE TABLE IF NOT EXISTS study_goals (
      goal_id TEXT PRIMARY KEY,
      checked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 오늘의 TODO 체크 테이블
    CREATE TABLE IF NOT EXISTS today_todo_dates (
      date TEXT NOT NULL,
      todo_type TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (date, todo_type)
    );

    -- 인덱스 생성 (조회 성능 향상)
    CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(date);
    CREATE INDEX IF NOT EXISTS idx_workout_entries_session ON workout_entries(session_id);
    CREATE INDEX IF NOT EXISTS idx_workout_entries_exercise ON workout_entries(exercise_id);
    CREATE INDEX IF NOT EXISTS idx_workout_summaries_exercise ON workout_summaries(exercise_id);
    CREATE INDEX IF NOT EXISTS idx_workout_notes_date ON workout_notes(date);
    CREATE INDEX IF NOT EXISTS idx_memo_entries_created_at ON memo_entries(created_at);
    CREATE INDEX IF NOT EXISTS idx_bodyweight_workout_entries_date ON bodyweight_workout_entries(date);
    CREATE INDEX IF NOT EXISTS idx_bodyweight_workout_entries_type ON bodyweight_workout_entries(exercise_type);
    CREATE INDEX IF NOT EXISTS idx_reading_books_title ON reading_books(title);
    CREATE INDEX IF NOT EXISTS idx_reading_learned_points_book ON reading_learned_points(book_id);
    CREATE INDEX IF NOT EXISTS idx_study_goals_goal_id ON study_goals(goal_id);
    CREATE INDEX IF NOT EXISTS idx_today_todo_dates_date ON today_todo_dates(date);
    CREATE INDEX IF NOT EXISTS idx_today_todo_dates_type ON today_todo_dates(todo_type);
    
  `;

  await db.execAsync(schemaSQL);
}

/**
 * 데이터베이스 인스턴스 생성 (싱글톤)
 */
let databaseInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  try {
    if (!databaseInstance) {
      databaseInstance = await setupDatabase();
    }
    return databaseInstance;
  } catch (error) {
    console.error('❌ 데이터베이스 가져오기 실패:', error);
    return null;
  }
}

/**
 * DB 연결 해제 (선택적)
 */
export async function closeDatabase(): Promise<void> {
  if (databaseInstance) {
    await databaseInstance.closeAsync();
    databaseInstance = null;
  }
}
