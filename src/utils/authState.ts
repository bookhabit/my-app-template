import { useState, useEffect } from 'react';

/**
 * 인증 상태 관리 훅
 *
 * - 로그인 상태 확인
 * - 토큰 저장/조회
 * - 인증 상태 변경 감지
 *
 * TODO: 실제 인증 시스템 연결 필요
 * - SecureStore 또는 AsyncStorage 사용
 * - 서버 토큰 검증
 * - 자동 로그아웃 처리
 */
export function useAuthState() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      // TODO: 실제 인증 토큰 확인 로직 구현
      // 예: SecureStore에서 토큰 확인, 서버 검증 등

      // 임시: 하드코딩된 값 사용 (실제 구현 시 제거)
      const authenticated = false; // 현재는 항상 인증된 상태로 설정

      setIsLoggedIn(authenticated);
    } catch (error) {
      console.error('인증 상태 확인 실패:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token?: string) => {
    try {
      // TODO: 실제 로그인 로직 구현
      // 예: SecureStore에 토큰 저장, 서버 인증 등
      setIsLoggedIn(true);
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // TODO: 실제 로그아웃 로직 구현
      // 예: SecureStore에서 토큰 삭제, 서버 로그아웃 등
      setIsLoggedIn(false);
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  };

  return {
    isLoggedIn,
    isLoading,
    login,
    logout,
    refetch: checkAuthState,
  };
}
