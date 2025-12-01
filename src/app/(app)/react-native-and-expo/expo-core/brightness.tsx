import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, Platform, Alert } from 'react-native';

import * as Brightness from 'expo-brightness';

import { useTheme } from '@/context/ThemeProvider';
import Slider from '@react-native-community/slider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function BrightnessScreen() {
  const { theme } = useTheme();

  // State
  const [brightness, setBrightness] = useState<number>(0.5);
  const [systemBrightness, setSystemBrightness] = useState<number | null>(null);
  const [brightnessMode, setBrightnessMode] =
    useState<Brightness.BrightnessMode | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<string>('확인 중...');
  const [isUsingSystemBrightness, setIsUsingSystemBrightness] = useState<
    boolean | null
  >(null);
  const [listenerActive, setListenerActive] = useState(false);

  // Refs
  const brightnessListenerRef = useRef<any>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await checkAvailability();
        const permissionStatusText = await checkPermissions();
        // 권한 확인 후 데이터 로드
        await loadBrightnessData(permissionStatusText === '허용됨');
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initialize();

    return () => {
      if (brightnessListenerRef.current) {
        brightnessListenerRef.current.remove();
      }
    };
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await Brightness.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      setIsAvailable(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const { status } = await Brightness.getPermissionsAsync();
      const statusText =
        status === 'granted'
          ? '허용됨'
          : status === 'denied'
            ? '거부됨'
            : '확인 필요';
      setPermissionStatus(statusText);
      return statusText;
    } catch (error) {
      console.error('Permission check error:', error);
      setPermissionStatus('오류 발생');
      return '오류 발생';
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Brightness.requestPermissionsAsync();
      setPermissionStatus(
        status === 'granted'
          ? '허용됨'
          : status === 'denied'
            ? '거부됨'
            : '확인 필요'
      );

      if (status === 'granted') {
        await loadBrightnessData(true);
      } else {
        Alert.alert('권한 필요', '시스템 밝기를 조절하려면 권한이 필요합니다.');
      }
    } catch (error) {
      Alert.alert('오류', '권한 요청 중 오류가 발생했습니다.');
    }
  };

  const loadBrightnessData = async (hasPermission: boolean = false) => {
    try {
      // 기본 밝기는 권한 없이도 가져올 수 있음
      try {
        const currentBrightness = await Brightness.getBrightnessAsync();
        setBrightness(currentBrightness);
      } catch (error) {
        console.error('Failed to get brightness:', error);
        // 기본값 유지
      }

      // Android 시스템 밝기는 권한 필요
      if (Platform.OS === 'android' && hasPermission) {
        try {
          const systemBrightnessValue =
            await Brightness.getSystemBrightnessAsync();
          setSystemBrightness(systemBrightnessValue);
        } catch (error) {
          console.error('Failed to get system brightness:', error);
        }

        try {
          const usingSystem = await Brightness.isUsingSystemBrightnessAsync();
          setIsUsingSystemBrightness(usingSystem);
        } catch (error) {
          console.error('Failed to check system brightness usage:', error);
        }

        try {
          const mode = await Brightness.getSystemBrightnessModeAsync();
          setBrightnessMode(mode);
        } catch (error) {
          // 권한이 없을 수 있음
          console.error('Failed to get brightness mode:', error);
          setBrightnessMode(null);
        }
      }
    } catch (error) {
      console.error('Failed to load brightness data:', error);
    }
  };

  const handleSetBrightness = async (value: number) => {
    try {
      await Brightness.setBrightnessAsync(value);
      setBrightness(value);
    } catch (error) {
      Alert.alert('오류', '밝기 설정 중 오류가 발생했습니다.');
    }
  };

  const handleSetSystemBrightness = async (value: number) => {
    try {
      if (permissionStatus !== '허용됨') {
        await requestPermissions();
        return;
      }
      await Brightness.setSystemBrightnessAsync(value);
      setSystemBrightness(value);
      await loadBrightnessData();
    } catch (error) {
      Alert.alert('오류', '시스템 밝기 설정 중 오류가 발생했습니다.');
    }
  };

  const handleSetBrightnessMode = async (mode: Brightness.BrightnessMode) => {
    try {
      if (permissionStatus !== '허용됨') {
        await requestPermissions();
        return;
      }
      await Brightness.setSystemBrightnessModeAsync(mode);
      setBrightnessMode(mode);
      await loadBrightnessData();
    } catch (error) {
      Alert.alert('오류', '밝기 모드 설정 중 오류가 발생했습니다.');
    }
  };

  const handleRestoreSystemBrightness = async () => {
    try {
      await Brightness.restoreSystemBrightnessAsync();
      await loadBrightnessData();
    } catch (error) {
      Alert.alert('오류', '시스템 밝기 복원 중 오류가 발생했습니다.');
    }
  };

  const subscribeToBrightness = () => {
    if (brightnessListenerRef.current) {
      brightnessListenerRef.current.remove();
    }
    const subscription = Brightness.addBrightnessListener((event) => {
      console.log('Brightness changed:', event.brightness);
      setBrightness(event.brightness);
    });
    brightnessListenerRef.current = subscription;
    setListenerActive(true);
  };

  const unsubscribeFromBrightness = () => {
    if (brightnessListenerRef.current) {
      brightnessListenerRef.current.remove();
      brightnessListenerRef.current = null;
      setListenerActive(false);
    }
  };

  const getBrightnessModeText = (mode: Brightness.BrightnessMode | null) => {
    if (mode === null) return '알 수 없음';
    switch (mode) {
      case Brightness.BrightnessMode.UNKNOWN:
        return '알 수 없음';
      case Brightness.BrightnessMode.AUTOMATIC:
        return '자동';
      case Brightness.BrightnessMode.MANUAL:
        return '수동';
      default:
        return '알 수 없음';
    }
  };

  const formatBrightness = (value: number | null) => {
    if (value === null) return '알 수 없음';
    return `${Math.round(value * 100)}%`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Brightness" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Brightness
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          화면 밝기 조절 및 모니터링
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
              Brightness API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 화면 밝기를 가져오고 설정하는 API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 밝기 값: 0.0 (어두움) ~ 1.0 (밝음)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Android: 앱별 밝기 설정 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • iOS: 시스템 밝기 변경 불가 (앱 밝기만)
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              밝기 모드
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • AUTOMATIC: 주변광에 따라 자동 조절
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • MANUAL: 수동으로 고정
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Android에서만 시스템 밝기 모드 설정 가능
            </TextBox>
          </View>
        </View>

        {/* 상태 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📊 API 상태
          </TextBox>

          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                사용 가능:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  isAvailable === true
                    ? theme.success
                    : isAvailable === false
                      ? theme.error
                      : theme.textSecondary
                }
              >
                {isAvailable === true
                  ? '✅ 사용 가능'
                  : isAvailable === false
                    ? '❌ 사용 불가'
                    : '확인 중...'}
              </TextBox>
            </View>

            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                권한 상태:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {permissionStatus}
              </TextBox>
            </View>

            {permissionStatus !== '허용됨' && (
              <CustomButton
                title="권한 요청"
                onPress={requestPermissions}
                style={styles.button}
              />
            )}

            {Platform.OS === 'android' && isUsingSystemBrightness !== null && (
              <View style={styles.statusRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  시스템 밝기 사용:
                </TextBox>
                <TextBox
                  variant="body3"
                  color={isUsingSystemBrightness ? theme.success : theme.text}
                >
                  {isUsingSystemBrightness ? '✅ 예' : '❌ 아니오'}
                </TextBox>
              </View>
            )}
          </View>
        </View>

        {/* 앱 밝기 조절 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💡 앱 밝기 조절
          </TextBox>

          <View style={styles.brightnessContainer}>
            <View style={styles.brightnessHeader}>
              <TextBox variant="body2" color={theme.textSecondary}>
                현재 밝기
              </TextBox>
              <TextBox variant="title1" color={theme.primary}>
                {formatBrightness(brightness)}
              </TextBox>
            </View>

            {Platform.OS === 'ios' ? (
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={brightness}
                onValueChange={handleSetBrightness}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.border}
              />
            ) : (
              <View style={styles.androidSliderContainer}>
                <CustomButton
                  title="-"
                  onPress={() =>
                    handleSetBrightness(Math.max(0, brightness - 0.1))
                  }
                  variant="ghost"
                  style={styles.sliderButton}
                />
                <View style={styles.sliderValueContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={brightness}
                    onValueChange={handleSetBrightness}
                    minimumTrackTintColor={theme.primary}
                    maximumTrackTintColor={theme.border}
                  />
                  <TextBox variant="body2" color={theme.text}>
                    {formatBrightness(brightness)}
                  </TextBox>
                </View>
                <CustomButton
                  title="+"
                  onPress={() =>
                    handleSetBrightness(Math.min(1, brightness + 0.1))
                  }
                  variant="ghost"
                  style={styles.sliderButton}
                />
              </View>
            )}

            <View style={styles.brightnessInfo}>
              <TextBox variant="body4" color={theme.textSecondary}>
                • Android: 현재 앱에만 적용
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                • iOS: 기기 잠금 전까지 유지
              </TextBox>
            </View>
          </View>
        </View>

        {/* 시스템 밝기 조절 (Android만) */}
        {Platform.OS === 'android' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              ⚙️ 시스템 밝기 조절 (Android)
            </TextBox>

            {systemBrightness !== null && (
              <View style={styles.brightnessContainer}>
                <View style={styles.brightnessHeader}>
                  <TextBox variant="body2" color={theme.textSecondary}>
                    시스템 밝기
                  </TextBox>
                  <TextBox variant="title1" color={theme.primary}>
                    {formatBrightness(systemBrightness)}
                  </TextBox>
                </View>

                <View style={styles.androidSliderContainer}>
                  <CustomButton
                    title="-"
                    onPress={() =>
                      handleSetSystemBrightness(
                        Math.max(0, (systemBrightness || 0) - 0.1)
                      )
                    }
                    variant="ghost"
                    style={styles.sliderButton}
                  />
                  <View style={styles.sliderValueContainer}>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={1}
                      value={systemBrightness || 0}
                      onValueChange={handleSetSystemBrightness}
                      minimumTrackTintColor={theme.primary}
                      maximumTrackTintColor={theme.border}
                    />
                    <TextBox variant="body2" color={theme.text}>
                      {formatBrightness(systemBrightness)}
                    </TextBox>
                  </View>
                  <CustomButton
                    title="+"
                    onPress={() =>
                      handleSetSystemBrightness(
                        Math.min(1, (systemBrightness || 0) + 0.1)
                      )
                    }
                    variant="ghost"
                    style={styles.sliderButton}
                  />
                </View>

                <CustomButton
                  title="시스템 밝기로 복원"
                  onPress={handleRestoreSystemBrightness}
                  variant="ghost"
                  style={styles.button}
                />
              </View>
            )}

            {/* 밝기 모드 */}
            {brightnessMode !== null && (
              <View style={styles.modeContainer}>
                <TextBox variant="body2" color={theme.text}>
                  밝기 모드: {getBrightnessModeText(brightnessMode)}
                </TextBox>
                <View style={styles.modeButtons}>
                  <CustomButton
                    title="자동"
                    onPress={() =>
                      handleSetBrightnessMode(
                        Brightness.BrightnessMode.AUTOMATIC
                      )
                    }
                    variant={
                      brightnessMode === Brightness.BrightnessMode.AUTOMATIC
                        ? 'primary'
                        : 'ghost'
                    }
                    style={styles.modeButton}
                  />
                  <CustomButton
                    title="수동"
                    onPress={() =>
                      handleSetBrightnessMode(Brightness.BrightnessMode.MANUAL)
                    }
                    variant={
                      brightnessMode === Brightness.BrightnessMode.MANUAL
                        ? 'primary'
                        : 'ghost'
                    }
                    style={styles.modeButton}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* 이벤트 리스너 (iOS만) */}
        {Platform.OS === 'ios' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📡 이벤트 리스너 (iOS)
            </TextBox>

            <View style={styles.listenerContainer}>
              <View style={styles.listenerHeader}>
                <TextBox variant="body3" color={theme.text}>
                  밝기 변경 리스너
                </TextBox>
                <TextBox
                  variant="body4"
                  color={listenerActive ? theme.success : theme.textSecondary}
                >
                  {listenerActive ? '✅ 활성' : '❌ 비활성'}
                </TextBox>
              </View>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.listenerDescription}
              >
                iOS에서만 작동하며, 밝기가 변경될 때 이벤트 발생
              </TextBox>
              <CustomButton
                title={listenerActive ? '구독 해제' : '구독 시작'}
                onPress={
                  listenerActive
                    ? unsubscribeFromBrightness
                    : subscribeToBrightness
                }
                variant="ghost"
                style={styles.listenerButton}
              />
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
              {`import * as Brightness from 'expo-brightness';

// 1. 현재 밝기 가져오기
const brightness = await Brightness.getBrightnessAsync();
console.log('Current brightness:', brightness); // 0.0 ~ 1.0

// 2. 밝기 설정하기
await Brightness.setBrightnessAsync(0.8); // 80% 밝기

// 3. 시스템 밝기 (Android)
const systemBrightness = await Brightness.getSystemBrightnessAsync();
await Brightness.setSystemBrightnessAsync(0.9);

// 4. 밝기 모드 설정 (Android)
await Brightness.setSystemBrightnessModeAsync(
  Brightness.BrightnessMode.AUTOMATIC
);
await Brightness.setSystemBrightnessModeAsync(
  Brightness.BrightnessMode.MANUAL
);

// 5. 시스템 밝기로 복원 (Android)
await Brightness.restoreSystemBrightnessAsync();

// 6. 권한 요청
const { status } = await Brightness.requestPermissionsAsync();
if (status === 'granted') {
  // 시스템 밝기 설정 가능
}

// 7. 이벤트 리스너 (iOS만)
const subscription = Brightness.addBrightnessListener((event) => {
  console.log('Brightness changed:', event.brightness);
});

// 구독 해제
subscription.remove();`}
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
              • iOS: 시스템 밝기는 프로그램으로 변경 불가
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: 앱 밝기 변경은 기기 잠금 전까지 유지
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: 시스템 밝기 변경 시 WRITE_SETTINGS 권한 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: 앱 밝기는 포그라운드에서만 적용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 이벤트 리스너는 iOS에서만 작동
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Web에서는 사용 불가
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
  statusContainer: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginTop: 8,
  },
  brightnessContainer: {
    gap: 16,
    marginTop: 12,
  },
  brightnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  androidSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderButton: {
    minWidth: 50,
  },
  sliderValueContainer: {
    flex: 1,
    gap: 8,
  },
  brightnessInfo: {
    gap: 4,
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  modeContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 12,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
  },
  listenerContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 8,
  },
  listenerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listenerDescription: {
    marginTop: 4,
    lineHeight: 18,
  },
  listenerButton: {
    marginTop: 8,
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
