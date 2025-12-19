import React from 'react';
import { View, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';

import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function TodayHabitStartScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="오늘 아침 습관 시작" />
      <View style={styles.content}>
        <CustomButton
          title="독서"
          onPress={() => router.push('/(app)/morning-routine/today/reading')}
          fullWidth
          style={styles.habitButton}
        />
        <CustomButton
          title="계단"
          onPress={() => router.push('/(app)/morning-routine/today/stairs')}
          fullWidth
          style={styles.habitButton}
        />
        <CustomButton
          title="푸쉬업"
          onPress={() => router.push('/(app)/morning-routine/today/pushup')}
          fullWidth
          style={styles.habitButton}
        />
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
    padding: 16,
    gap: 16,
    justifyContent: 'center',
  },
  habitButton: {
    marginBottom: 0,
  },
});
