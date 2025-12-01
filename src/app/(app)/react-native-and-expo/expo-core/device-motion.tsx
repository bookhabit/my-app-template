import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';

import { DeviceMotion, DeviceMotionOrientation } from 'expo-sensors';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function DeviceMotionScreen() {
  const { theme } = useTheme();

  // State
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [updateInterval, setUpdateInterval] = useState<number>(100);
  const [motionData, setMotionData] = useState<any>(null);

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
      const available = await DeviceMotion.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      console.error('Failed to check availability:', error);
      setIsAvailable(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const perm = await DeviceMotion.getPermissionsAsync();
      setPermission(perm);
    } catch (error) {
      console.error('Failed to check permissions:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      const perm = await DeviceMotion.requestPermissionsAsync();
      setPermission(perm);
    } catch (error) {
      console.error('Failed to request permissions:', error);
    }
  };

  const subscribe = () => {
    if (subscription) {
      return;
    }

    const sub = DeviceMotion.addListener((data) => {
      setMotionData(data);
    });

    setSubscription(sub);
  };

  const unsubscribe = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
      setMotionData(null);
    }
  };

  const setSlowInterval = () => {
    DeviceMotion.setUpdateInterval(1000);
    setUpdateInterval(1000);
  };

  const setFastInterval = () => {
    DeviceMotion.setUpdateInterval(16);
    setUpdateInterval(16);
  };

  const setCustomInterval = (ms: number) => {
    DeviceMotion.setUpdateInterval(ms);
    setUpdateInterval(ms);
  };

  const getOrientationText = (orientation: number) => {
    switch (orientation) {
      case DeviceMotionOrientation.Portrait:
        return '세로 (Portrait)';
      case DeviceMotionOrientation.RightLandscape:
        return '가로 오른쪽 (Right Landscape)';
      case DeviceMotionOrientation.UpsideDown:
        return '거꾸로 (Upside Down)';
      case DeviceMotionOrientation.LeftLandscape:
        return '가로 왼쪽 (Left Landscape)';
      default:
        return `알 수 없음 (${orientation}°)`;
    }
  };

  const formatValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(3);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="DeviceMotion" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          DeviceMotion
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          디바이스 모션 및 방향 센서
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
              DeviceMotion API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 가속도: 중력 제외/포함 가속도 (m/s²)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 회전: 디바이스의 공간상 회전 (alpha, beta, gamma)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 회전 속도: 초당 회전 각도 (deg/s)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 방향: 화면 회전 상태 (0°, 90°, 180°, -90°)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 좌표계: X(좌→우), Y(하→상), Z(뒤→앞)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 중력 상수: {DeviceMotion.Gravity} m/s²
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
                  permission?.granted
                    ? theme.success
                    : permission?.status === 'denied'
                      ? theme.error
                      : theme.warning
                }
              >
                {permission?.granted
                  ? '✅ 허용됨'
                  : permission?.status === 'denied'
                    ? '❌ 거부됨'
                    : permission?.status === 'undetermined'
                      ? '⏳ 미결정'
                      : '확인 중...'}
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

          {!permission?.granted && (
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
              disabled={!permission?.granted || !isAvailable}
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

        {/* 가속도 데이터 */}
        {motionData && (
          <>
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
              <TextBox
                variant="title4"
                color={theme.text}
                style={styles.sectionTitle}
              >
                📈 가속도 (중력 제외)
              </TextBox>

              {motionData.acceleration ? (
                <View style={styles.dataContainer}>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      X:
                    </TextBox>
                    <TextBox variant="body2" color={theme.text}>
                      {formatValue(motionData.acceleration.x)} m/s²
                    </TextBox>
                  </View>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Y:
                    </TextBox>
                    <TextBox variant="body2" color={theme.text}>
                      {formatValue(motionData.acceleration.y)} m/s²
                    </TextBox>
                  </View>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Z:
                    </TextBox>
                    <TextBox variant="body2" color={theme.text}>
                      {formatValue(motionData.acceleration.z)} m/s²
                    </TextBox>
                  </View>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      타임스탬프:
                    </TextBox>
                    <TextBox variant="body4" color={theme.textSecondary}>
                      {motionData.acceleration.timestamp.toFixed(3)}s
                    </TextBox>
                  </View>
                </View>
              ) : (
                <TextBox variant="body3" color={theme.textSecondary}>
                  데이터 없음
                </TextBox>
              )}
            </View>

            <View style={[styles.section, { backgroundColor: theme.surface }]}>
              <TextBox
                variant="title4"
                color={theme.text}
                style={styles.sectionTitle}
              >
                📈 가속도 (중력 포함)
              </TextBox>

              {motionData.accelerationIncludingGravity && (
                <View style={styles.dataContainer}>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      X:
                    </TextBox>
                    <TextBox variant="body2" color={theme.text}>
                      {formatValue(motionData.accelerationIncludingGravity.x)}{' '}
                      m/s²
                    </TextBox>
                  </View>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Y:
                    </TextBox>
                    <TextBox variant="body2" color={theme.text}>
                      {formatValue(motionData.accelerationIncludingGravity.y)}{' '}
                      m/s²
                    </TextBox>
                  </View>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Z:
                    </TextBox>
                    <TextBox variant="body2" color={theme.text}>
                      {formatValue(motionData.accelerationIncludingGravity.z)}{' '}
                      m/s²
                    </TextBox>
                  </View>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      타임스탬프:
                    </TextBox>
                    <TextBox variant="body4" color={theme.textSecondary}>
                      {motionData.accelerationIncludingGravity.timestamp.toFixed(
                        3
                      )}
                      s
                    </TextBox>
                  </View>
                </View>
              )}
            </View>

            {/* 회전 데이터 */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
              <TextBox
                variant="title4"
                color={theme.text}
                style={styles.sectionTitle}
              >
                🔄 회전 (Euler 각도)
              </TextBox>

              {motionData.rotation && (
                <View style={styles.dataContainer}>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Alpha (Z축):
                    </TextBox>
                    <TextBox variant="body2" color={theme.text}>
                      {formatValue(motionData.rotation.alpha)}°
                    </TextBox>
                  </View>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Beta (X축):
                    </TextBox>
                    <TextBox variant="body2" color={theme.text}>
                      {formatValue(motionData.rotation.beta)}°
                    </TextBox>
                  </View>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Gamma (Y축):
                    </TextBox>
                    <TextBox variant="body2" color={theme.text}>
                      {formatValue(motionData.rotation.gamma)}°
                    </TextBox>
                  </View>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      타임스탬프:
                    </TextBox>
                    <TextBox variant="body4" color={theme.textSecondary}>
                      {motionData.rotation.timestamp.toFixed(3)}s
                    </TextBox>
                  </View>
                </View>
              )}
            </View>

            {/* 회전 속도 */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
              <TextBox
                variant="title4"
                color={theme.text}
                style={styles.sectionTitle}
              >
                ⚡ 회전 속도
              </TextBox>

              {motionData.rotationRate ? (
                <View style={styles.dataContainer}>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Alpha (Z축):
                    </TextBox>
                    <TextBox variant="body2" color={theme.text}>
                      {formatValue(motionData.rotationRate.alpha)} deg/s
                    </TextBox>
                  </View>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Beta (X축):
                    </TextBox>
                    <TextBox variant="body2" color={theme.text}>
                      {formatValue(motionData.rotationRate.beta)} deg/s
                    </TextBox>
                  </View>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Gamma (Y축):
                    </TextBox>
                    <TextBox variant="body2" color={theme.text}>
                      {formatValue(motionData.rotationRate.gamma)} deg/s
                    </TextBox>
                  </View>
                  <View style={styles.dataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      타임스탬프:
                    </TextBox>
                    <TextBox variant="body4" color={theme.textSecondary}>
                      {motionData.rotationRate.timestamp.toFixed(3)}s
                    </TextBox>
                  </View>
                </View>
              ) : (
                <TextBox variant="body3" color={theme.textSecondary}>
                  데이터 없음
                </TextBox>
              )}
            </View>

            {/* 방향 */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
              <TextBox
                variant="title4"
                color={theme.text}
                style={styles.sectionTitle}
              >
                📱 화면 방향
              </TextBox>

              <View style={styles.dataContainer}>
                <View style={styles.dataRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    방향:
                  </TextBox>
                  <TextBox variant="body2" color={theme.text}>
                    {getOrientationText(motionData.orientation)}
                  </TextBox>
                </View>
                <View style={styles.dataRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    각도:
                  </TextBox>
                  <TextBox variant="body2" color={theme.text}>
                    {motionData.orientation}°
                  </TextBox>
                </View>
              </View>
            </View>

            {/* 기타 정보 */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
              <TextBox
                variant="title4"
                color={theme.text}
                style={styles.sectionTitle}
              >
                ℹ️ 기타 정보
              </TextBox>

              <View style={styles.dataContainer}>
                <View style={styles.dataRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    업데이트 간격:
                  </TextBox>
                  <TextBox variant="body2" color={theme.text}>
                    {motionData.interval}ms
                  </TextBox>
                </View>
                <View style={styles.dataRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    중력 상수:
                  </TextBox>
                  <TextBox variant="body2" color={theme.text}>
                    {DeviceMotion.Gravity} m/s²
                  </TextBox>
                </View>
              </View>
            </View>
          </>
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
import { DeviceMotion } from 'expo-sensors';

// 2. 사용 가능 여부 확인
const isAvailable = await DeviceMotion.isAvailableAsync();

// 3. 권한 확인 및 요청
const permission = await DeviceMotion.getPermissionsAsync();
if (!permission.granted) {
  await DeviceMotion.requestPermissionsAsync();
}

// 4. 업데이트 간격 설정
DeviceMotion.setUpdateInterval(100); // 100ms

// 5. 리스너 등록
const subscription = DeviceMotion.addListener((data) => {
  console.log('가속도:', data.acceleration);
  console.log('중력 포함 가속도:', data.accelerationIncludingGravity);
  console.log('회전:', data.rotation);
  console.log('회전 속도:', data.rotationRate);
  console.log('방향:', data.orientation);
  console.log('간격:', data.interval);
});

// 6. 리스너 제거
subscription.remove();

// 7. 모든 리스너 제거
DeviceMotion.removeAllListeners();

// 8. 중력 상수
const gravity = DeviceMotion.Gravity; // 9.80665

// 9. 방향 값
DeviceMotion.DeviceMotionOrientation.Portrait; // 0
DeviceMotion.DeviceMotionOrientation.RightLandscape; // 90
DeviceMotion.DeviceMotionOrientation.UpsideDown; // 180
DeviceMotion.DeviceMotionOrientation.LeftLandscape; // -90`}
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
              • iOS: NSMotionUsageDescription 권한 필요
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
              • 웹: Safari 설정에서 Motion & Orientation Access 활성화 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • acceleration은 null일 수 있음 (일부 디바이스)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • rotationRate는 null일 수 있음 (일부 디바이스)
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
    gap: 12,
  },
  dataRow: {
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
