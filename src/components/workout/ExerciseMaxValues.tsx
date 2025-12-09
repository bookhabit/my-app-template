import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

import { useAllExercises } from '@/hooks/workout/useAllExercises';

const ExerciseMaxValues: React.FC = () => {
  const { theme } = useTheme();
  const { exercises, refetch } = useAllExercises();

  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <View style={styles.headingContainer}>
        <TextBox variant="title3" color={theme.text} style={styles.heading}>
          종목별 현재 최고 중량
        </TextBox>
        <Pressable
          onPress={handleRefresh}
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.refreshButtonPressed,
          ]}
        >
          <MaterialIcons name="refresh" size={20} color={theme.accentOrange} />
        </Pressable>
      </View>
      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.surface,
            borderLeftWidth: 4,
            borderLeftColor: theme.accentOrange,
          },
        ]}
      >
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={48} color={theme.textSecondary} />
            <TextBox
              variant="body2"
              color={theme.textSecondary}
              style={styles.emptyText}
            >
              등록된 운동이 없습니다
            </TextBox>
          </View>
        ) : (
          <View style={styles.exercisesList}>
            {exercises.map((exercise) => (
              <View
                key={exercise.id}
                style={[
                  styles.exerciseRow,
                  {
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.exerciseName}
                >
                  {exercise.name}
                </TextBox>
                <TextBox
                  variant="body2"
                  color={theme.accentOrange}
                  style={styles.maxValue}
                >
                  {exercise.slug === 'pullup'
                    ? exercise.maxReps
                      ? `${exercise.maxReps}개`
                      : '-'
                    : exercise.maxWeight
                      ? `${exercise.maxWeight}kg`
                      : '-'}
                </TextBox>
              </View>
            ))}
          </View>
        )}
      </View>
    </>
  );
};

export default ExerciseMaxValues;

const styles = StyleSheet.create({
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  heading: {
    flex: 1,
  },
  refreshButton: {
    padding: 4,
    borderRadius: 20,
  },
  refreshButtonPressed: {
    opacity: 0.6,
  },
  section: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
  },
  exercisesList: {
    gap: 0,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  exerciseName: {
    flex: 1,
  },
  maxValue: {
    fontWeight: 'bold',
  },
});
