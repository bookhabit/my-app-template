import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PENALTIES = [
  '1번 플레이어! 벌칙은 다음과 같습니다. 닭 울음소리를 10초 동안 내세요.',
  '가장 나이 많은 사람! 앞으로 나와서 춤을 추세요. 음악은 없습니다.',
  '오늘의 희생자가 결정되었습니다. 다음 라운드까지 한국어 사용 금지.',
  '벌칙 발동! 옆 사람에게 진심 어린 칭찬을 3가지 말하세요.',
  '이번 벌칙은 특별합니다. 지금 즉시 셀카를 찍어서 가장 친한 친구에게 전송하세요.',
  '랜덤 벌칙 선정 완료. 지금부터 3분 동안 존댓말만 사용하세요.',
  '오늘의 대상자! 인생 최고의 실수담을 30초 안에 말하세요.',
  '특수 임무가 부여되었습니다. 지금부터 모든 대답에 "라고 생각합니다"를 붙이세요.',
  '벌칙이 확정되었습니다. 전화를 무작위로 걸어서 노래를 불러주세요.',
  '최종 결정! 남은 게임 동안 한 손만 사용하세요.',
];

const INTROS = [
  '삐빅. 벌칙 대상자가 선정되었습니다.',
  '오늘의 벌칙을 발표하겠습니다.',
  '주목하세요. 중요한 공지사항이 있습니다.',
  '안녕하세요. 저는 게임 진행 인공지능입니다.',
  '벌칙 추첨 결과를 알려드리겠습니다.',
];

export default function AiNarrator() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentScript, setCurrentScript] = useState<string | null>(null);
  const [pitch, setPitch] = useState(1.0);
  const [rate, setRate] = useState(0.85);

  useEffect(() => () => { Speech.stop(); }, []);

  const speakRandom = async () => {
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const intro = INTROS[Math.floor(Math.random() * INTROS.length)];
    const penalty = PENALTIES[Math.floor(Math.random() * PENALTIES.length)];
    const full = `${intro} ${penalty}`;
    setCurrentScript(full);
    setIsSpeaking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Speech.speak(full, {
      language: 'ko-KR',
      pitch,
      rate,
      onDone: () => {
        setIsSpeaking(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: () => setIsSpeaking(false),
    });
  };

  const speakCustom = (text: string) => {
    if (isSpeaking) Speech.stop();
    setCurrentScript(text);
    setIsSpeaking(true);
    Speech.speak(text, {
      language: 'ko-KR',
      pitch,
      rate,
      onDone: () => setIsSpeaking(false),
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { Speech.stop(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎙️ AI 게임 진행자</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {/* 메인 버튼 */}
        <TouchableOpacity
          style={[styles.mainBtn, isSpeaking && styles.mainBtnActive]}
          onPress={speakRandom}
        >
          <Text style={styles.mainBtnEmoji}>{isSpeaking ? '⏹️' : '🎙️'}</Text>
          <Text style={styles.mainBtnText}>{isSpeaking ? '중지' : '랜덤 벌칙 발표'}</Text>
        </TouchableOpacity>

        {/* 현재 스크립트 */}
        {currentScript && (
          <View style={styles.scriptBox}>
            <Text style={styles.scriptLabel}>현재 스크립트</Text>
            <Text style={styles.scriptText}>{currentScript}</Text>
          </View>
        )}

        {/* 음성 설정 */}
        <View style={styles.settingBox}>
          <Text style={styles.settingTitle}>음성 설정</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>피치 (높낮이)</Text>
            <View style={styles.sliderRow}>
              {[0.7, 1.0, 1.3, 1.6].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.chip, pitch === v && styles.chipActive]}
                  onPress={() => setPitch(v)}
                >
                  <Text style={[styles.chipText, pitch === v && styles.chipTextActive]}>
                    {v === 0.7 ? '저음' : v === 1.0 ? '보통' : v === 1.3 ? '고음' : '아주높음'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>속도</Text>
            <View style={styles.sliderRow}>
              {[0.6, 0.85, 1.0, 1.3].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.chip, rate === v && styles.chipActive]}
                  onPress={() => setRate(v)}
                >
                  <Text style={[styles.chipText, rate === v && styles.chipTextActive]}>
                    {v === 0.6 ? '느림' : v === 0.85 ? '보통' : v === 1.0 ? '빠름' : '매우빠름'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 미리 정해진 벌칙들 */}
        <Text style={styles.listTitle}>벌칙 리스트</Text>
        {PENALTIES.map((p, i) => (
          <TouchableOpacity key={i} style={styles.penaltyItem} onPress={() => speakCustom(p)}>
            <Text style={styles.penaltyNum}>{i + 1}</Text>
            <Text style={styles.penaltyText} numberOfLines={2}>{p}</Text>
            <Text style={styles.speakIcon}>▶</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-speech • Text-to-Speech • ko-KR</Text>
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
  content: { padding: 16, gap: 16 },
  mainBtn: {
    backgroundColor: '#DDA0DD',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  mainBtnActive: { backgroundColor: '#3A3A3C' },
  mainBtnEmoji: { fontSize: 48 },
  mainBtnText: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  scriptBox: { backgroundColor: '#1C1C1E', borderRadius: 14, padding: 16, gap: 6 },
  scriptLabel: { color: '#8E8E93', fontSize: 12 },
  scriptText: { color: '#FFF', fontSize: 15, lineHeight: 22 },
  settingBox: { backgroundColor: '#1C1C1E', borderRadius: 14, padding: 16, gap: 16 },
  settingTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  settingRow: { gap: 8 },
  settingLabel: { color: '#8E8E93', fontSize: 13 },
  sliderRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#2C2C2E' },
  chipActive: { backgroundColor: '#DDA0DD' },
  chipText: { color: '#8E8E93', fontSize: 13 },
  chipTextActive: { color: '#000', fontWeight: '700' },
  listTitle: { color: '#8E8E93', fontSize: 13, fontWeight: '600', marginTop: 4 },
  penaltyItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  penaltyNum: { color: '#DDA0DD', fontSize: 16, fontWeight: '800', width: 24 },
  penaltyText: { flex: 1, color: '#FFF', fontSize: 13, lineHeight: 18 },
  speakIcon: { color: '#DDA0DD', fontSize: 16 },
  footer: { padding: 12, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
