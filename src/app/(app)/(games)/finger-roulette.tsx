import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TouchPoint = { x: number; y: number; id: string };
type Phase = 'waiting' | 'counting' | 'selected';

const COLORS = ['#FF3B30', '#FF9500', '#34C759', '#007AFF', '#AF52DE', '#FF2D55', '#5AC8FA', '#FFCC00'];
const COUNTDOWN_MS = 2500;

export default function FingerRoulette() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('waiting');
  const [fingers, setFingers] = useState<TouchPoint[]>([]);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countStartRef = useRef<number>(0);
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  const startCountdown = () => {
    setPhase('counting');
    countStartRef.current = Date.now();
    countdownRef.current = setInterval(() => {
      const elapsed = Date.now() - countStartRef.current;
      const remaining = Math.ceil((COUNTDOWN_MS - elapsed) / 1000);
      if (remaining > 0) {
        setCountdown(remaining);
        Haptics.selectionAsync();
      } else {
        clearInterval(countdownRef.current!);
        pickWinner();
      }
    }, 100);
  };

  const pickWinner = () => {
    setPhase('selected');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFingers((prev) => {
      if (prev.length === 0) return prev;
      const winner = prev[Math.floor(Math.random() * prev.length)];
      setWinnerId(winner.id);
      return prev;
    });
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const reset = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setPhase('waiting');
    setFingers([]);
    setWinnerId(null);
    setCountdown(3);
  };

  const handleTouchStart = (e: GestureResponderEvent) => {
    if (phase === 'selected') return;
    const allTouches = e.nativeEvent.touches;
    const pts: TouchPoint[] = allTouches.map((t) => ({
      id: t.identifier,
      x: t.pageX,
      y: t.pageY,
    }));
    setFingers(pts);

    if (pts.length >= 2 && phase === 'waiting') {
      startCountdown();
    }
    if (pts.length < 2 && phase === 'counting') {
      clearInterval(countdownRef.current!);
      setPhase('waiting');
      setCountdown(3);
    }
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    if (phase === 'selected') return;
    const allTouches = e.nativeEvent.touches;
    setFingers(allTouches.map((t) => ({ id: t.identifier, x: t.pageX, y: t.pageY })));
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    if (phase === 'selected') return;
    const remaining = e.nativeEvent.touches;
    setFingers(remaining.map((t) => ({ id: t.identifier, x: t.pageX, y: t.pageY })));
    if (remaining.length < 2 && phase === 'counting') {
      clearInterval(countdownRef.current!);
      setPhase('waiting');
      setCountdown(3);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👆 손가락 뽑기</Text>
        <View style={{ width: 60 }} />
      </View>

      <View
        style={styles.touchArea}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
      >
        {phase === 'waiting' && fingers.length === 0 && (
          <Text style={styles.hint}>여기에 모두 손가락을 올려주세요{'\n'}(2명 이상)</Text>
        )}

        {phase === 'counting' && (
          <View style={styles.countdownBox}>
            <Text style={styles.countdownNum}>{countdown}</Text>
          </View>
        )}

        {phase === 'selected' && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>🎯 선택됨!</Text>
          </View>
        )}

        {fingers.map((f, i) => {
          const isWinner = phase === 'selected' && f.id === winnerId;
          const color = COLORS[i % COLORS.length];
          return (
            <Animated.View
              key={f.id}
              style={[
                styles.dot,
                {
                  left: f.x - 40,
                  top: f.y - 40,
                  backgroundColor: color,
                  transform: [{ scale: isWinner ? 1.6 : 1 }],
                  opacity: phase === 'selected' && !isWinner ? 0.25 : 1,
                  borderWidth: isWinner ? 4 : 0,
                  borderColor: '#FFF',
                },
              ]}
            />
          );
        })}
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        {phase === 'waiting' && fingers.length > 0 && fingers.length < 2 && (
          <Text style={styles.bottomText}>손가락 1개 더 올려주세요</Text>
        )}
        {phase === 'counting' && (
          <Text style={styles.bottomText}>손가락 {fingers.length}개 감지 중... {countdown}초 후 선택</Text>
        )}
        {phase === 'selected' && (
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetBtnText}>다시 하기</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.footerText}>react-native-gesture-handler • Multi-touch</Text>
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
  touchArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hint: { color: '#48484A', fontSize: 17, textAlign: 'center', lineHeight: 26 },
  countdownBox: { position: 'absolute' },
  countdownNum: { color: '#FFFFFF', fontSize: 120, fontWeight: '900', opacity: 0.2 },
  resultBox: { position: 'absolute', top: 40 },
  resultTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  dot: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.9,
  },
  bottomBar: { padding: 16, alignItems: 'center', gap: 8 },
  bottomText: { color: '#8E8E93', fontSize: 14 },
  resetBtn: { backgroundColor: '#FF9500', paddingHorizontal: 36, paddingVertical: 14, borderRadius: 30 },
  resetBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
