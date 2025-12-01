import { View, StyleSheet, Pressable } from 'react-native';

import { useRouter, useSegments, Slot } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

export default function CustomTabsDemoLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  const tabs = [
    { name: 'tab1', label: '홈', route: './tab1' },
    { name: 'tab2', label: '검색', route: './tab2' },
    { name: 'tab3', label: '알림', route: './tab3' },
    { name: 'tab4', label: '프로필', route: './tab4' },
  ];

  const currentTab = segments[segments.length - 1] || 'tab1';
  const isFocused = (tabName: string) => currentTab === tabName;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Slot />
      </View>
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            paddingBottom: 0,
          },
        ]}
      >
        {tabs.map((tab) => (
          <Pressable
            key={tab.name}
            style={[
              styles.tabItem,
              {
                backgroundColor: isFocused(tab.name)
                  ? theme.primary + '20'
                  : 'transparent',
              },
            ]}
            onPress={() => router.push(tab.route as any)}
          >
            <TextBox
              variant="body2"
              color={isFocused(tab.name) ? theme.primary : theme.textSecondary}
            >
              {tab.label}
            </TextBox>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
});
