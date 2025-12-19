import { useState, useEffect, useCallback } from 'react';

import {
  getHabitYoutubeVideo,
  upsertHabitYoutubeVideo,
} from '@/db/morningRoutineRepository';

import type { HabitYoutubeVideo } from '@/types/morning-routine';

import { extractYouTubeInfo } from '@/utils/youtube';

export function useHabitYoutubeVideo(
  habitType: 'reading' | 'stairs' | 'pushup'
) {
  const [video, setVideo] = useState<HabitYoutubeVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 영상 조회
  const loadVideo = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getHabitYoutubeVideo(habitType);
      setVideo(data);
    } catch (error) {
      console.error('유튜브 영상 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [habitType]);

  // 영상 저장/수정
  const saveVideo = useCallback(
    async (videoUrl: string) => {
      try {
        setIsLoading(true);
        const { videoId, isShorts } = extractYouTubeInfo(videoUrl);

        if (!videoId) {
          throw new Error('유효한 유튜브 링크가 아닙니다.');
        }

        const success = await upsertHabitYoutubeVideo({
          habit_type: habitType,
          video_id: videoId,
          video_url: videoUrl,
          is_shorts: isShorts,
        });

        if (success) {
          await loadVideo();
        }
      } catch (error) {
        console.error('유튜브 영상 저장 실패:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [habitType, loadVideo]
  );

  // 영상 수정 (saveVideo와 동일하지만 명확성을 위해 별도 함수)
  const updateVideo = useCallback(
    async (videoUrl: string) => {
      return saveVideo(videoUrl);
    },
    [saveVideo]
  );

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  return {
    video,
    isLoading,
    saveVideo,
    updateVideo,
    refresh: loadVideo,
  };
}
