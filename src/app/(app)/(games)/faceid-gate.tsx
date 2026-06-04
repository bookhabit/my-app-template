import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'authenticating' | 'passed' | 'failed';

const CHALLENGES = [
  '🍺 이번 판 술 사기 챌린지',
  '🎤 노래 한 곡 풀 버전 부르기',
  '📞 지금 당장 친구한테 전화해서 노래 불러주기',
  '💃 30초 솔로 댄스 퍼포먼스',
  '🤳 지금 이 표정으로 인스타 스토리 올리기',
  '🍜 다음 회식 장소 결정권 상실',
  '🎲 나머지 게임 동안 존댓말 의무 사용',
  '🐔 닭 울음소리 10초 연속 도전',
];

export default function FaceIdGate() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [challenge, setChallenge] = useState<string | null>(null);
  const [failCount, setFailCount] = useState(0);
  const [authType, setAuthType] = useState<string>('');

  const authenticate = async () => {
    setPhase('authenticating');

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const hasfacial = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    const hasFinger = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
    setAuthType(hasfacial ? 'Face ID' : hasFinger ? '지문 인식' : '생체 인증');

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: '본인 인증 후 게임에 참가하세요',
      fallbackLabel: '비밀번호 사용',
      cancelLabel: '취소',
    });

    if (result.success) {
      const c = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
      setChallenge(c);
      setPhase('passed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setFailCount((n) => n + 1);
      setPhase('failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const reset = () => {
    setPhase('idle');
    setChallenge(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔐 Face ID 관문</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.center}>
        {phase === 'idle' && (
          <>
            <Text style={{ fontSize: 80 }}>🔐</Text>
            <Text style={styles.hint}>
              생체 인증 통과 후 챌린지가 부여됩니다{'\n'}
              인증 실패 = 자동 벌칙!
            </Text>
            {failCount > 0 && (
              <Text style={styles.failCountText}>인증 실패 {failCount}회 ⚠️</Text>
            )}
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#5856D6' }]} onPress={authenticate}>
              <Text style={styles.btnText}>🔐 인증 시작</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'authenticating' && (
          <>
            <Text style={{ fontSize: 70 }}>👁️</Text>
            <Text style={styles.hint}>{authType} 인증 중...</Text>
          </>
        )}

        {phase === 'passed' && challenge && (
          <>
            <Text style={{ fontSize: 70 }}>✅</Text>
            <Text style={styles.passedTitle}>인증 성공!</Text>
            <View style={styles.challengeBox}>
              <Text style={styles.challengeLabel}>오늘의 챌린지</Text>
              <Text style={styles.challengeText}>{challenge}</Text>
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#5856D6' }]} onPress={reset}>
              <Text style={styles.btnText}>다음 사람</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'failed' && (
          <>
            <Text style={{ fontSize: 70 }}>❌</Text>
            <Text style={styles.failedTitle}>인증 실패!</Text>
            <View style={styles.penaltyBox}>
              <Text style={styles.penaltyLabel}>자동 벌칙 부여</Text>
              <Text style={styles.penaltyText}>
                {CHALLENGES[failCount % CHALLENGES.length]}
              </Text>
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#5856D6' }]} onPress={reset}>
              <Text style={styles.btnText}>다음 사람</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>expo-local-authentication • Face ID / Fingerprint</Text>
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
  hint: { color: '#8E8E93', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  failCountText: { color: '#FF9500', fontSize: 15, fontWeight: '600' },
  passedTitle: { color: '#34C759', fontSize: 36, fontWeight: '900' },
  failedTitle: { color: '#FF3B30', fontSize: 36, fontWeight: '900' },
  challengeBox: { backgroundColor: '#1A2A1A', borderRadius: 16, padding: 20, width: '100%', gap: 8, borderWidth: 1, borderColor: '#34C759' },
  challengeLabel: { color: '#34C759', fontSize: 12, fontWeight: '600' },
  challengeText: { color: '#FFF', fontSize: 16, lineHeight: 24 },
  penaltyBox: { backgroundColor: '#2A1A1A', borderRadius: 16, padding: 20, width: '100%', gap: 8, borderWidth: 1, borderColor: '#FF3B30' },
  penaltyLabel: { color: '#FF3B30', fontSize: 12, fontWeight: '600' },
  penaltyText: { color: '#FFF', fontSize: 16, lineHeight: 24 },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 12 },
});
