import { useState, useEffect, useCallback } from 'react';

import {
  getMonthlyRecords,
  getDateRecord,
} from '@/db/morningRoutineRepository';

import type { DateRecord } from '@/types/morning-routine';

export function useMonthlyRecords(year: number, month: number) {
  const [records, setRecords] = useState<{
    [date: string]: DateRecord;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  // 월별 기록 조회
  const loadRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMonthlyRecords(year, month);
      setRecords(data);
    } catch (error) {
      console.error('월별 기록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  // 날짜별 기록 조회
  const getDateRecordData = useCallback(
    async (date: string): Promise<DateRecord | null> => {
      try {
        const data = await getDateRecord(date);
        if (!data) return null;

        return {
          reading: !!data.reading?.end_time,
          stairs: !!data.stairs?.end_time,
          pushup: !!data.pushup?.end_time,
        };
      } catch (error) {
        console.error('날짜별 기록 조회 실패:', error);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return {
    records,
    isLoading,
    getDateRecord: getDateRecordData,
    refresh: loadRecords,
  };
}
