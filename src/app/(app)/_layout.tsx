import { Redirect, Stack } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';

import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ErrorFallback } from '@/components/error/ErrorFallback';

/**
 * App Layout (Protected Route)
 *
 * - ErrorBoundary: 전체 앱을 보호
 * - 인증 체크: isAuthenticated가 false면 로그인 페이지로 리다이렉트
 * - 보호된 라우트 가드: 딥링크로 진입, 인증상태 변경
 * - Stack: iOS 스와이프 제스처 지원
 */
export default function AppLayout() {
  const { theme } = useTheme();

  // TODO: 실제 인증 상태 관리 시스템 연결 필요
  // 현재는 하드코딩으로 true (항상 인증된 상태)
  const isAuthenticated = true;

  if (!isAuthenticated) {
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
          name="(details)"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="(games)"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            animation: 'slide_from_bottom',
            presentation: 'fullScreenModal',
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
}
