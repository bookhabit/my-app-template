import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type GameEntry = {
  id: string;
  phase: 1 | 2 | 3;
  emoji: string;
  name: string;
  desc: string;
  api: string;
  color: string;
};

const GAMES: GameEntry[] = [
  // Phase 1 — 설치 없이 바로
  { id: 'haptic-bomb',       phase: 1, emoji: '💣', name: '심장박동 폭탄',      desc: '햅틱이 점점 강해진다... 손에 든 사람 벌칙',   api: 'expo-haptics',             color: '#FF3B30' },
  { id: 'finger-roulette',   phase: 1, emoji: '👆', name: '손가락 뽑기',        desc: '화면에 모두 손가락 올리면 랜덤 선택',          api: 'Multi-touch',              color: '#FF9500' },
  { id: 'selfie-snap',       phase: 1, emoji: '📸', name: '표정 타임캡슐',      desc: '언제 찍힐지 모르는 랜덤 셀카',                 api: 'expo-camera',              color: '#5856D6' },
  // Phase 2 — expo install 후 Expo Go
  { id: 'shake-bomb',        phase: 2, emoji: '🫙', name: '탄산 폭발 룰렛',     desc: '흔들수록 폭발 위험 증가, 돌려가며 흔들어라',   api: 'Accelerometer',            color: '#FF6B6B' },
  { id: 'heads-up',          phase: 2, emoji: '🎭', name: '이마 위에서 맞춰봐', desc: '이마에 폰 대고 기울여서 정답 / 패스',           api: 'DeviceMotion',             color: '#4ECDC4' },
  { id: 'level-challenge',   phase: 2, emoji: '⚖️', name: '수평 유지 챌린지',  desc: '폰을 수평으로 15초 유지하라',                  api: 'DeviceMotion',             color: '#34C759' },
  { id: 'compass-roulette',  phase: 2, emoji: '🧲', name: '자력 룰렛',          desc: '폰 돌리면 나침반 바늘이 벌칙자 지목',           api: 'Magnetometer',             color: '#45B7D1' },
  { id: 'pedometer-battle',  phase: 2, emoji: '🏃', name: '걸음수 배틀',        desc: '30초 제자리 뛰기 — 가장 많이 뛴 사람 승리',     api: 'Pedometer',                color: '#FF9500' },
  { id: 'silence-game',      phase: 2, emoji: '🤫', name: '침묵 생존',          desc: '10초 동안 소리 내면 탈락',                     api: 'expo-audio',               color: '#96CEB4' },
  { id: 'scream-battle',     phase: 2, emoji: '📢', name: '비명 크기 배틀',     desc: '3초 동안 최대 데시벨을 기록하라',              api: 'expo-audio',               color: '#FFEAA7' },
  { id: 'gps-escape',        phase: 2, emoji: '📍', name: '반경 탈출 게임',     desc: '반경 10m 밖으로 나가면 탈락',                  api: 'expo-location',            color: '#45B7D1' },
  { id: 'orientation-game',  phase: 2, emoji: '🔄', name: '화면 뒤집기 반응',  desc: '표시된 방향으로 폰을 가장 빠르게 돌려라',       api: 'expo-screen-orientation',  color: '#FF9500' },
  { id: 'dark-game',         phase: 2, emoji: '🌑', name: '어둠 속 진동 게임', desc: '화면 끄고 햅틱 패턴으로만 방향 맞히기',         api: 'expo-brightness',          color: '#8E8E93' },
  { id: 'battery-roulette',  phase: 2, emoji: '🔋', name: '배터리 복불복',      desc: '배터리 가장 적은 사람이 오늘의 벌칙',           api: 'expo-battery',             color: '#A8E6CF' },
  { id: 'ai-narrator',       phase: 2, emoji: '🎙️', name: 'AI 게임 진행자',   desc: 'AI 목소리가 랜덤 벌칙을 진지하게 읽어줌',       api: 'expo-speech',              color: '#DDA0DD' },
  { id: 'faceid-gate',       phase: 2, emoji: '🔐', name: 'Face ID 관문',      desc: '생체인증 통과 후 챌린지 부여',                 api: 'expo-local-auth',          color: '#5856D6' },
  { id: 'share-card',        phase: 2, emoji: '🃏', name: '결과 카드 생성',     desc: '게임 결과를 인스타 카드로 저장 + 공유',         api: 'expo-media-library',       color: '#FF2D55' },
  { id: 'swipe-battle',      phase: 2, emoji: '⚡', name: '스와이프 반응속도',  desc: '표시된 방향으로 최대한 빠르게 스와이프',         api: 'gesture-handler',          color: '#007AFF' },
  { id: 'forbidden-word',    phase: 2, emoji: '🗣️', name: '금지어 탐지기',    desc: '대화하다 금지어 말하면 즉시 경보 발동',          api: 'expo-speech-recognition',  color: '#F0E68C' },
  // Phase 3 — 로컬 네이티브 빌드 필요
  { id: 'skia-maze',         phase: 3, emoji: '🎱', name: '기울기 미로',        desc: '폰 기울여 공을 굴려 출구까지',                 api: 'react-native-skia',        color: '#AF52DE' },
  { id: 'ble-room',          phase: 3, emoji: '📡', name: '블루투스 스캐너',    desc: '근처 BLE 기기 감지 + 신호세기 측정',            api: 'react-native-ble-plx',     color: '#4ECDC4' },
  { id: 'light-proximity',   phase: 3, emoji: '👃', name: '광센서 근접 게임',  desc: '폰에 코를 가까이 — 광센서로 근접 감지',          api: 'LightSensor (Android)',    color: '#FF6B6B' },
];

