/**
 * 인증 설정
 *
 * 서버가 배포되지 않은 상태에서 APK 빌드 테스트를 위해
 * 인증을 건너뛸 수 있도록 설정합니다.
 *
 * 사용법:
 * - SKIP_AUTH를 true로 설정하면 자동으로 로그인된 상태로 처리됩니다.
 * - false로 설정하면 정상적인 인증 플로우를 사용합니다.
 */

/**
 * 인증 건너뛰기 여부
 *
 * true: 서버 없이 테스트 (자동 로그인)
 * false: 정상 인증 플로우 사용
 */
export const SKIP_AUTH = true;

/**
 * 인증 모드 확인 함수
 */
export const shouldSkipAuth = (): boolean => {
  return SKIP_AUTH;
};
