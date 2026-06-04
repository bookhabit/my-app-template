import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'waiting' | 'react' | 'result';
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const DIR_LABELS: Record<Direction, string> = { UP: '⬆️', DOWN: '⬇️', LEFT: '⬅️', RIGHT: '➡️' };
const ROUNDS = 6;

export default function SwipeBattle() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState<Direction | null>(null);
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const [scores, setScores] = useState<Array<{ ms: number; correct: boolean }>>([]);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  const startRound = (r: number) => {
    if (r >= ROUNDS) { setPhase('result'); return; }
    setRound(r);
    setTarget(null);
    setReactionMs(null);
    setPhase('waiting');

    timerRef.current = setTimeout(() => {
      const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      setTarget(d);
      setPhase('react');
      startTimeRef.current = Date.now();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 1000 + Math.random() * 2000);
  };

  const handleSwipe = (direction: Direction) => {
    if (phase !== 'react' || !target) return;
    const ms = Date.now() - startTimeRef.current;
    const correct = direction === target;
    setReactionMs(ms);
    setScores((prev) => [...prev, { ms, correct }]);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setTimeout(() => startRound(round + 1), 800);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX * 0.3;
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      'worklet';
      const { translationX: tx, translationY: ty } = e;
      const absx = Math.abs(tx);
      const absy = Math.abs(ty);
      if (Math.max(absx, absy) < 40) { translateX.value = withSpring(0); translateY.value = withSpring(0); return; }
      let dir: Direction;
      if (absx > absy) { dir = tx > 0 ? 'RIGHT' : 'LEFT'; }
      else { dir = ty > 0 ? 'DOWN' : 'UP'; }
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  // worklet에서 JS 함수 호출이 불가해 별도 처리
  const panGestureDetect = Gesture.Pan()
    .onEnd((e) => {
      const { translationX: tx, translationY: ty } = e;
      const absx = Math.abs(tx);
      const absy = Math.abs(ty);
      if (Math.max(absx, absy) < 40) return;
      let dir: Direction;
      if (absx > absy) { dir = tx > 0 ? 'RIGHT' : 'LEFT'; }
      else { dir = ty > 0 ? 'DOWN' : 'UP'; }
      handleSwipe(dir);
    });

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('idle');
    setScores([]);
    setRound(0);
    setTarget(null);
  };

  const correctCount = scores.filter((s) => s.correct).length;
  const avgMs = scores.length > 0 ? Math.round(scores.filter(s => s.correct).reduce((a, b) => a + b.ms, 0) / Math.max(correctCount, 1)) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⬅️ 스와이프 반응속도</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {phase === 'idle' && (
          <>
            <Text style={{ fontSize: 70 }}>⚡</Text>
            <Text style={styles.hint}>화면에 표시된 방향으로{'\n'}최대한 빠르게 스와이프!</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#007AFF' }]} onPress={() => startRound(0)}>
              <Text style={styles.btnText}>시작!</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'waiting' && (
          <>
            <Text style={styles.roundText}>{round + 1} / {ROUNDS}</Text>
            <Text style={styles.waitText}>⏳</Text>
            <Text style={styles.waitLabel}>준비...</Text>
          </>
        )}

        {(phase === 'react') && (
          <>
            <Text style={styles.roundText}>{round + 1} / {ROUNDS}</Text>
            <GestureDetector gesture={panGestureDetect}>
              <Animated.View style={[styles.swipeArea, animStyle]}>
                <Text style={styles.arrow}>{target ? DIR_LABELS[target] : ''}</Text>
              </Animated.View>
            </GestureDetector>
            {reactionMs !== null && (
              <Text style={styles.reactionText}>{reactionMs}ms</Text>
            )}
          </>
        )}

        {phase === 'result' && (
          <>
            <Text style={{ fontSize: 60 }}>⚡</Text>
            <Text style={styles.resultScore}>{correctCount}/{ROUNDS}</Text>
            <Text style={styles.resultAvg}>평균 {avgMs}ms</Text>
            <View style={styles.scoreList}>
              {scores.map((s, i) => (
                <Text key={i} style={[styles.scoreItem, { color: s.correct ? '#34C759' : '#FF3B30' }]}>
                  {i + 1}. {s.correct ? '✅' : '❌'} {s.ms}ms
                </Text>
              ))}
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#007AFF' }]} onPress={reset}>
              <Text style={styles.btnText}>다시 하기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>react-native-gesture-handler • Pan Gesture</Text>
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
  hint: { color: '#8E8E93', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  roundText: { color: '#8E8E93', fontSize: 20, fontWeight: '600' },
  waitText: { fontSize: 70 },
  waitLabel: { color: '#48484A', fontSize: 24, fontWeight: '700' },
  swipeArea: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#1C1C1E', borderWidth: 2, borderColor: '#007AFF',
    alignItems: 'center', justifyContent: 'center',
  },
  arrow: { fontSize: 80 },
  reactionText: { color: '#34C759', fontSize: 24, fontWeight: '700' },
  resultScore: { color: '#007AFF', fontSize: 72, fontWeight: '900' },
  resultAvg: { color: '#8E8E93', fontSize: 18 },
  scoreList: { gap: 4 },
  scoreItem: { fontSize: 14 },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
