import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Gyroscope, GyroscopeMeasurement } from 'expo-sensors';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function GyroscopeScreen() {
  const { theme } = useTheme();

  const [data, setData] = useState<GyroscopeMeasurement>({
    x: 0,
    y: 0,
    z: 0,
    timestamp: 0,
  });
  const [subscription, setSubscription] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<string>('확인 중...');
  const [updateInterval, setUpdateInterval] = useState(100);

  useEffect(() => {
    checkAvailability();
    checkPermissions();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await Gyroscope.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      setIsAvailable(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const { status } = await Gyroscope.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      setPermissionStatus('오류');
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Gyroscope.requestPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      setPermissionStatus('오류');
    }
  };

  const subscribe = () => {
    if (subscription) {
      return;
    }

    const sub = Gyroscope.addListener((gyroscopeData) => {
      setData(gyroscopeData);
    });

    setSubscription(sub);
  };

  const unsubscribe = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  const setSlowInterval = () => {
    Gyroscope.setUpdateInterval(1000);
    setUpdateInterval(1000);
  };

  const setFastInterval = () => {
    Gyroscope.setUpdateInterval(16);
    setUpdateInterval(16);
  };

  const setCustomInterval = (ms: number) => {
    Gyroscope.setUpdateInterval(ms);
    setUpdateInterval(ms);
  };

  const formatValue = (value: number) => {
    return value.toFixed(4);
  };

  const formatRadToDeg = (rad: number) => {
    return (rad * (180 / Math.PI)).toFixed(2);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Gyroscope" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Gyroscope
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          기기의 자이로스코프 센서를 사용한 3차원 회전 측정
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
              Gyroscope API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 3차원 공간에서의 회전 속도 측정
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 단위: rad/s (초당 라디안)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • X축: 좌우 회전 (Yaw)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Y축: 앞뒤 회전 (Pitch)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Z축: 좌우 기울임 (Roll)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 가속도계와 함께 사용하여 정확한 방향 추적
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
            📊 상태 정보
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                사용 가능:
              </TextBox>
              <TextBox
                variant="body3"
                color={isAvailable ? theme.success : theme.error}
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
                  permissionStatus === 'granted'
                    ? theme.success
                    : permissionStatus === 'denied'
                      ? theme.error
                      : theme.warning
                }
              >
                {permissionStatus === 'granted'
                  ? '✅ 허용됨'
                  : permissionStatus === 'denied'
                    ? '❌ 거부됨'
                    : permissionStatus === 'undetermined'
                      ? '⏳ 미결정'
                      : permissionStatus}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                구독 상태:
              </TextBox>
              <TextBox
                variant="body3"
                color={subscription ? theme.success : theme.textSecondary}
              >
                {subscription ? '✅ 활성' : '❌ 비활성'}
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

          {permissionStatus !== 'granted' && (
            <CustomButton
              title="권한 요청"
              onPress={requestPermissions}
              style={styles.button}
            />
          )}
        </View>

        {/* 제어 버튼 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎮 제어
          </TextBox>

          <View style={styles.buttonRow}>
            <CustomButton
              title={subscription ? '구독 해제' : '구독 시작'}
              onPress={subscription ? unsubscribe : subscribe}
              variant={subscription ? 'ghost' : 'primary'}
              style={styles.button}
              disabled={!isAvailable || permissionStatus !== 'granted'}
            />
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="느리게 (1초)"
              onPress={setSlowInterval}
              variant="ghost"
              style={styles.button}
            />
            <CustomButton
              title="빠르게 (16ms)"
              onPress={setFastInterval}
              variant="ghost"
              style={styles.button}
            />
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="100ms"
              onPress={() => setCustomInterval(100)}
              variant="ghost"
              style={styles.button}
            />
            <CustomButton
              title="200ms"
              onPress={() => setCustomInterval(200)}
              variant="ghost"
              style={styles.button}
            />
            <CustomButton
              title="500ms"
              onPress={() => setCustomInterval(500)}
              variant="ghost"
              style={styles.button}
            />
          </View>
        </View>

        {/* 센서 데이터 */}
        {subscription && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📈 센서 데이터
            </TextBox>

            <View style={styles.dataContainer}>
              <View style={styles.dataRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  X축 (Yaw):
                </TextBox>
                <View style={styles.valueContainer}>
                  <TextBox variant="body2" color={theme.text}>
                    {formatValue(data.x)} rad/s
                  </TextBox>
                  <TextBox variant="body4" color={theme.textSecondary}>
                    ({formatRadToDeg(data.x)}°/s)
                  </TextBox>
                </View>
              </View>

              <View style={styles.dataRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  Y축 (Pitch):
                </TextBox>
                <View style={styles.valueContainer}>
                  <TextBox variant="body2" color={theme.text}>
                    {formatValue(data.y)} rad/s
                  </TextBox>
                  <TextBox variant="body4" color={theme.textSecondary}>
                    ({formatRadToDeg(data.y)}°/s)
                  </TextBox>
                </View>
              </View>

              <View style={styles.dataRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  Z축 (Roll):
                </TextBox>
                <View style={styles.valueContainer}>
                  <TextBox variant="body2" color={theme.text}>
                    {formatValue(data.z)} rad/s
                  </TextBox>
                  <TextBox variant="body4" color={theme.textSecondary}>
                    ({formatRadToDeg(data.z)}°/s)
                  </TextBox>
                </View>
              </View>

              <View style={styles.dataRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  타임스탬프:
                </TextBox>
                <TextBox variant="body4" color={theme.textSecondary}>
                  {data.timestamp.toFixed(3)}s
                </TextBox>
              </View>
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
              {`// 1. 기본 사용
import { Gyroscope } from 'expo-sensors';

const [{ x, y, z }, setData] = useState({
  x: 0,
  y: 0,
  z: 0,
});

const subscription = Gyroscope.addListener((gyroscopeData) => {
  setData(gyroscopeData);
});

// 2. 구독 해제
subscription.remove();

// 3. 업데이트 간격 설정
Gyroscope.setUpdateInterval(100); // 100ms

// 4. 사용 가능 여부 확인
const isAvailable = await Gyroscope.isAvailableAsync();

// 5. 권한 확인 및 요청
const { status } = await Gyroscope.getPermissionsAsync();
if (status !== 'granted') {
  await Gyroscope.requestPermissionsAsync();
}

// 6. 라디안을 도로 변환
const radToDeg = (rad) => rad * (180 / Math.PI);
const degPerSec = radToDeg(x); // 초당 도

// 7. 가속도계와 함께 사용
import { Accelerometer, Gyroscope } from 'expo-sensors';

// 두 센서를 함께 사용하여 정확한 방향 추적
const accelSub = Accelerometer.addListener((accelData) => {
  // 가속도 데이터
});

const gyroSub = Gyroscope.addListener((gyroData) => {
  // 자이로스코프 데이터
});

// 8. 모든 리스너 제거
Gyroscope.removeAllListeners();`}
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
              • 웹: 사용자 액션(버튼 클릭) 후에만 호출 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android 12+: 최소 업데이트 간격 200ms
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 200ms 미만 간격은 HIGH_SAMPLING_RATE_SENSORS 권한 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 웹: HTTPS 또는 localhost에서만 동작
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 웹: Safari 설정에서 Motion & Orientation Access 활성화 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 단위는 rad/s (초당 라디안)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 가속도계와 함께 사용하면 더 정확한 방향 추적 가능
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
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  dataContainer: {
    marginTop: 12,
    gap: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  valueContainer: {
    alignItems: 'flex-end',
    gap: 4,
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
