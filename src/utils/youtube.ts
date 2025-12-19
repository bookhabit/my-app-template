/**
 * YouTube 비디오 ID 추출 함수
 * @param url - YouTube URL
 * @returns 비디오 ID 또는 null
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

/**
 * YouTube URL이 쇼츠인지 확인
 * @param url - YouTube URL
 * @returns 쇼츠 여부
 */
export const isYouTubeShorts = (url: string): boolean => {
  return /youtube\.com\/shorts\//.test(url);
};

/**
 * YouTube 비디오 정보 추출
 * @param url - YouTube URL
 * @returns 비디오 ID와 쇼츠 여부
 */
export const extractYouTubeInfo = (url: string): {
  videoId: string | null;
  isShorts: boolean;
} => {
  const videoId = extractYouTubeVideoId(url);
  const isShorts = isYouTubeShorts(url);

  return {
    videoId,
    isShorts,
  };
};

