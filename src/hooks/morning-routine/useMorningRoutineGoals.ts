import { useState, useEffect, useCallback } from 'react';

import {
  getMorningRoutineGoals,
  upsertMorningRoutineGoals,
} from '@/db/morningRoutineRepository';

import type { MorningRoutineGoals } from '@/types/morning-routine';

const CURRENT_YEAR = 2026;

export function useMorningRoutineGoals() {
  const [goals, setGoals] = useState<MorningRoutineGoals | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 목표 설정 조회
  const loadGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMorningRoutineGoals(CURRENT_YEAR);
      setGoals(data);
    } catch (error) {
      console.error('목표 설정 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 목표 설정 저장/수정
  const updateGoals = useCallback(
    async (newGoals: Partial<MorningRoutineGoals>) => {
      try {
        setIsLoading(true);
        const success = await upsertMorningRoutineGoals({
          year: CURRENT_YEAR,
          ...newGoals,
        });
        if (success) {
          await loadGoals();
        }
      } catch (error) {
        console.error('목표 설정 저장 실패:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [loadGoals]
  );

  // 현재 주차 목표 층수 계산
  const getCurrentWeekStairsTarget = useCallback((): number => {
    if (!goals || !goals.stairs_initial_floors) return 0;

    const initial = goals.stairs_initial_floors;
    const increment = goals.stairs_increment_floors || 0;
    const max = goals.stairs_max_floors || Infinity;

    // 2026년 1월 1일부터의 주차 계산
    const startDate = new Date('2026-01-01T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 음수 방지 및 최소 1주차 보장
    const weekNumber = Math.max(1, Math.floor(diffDays / 7) + 1);

    const target = initial + (weekNumber - 1) * increment;
    return Math.max(0, Math.min(target, max));
  }, [goals]);

  // 현재 주차 목표 푸쉬업 개수 계산
  const getCurrentWeekPushupTarget = useCallback((): number => {
    if (!goals || !goals.pushup_initial_count) return 0;

    const initial = goals.pushup_initial_count;
    const increment = goals.pushup_increment_count || 0;
    const max = goals.pushup_max_count || Infinity;

    // 2026년 1월 1일부터의 주차 계산
    const startDate = new Date('2026-01-01T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 음수 방지 및 최소 1주차 보장
    const weekNumber = Math.max(1, Math.floor(diffDays / 7) + 1);

    const target = initial + (weekNumber - 1) * increment;
    return Math.max(0, Math.min(target, max));
  }, [goals]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return {
    goals,
    isLoading,
    updateGoals,
    getCurrentWeekStairsTarget,
    getCurrentWeekPushupTarget,
    refresh: loadGoals,
  };
}
