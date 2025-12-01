import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';

import * as Battery from 'expo-battery';
import {
  useBatteryLevel,
  useBatteryState,
  useLowPowerMode,
  usePowerState,
} from 'expo-battery';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function BatteryScreen() {
  const { theme } = useTheme();

  // Hooks
  const batteryLevel = useBatteryLevel();
  const batteryState = useBatteryState();
  const lowPowerMode = useLowPowerMode();
  const powerState = usePowerState();

  // State
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [batteryOptimizationEnabled, setBatteryOptimizationEnabled] = useState<
    boolean | null
  >(null);
  const [levelListenerActive, setLevelListenerActive] = useState(false);
  const [stateListenerActive, setStateListenerActive] = useState(false);
  const [powerModeListenerActive, setPowerModeListenerActive] = useState(false);

  // Refs for subscriptions
  const levelSubscriptionRef = useRef<any>(null);
  const stateSubscriptionRef = useRef<any>(null);
  const powerModeSubscriptionRef = useRef<any>(null);

  useEffect(() => {
    checkAvailability();
    if (Platform.OS === 'android') {
      checkBatteryOptimization();
    }

    return () => {
      // Cleanup subscriptions on unmount
      if (levelSubscriptionRef.current) {
        levelSubscriptionRef.current.remove();
      }
      if (stateSubscriptionRef.current) {
        stateSubscriptionRef.current.remove();
      }
      if (powerModeSubscriptionRef.current) {
        powerModeSubscriptionRef.current.remove();
      }
    };
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await Battery.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      setIsAvailable(false);
    }
  };

  const checkBatteryOptimization = async () => {
    try {
      const enabled = await Battery.isBatteryOptimizationEnabledAsync();
      setBatteryOptimizationEnabled(enabled);
    } catch (error) {
      setBatteryOptimizationEnabled(null);
    }
  };

  const subscribeToBatteryLevel = () => {
    if (levelSubscriptionRef.current) {
      levelSubscriptionRef.current.remove();
    }
    const subscription = Battery.addBatteryLevelListener((event) => {
      console.log('Battery level changed:', event.batteryLevel);
    });
    levelSubscriptionRef.current = subscription;
    setLevelListenerActive(true);
  };

  const unsubscribeFromBatteryLevel = () => {
    if (levelSubscriptionRef.current) {
      levelSubscriptionRef.current.remove();
      levelSubscriptionRef.current = null;
      setLevelListenerActive(false);
    }
  };

  const subscribeToBatteryState = () => {
    if (stateSubscriptionRef.current) {
      stateSubscriptionRef.current.remove();
    }
    const subscription = Battery.addBatteryStateListener((event) => {
      console.log('Battery state changed:', event.batteryState);
    });
    stateSubscriptionRef.current = subscription;
    setStateListenerActive(true);
  };

  const unsubscribeFromBatteryState = () => {
    if (stateSubscriptionRef.current) {
      stateSubscriptionRef.current.remove();
      stateSubscriptionRef.current = null;
      setStateListenerActive(false);
    }
  };

  const subscribeToLowPowerMode = () => {
    if (powerModeSubscriptionRef.current) {
      powerModeSubscriptionRef.current.remove();
    }
    const subscription = Battery.addLowPowerModeListener((event) => {
      console.log('Low power mode changed:', event.lowPowerMode);
    });
    powerModeSubscriptionRef.current = subscription;
    setPowerModeListenerActive(true);
  };

  const unsubscribeFromLowPowerMode = () => {
    if (powerModeSubscriptionRef.current) {
      powerModeSubscriptionRef.current.remove();
      powerModeSubscriptionRef.current = null;
      setPowerModeListenerActive(false);
    }
  };

  const getBatteryStateText = (state: Battery.BatteryState) => {
    switch (state) {
      case Battery.BatteryState.UNKNOWN:
        return '알 수 없음';
      case Battery.BatteryState.UNPLUGGED:
        return '충전 안 됨';
      case Battery.BatteryState.CHARGING:
        return '충전 중';
      case Battery.BatteryState.FULL:
        return '충전 완료';
      default:
        return '알 수 없음';
    }
  };

  const getBatteryStateColor = (state: Battery.BatteryState) => {
    switch (state) {
      case Battery.BatteryState.CHARGING:
        return theme.success;
      case Battery.BatteryState.FULL:
        return theme.success;
      case Battery.BatteryState.UNPLUGGED:
        return theme.text;
      case Battery.BatteryState.UNKNOWN:
        return theme.textSecondary;
      default:
        return theme.text;
    }
  };

  const getBatteryLevelColor = (level: number) => {
    if (level === -1) return theme.textSecondary;
    if (level > 0.5) return theme.success;
    if (level > 0.2) return theme.warning;
    return theme.error;
  };

  const formatBatteryLevel = (level: number) => {
    if (level === -1) return '알 수 없음';
    return `${Math.round(level * 100)}%`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Battery" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Battery
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          기기의 배터리 정보 및 상태 모니터링
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
              Battery API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 기기의 배터리 정보를 제공하는 API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 배터리 레벨, 충전 상태, 저전력 모드 등 확인 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 이벤트 리스너로 실시간 업데이트 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Android, iOS 물리 기기에서 사용 가능
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              배터리 상태
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • UNKNOWN: 알 수 없음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • UNPLUGGED: 충전 안 됨 (방전 중)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • CHARGING: 충전 중
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • FULL: 충전 완료
            </TextBox>
          </View>
        </View>

        {/* 사용 가능 여부 */}
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

            {Platform.OS === 'android' &&
              batteryOptimizationEnabled !== null && (
                <View style={styles.statusRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    배터리 최적화:
                  </TextBox>
                  <TextBox
                    variant="body3"
                    color={
                      batteryOptimizationEnabled ? theme.warning : theme.success
                    }
                  >
                    {batteryOptimizationEnabled ? '✅ 활성화' : '❌ 비활성화'}
                  </TextBox>
                </View>
              )}
          </View>
        </View>

        {/* 배터리 정보 (Hooks) */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🔋 배터리 정보 (Hooks)
          </TextBox>

          <View style={styles.batteryContainer}>
            {/* 배터리 레벨 */}
            <View style={styles.batteryLevelContainer}>
              <View style={styles.batteryLevelHeader}>
                <TextBox variant="body2" color={theme.textSecondary}>
                  배터리 레벨
                </TextBox>
                <TextBox
                  variant="title1"
                  color={getBatteryLevelColor(batteryLevel)}
                  style={styles.batteryLevelValue}
                >
                  {formatBatteryLevel(batteryLevel)}
                </TextBox>
              </View>

              {/* 배터리 바 */}
              {batteryLevel !== -1 && (
                <View
                  style={[styles.batteryBar, { backgroundColor: theme.border }]}
                >
                  <View
                    style={[
                      styles.batteryFill,
                      {
                        width: `${batteryLevel * 100}%`,
                        backgroundColor: getBatteryLevelColor(batteryLevel),
                      },
                    ]}
                  />
                </View>
              )}
            </View>

            {/* 배터리 상태 */}
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                배터리 상태:
              </TextBox>
              <TextBox
                variant="body2"
                color={getBatteryStateColor(batteryState)}
              >
                {getBatteryStateText(batteryState)}
              </TextBox>
            </View>

            {/* 저전력 모드 */}
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                저전력 모드:
              </TextBox>
              <TextBox
                variant="body2"
                color={lowPowerMode ? theme.warning : theme.success}
              >
                {lowPowerMode ? '✅ 활성화' : '❌ 비활성화'}
              </TextBox>
            </View>
          </View>
        </View>

        {/* PowerState 통합 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚡ PowerState 통합 정보
          </TextBox>

          <View style={styles.powerStateContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                배터리 레벨:
              </TextBox>
              <TextBox
                variant="body2"
                color={getBatteryLevelColor(powerState.batteryLevel)}
              >
                {formatBatteryLevel(powerState.batteryLevel)}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                배터리 상태:
              </TextBox>
              <TextBox
                variant="body2"
                color={getBatteryStateColor(powerState.batteryState)}
              >
                {getBatteryStateText(powerState.batteryState)}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                저전력 모드:
              </TextBox>
              <TextBox
                variant="body2"
                color={powerState.lowPowerMode ? theme.warning : theme.success}
              >
                {powerState.lowPowerMode ? '✅ 활성화' : '❌ 비활성화'}
              </TextBox>
            </View>
          </View>
        </View>

        {/* 이벤트 리스너 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📡 이벤트 리스너
          </TextBox>

          <View style={styles.listenerContainer}>
            <View style={styles.listenerItem}>
              <View style={styles.listenerHeader}>
                <TextBox variant="body3" color={theme.text}>
                  배터리 레벨 변경
                </TextBox>
                <TextBox
                  variant="body4"
                  color={
                    levelListenerActive ? theme.success : theme.textSecondary
                  }
                >
                  {levelListenerActive ? '✅ 활성' : '❌ 비활성'}
                </TextBox>
              </View>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.listenerDescription}
              >
                Android: 유의미한 변경 시만 발생 (낮음/정상) iOS: 1% 이상 변경
                시 발생 (최대 1분당 1회)
              </TextBox>
              <CustomButton
                title={levelListenerActive ? '구독 해제' : '구독 시작'}
                onPress={
                  levelListenerActive
                    ? unsubscribeFromBatteryLevel
                    : subscribeToBatteryLevel
                }
                variant="ghost"
                style={styles.listenerButton}
              />
            </View>

            <View style={styles.listenerItem}>
              <View style={styles.listenerHeader}>
                <TextBox variant="body3" color={theme.text}>
                  배터리 상태 변경
                </TextBox>
                <TextBox
                  variant="body4"
                  color={
                    stateListenerActive ? theme.success : theme.textSecondary
                  }
                >
                  {stateListenerActive ? '✅ 활성' : '❌ 비활성'}
                </TextBox>
              </View>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.listenerDescription}
              >
                충전 상태가 변경될 때 발생
              </TextBox>
              <CustomButton
                title={stateListenerActive ? '구독 해제' : '구독 시작'}
                onPress={
                  stateListenerActive
                    ? unsubscribeFromBatteryState
                    : subscribeToBatteryState
                }
                variant="ghost"
                style={styles.listenerButton}
              />
            </View>

            <View style={styles.listenerItem}>
              <View style={styles.listenerHeader}>
                <TextBox variant="body3" color={theme.text}>
                  저전력 모드 변경
                </TextBox>
                <TextBox
                  variant="body4"
                  color={
                    powerModeListenerActive
                      ? theme.success
                      : theme.textSecondary
                  }
                >
                  {powerModeListenerActive ? '✅ 활성' : '❌ 비활성'}
                </TextBox>
              </View>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.listenerDescription}
              >
                저전력 모드가 토글될 때 발생
              </TextBox>
              <CustomButton
                title={powerModeListenerActive ? '구독 해제' : '구독 시작'}
                onPress={
                  powerModeListenerActive
                    ? unsubscribeFromLowPowerMode
                    : subscribeToLowPowerMode
                }
                variant="ghost"
                style={styles.listenerButton}
              />
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
              {`// 1. Hooks 사용
import {
  useBatteryLevel,
  useBatteryState,
  useLowPowerMode,
  usePowerState,
} from 'expo-battery';

function BatteryInfo() {
  const batteryLevel = useBatteryLevel();
  const batteryState = useBatteryState();
  const lowPowerMode = useLowPowerMode();
  const { batteryLevel, batteryState, lowPowerMode } = usePowerState();

  return (
    <View>
      <Text>Level: {batteryLevel * 100}%</Text>
      <Text>State: {batteryState}</Text>
      <Text>Low Power: {lowPowerMode ? 'Yes' : 'No'}</Text>
    </View>
  );
}

// 2. 비동기 메서드 사용
import * as Battery from 'expo-battery';

const batteryLevel = await Battery.getBatteryLevelAsync();
const batteryState = await Battery.getBatteryStateAsync();
const powerState = await Battery.getPowerStateAsync();
const isAvailable = await Battery.isAvailableAsync();
const lowPowerMode = await Battery.isLowPowerModeEnabledAsync();

// Android only
const batteryOptimization = await Battery.isBatteryOptimizationEnabledAsync();

// 3. 이벤트 리스너
import * as Battery from 'expo-battery';

// 배터리 레벨 변경
const levelSubscription = Battery.addBatteryLevelListener((event) => {
  console.log('Battery level:', event.batteryLevel);
});

// 배터리 상태 변경
const stateSubscription = Battery.addBatteryStateListener((event) => {
  console.log('Battery state:', event.batteryState);
});

// 저전력 모드 변경
const powerModeSubscription = Battery.addLowPowerModeListener((event) => {
  console.log('Low power mode:', event.lowPowerMode);
});

// 구독 해제
levelSubscription.remove();
stateSubscription.remove();
powerModeSubscription.remove();`}
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
              • iOS 시뮬레이터에서는 사용 불가 (물리 기기만 지원)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Web에서는 배터리 레벨이 항상 1로 반환됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: 배터리 레벨 이벤트는 유의미한 변경 시만 발생
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: 배터리 레벨 이벤트는 1% 이상 변경 시 발생 (최대 1분당 1회)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Web에서는 이벤트 리스너가 작동하지 않음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 배터리 최적화는 Android 6.0 이상에서만 확인 가능
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
  batteryContainer: {
    gap: 16,
  },
  batteryLevelContainer: {
    gap: 12,
  },
  batteryLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batteryLevelValue: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  batteryBar: {
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  powerStateContainer: {
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  listenerContainer: {
    gap: 16,
  },
  listenerItem: {
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
