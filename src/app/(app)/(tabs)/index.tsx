import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import NavigationBar from '@/components/layout/NavigationBar';

export default function HomeScreen() {
  const { theme, isDarkMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <NavigationBar
          buttons={[
            {
              title: '공부 목표 설정',
              route: '/(app)/checklist',
              color: theme.success,
            },
            {
              title: '운동 기록',
              route: '/(app)/workout',
              color: theme.primary,
            },
            {
              title: '독서 기록',
              route: '/(app)/reading',
              color: '#06B6D4',
            },
            {
              title: '앱 스터디',
              route: '/(app)/detail',
              color: theme.secondary,
            },
            {
              title: 'TODAY-TODO-LIST',
              route: '/(app)/today-study',
              color: '#FF6B6B',
            },
          ]}
        />
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
});
