import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'setup' | 'listening' | 'detected';

// expo-speech-recognition은 EAS 빌드 환경에서 동작합니다
// Expo Go에서는 지원되지 않을 수 있습니다
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = null;

try {
  const mod = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
} catch {
  // Expo Go에서는 모듈 로드 실패 가능
}

const DEFAULT_WORDS = ['술', '화장실', '진짜', '솔직히'];

export default function ForbiddenWord() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('setup');
  const [forbiddenWords, setForbiddenWords] = useState<string[]>(DEFAULT_WORDS);
  const [newWord, setNewWord] = useState('');
  const [transcript, setTranscript] = useState('');
  const [detectedWord, setDetectedWord] = useState('');
  const [isAvailable] = useState(() => ExpoSpeechRecognitionModule !== null);

  // STT 이벤트 처리 (모듈이 있을 때만)
  if (useSpeechRecognitionEvent) {
    useSpeechRecognitionEvent('result', (event: any) => {
      const text: string = event.results?.[0]?.transcript ?? '';
      setTranscript(text);
      const found = forbiddenWords.find((w) => text.includes(w));
      if (found) {
        setDetectedWord(found);
        setPhase('detected');
        ExpoSpeechRecognitionModule?.stop();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Speech.speak(`금지어 감지! "${found}"`, { language: 'ko-KR', rate: 1.2 });
      }
    });
  }

  const addWord = () => {
    const w = newWord.trim();
    if (w && !forbiddenWords.includes(w)) {
      setForbiddenWords((prev) => [...prev, w]);
    }
    setNewWord('');
  };

  const removeWord = (w: string) => setForbiddenWords((prev) => prev.filter((x) => x !== w));

  const startListening = async () => {
    if (!isAvailable) return;
    setTranscript('');
    setDetectedWord('');
    setPhase('listening');
    try {
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      ExpoSpeechRecognitionModule.start({
        lang: 'ko-KR',
        continuous: true,
        interimResults: true,
      });
    } catch (e) {
      console.warn('STT error:', e);
      setPhase('setup');
    }
  };

  const stopListening = () => {
    ExpoSpeechRecognitionModule?.stop();
    setPhase('setup');
  };

  const reset = () => {
    ExpoSpeechRecognitionModule?.stop();
    setPhase('setup');
    setTranscript('');
    setDetectedWord('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🗣️ 금지어 탐지기</Text>
        <View style={{ width: 60 }} />
      </View>

      {!isAvailable ? (
        <View style={styles.unavailableBox}>
          <Text style={styles.unavailableEmoji}>⚠️</Text>
          <Text style={styles.unavailableTitle}>EAS 빌드 필요</Text>
          <Text style={styles.unavailableDesc}>
            expo-speech-recognition은{'\n'}
            Expo Go에서 지원되지 않습니다.{'\n\n'}
            EAS 개발 빌드에서 테스트하세요.{'\n'}
            (Phase 3 기능)
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>eas build --profile development</Text>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          {phase === 'detected' && (
            <View style={styles.alertBox}>
              <Text style={styles.alertEmoji}>🚨</Text>
              <Text style={styles.alertWord}>"{detectedWord}"</Text>
              <Text style={styles.alertLabel}>금지어 감지!</Text>
              <TouchableOpacity style={styles.alertBtn} onPress={reset}>
                <Text style={styles.alertBtnText}>확인 (벌칙 받기)</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 금지어 목록 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>금지어 목록</Text>
            <View style={styles.wordList}>
              {forbiddenWords.map((w) => (
                <View key={w} style={styles.wordTag}>
                  <Text style={styles.wordTagText}>{w}</Text>
                  {phase === 'setup' && (
                    <TouchableOpacity onPress={() => removeWord(w)}>
                      <Text style={styles.wordRemove}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {phase === 'setup' && (
              <View style={styles.addRow}>
                <TextInput
                  style={styles.input}
                  value={newWord}
                  onChangeText={setNewWord}
                  placeholder="금지어 추가..."
                  placeholderTextColor="#48484A"
                  returnKeyType="done"
                  onSubmitEditing={addWord}
                />
                <TouchableOpacity style={styles.addBtn} onPress={addWord}>
                  <Text style={styles.addBtnText}>추가</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 실시간 인식 결과 */}
          {phase === 'listening' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>인식 중...</Text>
              <Text style={styles.transcriptText}>
                {transcript || '말해주세요...'}
              </Text>
            </View>
          )}

          {/* 컨트롤 버튼 */}
          {phase === 'setup' && (
            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: '#F0E68C' }]} onPress={startListening}>
              <Text style={[styles.mainBtnText, { color: '#000' }]}>🎤 감지 시작</Text>
            </TouchableOpacity>
          )}
          {phase === 'listening' && (
            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: '#3A3A3C' }]} onPress={stopListening}>
              <Text style={styles.mainBtnText}>⏹ 중지</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-speech-recognition • STT • ko-KR</Text>
        <Text style={styles.footerSub}>
          {Platform.OS === 'ios' ? 'iOS SFSpeechRecognizer' : 'Android SpeechRecognizer'}
        </Text>
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
  unavailableBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  unavailableEmoji: { fontSize: 60 },
  unavailableTitle: { color: '#FF9500', fontSize: 22, fontWeight: '800' },
  unavailableDesc: { color: '#8E8E93', fontSize: 15, textAlign: 'center', lineHeight: 24 },
  codeBox: { backgroundColor: '#1C1C1E', borderRadius: 10, padding: 14, marginTop: 8 },
  codeText: { color: '#F0E68C', fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  content: { padding: 16, gap: 16 },
  alertBox: {
    backgroundColor: '#3B0D0D',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  alertEmoji: { fontSize: 50 },
  alertWord: { color: '#FF3B30', fontSize: 36, fontWeight: '900' },
  alertLabel: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  alertBtn: { backgroundColor: '#FF3B30', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10, marginTop: 8 },
  alertBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  section: { backgroundColor: '#1C1C1E', borderRadius: 14, padding: 16, gap: 12 },
  sectionTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  wordList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wordTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E68C22',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#F0E68C44',
    gap: 6,
  },
  wordTagText: { color: '#F0E68C', fontSize: 14, fontWeight: '600' },
  wordRemove: { color: '#FF3B30', fontSize: 16, fontWeight: '700' },
  addRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 15,
  },
  addBtn: { backgroundColor: '#F0E68C', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  addBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
  transcriptText: { color: '#FFF', fontSize: 16, lineHeight: 24, minHeight: 80 },
  mainBtn: { borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 8 },
  mainBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: 12, alignItems: 'center', gap: 2 },
  footerText: { color: '#3A3A3C', fontSize: 12 },
  footerSub: { color: '#3A3A3C', fontSize: 11 },
});
