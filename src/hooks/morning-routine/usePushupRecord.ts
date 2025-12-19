import { useState, useEffect, useCallback } from 'react';

import type { PushupRecord } from '@/types/morning-routine';
import {
  getTodayPushupRecord,
  upsertPushupRecord,
} from '@/db/morningRoutineRepository';

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getCurrentTimeISO(): string {
  return new Date().toISOString();
}

function calculateDurationMinutes(
  startTime: string,
  endTime: string
): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
}

function getCurrentWeekNumber(): number {
  const startDate = new Date('2026-01-01');
  const today = new Date();
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

export function usePushupRecord(targetCount: number) {
  const [todayRecord, setTodayRecord] = useState<PushupRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPushupActive, setIsPushupActive] = useState(false);

  // 오늘 기록 조회
  const loadTodayRecord = useCallback(async () => {
    try {
      setIsLoading(true);
      const date = getTodayDateString();
      const record = await getTodayPushupRecord(date);
      setTodayRecord(record);
      setIsPushupActive(!!record && !record.end_time);
    } catch (error) {
      console.error('푸쉬업 기록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 푸쉬업 시작
  const startPushup = useCallback(async () => {
    try {
      setIsLoading(true);
      const date = getTodayDateString();
      const startTime = getCurrentTimeISO();
      const weekNumber = getCurrentWeekNumber();

      const success = await upsertPushupRecord({
        date,
        week_number: weekNumber,
        target_count: targetCount,
        start_time: startTime,
        end_time: null,
        duration_minutes: null,
      });

      if (success) {
        await loadTodayRecord();
      }
    } catch (error) {
      console.error('푸쉬업 시작 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [targetCount, loadTodayRecord]);

  // 푸쉬업 완료
  const completePushup = useCallback(async () => {
    try {
      setIsLoading(true);
      const date = getTodayDateString();
      const endTime = getCurrentTimeISO();

      if (!todayRecord || !todayRecord.start_time) {
        throw new Error('푸쉬업을 시작하지 않았습니다.');
      }

      const durationMinutes = calculateDurationMinutes(
        todayRecord.start_time,
        endTime
      );

      const success = await upsertPushupRecord({
        date,
        week_number: todayRecord.week_number,
        target_count: todayRecord.target_count,
        start_time: todayRecord.start_time,
        end_time: endTime,
        duration_minutes: durationMinutes,
      });

      if (success) {
        await loadTodayRecord();
      }
    } catch (error) {
      console.error('푸쉬업 완료 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [todayRecord, loadTodayRecord]);

  useEffect(() => {
    loadTodayRecord();
  }, [loadTodayRecord]);

  return {
    todayRecord,
    isLoading,
    startPushup,
    completePushup,
    isPushupActive,
    refresh: loadTodayRecord,
  };
}

