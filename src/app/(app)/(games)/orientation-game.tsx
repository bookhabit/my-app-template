import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'waiting' | 'react' | 'result';
type Command = 'LANDSCAPE_LEFT' | 'LANDSCAPE_RIGHT' | 'PORTRAIT' | 'UPSIDE_DOWN';

const COMMANDS: Record<Command, { label: string; emoji: string; orientation: ScreenOrientation.Orientation }> = {
  PORTRAIT: { label: '세로 정방향', emoji: '📱', orientation: ScreenOrientation.Orientation.PORTRAIT_UP },
  UPSIDE_DOWN: { label: '거꾸로!', emoji: '🙃', orientation: ScreenOrientation.Orientation.PORTRAIT_DOWN },
  LANDSCAPE_LEFT: { label: '왼쪽으로!', emoji: '◀️', orientation: ScreenOrientation.Orientation.LANDSCAPE_LEFT },
  LANDSCAPE_RIGHT: { label: '오른쪽으로!', emoji: '▶️', orientation: ScreenOrientation.Orientation.LANDSCAPE_RIGHT },
};

const ROUNDS = 5;

export default function OrientationGame() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [currentCmd, setCurrentCmd] = useState<Command | null>(null);
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [currentOrientation, setCurrentOrientation] = useState<ScreenOrientation.Orientation | null>(null);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subRef = useRef<ScreenOrientation.Subscription | null>(null);

  useEffect(() => {
    subRef.current = ScreenOrientation.addOrientationChangeListener((e) => {
      setCurrentOrientation(e.orientationInfo.orientation);
    });
    return () => {
      subRef.current?.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'react' || !currentCmd || currentOrientation === null) return;
    const target = COMMANDS[currentCmd].orientation;
    if (currentOrientation === target) {
      const ms = Date.now() - startTimeRef.current;
      setReactionMs(ms);
      setScores((prev) => [...prev, ms]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (round + 1 >= ROUNDS) {
        setTimeout(() => setPhase('result'), 600);
      } else {
        setTimeout(() => nextRound(round + 1), 600);
      }
    }
  }, [currentOrientation]);

  const startGame = async () => {
    await ScreenOrientation.unlockAsync();
    setScores([]);
    setRound(0);
    nextRound(0);
  };

  const nextRound = (r: number) => {
    setRound(r);
    setCurrentCmd(null);
    setReactionMs(null);
    setPhase('waiting');

    const delay = 1500 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      const keys = Object.keys(COMMANDS) as Command[];
      const cmd = keys[Math.floor(Math.random() * keys.length)];
      setCurrentCmd(cmd);
      setPhase('react');
      startTimeRef.current = Date.now();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, delay);
  };

  const reset = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    setPhase('idle');
    setScores([]);
    setCurrentCmd(null);
  };

  const avgMs = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔄 화면 뒤집기 반응 게임</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {phase === 'idle' && (
          <>
            <Text style={{ fontSize: 70 }}>🔄</Text>
            <Text style={styles.hint}>
              화면에 표시된 방향으로{'\n'}최대한 빠르게 폰을 돌리세요!{'\n'}
              총 {ROUNDS}라운드
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF9500' }]} onPress={startGame}>
              <Text style={styles.btnText}>시작!</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'waiting' && (
          <>
            <Text style={styles.roundText}>{round + 1} / {ROUNDS}</Text>
            <Text style={{ fontSize: 60 }}>⏳</Text>
            <Text style={styles.waitText}>준비...</Text>
          </>
        )}

        {phase === 'react' && currentCmd && (
          <>
            <Text style={styles.roundText}>{round + 1} / {ROUNDS}</Text>
            <Text style={styles.cmdEmoji}>{COMMANDS[currentCmd].emoji}</Text>
            <Text style={styles.cmdLabel}>{COMMANDS[currentCmd].label}</Text>
            {reactionMs !== null && (
              <Text style={styles.reactionMs}>{reactionMs}ms ✅</Text>
            )}
          </>
        )}

        {phase === 'result' && (
          <>
            <Text style={{ fontSize: 70 }}>🏆</Text>
            <Text style={styles.avgText}>{avgMs}ms</Text>
            <Text style={styles.avgLabel}>평균 반응속도</Text>
            <View style={styles.scoreList}>
              {scores.map((s, i) => (
                <Text key={i} style={styles.scoreItem}>Round {i + 1}: {s}ms</Text>
              ))}
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF9500' }]} onPress={reset}>
              <Text style={styles.btnText}>다시 하기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-screen-orientation • OrientationChangeListener</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32 },
  hint: { color: '#8E8E93', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  roundText: { color: '#8E8E93', fontSize: 18, fontWeight: '600' },
  waitText: { color: '#48484A', fontSize: 32, fontWeight: '700' },
  cmdEmoji: { fontSize: 90 },
  cmdLabel: { color: '#FFF', fontSize: 36, fontWeight: '900', textAlign: 'center' },
  reactionMs: { color: '#34C759', fontSize: 20, fontWeight: '700' },
  avgText: { color: '#FF9500', fontSize: 72, fontWeight: '900' },
  avgLabel: { color: '#8E8E93', fontSize: 16 },
  scoreList: { gap: 6 },
  scoreItem: { color: '#8E8E93', fontSize: 14 },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
