import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AudioModule, RecordingPresets, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'playing' | 'eliminated' | 'survived';

const GAME_DURATION = 10;
const DB_THRESHOLD = -35;

export default function SilenceGame() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentDb, setCurrentDb] = useState<number>(-160);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(recorder, 100);

  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync().then(({ granted }) => {
      setHasPermission(granted);
    });
    return () => stopAll();
  }, []);

  const stopAll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (meterRef.current) clearInterval(meterRef.current);
    try { recorder.stop(); } catch {}
  };

  const start = async () => {
    if (!hasPermission) return;
    setPhase('playing');
    setTimeLeft(GAME_DURATION);
    setCurrentDb(-160);

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (e) {
      console.warn('Recording error:', e);
    }

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      setTimeLeft(GAME_DURATION - elapsed);
      if (elapsed >= GAME_DURATION) {
        clearInterval(timerRef.current!);
        clearInterval(meterRef.current!);
        recorder.stop();
        setPhase('survived');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 1000);

    meterRef.current = setInterval(() => {
      const db = recorderState.metering ?? -160;
      setCurrentDb(db);
      if (db > DB_THRESHOLD) {
        clearInterval(timerRef.current!);
        clearInterval(meterRef.current!);
        recorder.stop();
        setPhase('eliminated');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }, 100);
  };

  const reset = () => {
    stopAll();
    setPhase('idle');
    setTimeLeft(GAME_DURATION);
    setCurrentDb(-160);
  };

  const dbNorm = Math.max(0, Math.min(1, (currentDb + 80) / 60));
  const gaugeColor = dbNorm < 0.4 ? '#34C759' : dbNorm < 0.65 ? '#FF9500' : '#FF3B30';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🤫 침묵 생존</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {phase === 'idle' && (
          <>
            <Text style={{ fontSize: 80 }}>🤫</Text>
            <Text style={styles.hint}>
              {GAME_DURATION}초 동안 침묵을 유지하세요{'\n'}소리가 감지되면 즉시 탈락!
            </Text>
            {hasPermission === false && (
              <Text style={styles.errorText}>마이크 권한이 필요합니다</Text>
            )}
          </>
        )}

        {phase === 'playing' && (
          <>
            <Text style={styles.timer}>{timeLeft}</Text>
            <Text style={styles.timerSub}>초 남음</Text>
            <View style={styles.dbBar}>
              <View style={[styles.dbFill, { width: `${dbNorm * 100}%`, backgroundColor: gaugeColor }]} />
            </View>
            <Text style={[styles.dbLabel, { color: gaugeColor }]}>
              {currentDb > -160 ? `${currentDb.toFixed(0)} dB` : '측정 중...'}
            </Text>
          </>
        )}

        {phase === 'eliminated' && (
          <>
            <Text style={{ fontSize: 80 }}>❌</Text>
            <Text style={styles.elimText}>탈락!</Text>
            <Text style={styles.elimSub}>소리가 감지되었습니다 ({currentDb.toFixed(0)} dB)</Text>
          </>
        )}

        {phase === 'survived' && (
          <>
            <Text style={{ fontSize: 80 }}>🏆</Text>
            <Text style={styles.survivedText}>생존!</Text>
            <Text style={styles.survivedSub}>{GAME_DURATION}초 동안 침묵 성공</Text>
          </>
        )}

        {phase === 'idle' && hasPermission !== false && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#96CEB4' }]} onPress={start}>
            <Text style={[styles.btnText, { color: '#000' }]}>시작</Text>
          </TouchableOpacity>
        )}
        {(phase === 'eliminated' || phase === 'survived') && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#96CEB4' }]} onPress={reset}>
            <Text style={[styles.btnText, { color: '#000' }]}>다시 하기</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-audio • Microphone Metering</Text>
        <Text style={styles.footerSub}>임계값: {DB_THRESHOLD} dB</Text>
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
  timer: { color: '#FFF', fontSize: 100, fontWeight: '900' },
  timerSub: { color: '#8E8E93', fontSize: 16, marginTop: -16 },
  dbBar: { width: '100%', height: 16, backgroundColor: '#2C2C2E', borderRadius: 8, overflow: 'hidden', marginTop: 8 },
  dbFill: { height: '100%', borderRadius: 8 },
  dbLabel: { fontSize: 15, fontWeight: '600' },
  elimText: { color: '#FF3B30', fontSize: 60, fontWeight: '900' },
  elimSub: { color: '#8E8E93', fontSize: 15 },
  survivedText: { color: '#34C759', fontSize: 60, fontWeight: '900' },
  survivedSub: { color: '#8E8E93', fontSize: 15 },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginTop: 8 },
  btnText: { fontSize: 18, fontWeight: '700' },
  footer: { padding: 16, alignItems: 'center', gap: 4 },
  footerText: { color: '#3A3A3C', fontSize: 12 },
  footerSub: { color: '#3A3A3C', fontSize: 11 },
});
