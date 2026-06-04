import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { DeviceMotion } from 'expo-sensors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'category' | 'ready' | 'playing' | 'result';

const CATEGORIES: Record<string, string[]> = {
  '🎬 영화/드라마': ['기생충', '오징어게임', '더글로리', '이상한변호사우영우', '범죄도시', '미나리'],
  '🎵 노래': ['아이유', 'BTS', '뉴진스', '에스파', '세븐틴', '르세라핌'],
  '🐾 동물': ['기린', '하마', '바다코끼리', '문어', '알파카', '카피바라'],
  '🍔 음식': ['삼겹살', '순대국밥', '떡볶이', '마라탕', '치킨', '라멘'],
  '⚽ 스포츠': ['축구', '야구', '배구', '테니스', '수영', '탁구'],
};

const ROUND_TIME = 60;
const TILT_THRESHOLD = 0.7;

export default function HeadsUp() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [feedback, setFeedback] = useState<'correct' | 'pass' | null>(null);
  const subRef = useRef<ReturnType<typeof DeviceMotion.addListener> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const baselineRef = useRef<number>(0);
  const feedbackRef = useRef<boolean>(false);

  const stop = () => {
    subRef.current?.remove();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => () => stop(), []);

  const selectCategory = (cat: string) => {
    setSelectedCategory(cat);
    const shuffled = [...CATEGORIES[cat]].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setPhase('ready');
  };

  const startGame = () => {
    setWordIndex(0);
    setScore(0);
    setPassed(0);
    setTimeLeft(ROUND_TIME);
    setFeedback(null);
    feedbackRef.current = false;
    setPhase('playing');

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stop();
          setPhase('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    DeviceMotion.setUpdateInterval(100);
    let calibrated = false;
    subRef.current = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation) return;
      const beta = rotation.beta ?? 0;

      if (!calibrated) {
        baselineRef.current = beta;
        calibrated = true;
        return;
      }

      if (feedbackRef.current) return;

      const delta = beta - baselineRef.current;

      if (delta > TILT_THRESHOLD) {
        // 앞으로 기울임 → 정답
        feedbackRef.current = true;
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setScore((s) => s + 1);
        setTimeout(() => {
          feedbackRef.current = false;
          setFeedback(null);
          setWordIndex((i) => i + 1);
          baselineRef.current = beta;
        }, 800);
      } else if (delta < -TILT_THRESHOLD) {
        // 뒤로 기울임 → 패스
        feedbackRef.current = true;
        setFeedback('pass');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setPassed((p) => p + 1);
        setTimeout(() => {
          feedbackRef.current = false;
          setFeedback(null);
          setWordIndex((i) => i + 1);
          baselineRef.current = beta;
        }, 800);
      }
    });
  };

  const currentWord = words[wordIndex % words.length];
  const bgColor =
    feedback === 'correct' ? '#0D3B1A' : feedback === 'pass' ? '#3B0D0D' : '#0A0A0A';

  if (phase === 'category') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎭 이마 위에서 맞춰봐</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={styles.catList}>
          <Text style={styles.catTitle}>카테고리 선택</Text>
          {Object.keys(CATEGORIES).map((cat) => (
            <TouchableOpacity key={cat} style={styles.catCard} onPress={() => selectCategory(cat)}>
              <Text style={styles.catText}>{cat}</Text>
              <Text style={styles.catArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (phase === 'ready') {
    return (
      <View style={[styles.container, styles.centerFull, { paddingTop: insets.top }]}>
        <Text style={{ fontSize: 60 }}>🎭</Text>
        <Text style={styles.readyTitle}>폰을 이마에 대세요</Text>
        <Text style={styles.readySub}>
          앞으로 기울이면 ✅ 정답{'\n'}뒤로 기울이면 ❌ 패스
        </Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#4ECDC4' }]} onPress={startGame}>
          <Text style={styles.btnText}>시작!</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>expo-sensors • DeviceMotion</Text>
      </View>
    );
  }

  if (phase === 'result') {
    return (
      <View style={[styles.container, styles.centerFull, { paddingTop: insets.top }]}>
        <Text style={{ fontSize: 70 }}>🏆</Text>
        <Text style={styles.resultScore}>{score}점</Text>
        <Text style={styles.resultSub}>정답 {score}개 / 패스 {passed}개</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#4ECDC4', marginTop: 24 }]} onPress={() => setPhase('category')}>
          <Text style={styles.btnText}>다시 하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => { stop(); router.back(); }}>
          <Text style={{ color: '#8E8E93', fontSize: 15 }}>나가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // playing
  return (
    <View style={[styles.container, styles.centerFull, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      <View style={styles.playHeader}>
        <Text style={styles.timerText}>{timeLeft}초</Text>
        <Text style={styles.scoreText}>✅ {score}점</Text>
      </View>

      <Text style={styles.wordText}>{currentWord}</Text>

      {feedback === 'correct' && <Text style={styles.feedbackText}>✅ 정답!</Text>}
      {feedback === 'pass' && <Text style={[styles.feedbackText, { color: '#FF3B30' }]}>❌ 패스</Text>}

      <Text style={styles.tiltHint}>앞으로 → 정답 / 뒤로 → 패스</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  centerFull: { alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { padding: 8, width: 60 },
  backText: { color: '#8E8E93', fontSize: 15 },
  title: { flex: 1, color: '#FFF', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  catList: { padding: 20, gap: 12 },
  catTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  catCard: {
    backgroundColor: '#1C1C1E',
    padding: 18,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  catText: { flex: 1, color: '#FFF', fontSize: 17, fontWeight: '600' },
  catArrow: { color: '#48484A', fontSize: 22 },
  readyTitle: { color: '#FFF', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  readySub: { color: '#8E8E93', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  playHeader: { flexDirection: 'row', gap: 40, marginBottom: 24 },
  timerText: { color: '#8E8E93', fontSize: 28, fontWeight: '700' },
  scoreText: { color: '#34C759', fontSize: 28, fontWeight: '700' },
  wordText: { color: '#FFF', fontSize: 48, fontWeight: '900', textAlign: 'center' },
  feedbackText: { color: '#34C759', fontSize: 32, fontWeight: '800' },
  tiltHint: { color: '#48484A', fontSize: 14, marginTop: 16 },
  resultScore: { color: '#4ECDC4', fontSize: 72, fontWeight: '900' },
  resultSub: { color: '#8E8E93', fontSize: 18 },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footerText: { color: '#3A3A3C', fontSize: 12, marginTop: 8 },
});
