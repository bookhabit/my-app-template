import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

interface AlgorithmTopic {
  id: string;
  title: string;
  route: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  emoji: string;
}

const algorithmTopics: AlgorithmTopic[] = [
  {
    id: 'numbers',
    title: '숫자',
    route: '/(app)/algorithm/numbers',
    icon: 'calculate',
    emoji: '🔢',
  },
  {
    id: 'strings',
    title: '문자열',
    route: '/(app)/algorithm/strings',
    icon: 'text-fields',
    emoji: '🔤',
  },
  {
    id: 'arrays',
    title: '배열',
    route: '/(app)/algorithm/arrays',
    icon: 'view-array',
    emoji: '🧱',
  },
  {
    id: 'objects',
    title: '객체',
    route: '/(app)/algorithm/objects',
    icon: 'category',
    emoji: '🧩',
  },
  {
    id: 'memory',
    title: '메모리 관리',
    route: '/(app)/algorithm/memory-management',
    icon: 'memory',
    emoji: '💾',
  },
  {
    id: 'recursion',
    title: '재귀',
    route: '/(app)/algorithm/recursion',
    icon: 'loop',
    emoji: '🔁',
  },
  {
    id: 'sets',
    title: '집합',
    route: '/(app)/algorithm/sets',
    icon: 'bubble-chart',
    emoji: '🫧',
  },
  {
    id: 'search',
    title: '검색',
    route: '/(app)/algorithm/search',
    icon: 'search',
    emoji: '🔍',
  },
  {
    id: 'sorting',
    title: '정렬',
    route: '/(app)/algorithm/sorting',
    icon: 'sort',
    emoji: '🧮',
  },
  {
    id: 'hash',
    title: '해시',
    route: '/(app)/algorithm/hash',
    icon: 'local-offer',
    emoji: '🏷️',
  },
  {
    id: 'stack',
    title: '스택',
    route: '/(app)/algorithm/stack',
    icon: 'layers',
    emoji: '📚',
  },
  {
    id: 'queue',
    title: '큐',
    route: '/(app)/algorithm/queue',
    icon: 'queue',
    emoji: '🚶',
  },
  {
    id: 'linked-list',
    title: '연결 리스트',
    route: '/(app)/algorithm/linked-list',
    icon: 'link',
    emoji: '🔗',
  },
  {
    id: 'caching',
    title: '캐싱',
    route: '/(app)/algorithm/caching',
    icon: 'cached',
    emoji: '🗃️',
  },
  {
    id: 'tree',
    title: '트리',
    route: '/(app)/algorithm/tree',
    icon: 'account-tree',
    emoji: '🌳',
  },
  {
    id: 'heap',
    title: '힙',
    route: '/(app)/algorithm/heap',
    icon: 'terrain',
    emoji: '⛰️',
  },
  {
    id: 'graph',
    title: '그래프',
    route: '/(app)/algorithm/graph',
    icon: 'timeline',
    emoji: '🕸️',
  },
  {
    id: 'advanced-strings',
    title: '고급 문자열',
    route: '/(app)/algorithm/advanced-strings',
    icon: 'translate',
    emoji: '🧵',
  },
  {
    id: 'dynamic-programming',
    title: '동적 프로그래밍',
    route: '/(app)/algorithm/dynamic-programming',
    icon: 'extension',
    emoji: '🧠',
  },
  {
    id: 'bit-manipulation',
    title: '비트 조작',
    route: '/(app)/algorithm/bit-manipulation',
    icon: 'settings-ethernet',
    emoji: '💡',
  },
];

/**
 * Algorithm Study Screen - 카드 리스트
 */
export default function AlgorithmScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleCardPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, bottom: 0 },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        <View style={styles.content}>
          <TextBox variant="title2" color={theme.text} style={styles.heading}>
            알고리즘 주제 선택
          </TextBox>
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.subtitle}
          >
            학습하고 싶은 알고리즘 주제를 선택하세요
          </TextBox>

          <Pressable
            style={({ pressed }) => [
              styles.highlightCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => handleCardPress('/(app)/algorithm/time-space')}
          >
            <TextBox variant="title3" color={theme.primary}>
              시간 · 공간 복잡도 이해하기
            </TextBox>
            <TextBox variant="body3" color={theme.textSecondary}>
              Big-O 표기법과 분석 법칙을 정리하고, 이진 탐색 예제로 함께
              살펴보세요.
            </TextBox>
          </Pressable>

          <View style={styles.cardGrid}>
            {algorithmTopics.map((topic) => (
              <Pressable
                key={topic.id}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => handleCardPress(topic.route)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <TextBox
                      variant="title4"
                      color={theme.text}
                      style={styles.cardEmoji}
                    >
                      {topic.emoji}
                    </TextBox>
                    <MaterialIcons
                      name={topic.icon}
                      size={24}
                      color={theme.primary}
                      style={styles.cardIcon}
                    />
                  </View>
                  <TextBox
                    variant="body2"
                    color={theme.text}
                    style={styles.cardTitle}
                  >
                    {topic.title}
                  </TextBox>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  highlightCard: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    gap: 8,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  cardEmoji: {
    fontSize: 32,
    lineHeight: 32,
  },
  cardIcon: {
    marginLeft: 'auto',
  },
  cardTitle: {
    fontWeight: '600',
  },
});
