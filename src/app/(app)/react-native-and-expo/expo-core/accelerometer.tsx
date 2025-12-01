import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function AccelerometerScreen() {
  const { theme } = useTheme();
  const [data, setData] = useState<AccelerometerMeasurement>({
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
      const available = await Accelerometer.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      setIsAvailable(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const { status } = await Accelerometer.getPermissionsAsync();
      setPermissionStatus(
        status === 'granted'
          ? '허용됨'
          : status === 'denied'
            ? '거부됨'
            : '확인 필요'
      );
    } catch (error) {
      setPermissionStatus('오류 발생');
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Accelerometer.requestPermissionsAsync();
      setPermissionStatus(
        status === 'granted'
          ? '허용됨'
          : status === 'denied'
            ? '거부됨'
            : '확인 필요'
      );
    } catch (error) {
      setPermissionStatus('오류 발생');
    }
  };

  const subscribe = () => {
    const sub = Accelerometer.addListener((accelData) => {
      setData(accelData);
    });
    setSubscription(sub);
  };

  const unsubscribe = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  const setSlow = () => {
    Accelerometer.setUpdateInterval(1000);
    setUpdateInterval(1000);
  };

  const setFast = () => {
    Accelerometer.setUpdateInterval(16);
    setUpdateInterval(16);
  };

  const setNormal = () => {
    Accelerometer.setUpdateInterval(100);
    setUpdateInterval(100);
  };

  // g-force 계산 (1g = 9.81 m/s^2)
  const calculateGForce = (value: number) => {
    return Math.abs(value).toFixed(3);
  };

  const getAxisColor = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue > 0.5) return theme.error;
    if (absValue > 0.2) return theme.warning;
    return theme.text;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Accelerometer" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Accelerometer
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          기기의 가속도계 센서를 사용한 3차원 가속도 측정
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
              Accelerometer (가속도계)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 기기의 3차원 공간에서의 가속도를 측정하는 센서
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • X, Y, Z 축의 가속도 값을 g-force 단위로 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 1g = 9.81 m/s² (지구 중력 가속도)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 기기 움직임, 진동, 기울기 등을 감지
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              측정 값 의미
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • X축: 좌우 방향 가속도
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Y축: 앞뒤 방향 가속도
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Z축: 위아래 방향 가속도
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 정지 상태: Z축 ≈ 1g (중력), X/Y축 ≈ 0g
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
            📊 센서 상태
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
          </View>
        </View>

        {/* 가속도 데이터 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📈 가속도 데이터 (g-force)
          </TextBox>

          <View style={styles.dataContainer}>
            <View style={styles.axisRow}>
              <TextBox variant="body2" color={theme.textSecondary}>
                X축 (좌우):
              </TextBox>
              <TextBox
                variant="body1"
                color={getAxisColor(data.x)}
                style={styles.dataValue}
              >
                {data.x.toFixed(3)} g
              </TextBox>
            </View>

            <View style={styles.axisRow}>
              <TextBox variant="body2" color={theme.textSecondary}>
                Y축 (앞뒤):
              </TextBox>
              <TextBox
                variant="body1"
                color={getAxisColor(data.y)}
                style={styles.dataValue}
              >
                {data.y.toFixed(3)} g
              </TextBox>
            </View>

            <View style={styles.axisRow}>
              <TextBox variant="body2" color={theme.textSecondary}>
                Z축 (위아래):
              </TextBox>
              <TextBox
                variant="body1"
                color={getAxisColor(data.z)}
                style={styles.dataValue}
              >
                {data.z.toFixed(3)} g
              </TextBox>
            </View>

            <View style={styles.timestampRow}>
              <TextBox variant="body4" color={theme.textSecondary}>
                타임스탬프:{' '}
                {data.timestamp
                  ? new Date(data.timestamp * 1000).toLocaleTimeString()
                  : '-'}
              </TextBox>
            </View>
          </View>
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

          <View style={styles.controlContainer}>
            <CustomButton
              title={subscription ? '⏸ 정지' : '▶ 시작'}
              onPress={subscription ? unsubscribe : subscribe}
              style={[
                styles.button,
                {
                  backgroundColor: subscription ? theme.error : theme.success,
                },
              ]}
            />

            <View style={styles.intervalContainer}>
              <TextBox
                variant="body3"
                color={theme.textSecondary}
                style={styles.intervalLabel}
              >
                업데이트 간격: {updateInterval}ms
              </TextBox>
              <View style={styles.intervalButtons}>
                <CustomButton
                  title="느림 (1초)"
                  onPress={setSlow}
                  variant="ghost"
                  style={styles.intervalButton}
                />
                <CustomButton
                  title="보통 (100ms)"
                  onPress={setNormal}
                  variant="ghost"
                  style={styles.intervalButton}
                />
                <CustomButton
                  title="빠름 (16ms)"
                  onPress={setFast}
                  variant="ghost"
                  style={styles.intervalButton}
                />
              </View>
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
              {`import { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);

  // 업데이트 간격 설정
  const setSlow = () => Accelerometer.setUpdateInterval(1000);
  const setFast = () => Accelerometer.setUpdateInterval(16);

  // 구독 시작
  const subscribe = () => {
    setSubscription(
      Accelerometer.addListener(setData)
    );
  };

  // 구독 해제
  const unsubscribe = () => {
    subscription?.remove();
    setSubscription(null);
  };

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, []);

  return (
    <View>
      <Text>x: {x.toFixed(3)}</Text>
      <Text>y: {y.toFixed(3)}</Text>
      <Text>z: {z.toFixed(3)}</Text>
    </View>
  );
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
              • Android 12 이상에서는 200ms 이하 간격 사용 시 권한 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Web에서는 사용자 상호작용 후 권한 요청 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 센서 사용 시 배터리 소모가 증가할 수 있음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 사용 후 반드시 구독을 해제하여 메모리 누수 방지
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
  dataContainer: {
    gap: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataValue: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  timestampRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  controlContainer: {
    gap: 16,
  },
  intervalContainer: {
    gap: 8,
  },
  intervalLabel: {
    textAlign: 'center',
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalButton: {
    flex: 1,
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
