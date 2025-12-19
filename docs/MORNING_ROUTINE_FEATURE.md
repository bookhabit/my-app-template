# 아침 습관 기능 구현 문서

## 📋 목차

1. [개요](#개요)
2. [데이터베이스 스키마](#데이터베이스-스키마)
3. [스크린 구조](#스크린-구조)
4. [훅 정의](#훅-정의)
5. [기능 상세](#기능-상세)
6. [구현 순서](#구현-순서)

---

## 개요

2026년 아침 습관 추적 앱으로, 매일 독서, 계단 운동, 푸쉬업을 기록하고 관리하는 기능입니다.

### 주요 기능

- **목표 설정**: 초기 시작값 및 증량값 직접 설정
- **독서**: 매일 독서 시간 기록
- **계단**: 주차별로 25층씩 증가 (최대 200층), 운동 시간 기록
- **푸쉬업**: 월별로 증가하는 목표 개수, 운동 시간 기록
- **유튜브 영상**: 각 습관별로 유튜브 영상 등록 및 재생
- **월별 기록**: 캘린더를 통한 월별 기록 조회
- **안드로이드 위젯**: 홈 화면에서 오늘 아침 습관 체크 및 빠른 접근

> **참고**: 밤 핸드폰 제어 기능은 별도의 "밤 습관" 스크린에서 관리됩니다.

---

## 데이터베이스 스키마

### 1. 목표 설정 테이블 (`morning_routine_goals`)

```sql
CREATE TABLE morning_routine_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  reading_initial_minutes INTEGER,  -- 사용자 설정 (초깃값)
  reading_increment_minutes INTEGER,  -- 사용자 설정 (증가량)
  stairs_initial_floors INTEGER,  -- 사용자 설정 (초깃값)
  stairs_increment_floors INTEGER,  -- 사용자 설정 (증가량)
  stairs_max_floors INTEGER,  -- 사용자 설정 (최대치)
  pushup_initial_count INTEGER,  -- 사용자 설정 (초깃값)
  pushup_increment_count INTEGER,  -- 사용자 설정 (증가량)
  pushup_max_count INTEGER,  -- 사용자 설정 (최대치)
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 습관별 유튜브 영상 테이블 (`habit_youtube_videos`)

```sql
CREATE TABLE habit_youtube_videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_type TEXT NOT NULL,  -- 'reading', 'stairs', 'pushup'
  video_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  is_shorts INTEGER DEFAULT 0,  -- 0: 일반 영상, 1: 쇼츠
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(habit_type)
);
```

### 3. 독서 기록 테이블 (`reading_records`)

```sql
CREATE TABLE reading_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,  -- YYYY-MM-DD 형식
  book_name TEXT,  -- 책 이름
  page_start INTEGER,  -- 읽기 시작한 페이지
  page_end INTEGER,  -- 읽기 종료한 페이지
  summary TEXT,  -- 오늘 배운 한줄 요약
  start_time TEXT NOT NULL,  -- ISO 8601 형식
  end_time TEXT,
  duration_minutes INTEGER,  -- 종료 시 계산
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date)
);
```

### 4. 계단 기록 테이블 (`stairs_records`)

```sql
CREATE TABLE stairs_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,  -- YYYY-MM-DD 형식
  week_number INTEGER NOT NULL,  -- 1주차, 2주차...
  target_floors INTEGER NOT NULL,  -- 목표 층수
  start_time TEXT NOT NULL,  -- ISO 8601 형식
  end_time TEXT,
  duration_minutes INTEGER,  -- 종료 시 계산
  steps_count INTEGER,  -- 만보기에서 가져온 걸음수
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date)
);
```

### 5. 푸쉬업 기록 테이블 (`pushup_records`)

```sql
CREATE TABLE pushup_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,  -- YYYY-MM-DD 형식
  month INTEGER NOT NULL,  -- 1~12
  target_count INTEGER NOT NULL,  -- 목표 개수
  start_time TEXT NOT NULL,  -- ISO 8601 형식
  end_time TEXT,
  duration_minutes INTEGER,  -- 종료 시 계산
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date)
);
```

---

## 스크린 구조

### 1. 아침 습관 메인 스크린 (`/morning-routine`)

**경로**: `src/app/(app)/morning-routine/index.tsx`

**기능**:

- 아침 습관 목표 설정
- 매일 독서 목표 표시
- 계단 목표 표시 (주차별, 사용자 설정값 기반)
- 푸쉬업 목표 표시 (주차별, 사용자 설정값 기반)
- 스크린 이동 버튼
  - "아침습관 월별 기록 보기" 버튼
  - "오늘 아침 습관 시작" 버튼

**상태 관리**:

- 목표 설정 값들
- 오늘 수행 여부 체크

### 2. 아침 습관 월별 기록 스크린 (`/morning-routine/monthly`)

**경로**: `src/app/(app)/morning-routine/monthly/index.tsx`

**기능**:

- 월 캘린더 표시
- 수행한 날짜 동그라미 색깔 표시
- 날짜 클릭 시 해당 날짜의 습관 기록 표시
  - 독서 체크박스 (책이름,페이지수,한줄요약)
  - 계단 체크박스 (걸린시간,만보기걸음수는 자동으로 디비 저장)
  - 푸쉬업 체크박스
- 월 선택 기능

**상태 관리**:

- 선택된 월
- 선택된 날짜
- 해당 날짜의 기록 데이터

### 3. 오늘 아침 습관 시작 스크린 (`/morning-routine/today`)

**경로**: `src/app/(app)/morning-routine/today/index.tsx`

**기능**:

- 독서, 계단, 푸쉬업 탭 또는 버튼으로 선택
- 각 습관별 시작 스크린으로 이동

### 4. 독서 스크린 (`/morning-routine/today/reading`)

**경로**: `src/app/(app)/morning-routine/today/reading/index.tsx`

**기능**:

- 유튜브 영상 재생 영역
- 유튜브 영상 링크 입력 및 등록
- 영상 수정 기능
- 독서 시작 버튼
- 완료 버튼 (시간 기록, 책 정보 입력)
  - 책 이름 입력
  - 읽은 페이지 범위 입력 (시작 페이지 - 종료 페이지)
  - 오늘 배운 한줄 요약 입력

**상태 관리**:

- 현재 재생 중인 비디오 ID
- 시작 시간
- 종료 시간
- 영상 등록/수정 모드
- 책 이름
- 페이지 범위
- 한줄 요약

### 5. 계단 스크린 (`/morning-routine/today/stairs`)

**경로**: `src/app/(app)/morning-routine/today/stairs/index.tsx`

**기능**:

- 유튜브 영상 재생 영역
- 유튜브 영상 링크 입력 및 등록
- 영상 수정 기능
- 만보기 서비스 시작 버튼
- 계단 운동 시작 버튼
- 완료 버튼 (시간 기록, 걸음수 기록)

**상태 관리**:

- 현재 재생 중인 비디오 ID
- 만보기 서비스 실행 여부
- 시작 시간
- 종료 시간
- 걸음수

### 6. 푸쉬업 스크린 (`/morning-routine/today/pushup`)

**경로**: `src/app/(app)/morning-routine/today/pushup/index.tsx`

**기능**:

- 유튜브 영상 재생 영역
- 유튜브 영상 링크 입력 및 등록
- 영상 수정 기능
- 푸쉬업 시작 버튼
- 완료 버튼 (시간 기록)

**상태 관리**:

- 현재 재생 중인 비디오 ID
- 시작 시간
- 종료 시간

---

## 훅 정의

### 1. `useMorningRoutineGoals`

**경로**: `src/hooks/morning-routine/useMorningRoutineGoals.ts`

**기능**:

- 목표 설정 조회
- 목표 설정 저장/수정

**반환값**:

```typescript
{
  goals: MorningRoutineGoals | null;
  isLoading: boolean;
  updateGoals: (goals: Partial<MorningRoutineGoals>) => Promise<void>;
  getCurrentWeekStairsTarget: () => number; // 현재 주차 목표 층수
  getCurrentWeekPushupTarget: () => number; // 현재 주차 목표 푸쉬업 개수
}
```

### 2. `useHabitYoutubeVideo`

**경로**: `src/hooks/morning-routine/useHabitYoutubeVideo.ts`

**기능**:

- 습관별 유튜브 영상 조회
- 유튜브 영상 등록/수정

**파라미터**:

- `habitType: 'reading' | 'stairs' | 'pushup'`

**반환값**:

```typescript
{
  video: HabitYoutubeVideo | null;
  isLoading: boolean;
  saveVideo: (videoUrl: string) => Promise<void>;
  updateVideo: (videoUrl: string) => Promise<void>;
}
```

### 3. `useReadingRecord`

**경로**: `src/hooks/morning-routine/useReadingRecord.ts`

**기능**:

- 오늘 독서 기록 조회
- 독서 시작/완료 기록

**반환값**:

```typescript
{
  todayRecord: ReadingRecord | null;
  isLoading: boolean;
  startReading: () => Promise<void>;
  completeReading: (
    bookName: string,
    pageStart: number,
    pageEnd: number,
    summary: string
  ) => Promise<void>;
  isReading: boolean;
}
```

### 4. `useStairsRecord`

**경로**: `src/hooks/morning-routine/useStairsRecord.ts`

**기능**:

- 오늘 계단 기록 조회
- 계단 운동 시작/완료 기록
- 만보기 서비스 연동

**반환값**:

```typescript
{
  todayRecord: StairsRecord | null;
  isLoading: boolean;
  startStairs: () => Promise<void>;
  completeStairs: () => Promise<void>;
  isStairsActive: boolean;
  currentSteps: number;
}
```

### 5. `usePushupRecord`

**경로**: `src/hooks/morning-routine/usePushupRecord.ts`

**기능**:

- 오늘 푸쉬업 기록 조회
- 푸쉬업 시작/완료 기록

**반환값**:

```typescript
{
  todayRecord: PushupRecord | null;
  isLoading: boolean;
  startPushup: () => Promise<void>;
  completePushup: () => Promise<void>;
  isPushupActive: boolean;
}
```

### 6. `useMonthlyRecords`

**경로**: `src/hooks/morning-routine/useMonthlyRecords.ts`

**기능**:

- 월별 기록 조회
- 날짜별 기록 조회

**파라미터**:

- `year: number`
- `month: number`

**반환값**:

```typescript
{
  records: {
    [date: string]: {
      reading: boolean;
      stairs: boolean;
      pushup: boolean;
    };
  };
  isLoading: boolean;
  getDateRecord: (date: string) => DateRecord | null;
}
```

### 7. `useWidgetData`

**경로**: `src/hooks/morning-routine/useWidgetData.ts`

**기능**:

- 위젯용 오늘 아침 습관 데이터 조회
- 위젯 업데이트 트리거

**반환값**:

```typescript
{
  todayHabits: {
    reading: boolean;
    stairs: boolean;
    pushup: boolean;
  }
  isLoading: boolean;
  refreshWidget: () => Promise<void>;
}
```

---

## 기능 상세

### 1. 목표 설정

#### 독서

- 초기 시작값: 사용자 설정 (분 단위)
- 증량값: 사용자 설정 (매일 증가할 분수)
- 사용자가 직접 설정 가능

#### 계단

- 초기 시작값: 사용자 설정 (층수)
- 증량값: 사용자 설정 (주차마다 증가할 층수)
- 최대값: 사용자 설정 (최대 층수)
- 계산식: `min(initial + (week - 1) * increment, max)`

#### 푸쉬업

- 초기 시작값: 사용자 설정 (개수)
- 증량값: 사용자 설정 (주차마다 증가할 개수)
- 최대값: 사용자 설정 (최대 개수)
- 계산식: `min(initial + (week - 1) * increment, max)`
- 계단과 동일한 방식으로 주차별 증가

### 2. 유튜브 영상 기능

#### 영상 등록

- 각 습관별로 유튜브 영상 링크 입력
- `extractYouTubeInfo` 함수로 비디오 ID 추출
- 쇼츠/일반 영상 자동 구분
- 디바이스에 저장 (SQLite)

#### 영상 재생

- 저장된 영상 자동 재생
- `HorizontalVideoPlayer` 또는 `ShortsVideoPlayer` 사용
- 영상 수정 모드에서 링크 입력 및 저장

### 3. 시간 기록

#### 시작 시간

- 시작 버튼 클릭 시 현재 시간 기록
- ISO 8601 형식으로 저장

#### 완료 시간

- 완료 버튼 클릭 시 현재 시간 기록
- 시작 시간과의 차이를 분 단위로 계산하여 저장

### 4. 만보기 서비스 연동 (계단)

- 계단 운동 시작 시 만보기 서비스 자동 시작
- 완료 시 걸음수 기록 (선택적)
- 기존 `PedometerManager` 활용

### 5. 월별 기록 캘린더

#### 캘린더 표시

- 월별 캘린더 뷰
- 수행한 날짜는 동그라미 색깔로 표시
- 각 습관별로 다른 색상 사용 가능

#### 날짜 클릭

- 해당 날짜의 기록 표시
- 독서, 계단, 푸쉬업 체크박스로 표시
- 기록이 있으면 체크, 없으면 빈 체크박스

---

## 구현 순서

### Phase 1: 데이터베이스 및 기본 구조

1. SQLite 스키마 생성
2. 데이터베이스 초기화 함수
3. 타입 정의 (`src/types/morning-routine.ts`)

### Phase 2: 목표 설정 기능

1. `useMorningRoutineGoals` 훅 구현
2. 목표 설정 스크린 UI
3. 목표 저장/수정 기능

### Phase 3: 유튜브 영상 기능

1. `useHabitYoutubeVideo` 훅 구현
2. 영상 등록/수정 UI
3. 영상 재생 기능 통합

### Phase 4: 독서 기능

1. `useReadingRecord` 훅 구현
2. 독서 스크린 UI
3. 시간 기록 기능

### Phase 5: 계단 기능

1. `useStairsRecord` 훅 구현
2. 계단 스크린 UI
3. 만보기 서비스 연동
4. 주차별 목표 계산

### Phase 6: 푸쉬업 기능

1. `usePushupRecord` 훅 구현
2. 푸쉬업 스크린 UI
3. 주차별 목표 계산 (계단과 동일한 방식)

### Phase 7: 월별 기록 캘린더

1. `useMonthlyRecords` 훅 구현
2. 캘린더 컴포넌트
3. 날짜별 기록 표시

### Phase 8: 메인 스크린 통합

1. 아침 습관 메인 스크린 UI
2. 오늘 습관 시작 스크린
3. 네비게이션 연결

### Phase 9: 안드로이드 위젯

1. Expo 위젯 설정
2. 위젯 레이아웃 구성
3. 오늘 아침 습관 체크박스 표시
4. 위젯 클릭 시 앱 열기 및 딥링크
5. 위젯 데이터 업데이트 로직

---

## 타입 정의

### `src/types/morning-routine.ts`

```typescript
export interface MorningRoutineGoals {
  id: number;
  year: number;
  reading_initial_minutes: number | null;
  reading_increment_minutes: number | null;
  stairs_initial_floors: number | null;
  stairs_increment_floors: number | null;
  stairs_max_floors: number | null;
  pushup_initial_count: number | null;
  pushup_increment_count: number | null;
  pushup_max_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface HabitYoutubeVideo {
  id: number;
  habit_type: 'reading' | 'stairs' | 'pushup';
  video_id: string;
  video_url: string;
  is_shorts: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReadingRecord {
  id: number;
  date: string;
  book_name: string | null;
  page_start: number | null;
  page_end: number | null;
  summary: string | null;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface StairsRecord {
  id: number;
  date: string;
  week_number: number;
  target_floors: number;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  steps_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface PushupRecord {
  id: number;
  date: string;
  month: number;
  target_count: number;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface DateRecord {
  reading: boolean;
  stairs: boolean;
  pushup: boolean;
}
```

---

## 안드로이드 위젯

### 위젯 기능

**Expo 위젯 (신규 기능)**을 활용하여 안드로이드 홈 화면에 위젯 추가

#### 위젯 구성

1. **오늘 아침 습관 체크박스**
   - 독서 (20분)
   - 계단오르기
   - 푸쉬업
   - 각 체크박스는 오늘 수행 여부 표시

2. **위젯 클릭 동작**
   - 위젯 전체 또는 각 습관 항목 클릭 시
   - 앱 열기 및 딥링크로 해당 스크린으로 이동
   - 경로: `/morning-routine/today`

3. **위젯 업데이트**
   - 습관 완료 시 위젯 자동 업데이트
   - 앱 실행 시 위젯 데이터 동기화

#### 구현 방법

1. **Expo 위젯 설정**
   - `expo-widget` 패키지 사용
   - 위젯 레이아웃 XML 정의
   - 위젯 프로바이더 구현

2. **위젯 데이터 제공**
   - `useWidgetData` 훅으로 데이터 조회
   - 위젯 업데이트 트리거 구현

3. **딥링크 설정**
   - Expo Router 딥링크 설정
   - 위젯 클릭 시 해당 경로로 이동

---

## 참고 사항

1. **기존 만보기 기능 활용**: `PedometerManager`와 `ForegroundServiceUtils`를 계단 기능에서 재사용
2. **유튜브 영상 기능**: 기존 `HorizontalVideoPlayer`, `ShortsVideoPlayer` 컴포넌트 재사용
3. **유틸 함수**: `extractYouTubeInfo` 함수 재사용
4. **날짜 형식**: 모든 날짜는 `YYYY-MM-DD` 형식 사용
5. **시간 형식**: ISO 8601 형식 사용 (`2026-01-01T09:00:00Z`)
6. **위젯**: Expo의 신규 위젯 기능 활용 (공식 문서 확인 필요)
7. **밤 습관 기능**: 별도 문서 참조 (`EVENING_ROUTINE_FEATURE.md`)

---

## 다음 단계

MD 파일 확인 후, 구현 순서에 따라 단계별로 진행합니다.
