import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'countdown' | 'captured';

export default function SelfieSnap() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('idle');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [snapIn, setSnapIn] = useState<number | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
  }, []);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.permText}>카메라 권한이 필요합니다</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.btnText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startCountdown = () => {
    const delay = 2000 + Math.random() * 8000;
    const snapTime = Math.round(delay / 1000);
    setSnapIn(snapTime);
    setPhase('countdown');

    let remaining = snapTime;
    tickRef.current = setInterval(() => {
      remaining -= 1;
      setSnapIn(remaining);
      if (remaining <= 3) Haptics.selectionAsync();
      if (remaining <= 0) {
        clearInterval(tickRef.current!);
      }
    }, 1000);

    timerRef.current = setTimeout(async () => {
      clearInterval(tickRef.current!);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (photo) {
        setPhotoUri(photo.uri);
        setPhase('captured');
      }
    }, delay);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    setPhase('idle');
    setPhotoUri(null);
    setSnapIn(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📸 표정 타임캡슐</Text>
        <View style={{ width: 60 }} />
      </View>

      {phase !== 'captured' ? (
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="front">
            {phase === 'countdown' && snapIn !== null && (
              <View style={styles.overlay}>
                <Text style={styles.snapInText}>{snapIn > 0 ? `${snapIn}초 후 촬영...` : '📸'}</Text>
              </View>
            )}
          </CameraView>
        </View>
      ) : (
        <View style={styles.photoContainer}>
          {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}
          <View style={styles.photoLabel}>
            <Text style={styles.photoLabelText}>📸 이게 네 표정이야</Text>
          </View>
        </View>
      )}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        {phase === 'idle' && (
          <>
            <Text style={styles.hintText}>언제 찍힐지 모릅니다 (2~10초)</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#5856D6' }]} onPress={startCountdown}>
              <Text style={styles.btnText}>시작</Text>
            </TouchableOpacity>
          </>
        )}
        {phase === 'countdown' && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#3A3A3C' }]} onPress={reset}>
            <Text style={styles.btnText}>취소</Text>
          </TouchableOpacity>
        )}
        {phase === 'captured' && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#5856D6' }]} onPress={reset}>
            <Text style={styles.btnText}>다시 하기</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.footerText}>expo-camera • Front Camera</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { alignItems: 'center', justifyContent: 'center', gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { padding: 8, width: 60 },
  backText: { color: '#8E8E93', fontSize: 15 },
  title: { flex: 1, color: '#FFF', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  cameraContainer: { flex: 1, margin: 16, borderRadius: 20, overflow: 'hidden' },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  snapInText: { color: '#FFF', fontSize: 42, fontWeight: '900' },
  photoContainer: { flex: 1, margin: 16, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  photo: { flex: 1 },
  photoLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
    alignItems: 'center',
  },
  photoLabelText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  bottomBar: { padding: 16, alignItems: 'center', gap: 12 },
  hintText: { color: '#8E8E93', fontSize: 14 },
  btn: { paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30 },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  permText: { color: '#8E8E93', fontSize: 16, textAlign: 'center' },
  permBtn: { backgroundColor: '#5856D6', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
