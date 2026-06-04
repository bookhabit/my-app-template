import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'playing' | 'result';

const ROUND_TIME = 30;

export default function PedometerBattle() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [steps, setSteps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const subRef = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startStepsRef = useRef(0);

  useEffect(() => {
    Pedometer.isAvailableAsync().then(setIsAvailable);
    return () => { subRef.current?.remove(); if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const start = () => {
    setPhase('playing');
    setSteps(0);
    setTimeLeft(ROUND_TIME);

    subRef.current = Pedometer.watchStepCount(({ steps: s }) => {
      setSteps(s);
      if (s % 5 === 0) Haptics.selectionAsync();
    });

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      setTimeLeft(ROUND_TIME - elapsed);
      if (elapsed >= ROUND_TIME) {
        subRef.current?.remove();
        clearInterval(timerRef.current!);
        setPhase('result');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 1000);
  };

  const reset = () => {
    subRef.current?.remove();
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('idle');
    setSteps(0);
    setTimeLeft(ROUND_TIME);
  };

  const getRating = (s: number) => {
    if (s >= 80) return { label: '🔥 전력질주!', color: '#FF3B30' };
    if (s >= 50) return { label: '💪 열심히 뛰었어요', color: '#FF9500' };
    if (s >= 20) return { label: '😄 제법인데요', color: '#34C759' };
    return { label: '😅 더 뛰어볼까요?', color: '#8E8E93' };
  };

  const rating = getRating(steps);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏃 걸음수 배틀</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {isAvailable === false && (
          <Text style={styles.errorText}>이 기기에서는 만보계를 지원하지 않습니다</Text>
        )}

        {phase === 'idle' && (
          <>
            <Text style={{ fontSize: 80 }}>🏃</Text>
            <Text style={styles.hint}>30초 동안 제자리 뛰기!{'\n'}걸음수가 많은 사람 승리</Text>
            {isAvailable !== false && (
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF9500' }]} onPress={start}>
                <Text style={styles.btnText}>시작!</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {phase === 'playing' && (
          <>
            <Text style={styles.timerText}>{timeLeft}</Text>
            <Text style={styles.stepsText}>{steps}</Text>
            <Text style={styles.stepsLabel}>걸음</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min((timeLeft / ROUND_TIME) * 100, 100)}%` },
                ]}
              />
            </View>
          </>
        )}

        {phase === 'result' && (
          <>
            <Text style={{ fontSize: 70 }}>🏆</Text>
            <Text style={[styles.resultSteps, { color: rating.color }]}>{steps}걸음</Text>
            <Text style={[styles.ratingLabel, { color: rating.color }]}>{rating.label}</Text>
            <Text style={styles.hintSmall}>친구와 비교해보세요!</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF9500' }]} onPress={reset}>
              <Text style={styles.btnText}>다시 하기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-sensors • Pedometer</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32 },
  errorText: { color: '#FF3B30', fontSize: 15, textAlign: 'center' },
  hint: { color: '#8E8E93', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  hintSmall: { color: '#8E8E93', fontSize: 13 },
  timerText: { color: '#8E8E93', fontSize: 36, fontWeight: '700' },
  stepsText: { color: '#FF9500', fontSize: 100, fontWeight: '900', lineHeight: 110 },
  stepsLabel: { color: '#8E8E93', fontSize: 18, marginTop: -8 },
  progressBar: { width: '100%', height: 8, backgroundColor: '#2C2C2E', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FF9500', borderRadius: 4 },
  resultSteps: { fontSize: 72, fontWeight: '900' },
  ratingLabel: { fontSize: 20, fontWeight: '700' },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
