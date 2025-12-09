import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';
import type { BodyweightExerciseType } from '@/db/bodyweightWorkoutRepository';

import TextBox from '@/components/common/TextBox';
import CustomHeader from '@/components/layout/CustomHeader';
import BodyweightExerciseCard from '@/components/workout/BodyweightExerciseCard';
import ErrorState from '@/components/workout/ErrorState';
import ExerciseCard from '@/components/workout/ExerciseCard';
import LoadingState from '@/components/workout/LoadingState';
import RestDayMessage from '@/components/workout/RestDayMessage';
import RestTimer from '@/components/workout/RestTimer';
import RoutineHeader from '@/components/workout/RoutineHeader';
import type { SetData } from '@/components/workout/SetInputTable';
import Stopwatch from '@/components/workout/Stopwatch';

import { useBodyweightWorkout } from '@/hooks/workout/useBodyweightWorkout';
import { useSaveWorkout } from '@/hooks/workout/useSaveWorkout';
import { useTodayRoutine } from '@/hooks/workout/useTodayRoutine';

import { formatDate, type RoutineCode } from '@/utils/routine';

type WorkoutCategory = 'gym' | 'bodyweight';

const TodayScreen = () => {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ date?: string; mode?: string }>();
  const [selectedCategory, setSelectedCategory] =
    useState<WorkoutCategory>('gym');

  // 날짜 파라미터가 있으면 해당 날짜, 없으면 오늘 (useMemo로 최적화)
  const today = useMemo(
    () => (params.date ? new Date(params.date) : new Date()),
    [params.date]
  );

  // 헬스 운동 데이터
  const {
    routineCode: baseRoutineCode,
    exercises: gymExercises,
    loading: gymLoading,
    error: gymError,
    refetch: refetchGym,
  } = useTodayRoutine(today);

  // 맨몸 운동 데이터
  const {
    exercises: bodyweightExercises,
    loading: bodyweightLoading,
    error: bodyweightError,
    saveExercise: saveBodyweightExercise,
    deleteExercise: deleteBodyweightExercise,
  } = useBodyweightWorkout(today);

  const { saveWorkoutSession, deleteWorkoutEntry } = useSaveWorkout();
  const forceRest = params.mode === 'rest';
  const effectiveRoutineCode: RoutineCode =
    forceRest || baseRoutineCode === 'WEEKEND' ? 'REST' : baseRoutineCode;

  const isToday = useMemo(
    () => !params.date || formatDate(today) === formatDate(new Date()),
    [params.date, today]
  );

  // 로딩 및 에러 상태 통합
  const loading = gymLoading || bodyweightLoading;
  const error = gymError || bodyweightError;

  // 루틴별 색상 가져오기 (useMemo로 최적화)
  const routineColor = useMemo(() => {
    if (effectiveRoutineCode === 'REST') {
      return theme.rest;
    }
    if (effectiveRoutineCode === 'A') {
      return theme.routineA;
    }
    if (effectiveRoutineCode === 'B') {
      return theme.routineB;
    }
    return theme.routineC;
  }, [effectiveRoutineCode, theme]);

  // 헬스 운동 저장 핸들러
  const handleGymSave = async (
    exerciseId: number,
    sets: SetData[],
    isUpdate: boolean
  ): Promise<boolean> => {
    const success = await saveWorkoutSession(
      effectiveRoutineCode,
      exerciseId,
      sets,
      today
    );
    if (success) {
      // 저장 성공 후 데이터 리패칭
      refetchGym();
    }
    return success;
  };

  // 헬스 운동 삭제 핸들러
  const handleGymDelete = async (
    exerciseId: number,
    resetRepsOnly: boolean
  ): Promise<boolean> => {
    const success = await deleteWorkoutEntry(
      effectiveRoutineCode,
      exerciseId,
      today,
      resetRepsOnly
    );
    if (success) {
      // 삭제 성공 후 데이터 리패칭
      refetchGym();
    }
    return success;
  };

  // 맨몸 운동 저장 핸들러
  const handleBodyweightSave = async (
    type: BodyweightExerciseType,
    sets: {
      setIndex: number;
      durationSeconds?: number | null;
      reps?: number | null;
      floors?: number | null;
      distanceKm?: number | null;
      timeSeconds?: number | null;
    }[]
  ): Promise<boolean> => {
    try {
      await saveBodyweightExercise(type, sets);
      return true;
    } catch (err) {
      console.error('맨몸 운동 저장 실패:', err);
      return false;
    }
  };

  // 맨몸 운동 삭제 핸들러
  const handleBodyweightDelete = async (
    type: BodyweightExerciseType
  ): Promise<boolean> => {
    try {
      await deleteBodyweightExercise(type);
      return true;
    } catch (err) {
      console.error('맨몸 운동 삭제 실패:', err);
      return false;
    }
  };

  if (loading) {
    return <LoadingState message="운동 데이터 로딩 중..." />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  console.log('gymExercises', gymExercises);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <CustomHeader
        title={isToday ? '오늘의 운동' : formatDate(today)}
        showBackButton
      />

      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.workoutBg }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 날짜 및 루틴 헤더 (헬스 운동일 때만 표시) */}
        {selectedCategory === 'gym' && (
          <RoutineHeader date={today} routineCode={effectiveRoutineCode} />
        )}

        {/* 카테고리 탭 */}
        <View style={styles.categoryTabs}>
          <Pressable
            onPress={() => setSelectedCategory('gym')}
            style={({ pressed }) => [
              styles.categoryTab,
              {
                backgroundColor:
                  selectedCategory === 'gym'
                    ? theme.accentOrange
                    : theme.surface,
                borderColor: theme.accentOrange,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <MaterialIcons
              name="fitness-center"
              size={20}
              color={
                selectedCategory === 'gym' ? theme.surface : theme.accentOrange
              }
            />
            <TextBox
              variant="body2"
              color={
                selectedCategory === 'gym' ? theme.surface : theme.accentOrange
              }
            >
              헬스 (5x5)
            </TextBox>
          </Pressable>

          <Pressable
            onPress={() => setSelectedCategory('bodyweight')}
            style={({ pressed }) => [
              styles.categoryTab,
              {
                backgroundColor:
                  selectedCategory === 'bodyweight'
                    ? theme.accentOrange
                    : theme.surface,
                borderColor: theme.accentOrange,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <MaterialIcons
              name="self-improvement"
              size={20}
              color={
                selectedCategory === 'bodyweight'
                  ? theme.surface
                  : theme.accentOrange
              }
            />
            <TextBox
              variant="body2"
              color={
                selectedCategory === 'bodyweight'
                  ? theme.surface
                  : theme.accentOrange
              }
            >
              맨몸 운동
            </TextBox>
          </Pressable>
        </View>

        {/* 헬스 운동 섹션 */}
        {selectedCategory === 'gym' && (
          <View style={styles.workoutSection}>
            {effectiveRoutineCode === 'REST' ? (
              <RestDayMessage />
            ) : (
              <>
                {gymExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    routineColor={routineColor}
                    routineCode={effectiveRoutineCode as RoutineCode}
                    onSave={handleGymSave}
                    onDelete={handleGymDelete}
                    refetch={refetchGym}
                  />
                ))}
              </>
            )}
          </View>
        )}

        {/* 맨몸 운동 섹션 */}
        {selectedCategory === 'bodyweight' && (
          <View style={styles.workoutSection}>
            {bodyweightExercises.map((exercise) => (
              <BodyweightExerciseCard
                key={exercise.type}
                exercise={exercise}
                onSave={handleBodyweightSave}
                onDelete={handleBodyweightDelete}
              />
            ))}
          </View>
        )}

        {/* 타이머와 스톱워치 (맨 아래) */}
        <View style={styles.timerSection}>
          <RestTimer defaultSeconds={90} />
          <Stopwatch />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TodayScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  categoryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  workoutSection: {
    marginBottom: 20,
  },
  timerSection: {
    marginTop: 20,
    gap: 16,
  },
});
