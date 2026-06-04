import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'playing' | 'exploded';

const EXPLOSION_THRESHOLD = 120;
const UPDATE_INTERVAL = 50;

export default function ShakeBomb() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [shakeLevel, setShakeLevel] = useState(0);
  const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
  const levelRef = useRef(0);
  const lastValsRef = useRef({ x: 0, y: 0, z: 0 });

  const stop = () => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    Accelerometer.setUpdateInterval(200);
  };

  useEffect(() => () => stop(), []);

  const start = () => {
    levelRef.current = 0;
    setShakeLevel(0);
    setPhase('playing');
    Accelerometer.setUpdateInterval(UPDATE_INTERVAL);

    subscriptionRef.current = Accelerometer.addListener(({ x, y, z }) => {
      const prev = lastValsRef.current;
      const delta =
        Math.abs(x - prev.x) + Math.abs(y - prev.y) + Math.abs(z - prev.z);
      lastValsRef.current = { x, y, z };

      if (delta > 0.3) {
        levelRef.current = Math.min(levelRef.current + delta * 2, EXPLOSION_THRESHOLD);
        setShakeLevel(levelRef.current);

        if (levelRef.current >= EXPLOSION_THRESHOLD) {
          stop();
          setPhase('exploded');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          const ratio = levelRef.current / EXPLOSION_THRESHOLD;
          Haptics.impactAsync(
            ratio < 0.4
              ? Haptics.ImpactFeedbackStyle.Light
              : ratio < 0.75
                ? Haptics.ImpactFeedbackStyle.Medium
                : Haptics.ImpactFeedbackStyle.Heavy
          );
        }
      }
    });
  };

  const reset = () => {
    stop();
    levelRef.current = 0;
    setShakeLevel(0);
    setPhase('idle');
  };

  const ratio = shakeLevel / EXPLOSION_THRESHOLD;
  const pct = Math.round(ratio * 100);
  const gaugeColor = ratio < 0.5 ? '#34C759' : ratio < 0.75 ? '#FF9500' : '#FF3B30';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🫙 탄산 폭발 룰렛</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {phase === 'exploded' ? (
          <>
            <Text style={{ fontSize: 90 }}>💥</Text>
            <Text style={styles.boomText}>BOOM!</Text>
            <Text style={styles.boomSub}>손에 든 사람이 벌칙!</Text>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 90 }}>{ratio < 0.5 ? '🫙' : ratio < 0.8 ? '😰' : '😱'}</Text>

            <View style={styles.circleTrack}>
              <View
                style={[
                  styles.circleFill,
                  {
                    height: `${pct}%`,
                    backgroundColor: gaugeColor,
                  },
                ]}
              />
              <Text style={styles.pctText}>{pct}%</Text>
            </View>

            {phase === 'idle' && (
              <Text style={styles.hint}>
                흔들수록 폭발 위험이 올라갑니다{'\n'}친구에게 돌려가며 흔들어라!
              </Text>
            )}
            {phase === 'playing' && (
              <Text style={[styles.dangerLabel, { color: gaugeColor }]}>
                {ratio < 0.5 ? '안전' : ratio < 0.75 ? '⚠️ 위험' : '🚨 터진다!!!'}
              </Text>
            )}
          </>
        )}

        {phase === 'idle' && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF6B6B' }]} onPress={start}>
            <Text style={styles.btnText}>시작</Text>
          </TouchableOpacity>
        )}
        {phase === 'playing' && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#3A3A3C' }]} onPress={reset}>
            <Text style={styles.btnText}>중단</Text>
          </TouchableOpacity>
        )}
        {phase === 'exploded' && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF6B6B' }]} onPress={reset}>
            <Text style={styles.btnText}>다시 하기</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-sensors • Accelerometer</Text>
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
  circleTrack: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2C2C2E',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 3,
    borderColor: '#3A3A3C',
  },
  circleFill: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  pctText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    position: 'absolute',
    alignSelf: 'center',
    top: '35%',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  hint: { color: '#8E8E93', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  dangerLabel: { fontSize: 20, fontWeight: '800' },
  boomText: { color: '#FF3B30', fontSize: 52, fontWeight: '900' },
  boomSub: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
