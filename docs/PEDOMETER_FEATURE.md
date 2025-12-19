# 만보기 기능 문서

## 📋 개요

만보기 기능은 Android의 `Sensor.TYPE_STEP_COUNTER` 센서를 사용하여 사용자의 걸음수를 실시간으로 측정하는 기능입니다. 포그라운드 서비스를 사용하여 백그라운드에서도 동작하며, 알림센터에 실시간 걸음수를 표시합니다.

## 🏗️ 아키텍처

### 네이티브 레벨 (Android)

#### 1. StepCounterManager.kt

**위치**: `android/app/src/main/java/com/hyunjin_l/monymony/pedometer/StepCounterManager.kt`

**주요 기능**:

- `Sensor.TYPE_STEP_COUNTER` 센서 관리
- 센서 기반 실시간 걸음수 계산
- 날짜 변경 감지 및 자동 저장
- 재부팅 감지 및 처리
- 기준점(baseline) 관리

**센서 기반 계산 방식**:

- `Sensor.TYPE_STEP_COUNTER`는 부팅 후 누적 걸음수를 제공합니다
- 오늘 걸음수 = 현재 센서 값 - 오늘의 기준점(baseline)
- 기준점은 오늘 첫 센서 값 또는 자정 시점의 센서 값입니다

**주요 메서드**:

- `initialize()`: 초기화 및 기준점 설정
- `registerSensor()`: 센서 리스너 등록
- `unregisterSensor()`: 센서 리스너 해제
- `getDisplaySteps()`: 현재 걸음수 조회
- `saveSteps()`: 걸음수 저장
- `getDailySteps()`: 기간별 걸음수 조회

**데이터 구조**:

```kotlin
data class StepData(
    var currentSensorValue: Long = 0L,   // 현재 센서 값
    var baselineSteps: Long = -1L        // 오늘의 기준점
) {
    fun getTodaySteps(): Long {
        return if (baselineSteps >= 0 && currentSensorValue >= baselineSteps) {
            currentSensorValue - baselineSteps
        } else {
            0L
        }
    }
}
```

#### 2. PedometerService.kt

**위치**: `android/app/src/main/java/com/hyunjin_l/monymony/pedometer/service/PedometerService.kt`

**주요 기능**:

- 포그라운드 서비스로 백그라운드에서 걸음수 측정
- 알림 업데이트 (실시간 걸음수)
- StepCounterManager와 연동하여 실시간 데이터 수집
- 걸음수 업데이트 시 알림 갱신

**알림 표시 정보**:

- 걸음수: "X,XXX 걸음" (천 단위 구분)

#### 3. AOSPedometerModule.kt

**위치**: `android/app/src/main/java/com/hyunjin_l/monymony/pedometer/module/AOSPedometerModule.kt`

**주요 기능**:

- React Native와 네이티브 코드 간 통신
- 실시간 업데이트 시작/중지 제어
- 실시간 데이터를 React Native로 이벤트 전송
- 서비스 상태 확인
- 기간별 걸음수 조회

**이벤트**:

- `StepUpdate`: 걸음수 업데이트

**주요 메서드**:

- `loadTodaySteps()`: 오늘 걸음수 조회
- `saveTodaySteps()`: 오늘 걸음수 저장
- `startUpdates()`: 실시간 업데이트 시작
- `stopUpdates()`: 실시간 업데이트 중지
- `fetchDailySteps()`: 기간별 걸음수 조회
- `startStepCounterService()`: 포그라운드 서비스 시작
- `stopStepCounterService()`: 포그라운드 서비스 중지
- `getServiceStatus()`: 서비스 상태 확인

#### 4. AOSPedometerPackage.kt

**위치**: `android/app/src/main/java/com/hyunjin_l/monymony/pedometer/module/AOSPedometerPackage.kt`

React Native 패키지 등록을 위한 클래스입니다.

### 데이터베이스 레벨

#### StepCounterRepository.kt

**위치**: `android/app/src/main/java/com/hyunjin_l/monymony/database/repository/StepCounterRepository.kt`

**주요 기능**:

- Room 데이터베이스를 사용한 걸음수 데이터 저장
- 일별 기준점(baseline) 저장
- 기간별 걸음수 조회

**데이터 구조**:

```kotlin
@Entity(tableName = "daily_steps")
data class DailyStepsEntity(
    @PrimaryKey val date: String,  // "yyyy-MM-dd" 형식
    val baselineSteps: Long        // 해당 날짜의 기준점
)
```

