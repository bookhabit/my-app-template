import { Redirect, Stack } from 'expo-router';

import { useAuthState } from '@/context/AuthContext';

/**
 * Auth Layout
 *
 * - 인증되지 않은 사용자만 접근 가능
 * - 인증된 사용자는 메인 앱으로 리다이렉트
 */
export default function AuthLayout() {
  const { isLoggedIn, isLoading } = useAuthState();

  // 인증 상태 로딩 중
  if (isLoading) {
    return null;
  }

  // 이미 로그인된 경우 메인 앱으로 리다이렉트
  if (isLoggedIn) {
    return <Redirect href="/(app)/(tabs)/design" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="create-account" />
    </Stack>
  );
}
