# 밤 습관 기능 구현 문서

## 📋 목차

1. [개요](#개요)
2. [데이터베이스 스키마](#데이터베이스-스키마)
3. [스크린 구조](#스크린-구조)
4. [훅 정의](#훅-정의)
5. [기능 상세](#기능-상세)
6. [구현 순서](#구현-순서)

---

## 개요

밤 시간 핸드폰 사용을 제어하여 건강한 수면 습관을 형성하는 기능입니다.

### 주요 기능

- **시간 설정**: 밤 10시부터 아침 10시까지 제어 시간 설정 (사용자 커스터마이징 가능)
- **앱 차단**: 유튜브, 넷플릭스, 삼성인터넷 등 원하는 앱 차단 목록 관리
- **자동 차단**: 설정된 시간에 자동으로 앱 차단 실행
- **차단 기록**: 일별 차단 성공 여부 및 시도 횟수 기록

---

## 데이터베이스 스키마

### 1. 핸드폰 제어 설정 테이블 (`phone_control_settings`)

```sql
CREATE TABLE phone_control_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_time TEXT NOT NULL DEFAULT '22:00',  -- 시작 시간 (HH:mm)
  end_time TEXT NOT NULL DEFAULT '10:00',  -- 종료 시간 (HH:mm)
  is_enabled INTEGER DEFAULT 1,  -- 활성화 여부
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 차단 앱 목록 테이블 (`blocked_apps`)

```sql
CREATE TABLE blocked_apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_name TEXT NOT NULL,  -- 앱 패키지명
  app_name TEXT NOT NULL,  -- 앱 이름 (표시용)
  is_active INTEGER DEFAULT 1,  -- 활성화 여부
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(package_name)
);
```

### 3. 핸드폰 제어 기록 테이블 (`phone_control_records`)

```sql
CREATE TABLE phone_control_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,  -- YYYY-MM-DD 형식
  is_success INTEGER DEFAULT 0,  -- 성공 여부 (차단 성공)
  blocked_count INTEGER DEFAULT 0,  -- 차단 시도 횟수
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date)
);
```

---

## 스크린 구조

### 1. 밤 습관 메인 스크린 (`/evening-routine`)

**경로**: `src/app/(app)/evening-routine/index.tsx`

**기능**:

- 제어 시간 설정 (시작 시간, 종료 시간)
- 제어 활성화/비활성화 토글
- 차단 앱 목록 표시
- 차단 앱 추가/삭제 버튼
- 오늘 차단 기록 표시

**상태 관리**:

- 제어 설정 정보
- 차단 앱 목록
- 오늘 차단 기록
- 제어 활성화 여부

### 2. 차단 앱 추가 스크린 (`/evening-routine/add-app`)

**경로**: `src/app/(app)/evening-routine/add-app/index.tsx`

**기능**:

- 설치된 앱 목록 표시
- 앱 검색 기능
- 앱 선택 및 차단 목록에 추가

**상태 관리**:

- 설치된 앱 목록
- 검색어
- 선택된 앱

---

## 훅 정의

### 1. `usePhoneControl`

**경로**: `src/hooks/evening-routine/usePhoneControl.ts`

**기능**:

- 핸드폰 제어 설정 조회/수정
- 차단 앱 목록 관리
- 제어 기록 조회

**반환값**:

```typescript
{
  settings: PhoneControlSettings | null;
  blockedApps: BlockedApp[];
  isLoading: boolean;
  updateSettings: (settings: Partial<PhoneControlSettings>) => Promise<void>;
  addBlockedApp: (packageName: string, appName: string) => Promise<void>;
  removeBlockedApp: (packageName: string) => Promise<void>;
  toggleApp: (packageName: string, isActive: boolean) => Promise<void>;
  toggleControl: (enabled: boolean) => Promise<void>;
  isControlTime: () => boolean;  // 현재 제어 시간인지 확인
  getTodayRecord: () => Promise<PhoneControlRecord | null>;
}
```

### 2. `useInstalledApps`

**경로**: `src/hooks/evening-routine/useInstalledApps.ts`

**기능**:

- 설치된 앱 목록 조회
- 앱 검색

**반환값**:

```typescript
{
  apps: InstalledApp[];
  isLoading: boolean;
  searchApps: (query: string) => InstalledApp[];
}
```

---

## 기능 상세

### 1. 제어 시간 설정

- 시작 시간: 기본값 22:00 (밤 10시)
- 종료 시간: 기본값 10:00 (아침 10시)
- 사용자가 직접 설정 가능
- 시간대 고려 (24시간 형식)

### 2. 앱 차단 기능

#### 차단 앱 목록 관리

- 사용자가 직접 앱 추가/삭제
- 앱 활성화/비활성화 토글
- 기본 차단 앱 예시:
  - 유튜브
  - 넷플릭스
  - 삼성인터넷
  - 기타 원하는 앱

#### 앱 차단 구현 방법

- Android의 `UsageStatsManager` 활용
- `DevicePolicyManager` 또는 `AccessibilityService` 사용
- 백그라운드 서비스로 시간 체크 및 앱 차단
- 앱 실행 시도 시 자동으로 홈 화면으로 이동

### 3. 자동 차단 로직

- 백그라운드 서비스 실행
- 현재 시간이 제어 시간 범위 내인지 체크
- 제어 시간이면 차단 앱 목록의 앱 실행 차단
- 제어 시간이 아니면 차단 해제

### 4. 차단 기록

- 일별 차단 성공 여부 기록
- 차단 시도 횟수 기록
- 통계 및 리포트 기능 (향후 확장)

---

## 구현 순서

### Phase 1: 데이터베이스 및 기본 구조

1. SQLite 스키마 생성
2. 데이터베이스 초기화 함수
3. 타입 정의 (`src/types/evening-routine.ts`)

### Phase 2: 제어 설정 기능

1. `usePhoneControl` 훅 구현
2. 제어 시간 설정 UI
3. 설정 저장/수정 기능

### Phase 3: 차단 앱 관리

1. `useInstalledApps` 훅 구현
2. 설치된 앱 목록 조회 (Android 네이티브 모듈)
3. 차단 앱 추가/삭제 UI
4. 차단 앱 목록 관리 기능

### Phase 4: Android 네이티브 모듈

1. 앱 목록 조회 모듈 구현
2. 앱 차단 모듈 구현
3. 백그라운드 서비스 구현
4. 시간 체크 및 자동 차단 로직

### Phase 5: 메인 스크린 통합

1. 밤 습관 메인 스크린 UI
2. 차단 앱 추가 스크린
3. 네비게이션 연결

---

## 타입 정의

### `src/types/evening-routine.ts`

```typescript
export interface PhoneControlSettings {
  id: number;
  start_time: string; // HH:mm 형식
  end_time: string; // HH:mm 형식
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlockedApp {
  id: number;
  package_name: string;
  app_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhoneControlRecord {
  id: number;
  date: string;
  is_success: boolean;
  blocked_count: number;
  created_at: string;
  updated_at: string;
}

export interface InstalledApp {
  packageName: string;
  appName: string;
  icon?: string;
}
```

---

## 참고 사항

1. **Android 앱 차단**: `UsageStatsManager`, `DevicePolicyManager` 또는 `AccessibilityService` 활용
2. **백그라운드 서비스**: Foreground Service로 구현하여 안정적인 백그라운드 실행 보장
3. **권한**: `PACKAGE_USAGE_STATS`, `BIND_ACCESSIBILITY_SERVICE` 등 필요한 권한 요청
4. **배터리 최적화**: 백그라운드 서비스 실행을 위한 배터리 최적화 예외 처리

---

## 다음 단계

MD 파일 확인 후, 구현 순서에 따라 단계별로 진행합니다.
