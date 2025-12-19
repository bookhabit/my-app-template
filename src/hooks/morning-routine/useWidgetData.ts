import { useState, useEffect, useCallback } from 'react';

import {
  getTodayReadingRecord,
  getTodayStairsRecord,
  getTodayPushupRecord,
} from '@/db/morningRoutineRepository';

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function useWidgetData() {
  const [todayHabits, setTodayHabits] = useState({
    reading: false,
    stairs: false,
    pushup: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 오늘 아침 습관 데이터 조회
  const loadTodayHabits = useCallback(async () => {
    try {
      setIsLoading(true);
      const date = getTodayDateString();

      const [reading, stairs, pushup] = await Promise.all([
        getTodayReadingRecord(date),
        getTodayStairsRecord(date),
        getTodayPushupRecord(date),
      ]);

      setTodayHabits({
        reading: !!reading?.end_time,
        stairs: !!stairs?.end_time,
        pushup: !!pushup?.end_time,
      });
    } catch (error) {
      console.error('위젯 데이터 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 위젯 업데이트
  const refreshWidget = useCallback(async () => {
    await loadTodayHabits();
    // TODO: Expo 위젯 업데이트 API 호출
  }, [loadTodayHabits]);

  useEffect(() => {
    loadTodayHabits();
  }, [loadTodayHabits]);

  return {
    todayHabits,
    isLoading,
    refreshWidget,
  };
}
