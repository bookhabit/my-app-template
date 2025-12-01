import { useEffect } from 'react';
import { LogBox } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { NetworkProvider } from '@/context/NetworkContext';
import { ThemeProvider } from '@/context/ThemeProvider';
import UpdateProvider from '@/context/UpdateProvider';

import CustomSafeAreaView from '@/components/layout/CustomSafeAreaView';
import { OfflineBanner } from '@/components/network/OfflineBanner';

// 스플래시 스크린이 자동으로 숨겨지지 않도록 방지
SplashScreen.preventAutoHideAsync();

// Reanimated 경고 무시 (expo-router의 Tab 애니메이션에서 발생)
// 이 경고는 expo-router 내부 이슈이며 앱 기능에는 영향 없음
LogBox.ignoreLogs([
  /.*shared value.*reanimated.*/i,
  'It looks like you might be using shared value',
]);

// console.warn 필터링 (강력한 방법)
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('shared value') || message.includes('reanimated'))
  ) {
    return; // reanimated 경고 무시
  }
  originalWarn.apply(console, args);
};

/**
 * Root Layout
 *
 * - 폰트 로딩
 * - ThemeProvider로 전역 테마 제공
 * - Slot으로 하위 라우트 렌더링
 */
export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Pretendard-Regular': require('@/assets/fonts/Pretendard-Regular.ttf'),
    'Pretendard-Bold': require('@/assets/fonts/Pretendard-Bold.ttf'),
    'Pretendard-Light': require('@/assets/fonts/Pretendard-Light.ttf'),
    'Roboto-Regular': require('@/assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('@/assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Light': require('@/assets/fonts/Roboto-Light.ttf'),
    BMJUA: require('@/assets/fonts/BMJUA_ttf.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // 폰트 로딩 중이거나 에러가 없으면 null 반환 (스플래시 스크린 유지)
  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <NetworkProvider>
            <UpdateProvider>
              <CustomSafeAreaView>
                <Slot />
                <OfflineBanner />
              </CustomSafeAreaView>
            </UpdateProvider>
          </NetworkProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
