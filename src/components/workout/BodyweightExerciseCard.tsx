import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';

import { useRouter } from 'expo-router';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';
import type { BodyweightExerciseType } from '@/db/bodyweightWorkoutRepository';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

import type {
  BodyweightExerciseState,
  BodyweightExerciseSet,
} from '@/hooks/workout/useBodyweightWorkout';

interface BodyweightExerciseCardProps {
  exercise: BodyweightExerciseState;
  onSave: (
    type: BodyweightExerciseType,
    sets: {
      setIndex: number;
      durationSeconds?: number | null;
      reps?: number | null;
      floors?: number | null;
      distanceKm?: number | null;
      timeSeconds?: number | null;
    }[]
  ) => Promise<boolean>;
  onDelete: (type: BodyweightExerciseType) => Promise<boolean>;
}

interface SetInputState {
  setIndex: number;
  value: string;
  timeValue?: string; // running일 때만 사용
}

const MAX_SETS = 10;

const valueKeyMap: Record<
  BodyweightExerciseType,
  'durationSeconds' | 'reps' | 'floors' | 'distanceKm'
> = {
  hang: 'durationSeconds',
  pushup: 'reps',
  handstand_pushup: 'reps',
  stairs: 'floors',
  running: 'distanceKm',
};

const numericValidationMessage: Record<BodyweightExerciseType, string> = {
  hang: '초 단위 숫자를 입력해주세요.',
  pushup: '횟수는 숫자로 입력해주세요.',
  handstand_pushup: '횟수는 숫자로 입력해주세요.',
  stairs: '층수는 숫자로 입력해주세요.',
  running: '거리(km)를 입력해주세요.',
};

