import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';

import SelectBox from '@/components/common/SelectBox';
import TextBox from '@/components/common/TextBox';
import CustomHeader from '@/components/layout/CustomHeader';
import ExerciseEntryCard from '@/components/workout/ExerciseEntryCard';
import BodyweightEntryCard from '@/components/workout/BodyweightEntryCard';

import { useBodyweightExerciseEntries } from '@/hooks/workout/useBodyweightExerciseEntries';
import { BODYWEIGHT_EXERCISES } from '@/hooks/workout/useBodyweightWorkout';
import { useExerciseEntries } from '@/hooks/workout/useExerciseEntries';
import { useExercises } from '@/hooks/workout/useExercises';

const ExercisesScreen = () => {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{
    exerciseId?: string;
    bodyweightType?: string;
  }>();
  const { exercises, loading: exercisesLoading } = useExercises();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // 파라미터로 받은 exerciseId 또는 bodyweightType을 초기 선택값으로 설정
  useEffect(() => {
    if (params.exerciseId && exercises.length > 0) {
      const exerciseId = parseInt(params.exerciseId, 10);
      // exercises 배열에 해당 ID가 있는지 확인
      const exerciseExists = exercises.some((ex) => ex.id === exerciseId);
      if (exerciseExists && !isNaN(exerciseId)) {
        setSelectedOption(`standard:${exerciseId}`);
      }
    } else if (params.bodyweightType) {
      const type = params.bodyweightType;
      if (
        type === 'hang' ||
        type === 'pushup' ||
        type === 'handstand_pushup' ||
        type === 'stairs' ||
        type === 'running'
      ) {
        setSelectedOption(`bodyweight:${type}`);
      }
    }
  }, [params.exerciseId, params.bodyweightType, exercises]);
  const selectOptions = useMemo(() => {
    const standardOptions = exercises.map((exercise) => ({
      label: exercise.name,
      value: `standard:${exercise.id}`,
    }));
    const weekendOptions = BODYWEIGHT_EXERCISES.map((exercise) => ({
      label: `맨몸 - ${exercise.name}`,
      value: `bodyweight:${exercise.type}`,
    }));
    return [...standardOptions, ...weekendOptions];
  }, [exercises]);

  const isStandardSelection = selectedOption?.startsWith('standard:') ?? false;
  const selectedExerciseId = isStandardSelection
    ? parseInt((selectedOption || '').split(':')[1], 10)
    : null;

  const selectedBodyweightType = useMemo(() => {
    if (selectedOption?.startsWith('bodyweight:')) {
      const type = selectedOption.split(':')[1];
      if (
        type === 'hang' ||
        type === 'pushup' ||
        type === 'handstand_pushup' ||
        type === 'stairs' ||
        type === 'running'
      ) {
        return type;
      }
    }
    return null;
  }, [selectedOption]);

  const {
    entries,
    loading: entriesLoading,
    error,
    hasMore,
    loadMore,
  } = useExerciseEntries(selectedExerciseId);

  const {
    entries: bodyweightEntries,
    loading: bodyweightEntriesLoading,
    error: bodyweightError,
    hasMore: bodyweightHasMore,
    loadMore: bodyweightLoadMore,
  } = useBodyweightExerciseEntries(selectedBodyweightType);

  const handleLoadMore = () => {
    if (selectedBodyweightType) {
      if (bodyweightHasMore && !bodyweightEntriesLoading) {
        bodyweightLoadMore();
      }
    } else if (hasMore && !entriesLoading) {
      loadMore();
    }
  };

  const renderFooter = () => {
    const loadingState = selectedBodyweightType
      ? bodyweightEntriesLoading
      : entriesLoading;
    if (!loadingState) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  };

  const currentEntries = selectedBodyweightType ? bodyweightEntries : entries;
  const currentLoading = selectedBodyweightType
    ? bodyweightEntriesLoading
    : entriesLoading;
  const currentError = selectedBodyweightType ? bodyweightError : error;

  return (
    <View style={[styles.container, { backgroundColor: theme.workoutBg }]}>
      <CustomHeader title="종목별 보기" showBackButton />

      <View style={styles.content}>
        {/* 운동종목 선택 */}
        <View style={styles.selectContainer}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.selectLabel}
          >
            운동종목 선택
          </TextBox>
          <SelectBox
            options={selectOptions}
            selectedValue={selectedOption}
            onValueChange={(value) => setSelectedOption(value as string)}
            placeholder="운동종목을 선택하세요"
          />
        </View>

        {/* 운동 기록 리스트 */}
        {selectedOption ? (
          <View style={styles.listContainer}>
            {currentLoading && currentEntries.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <TextBox
                  variant="body2"
                  color={theme.textSecondary}
                  style={styles.loadingText}
                >
                  기록을 불러오는 중...
                </TextBox>
              </View>
            ) : currentError ? (
              <View style={styles.errorContainer}>
                <TextBox variant="body2" color={theme.error}>
                  {currentError}
                </TextBox>
              </View>
            ) : currentEntries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <TextBox variant="body2" color={theme.textSecondary}>
                  기록이 없습니다
                </TextBox>
              </View>
            ) : selectedBodyweightType ? (
              <FlatList
                data={bodyweightEntries}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <BodyweightEntryCard entry={item} />}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <FlatList
                data={entries}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => <ExerciseEntryCard entry={item} />}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <TextBox variant="body2" color={theme.textSecondary}>
              운동종목을 선택하면 기록을 확인할 수 있습니다
            </TextBox>
          </View>
        )}
      </View>
    </View>
  );
};

export default ExercisesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  selectContainer: {
    marginBottom: 24,
    gap: 12,
  },
  selectLabel: {
    marginBottom: 8,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
