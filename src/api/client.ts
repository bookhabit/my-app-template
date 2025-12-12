import { Platform } from 'react-native';

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from '../storage/tokenStorage';

/**
 * 환경 및 설정 상수
 */

// 실제 기기에서 테스트할 때 PC의 IP 주소를 입력하세요
// 예: const DEVELOPMENT_SERVER_IP = '192.168.0.100';
// E2E 테스트용: null로 설정하면 에뮬레이터/시뮬레이터용 주소 자동 사용
const DEVELOPMENT_SERVER_IP: string | null = '//192.168.0.59';

// 프로덕션 서버 주소
const PRODUCTION_API_URL = 'https://192.168.0.59:4000';

// 로컬 개발 서버 포트
const DEVELOPMENT_PORT = 4000;

/**
 * 플랫폼별 개발 서버 주소 자동 선택
 */
const getDevServerUrl = (): string => {
  // 실제 기기 테스트용 IP가 설정된 경우
  if (DEVELOPMENT_SERVER_IP) {
    return `http://${DEVELOPMENT_SERVER_IP}:${DEVELOPMENT_PORT}`;
  }

  // 플랫폼별 로컬호스트 주소
  switch (Platform.OS) {
    case 'android':
      // Android 에뮬레이터: 10.0.2.2는 호스트 머신의 localhost를 가리킴
      return `http://10.0.2.2:${DEVELOPMENT_PORT}`;
    case 'ios':
      // iOS 시뮬레이터: localhost 사용 가능
      return `http://localhost:${DEVELOPMENT_PORT}`;
    case 'web':
      // 웹: localhost 사용
      return `http://localhost:${DEVELOPMENT_PORT}`;
    default:
      // 기타 플랫폼
      return `http://localhost:${DEVELOPMENT_PORT}`;
  }
};

/**
 * 환경에 따른 baseURL 선택
 */
const getBaseURL = (): string => {
  if (__DEV__) {
    const devUrl = getDevServerUrl();
    console.log(
      `[Axios Config] Development mode - Platform: ${Platform.OS}, BaseURL: ${devUrl}`
    );
    return devUrl;
  } else {
    console.log(
      `[Axios Config] Production mode - BaseURL: ${PRODUCTION_API_URL}`
    );
    return PRODUCTION_API_URL;
  }
};

/**
 * Axios 인스턴스 생성
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터
 * - SecureStore에서 토큰을 가져와 헤더에 설정
 */
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[API Request] 토큰 가져오기 실패:', error);
    }

    if (__DEV__) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
      );
      if (config.params) console.log('[Params]', config.params);
      if (config.data) console.log('[Data]', config.data);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 응답 인터셉터
 * - 401 에러 시 자동 토큰 갱신
 * - Cache-Control 헤더 로깅 (개발 환경)
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // 개발 환경에서 Cache-Control 헤더 로깅
    if (__DEV__) {
      const cacheControl = response.headers['cache-control'];
      if (cacheControl) {
        console.log(`[Cache-Control] ${response.config.url}: ${cacheControl}`);
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // config가 없으면 원래 에러 반환
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url: string = originalRequest?.url || '';

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          // 리프레시 토큰 없으면 로그아웃 처리
          await clearTokens();
          return Promise.reject(error);
        }

        const baseURL = getBaseURL();

        // 토큰 갱신 요청
        const refreshResp = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken: string = refreshResp.data?.accessToken;

        if (!newAccessToken) {
          await clearTokens();
          return Promise.reject(error);
        }

        // 새 토큰 저장
        await saveTokens(newAccessToken, refreshToken);

        // 원래 요청 재시도
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        await clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API 클라이언트 래퍼
 * - 타입 안전성을 위한 래퍼 함수들
 */
export const api = {
  get: <T = any>(url: string, config = {}) => axiosInstance.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config = {}) =>
    axiosInstance.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config = {}) =>
    axiosInstance.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config = {}) =>
    axiosInstance.patch<T>(url, data, config),
  delete: <T = any>(url: string, config = {}) =>
    axiosInstance.delete<T>(url, config),
};

// 기본 export
export default axiosInstance;
