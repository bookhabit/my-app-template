import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Platform,
  TextInput,
  Image,
} from 'react-native';

import * as IntentLauncher from 'expo-intent-launcher';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

// ActivityAction 카테고리별 그룹화
const ACTIVITY_ACTIONS = {
  '설정 - 일반': [
    { key: 'SETTINGS', label: '설정 메인' },
    { key: 'APPLICATION_SETTINGS', label: '앱 설정' },
    { key: 'APPLICATION_DETAILS_SETTINGS', label: '앱 상세 설정' },
    { key: 'DEVICE_INFO_SETTINGS', label: '기기 정보' },
    { key: 'ABOUT_PHONE', label: '휴대폰 정보' },
  ],
  '설정 - 네트워크': [
    { key: 'WIFI_SETTINGS', label: 'Wi-Fi 설정' },
    { key: 'WIRELESS_SETTINGS', label: '무선 네트워크 설정' },
    { key: 'BLUETOOTH_SETTINGS', label: '블루투스 설정' },
    { key: 'DATA_USAGE_SETTINGS', label: '데이터 사용량' },
    { key: 'MOBILE_DATA_USAGE', label: '모바일 데이터 사용량' },
    { key: 'DATA_ROAMING_SETTINGS', label: '데이터 로밍 설정' },
    { key: 'APN_SETTINGS', label: 'APN 설정' },
    { key: 'VPN_SETTINGS', label: 'VPN 설정' },
    { key: 'NETWORK_OPERATOR_SETTINGS', label: '네트워크 운영자 설정' },
  ],
  '설정 - 위치': [
    { key: 'LOCATION_SOURCE_SETTINGS', label: '위치 설정' },
    { key: 'LOCATION_SCANNING_SETTINGS', label: '위치 스캔 설정' },
  ],
  '설정 - 디스플레이': [
    { key: 'DISPLAY_SETTINGS', label: '디스플레이 설정' },
    { key: 'NIGHT_DISPLAY_SETTINGS', label: '야간 모드 설정' },
    { key: 'DARK_THEME_SETTINGS', label: '다크 테마 설정' },
    { key: 'SCREEN_TIMEOUT_SETTINGS', label: '화면 시간 초과' },
    { key: 'WALLPAPER_SETTINGS', label: '배경화면 설정' },
  ],
  '설정 - 보안': [
    { key: 'SECURITY_SETTINGS', label: '보안 설정' },
    { key: 'PRIVACY_SETTINGS', label: '개인정보 보호' },
    { key: 'LOCK_SCREEN_SETTINGS', label: '잠금 화면 설정' },
    { key: 'FINGERPRINT_SETTINGS', label: '지문 설정' },
    { key: 'FACE_SETTINGS', label: '얼굴 인식 설정' },
    { key: 'BIOMETRIC_ENROLL', label: '생체 인식 등록' },
  ],
  '설정 - 알림': [
    { key: 'NOTIFICATION_SETTINGS', label: '알림 설정' },
    { key: 'APP_NOTIFICATION_SETTINGS', label: '앱 알림 설정' },
    { key: 'NOTIFICATION_HISTORY', label: '알림 기록' },
    { key: 'CHANNEL_NOTIFICATION_SETTINGS', label: '채널 알림 설정' },
  ],
  '설정 - 배터리': [
    { key: 'BATTERY_SAVER_SETTINGS', label: '절전 모드 설정' },
    {
      key: 'IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
      label: '배터리 최적화 무시',
    },
    {
      key: 'REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
      label: '배터리 최적화 무시 요청',
    },
  ],
  '설정 - 앱 관리': [
    { key: 'MANAGE_APPLICATIONS_SETTINGS', label: '앱 관리' },
    { key: 'MANAGE_ALL_APPLICATIONS_SETTINGS', label: '모든 앱 관리' },
    { key: 'MANAGE_APP_OVERLAY_PERMISSION', label: '오버레이 권한 관리' },
    { key: 'MANAGE_OVERLAY_PERMISSION', label: '오버레이 권한 관리 (일반)' },
    { key: 'USAGE_ACCESS_SETTINGS', label: '사용량 접근 설정' },
  ],
  '설정 - 접근성': [
    { key: 'ACCESSIBILITY_SETTINGS', label: '접근성 설정' },
    { key: 'ACCESSIBILITY_DETAILS_SETTINGS', label: '접근성 상세 설정' },
    { key: 'CAPTIONING_SETTINGS', label: '자막 설정' },
  ],
  '설정 - 언어': [
    { key: 'LANGUAGE_SETTINGS', label: '언어 설정' },
    { key: 'LOCALE_SETTINGS', label: '로케일 설정' },
    { key: 'INPUT_METHOD_SETTINGS', label: '입력 방법 설정' },
  ],
  '설정 - 날짜/시간': [
    { key: 'DATE_SETTINGS', label: '날짜 설정' },
    { key: 'SOUND_SETTINGS', label: '소리 설정' },
  ],
  '설정 - 저장공간': [
    { key: 'INTERNAL_STORAGE_SETTINGS', label: '내부 저장공간' },
    { key: 'MEMORY_CARD_SETTINGS', label: '메모리 카드 설정' },
    { key: 'STORAGE_MANAGER_SETTINGS', label: '저장공간 관리자' },
  ],
  '설정 - 계정': [
    { key: 'ADD_ACCOUNT_SETTINGS', label: '계정 추가' },
    { key: 'ACCOUNT_SYNC_SETTINGS', label: '계정 동기화 설정' },
    { key: 'SYNC_SETTINGS', label: '동기화 설정' },
  ],
  '설정 - 기타': [
    { key: 'AIRPLANE_MODE_SETTINGS', label: '비행기 모드 설정' },
    { key: 'CAST_SETTINGS', label: '캐스트 설정' },
    { key: 'HOME_SETTINGS', label: '홈 설정' },
    { key: 'DREAM_SETTINGS', label: '드림 설정' },
    { key: 'USER_SETTINGS', label: '사용자 설정' },
  ],
};

