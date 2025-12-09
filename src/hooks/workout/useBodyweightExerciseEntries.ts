import { useCallback, useEffect, useState } from 'react';

import {
  getBodyweightHistory,
  type BodyweightExerciseType,
} from '@/db/bodyweightWorkoutRepository';

import { BODYWEIGHT_EXERCISES } from '@/hooks/workout/useBodyweightWorkout';

const PAGE_SIZE = 30;

export interface BodyweightExerciseHistory {
  id: string;
  date: string;
  exerciseType: BodyweightExerciseType;
  exerciseName: string;
  unitLabel: string;
  sets: {
    setIndex: number;
    durationSeconds: number | null;
    reps: number | null;
    floors: number | null;
    distanceKm: number | null;
    timeSeconds: number | null;
  }[];
}

export function useBodyweightExerciseEntries(
  exerciseType: BodyweightExerciseType | null
) {
  const [entries, setEntries] = useState<BodyweightExerciseHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const exerciseConfig = BODYWEIGHT_EXERCISES.find(
    (item) => item.type === exerciseType
  );

  const fetchEntries = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      if (!exerciseType) {
        setEntries([]);
        setHasMore(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const history = await getBodyweightHistory(
          exerciseType,
          PAGE_SIZE,
          pageNum * PAGE_SIZE
        );

        const formatted: BodyweightExerciseHistory[] = history.map((item) => ({
          id: `${exerciseType}-${item.date}`,
          date: item.date,
          exerciseType,
          exerciseName: exerciseConfig?.name ?? '맨몸 운동',
          unitLabel: exerciseConfig?.valueUnit ?? '',
          sets: item.sets.map((set) => ({
            setIndex: set.setIndex,
            durationSeconds: set.durationSeconds,
            reps: set.reps,
            floors: set.floors,
            distanceKm: set.distanceKm,
            timeSeconds: set.timeSeconds,
          })),
        }));

        if (reset) {
          setEntries(formatted);
        } else {
          setEntries((prev) => [...prev, ...formatted]);
        }

        setHasMore(formatted.length === PAGE_SIZE);
        setPage(pageNum);
      } catch (err) {
        console.error('맨몸 운동 기록 조회 실패:', err);
        setError(
          err instanceof Error ? err.message : '맨몸 운동 기록 조회 실패'
        );
      } finally {
        setLoading(false);
      }
    },
    [exerciseType, exerciseConfig]
  );

  useEffect(() => {
    if (exerciseType) {
      setPage(0);
      setHasMore(true);
      setEntries([]);
      fetchEntries(0, true);
    } else {
      setEntries([]);
      setHasMore(false);
    }
  }, [exerciseType, fetchEntries]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && exerciseType) {
      fetchEntries(page + 1);
    }
  }, [loading, hasMore, exerciseType, page, fetchEntries]);

  return {
    entries,
    loading,
    error,
    hasMore,
    loadMore,
    refetch: () => {
      if (exerciseType) {
        setPage(0);
        setHasMore(true);
        fetchEntries(0, true);
      }
    },
  };
}
