import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AudioModule, RecordingPresets, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'countdown' | 'recording' | 'result';

const RECORD_DURATION = 3;

export default function ScreamBattle() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [countNum, setCountNum] = useState(3);
  const [timeLeft, setTimeLeft] = useState(RECORD_DURATION);
  const [currentDb, setCurrentDb] = useState<number>(-160);
  const [maxDb, setMaxDb] = useState<number>(-160);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const maxRef = useRef<number>(-160);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(recorder, 80);

  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync().then(({ granted }) => setHasPermission(granted));
    return () => stopAll();
  }, []);

  const stopAll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (meterRef.current) clearInterval(meterRef.current);
    try { recorder.stop(); } catch {}
  };

  const begin = async () => {
    setPhase('countdown');
    setCountNum(3);
    let count = 3;

    const cd = setInterval(() => {
      count -= 1;
      setCountNum(count);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (count <= 0) {
        clearInterval(cd);
        startRecording();
      }
    }, 1000);
  };

  const startRecording = async () => {
    setPhase('recording');
    maxRef.current = -160;
    setCurrentDb(-160);
    setTimeLeft(RECORD_DURATION);

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (e) {
      console.warn('Recording error:', e);
    }

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      setTimeLeft(RECORD_DURATION - elapsed);
      if (elapsed >= RECORD_DURATION) {
        clearInterval(timerRef.current!);
        clearInterval(meterRef.current!);
        recorder.stop();
        setMaxDb(maxRef.current);
        setPhase('result');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 1000);

    meterRef.current = setInterval(() => {
      const db = recorderState.metering ?? -160;
      setCurrentDb(db);
      if (db > maxRef.current) {
        maxRef.current = db;
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.2, duration: 80, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();
      }
    }, 80);
  };

  const reset = () => {
    stopAll();
    setPhase('idle');
    setCurrentDb(-160);
    setMaxDb(-160);
    setTimeLeft(RECORD_DURATION);
  };

  const dbNorm = Math.max(0, Math.min(1, (currentDb + 80) / 60));
  const maxNorm = Math.max(0, Math.min(1, (maxDb + 80) / 60));

  const getRank = (norm: number) => {
    if (norm > 0.85) return { label: '🔥 전설급', color: '#FF3B30' };
    if (norm > 0.7) return { label: '😤 강력한', color: '#FF9500' };
    if (norm > 0.5) return { label: '😬 보통', color: '#FFCC00' };
    return { label: '🥲 조용했어요', color: '#8E8E93' };
  };

  const rank = getRank(maxNorm);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📢 비명 크기 배틀</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {phase === 'idle' && (
          <>
            <Text style={{ fontSize: 80 }}>📢</Text>
            <Text style={styles.hint}>3초 동안 최대한 크게 외쳐라!{'\n'}최고 데시벨이 기록됩니다</Text>
            {hasPermission === false && (
              <Text style={styles.errorText}>마이크 권한이 필요합니다</Text>
            )}
            {hasPermission && (
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#FFEAA7' }]} onPress={begin}>
                <Text style={[styles.btnText, { color: '#000' }]}>준비!</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {phase === 'countdown' && (
          <Text style={styles.bigCountdown}>{countNum}</Text>
        )}

        {phase === 'recording' && (
          <>
            <Text style={styles.recTimer}>{timeLeft}초</Text>
            <Animated.Text style={[styles.micEmoji, { transform: [{ scale: scaleAnim }] }]}>
              🎤
            </Animated.Text>
            <View style={styles.dbBarWrap}>
              <View style={[styles.dbFill, { height: `${dbNorm * 100}%`, backgroundColor: '#FFEAA7' }]} />
            </View>
            <Text style={styles.dbNow}>
              {currentDb > -160 ? `${currentDb.toFixed(0)} dB` : '...'}
            </Text>
          </>
        )}

        {phase === 'result' && (
          <>
            <Text style={{ fontSize: 70 }}>{maxNorm > 0.7 ? '🔥' : '📊'}</Text>
            <Text style={[styles.resultScore, { color: rank.color }]}>{maxDb.toFixed(0)} dB</Text>
            <Text style={[styles.resultRank, { color: rank.color }]}>{rank.label}</Text>
            <View style={styles.maxBarWrap}>
              <View style={[styles.maxBarFill, { width: `${maxNorm * 100}%`, backgroundColor: rank.color }]} />
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#FFEAA7' }]} onPress={reset}>
              <Text style={[styles.btnText, { color: '#000' }]}>다시 하기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-audio • Microphone Metering</Text>
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
  errorText: { color: '#FF3B30', fontSize: 14 },
  bigCountdown: { color: '#FFF', fontSize: 140, fontWeight: '900' },
  recTimer: { color: '#FFEAA7', fontSize: 60, fontWeight: '900' },
  micEmoji: { fontSize: 80 },
  dbBarWrap: {
    width: 60,
    height: 200,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  dbFill: { width: '100%', borderRadius: 10 },
  dbNow: { color: '#8E8E93', fontSize: 16 },
  resultScore: { fontSize: 72, fontWeight: '900' },
  resultRank: { fontSize: 22, fontWeight: '700' },
  maxBarWrap: { width: '100%', height: 14, backgroundColor: '#2C2C2E', borderRadius: 7, overflow: 'hidden' },
  maxBarFill: { height: '100%', borderRadius: 7 },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginTop: 8 },
  btnText: { fontSize: 18, fontWeight: '700' },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
