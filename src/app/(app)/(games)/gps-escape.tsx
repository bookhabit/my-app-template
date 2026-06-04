import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'calibrating' | 'playing' | 'eliminated' | 'survived';

const BOUNDARY_RADIUS = 10; // meters
const GAME_DURATION = 30;

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function GpsEscape() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [distance, setDistance] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const originRef = useRef<{ lat: number; lon: number } | null>(null);
  const subRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
    return () => { subRef.current?.remove(); if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const calibrate = async () => {
    setPhase('calibrating');
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    originRef.current = { lat: loc.coords.latitude, lon: loc.coords.longitude };
    startGame();
  };

  const startGame = () => {
    setPhase('playing');
    setDistance(0);
    setTimeLeft(GAME_DURATION);

    subRef.current = Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 1 },
      (loc) => {
        if (!originRef.current) return;
        const d = getDistance(
          originRef.current.lat, originRef.current.lon,
          loc.coords.latitude, loc.coords.longitude
        );
        setDistance(d);
        if (d > BOUNDARY_RADIUS) {
          subRef.current?.remove();
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase('eliminated');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    ) as any;

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      setTimeLeft(GAME_DURATION - elapsed);
      if (elapsed >= GAME_DURATION) {
        subRef.current?.remove();
        clearInterval(timerRef.current!);
        setPhase('survived');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 1000);
  };

  const reset = () => {
    subRef.current?.remove();
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('idle');
    setDistance(0);
    originRef.current = null;
  };

  const ratio = Math.min(distance / BOUNDARY_RADIUS, 1);
  const gaugeColor = ratio < 0.5 ? '#34C759' : ratio < 0.8 ? '#FF9500' : '#FF3B30';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📍 반경 탈출 게임</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {hasPermission === false && (
          <Text style={styles.errorText}>위치 권한이 필요합니다</Text>
        )}

        {phase === 'idle' && hasPermission !== false && (
          <>
            <Text style={{ fontSize: 70 }}>📍</Text>
            <Text style={styles.hint}>
              시작 위치에서 {BOUNDARY_RADIUS}m 벗어나면 탈락!{'\n'}
              30초 동안 원 안에 머물러라
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#45B7D1' }]} onPress={calibrate}>
              <Text style={styles.btnText}>위치 설정 후 시작</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'calibrating' && (
          <>
            <Text style={{ fontSize: 60 }}>📡</Text>
            <Text style={styles.hint}>현재 위치를 잡는 중...</Text>
          </>
        )}

        {phase === 'playing' && (
          <>
            {/* 원형 레이더 */}
            <View style={styles.radar}>
              <View style={[styles.radarBoundary, { borderColor: gaugeColor }]} />
              <View style={[styles.radarDot, {
                transform: [
                  { translateX: Math.min(ratio * 90, 80) * Math.cos(Math.random() * Math.PI * 2) },
                  { translateY: Math.min(ratio * 90, 80) * Math.sin(Math.random() * Math.PI * 2) },
                ],
                backgroundColor: gaugeColor,
              }]} />
            </View>
            <Text style={styles.timer}>{timeLeft}초</Text>
            <Text style={[styles.distText, { color: gaugeColor }]}>
              {distance.toFixed(1)}m / {BOUNDARY_RADIUS}m
            </Text>
          </>
        )}

        {phase === 'eliminated' && (
          <>
            <Text style={{ fontSize: 70 }}>❌</Text>
            <Text style={styles.elimText}>탈락!</Text>
            <Text style={styles.elimSub}>{distance.toFixed(1)}m — 반경 초과</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#45B7D1' }]} onPress={reset}>
              <Text style={styles.btnText}>다시 하기</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'survived' && (
          <>
            <Text style={{ fontSize: 70 }}>🏆</Text>
            <Text style={styles.successText}>생존!</Text>
            <Text style={styles.elimSub}>30초 동안 반경 내 유지 성공</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#45B7D1' }]} onPress={reset}>
              <Text style={styles.btnText}>다시 하기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-location • GPS • Haversine 거리 계산</Text>
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
  errorText: { color: '#FF3B30', fontSize: 15 },
  hint: { color: '#8E8E93', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  radar: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  radarBoundary: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 2 },
  radarDot: { width: 16, height: 16, borderRadius: 8, position: 'absolute' },
  timer: { color: '#FFF', fontSize: 52, fontWeight: '900' },
  distText: { fontSize: 20, fontWeight: '700' },
  elimText: { color: '#FF3B30', fontSize: 52, fontWeight: '900' },
  elimSub: { color: '#8E8E93', fontSize: 15 },
  successText: { color: '#34C759', fontSize: 52, fontWeight: '900' },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
