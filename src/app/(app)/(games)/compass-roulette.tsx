import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { Magnetometer } from 'expo-sensors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'spinning' | 'stopped';

const PLAYERS = ['1번', '2번', '3번', '4번', '5번', '6번'];

export default function CompassRoulette() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [heading, setHeading] = useState(0);
  const [playerCount, setPlayerCount] = useState(4);
  const [victim, setVictim] = useState<string | null>(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const headingRef = useRef(0);
  const subRef = useRef<ReturnType<typeof Magnetometer.addListener> | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = () => {
    subRef.current?.remove();
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
  };

  useEffect(() => () => stop(), []);

  const startSpin = () => {
    setPhase('spinning');
    setVictim(null);
    Magnetometer.setUpdateInterval(50);

    subRef.current = Magnetometer.addListener(({ x, y }) => {
      const angle = (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
      headingRef.current = angle;
      setHeading(angle);
      Animated.timing(rotateAnim, {
        toValue: angle,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    });

    stopTimerRef.current = setTimeout(() => {
      stop();
      const finalAngle = headingRef.current;
      const sectorSize = 360 / playerCount;
      const playerIdx = Math.floor(finalAngle / sectorSize) % playerCount;
      setVictim(PLAYERS[playerIdx]);
      setPhase('stopped');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }, 5000);
  };

  const reset = () => {
    stop();
    setPhase('idle');
    setVictim(null);
    rotateAnim.setValue(0);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🧲 자력 룰렛</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {/* 참가자 수 설정 */}
        {phase === 'idle' && (
          <View style={styles.playerRow}>
            <Text style={styles.playerLabel}>참가자 수</Text>
            <TouchableOpacity
              onPress={() => setPlayerCount((n) => Math.max(2, n - 1))}
              style={styles.countBtn}
            >
              <Text style={styles.countBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.countNum}>{playerCount}</Text>
            <TouchableOpacity
              onPress={() => setPlayerCount((n) => Math.min(6, n + 1))}
              style={styles.countBtn}
            >
              <Text style={styles.countBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 나침반 */}
        <View style={styles.compassContainer}>
          <View style={styles.compassRing}>
            {['N', 'E', 'S', 'W'].map((dir, i) => (
              <Text
                key={dir}
                style={[
                  styles.compassDir,
                  {
                    top: i === 0 ? 4 : i === 2 ? undefined : '45%',
                    bottom: i === 2 ? 4 : undefined,
                    left: i === 3 ? 4 : i === 1 ? undefined : '45%',
                    right: i === 1 ? 4 : undefined,
                  },
                ]}
              >
                {dir}
              </Text>
            ))}

            {/* 바늘 */}
            <Animated.View style={[styles.needle, { transform: [{ rotate }] }]}>
              <View style={styles.needleNorth} />
              <View style={styles.needleSouth} />
            </Animated.View>

            <View style={styles.needleCenter} />
          </View>
        </View>

        {phase === 'stopped' && victim && (
          <View style={styles.victimBox}>
            <Text style={styles.victimLabel}>🎯 선택된 사람</Text>
            <Text style={styles.victimText}>{victim}</Text>
            <Text style={styles.victimSub}>오늘의 벌칙!</Text>
          </View>
        )}

        {phase === 'idle' && (
          <Text style={styles.hint}>
            폰을 테이블에 놓고 5초 동안{'\n'}자기장 방향으로 바늘이 움직입니다
          </Text>
        )}
        {phase === 'spinning' && (
          <Text style={styles.spinText}>🔄 5초 후 결정...</Text>
        )}

        {phase !== 'spinning' && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: phase === 'stopped' ? '#3A3A3C' : '#45B7D1' }]}
            onPress={phase === 'stopped' ? reset : startSpin}
          >
            <Text style={styles.btnText}>{phase === 'stopped' ? '다시 하기' : '룰렛 시작'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-sensors • Magnetometer</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 32 },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  playerLabel: { color: '#8E8E93', fontSize: 15 },
  countBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' },
  countBtnText: { color: '#FFF', fontSize: 22, fontWeight: '300', lineHeight: 28 },
  countNum: { color: '#FFF', fontSize: 28, fontWeight: '800', minWidth: 32, textAlign: 'center' },
  compassContainer: { alignItems: 'center', justifyContent: 'center' },
  compassRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: '#2C2C2E',
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  compassDir: { position: 'absolute', color: '#8E8E93', fontSize: 14, fontWeight: '700' },
  needle: {
    width: 6,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  needleNorth: { flex: 1, width: 6, backgroundColor: '#FF3B30', borderRadius: 3 },
  needleSouth: { flex: 1, width: 6, backgroundColor: '#45B7D1', borderRadius: 3 },
  needleCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    position: 'absolute',
  },
  victimBox: { alignItems: 'center', gap: 4 },
  victimLabel: { color: '#8E8E93', fontSize: 14 },
  victimText: { color: '#FF3B30', fontSize: 52, fontWeight: '900' },
  victimSub: { color: '#8E8E93', fontSize: 14 },
  hint: { color: '#8E8E93', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  spinText: { color: '#45B7D1', fontSize: 18, fontWeight: '600' },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
