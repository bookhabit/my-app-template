/**
 * API 공통 타입 정의
 */

export interface ApiError {
  message: string;
  code: string;
  issues?: Array<{
    path: (string | number)[];
    message: string;
  }>;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
}

// 인증 관련 타입
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// 사용자 타입
export interface User {
  id: string;
  email: string;
  name: string | null;
}

// 페이지네이션 타입
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  hasMore?: boolean;
  nextCursor?: string | null;
}

