import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert, Platform } from 'react-native';

import { Magnetometer } from 'expo-sensors';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function MagnetometerScreen() {
  const { theme } = useTheme();

  // State
  const [magnetometerData, setMagnetometerData] = useState({
    x: 0,
    y: 0,
    z: 0,
    timestamp: 0,
  });
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
        setListenerCount(Magnetometer.getListenerCount());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [subscription]);

  const checkAvailability = async () => {
    try {
      const available = await Magnetometer.isAvailableAsync();
      setIsAvailable(available);
    } catch (error: any) {
      Alert.alert('오류', `센서 가용성 확인 실패: ${error.message || error}`);
      setIsAvailable(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const result = await Magnetometer.getPermissionsAsync();
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
      const result = await Magnetometer.requestPermissionsAsync();
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
            '자기장 센서 권한이 필요합니다. 앱 설정에서 권한을 허용해주세요.',
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
          Alert.alert('권한 필요', '자기장 센서 권한이 필요합니다.');
        }
      }
    } catch (error: any) {
      Alert.alert('오류', `권한 요청 실패: ${error.message || error}`);
    }
  };

  const subscribe = () => {
    if (!isAvailable) {
      Alert.alert('오류', '자기장 센서를 사용할 수 없습니다.');
      return;
    }

    try {
      const sub = Magnetometer.addListener((data) => {
        setMagnetometerData(data);
      });
      setSubscription(sub);
      setListenerCount(Magnetometer.getListenerCount());
    } catch (error: any) {
      Alert.alert('오류', `구독 실패: ${error.message || error}`);
    }
  };

  const unsubscribe = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
      setMagnetometerData({ x: 0, y: 0, z: 0, timestamp: 0 });
      setListenerCount(Magnetometer.getListenerCount());
    }
  };

  const setUpdateIntervalMs = (ms: number) => {
    try {
      Magnetometer.setUpdateInterval(ms);
      setUpdateInterval(ms);
      Alert.alert('성공', `업데이트 간격: ${ms}ms`);
    } catch (error: any) {
      Alert.alert('오류', `간격 설정 실패: ${error.message || error}`);
    }
  };

  const calculateMagnitude = (x: number, y: number, z: number): number => {
    return Math.sqrt(x * x + y * y + z * z);
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

  const magnitude = calculateMagnitude(
    magnetometerData.x,
    magnetometerData.y,
    magnetometerData.z
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Magnetometer" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Magnetometer
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          자기장 센서 (마이크로테슬라)
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
              Magnetometer API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 자기장 강도 측정 (마이크로테슬라, μT)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • X, Y, Z 축 자기장 값
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 지구 자기장: 약 25-65 μT
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 나침반, 금속 탐지 등에 활용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Android 2.3 (API 9), iOS 8 이상 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 업데이트 간격 설정 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • MagnetometerUncalibrated: 보정되지 않은 원시 값
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
            />
          )}
        </View>

        {/* 자기장 측정 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🧲 자기장 측정
          </TextBox>

          <View style={styles.measurementContainer}>
            <View style={styles.axisContainer}>
              <View style={styles.axisItem}>
                <TextBox variant="title3" color={theme.primary}>
                  X
                </TextBox>
                <TextBox variant="title2" color={theme.text}>
                  {magnetometerData.x.toFixed(2)}
                </TextBox>
                <TextBox variant="body4" color={theme.textSecondary}>
                  μT
                </TextBox>
              </View>

              <View style={styles.axisItem}>
                <TextBox variant="title3" color={theme.primary}>
                  Y
                </TextBox>
                <TextBox variant="title2" color={theme.text}>
                  {magnetometerData.y.toFixed(2)}
                </TextBox>
                <TextBox variant="body4" color={theme.textSecondary}>
                  μT
                </TextBox>
              </View>

              <View style={styles.axisItem}>
                <TextBox variant="title3" color={theme.primary}>
                  Z
                </TextBox>
                <TextBox variant="title2" color={theme.text}>
                  {magnetometerData.z.toFixed(2)}
                </TextBox>
                <TextBox variant="body4" color={theme.textSecondary}>
                  μT
                </TextBox>
              </View>
            </View>

            <View
              style={[
                styles.magnitudeCard,
                { backgroundColor: theme.background },
              ]}
            >
              <TextBox variant="body2" color={theme.text}>
                총 자기장 강도:
              </TextBox>
              <TextBox variant="title1" color={theme.primary}>
                {magnitude.toFixed(2)} μT
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                지구 자기장: 약 25-65 μT
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                타임스탬프:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {formatTimestamp(magnetometerData.timestamp)}
              </TextBox>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title={subscription ? '구독 해제' : '구독 시작'}
              onPress={subscription ? unsubscribe : subscribe}
              style={styles.button}
              disabled={!isAvailable || permissionStatus !== '허용됨'}
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
            />
            <CustomButton
              title="100ms"
              onPress={() => setUpdateIntervalMs(100)}
              variant={updateInterval === 100 ? 'primary' : 'ghost'}
              style={styles.intervalButton}
            />
            <CustomButton
              title="200ms"
              onPress={() => setUpdateIntervalMs(200)}
              variant={updateInterval === 200 ? 'primary' : 'ghost'}
              style={styles.intervalButton}
            />
            <CustomButton
              title="500ms"
              onPress={() => setUpdateIntervalMs(500)}
              variant={updateInterval === 500 ? 'primary' : 'ghost'}
              style={styles.intervalButton}
            />
            <CustomButton
              title="1000ms (느림)"
              onPress={() => setUpdateIntervalMs(1000)}
              variant={updateInterval === 1000 ? 'primary' : 'ghost'}
              style={styles.intervalButton}
            />
          </View>
        </View>

        {/* 자기장 참고 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📖 자기장 참고 정보
          </TextBox>

          <View style={styles.referenceContainer}>
            <View style={styles.referenceItem}>
              <TextBox variant="body3" color={theme.text}>
                지구 자기장:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                약 25-65 μT
              </TextBox>
            </View>
            <View style={styles.referenceItem}>
              <TextBox variant="body3" color={theme.text}>
                냉장고 자석:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                약 5-50 mT (5,000-50,000 μT)
              </TextBox>
            </View>
            <View style={styles.referenceItem}>
              <TextBox variant="body3" color={theme.text}>
                MRI 기기:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                약 1.5-3 T (1,500,000-3,000,000 μT)
              </TextBox>
            </View>
            <View style={styles.referenceItem}>
              <TextBox variant="body3" color={theme.text}>
                일반 가전제품:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                약 0.1-10 mT (100-10,000 μT)
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
import { Magnetometer } from 'expo-sensors';

export default function App() {
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const sub = Magnetometer.addListener((data) => {
      setData(data);
    });
    setSubscription(sub);

    return () => {
      sub.remove();
    };
  }, []);

  return (
    <View>
      <Text>X: {x} μT</Text>
      <Text>Y: {y} μT</Text>
      <Text>Z: {z} μT</Text>
    </View>
  );
}

// 2. 센서 가용성 확인
const isAvailable = await Magnetometer.isAvailableAsync();
if (!isAvailable) {
  console.log('자기장 센서를 사용할 수 없습니다.');
}

// 3. 권한 확인 및 요청
const permission = await Magnetometer.getPermissionsAsync();
if (!permission.granted) {
  const result = await Magnetometer.requestPermissionsAsync();
  if (!result.granted) {
    console.log('권한이 거부되었습니다.');
  }
}

// 4. 업데이트 간격 설정
Magnetometer.setUpdateInterval(100); // 100ms

// 5. 구독 관리
const subscription = Magnetometer.addListener((data) => {
  console.log('X:', data.x, 'μT');
  console.log('Y:', data.y, 'μT');
  console.log('Z:', data.z, 'μT');
  console.log('타임스탬프:', data.timestamp);
});

// 나중에 구독 해제
subscription.remove();

// 6. 모든 리스너 제거
Magnetometer.removeAllListeners();

// 7. 리스너 수 확인
const count = Magnetometer.getListenerCount();
console.log('활성 리스너 수:', count);

// 8. 리스너 존재 여부 확인
const hasListeners = Magnetometer.hasListeners();
console.log('리스너 존재:', hasListeners);

// 9. 자기장 강도 계산
const magnitude = Math.sqrt(x * x + y * y + z * z);
console.log('총 자기장 강도:', magnitude, 'μT');

// 10. 나침반 방향 계산
const heading = Math.atan2(y, x) * (180 / Math.PI);
const normalizedHeading = (heading + 360) % 360;
console.log('방향:', normalizedHeading, '도');

// 11. 조건부 구독
useEffect(() => {
  let subscription: any = null;

  const startListening = async () => {
    const available = await Magnetometer.isAvailableAsync();
    if (available) {
      subscription = Magnetometer.addListener((data) => {
        setMagnetometerData(data);
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

// 12. 금속 탐지 예제
useEffect(() => {
  const sub = Magnetometer.addListener((data) => {
    const magnitude = Math.sqrt(
      data.x * data.x + data.y * data.y + data.z * data.z
    );
    
    // 지구 자기장보다 크면 금속 탐지
    if (magnitude > 100) {
      console.log('강한 자기장 감지! (금속 가능성)');
    }
  });

  return () => sub.remove();
}, []);

// 13. 나침반 구현
useEffect(() => {
  const sub = Magnetometer.addListener((data) => {
    // X, Y 축을 사용하여 방향 계산
    const heading = Math.atan2(data.y, data.x) * (180 / Math.PI);
    const normalizedHeading = (heading + 360) % 360;
    setCompassHeading(normalizedHeading);
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
              • Android 2.3 (API Level 9) 이상 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS 8 이상 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 모든 기기에 자기장 센서가 있는 것은 아님
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
              • 주변 금속이나 전자기기 영향 받을 수 있음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • MagnetometerUncalibrated: 보정되지 않은 원시 값 제공
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
    gap: 16,
  },
  axisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  axisItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 4,
  },
  magnitudeCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    gap: 8,
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
