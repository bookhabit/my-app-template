import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import CustomHeader from '@/components/layout/CustomHeader';

interface ComponentItem {
  id: string;
  title: string;
  category: string;
  route?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const basicComponents: ComponentItem[] = [
  {
    id: 'view',
    title: 'View',
    category: 'Basic Components',
    icon: 'view-module',
  },
  {
    id: 'text',
    title: 'Text',
    category: 'Basic Components',
    icon: 'text-fields',
  },
  {
    id: 'image',
    title: 'Image',
    category: 'Basic Components',
    icon: 'image',
  },
  {
    id: 'image-background',
    title: 'ImageBackground',
    category: 'Basic Components',
    icon: 'wallpaper',
  },
  {
    id: 'text-input',
    title: 'TextInput',
    category: 'Basic Components',
    icon: 'edit',
  },
  {
    id: 'pressable',
    title: 'Pressable',
    category: 'Basic Components',
    icon: 'touch-app',
  },
  {
    id: 'scroll-view',
    title: 'ScrollView',
    category: 'Basic Components',
    icon: 'swap-vert',
  },
];

const uiComponents: ComponentItem[] = [
  {
    id: 'switch',
    title: 'Switch',
    category: 'User Interface',
    icon: 'toggle-on',
  },
];

const listViews: ComponentItem[] = [
  {
    id: 'flatlist',
    title: 'FlatList',
    category: 'List Views',
    icon: 'list',
  },
  {
    id: 'sectionlist',
    title: 'SectionList',
    category: 'List Views',
    icon: 'view-list',
  },
  {
    id: 'virtualized-list',
    title: 'VirtualizedList',
    category: 'List Views',
    icon: 'view-list',
  },
  {
    id: 'scroll-flat-section',
    title: 'ScrollView & FlatList & SectionList',
    category: 'List Views',
    icon: 'view-list',
  },
];

const otherComponents: ComponentItem[] = [
  {
    id: 'activity-indicator',
    title: 'ActivityIndicator',
    category: 'Others',
    icon: 'hourglass-empty',
  },
  {
    id: 'alert',
    title: 'Alert',
    category: 'Others',
    icon: 'warning',
  },
  {
    id: 'animated',
    title: 'Animated',
    category: 'Others',
    icon: 'animation',
  },
  {
    id: 'dimensions',
    title: 'Dimensions',
    category: 'Others',
    icon: 'aspect-ratio',
  },
  {
    id: 'keyboard-avoiding-view',
    title: 'KeyboardAvoidingView',
    category: 'Others',
    icon: 'keyboard',
  },
  {
    id: 'linking',
    title: 'Linking',
    category: 'Others',
    icon: 'link',
  },
  {
    id: 'modal',
    title: 'Modal',
    category: 'Others',
    icon: 'fullscreen',
  },
  {
    id: 'pixel-ratio',
    title: 'PixelRatio',
    category: 'Others',
    icon: 'high-quality',
  },
  {
    id: 'refresh-control',
    title: 'RefreshControl',
    category: 'Others',
    icon: 'refresh',
  },
  {
    id: 'status-bar',
    title: 'StatusBar',
    category: 'Others',
    icon: 'signal-cellular-alt',
  },
  {
    id: 'new-architecture-native-module',
    title: 'New Architecture Native Module',
    category: 'Others',
    icon: 'code',
  },
];

const NativeModulesComponents: ComponentItem[] = [
  {
    id: 'new-architecture-native-module',
    title: 'New Architecture Native Module',
    category: 'Native Modules',
    icon: 'code',
  },
];

const allComponents = [
  ...basicComponents,
  ...uiComponents,
  ...listViews,
  ...otherComponents,
  ...NativeModulesComponents,
];

export default function ReactNativeComponentsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleComponentPress = (component: ComponentItem) => {
    router.push(
      `/(app)/react-native-and-expo/components/${component.id}` as any
    );
  };

  const renderSection = (
    title: string,
    components: ComponentItem[],
    key: string
  ) => {
    if (components.length === 0) return null;

    return (
      <View key={key} style={styles.section}>
        <TextBox
          variant="title3"
          color={theme.text}
          style={styles.sectionTitle}
        >
          {title}
        </TextBox>
        <View style={styles.componentList}>
          {components.map((component) => (
            <Pressable
              key={component.id}
              style={({ pressed }) => [
                styles.componentCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => handleComponentPress(component)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <MaterialIcons
                    name={component.icon}
                    size={24}
                    color={theme.primary}
                  />
                  <TextBox
                    variant="body2"
                    color={theme.text}
                    style={styles.cardTitle}
                    numberOfLines={2}
                  >
                    {component.title}
                  </TextBox>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <CustomHeader title="React Native 컴포넌트" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          React Native Components
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          React Native 컴포넌트를 학습하고 테스트해보세요
        </TextBox>

        {renderSection('Basic Components', basicComponents, 'basic')}
        {renderSection('User Interface', uiComponents, 'ui')}
        {renderSection('List Views', listViews, 'list')}
        {renderSection('Others', otherComponents, 'others')}
        {renderSection(
          'Native Modules',
          NativeModulesComponents,
          'native-modules'
        )}
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
    marginBottom: 8,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  componentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  componentCard: {
    width: '47%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    minHeight: 80,
  },
  cardContent: {
    gap: 8,
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    flex: 1,
    flexShrink: 1,
  },
});
