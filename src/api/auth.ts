import { api } from './client';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  User,
} from './types';

/**
 * 로그인
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      '로그인에 실패했습니다.';
    throw new Error(errorMessage);
  }
}

/**
 * 회원가입
 */
export async function register(
  userData: RegisterRequest
): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      '회원가입에 실패했습니다.';
    throw new Error(errorMessage);
  }
}

/**
 * 토큰 갱신
 */
export async function refreshToken(
  tokenData: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  try {
    const response = await api.post<RefreshTokenResponse>(
      '/auth/refresh',
      tokenData
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      '토큰 갱신에 실패했습니다.';
    throw new Error(errorMessage);
  }
}

/**
 * 로그아웃
 */
export async function logout(tokenData: LogoutRequest): Promise<void> {
  try {
    await api.post('/auth/logout', tokenData);
  } catch (error: any) {
    // 로그아웃은 실패해도 무시 (이미 서버에서 처리됨)
    console.warn('로그아웃 요청 실패:', error);
  }
}

/**
 * 내 정보 조회
 */
export async function getMe(): Promise<User> {
  try {
    const response = await api.get<User>('/users/me');
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      '사용자 정보를 가져오는데 실패했습니다.';
    throw new Error(errorMessage);
  }
}
