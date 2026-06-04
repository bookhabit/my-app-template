import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { DeviceMotion } from 'expo-sensors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'playing' | 'failed' | 'survived';

const TILT_LIMIT = 0.25; // radians ~ 14°
const SURVIVE_TIME = 15;

export default function LevelChallenge() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SURVIVE_TIME);
  const [maxTilt, setMaxTilt] = useState(0);
  const subRef = useRef<ReturnType<typeof DeviceMotion.addListener> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    subRef.current?.remove();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => () => stop(), []);

  const start = () => {
    setPhase('playing');
    setTimeLeft(SURVIVE_TIME);
    setMaxTilt(0);
    DeviceMotion.setUpdateInterval(50);

    subRef.current = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation) return;
      const beta = rotation.beta ?? 0;
      const gamma = rotation.gamma ?? 0;
      setTiltX(gamma);
      setTiltY(beta);
      const tiltMag = Math.sqrt(gamma * gamma + beta * beta);
      setMaxTilt((prev) => Math.max(prev, tiltMag));

      if (tiltMag > TILT_LIMIT) {
        stop();
        setPhase('failed');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    });

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      setTimeLeft(SURVIVE_TIME - elapsed);
      if (elapsed % 5 === 0) Haptics.selectionAsync();
      if (elapsed >= SURVIVE_TIME) {
        stop();
        setPhase('survived');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 1000);
  };

  const reset = () => { stop(); setPhase('idle'); setTiltX(0); setTiltY(0); };

  // 버블 위치 계산 (컨테이너 100px 기준)
  const bubbleRadius = 100;
  const bx = Math.max(-bubbleRadius + 20, Math.min(bubbleRadius - 20, tiltX * 400));
  const by = Math.max(-bubbleRadius + 20, Math.min(bubbleRadius - 20, tiltY * 400));
  const isRed = Math.sqrt(bx * bx + by * by) > 60;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⚖️ 수평 유지 챌린지</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {/* 수평계 */}
        <View style={styles.levelOuter}>
          <View style={styles.levelInner}>
            {/* 중심선 */}
            <View style={styles.crossH} />
            <View style={styles.crossV} />
            {/* 버블 */}
            <View
              style={[
                styles.bubble,
                {
                  transform: [{ translateX: bx }, { translateY: by }],
                  backgroundColor: isRed ? '#FF3B30' : '#34C759',
                },
              ]}
            />
          </View>
        </View>

        {phase === 'playing' && (
          <Text style={styles.timer}>{timeLeft}초</Text>
        )}

        {phase === 'idle' && (
          <Text style={styles.hint}>폰을 수평으로 유지하세요{'\n'}15초 동안 버블을 중앙에 유지!</Text>
        )}

        {phase === 'failed' && (
          <>
            <Text style={styles.failText}>❌ 실패!</Text>
            <Text style={styles.failSub}>기울어졌습니다</Text>
          </>
        )}

        {phase === 'survived' && (
          <>
            <Text style={styles.successText}>🏆 성공!</Text>
            <Text style={styles.successSub}>15초 수평 유지 완료</Text>
          </>
        )}

        {phase === 'idle' && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#34C759' }]} onPress={start}>
            <Text style={styles.btnText}>시작</Text>
          </TouchableOpacity>
        )}
        {(phase === 'failed' || phase === 'survived') && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#34C759' }]} onPress={reset}>
            <Text style={styles.btnText}>다시 하기</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-sensors • DeviceMotion</Text>
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
  levelOuter: {
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#1C1C1E', borderWidth: 3, borderColor: '#3A3A3C',
    alignItems: 'center', justifyContent: 'center',
  },
  levelInner: {
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 2, borderColor: '#2C2C2E',
    alignItems: 'center', justifyContent: 'center',
  },
  crossH: { position: 'absolute', width: '100%', height: 1, backgroundColor: '#3A3A3C' },
  crossV: { position: 'absolute', width: 1, height: '100%', backgroundColor: '#3A3A3C' },
  bubble: { width: 36, height: 36, borderRadius: 18, opacity: 0.9 },
  timer: { color: '#FFF', fontSize: 52, fontWeight: '900' },
  hint: { color: '#8E8E93', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  failText: { color: '#FF3B30', fontSize: 52, fontWeight: '900' },
  failSub: { color: '#8E8E93', fontSize: 15 },
  successText: { color: '#34C759', fontSize: 52, fontWeight: '900' },
  successSub: { color: '#8E8E93', fontSize: 15 },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
