import React from 'react';
import { StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePathname } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';

interface ISafeAreaViewProps {
  children: React.ReactNode;
}

export default function CustomSafeAreaView({ children }: ISafeAreaViewProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const pathname = usePathname();

  // 탭바가 있는 경로에서는 paddingBottom을 제거 (탭바가 자체적으로 처리)
  const isTabScreen =
    pathname === '/' ||
    pathname.startsWith('/design') ||
    pathname.startsWith('/image') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/modal');
  const paddingTop = isTabScreen ? 0 : insets.top;
  const paddingBottom = isTabScreen ? 0 : insets.bottom;

  return (
    <View
      style={{
        paddingTop,
        paddingBottom,
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      {children}
    </View>
  );
}
