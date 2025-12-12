import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import CustomHeader from '@/components/layout/CustomHeader';

/**
 * Study Topics Screen
 *
 * - 각 주제별 카드 형식 UI
 * - 클릭 시 해당 주제 스크린으로 라우팅
 */

interface StudyTopic {
  id: string;
  title: string;
  route: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  emoji: string;
}

const studyTopics: StudyTopic[] = [
  {
    id: 'react-native-and-expo',
    title: '리액트 네이티브 & 엑스포',
    route: '/(app)/react-native-and-expo',
    icon: 'phone-android',
    emoji: '📱',
  },
  {
    id: 'algorithm',
    title: '알고리즘',
    route: '/(app)/algorithm',
    icon: 'functions',
    emoji: '🧮',
  },
  {
    id: 'javascript',
    title: '자바스크립트',
    route: '/(app)/javascript',
    icon: 'code',
    emoji: '📜',
  },
  {
    id: 'typescript',
    title: '타입스크립트',
    route: '/(app)/typescript',
    icon: 'description',
    emoji: '📘',
  },
  {
    id: 'react',
    title: '리액트',
    route: '/(app)/react',
    icon: 'extension',
    emoji: '⚛️',
  },
  {
    id: 'animation',
    title: '애니메이션',
    route: '/(app)/animation',
    icon: 'animation',
    emoji: '✨',
  },
  {
    id: 'ui-styling',
    title: 'UI 스타일링',
    route: '/(app)/ui-styling',
    icon: 'palette',
    emoji: '🎨',
  },
  {
    id: 'native-modules',
    title: '네이티브 모듈',
    route: '/(app)/native-modules',
    icon: 'build',
    emoji: '🔧',
  },
  {
    id: 'workout',
    title: '운동',
    route: '/(app)/workout',
    icon: 'fitness-center',
    emoji: '💪',
  },
  {
    id: 'library-study',
    title: '라이브러리 공부',
    route: '/(app)/library-study',
    icon: 'library-books',
    emoji: '📚',
  },
];

export default function DetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleCardPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Custom Header */}
      <CustomHeader title="공부 주제" showBackButton />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <TextBox variant="title2" color={theme.text} style={styles.heading}>
            공부 주제를 선택하세요
          </TextBox>
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.subtitle}
          >
            원하는 주제를 선택하여 학습을 시작하세요
          </TextBox>

          {/* Card Grid */}
          <View style={styles.cardGrid}>
            {studyTopics.map((topic) => (
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
  scrollContent: {
    paddingBottom: 20,
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
