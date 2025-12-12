import { Redirect, Stack } from 'expo-router';

import { useAuthState } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';

import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ErrorFallback } from '@/components/error/ErrorFallback';

/**
 * App Layout (Protected Route)
 *
 * - ErrorBoundary: 전체 앱을 보호
 * - 인증 체크: isLoggedIn이 false면 로그인 페이지로 리다이렉트
 * - 보호된 라우트 가드: 딥링크로 진입, 인증상태 변경
 * - Stack: iOS 스와이프 제스처 지원
 */
export default function AppLayout() {
  const { theme } = useTheme();
  const { isLoggedIn, isLoading } = useAuthState();

  // 인증 상태 로딩 중
  if (isLoading) {
    return null;
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isLoggedIn) {
    console.log('❌ 인증 실패 → 로그인 페이지로 리다이렉트');
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ErrorBoundary
      fallback={(error, retry) => (
        <ErrorFallback error={error} resetError={retry} />
      )}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          // iOS 스와이프 제스처 활성화
          gestureEnabled: true,
          // 안드로이드 백 제스처 활성화
          fullScreenGestureEnabled: true,
          // 애니메이션
          animation: 'slide_from_right',
          // 테마 색상 적용
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="detail"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="workout"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="algorithm"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="javascript"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="typescript"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="react"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="react-native-and-expo"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="animation"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="ui-styling"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="native-modules"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            presentation: 'card',
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
}
