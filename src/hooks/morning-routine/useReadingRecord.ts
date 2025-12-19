import { useState, useEffect, useCallback } from 'react';

import {
  getTodayReadingRecord,
  upsertReadingRecord,
  deleteTodayReadingRecord,
} from '@/db/morningRoutineRepository';

import type { ReadingRecord } from '@/types/morning-routine';

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getCurrentTimeISO(): string {
  return new Date().toISOString();
}

function calculateDurationMinutes(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
}

export function useReadingRecord() {
  const [todayRecord, setTodayRecord] = useState<ReadingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReading, setIsReading] = useState(false);

  // 오늘 기록 조회
  const loadTodayRecord = useCallback(async () => {
    try {
      setIsLoading(true);
      const date = getTodayDateString();
      const record = await getTodayReadingRecord(date);
      setTodayRecord(record);
      setIsReading(!!record && !record.end_time);
    } catch (error) {
      console.error('독서 기록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 독서 시작
  const startReading = useCallback(async () => {
    try {
      setIsLoading(true);
      const date = getTodayDateString();
      const startTime = getCurrentTimeISO();

      const success = await upsertReadingRecord({
        date,
        book_name: null,
        page_start: null,
        page_end: null,
        summary: null,
        start_time: startTime,
        end_time: null,
        duration_minutes: null,
      });

      if (success) {
        await loadTodayRecord();
      }
    } catch (error) {
      console.error('독서 시작 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadTodayRecord]);

  // 독서 완료
  const completeReading = useCallback(
    async (
      bookName: string,
      pageStart: number,
      pageEnd: number,
      summary: string
    ) => {
      try {
        setIsLoading(true);
        const date = getTodayDateString();
        const endTime = getCurrentTimeISO();

        if (!todayRecord || !todayRecord.start_time) {
          throw new Error('독서를 시작하지 않았습니다.');
        }

        const durationMinutes = calculateDurationMinutes(
          todayRecord.start_time,
          endTime
        );

        const success = await upsertReadingRecord({
          date,
          book_name: bookName,
          page_start: pageStart,
          page_end: pageEnd,
          summary,
          start_time: todayRecord.start_time,
          end_time: endTime,
          duration_minutes: durationMinutes,
        });

        if (success) {
          await loadTodayRecord();
        }
      } catch (error) {
        console.error('독서 완료 실패:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [todayRecord, loadTodayRecord]
  );

  // 오늘 기록 초기화
  const resetTodayRecord = useCallback(async () => {
    try {
      setIsLoading(true);
      const date = getTodayDateString();
      const success = await deleteTodayReadingRecord(date);
      if (success) {
        await loadTodayRecord();
      }
    } catch (error) {
      console.error('독서 기록 초기화 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadTodayRecord]);

  useEffect(() => {
    loadTodayRecord();
  }, [loadTodayRecord]);

  return {
    todayRecord,
    isLoading,
    startReading,
    completeReading,
    isReading,
    refresh: loadTodayRecord,
    resetTodayRecord,
  };
}
