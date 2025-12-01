import { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Platform,
  TextInput,
} from 'react-native';

import * as ScreenCapture from 'expo-screen-capture';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function ScreenCaptureScreen() {
  const { theme } = useTheme();

  // Permissions
  const [permission, requestPermission] = ScreenCapture.usePermissions();

  // State
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isPrevented, setIsPrevented] = useState(false);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [lastScreenshotTime, setLastScreenshotTime] = useState<string>('');
  const [appSwitcherProtected, setAppSwitcherProtected] = useState(false);
  const [blurIntensity, setBlurIntensity] = useState('0.5');

  // Prevent key
  const [preventKey, setPreventKey] = useState('default');

  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    checkAvailability();
    startScreenshotListener();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await ScreenCapture.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      console.error('Failed to check availability:', error);
      setIsAvailable(false);
    }
  };

  const startScreenshotListener = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version < 14) {
        if (!permission?.granted) {
          return;
        }
      }

      const subscription = ScreenCapture.addScreenshotListener(() => {
        setScreenshotCount((prev) => prev + 1);
        setLastScreenshotTime(new Date().toLocaleTimeString());
        Alert.alert('스크린샷 감지', '스크린샷이 촬영되었습니다!');
      });

      subscriptionRef.current = subscription;
    } catch (error) {
      console.error('Failed to add screenshot listener:', error);
    }
  };

  const preventScreenCapture = async () => {
    try {
      await ScreenCapture.preventScreenCaptureAsync(preventKey || undefined);
      setIsPrevented(true);
      Alert.alert('활성화', '화면 캡처 방지가 활성화되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `화면 캡처 방지 실패: ${error.message || error}`);
    }
  };

  const allowScreenCapture = async () => {
    try {
      await ScreenCapture.allowScreenCaptureAsync(preventKey || undefined);
      setIsPrevented(false);
      Alert.alert('비활성화', '화면 캡처 방지가 비활성화되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `화면 캡처 허용 실패: ${error.message || error}`);
    }
  };

  const enableAppSwitcherProtection = async () => {
    try {
      const intensity = parseFloat(blurIntensity) || 0.5;
      await ScreenCapture.enableAppSwitcherProtectionAsync(intensity);
      setAppSwitcherProtected(true);
      Alert.alert('활성화', '앱 스위처 보호가 활성화되었습니다.');
    } catch (error: any) {
      Alert.alert(
        '오류',
        `앱 스위처 보호 활성화 실패: ${error.message || error}`
      );
    }
  };

  const disableAppSwitcherProtection = async () => {
    try {
      await ScreenCapture.disableAppSwitcherProtectionAsync();
      setAppSwitcherProtected(false);
      Alert.alert('비활성화', '앱 스위처 보호가 비활성화되었습니다.');
    } catch (error: any) {
      Alert.alert(
        '오류',
        `앱 스위처 보호 비활성화 실패: ${error.message || error}`
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="ScreenCapture" showBackButton />
      <View style={styles.content}>
        {/* 사용 가능 여부 및 권한 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            상태
          </TextBox>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              사용 가능:{' '}
              <TextBox
                variant="body2"
                color={isAvailable ? theme.success : theme.error}
              >
                {isAvailable === null
                  ? '확인 중...'
                  : isAvailable
                    ? '사용 가능'
                    : '사용 불가'}
              </TextBox>
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              화면 캡처 방지:{' '}
              <TextBox
                variant="body2"
                color={isPrevented ? theme.success : theme.textSecondary}
              >
                {isPrevented ? '활성화됨' : '비활성화됨'}
              </TextBox>
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              앱 스위처 보호:{' '}
              <TextBox
                variant="body2"
                color={
                  appSwitcherProtected ? theme.success : theme.textSecondary
                }
              >
                {appSwitcherProtected ? '활성화됨' : '비활성화됨'}
              </TextBox>
            </TextBox>
            {Platform.OS === 'android' && Platform.Version < 14 && (
              <>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.marginTop}
                >
                  권한 상태:{' '}
                  <TextBox
                    variant="body2"
                    color={
                      permission?.granted
                        ? theme.success
                        : permission?.status === 'denied'
                          ? theme.error
                          : theme.textSecondary
                    }
                  >
                    {permission?.status || '확인 중...'}
                  </TextBox>
                </TextBox>
                <CustomButton
                  title="권한 요청"
                  onPress={requestPermission}
                  style={styles.button}
                  disabled={permission?.granted}
                />
              </>
            )}
          </View>
        </View>

        {/* 화면 캡처 방지 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            화면 캡처 방지
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              Prevent Key (선택사항)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.hint}
            >
              여러 인스턴스가 충돌하지 않도록 키를 사용할 수 있습니다.
            </TextBox>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={preventKey}
              onChangeText={setPreventKey}
              placeholder="default"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.optionsRow}>
            <CustomButton
              title="방지 활성화"
              onPress={preventScreenCapture}
              style={[styles.button, styles.flex1]}
              disabled={isPrevented}
              variant={isPrevented ? 'ghost' : 'primary'}
            />
            <CustomButton
              title="방지 비활성화"
              onPress={allowScreenCapture}
              style={[styles.button, styles.flex1]}
              disabled={!isPrevented}
              variant={!isPrevented ? 'ghost' : 'primary'}
            />
          </View>
        </View>

        {/* 앱 스위처 보호 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            앱 스위처 보호 (iOS)
          </TextBox>
          {Platform.OS === 'ios' ? (
            <>
              <View style={styles.inputGroup}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  블러 강도 (0.0 - 1.0)
                </TextBox>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  value={blurIntensity}
                  onChangeText={setBlurIntensity}
                  placeholder="0.5"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.optionsRow}>
                <CustomButton
                  title="보호 활성화"
                  onPress={enableAppSwitcherProtection}
                  style={[styles.button, styles.flex1]}
                  disabled={appSwitcherProtected}
                  variant={appSwitcherProtected ? 'ghost' : 'primary'}
                />
                <CustomButton
                  title="보호 비활성화"
                  onPress={disableAppSwitcherProtection}
                  style={[styles.button, styles.flex1]}
                  disabled={!appSwitcherProtected}
                  variant={!appSwitcherProtected ? 'ghost' : 'primary'}
                />
              </View>
            </>
          ) : (
            <View
              style={[
                styles.infoBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextBox variant="body4" color={theme.textSecondary}>
                iOS 전용 기능입니다. Android에서는 preventScreenCaptureAsync가
                자동으로 앱 스위처 보호를 제공합니다.
              </TextBox>
            </View>
          )}
        </View>

        {/* 스크린샷 감지 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            스크린샷 감지
          </TextBox>
          <View
            style={[
              styles.infoBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              감지된 스크린샷: {screenshotCount}회
            </TextBox>
            {lastScreenshotTime && (
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.marginTop}
              >
                마지막 스크린샷: {lastScreenshotTime}
              </TextBox>
            )}
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.marginTop}
            >
              {Platform.OS === 'android' && Platform.Version < 14
                ? 'Android 13 이하: READ_MEDIA_IMAGES 권한 필요'
                : Platform.OS === 'android'
                  ? 'Android 14+: 권한 불필요'
                  : 'iOS: 권한 불필요'}
            </TextBox>
          </View>
          <CustomButton
            title="카운터 초기화"
            onPress={() => {
              setScreenshotCount(0);
              setLastScreenshotTime('');
            }}
            style={styles.button}
            variant="ghost"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  statusBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  marginTop: {
    marginTop: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  button: {
    marginTop: 8,
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
});
