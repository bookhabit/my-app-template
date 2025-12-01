import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Platform,
  TextInput,
} from 'react-native';

import * as LocalAuthentication from 'expo-local-authentication';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function LocalAuthenticationScreen() {
  const { theme } = useTheme();

  // State
  const [hasHardware, setHasHardware] = useState<boolean | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [enrolledLevel, setEnrolledLevel] =
    useState<LocalAuthentication.SecurityLevel | null>(null);
  const [supportedTypes, setSupportedTypes] = useState<
    LocalAuthentication.AuthenticationType[]
  >([]);
  const [lastResult, setLastResult] =
    useState<LocalAuthentication.LocalAuthenticationResult | null>(null);

  // Options
  const [promptMessage, setPromptMessage] = useState('인증해주세요');
  const [promptSubtitle, setPromptSubtitle] = useState('');
  const [promptDescription, setPromptDescription] = useState('');
  const [cancelLabel, setCancelLabel] = useState('');
  const [fallbackLabel, setFallbackLabel] = useState('');
  const [disableDeviceFallback, setDisableDeviceFallback] = useState(false);
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [biometricsSecurityLevel, setBiometricsSecurityLevel] = useState<
    'weak' | 'strong'
  >('weak');

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const [hardware, enrolled, level, types] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.getEnrolledLevelAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
      ]);
      console.log('hardware', hardware);
      console.log('enrolled', enrolled);
      console.log('level', level);
      console.log('types', types);

      setHasHardware(hardware);
      setIsEnrolled(enrolled);
      setEnrolledLevel(level);
      setSupportedTypes(types);
    } catch (error: any) {
      Alert.alert('오류', `가용성 확인 실패: ${error.message || error}`);
    }
  };

  const authenticate = async () => {
    try {
      const options: LocalAuthentication.LocalAuthenticationOptions = {};

      if (promptMessage) options.promptMessage = promptMessage;
      if (promptSubtitle) options.promptSubtitle = promptSubtitle;
      if (promptDescription) options.promptDescription = promptDescription;
      if (cancelLabel) options.cancelLabel = cancelLabel;
      if (fallbackLabel) options.fallbackLabel = fallbackLabel;
      options.disableDeviceFallback = disableDeviceFallback;
      if (Platform.OS === 'ios') {
        options.requireConfirmation = requireConfirmation;
      }
      if (Platform.OS === 'android') {
        options.biometricsSecurityLevel = biometricsSecurityLevel;
      }

      const result = await LocalAuthentication.authenticateAsync(options);
      setLastResult(result);

      if (result.success) {
        Alert.alert('성공', '인증에 성공했습니다!');
      } else {
        const errorMessage = getErrorMessage(result.error);
        Alert.alert('인증 실패', errorMessage);
      }
    } catch (error: any) {
      Alert.alert('오류', `인증 실패: ${error.message || error}`);
      setLastResult({ success: false, error: 'unknown' });
    }
  };

  const cancelAuthentication = async () => {
    try {
      await LocalAuthentication.cancelAuthenticate();
      Alert.alert('성공', '인증이 취소되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `인증 취소 실패: ${error.message || error}`);
    }
  };

  const getErrorMessage = (
    error: LocalAuthentication.LocalAuthenticationError
  ): string => {
    switch (error) {
      case 'not_enrolled':
        return '생체 인식이 등록되지 않았습니다.';
      case 'user_cancel':
        return '사용자가 인증을 취소했습니다.';
      case 'app_cancel':
        return '앱이 인증을 취소했습니다.';
      case 'not_available':
        return '생체 인식을 사용할 수 없습니다.';
      case 'lockout':
        return '너무 많은 실패로 인해 일시적으로 잠겼습니다.';
      case 'no_space':
        return '저장 공간이 부족합니다.';
      case 'timeout':
        return '인증 시간이 초과되었습니다.';
      case 'unable_to_process':
        return '인증을 처리할 수 없습니다.';
      case 'unknown':
        return '알 수 없는 오류가 발생했습니다.';
      case 'system_cancel':
        return '시스템이 인증을 취소했습니다.';
      case 'user_fallback':
        return '사용자가 폴백 옵션을 선택했습니다.';
      case 'invalid_context':
        return '잘못된 컨텍스트입니다.';
      case 'passcode_not_set':
        return '기기 비밀번호가 설정되지 않았습니다.';
      case 'authentication_failed':
        return '인증에 실패했습니다.';
      default:
        return '알 수 없는 오류';
    }
  };

  const getSecurityLevelText = (
    level: LocalAuthentication.SecurityLevel
  ): string => {
    switch (level) {
      case LocalAuthentication.SecurityLevel.NONE:
        return 'NONE (등록 없음)';
      case LocalAuthentication.SecurityLevel.SECRET:
        return 'SECRET (비밀번호/PIN)';
      case LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK:
        return 'BIOMETRIC_WEAK (약한 생체 인식)';
      case LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG:
        return 'BIOMETRIC_STRONG (강한 생체 인식)';
      default:
        return `Unknown (${level})`;
    }
  };

  const getAuthenticationTypeText = (
    type: LocalAuthentication.AuthenticationType
  ): string => {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'FINGERPRINT (지문)';
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'FACIAL_RECOGNITION (얼굴 인식)';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'IRIS (홍채)';
      default:
        return `Unknown (${type})`;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="LocalAuthentication" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          LocalAuthentication
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          생체 인식 인증 (지문, FaceID, TouchID)
        </TextBox>

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
              LocalAuthentication API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 지문 인식 (Android, iOS)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • FaceID (iOS)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • TouchID (iOS)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 홍채 인식 (Android)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 하드웨어 가용성 확인
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 등록 상태 확인
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 보안 레벨 확인 (Android)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 지원되는 인증 타입 확인
            </TextBox>
          </View>
        </View>

        {/* 하드웨어 및 등록 상태 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📊 하드웨어 및 등록 상태
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                하드웨어 사용 가능:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  hasHardware === null
                    ? theme.textSecondary
                    : hasHardware
                      ? theme.success
                      : theme.error
                }
              >
                {hasHardware === null
                  ? '확인 중...'
                  : hasHardware
                    ? '✅ 사용 가능'
                    : '❌ 사용 불가'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                등록 상태:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  isEnrolled === null
                    ? theme.textSecondary
                    : isEnrolled
                      ? theme.success
                      : theme.error
                }
              >
                {isEnrolled === null
                  ? '확인 중...'
                  : isEnrolled
                    ? '✅ 등록됨'
                    : '❌ 미등록'}
              </TextBox>
            </View>

            {enrolledLevel !== null && (
              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  등록된 보안 레벨:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {getSecurityLevelText(enrolledLevel)}
                </TextBox>
              </View>
            )}

            {supportedTypes.length > 0 && (
              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  지원되는 인증 타입:
                </TextBox>
                <View style={styles.typesContainer}>
                  {supportedTypes.map((type, index) => (
                    <View
                      key={index}
                      style={[
                        styles.typeBadge,
                        { backgroundColor: theme.primary + '20' },
                      ]}
                    >
                      <TextBox
                        variant="body4"
                        color={theme.primary}
                        style={styles.typeText}
                      >
                        {getAuthenticationTypeText(type)}
                      </TextBox>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          <CustomButton
            title="상태 확인"
            onPress={checkAvailability}
            variant="ghost"
            style={styles.button}
          />
        </View>

        {/* 인증 옵션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚙️ 인증 옵션
          </TextBox>

          <View style={styles.optionsContainer}>
            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text}>
                프롬프트 메시지:
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={promptMessage}
                onChangeText={setPromptMessage}
                placeholder="인증해주세요"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            {Platform.OS === 'ios' && (
              <View style={styles.inputGroup}>
                <TextBox variant="body3" color={theme.text}>
                  프롬프트 부제목 (iOS):
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={promptSubtitle}
                  onChangeText={setPromptSubtitle}
                  placeholder="부제목 (선택사항)"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            )}

            {Platform.OS === 'android' && (
              <View style={styles.inputGroup}>
                <TextBox variant="body3" color={theme.text}>
                  프롬프트 설명 (Android):
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={promptDescription}
                  onChangeText={setPromptDescription}
                  placeholder="설명 (선택사항)"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text}>
                취소 라벨:
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={cancelLabel}
                onChangeText={setCancelLabel}
                placeholder="취소 (선택사항)"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            {Platform.OS === 'ios' && (
              <View style={styles.inputGroup}>
                <TextBox variant="body3" color={theme.text}>
                  폴백 라벨 (iOS):
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={fallbackLabel}
                  onChangeText={setFallbackLabel}
                  placeholder="비밀번호 사용 (선택사항)"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            )}

            <View style={styles.optionGroup}>
              <TextBox variant="body2" color={theme.text}>
                디바이스 폴백 비활성화:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="활성"
                  onPress={() => setDisableDeviceFallback(true)}
                  variant={disableDeviceFallback ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="비활성"
                  onPress={() => setDisableDeviceFallback(false)}
                  variant={!disableDeviceFallback ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            {Platform.OS === 'ios' && (
              <View style={styles.optionGroup}>
                <TextBox variant="body2" color={theme.text}>
                  확인 필요 (iOS):
                </TextBox>
                <View style={styles.buttonRow}>
                  <CustomButton
                    title="필요"
                    onPress={() => setRequireConfirmation(true)}
                    variant={requireConfirmation ? 'primary' : 'ghost'}
                    style={styles.optionButton}
                  />
                  <CustomButton
                    title="불필요"
                    onPress={() => setRequireConfirmation(false)}
                    variant={!requireConfirmation ? 'primary' : 'ghost'}
                    style={styles.optionButton}
                  />
                </View>
              </View>
            )}

            {Platform.OS === 'android' && (
              <View style={styles.optionGroup}>
                <TextBox variant="body2" color={theme.text}>
                  생체 인식 보안 레벨 (Android):
                </TextBox>
                <View style={styles.buttonRow}>
                  <CustomButton
                    title="Weak"
                    onPress={() => setBiometricsSecurityLevel('weak')}
                    variant={
                      biometricsSecurityLevel === 'weak' ? 'primary' : 'ghost'
                    }
                    style={styles.optionButton}
                  />
                  <CustomButton
                    title="Strong"
                    onPress={() => setBiometricsSecurityLevel('strong')}
                    variant={
                      biometricsSecurityLevel === 'strong' ? 'primary' : 'ghost'
                    }
                    style={styles.optionButton}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 인증 실행 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🔐 인증 실행
          </TextBox>

          <View style={styles.buttonRow}>
            <CustomButton
              title="인증 시작"
              onPress={authenticate}
              style={styles.button}
              disabled={!hasHardware || !isEnrolled}
            />
            <CustomButton
              title="인증 취소"
              onPress={cancelAuthentication}
              variant="ghost"
              style={styles.button}
            />
          </View>

          {(!hasHardware || !isEnrolled) && (
            <TextBox
              variant="body4"
              color={theme.warning}
              style={styles.warningText}
            >
              {!hasHardware
                ? '생체 인식 하드웨어를 사용할 수 없습니다.'
                : !isEnrolled
                  ? '생체 인식이 등록되지 않았습니다.'
                  : ''}
            </TextBox>
          )}
        </View>

        {/* 인증 결과 */}
        {lastResult && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📋 인증 결과
            </TextBox>

            <View style={styles.resultContainer}>
              <View style={styles.resultRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  성공:
                </TextBox>
                <TextBox
                  variant="body3"
                  color={lastResult.success ? theme.success : theme.error}
                >
                  {lastResult.success ? '✅ 성공' : '❌ 실패'}
                </TextBox>
              </View>

              {!lastResult.success && lastResult.error && (
                <View style={styles.resultRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    오류:
                  </TextBox>
                  <TextBox variant="body3" color={theme.error}>
                    {getErrorMessage(lastResult.error)}
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
              {`// 1. 기본 인증
import * as LocalAuthentication from 'expo-local-authentication';

const result = await LocalAuthentication.authenticateAsync();
if (result.success) {
  console.log('인증 성공!');
} else {
  console.log('인증 실패:', result.error);
}

// 2. 하드웨어 가용성 확인
const hasHardware = await LocalAuthentication.hasHardwareAsync();
if (!hasHardware) {
  console.log('생체 인식 하드웨어를 사용할 수 없습니다.');
}

// 3. 등록 상태 확인
const isEnrolled = await LocalAuthentication.isEnrolledAsync();
if (!isEnrolled) {
  console.log('생체 인식이 등록되지 않았습니다.');
}

// 4. 등록된 보안 레벨 확인
const level = await LocalAuthentication.getEnrolledLevelAsync();
console.log('보안 레벨:', level);
// NONE, SECRET, BIOMETRIC_WEAK, BIOMETRIC_STRONG

// 5. 지원되는 인증 타입 확인
const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
types.forEach(type => {
  if (type === LocalAuthentication.AuthenticationType.FINGERPRINT) {
    console.log('지문 인식 지원');
  }
  if (type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
    console.log('얼굴 인식 지원');
  }
  if (type === LocalAuthentication.AuthenticationType.IRIS) {
    console.log('홍채 인식 지원');
  }
});

// 6. 옵션과 함께 인증
const result = await LocalAuthentication.authenticateAsync({
  promptMessage: '인증해주세요',
  promptSubtitle: '부제목 (iOS)',
  promptDescription: '설명 (Android)',
  cancelLabel: '취소',
  fallbackLabel: '비밀번호 사용',
  disableDeviceFallback: false,
  requireConfirmation: true, // iOS
  biometricsSecurityLevel: 'strong', // Android
});

// 7. 인증 취소
await LocalAuthentication.cancelAuthenticate();

// 8. 완전한 예제
import * as LocalAuthentication from 'expo-local-authentication';

const authenticate = async () => {
  // 하드웨어 확인
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    Alert.alert('오류', '생체 인식을 사용할 수 없습니다.');
    return;
  }

  // 등록 확인
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
    Alert.alert('오류', '생체 인식을 등록해주세요.');
    return;
  }

  // 인증 실행
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: '인증해주세요',
  });

  if (result.success) {
    Alert.alert('성공', '인증에 성공했습니다!');
  } else {
    Alert.alert('실패', '인증에 실패했습니다.');
  }
};

// 9. 오류 처리
const result = await LocalAuthentication.authenticateAsync();
if (!result.success) {
  switch (result.error) {
    case 'not_enrolled':
      Alert.alert('등록 필요', '생체 인식을 등록해주세요.');
      break;
    case 'user_cancel':
      Alert.alert('취소', '인증이 취소되었습니다.');
      break;
    case 'lockout':
      Alert.alert('잠금', '너무 많은 실패로 일시적으로 잠겼습니다.');
      break;
    default:
      Alert.alert('오류', '인증에 실패했습니다.');
  }
}

// 10. 조건부 인증
const hasHardware = await LocalAuthentication.hasHardwareAsync();
const isEnrolled = await LocalAuthentication.isEnrolledAsync();

if (hasHardware && isEnrolled) {
  const result = await LocalAuthentication.authenticateAsync();
  // 인증 처리
} else {
  // 대체 인증 방법 사용
}`}
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
              • iOS: FaceID는 Expo Go에서 지원되지 않음 (개발 빌드 필요)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: NSFaceIDUsageDescription 권한 설명 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: USE_BIOMETRIC 권한 자동 추가
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 하드웨어 및 등록 상태 확인 후 인증 실행 권장
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • disableDeviceFallback: true 시 실패 시 폴백 없음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: biometricsSecurityLevel로 보안 강도 제어
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: requireConfirmation으로 암시적 인증 제어
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • lockout 상태: 일정 시간 후 자동 해제
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: SECRET 레벨은 SIM 잠금일 수 있음
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
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    gap: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
  },
  optionsContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  optionGroup: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  optionButton: {
    flex: 1,
    minWidth: 80,
  },
  warningText: {
    marginTop: 8,
    textAlign: 'center',
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