### React Native 레벨

#### PedometerManager.ts

**위치**: `src/manager/PedometerManager.ts`

**주요 기능**:

- 네이티브 모듈 래퍼
- 권한 관리 (ACTIVITY_RECOGNITION)
- 알림 권한 관리 (POST_NOTIFICATIONS)
- 이벤트 리스너 관리
- 실시간 업데이트 제어

**주요 메서드**:

- `checkPermissionStatus()`: 만보기 권한 확인
- `requestPermission()`: 만보기 권한 요청
- `checkNotificationPermissionStatus()`: 알림 권한 확인
- `requestNotificationPermission()`: 알림 권한 요청
- `loadTodaySteps()`: 오늘 걸음수 조회
- `saveTodaySteps()`: 오늘 걸음수 저장
- `startUpdates()`: 실시간 업데이트 시작
- `stopUpdates()`: 실시간 업데이트 중지
- `fetchDailySteps()`: 기간별 걸음수 조회

## 🔑 필요한 권한

### Android

- `ACTIVITY_RECOGNITION`: 활동 인식 권한 (걸음수 측정)
- `FOREGROUND_SERVICE`: 포그라운드 서비스 실행
- `FOREGROUND_SERVICE_HEALTH`: 건강 관련 포그라운드 서비스 (Android 14+)
- `POST_NOTIFICATIONS`: 알림 표시 (Android 13+)

## 📐 걸음수 계산 방법

### 센서 기반 계산

1. **기준점 설정**:
   - 오늘 첫 센서 값 또는 자정 시점의 센서 값을 기준점으로 설정
   - 기준점은 데이터베이스에 저장되어 재부팅 후에도 유지

2. **실시간 계산**:
   - 오늘 걸음수 = 현재 센서 값 - 기준점
   - 센서 값이 기준점보다 작으면 0으로 처리 (재부팅 감지)

3. **날짜 변경 처리**:
   - 자정이 지나면 새로운 날짜의 기준점 설정
   - 이전 날짜의 최종 걸음수 저장

4. **재부팅 감지**:
   - 센서 값이 기준점보다 작아지면 재부팅으로 판단
   - 기준점을 현재 센서 값으로 재설정

## ⏱️ 시간 관리

- **날짜 체크**: 1분마다 날짜 변경 확인
- **자동 저장**: 날짜 변경 시 자동으로 이전 날짜 데이터 저장
- **재부팅 감지**: 센서 값이 기준점보다 작아지면 재부팅으로 판단

## 📱 알림 레이아웃

**위치**: `android/app/src/main/res/layout/notification_pedometer.xml`

### 표시 정보

- **걸음수**: "X,XXX 걸음" (큰 글씨, 천 단위 구분)

### 다크모드 지원

- `values/colors.xml`: 라이트 모드 색상
- `values-night/colors.xml`: 다크 모드 색상

## 🔄 데이터 흐름

1. 사용자가 실시간 업데이트 시작
2. `StepCounterManager` 초기화
3. 기준점(baseline) 로드 또는 설정
4. `Sensor.TYPE_STEP_COUNTER` 센서 리스너 등록
5. 센서 값 업데이트마다:
   - 현재 센서 값 업데이트
   - 오늘 걸음수 계산 (센서 값 - 기준점)
   - 알림 업데이트
   - React Native로 이벤트 전송 (`StepUpdate`)
6. 1분마다 날짜 변경 확인
7. 날짜 변경 시:
   - 이전 날짜의 최종 걸음수 저장
   - 새로운 날짜의 기준점 설정
8. 사용자가 실시간 업데이트 중지
9. 센서 리스너 해제 (서비스가 실행 중이면 유지)

## 📊 데이터 구조

### StepData

```kotlin
data class StepData(
    var currentSensorValue: Long = 0L,   // 현재 센서 값
    var baselineSteps: Long = -1L        // 오늘의 기준점
)
```

### DailyStepData

```kotlin
data class DailyStepData(
    val date: String,      // "yyyy-MM-dd" 형식
    val steps: Long        // 해당 날짜의 걸음수
)
```

## 🎯 사용 예제

### React Native에서 사용

