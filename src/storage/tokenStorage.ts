import * as SecureStore from 'expo-secure-store';

/**
 * 토큰 저장소
 *
 * SecureStore를 사용하여 토큰을 안전하게 저장/조회/삭제합니다.
 */

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Access Token 저장
 */
export async function saveAccessToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('Access Token 저장 실패:', error);
    throw error;
  }
}

/**
 * Access Token 조회
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Access Token 조회 실패:', error);
    return null;
  }
}

/**
 * Refresh Token 저장
 */
export async function saveRefreshToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Refresh Token 저장 실패:', error);
    throw error;
  }
}

/**
 * Refresh Token 조회
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Refresh Token 조회 실패:', error);
    return null;
  }
}

/**
 * 모든 토큰 저장
 */
export async function saveTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await Promise.all([
    saveAccessToken(accessToken),
    saveRefreshToken(refreshToken),
  ]);
}

/**
 * Access Token 삭제
 */
export async function removeAccessToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Access Token 삭제 실패:', error);
  }
}

/**
 * Refresh Token 삭제
 */
export async function removeRefreshToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Refresh Token 삭제 실패:', error);
  }
}

/**
 * 모든 토큰 삭제
 */
export async function clearTokens(): Promise<void> {
  await Promise.all([removeAccessToken(), removeRefreshToken()]);
}

/**
 * 토큰 존재 여부 확인
 */
export async function hasTokens(): Promise<boolean> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  return !!(accessToken && refreshToken);
}
