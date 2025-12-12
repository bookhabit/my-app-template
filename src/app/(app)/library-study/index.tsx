import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import CustomHeader from '@/components/layout/CustomHeader';

/**
 * Library Study Screen
 *
 * - 각 라이브러리별 카드 형식 UI
 * - 클릭 시 해당 라이브러리 스크린으로 라우팅
 */

interface Library {
  id: string;
  title: string;
  route: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  emoji: string;
  category: string;
}

const libraries: Library[] = [
  // 전역 상태 관리
  {
    id: 'redux-toolkit',
    title: 'Redux Toolkit',
    route: '/(app)/library-study/redux-toolkit',
    icon: 'storage',
    emoji: '🔄',
    category: '전역 상태 관리',
  },
  {
    id: 'zustand',
    title: 'Zustand',
    route: '/(app)/library-study/zustand',
    icon: 'pets',
    emoji: '🐻',
    category: '전역 상태 관리',
  },
  {
    id: 'recoil',
    title: 'Recoil',
    route: '/(app)/library-study/recoil',
    icon: 'explosive',
    emoji: '⚛️',
    category: '전역 상태 관리',
  },
  {
    id: 'jotai',
    title: 'Jotai',
    route: '/(app)/library-study/jotai',
    icon: 'science',
    emoji: '⚛️',
    category: '전역 상태 관리',
  },
  {
    id: 'mobx',
    title: 'MobX',
    route: '/(app)/library-study/mobx',
    icon: 'auto-awesome',
    emoji: '🎯',
    category: '전역 상태 관리',
  },
  // Form 상태 관리 & Validation
  {
    id: 'react-hook-form-zod',
    title: 'React Hook Form + Zod',
    route: '/(app)/library-study/react-hook-form-zod',
    icon: 'description',
    emoji: '📝',
    category: 'Form 상태 관리',
  },
  {
    id: 'formik-yup',
    title: 'Formik + Yup',
    route: '/(app)/library-study/formik-yup',
    icon: 'assignment',
    emoji: '📋',
    category: 'Form 상태 관리',
  },
  {
    id: 'react-final-form',
    title: 'React Final Form',
    route: '/(app)/library-study/react-final-form',
    icon: 'check-circle',
    emoji: '✅',
    category: 'Form 상태 관리',
  },
  // 서버 상태 관리
  {
    id: 'tanstack-query',
    title: 'TanStack Query',
    route: '/(app)/library-study/tanstack-query',
    icon: 'cloud-sync',
    emoji: '🔄',
    category: '서버 상태 관리',
  },
  {
    id: 'swr',
    title: 'SWR',
    route: '/(app)/library-study/swr',
    icon: 'sync',
    emoji: '⚡',
    category: '서버 상태 관리',
  },
  {
    id: 'rtk-query',
    title: 'RTK Query',
    route: '/(app)/library-study/rtk-query',
    icon: 'api',
    emoji: '🔌',
    category: '서버 상태 관리',
  },
  {
    id: 'apollo-client',
    title: 'Apollo Client',
    route: '/(app)/library-study/apollo-client',
    icon: 'hub',
    emoji: '🚀',
    category: '서버 상태 관리',
  },
  // 모바일 로컬 상태 / 저장소
  {
    id: 'async-storage',
    title: 'AsyncStorage',
    route: '/(app)/library-study/async-storage',
    icon: 'save',
    emoji: '💾',
    category: '로컬 저장소',
  },
  {
    id: 'mmkv',
    title: 'MMKV',
    route: '/(app)/library-study/mmkv',
    icon: 'speed',
    emoji: '⚡',
    category: '로컬 저장소',
  },
  {
    id: 'sqlite',
    title: 'SQLite',
    route: '/(app)/library-study/sqlite',
    icon: 'database',
    emoji: '🗄️',
    category: '로컬 저장소',
  },
  // 애니메이션 / 제스처 / 그래픽
  {
    id: 'react-native-reanimated',
    title: 'react-native-reanimated',
    route: '/(app)/library-study/react-native-reanimated',
    icon: 'animation',
    emoji: '✨',
    category: '애니메이션',
  },
  {
    id: 'react-native-gesture-handler',
    title: 'react-native-gesture-handler',
    route: '/(app)/library-study/react-native-gesture-handler',
    icon: 'touch-app',
    emoji: '👆',
    category: '애니메이션',
  },
  {
    id: 'react-native-skia',
    title: 'React Native Skia',
    route: '/(app)/library-study/react-native-skia',
    icon: 'brush',
    emoji: '🎨',
    category: '애니메이션',
  },
  {
    id: 'lottie',
    title: 'Lottie',
    route: '/(app)/library-study/lottie',
    icon: 'movie',
    emoji: '🎬',
    category: '애니메이션',
  },
  // 리스트 & 가상화
  {
    id: 'flatlist-sectionlist',
    title: 'FlatList / SectionList',
    route: '/(app)/library-study/flatlist-sectionlist',
    icon: 'list',
    emoji: '📋',
    category: '리스트 & 가상화',
  },
  {
    id: 'flashlist',
    title: 'FlashList',
    route: '/(app)/library-study/flashlist',
    icon: 'bolt',
    emoji: '⚡',
    category: '리스트 & 가상화',
  },
  {
    id: 'recyclerlistview',
    title: 'RecyclerListView',
    route: '/(app)/library-study/recyclerlistview',
    icon: 'view-list',
    emoji: '♻️',
    category: '리스트 & 가상화',
  },
  // 이미지 / 미디어
  {
    id: 'react-native-fast-image',
    title: 'react-native-fast-image',
    route: '/(app)/library-study/react-native-fast-image',
    icon: 'image',
    emoji: '🖼️',
    category: '이미지 / 미디어',
  },
];

const categories = [
  '전역 상태 관리',
  'Form 상태 관리',
  '서버 상태 관리',
  '로컬 저장소',
  '애니메이션',
  '리스트 & 가상화',
  '이미지 / 미디어',
];

export default function LibraryStudyScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleCardPress = (route: string) => {
    router.push(route as any);
  };

  const getLibrariesByCategory = (category: string) => {
    return libraries.filter((lib) => lib.category === category);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="라이브러리 공부" showBackButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <TextBox variant="title2" color={theme.text} style={styles.heading}>
            라이브러리를 선택하세요
          </TextBox>
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.subtitle}
          >
            원하는 라이브러리를 선택하여 학습을 시작하세요
          </TextBox>

          {categories.map((category) => {
            const categoryLibraries = getLibrariesByCategory(category);
            if (categoryLibraries.length === 0) return null;

            return (
              <View key={category} style={styles.categorySection}>
                <TextBox
                  variant="title3"
                  color={theme.text}
                  style={styles.categoryTitle}
                >
                  {category}
                </TextBox>
                <View style={styles.cardGrid}>
                  {categoryLibraries.map((library) => (
                    <Pressable
                      key={library.id}
                      style={({ pressed }) => [
                        styles.card,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                      onPress={() => handleCardPress(library.route)}
                    >
                      <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                          <TextBox
                            variant="title4"
                            color={theme.text}
                            style={styles.cardEmoji}
                          >
                            {library.emoji}
                          </TextBox>
                          <MaterialIcons
                            name={library.icon}
                            size={24}
                            color={theme.primary}
                            style={styles.cardIcon}
                          />
                        </View>
                        <TextBox
                          variant="body3"
                          color={theme.text}
                          style={styles.cardTitle}
                          numberOfLines={2}
                        >
                          {library.title}
                        </TextBox>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            );
          })}
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
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    marginBottom: 16,
    fontWeight: '600',
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

