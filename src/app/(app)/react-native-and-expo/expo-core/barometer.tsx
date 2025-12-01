import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';

import { Barometer, BarometerMeasurement } from 'expo-sensors';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function BarometerScreen() {
  const { theme } = useTheme();
  const [data, setData] = useState<BarometerMeasurement>({
    pressure: 0,
    relativeAltitude: undefined,
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
      const available = await Barometer.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      setIsAvailable(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const { status } = await Barometer.getPermissionsAsync();
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
      const { status } = await Barometer.requestPermissionsAsync();
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
    const sub = Barometer.addListener((barometerData) => {
      setData(barometerData);
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
    Barometer.setUpdateInterval(1000);
    setUpdateInterval(1000);
  };

  const setFast = () => {
    Barometer.setUpdateInterval(16);
    setUpdateInterval(16);
  };

  const setNormal = () => {
    Barometer.setUpdateInterval(100);
    setUpdateInterval(100);
  };

  // 압력 값에 따른 색상 결정 (일반적인 해수면 기압: 1013.25 hPa)
  const getPressureColor = (pressure: number) => {
    const normalPressure = 1013.25;
    const diff = Math.abs(pressure - normalPressure);
    if (diff < 10) return theme.success; // 정상 범위
    if (diff < 30) return theme.warning; // 주의
    return theme.error; // 비정상
  };

  // 압력 상태 설명
  const getPressureStatus = (pressure: number) => {
    const normalPressure = 1013.25;
    const diff = pressure - normalPressure;
    if (Math.abs(diff) < 10) return '정상';
    if (diff > 0) return '고기압';
    return '저기압';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Barometer" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Barometer
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          기기의 기압계 센서를 사용한 대기압 측정
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
              Barometer (기압계)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 대기압을 측정하는 센서
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 압력 단위: hectopascals (hPa)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 해수면 평균 기압: 약 1013.25 hPa
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 날씨 예측, 고도 측정 등에 활용
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
              • pressure: 대기압 (hPa 단위)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • relativeAltitude: 상대 고도 (m 단위, iOS만 지원)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 고기압: 날씨가 맑음, 저기압: 비나 눈 예상
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.conceptText}
            >
              ⚠️ Web에서는 사용 불가
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

        {/* 기압 데이터 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📈 기압 데이터
          </TextBox>

          <View style={styles.dataContainer}>
            <View style={styles.pressureRow}>
              <TextBox variant="body2" color={theme.textSecondary}>
                대기압:
              </TextBox>
              <View style={styles.pressureValueContainer}>
                <TextBox
                  variant="title1"
                  color={getPressureColor(data.pressure)}
                  style={styles.pressureValue}
                >
                  {data.pressure.toFixed(2)} hPa
                </TextBox>
                <TextBox
                  variant="body4"
                  color={getPressureColor(data.pressure)}
                  style={styles.pressureStatus}
                >
                  ({getPressureStatus(data.pressure)})
                </TextBox>
              </View>
            </View>

            {Platform.OS === 'ios' && data.relativeAltitude !== undefined && (
              <View style={styles.altitudeRow}>
                <TextBox variant="body2" color={theme.textSecondary}>
                  상대 고도:
                </TextBox>
                <TextBox
                  variant="body1"
                  color={theme.text}
                  style={styles.altitudeValue}
                >
                  {data.relativeAltitude.toFixed(2)} m
                </TextBox>
              </View>
            )}

            {Platform.OS !== 'ios' && (
              <View style={styles.altitudeRow}>
                <TextBox variant="body4" color={theme.textSecondary}>
                  상대 고도: iOS에서만 사용 가능
                </TextBox>
              </View>
            )}

            <View style={styles.timestampRow}>
              <TextBox variant="body4" color={theme.textSecondary}>
                타임스탬프:{' '}
                {data.timestamp
                  ? new Date(data.timestamp * 1000).toLocaleTimeString()
                  : '-'}
              </TextBox>
            </View>

            {/* 참고 정보 */}
            <View style={styles.referenceContainer}>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.referenceText}
              >
                💡 참고: 해수면 평균 기압은 약 1013.25 hPa입니다.
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
              {`import { useState } from 'react';
import { Barometer } from 'expo-sensors';
import { Platform } from 'react-native';

export default function App() {
  const [{ pressure, relativeAltitude }, setData] = useState({
    pressure: 0,
    relativeAltitude: 0,
  });
  const [subscription, setSubscription] = useState(null);

  const subscribe = () => {
    setSubscription(
      Barometer.addListener(setData)
    );
  };

  const unsubscribe = () => {
    subscription?.remove();
    setSubscription(null);
  };

  return (
    <View>
      <Text>Pressure: {pressure} hPa</Text>
      {Platform.OS === 'ios' && (
        <Text>Relative Altitude: {relativeAltitude} m</Text>
      )}
      <Button
        title={subscription ? 'Stop' : 'Start'}
        onPress={subscription ? unsubscribe : subscribe}
      />
    </View>
  );
}

// 업데이트 간격 설정
Barometer.setUpdateInterval(100); // 100ms마다 업데이트

// 센서 사용 가능 여부 확인
const isAvailable = await Barometer.isAvailableAsync();

// 권한 확인 및 요청
const { status } = await Barometer.getPermissionsAsync();
if (status !== 'granted') {
  await Barometer.requestPermissionsAsync();
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
              • 상대 고도는 iOS에서만 제공됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Web에서는 사용 불가 (UnavailabilityError 발생)
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
  pressureRow: {
    gap: 8,
  },
  pressureValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  pressureValue: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  pressureStatus: {
    fontStyle: 'italic',
  },
  altitudeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  altitudeValue: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  timestampRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  referenceContainer: {
    marginTop: 12,
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  referenceText: {
    lineHeight: 18,
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