```typescript
import PedometerManager from '@/manager/PedometerManager';

// 권한 확인
const permission = await PedometerManager.checkPermissionStatus();
if (!permission.hasPermission) {
  // 권한 요청
  const result = await PedometerManager.requestPermission();
}

// 알림 권한 확인
const notificationPermission =
  await PedometerManager.checkNotificationPermissionStatus();
if (!notificationPermission.hasPermission) {
  // 알림 권한 요청
  await PedometerManager.requestNotificationPermission();
}

// 오늘 걸음수 조회
const todaySteps = await PedometerManager.loadTodaySteps();
console.log('오늘 걸음수:', todaySteps.totalSteps);

// 실시간 업데이트 시작
await PedometerManager.startUpdates();

// 이벤트 리스너 등록
const eventEmitter = PedometerManager.getEventEmitter();
const subscription = eventEmitter?.addListener('StepUpdate', (data) => {
  console.log('걸음수 업데이트:', data.totalSteps);
});

// 실시간 업데이트 중지
await PedometerManager.stopUpdates();
subscription?.remove();

// 기간별 걸음수 조회
const startDate = new Date('2024-01-01').getTime();
const endDate = new Date('2024-01-31').getTime();
const dailySteps = await PedometerManager.fetchDailySteps(startDate, endDate);
```

### 포그라운드 서비스 사용

```typescript
import ForegroundServiceUtils from '@/utils/foregroundServiceUtils';

// 서비스 시작
await ForegroundServiceUtils.startService();

// 서비스 상태 확인
const status = await ForegroundServiceUtils.getServiceStatus();
console.log('서비스 실행 중:', status.isServiceRunning);
console.log('걸음수:', status.totalSteps);

// 서비스 중지
await ForegroundServiceUtils.stopService();
```

## 🔧 설정

### AndroidManifest.xml

```xml
<!-- 권한 -->
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_HEALTH"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

<!-- 서비스 등록 -->
<service
    android:name=".pedometer.service.PedometerService"
    android:enabled="true"
    android:exported="false"
    android:foregroundServiceType="health"/>
```

### MainApplication.kt

```kotlin
import com.hyunjin_l.monymony.pedometer.module.AOSPedometerPackage

override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
      add(AOSPedometerPackage())
    }
```

### build.gradle

```gradle
// Room 데이터베이스
def room_version = "2.7.0"
implementation("androidx.room:room-runtime:$room_version")
implementation("androidx.room:room-ktx:$room_version")
kapt("androidx.room:room-compiler:$room_version")
```

## ⚠️ 주의사항

1. **센서 가용성**: `Sensor.TYPE_STEP_COUNTER`는 Android 4.4 (API 19) 이상에서 사용 가능하며, 모든 기기에서 지원되지 않을 수 있습니다.

2. **재부팅 처리**: 기기가 재부팅되면 센서 값이 0으로 리셋됩니다. 이를 감지하여 기준점을 재설정합니다.

3. **날짜 변경**: 자정이 지나면 새로운 날짜의 기준점을 설정하고, 이전 날짜의 최종 걸음수를 저장합니다.

4. **Android 12+ 백그라운드 제한**: Android 12 이상에서는 앱이 백그라운드에 있을 때 포그라운드 서비스를 시작할 수 없습니다. 앱이 포그라운드에 있을 때만 서비스를 시작할 수 있습니다.

5. **권한 요청**: ACTIVITY_RECOGNITION 권한은 사용자가 명시적으로 허용해야 합니다. 권한이 없으면 기능을 사용할 수 없습니다.

## 🐛 트러블슈팅

### 걸음수가 0으로 표시될 때

- 센서가 제대로 등록되었는지 확인
- 기준점이 올바르게 설정되었는지 확인
- 재부팅 후 기준점이 재설정되었는지 확인

### 걸음수가 업데이트되지 않을 때

- 센서 리스너가 등록되어 있는지 확인
- 권한이 허용되어 있는지 확인
- 서비스가 정상적으로 실행 중인지 확인

### 알림이 표시되지 않을 때

- 알림 권한이 허용되어 있는지 확인 (Android 13+)
- 알림 채널이 제대로 생성되었는지 확인
- 서비스가 정상적으로 시작되었는지 확인

### 날짜 변경이 감지되지 않을 때

- 날짜 체크 타이머가 실행 중인지 확인
- 시스템 시간이 올바른지 확인

## 📝 참고 자료

- [Android Step Counter Sensor](https://developer.android.com/reference/android/hardware/Sensor#TYPE_STEP_COUNTER)
- [Room Persistence Library](https://developer.android.com/training/data-storage/room)
- [Foreground Services](https://developer.android.com/guide/components/foreground-services)
