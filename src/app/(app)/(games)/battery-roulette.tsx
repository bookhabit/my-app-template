import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Battery from 'expo-battery';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'revealing' | 'revealed';

export default function BatteryRoulette() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [batteryPct, setBatteryPct] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const drumRollRef = useRef(new Animated.Value(0)).current;
  const countRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const reveal = async () => {
    setPhase('revealing');
    setBatteryPct(null);
    countRef.current = 0;

    // 드럼롤: 숫자 빠르게 돌리기
    intervalRef.current = setInterval(() => {
      countRef.current += 1;
      setBatteryPct(Math.floor(Math.random() * 100) + 1);
      if (countRef.current > 20) {
        clearInterval(intervalRef.current!);
        fetchReal();
      }
    }, 80);

    Animated.timing(drumRollRef, {
      toValue: 1,
      duration: 1800,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const fetchReal = async () => {
    try {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();
      const pct = Math.round(level * 100);
      const charging =
        state === Battery.BatteryState.CHARGING ||
        state === Battery.BatteryState.FULL;

      setBatteryPct(pct);
      setIsCharging(charging);
      setPhase('revealed');

      if (pct <= 20) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      setBatteryPct(42);
      setPhase('revealed');
    }
  };

  const reset = () => {
    setPhase('idle');
    setBatteryPct(null);
    drumRollRef.setValue(0);
  };

  const getBatteryEmoji = (pct: number) => {
    if (pct > 80) return '🔋';
    if (pct > 50) return '🪫';
    if (pct > 20) return '⚠️';
    return '💀';
  };

  const getBatteryColor = (pct: number) => {
    if (pct > 60) return '#34C759';
    if (pct > 30) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔋 배터리 복불복</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {phase === 'idle' && (
          <>
            <Text style={{ fontSize: 80 }}>🔋</Text>
            <Text style={styles.hint}>
              배터리가 가장 적은 사람이 벌칙!{'\n'}각자 확인하고 비교하세요
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#A8E6CF' }]} onPress={reveal}>
              <Text style={[styles.btnText, { color: '#000' }]}>내 배터리 확인</Text>
            </TouchableOpacity>
          </>
        )}

        {(phase === 'revealing' || phase === 'revealed') && batteryPct !== null && (
          <>
            <Text style={{ fontSize: 60 }}>
              {phase === 'revealed' ? getBatteryEmoji(batteryPct) : '🎲'}
            </Text>

            <Animated.Text
              style={[
                styles.bigPct,
                {
                  color:
                    phase === 'revealed' ? getBatteryColor(batteryPct) : '#8E8E93',
                },
              ]}
            >
              {batteryPct}%
            </Animated.Text>

            {phase === 'revealed' && (
              <>
                {isCharging && <Text style={styles.chargingTag}>⚡ 충전 중</Text>}
                <Text
                  style={[
                    styles.verdict,
                    { color: batteryPct <= 20 ? '#FF3B30' : batteryPct <= 50 ? '#FF9500' : '#34C759' },
                  ]}
                >
                  {batteryPct <= 20
                    ? '💀 최하위 후보!'
                    : batteryPct <= 50
                      ? '⚠️ 위험 구간'
                      : '✅ 안전'}
                </Text>

                <View style={styles.barWrap}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${batteryPct}%`, backgroundColor: getBatteryColor(batteryPct) },
                    ]}
                  />
                </View>

                <TouchableOpacity style={[styles.btn, { backgroundColor: '#A8E6CF' }]} onPress={reset}>
                  <Text style={[styles.btnText, { color: '#000' }]}>다시 확인</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-battery • getBatteryLevelAsync</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { padding: 8, width: 60 },
  backText: { color: '#8E8E93', fontSize: 15 },
  title: { flex: 1, color: '#FFF', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 32 },
  hint: { color: '#8E8E93', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  bigPct: { fontSize: 100, fontWeight: '900' },
  chargingTag: { color: '#34C759', fontSize: 16, fontWeight: '600' },
  verdict: { fontSize: 22, fontWeight: '700' },
  barWrap: { width: '100%', height: 16, backgroundColor: '#2C2C2E', borderRadius: 8, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 8 },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginTop: 8 },
  btnText: { fontSize: 18, fontWeight: '700' },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
