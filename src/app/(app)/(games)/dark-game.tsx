import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Brightness from 'expo-brightness';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 모스 부호 패턴: 진동만으로 게임 진행
const MORSE_PATTERNS: Array<{ label: string; pattern: number[] }> = [
  { label: '왼쪽', pattern: [50, 100, 50] },
  { label: '오른쪽', pattern: [200, 50, 200] },
  { label: '멈춰', pattern: [400] },
  { label: '앞으로', pattern: [50, 100, 200] },
  { label: '뒤로', pattern: [200, 100, 50] },
];

type Phase = 'idle' | 'dark' | 'result';

export default function DarkGame() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentPattern, setCurrentPattern] = useState<(typeof MORSE_PATTERNS)[0] | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const originalBrightness = useRef<number>(1);

  useEffect(() => () => { Brightness.setBrightnessAsync(originalBrightness.current); }, []);

  const playPattern = async (pattern: number[]) => {
    for (const duration of pattern) {
      if (duration < 100) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (duration < 250) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      await new Promise((r) => setTimeout(r, duration + 150));
    }
  };

  const startRound = async (r: number) => {
    if (r >= 5) {
      await Brightness.setBrightnessAsync(originalBrightness.current);
      setPhase('result');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    setRound(r);
    setShowAnswer(false);
    const chosen = MORSE_PATTERNS[Math.floor(Math.random() * MORSE_PATTERNS.length)];
    setCurrentPattern(chosen);
    await playPattern(chosen.pattern);
  };

  const enterDark = async () => {
    const current = await Brightness.getBrightnessAsync();
    originalBrightness.current = current;
    await Brightness.setBrightnessAsync(0);
    setPhase('dark');
    setScore(0);
    setTimeout(() => startRound(0), 800);
  };

  const guess = (label: string) => {
    if (!currentPattern) return;
    const correct = label === currentPattern.label;
    if (correct) {
      setScore((s) => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setShowAnswer(true);
    setTimeout(() => startRound(round + 1), 1200);
  };

  const reset = async () => {
    await Brightness.setBrightnessAsync(originalBrightness.current);
    setPhase('idle');
    setScore(0);
    setRound(0);
    setCurrentPattern(null);
    setShowAnswer(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🌑 어둠 속 진동 게임</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {phase === 'idle' && (
          <>
            <Text style={{ fontSize: 70 }}>🌑</Text>
            <Text style={styles.hint}>
              화면이 완전히 꺼집니다{'\n'}진동 패턴을 느끼고 방향을 맞히세요!{'\n\n'}
              짧은진동 = 빠른방향 / 긴진동 = 느린방향
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#8E8E93' }]} onPress={enterDark}>
              <Text style={styles.btnText}>어둠 속으로 입장</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'dark' && (
          <>
            <Text style={styles.roundLabel}>{round + 1} / 5라운드</Text>
            <Text style={styles.scoreText}>✅ {score}점</Text>

            {showAnswer && currentPattern && (
              <Text style={styles.answerText}>정답: {currentPattern.label}</Text>
            )}

            <Text style={styles.chooseLabel}>진동을 느꼈나요? 방향을 선택하세요</Text>
            <View style={styles.grid}>
              {MORSE_PATTERNS.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={[
                    styles.choiceBtn,
                    showAnswer && currentPattern?.label === p.label && styles.correctBtn,
                  ]}
                  onPress={() => !showAnswer && guess(p.label)}
                  disabled={showAnswer}
                >
                  <Text style={styles.choiceBtnText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.replayBtn} onPress={() => currentPattern && playPattern(currentPattern.pattern)}>
              <Text style={styles.replayText}>다시 진동</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'result' && (
          <>
            <Text style={{ fontSize: 70 }}>🌟</Text>
            <Text style={styles.resultScore}>{score} / 5</Text>
            <Text style={styles.resultLabel}>
              {score >= 4 ? '🔥 진동 마스터!' : score >= 2 ? '😊 준수한 감각' : '😅 아직은 연습이 필요해'}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#8E8E93' }]} onPress={reset}>
              <Text style={styles.btnText}>다시 하기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-brightness + expo-haptics • Vibration Pattern</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { padding: 8, width: 60 },
  backText: { color: '#8E8E93', fontSize: 15 },
  title: { flex: 1, color: '#FFF', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24 },
  hint: { color: '#8E8E93', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  roundLabel: { color: '#8E8E93', fontSize: 18, fontWeight: '600' },
  scoreText: { color: '#34C759', fontSize: 24, fontWeight: '700' },
  answerText: { color: '#FF9500', fontSize: 18, fontWeight: '700' },
  chooseLabel: { color: '#8E8E93', fontSize: 13, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  choiceBtn: { backgroundColor: '#2C2C2E', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  correctBtn: { backgroundColor: '#1A3A1A', borderWidth: 1, borderColor: '#34C759' },
  choiceBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  replayBtn: { marginTop: 4 },
  replayText: { color: '#8E8E93', fontSize: 14, textDecoration: 'underline' } as any,
  resultScore: { color: '#FFF', fontSize: 72, fontWeight: '900' },
  resultLabel: { color: '#8E8E93', fontSize: 18, fontWeight: '600' },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
