import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, View } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import { useAuthState } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import NavigationBar from '@/components/layout/NavigationBar';

export default function HomeScreen() {
  const { theme, isDarkMode } = useTheme();
  const { logout, isLoading } = useAuthState();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await logout();
            // 로그아웃 성공 시 authState 상태 변경으로 자동 라우팅됨
          } catch (error) {
            Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* 네비게이션 바 */}
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
        <CustomButton
          title="로그아웃"
          variant="danger"
          onPress={handleLogout}
          loading={isLoggingOut}
          disabled={isLoggingOut || isLoading}
          fullWidth
          style={styles.logoutButton}
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
    gap: 20,
  },

  logoutButton: {
    marginTop: 8,
  },
});
