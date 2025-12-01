import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Platform,
  TextInput,
} from 'react-native';

import * as Device from 'expo-device';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function DeviceScreen() {
  const { theme } = useTheme();

  // Async state
  const [deviceType, setDeviceType] = useState<Device.DeviceType | null>(null);
  const [maxMemory, setMaxMemory] = useState<number | null>(null);
  const [platformFeatures, setPlatformFeatures] = useState<string[]>([]);
  const [uptime, setUptime] = useState<number | null>(null);
  const [isRooted, setIsRooted] = useState<boolean | null>(null);
  const [isSideLoadingEnabled, setIsSideLoadingEnabled] = useState<
    boolean | null
  >(null);

  // Feature check
  const [featureInput, setFeatureInput] = useState(
    'android.hardware.touchscreen'
  );
  const [hasFeature, setHasFeature] = useState<boolean | null>(null);

  useEffect(() => {
    loadAsyncData();
  }, []);

  const loadAsyncData = async () => {
    try {
      const [type, memory, features, uptimeMs, rooted, sideLoading] =
        await Promise.all([
          Device.getDeviceTypeAsync(),
          Device.getMaxMemoryAsync(),
          Device.getPlatformFeaturesAsync(),
          Device.getUptimeAsync(),
          Device.isRootedExperimentalAsync().catch(() => null),
          Platform.OS === 'android'
            ? Device.isSideLoadingEnabledAsync().catch(() => null)
            : Promise.resolve(null),
        ]);

      setDeviceType(type);
      setMaxMemory(memory);
      setPlatformFeatures(features);
      setUptime(uptimeMs);
      setIsRooted(rooted);
      setIsSideLoadingEnabled(sideLoading);
    } catch (error) {
      console.error('Failed to load device data:', error);
    }
  };

  const checkFeature = async () => {
    try {
      const has = await Device.hasPlatformFeatureAsync(featureInput);
      setHasFeature(has);
    } catch (error) {
      console.error('Failed to check feature:', error);
      setHasFeature(null);
    }
  };

  const getDeviceTypeText = (type: Device.DeviceType | null) => {
    if (type === null) return '알 수 없음';
    switch (type) {
      case Device.DeviceType.UNKNOWN:
        return '알 수 없음';
      case Device.DeviceType.PHONE:
        return '스마트폰';
      case Device.DeviceType.TABLET:
        return '태블릿';
      case Device.DeviceType.DESKTOP:
        return '데스크톱';
      case Device.DeviceType.TV:
        return 'TV';
      default:
        return String(type);
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (bytes === null) return '알 수 없음';
    const gb = bytes / (1024 * 1024 * 1024);
    const mb = bytes / (1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB (${bytes.toLocaleString()} bytes)`;
    }
    return `${mb.toFixed(2)} MB (${bytes.toLocaleString()} bytes)`;
  };

  const formatUptime = (ms: number | null) => {
    if (ms === null) return '알 수 없음';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}일 ${hours % 24}시간 ${minutes % 60}분`;
    } else if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds % 60}초`;
    }
    return `${seconds}초`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Device" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Device
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          물리적 디바이스의 시스템 정보
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
              Device API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 물리적 디바이스의 시스템 정보 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 제조사, 모델명, OS 버전 등
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 디바이스 타입 (폰, 태블릿, TV 등)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 메모리, CPU 아키텍처 정보
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 루팅/탈옥 감지 (실험적)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 플랫폼 기능 확인 (Android)
            </TextBox>
          </View>
        </View>

        {/* 기본 디바이스 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📱 기본 디바이스 정보
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                제조사:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {Device.manufacturer || '알 수 없음'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                브랜드:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {Device.brand || '알 수 없음'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                모델명:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {Device.modelName || '알 수 없음'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                모델 ID:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                {Device.modelId || '알 수 없음'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                디바이스 이름:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {Device.deviceName || '알 수 없음'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                디바이스 타입:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {getDeviceTypeText(Device.deviceType)}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                디바이스 연도 클래스:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {Device.deviceYearClass || '알 수 없음'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                실제 디바이스:
              </TextBox>
              <TextBox
                variant="body3"
                color={Device.isDevice ? theme.success : theme.warning}
              >
                {Device.isDevice ? '✅ 예' : '❌ 시뮬레이터/에뮬레이터'}
              </TextBox>
            </View>

            {Platform.OS === 'android' && (
              <>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    디자인 이름:
                  </TextBox>
                  <TextBox variant="body4" color={theme.textSecondary}>
                    {Device.designName || '알 수 없음'}
                  </TextBox>
                </View>

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    제품명:
                  </TextBox>
                  <TextBox variant="body4" color={theme.textSecondary}>
                    {Device.productName || '알 수 없음'}
                  </TextBox>
                </View>
              </>
            )}
          </View>
        </View>

        {/* OS 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💻 OS 정보
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                OS 이름:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {Device.osName || '알 수 없음'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                OS 버전:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {Device.osVersion || '알 수 없음'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                OS 빌드 ID:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                {Device.osBuildId || '알 수 없음'}
              </TextBox>
            </View>

            {Platform.OS === 'android' && (
              <>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    OS 내부 빌드 ID:
                  </TextBox>
                  <TextBox variant="body4" color={theme.textSecondary}>
                    {Device.osInternalBuildId || '알 수 없음'}
                  </TextBox>
                </View>

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    OS 빌드 지문:
                  </TextBox>
                  <TextBox variant="body4" color={theme.textSecondary}>
                    {Device.osBuildFingerprint || '알 수 없음'}
                  </TextBox>
                </View>

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    플랫폼 API 레벨:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {Device.platformApiLevel || '알 수 없음'}
                  </TextBox>
                </View>
              </>
            )}
          </View>
        </View>

        {/* 하드웨어 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🔧 하드웨어 정보
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                총 메모리:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {formatBytes(Device.totalMemory)}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                최대 메모리 (Java VM):
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {formatBytes(maxMemory)}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                지원 CPU 아키텍처:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                {Device.supportedCpuArchitectures
                  ? Device.supportedCpuArchitectures.join(', ')
                  : '알 수 없음'}
              </TextBox>
            </View>

            {Device.supportedCpuArchitectures &&
              Device.supportedCpuArchitectures.length > 0 && (
                <View style={styles.archList}>
                  {Device.supportedCpuArchitectures.map((arch, index) => (
                    <TextBox
                      key={index}
                      variant="body4"
                      color={theme.textSecondary}
                    >
                      • {arch}
                    </TextBox>
                  ))}
                </View>
              )}
          </View>
        </View>

        {/* 비동기 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⏱️ 비동기 정보
          </TextBox>

          <CustomButton
            title="정보 새로고침"
            onPress={loadAsyncData}
            style={styles.button}
          />

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                디바이스 타입 (Async):
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {getDeviceTypeText(deviceType)}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                업타임:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {formatUptime(uptime)}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                루팅/탈옥:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  isRooted === true
                    ? theme.warning
                    : isRooted === false
                      ? theme.success
                      : theme.textSecondary
                }
              >
                {isRooted === true
                  ? '⚠️ 루팅/탈옥됨'
                  : isRooted === false
                    ? '✅ 정상'
                    : '확인 중...'}
              </TextBox>
            </View>

            {Platform.OS === 'android' && (
              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  사이드로딩 허용:
                </TextBox>
                <TextBox
                  variant="body3"
                  color={
                    isSideLoadingEnabled === true
                      ? theme.success
                      : isSideLoadingEnabled === false
                        ? theme.error
                        : theme.textSecondary
                  }
                >
                  {isSideLoadingEnabled === true
                    ? '✅ 허용됨'
                    : isSideLoadingEnabled === false
                      ? '❌ 비허용'
                      : '확인 중...'}
                </TextBox>
              </View>
            )}
          </View>
        </View>

        {/* 플랫폼 기능 (Android) */}
        {Platform.OS === 'android' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              🛠️ 플랫폼 기능 (Android)
            </TextBox>

            <View style={styles.inputContainer}>
              <TextBox variant="body3" color={theme.textSecondary}>
                기능 이름:
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={featureInput}
                onChangeText={setFeatureInput}
                placeholder="android.hardware.touchscreen"
              />
            </View>

            <View style={styles.buttonRow}>
              <CustomButton
                title="기능 확인"
                onPress={checkFeature}
                style={styles.button}
              />
            </View>

            {hasFeature !== null && (
              <View style={styles.infoContainer}>
                <TextBox variant="body3" color={theme.text}>
                  기능 '{featureInput}':{' '}
                  {hasFeature ? '✅ 지원됨' : '❌ 지원 안됨'}
                </TextBox>
              </View>
            )}

            {platformFeatures.length > 0 && (
              <View style={styles.featuresContainer}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.listTitle}
                >
                  사용 가능한 기능 ({platformFeatures.length}개):
                </TextBox>
                <View style={styles.featuresList}>
                  {platformFeatures.slice(0, 20).map((feature, index) => (
                    <TextBox
                      key={index}
                      variant="body4"
                      color={theme.textSecondary}
                    >
                      • {feature}
                    </TextBox>
                  ))}
                  {platformFeatures.length > 20 && (
                    <TextBox variant="body4" color={theme.textSecondary}>
                      ... 외 {platformFeatures.length - 20}개
                    </TextBox>
                  )}
                </View>
              </View>
            )}
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
              {`// 1. 기본 디바이스 정보
import * as Device from 'expo-device';

const manufacturer = Device.manufacturer; // "Apple", "Google"
const brand = Device.brand; // "Apple", "google"
const modelName = Device.modelName; // "iPhone XS", "Pixel 2"
const modelId = Device.modelId; // "iPhone7,2" (iOS only)
const deviceName = Device.deviceName; // "Vivian's iPhone"
const isDevice = Device.isDevice; // true/false

// 2. OS 정보
const osName = Device.osName; // "iOS", "Android"
const osVersion = Device.osVersion; // "12.3.1", "9"
const osBuildId = Device.osBuildId; // "16F203", "PSR1.180720.075"
const platformApiLevel = Device.platformApiLevel; // Android SDK version

// 3. 하드웨어 정보
const totalMemory = Device.totalMemory; // bytes
const supportedCpuArchitectures = Device.supportedCpuArchitectures;
// ['arm64-v8a', 'armeabi-v7a']

// 4. 디바이스 타입
const deviceType = Device.deviceType;
// DeviceType.PHONE, DeviceType.TABLET, DeviceType.TV, etc.

// 5. 비동기 메서드
const deviceTypeAsync = await Device.getDeviceTypeAsync();
const maxMemory = await Device.getMaxMemoryAsync(); // Java VM 최대 메모리
const uptime = await Device.getUptimeAsync(); // 밀리초

// 6. 플랫폼 기능 (Android)
const features = await Device.getPlatformFeaturesAsync();
// ['android.hardware.touchscreen', 'android.hardware.sensor.accelerometer']

const hasFeature = await Device.hasPlatformFeatureAsync(
  'android.hardware.touchscreen'
);

// 7. 루팅/탈옥 감지 (실험적)
const isRooted = await Device.isRootedExperimentalAsync();

// 8. 사이드로딩 확인 (Android)
const isSideLoadingEnabled = await Device.isSideLoadingEnabledAsync();`}
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
              • 일부 속성은 플랫폼별로 null 반환 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 웹에서는 대부분 null 반환
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 디바이스 타입은 화면 크기로 판단 (Android, 정확하지 않을 수
              있음)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 루팅/탈옥 감지는 실험적이며 완벽하지 않음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS 16+: deviceName은 권한 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 플랫폼 기능은 Android에서만 사용 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: 업타임은 딥 슬립 시간 미포함
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
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  archList: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 4,
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
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    minWidth: 100,
  },
  featuresContainer: {
    marginTop: 12,
    gap: 8,
  },
  listTitle: {
    marginBottom: 8,
  },
  featuresList: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 4,
    maxHeight: 300,
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
