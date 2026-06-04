import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'playing' | 'exploded';

const FUSE_MIN = 8000;
const FUSE_MAX = 22000;

export default function HapticBomb() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [fuseTime, setFuseTime] = useState(0);
  const hapticRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (hapticRef.current) clearInterval(hapticRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => () => clear(), []);

  const start = () => {
    const fuse = FUSE_MIN + Math.random() * (FUSE_MAX - FUSE_MIN);
    setFuseTime(fuse);
    setElapsed(0);
    setPhase('playing');

    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const t = Date.now() - startTime;
      setElapsed(t);
      if (t >= fuse) {
        clear();
        setPhase('exploded');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      // 햅틱 간격: 남은 시간 비율에 따라 800ms → 100ms
      const ratio = t / fuse;
      const hapticInterval = 800 - ratio * 700;

      if (hapticRef.current) clearInterval(hapticRef.current);
      hapticRef.current = setInterval(() => {
        const style =
          ratio < 0.5
            ? Haptics.ImpactFeedbackStyle.Light
            : ratio < 0.8
              ? Haptics.ImpactFeedbackStyle.Medium
              : Haptics.ImpactFeedbackStyle.Heavy;
        Haptics.impactAsync(style);
      }, hapticInterval);
    }, 100);
  };

  const reset = () => {
    clear();
    setPhase('idle');
    setElapsed(0);
  };

  const ratio = fuseTime > 0 ? Math.min(elapsed / fuseTime, 1) : 0;
  const danger = ratio > 0.7;
  const gaugeColor = ratio < 0.5 ? '#34C759' : ratio < 0.75 ? '#FF9500' : '#FF3B30';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { clear(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>💣 심장박동 폭탄</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {phase === 'exploded' ? (
          <>
            <Text style={styles.boom}>💥</Text>
            <Text style={styles.boomText}>BOOM!</Text>
            <Text style={styles.boomSub}>손에 든 사람이 벌칙!</Text>
          </>
        ) : (
          <>
            <Text style={[styles.bombEmoji, danger && styles.shake]}>💣</Text>

            {phase === 'playing' && (
              <>
                <View style={styles.gaugeTrack}>
                  <View style={[styles.gaugeFill, { width: `${ratio * 100}%`, backgroundColor: gaugeColor }]} />
                </View>
                <Text style={[styles.dangerText, { color: gaugeColor }]}>
                  {ratio < 0.5 ? '안전' : ratio < 0.75 ? '위험' : '🚨 폭발 임박!'}
                </Text>
              </>
            )}

            {phase === 'idle' && (
              <Text style={styles.hint}>시작하면 랜덤한 시간 후 폭발합니다{'\n'}손에 든 사람이 벌칙!</Text>
            )}
          </>
        )}

        <View style={styles.btnRow}>
          {phase === 'idle' && (
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF3B30' }]} onPress={start}>
              <Text style={styles.btnText}>🔥 시작</Text>
            </TouchableOpacity>
          )}
          {phase === 'playing' && (
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#3A3A3C' }]} onPress={reset}>
              <Text style={styles.btnText}>중단</Text>
            </TouchableOpacity>
          )}
          {phase === 'exploded' && (
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF3B30' }]} onPress={reset}>
              <Text style={styles.btnText}>다시 하기</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-haptics • ImpactFeedback</Text>
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
  bombEmoji: { fontSize: 100 },
  shake: { opacity: 0.9 },
  gaugeTrack: { width: '100%', height: 12, backgroundColor: '#2C2C2E', borderRadius: 6, overflow: 'hidden' },
  gaugeFill: { height: '100%', borderRadius: 6 },
  dangerText: { fontSize: 18, fontWeight: '700' },
  hint: { color: '#8E8E93', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  boom: { fontSize: 100 },
  boomText: { color: '#FF3B30', fontSize: 52, fontWeight: '900' },
  boomSub: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  btnRow: { marginTop: 16 },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