const PHASE_META = {
  1: { label: '설치 없이 바로 실행',         color: '#5856D6' },
  2: { label: 'expo install 후 Expo Go',      color: '#FF9500' },
  3: { label: '로컬 네이티브 빌드 (assembleDebug)', color: '#FF3B30' },
};

export default function GamesHub() {
  const insets = useSafeAreaInsets();

  const navigate = (id: string) => router.push(`/(app)/(games)/${id}` as any);

  const grouped = ([1, 2, 3] as const).map((p) => ({
    phase: p,
    games: GAMES.filter((g) => g.phase === p),
  }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { marginTop: insets.top + 8 }]}>🎮 네이티브 게임 테스트</Text>
      <Text style={styles.pageSubtitle}>총 {GAMES.length}개 · 네이티브 기능 1개씩 검증</Text>

      {grouped.map(({ phase, games }) => (
        <View key={phase}>
          <View style={styles.sectionRow}>
            <View style={[styles.phaseTag, { backgroundColor: PHASE_META[phase].color }]}>
              <Text style={styles.phaseTagText}>Phase {phase}</Text>
            </View>
            <Text style={styles.sectionLabel}>{PHASE_META[phase].label}</Text>
            <Text style={styles.sectionCount}>{games.length}개</Text>
          </View>
          {games.map((game) => (
            <GameCard key={game.id} game={game} onPress={() => navigate(game.id)} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function GameCard({ game, onPress }: { game: GameEntry; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.emojiBox, { backgroundColor: game.color + '22' }]}>
        <Text style={styles.emoji}>{game.emoji}</Text>
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardName}>{game.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={1}>{game.desc}</Text>
        <View style={[styles.apiBadge, { borderColor: game.color + '66' }]}>
          <Text style={[styles.apiBadgeText, { color: game.color }]}>{game.api}</Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 16, gap: 2 },
  pageTitle: { color: '#FFF', fontSize: 24, fontWeight: '800', marginBottom: 2 },
  pageSubtitle: { color: '#8E8E93', fontSize: 13, marginBottom: 20 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 8 },
  phaseTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  phaseTagText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  sectionLabel: { flex: 1, color: '#8E8E93', fontSize: 12 },
  sectionCount: { color: '#48484A', fontSize: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1C1C1E', borderRadius: 16,
    padding: 14, marginBottom: 8, gap: 12,
  },
  emojiBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 },
  cardText: { flex: 1, gap: 3 },
  cardName: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  cardDesc: { color: '#8E8E93', fontSize: 12 },
  apiBadge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  apiBadgeText: { fontSize: 10, fontWeight: '600' },
  arrow: { color: '#48484A', fontSize: 22 },
});