const BodyweightExerciseCard: React.FC<BodyweightExerciseCardProps> = ({
  exercise,
  onSave,
  onDelete,
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [setInputs, setSetInputs] = useState<SetInputState[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (exercise.sets.length > 0) {
      setSetInputs(
        exercise.sets.map((set) => ({
          setIndex: set.set,
          value: resolveValueString(exercise.type, set),
          timeValue:
            exercise.type === 'running' && set.timeSeconds
              ? formatTimeFromSeconds(set.timeSeconds)
              : '',
        }))
      );
    } else {
      setSetInputs([
        {
          setIndex: 1,
          value: '',
          timeValue: exercise.type === 'running' ? '' : undefined,
        },
      ]);
    }
  }, [exercise.sets, exercise.type]);

  const hasAnyInput = useMemo(
    () => setInputs.some((input) => input.value.trim().length > 0),
    [setInputs]
  );

  const handleValueChange = (setIndex: number, value: string) => {
    setSetInputs((prev) =>
      prev.map((item) =>
        item.setIndex === setIndex ? { ...item, value } : item
      )
    );
  };

  const handleTimeValueChange = (setIndex: number, timeValue: string) => {
    setSetInputs((prev) =>
      prev.map((item) =>
        item.setIndex === setIndex ? { ...item, timeValue } : item
      )
    );
  };

  const handleAddSet = () => {
    setSetInputs((prev) => {
      if (prev.length >= MAX_SETS) return prev;
      const nextIndex =
        prev.length > 0 ? prev[prev.length - 1].setIndex + 1 : 1;
      return [
        ...prev,
        {
          setIndex: nextIndex,
          value: '',
          timeValue: exercise.type === 'running' ? '' : undefined,
        },
      ];
    });
  };

  const handleRemoveSet = (setIndex: number) => {
    setSetInputs((prev) => {
      if (prev.length <= 1) {
        return [
          {
            setIndex: 1,
            value: '',
            timeValue: exercise.type === 'running' ? '' : undefined,
          },
        ];
      }
      return prev.filter((item) => item.setIndex !== setIndex);
    });
  };

  const handleSave = async () => {
    const valueKey = valueKeyMap[exercise.type];
    const isRunning = exercise.type === 'running';

    const validSets = setInputs
      .map((input, idx) => {
        if (isRunning) {
          const distanceParsed = parseFloat(input.value);
          if (isNaN(distanceParsed) || distanceParsed <= 0) {
            return null;
          }
          const timeSeconds = input.timeValue
            ? parseTimeToSeconds(input.timeValue)
            : null;
          return {
            set: idx + 1,
            distanceKm: distanceParsed,
            timeSeconds,
            durationSeconds: null,
            reps: null,
            floors: null,
          };
        } else {
          const parsed = parseInt(input.value, 10);
          if (isNaN(parsed) || parsed <= 0) {
            return null;
          }
          return {
            set: idx + 1,
            durationSeconds: valueKey === 'durationSeconds' ? parsed : null,
            reps: valueKey === 'reps' ? parsed : null,
            floors: valueKey === 'floors' ? parsed : null,
            distanceKm: null,
            timeSeconds: null,
          };
        }
      })
      .filter(Boolean) as BodyweightExerciseSet[];

    if (validSets.length === 0) {
      Alert.alert('입력 필요', numericValidationMessage[exercise.type]);
      return;
    }

    try {
      setSaving(true);
      await onSave(
        exercise.type,
        validSets.map((set) => ({
          setIndex: set.set,
          durationSeconds: set.durationSeconds ?? null,
          reps: set.reps ?? null,
          floors: set.floors ?? null,
          distanceKm: set.distanceKm ?? null,
          timeSeconds: set.timeSeconds ?? null,
        }))
      );
      Alert.alert('저장 완료', `${exercise.name} 기록이 저장되었습니다.`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '맨몸 운동 저장에 실패했습니다.';
      Alert.alert('저장 실패', message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!exercise.hasSavedData && !hasAnyInput) {
      setSetInputs([{ setIndex: 1, value: '' }]);
      return;
    }

    Alert.alert('기록 삭제', `${exercise.name} 기록을 모두 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            setSaving(true);
            await onDelete(exercise.type);
            Alert.alert('삭제 완료', `${exercise.name} 기록이 삭제되었습니다.`);
            setSetInputs([{ setIndex: 1, value: '' }]);
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : '맨몸 운동 삭제에 실패했습니다.';
            Alert.alert('삭제 실패', message);
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const toggleExercise = () => {
    setExpanded(!expanded);
  };

  const handleViewHistory = () => {
    router.push({
      pathname: '/(app)/workout/exercises',
      params: { bodyweightType: exercise.type },
    } as any);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      {/* 운동 헤더 (클릭 가능) */}
      <Pressable onPress={toggleExercise}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TextBox variant="title3" color={theme.text}>
              {exercise.name}
            </TextBox>
            <View style={styles.statsRow}>
              <TextBox variant="caption2" color={theme.textSecondary}>
                최고 기록:{' '}
                {exercise.maxValue !== null
                  ? `${exercise.maxValue}${exercise.valueUnit}`
                  : '-'}
              </TextBox>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  handleViewHistory();
                }}
                style={({ pressed }) => [
                  styles.historyButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <MaterialIcons
                  name="history"
                  size={16}
                  color={theme.accentOrange}
                />
                <TextBox variant="caption2" color={theme.textSecondary}>
                  지난 운동기록
                </TextBox>
              </Pressable>
            </View>
          </View>
          <View style={styles.headerRight}>
            <MaterialIcons
              name={expanded ? 'expand-less' : 'expand-more'}
              size={24}
              color={theme.text}
            />
          </View>
        </View>
      </Pressable>

      {/* 세트 입력 (드롭다운 콘텐츠) */}
      {expanded && (
        <>
          <View style={styles.setContainer}>
            {setInputs.map((setInput, index) => {
              const isRunning = exercise.type === 'running';
              return (
                <View key={setInput.setIndex} style={styles.setRow}>
                  <TextBox variant="body3" color={theme.text}>
                    {setInput.setIndex}세트
                  </TextBox>
                  {isRunning ? (
                    <>
                      <TextInput
                        style={[
                          styles.input,
                          styles.runningInput,
                          {
                            borderColor: theme.border,
                            color: theme.text,
                            backgroundColor: theme.background,
                          },
                        ]}
                        keyboardType="decimal-pad"
                        value={setInput.value}
                        placeholder="거리 (km)"
                        placeholderTextColor={theme.textSecondary}
                        onChangeText={(value) =>
                          handleValueChange(setInput.setIndex, value)
                        }
                      />
                      <TextInput
                        style={[
                          styles.input,
                          styles.runningInput,
                          {
                            borderColor: theme.border,
                            color: theme.text,
                            backgroundColor: theme.background,
                          },
                        ]}
                        keyboardType="number-pad"
                        value={setInput.timeValue || ''}
                        placeholder="시간 (분:초)"
                        placeholderTextColor={theme.textSecondary}
                        onChangeText={(value) =>
                          handleTimeValueChange(setInput.setIndex, value)
                        }
                      />
                    </>
                  ) : (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          borderColor: theme.border,
                          color: theme.text,
                          backgroundColor: theme.background,
                        },
                      ]}
                      keyboardType="number-pad"
                      value={setInput.value}
                      placeholder={`값 입력 (${exercise.valueUnit})`}
                      placeholderTextColor={theme.textSecondary}
                      onChangeText={(value) =>
                        handleValueChange(setInput.setIndex, value)
                      }
                    />
                  )}
                  <Pressable
                    style={({ pressed }) => [
                      styles.setAction,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => handleRemoveSet(setInput.setIndex)}
                  >
                    <MaterialIcons
                      name="close"
                      size={20}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                </View>
              );
            })}

            <Pressable
              style={({ pressed }) => [
                styles.addSetButton,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleAddSet}
            >
              <MaterialIcons
                name="add-circle-outline"
                size={20}
                color={theme.primary}
              />
              <TextBox variant="body3" color={theme.primary}>
                세트 추가
              </TextBox>
            </Pressable>
          </View>

          <View style={styles.actions}>
            <CustomButton
              title="기록 삭제"
              variant="outline"
              onPress={handleDelete}
              disabled={saving}
            />
            <CustomButton
              title="기록 저장"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
            />
          </View>

          {exercise.latestHistory ? (
            <View style={styles.history}>
              <TextBox variant="caption2" color={theme.textSecondary}>
                마지막 기록: {exercise.latestHistory.date}
              </TextBox>
              <View style={styles.historySets}>
                {exercise.latestHistory.sets.map((set) => {
                  const isRunning = exercise.type === 'running';
                  if (isRunning) {
                    return (
                      <TextBox
                        key={set.set}
                        variant="caption3"
                        color={theme.textSecondary}
                      >
                        {set.set}세트: {set.distanceKm ?? 0}km (
                        {formatTimeFromSeconds(set.timeSeconds ?? 0)})
                      </TextBox>
                    );
                  }
                  return (
                    <TextBox
                      key={set.set}
                      variant="caption3"
                      color={theme.textSecondary}
                    >
                      {set.set}세트:{' '}
                      {resolveValueString(exercise.type, {
                        set: set.set,
                        durationSeconds: set.durationSeconds ?? undefined,
                        reps: set.reps ?? undefined,
                        floors: set.floors ?? undefined,
                      })}
                      {exercise.valueUnit}
                    </TextBox>
                  );
                })}
              </View>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
};

export default BodyweightExerciseCard;

function resolveValueString(
  type: BodyweightExerciseType,
  set: BodyweightExerciseSet
) {
  if (type === 'hang') {
    return set.durationSeconds?.toString() ?? '';
  }
  if (type === 'stairs') {
    return set.floors?.toString() ?? '';
  }
  if (type === 'running') {
    return set.distanceKm?.toString() ?? '';
  }
  return set.reps?.toString() ?? '';
}

function formatTimeFromSeconds(seconds: number | null): string {
  if (seconds === null || seconds === 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function parseTimeToSeconds(timeString: string): number | null {
  if (!timeString || timeString.trim() === '') return null;

  // "분:초" 형식 파싱
  const parts = timeString.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (!isNaN(minutes) && !isNaN(seconds)) {
      return minutes * 60 + seconds;
    }
  }

  // 숫자만 입력된 경우 분으로 간주
  const minutes = parseInt(timeString, 10);
  if (!isNaN(minutes)) {
    return minutes * 60;
  }

  return null;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  headerContent: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helperChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  setContainer: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  runningInput: {
    flex: 1,
  },
  setAction: {
    padding: 4,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingTop: 0,
  },
  history: {
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    gap: 6,
  },
  historySets: {
    gap: 4,
  },
});
