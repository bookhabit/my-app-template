import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

import {
  getTodayStairsRecord,
  upsertStairsRecord,
  deleteTodayStairsRecord,
} from '@/db/morningRoutineRepository';
import PedometerManager from '@/manager/PedometerManager';

import type { StairsRecord } from '@/types/morning-routine';

import ForegroundServiceUtils from '@/utils/foregroundServiceUtils';

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

function getCurrentWeekNumber(): number {
  const startDate = new Date('2026-01-01');
  const today = new Date();
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

export function useStairsRecord(targetFloors: number) {
  const [todayRecord, setTodayRecord] = useState<StairsRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStairsActive, setIsStairsActive] = useState(false);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [pedometerManager] = useState(() => new PedometerManager());

  // 오늘 기록 조회
  const loadTodayRecord = useCallback(async () => {
    try {
      setIsLoading(true);
      const date = getTodayDateString();
      const record = await getTodayStairsRecord(date);
      setTodayRecord(record);
      setIsStairsActive(!!record && !record.end_time);

      // 만보기 걸음수 조회
      if (Platform.OS === 'android') {
        try {
          const status = await ForegroundServiceUtils.getServiceStatus();
          if (status?.totalSteps) {
            setCurrentSteps(status.totalSteps);
          }
        } catch (error) {
          console.error('걸음수 조회 실패:', error);
        }
      }
    } catch (error) {
      console.error('계단 기록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 계단 운동 시작
  const startStairs = useCallback(async () => {
    try {
      setIsLoading(true);
      const date = getTodayDateString();
      const startTime = getCurrentTimeISO();
      const weekNumber = getCurrentWeekNumber();

      // 만보기 서비스 시작 (Android)
      if (Platform.OS === 'android') {
        try {
          await pedometerManager.startUpdates();
          await ForegroundServiceUtils.startService();
        } catch (error) {
          console.error('만보기 서비스 시작 실패:', error);
        }
      }

      const success = await upsertStairsRecord({
        date,
        week_number: weekNumber,
        target_floors: targetFloors,
        start_time: startTime,
        end_time: null,
        duration_minutes: null,
        steps_count: null,
      });

      if (success) {
        await loadTodayRecord();
      }
    } catch (error) {
      console.error('계단 운동 시작 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [targetFloors, loadTodayRecord, pedometerManager]);

  // 계단 운동 완료
  const completeStairs = useCallback(async () => {
    try {
      setIsLoading(true);
      const date = getTodayDateString();
      const endTime = getCurrentTimeISO();

      if (!todayRecord || !todayRecord.start_time) {
        throw new Error('계단 운동을 시작하지 않았습니다.');
      }

      // 만보기 걸음수 조회
      let stepsCount = null;
      if (Platform.OS === 'android') {
        try {
          const status = await ForegroundServiceUtils.getServiceStatus();
          if (status?.totalSteps) {
            stepsCount = status.totalSteps;
            setCurrentSteps(status.totalSteps);
          }
        } catch (error) {
          console.error('걸음수 조회 실패:', error);
        }
      }

      const durationMinutes = calculateDurationMinutes(
        todayRecord.start_time,
        endTime
      );

      const success = await upsertStairsRecord({
        date,
        week_number: todayRecord.week_number,
        target_floors: todayRecord.target_floors,
        start_time: todayRecord.start_time,
        end_time: endTime,
        duration_minutes: durationMinutes,
        steps_count: stepsCount,
      });

      if (success) {
        // 만보기 서비스 중지
        if (Platform.OS === 'android') {
          try {
            await pedometerManager.stopUpdates();
            await ForegroundServiceUtils.stopService();
          } catch (error) {
            console.error('만보기 서비스 중지 실패:', error);
          }
        }
        await loadTodayRecord();
      }
    } catch (error) {
      console.error('계단 운동 완료 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [todayRecord, loadTodayRecord, pedometerManager]);

  // 실시간 걸음수 업데이트
  useEffect(() => {
    if (!isStairsActive || Platform.OS !== 'android') return;

    const eventEmitter = pedometerManager.getEventEmitter();
    const subscription = eventEmitter.addListener(
      'StepUpdate',
      (data: { totalSteps: number }) => {
        setCurrentSteps(data.totalSteps);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isStairsActive, pedometerManager]);

  // 오늘 기록 초기화
  const resetTodayRecord = useCallback(async () => {
    try {
      setIsLoading(true);
      const date = getTodayDateString();

      // 만보기 서비스 중지
      if (Platform.OS === 'android') {
        try {
          await pedometerManager.stopUpdates();
          await ForegroundServiceUtils.stopService();
        } catch (error) {
          console.error('만보기 서비스 중지 실패:', error);
        }
      }

      const success = await deleteTodayStairsRecord(date);
      if (success) {
        setCurrentSteps(0);
        await loadTodayRecord();
      }
    } catch (error) {
      console.error('계단 기록 초기화 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadTodayRecord, pedometerManager]);

  useEffect(() => {
    loadTodayRecord();
  }, [loadTodayRecord]);

  return {
    todayRecord,
    isLoading,
    startStairs,
    completeStairs,
    isStairsActive,
    currentSteps,
    refresh: loadTodayRecord,
    resetTodayRecord,
  };
}
