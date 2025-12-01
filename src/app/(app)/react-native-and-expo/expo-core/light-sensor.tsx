import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert, Platform } from 'react-native';

import { LightSensor } from 'expo-sensors';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function LightSensorScreen() {
  const { theme } = useTheme();

  // State
  const [illuminance, setIlluminance] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [subscription, setSubscription] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<string>('확인 중...');
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(100);
  const [listenerCount, setListenerCount] = useState(0);

  useEffect(() => {
    checkAvailability();
    checkPermissions();
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (subscription) {
      const interval = setInterval(() => {
        setListenerCount(LightSensor.getListenerCount());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [subscription]);

  const checkAvailability = async () => {
    try {
      const available = await LightSensor.isAvailableAsync();
      setIsAvailable(available);
    } catch (error: any) {
      Alert.alert('오류', `센서 가용성 확인 실패: ${error.message || error}`);
      setIsAvailable(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const result = await LightSensor.getPermissionsAsync();
      setPermissionStatus(
        result.granted
          ? '허용됨'
          : result.status === 'denied'
            ? '거부됨'
            : '미결정'
      );
      setCanAskAgain(result.canAskAgain);
    } catch (error: any) {
      Alert.alert('오류', `권한 확인 실패: ${error.message || error}`);
      setPermissionStatus('오류');
    }
  };

  const requestPermissions = async () => {
    try {
      const result = await LightSensor.requestPermissionsAsync();
      setPermissionStatus(
        result.granted
          ? '허용됨'
          : result.status === 'denied'
            ? '거부됨'
            : '미결정'
      );
      setCanAskAgain(result.canAskAgain);

      if (!result.granted) {
        if (!result.canAskAgain) {
          Alert.alert(
            '권한 필요',
            '조도 센서 권한이 필요합니다. 앱 설정에서 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' },
              {
                text: '설정 열기',
                onPress: () => {
                  // Linking.openSettings() 사용 가능
                },
              },
            ]
          );
        } else {
          Alert.alert('권한 필요', '조도 센서 권한이 필요합니다.');
        }
      }
    } catch (error: any) {
      Alert.alert('오류', `권한 요청 실패: ${error.message || error}`);
    }
  };

  const subscribe = () => {
    if (!isAvailable) {
      Alert.alert('오류', '조도 센서를 사용할 수 없습니다.');
      return;
    }

    try {
      const sub = LightSensor.addListener((data) => {
        setIlluminance(data.illuminance);
        setTimestamp(data.timestamp);
      });
      setSubscription(sub);
      setListenerCount(LightSensor.getListenerCount());
    } catch (error: any) {
      Alert.alert('오류', `구독 실패: ${error.message || error}`);
    }
  };

  const unsubscribe = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
      setIlluminance(0);
      setTimestamp(0);
      setListenerCount(LightSensor.getListenerCount());
    }
  };

  const setUpdateIntervalMs = (ms: number) => {
    try {
      LightSensor.setUpdateInterval(ms);
      setUpdateInterval(ms);
      Alert.alert('성공', `업데이트 간격: ${ms}ms`);
    } catch (error: any) {
      Alert.alert('오류', `간격 설정 실패: ${error.message || error}`);
    }
  };

  const getIlluminanceLevel = (lux: number) => {
    if (lux < 1) return { level: '어두움', color: theme.textSecondary };
    if (lux < 10) return { level: '매우 어두움', color: theme.textSecondary };
    if (lux < 100) return { level: '어두움', color: theme.warning };
    if (lux < 1000) return { level: '보통', color: theme.text };
    if (lux < 10000) return { level: '밝음', color: theme.success };
    return { level: '매우 밝음', color: theme.success };
  };

  const formatTimestamp = (ts: number) => {
    if (ts === 0) return 'N/A';
    return new Date(ts * 1000).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="LightSensor" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          LightSensor
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          조도 센서 (Android 전용)
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
              ⚠️ LightSensor는 Android에서만 사용 가능합니다.
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
              LightSensor API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 주변 조도(illuminance) 측정
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 단위: lux (lx)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Android 2.3 (API Level 9) 이상 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • iOS에서는 사용 불가
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 자동 밝기 조절 등에 활용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 업데이트 간격 설정 가능
            </TextBox>
          </View>
        </View>

        {/* 센서 상태 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📊 센서 상태
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                사용 가능:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  isAvailable === null
                    ? theme.textSecondary
                    : isAvailable
                      ? theme.success
                      : theme.error
                }
              >
                {isAvailable === null
                  ? '확인 중...'
                  : isAvailable
                    ? '✅ 사용 가능'
                    : '❌ 사용 불가'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                권한 상태:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  permissionStatus === '허용됨'
                    ? theme.success
                    : permissionStatus === '거부됨'
                      ? theme.error
                      : theme.warning
                }
              >
                {permissionStatus}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                구독 상태:
              </TextBox>
              <TextBox
                variant="body3"
                color={subscription ? theme.success : theme.text}
              >
                {subscription ? '✅ 구독 중' : '❌ 구독 안 함'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                리스너 수:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {listenerCount}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                업데이트 간격:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {updateInterval}ms
              </TextBox>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="가용성 확인"
              onPress={checkAvailability}
              variant="ghost"
              style={styles.button}
            />
            <CustomButton
              title="권한 확인"
              onPress={checkPermissions}
              variant="ghost"
              style={styles.button}
            />
          </View>

          {permissionStatus !== '허용됨' && (
            <CustomButton
              title={
                !canAskAgain && permissionStatus === '거부됨'
                  ? '앱 설정 열기'
                  : '권한 요청'
              }
              onPress={requestPermissions}
              style={styles.button}
              disabled={Platform.OS !== 'android'}
            />
          )}
        </View>

        {/* 조도 측정 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💡 조도 측정
          </TextBox>

          <View style={styles.measurementContainer}>
            <View style={styles.illuminanceDisplay}>
              <TextBox variant="title1" color={theme.text} style={styles.value}>
                {illuminance.toFixed(2)}
              </TextBox>
              <TextBox variant="body2" color={theme.textSecondary}>
                lx (lux)
              </TextBox>
            </View>

            {(() => {
              const { level, color } = getIlluminanceLevel(illuminance);
              return (
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: color + '20', borderColor: color },
                  ]}
                >
                  <TextBox variant="body2" color={color}>
                    {level}
                  </TextBox>
                </View>
              );
            })()}

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                타임스탬프:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {formatTimestamp(timestamp)}
              </TextBox>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title={subscription ? '구독 해제' : '구독 시작'}
              onPress={subscription ? unsubscribe : subscribe}
              style={styles.button}
              disabled={
                !isAvailable ||
                permissionStatus !== '허용됨' ||
                Platform.OS !== 'android'
              }
            />
          </View>
        </View>

        {/* 업데이트 간격 설정 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚙️ 업데이트 간격 설정
          </TextBox>

          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            Android 12 (API 31) 이상에서는 최소 200ms 제한이 있습니다. 더 빠른
            업데이트가 필요하면 HIGH_SAMPLING_RATE_SENSORS 권한이 필요합니다.
          </TextBox>

          <View style={styles.intervalButtons}>
            <CustomButton
              title="16ms (빠름)"
              onPress={() => setUpdateIntervalMs(16)}
              variant={updateInterval === 16 ? 'primary' : 'ghost'}
              style={styles.intervalButton}
              disabled={Platform.OS !== 'android'}
            />
            <CustomButton
              title="100ms"
              onPress={() => setUpdateIntervalMs(100)}
              variant={updateInterval === 100 ? 'primary' : 'ghost'}
              style={styles.intervalButton}
              disabled={Platform.OS !== 'android'}
            />
            <CustomButton
              title="200ms"
              onPress={() => setUpdateIntervalMs(200)}
              variant={updateInterval === 200 ? 'primary' : 'ghost'}
              style={styles.intervalButton}
              disabled={Platform.OS !== 'android'}
            />
            <CustomButton
              title="500ms"
              onPress={() => setUpdateIntervalMs(500)}
              variant={updateInterval === 500 ? 'primary' : 'ghost'}
              style={styles.intervalButton}
              disabled={Platform.OS !== 'android'}
            />
            <CustomButton
              title="1000ms (느림)"
              onPress={() => setUpdateIntervalMs(1000)}
              variant={updateInterval === 1000 ? 'primary' : 'ghost'}
              style={styles.intervalButton}
              disabled={Platform.OS !== 'android'}
            />
          </View>
        </View>

        {/* 조도 레벨 참고 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📖 조도 레벨 참고
          </TextBox>

          <View style={styles.referenceContainer}>
            <View style={styles.referenceItem}>
              <TextBox variant="body3" color={theme.text}>
                매우 어두움:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                &lt; 1 lx
              </TextBox>
            </View>
            <View style={styles.referenceItem}>
              <TextBox variant="body3" color={theme.text}>
                어두움:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                1 - 10 lx
              </TextBox>
            </View>
            <View style={styles.referenceItem}>
              <TextBox variant="body3" color={theme.text}>
                보통:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                10 - 100 lx
              </TextBox>
            </View>
            <View style={styles.referenceItem}>
              <TextBox variant="body3" color={theme.text}>
                밝음:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                100 - 1,000 lx
              </TextBox>
            </View>
            <View style={styles.referenceItem}>
              <TextBox variant="body3" color={theme.text}>
                매우 밝음:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                1,000 - 10,000 lx
              </TextBox>
            </View>
            <View style={styles.referenceItem}>
              <TextBox variant="body3" color={theme.text}>
                직사광선:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                &gt; 10,000 lx
              </TextBox>
            </View>
          </View>
        </View>

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
              {`// 1. 기본 사용
import { useState, useEffect } from 'react';
import { LightSensor } from 'expo-sensors';

export default function App() {
  const [{ illuminance }, setData] = useState({ illuminance: 0 });
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const sub = LightSensor.addListener((data) => {
      setData(data);
    });
    setSubscription(sub);

    return () => {
      sub.remove();
    };
  }, []);

  return <Text>조도: {illuminance} lx</Text>;
}

// 2. 센서 가용성 확인
const isAvailable = await LightSensor.isAvailableAsync();
if (!isAvailable) {
  console.log('조도 센서를 사용할 수 없습니다.');
}

// 3. 권한 확인 및 요청
const permission = await LightSensor.getPermissionsAsync();
if (!permission.granted) {
  const result = await LightSensor.requestPermissionsAsync();
  if (!result.granted) {
    console.log('권한이 거부되었습니다.');
  }
}

// 4. 업데이트 간격 설정
LightSensor.setUpdateInterval(100); // 100ms

// 5. 구독 관리
const subscription = LightSensor.addListener((data) => {
  console.log('조도:', data.illuminance, 'lx');
  console.log('타임스탬프:', data.timestamp);
});

// 나중에 구독 해제
subscription.remove();

// 6. 모든 리스너 제거
LightSensor.removeAllListeners();

// 7. 리스너 수 확인
const count = LightSensor.getListenerCount();
console.log('활성 리스너 수:', count);

// 8. 리스너 존재 여부 확인
const hasListeners = LightSensor.hasListeners();
console.log('리스너 존재:', hasListeners);

// 9. 조건부 구독
useEffect(() => {
  let subscription: any = null;

  const startListening = async () => {
    const available = await LightSensor.isAvailableAsync();
    if (available) {
      subscription = LightSensor.addListener((data) => {
        setIlluminance(data.illuminance);
      });
    }
  };

  startListening();

  return () => {
    if (subscription) {
      subscription.remove();
    }
  };
}, []);

// 10. 자동 밝기 조절 예제
useEffect(() => {
  const sub = LightSensor.addListener((data) => {
    const { illuminance } = data;
    
    if (illuminance < 10) {
      // 어두운 환경: 밝기 낮춤
      setBrightness(0.3);
    } else if (illuminance < 100) {
      // 보통 환경: 밝기 중간
      setBrightness(0.6);
    } else {
      // 밝은 환경: 밝기 높임
      setBrightness(1.0);
    }
  });

  return () => sub.remove();
}, []);`}
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
              • Android 전용 (iOS에서는 사용 불가)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android 2.3 (API Level 9) 이상 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 모든 기기에 조도 센서가 있는 것은 아님
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android 12 (API 31) 이상: 최소 200ms 업데이트 간격 제한
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 200ms 미만 간격: HIGH_SAMPLING_RATE_SENSORS 권한 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 배터리 소모에 주의 (빠른 업데이트 간격 사용 시)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 컴포넌트 언마운트 시 구독 해제 필수
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 조도 값은 기기마다 다를 수 있음 (보정 필요 가능)
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
  description: {
    marginBottom: 12,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  measurementContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    alignItems: 'center',
    gap: 16,
  },
  illuminanceDisplay: {
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  intervalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intervalButton: {
    flex: 1,
    minWidth: '30%',
  },
  referenceContainer: {
    marginTop: 12,
    gap: 12,
  },
  referenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
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
