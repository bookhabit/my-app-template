import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { LightSensor } from 'expo-sensors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// LightSensor는 Android 전용 (iOS 미지원)
type Phase = 'idle' | 'playing' | 'result';

const GAME_DURATION = 10;
const DARK_THRESHOLD = 5; // lux 이하 = "근접"

export default function LightProximity() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [lux, setLux] = useState<number | null>(null);
  const [isNear, setIsNear] = useState(false);
  const [nearMs, setNearMs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const subRef = useRef<ReturnType<typeof LightSensor.addListener> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nearRef = useRef(false);
  const nearAccumRef = useRef(0);

  useEffect(() => {
    LightSensor.isAvailableAsync().then(setIsAvailable);
    return () => { subRef.current?.remove(); if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const start = () => {
    setPhase('playing');
    setNearMs(0);
    setTimeLeft(GAME_DURATION);
    nearRef.current = false;
    nearAccumRef.current = 0;

    LightSensor.setUpdateInterval(100);
    subRef.current = LightSensor.addListener(({ illuminance }) => {
      setLux(illuminance);
      const near = illuminance < DARK_THRESHOLD;
      setIsNear(near);
      nearRef.current = near;
      if (near) Haptics.selectionAsync();
    });

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      if (nearRef.current) {
        nearAccumRef.current += 100;
        setNearMs((ms) => ms + 100);
      }
      elapsed += 1;
      setTimeLeft(GAME_DURATION - elapsed);
      if (elapsed >= GAME_DURATION) {
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
    setLux(null);
    setIsNear(false);
    setNearMs(0);
  };

  const nearSec = (nearMs / 1000).toFixed(1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👃 광센서 근접 게임</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {isAvailable === false ? (
          <>
            <Text style={{ fontSize: 60 }}>⚠️</Text>
            <Text style={styles.unavailText}>
              광센서(LightSensor)는{'\n'}Android 전용 기능입니다{'\n'}iOS에서는 지원되지 않습니다
            </Text>
          </>
        ) : (
          <>
            {phase === 'idle' && (
              <>
                <Text style={{ fontSize: 80 }}>👃</Text>
                <Text style={styles.hint}>
                  폰에 코를 최대한 가까이 대세요!{'\n'}
                  광센서가 어두워지면 "근접" 판정{'\n\n'}
                  Android 전용 기능입니다
                </Text>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF6B6B' }]} onPress={start}>
                  <Text style={styles.btnText}>시작</Text>
                </TouchableOpacity>
              </>
            )}

            {phase === 'playing' && (
              <>
                <Text style={styles.luxDisplay}>{lux !== null ? `${lux.toFixed(0)} lux` : '측정 중...'}</Text>
                <View style={[styles.sensorBox, { backgroundColor: isNear ? '#FF6B6B22' : '#1C1C1E', borderColor: isNear ? '#FF6B6B' : '#3A3A3C' }]}>
                  <Text style={{ fontSize: 60 }}>{isNear ? '👃💨' : '😐'}</Text>
                  <Text style={[styles.nearLabel, { color: isNear ? '#FF6B6B' : '#48484A' }]}>
                    {isNear ? '근접 감지!' : '폰에 코를 대세요'}
                  </Text>
                </View>
                <Text style={styles.timer}>{timeLeft}초 남음</Text>
                <Text style={styles.accumText}>근접 누적: {nearSec}초</Text>
              </>
            )}

            {phase === 'result' && (
              <>
                <Text style={{ fontSize: 70 }}>📊</Text>
                <Text style={styles.resultScore}>{nearSec}초</Text>
                <Text style={styles.resultLabel}>폰에 코를 댄 시간</Text>
                <Text style={styles.resultSub}>
                  {parseFloat(nearSec) >= 7 ? '🥇 코 달인!' : parseFloat(nearSec) >= 4 ? '😅 꽤 가까이 댔네요' : '🤔 더 가까이 해보세요'}
                </Text>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF6B6B' }]} onPress={reset}>
                  <Text style={styles.btnText}>다시 하기</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-sensors • LightSensor (Android only)</Text>
        <Text style={styles.footerSub}>임계값: {DARK_THRESHOLD} lux 이하 = 근접</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 32 },
  unavailText: { color: '#FF9500', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  hint: { color: '#8E8E93', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  luxDisplay: { color: '#8E8E93', fontSize: 18, fontWeight: '600' },
  sensorBox: {
    width: 200, height: 200, borderRadius: 100, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nearLabel: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  timer: { color: '#FFF', fontSize: 28, fontWeight: '700' },
  accumText: { color: '#FF6B6B', fontSize: 16, fontWeight: '600' },
  resultScore: { color: '#FF6B6B', fontSize: 72, fontWeight: '900' },
  resultLabel: { color: '#8E8E93', fontSize: 16 },
  resultSub: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: 12, alignItems: 'center', gap: 4 },
  footerText: { color: '#3A3A3C', fontSize: 12 },
  footerSub: { color: '#3A3A3C', fontSize: 11 },
});
