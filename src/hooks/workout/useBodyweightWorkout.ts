import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  deleteBodyweightExerciseEntries,
  getBodyweightEntriesByDate,
  getLatestBodyweightHistory,
  getMaxBodyweightValue,
  replaceBodyweightExerciseEntries,
  type BodyweightExerciseType,
  type BodyweightSetInput,
} from '@/db/bodyweightWorkoutRepository';

import { formatDate } from '@/utils/routine';

export interface BodyweightExerciseSet {
  set: number;
  durationSeconds?: number | null;
  reps?: number | null;
  floors?: number | null;
  distanceKm?: number | null;
  timeSeconds?: number | null;
}

export interface BodyweightExerciseState {
  type: BodyweightExerciseType;
  name: string;
  description: string;
  valueUnit: string;
  helperText?: string;
  sets: BodyweightExerciseSet[];
  hasSavedData: boolean;
  maxValue: number | null;
  latestHistory?: {
    date: string;
    sets: BodyweightExerciseSet[];
  };
}

const BODYWEIGHT_EXERCISES_CONFIG: Record<
  BodyweightExerciseType,
  Omit<BodyweightExerciseState, 'type' | 'sets' | 'hasSavedData' | 'maxValue'>
> = {
  hang: {
    name: '철봉 매달리기',
    description: '세트별 매달린 시간을 기록하세요',
    valueUnit: '초',
  },
  pushup: {
    name: '푸쉬업',
    description: '세트별 횟수를 기록하세요',
    valueUnit: '회',
  },
  handstand_pushup: {
    name: '물구나무 푸쉬업',
    description: '세트별 횟수를 기록하세요',
    valueUnit: '회',
  },
  stairs: {
    name: '계단 오르기',
    description: '세트별로 오른 층수를 기록하세요',
    valueUnit: '층',
  },
  running: {
    name: '러닝',
    description: '세트별로 거리(km)와 시간을 기록하세요',
    valueUnit: 'km',
  },
};

const ORDER: BodyweightExerciseType[] = [
  'stairs',
  'pushup',
  'handstand_pushup',
  'hang',
  'running',
];

export function useBodyweightWorkout(targetDate: Date = new Date()) {
  const [exercises, setExercises] = useState<BodyweightExerciseState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const formattedDate = useMemo(() => formatDate(targetDate), [targetDate]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await getBodyweightEntriesByDate(formattedDate);

      const grouped = new Map<
        BodyweightExerciseType,
        BodyweightExerciseSet[]
      >();
      for (const type of ORDER) {
        grouped.set(type, []);
      }

      rows.forEach((row) => {
        const sets = grouped.get(row.exercise_type as BodyweightExerciseType);
        if (!sets) return;
        sets.push({
          set: row.set_index,
          durationSeconds: row.duration_seconds,
          reps: row.reps,
          floors: row.floors,
          distanceKm: row.distance_km,
          timeSeconds: row.time_seconds,
        });
      });

      const next: BodyweightExerciseState[] = await Promise.all(
        ORDER.map(async (type) => {
          const config = BODYWEIGHT_EXERCISES_CONFIG[type];
          const sets = grouped.get(type)?.sort((a, b) => a.set - b.set) ?? [];

          const [latestHistory, maxValue] = await Promise.all([
            getLatestBodyweightHistory(type),
            getMaxBodyweightValue(type),
          ]);

          return {
            type,
            ...config,
            sets,
            hasSavedData: sets.length > 0,
            maxValue,
            latestHistory: latestHistory
              ? {
                  date: latestHistory.date,
                  sets: latestHistory.sets.map((set) => ({
                    set: set.setIndex,
                    durationSeconds: set.durationSeconds,
                    reps: set.reps,
                    floors: set.floors,
                    distanceKm: set.distanceKm,
                    timeSeconds: set.timeSeconds,
                  })),
                }
              : undefined,
          };
        })
      );

      setExercises(next);
      setError(null);
    } catch (err) {
      console.error('맨몸 운동 데이터 로드 실패:', err);
      setError(err instanceof Error ? err.message : '맨몸 운동 로드 실패');
    } finally {
      setLoading(false);
    }
  }, [formattedDate]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveExercise = useCallback(
    async (type: BodyweightExerciseType, sets: BodyweightSetInput[]) => {
      try {
        await replaceBodyweightExerciseEntries(formattedDate, type, sets);
        await load();
        return true;
      } catch (err) {
        console.error('맨몸 운동 저장 실패:', err);
        setError(err instanceof Error ? err.message : '맨몸 운동 저장 실패');
        throw err;
      }
    },
    [formattedDate, load]
  );

  const deleteExercise = useCallback(
    async (type: BodyweightExerciseType) => {
      try {
        await deleteBodyweightExerciseEntries(formattedDate, type);
        await load();
        return true;
      } catch (err) {
        console.error('맨몸 운동 삭제 실패:', err);
        setError(err instanceof Error ? err.message : '맨몸 운동 삭제 실패');
        throw err;
      }
    },
    [formattedDate, load]
  );

  return {
    date: formattedDate,
    exercises,
    loading,
    error,
    saveExercise,
    deleteExercise,
    refresh: load,
  };
}

export const BODYWEIGHT_EXERCISES = ORDER.map((type) => ({
  type,
  ...BODYWEIGHT_EXERCISES_CONFIG[type],
}));
