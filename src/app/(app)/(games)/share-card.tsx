import { useRef, useState } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TITLES = ['오늘의 패배자', '최고의 플레이어', '침묵의 파괴자', '폭탄 수령인', '비명왕'];
const SUBTITLES = ['다음엔 잘 할 수 있을거야...', '넌 정말 대단해!', '오늘 가장 시끄러웠던 사람', '폭탄을 받은 용감한 자', '목이 쉬었니?'];
const EMOJIS = ['😭', '🏆', '📢', '💣', '🎤'];
const COLORS = ['#FF3B30', '#34C759', '#FF9500', '#5856D6', '#FF2D55'];

export default function ShareCard() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [cardIndex, setCardIndex] = useState(0);
  const [score, setScore] = useState(42);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const viewShotRef = useRef<ViewShotRef>(null);

  const randomize = () => {
    setCardIndex(Math.floor(Math.random() * TITLES.length));
    setScore(Math.floor(Math.random() * 100));
    setSaved(false);
    Haptics.selectionAsync();
  };

  const saveAndShare = async () => {
    setIsSaving(true);
    try {
      const uri = await viewShotRef.current?.capture();
      if (!uri) return;

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
        setSaved(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      await Share.share({
        url: uri,
        message: `🎮 게임 결과 카드 — ${TITLES[cardIndex]} (${score}점)\n앱 다운로드: monymony://`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const color = COLORS[cardIndex];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🃏 결과 카드 생성</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {/* 캡처 대상 */}
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.95 }}>
          <View style={[styles.card, { backgroundColor: color }]}>
            <Text style={styles.cardEmoji}>{EMOJIS[cardIndex]}</Text>
            <Text style={styles.cardTitle}>{TITLES[cardIndex]}</Text>
            <Text style={styles.cardScore}>{score}점</Text>
            <Text style={styles.cardSub}>{SUBTITLES[cardIndex]}</Text>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>🎮 네이티브 게임 테스트</Text>
            </View>
          </View>
        </ViewShot>

        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#3A3A3C' }]} onPress={randomize}>
            <Text style={styles.btnText}>🎲 다른 카드</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: color, opacity: isSaving ? 0.6 : 1 }]}
            onPress={saveAndShare}
            disabled={isSaving}
          >
            <Text style={styles.btnText}>{isSaving ? '저장 중...' : saved ? '✅ 공유됨' : '📤 저장 + 공유'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>9:16 비율 카드가 갤러리에 저장됩니다</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-media-library + react-native-view-shot + Share API</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 24 },
  card: {
    width: 280, height: 400,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  cardEmoji: { fontSize: 64 },
  cardTitle: { color: '#FFF', fontSize: 26, fontWeight: '900', textAlign: 'center' },
  cardScore: { color: 'rgba(255,255,255,0.9)', fontSize: 52, fontWeight: '900' },
  cardSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  cardBadge: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 8 },
  cardBadgeText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 12 },
  btn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 26 },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  hint: { color: '#48484A', fontSize: 12 },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
