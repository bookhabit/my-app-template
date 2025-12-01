import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import CustomHeader from '@/components/layout/CustomHeader';

interface ThirdPartyItem {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  category: string;
}

const thirdPartyItems: ThirdPartyItem[] = [
  {
    id: 'async-storage',
    title: 'AsyncStorage',
    description: '비동기 키-값 저장소',
    route: '/(app)/react-native-and-expo/third-party/async-storage',
    icon: 'storage',
    category: '저장소',
  },
  {
    id: 'datetime-picker',
    title: 'DateTimePicker',
    description: '날짜/시간 선택기',
    route: '/(app)/react-native-and-expo/third-party/datetime-picker',
    icon: 'calendar-today',
    category: 'UI 컴포넌트',
  },
  {
    id: 'masked-view',
    title: 'MaskedView',
    description: '마스크 뷰 컴포넌트',
    route: '/(app)/react-native-and-expo/third-party/masked-view',
    icon: 'filter',
    category: 'UI 컴포넌트',
  },
  {
    id: 'picker',
    title: 'Picker',
    description: '드롭다운 피커',
    route: '/(app)/react-native-and-expo/third-party/picker',
    icon: 'arrow-drop-down',
    category: 'UI 컴포넌트',
  },
  {
    id: 'segmented-control',
    title: 'SegmentedControl',
    description: '세그먼트 컨트롤',
    route: '/(app)/react-native-and-expo/third-party/segmented-control',
    icon: 'view-column',
    category: 'UI 컴포넌트',
  },
  {
    id: 'flash-list',
    title: 'FlashList',
    description: '고성능 리스트 컴포넌트',
    route: '/(app)/react-native-and-expo/third-party/flash-list',
    icon: 'list',
    category: '리스트',
  },
  {
    id: 'skia',
    title: 'React Native Skia',
    description: '고성능 2D 그래픽 라이브러리',
    route: '/(app)/react-native-and-expo/third-party/skia',
    icon: 'brush',
    category: '그래픽',
  },
  {
    id: 'keyboard-controller',
    title: 'KeyboardController',
    description: '키보드 애니메이션 제어',
    route: '/(app)/react-native-and-expo/third-party/keyboard-controller',
    icon: 'keyboard',
    category: '키보드',
  },
  {
    id: 'pager-view',
    title: 'PagerView',
    description: '페이지 뷰 컴포넌트',
    route: '/(app)/react-native-and-expo/third-party/pager-view',
    icon: 'view-carousel',
    category: 'UI 컴포넌트',
  },
  {
    id: 'view-shot',
    title: 'ViewShot',
    description: '뷰를 이미지로 캡처',
    route: '/(app)/react-native-and-expo/third-party/view-shot',
    icon: 'camera-alt',
    category: '미디어',
  },
  {
    id: 'webview',
    title: 'WebView',
    description: '웹 콘텐츠 표시',
    route: '/(app)/react-native-and-expo/third-party/webview',
    icon: 'web',
    category: '웹',
  },
];

export default function ThirdPartyScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleItemPress = (route: string) => {
    router.push(route as any);
  };

  const renderSection = (category: string, items: ThirdPartyItem[]) => {
    return (
      <View key={category} style={styles.section}>
        <TextBox
          variant="title3"
          color={theme.text}
          style={styles.sectionTitle}
        >
          {category}
        </TextBox>
        <View style={styles.itemList}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.itemCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => handleItemPress(item.route)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <MaterialIcons
                    name={item.icon}
                    size={24}
                    color={theme.primary}
                  />
                  <View style={styles.cardText}>
                    <TextBox
                      variant="body2"
                      color={theme.text}
                      style={styles.cardTitle}
                    >
                      {item.title}
                    </TextBox>
                    <TextBox
                      variant="body4"
                      color={theme.textSecondary}
                      style={styles.cardDescription}
                    >
                      {item.description}
                    </TextBox>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  // 카테고리별로 그룹화
  const categories = Array.from(
    new Set(thirdPartyItems.map((item) => item.category))
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Third Party Libraries" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Third Party Libraries
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          써드파티 라이브러리를 테스트해보세요
        </TextBox>

        {categories.map((category) => {
          const items = thirdPartyItems.filter(
            (item) => item.category === category
          );
          return renderSection(category, items);
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  itemList: {
    gap: 12,
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cardContent: {
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    lineHeight: 18,
  },
});
