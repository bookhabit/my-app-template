-- 5x5 운동 추적 앱 SQLite 스키마

-- 운동종목 테이블 (static)
CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,         -- "bench_press", "deadlift" 등
  name TEXT NOT NULL,                -- "벤치 프레스"
  muscle_group TEXT,                 -- "가슴", "등", "하체" 등
  default_increment REAL DEFAULT 5.0, -- 기본 증량 (kg)
  created_at TEXT DEFAULT (datetime('now'))
);

-- 루틴 (A/B/C) 매핑 테이블
CREATE TABLE IF NOT EXISTS routines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,         -- "A","B","C"
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 루틴-운동 매핑 테이블
CREATE TABLE IF NOT EXISTS routine_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  routine_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  position INTEGER DEFAULT 0,        -- 보여줄 순서
  FOREIGN KEY (routine_id) REFERENCES routines(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id),
  UNIQUE(routine_id, exercise_id)
);

-- 날짜별 운동 세션 (한 날짜에 하나의 루틴)
CREATE TABLE IF NOT EXISTS workout_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,                -- "YYYY-MM-DD"
  routine_code TEXT NOT NULL,        -- 'A','B','C'
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(date, routine_code)
);

-- 세부 세트 기록 (각 운동별 5세트)
CREATE TABLE IF NOT EXISTS workout_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,       -- workout_sessions.id
  exercise_id INTEGER NOT NULL,
  set_index INTEGER NOT NULL,        -- 1..5
  weight REAL NOT NULL,              -- kg
  reps INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES workout_sessions(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- 캐시용: 최근 성공 여부 또는 요약
CREATE TABLE IF NOT EXISTS workout_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id INTEGER NOT NULL,
  last_date TEXT,                    -- 마지막 운동 날짜
  last_weight REAL,                  -- 마지막 무게
  last_success INTEGER DEFAULT 0,     -- 1: 성공(5x5), 0: 미성공
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
  exercise_type TEXT NOT NULL, -- hang, pushup, handstand_pushup, stairs, running
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


-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(date);
CREATE INDEX IF NOT EXISTS idx_workout_entries_session ON workout_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_entries_exercise ON workout_entries(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_summaries_exercise ON workout_summaries(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_notes_date ON workout_notes(date);
CREATE INDEX IF NOT EXISTS idx_memo_entries_created_at ON memo_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_bodyweight_workout_entries_date ON bodyweight_workout_entries(date);
CREATE INDEX IF NOT EXISTS idx_bodyweight_workout_entries_type ON bodyweight_workout_entries(exercise_type);
