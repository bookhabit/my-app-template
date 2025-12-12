import { useEffect } from 'react';
import { LogBox, Platform, View, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, useAuthState } from '@/context/AuthContext';
import { NetworkProvider } from '@/context/NetworkContext';
import { ThemeProvider } from '@/context/ThemeProvider';
import UpdateProvider from '@/context/UpdateProvider';

import CustomSafeAreaView from '@/components/layout/CustomSafeAreaView';
import { OfflineBanner } from '@/components/network/OfflineBanner';

import { BottomSheetProvider } from '@/hooks/useBottomSheet';
import { ModalProvider } from '@/hooks/useModal';

// 스플래시 스크린이 자동으로 숨겨지지 않도록 방지
SplashScreen.preventAutoHideAsync();

// Reanimated 경고 무시 (expo-router의 Tab 애니메이션에서 발생)
// 이 경고는 expo-router 내부 이슈이며 앱 기능에는 영향 없음
LogBox.ignoreLogs([
  /.*shared value.*reanimated.*/i,
  'It looks like you might be using shared value',
  /.*configured linking in multiple places.*/i,
  /.*NavigationContainer.*linking.*/i,
]);

// console.warn 필터링 (강력한 방법)
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('shared value') ||
      message.includes('reanimated') ||
      message.includes('configured linking in multiple places') ||
      message.includes('NavigationContainer') ||
      message.includes('linking'))
  ) {
    return; // reanimated 및 linking 경고 무시
  }
  originalWarn.apply(console, args);
};

/**
 * Root Layout Content
 * - 인증 상태를 사용하는 내부 컴포넌트
 */
function RootLayoutContent() {
  const { isLoggedIn, isLoading } = useAuthState();

  // 인증 상태 로딩 중
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" />
            </View>
          </ThemeProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <NetworkProvider>
            <UpdateProvider>
              <BottomSheetProvider>
                <ModalProvider>
                  <CustomSafeAreaView>
                    <Stack screenOptions={{ headerShown: false }}>
                      {/* 인증이 필요한 페이지 */}
                      {isLoggedIn ? (
                        <Stack.Screen name="(app)" />
                      ) : (
                        <Stack.Screen name="(auth)" />
                      )}
                    </Stack>
                  </CustomSafeAreaView>
                  <OfflineBanner />
                </ModalProvider>
              </BottomSheetProvider>
            </UpdateProvider>
          </NetworkProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

/**
 * Root Layout
 *
 * - 폰트 로딩
 * - AuthProvider로 전역 인증 상태 제공
 * - ThemeProvider로 전역 테마 제공
 * - 인증 상태 변경 시 레이아웃 자동 재렌더링
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

  // 알림 권한 요청 (Android 13+)
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
              console.log('알림 권한이 거부되었습니다.');
            }
          }
        } catch (error) {
          console.error('알림 권한 요청 중 오류:', error);
        }
      }
    };

    requestNotificationPermission();
  }, []);

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
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
