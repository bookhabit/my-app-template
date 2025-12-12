import { Redirect } from 'expo-router';

import { useAuthState } from '@/context/AuthContext';

/**
 * Index Route
 *
 * - 앱 진입점
 * - 인증 상태에 따라 (app) 또는 (auth)로 자동 리다이렉트
 * - 최초 진입 라우팅 리다이렉트
 */
export default function Index() {
  const { isLoggedIn, isLoading } = useAuthState();

  // 인증 상태 로딩 중
  if (isLoading) {
    return null; // 스플래시 스크린 유지
  }

  if (isLoggedIn) {
    return <Redirect href="/(app)/(tabs)/design" />;
  }

  return <Redirect href="/(auth)/login" />;
}