export default function IntentLauncherScreen() {
  const { theme } = useTheme();

  // State
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] =
    useState<IntentLauncher.IntentLauncherResult | null>(null);
  const [packageName, setPackageName] = useState('com.google.android.gm');
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [loadingIcon, setLoadingIcon] = useState(false);

  // IntentLauncherParams
  const [intentData, setIntentData] = useState('');
  const [intentType, setIntentType] = useState('');
  const [intentPackageName, setIntentPackageName] = useState('');
  const [intentCategory, setIntentCategory] = useState('');
  const [intentClassName, setIntentClassName] = useState('');
  const [intentFlags, setIntentFlags] = useState('');
  const [intentExtra, setIntentExtra] = useState('');

  const startActivity = async (actionKey: string) => {
    if (Platform.OS !== 'android') {
      Alert.alert('안내', 'IntentLauncher는 Android에서만 사용 가능합니다.');
      return;
    }

    try {
      setLoading(true);
      const action = (IntentLauncher.ActivityAction as any)[
        actionKey
      ] as string;

      if (!action) {
        Alert.alert('오류', `ActivityAction.${actionKey}를 찾을 수 없습니다.`);
        return;
      }

      const params: IntentLauncher.IntentLauncherParams = {};

      if (intentData) params.data = intentData;
      if (intentType) params.type = intentType;
      if (intentPackageName) params.packageName = intentPackageName;
      if (intentCategory) params.category = intentCategory;
      if (intentClassName) params.className = intentClassName;
      if (intentFlags) params.flags = parseInt(intentFlags) || undefined;
      if (intentExtra) {
        try {
          params.extra = JSON.parse(intentExtra);
        } catch {
          Alert.alert('오류', 'Extra는 유효한 JSON 형식이어야 합니다.');
          return;
        }
      }

      const result = await IntentLauncher.startActivityAsync(action, params);
      setLastResult(result);

      const resultText = getResultCodeText(result.resultCode);
      Alert.alert('완료', `Activity 실행 완료\n결과 코드: ${resultText}`);
    } catch (error: any) {
      Alert.alert('오류', `Activity 실행 실패: ${error.message || error}`);
      setLastResult(null);
    } finally {
      setLoading(false);
    }
  };

  const openApp = () => {
    if (Platform.OS !== 'android') {
      Alert.alert('안내', 'IntentLauncher는 Android에서만 사용 가능합니다.');
      return;
    }

    try {
      IntentLauncher.openApplication(packageName);
      Alert.alert('성공', `앱 열기: ${packageName}`);
    } catch (error: any) {
      Alert.alert('오류', `앱 열기 실패: ${error.message || error}`);
    }
  };

  const getAppIcon = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('안내', 'IntentLauncher는 Android에서만 사용 가능합니다.');
      return;
    }

    try {
      setLoadingIcon(true);
      const icon = await IntentLauncher.getApplicationIconAsync(packageName);
      if (icon) {
        setAppIcon(icon);
        Alert.alert('성공', '앱 아이콘을 가져왔습니다.');
      } else {
        Alert.alert('실패', '앱 아이콘을 가져올 수 없습니다.');
        setAppIcon(null);
      }
    } catch (error: any) {
      Alert.alert('오류', `아이콘 가져오기 실패: ${error.message || error}`);
      setAppIcon(null);
    } finally {
      setLoadingIcon(false);
    }
  };

  const getResultCodeText = (code: IntentLauncher.ResultCode) => {
    switch (code) {
      case IntentLauncher.ResultCode.Success:
        return 'Success (-1)';
      case IntentLauncher.ResultCode.Canceled:
        return 'Canceled (0)';
      case IntentLauncher.ResultCode.FirstUser:
        return `FirstUser (${code})`;
      default:
        return `Custom (${code})`;
    }
  };

  const clearParams = () => {
    setIntentData('');
    setIntentType('');
    setIntentPackageName('');
    setIntentCategory('');
    setIntentClassName('');
    setIntentFlags('');
    setIntentExtra('');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="IntentLauncher" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          IntentLauncher
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          Android Intent 실행 (Android 전용)
        </TextBox>

        {Platform.OS !== 'android' && (
          <View
            style={[
              styles.warningBox,
              {
                backgroundColor: theme.warning + '20',
                borderColor: theme.warning,
              },
            ]}
          >
            <TextBox variant="body2" color={theme.warning}>
              ⚠️ IntentLauncher는 Android에서만 사용 가능합니다.
            </TextBox>
          </View>
        )}

        {/* 개념 설명 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📚 개념 설명
          </TextBox>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              IntentLauncher API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Android Intent를 실행하여 시스템 설정이나 다른 앱 열기
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • startActivityAsync: Activity 실행 (결과 반환)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • openApplication: 패키지 이름으로 앱 열기
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • getApplicationIconAsync: 앱 아이콘 가져오기
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • IntentLauncherParams: data, type, packageName, category,
              className, flags, extra
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • ResultCode: Success (-1), Canceled (0), FirstUser (1+)
            </TextBox>
          </View>
        </View>

        {/* 앱 열기 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📱 앱 열기
          </TextBox>

          <View style={styles.inputContainer}>
            <TextBox variant="body3" color={theme.text}>
              패키지 이름:
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={packageName}
              onChangeText={setPackageName}
              placeholder="com.google.android.gm"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="앱 열기"
              onPress={openApp}
              style={styles.button}
              disabled={!packageName || Platform.OS !== 'android'}
            />
            <CustomButton
              title={loadingIcon ? '로딩 중...' : '아이콘 가져오기'}
              onPress={getAppIcon}
              variant="ghost"
              style={styles.button}
              disabled={
                !packageName || loadingIcon || Platform.OS !== 'android'
              }
            />
          </View>

          {appIcon && (
            <View style={styles.iconContainer}>
              <Image
                source={{ uri: appIcon }}
                style={styles.iconImage}
                resizeMode="contain"
              />
              <TextBox variant="body4" color={theme.textSecondary}>
                {packageName} 아이콘
              </TextBox>
            </View>
          )}
        </View>

        {/* IntentLauncherParams 옵션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚙️ Intent 파라미터 (선택사항)
          </TextBox>

          <View style={styles.paramsContainer}>
            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text}>
                data (URI):
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={intentData}
                onChangeText={setIntentData}
                placeholder="https://example.com"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text}>
                type (MIME):
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={intentType}
                onChangeText={setIntentType}
                placeholder="text/plain"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text}>
                packageName:
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={intentPackageName}
                onChangeText={setIntentPackageName}
                placeholder="com.example.app"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text}>
                category:
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={intentCategory}
                onChangeText={setIntentCategory}
                placeholder="android.intent.category.DEFAULT"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text}>
                className:
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={intentClassName}
                onChangeText={setIntentClassName}
                placeholder="com.example.Activity"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text}>
                flags (숫자):
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={intentFlags}
                onChangeText={setIntentFlags}
                placeholder="268435456"
                keyboardType="numeric"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text}>
                extra (JSON):
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={intentExtra}
                onChangeText={setIntentExtra}
                placeholder='{"key": "value"}'
                multiline
                numberOfLines={3}
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>

          <CustomButton
            title="파라미터 초기화"
            onPress={clearParams}
            variant="ghost"
            style={styles.button}
          />
        </View>

        {/* ActivityAction 목록 */}
        {Object.entries(ACTIVITY_ACTIONS).map(([category, actions]) => (
          <View
            key={category}
            style={[styles.section, { backgroundColor: theme.surface }]}
          >
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              {category}
            </TextBox>

            <View style={styles.actionsGrid}>
              {actions.map((action) => (
                <CustomButton
                  key={action.key}
                  title={action.label}
                  onPress={() => startActivity(action.key)}
                  variant="ghost"
                  style={styles.actionButton}
                  disabled={loading || Platform.OS !== 'android'}
                />
              ))}
            </View>
          </View>
        ))}

        {/* 결과 표시 */}
        {lastResult && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📋 마지막 실행 결과
            </TextBox>

            <View style={styles.resultContainer}>
              <View style={styles.resultRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  결과 코드:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {getResultCodeText(lastResult.resultCode)}
                </TextBox>
              </View>

              {lastResult.data && (
                <View style={styles.resultRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Data URI:
                  </TextBox>
                  <TextBox
                    variant="body4"
                    color={theme.text}
                    style={styles.resultText}
                  >
                    {lastResult.data}
                  </TextBox>
                </View>
              )}

              {lastResult.extra && (
                <View style={styles.resultRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Extra:
                  </TextBox>
                  <TextBox
                    variant="body4"
                    color={theme.text}
                    style={styles.resultText}
                  >
                    {JSON.stringify(lastResult.extra, null, 2)}
                  </TextBox>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 코드 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💻 코드 예제
          </TextBox>
          <View
            style={[
              styles.codeContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {`// 1. 기본 사용 (설정 열기)
import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';

const result = await startActivityAsync(
  ActivityAction.LOCATION_SOURCE_SETTINGS
);
console.log('결과 코드:', result.resultCode);

// 2. 앱 열기
import { openApplication } from 'expo-intent-launcher';

openApplication('com.google.android.gm'); // Gmail 열기

// 3. 앱 아이콘 가져오기
import { getApplicationIconAsync } from 'expo-intent-launcher';

const icon = await getApplicationIconAsync('com.google.android.gm');
// icon은 "data:image/png;base64,..." 형식
<Image source={{ uri: icon }} />

// 4. Intent 파라미터 사용
const result = await startActivityAsync(
  ActivityAction.APPLICATION_DETAILS_SETTINGS,
  {
    packageName: 'com.example.app',
    data: 'https://example.com',
    type: 'text/plain',
    category: 'android.intent.category.DEFAULT',
    flags: 268435456,
    extra: {
      'com.example.key': 'value',
    },
  }
);

// 5. 결과 코드 확인
import { ResultCode } from 'expo-intent-launcher';

if (result.resultCode === ResultCode.Success) {
  console.log('성공');
} else if (result.resultCode === ResultCode.Canceled) {
  console.log('취소됨');
} else {
  console.log('사용자 정의 결과:', result.resultCode);
}

// 6. 주요 ActivityAction 예제
// 위치 설정
await startActivityAsync(ActivityAction.LOCATION_SOURCE_SETTINGS);

// Wi-Fi 설정
await startActivityAsync(ActivityAction.WIFI_SETTINGS);

// 앱 설정
await startActivityAsync(ActivityAction.APPLICATION_SETTINGS);

// 배터리 최적화 무시
await startActivityAsync(
  ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
);

// 오버레이 권한
await startActivityAsync(ActivityAction.MANAGE_OVERLAY_PERMISSION);

// 알림 설정
await startActivityAsync(ActivityAction.NOTIFICATION_SETTINGS);

// 보안 설정
await startActivityAsync(ActivityAction.SECURITY_SETTINGS);

// 7. 패널 열기 (Android 10+)
await startActivityAsync(ActivityAction.PANEL_WIFI);
await startActivityAsync(ActivityAction.PANEL_VOLUME);
await startActivityAsync(ActivityAction.PANEL_NFC);
await startActivityAsync(ActivityAction.PANEL_INTERNET_CONNECTIVITY);

// 8. 특정 앱의 설정 열기
await startActivityAsync(ActivityAction.APPLICATION_DETAILS_SETTINGS, {
  packageName: 'com.example.app',
});

// 9. URI와 함께 Intent 실행
await startActivityAsync(ActivityAction.VIEW, {
  data: 'https://example.com',
  type: 'text/html',
});

// 10. 플래그 사용
await startActivityAsync(ActivityAction.SETTINGS, {
  flags: 268435456, // FLAG_ACTIVITY_NEW_TASK
});`}
            </TextBox>
          </View>
        </View>

        {/* 주의사항 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚠️ 주의사항
          </TextBox>
          <View style={styles.warningContainer}>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android 전용 라이브러리 (iOS에서는 사용 불가)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 일부 ActivityAction은 기기/OS 버전에 따라 사용 불가능할 수 있음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • packageName이 없으면 시스템이 적절한 앱을 선택함
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • data URI의 스킴은 소문자여야 함 (Android 요구사항)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • extra의 키는 패키지 접두사 포함 권장 (예: com.example.key)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • startActivityAsync는 Promise를 반환하며 사용자가 앱으로 돌아올
              때까지 대기
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • getApplicationIconAsync는 앱이 설치되어 있지 않으면 빈 문자열
              반환
            </TextBox>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  warningBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  conceptContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 6,
  },
  conceptTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  conceptText: {
    marginLeft: 8,
    lineHeight: 20,
  },
  inputContainer: {
    gap: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  iconContainer: {
    marginTop: 12,
    alignItems: 'center',
    gap: 8,
  },
  iconImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  paramsContainer: {
    gap: 12,
  },
  inputGroup: {
    gap: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
  resultContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  resultText: {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'monospace',
    fontSize: 10,
  },
  codeContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  warningContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    gap: 8,
  },
  warningItem: {
    marginLeft: 8,
    lineHeight: 22,
  },
});
