import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import * as authApi from '@/api/auth';
import { LoginRequest, RegisterRequest } from '@/api/types';
import {
  hasTokens,
  clearTokens,
  saveTokens,
  getRefreshToken,
} from '@/storage/tokenStorage';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<any>;
  register: (userData: RegisterRequest) => Promise<any>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthState = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider
 *
 * - 전역 인증 상태 관리
 * - 토큰 존재 여부만 확인하여 라우팅 처리
 * - 로그인/회원가입/로그아웃 시 즉시 상태 동기화
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasToken, setHasToken] = useState<boolean>(false);

  /**
   * 토큰 존재 여부 확인
   */
  const checkTokenState = useCallback(async () => {
    try {
      setIsLoading(true);
      const tokenExists = await hasTokens();
      setHasToken(tokenExists);
    } catch (error) {
      console.error('토큰 확인 실패:', error);
      setHasToken(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 토큰 존재 여부 확인 (한 번만 실행)
  useEffect(() => {
    checkTokenState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 로그인
   * - 토큰만 저장하면 자동으로 라우팅 처리됨
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      // 서버에 로그인 요청
      const response = await authApi.login(credentials);

      // 토큰 저장
      await saveTokens(response.accessToken, response.refreshToken);

      // 토큰 상태 즉시 업데이트
      setHasToken(true);

      return response;
    } catch (error) {
      console.error('로그인 실패:', error);
      setHasToken(false);
      throw error;
    }
  }, []);

  /**
   * 회원가입
   * - 토큰만 저장하면 자동으로 라우팅 처리됨
   */
  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      // 서버에 회원가입 요청
      const response = await authApi.register(userData);

      // 토큰 저장 (회원가입 시 자동 로그인)
      await saveTokens(response.accessToken, response.refreshToken);

      // 토큰 상태 즉시 업데이트
      setHasToken(true);

      return response;
    } catch (error) {
      console.error('회원가입 실패:', error);
      setHasToken(false);
      throw error;
    }
  }, []);

  /**
   * 로그아웃
   */
  const logout = useCallback(async () => {
    try {
      // 서버에 로그아웃 요청 (실패해도 클라이언트에서는 로그아웃 처리)
      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          await authApi.logout({ refreshToken });
        }
      } catch (error) {
        console.warn('서버 로그아웃 실패 (무시):', error);
      }

      // 토큰 삭제
      await clearTokens();

      // 토큰 상태 즉시 업데이트
      setHasToken(false);
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 에러가 발생해도 클라이언트에서는 로그아웃 처리
      await clearTokens();
      setHasToken(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: hasToken,
        isLoading,
        login,
        register,
        logout,
        refetch: checkTokenState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
