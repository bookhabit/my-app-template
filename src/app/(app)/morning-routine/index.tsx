import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';

import { Input } from '@/components/common/Input';
import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

import { useMorningRoutineGoals } from '@/hooks/morning-routine/useMorningRoutineGoals';

export default function MorningRoutineScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    goals,
    isLoading,
    updateGoals,
    getCurrentWeekStairsTarget,
    getCurrentWeekPushupTarget,
  } = useMorningRoutineGoals();

  // 목표 설정 모드
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    reading_initial_minutes: '',
    reading_increment_minutes: '',
    stairs_initial_floors: '',
    stairs_increment_floors: '',
    stairs_max_floors: '',
    pushup_initial_count: '',
    pushup_increment_count: '',
    pushup_max_count: '',
  });

  // 편집 모드 시작
  const handleStartEdit = () => {
    if (goals) {
      setEditValues({
        reading_initial_minutes:
          goals.reading_initial_minutes?.toString() || '',
        reading_increment_minutes:
          goals.reading_increment_minutes?.toString() || '',
        stairs_initial_floors: goals.stairs_initial_floors?.toString() || '',
        stairs_increment_floors:
          goals.stairs_increment_floors?.toString() || '',
        stairs_max_floors: goals.stairs_max_floors?.toString() || '',
        pushup_initial_count: goals.pushup_initial_count?.toString() || '',
        pushup_increment_count: goals.pushup_increment_count?.toString() || '',
        pushup_max_count: goals.pushup_max_count?.toString() || '',
      });
    }
    setIsEditing(true);
  };

  // 목표 저장
  const handleSaveGoals = async () => {
    try {
      await updateGoals({
        reading_initial_minutes: editValues.reading_initial_minutes
          ? parseInt(editValues.reading_initial_minutes, 10)
          : null,
        reading_increment_minutes: editValues.reading_increment_minutes
          ? parseInt(editValues.reading_increment_minutes, 10)
          : null,
        stairs_initial_floors: editValues.stairs_initial_floors
          ? parseInt(editValues.stairs_initial_floors, 10)
          : null,
        stairs_increment_floors: editValues.stairs_increment_floors
          ? parseInt(editValues.stairs_increment_floors, 10)
          : null,
        stairs_max_floors: editValues.stairs_max_floors
          ? parseInt(editValues.stairs_max_floors, 10)
          : null,
        pushup_initial_count: editValues.pushup_initial_count
          ? parseInt(editValues.pushup_initial_count, 10)
          : null,
        pushup_increment_count: editValues.pushup_increment_count
          ? parseInt(editValues.pushup_increment_count, 10)
          : null,
        pushup_max_count: editValues.pushup_max_count
          ? parseInt(editValues.pushup_max_count, 10)
          : null,
      });
      setIsEditing(false);
      Alert.alert('성공', '목표가 저장되었습니다.');
    } catch (error) {
      Alert.alert('오류', '목표 저장에 실패했습니다.');
    }
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <CustomHeader title="아침 습관" />
        <View style={styles.loadingContainer}>
          <TextBox variant="body1">로딩 중...</TextBox>
        </View>
      </View>
    );
  }

  const currentWeekStairsTarget = getCurrentWeekStairsTarget();
  const currentWeekPushupTarget = getCurrentWeekPushupTarget();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="아침 습관" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* 목표 설정 섹션 */}
        <View
          style={[
            styles.goalSection,
            {
              backgroundColor: theme.surface,
              borderLeftColor: theme.accentBlue,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.titleContainer}>
              <TextBox variant="title2" style={styles.sectionTitle}>
                🎯 2026년 목표 설정
              </TextBox>
            </View>
            {!isEditing && (
              <CustomButton
                title="✏️ 수정"
                size="small"
                variant="outline"
                onPress={handleStartEdit}
              />
            )}
          </View>

          {isEditing ? (
            <View style={styles.editContainer}>
              {/* 독서 목표 */}
              <TextBox variant="body2" style={styles.subsectionTitle}>
                독서
              </TextBox>
              <Input
                label="초기 시작값 (분)"
                value={editValues.reading_initial_minutes}
                onChangeText={(text) =>
                  setEditValues({
                    ...editValues,
                    reading_initial_minutes: text,
                  })
                }
                keyboardType="numeric"
                style={styles.input}
              />
              <Input
                label="증량값 (분/일)"
                value={editValues.reading_increment_minutes}
                onChangeText={(text) =>
                  setEditValues({
                    ...editValues,
                    reading_increment_minutes: text,
                  })
                }
                keyboardType="numeric"
                style={styles.input}
              />

              {/* 계단 목표 */}
              <TextBox variant="body2" style={styles.subsectionTitle}>
                계단
              </TextBox>
              <Input
                label="초기 시작값 (층)"
                value={editValues.stairs_initial_floors}
                onChangeText={(text) =>
                  setEditValues({
                    ...editValues,
                    stairs_initial_floors: text,
                  })
                }
                keyboardType="numeric"
                style={styles.input}
              />
              <Input
                label="증량값 (층/주)"
                value={editValues.stairs_increment_floors}
                onChangeText={(text) =>
                  setEditValues({
                    ...editValues,
                    stairs_increment_floors: text,
                  })
                }
                keyboardType="numeric"
                style={styles.input}
              />
              <Input
                label="최대값 (층)"
                value={editValues.stairs_max_floors}
                onChangeText={(text) =>
                  setEditValues({
                    ...editValues,
                    stairs_max_floors: text,
                  })
                }
                keyboardType="numeric"
                style={styles.input}
              />

              {/* 푸쉬업 목표 */}
              <TextBox variant="body2" style={styles.subsectionTitle}>
                푸쉬업
              </TextBox>
              <Input
                label="초기 시작값 (개)"
                value={editValues.pushup_initial_count}
                onChangeText={(text) =>
                  setEditValues({
                    ...editValues,
                    pushup_initial_count: text,
                  })
                }
                keyboardType="numeric"
                style={styles.input}
              />
              <Input
                label="증량값 (개/주)"
                value={editValues.pushup_increment_count}
                onChangeText={(text) =>
                  setEditValues({
                    ...editValues,
                    pushup_increment_count: text,
                  })
                }
                keyboardType="numeric"
                style={styles.input}
              />
              <Input
                label="최대값 (개)"
                value={editValues.pushup_max_count}
                onChangeText={(text) =>
                  setEditValues({
                    ...editValues,
                    pushup_max_count: text,
                  })
                }
                keyboardType="numeric"
                style={styles.input}
              />

              <View style={styles.buttonRow}>
                <CustomButton
                  title="취소"
                  variant="outline"
                  onPress={handleCancelEdit}
                  style={styles.button}
                />
                <CustomButton
                  title="저장"
                  onPress={handleSaveGoals}
                  style={styles.button}
                />
              </View>
            </View>
          ) : (
            <View style={styles.goalsDisplay}>
              {/* 독서 목표 */}
              <View
                style={[
                  styles.goalCard,
                  {
                    backgroundColor: 'rgba(91, 141, 239, 0.05)',
                    borderLeftColor: theme.accentBlue,
                  },
                ]}
              >
                <View style={styles.goalCardHeader}>
                  <TextBox variant="body1" style={styles.goalLabel}>
                    📚 독서
                  </TextBox>
                </View>
                <View style={styles.goalCardContent}>
                  <View style={styles.goalValueRow}>
                    <TextBox variant="caption1" color={theme.textSecondary}>
                      초기
                    </TextBox>
                    <TextBox variant="body2" style={styles.goalValue}>
                      {goals?.reading_initial_minutes || '-'}분
                    </TextBox>
                  </View>
                  <View style={styles.goalValueRow}>
                    <TextBox variant="caption1" color={theme.textSecondary}>
                      증량
                    </TextBox>
                    <TextBox variant="body2" style={styles.goalValue}>
                      {goals?.reading_increment_minutes || '-'}분/일
                    </TextBox>
                  </View>
                </View>
              </View>

              {/* 계단 목표 */}
              <View
                style={[
                  styles.goalCard,
                  {
                    backgroundColor: 'rgba(52, 199, 89, 0.05)',
                    borderLeftColor: theme.success,
                  },
                ]}
              >
                <View style={styles.goalCardHeader}>
                  <TextBox variant="body1" style={styles.goalLabel}>
                    🏃 계단
                  </TextBox>
                  <View style={styles.currentTargetBadge}>
                    <TextBox variant="caption2" color={theme.success}>
                      현재 목표: {currentWeekStairsTarget}층
                    </TextBox>
                  </View>
                </View>
                <View style={styles.goalCardContent}>
                  <View style={styles.goalValueRow}>
                    <TextBox variant="caption1" color={theme.textSecondary}>
                      초기
                    </TextBox>
                    <TextBox variant="body2" style={styles.goalValue}>
                      {goals?.stairs_initial_floors || '-'}층
                    </TextBox>
                  </View>
                  <View style={styles.goalValueRow}>
                    <TextBox variant="caption1" color={theme.textSecondary}>
                      증량
                    </TextBox>
                    <TextBox variant="body2" style={styles.goalValue}>
                      {goals?.stairs_increment_floors || '-'}층/주
                    </TextBox>
                  </View>
                  <View style={styles.goalValueRow}>
                    <TextBox variant="caption1" color={theme.textSecondary}>
                      최대
                    </TextBox>
                    <TextBox variant="body2" style={styles.goalValue}>
                      {goals?.stairs_max_floors || '-'}층
                    </TextBox>
                  </View>
                </View>
              </View>

              {/* 푸쉬업 목표 */}
              <View
                style={[
                  styles.goalCard,
                  {
                    backgroundColor: 'rgba(255, 107, 107, 0.05)',
                    borderLeftColor: theme.workoutChallenge,
                  },
                ]}
              >
                <View style={styles.goalCardHeader}>
                  <TextBox variant="body1" style={styles.goalLabel}>
                    💪 푸쉬업
                  </TextBox>
                  <View style={styles.currentTargetBadge}>
                    <TextBox variant="caption2" color={theme.workoutChallenge}>
                      현재 목표: {currentWeekPushupTarget}개
                    </TextBox>
                  </View>
                </View>
                <View style={styles.goalCardContent}>
                  <View style={styles.goalValueRow}>
                    <TextBox variant="caption1" color={theme.textSecondary}>
                      초기
                    </TextBox>
                    <TextBox variant="body2" style={styles.goalValue}>
                      {goals?.pushup_initial_count || '-'}개
                    </TextBox>
                  </View>
                  <View style={styles.goalValueRow}>
                    <TextBox variant="caption1" color={theme.textSecondary}>
                      증량
                    </TextBox>
                    <TextBox variant="body2" style={styles.goalValue}>
                      {goals?.pushup_increment_count || '-'}개/주
                    </TextBox>
                  </View>
                  <View style={styles.goalValueRow}>
                    <TextBox variant="caption1" color={theme.textSecondary}>
                      최대
                    </TextBox>
                    <TextBox variant="body2" style={styles.goalValue}>
                      {goals?.pushup_max_count || '-'}개
                    </TextBox>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 네비게이션 버튼 */}
        <View style={styles.navigationSection}>
          <View
            style={[
              styles.navCard,
              {
                backgroundColor: theme.surface,
                borderLeftColor: theme.accentPurple,
              },
            ]}
          >
            <CustomButton
              title="📅 아침습관 월별 기록 보기"
              onPress={() => router.push('/(app)/morning-routine/monthly')}
              fullWidth
              style={styles.navButton}
            />
          </View>
          <View
            style={[
              styles.navCard,
              {
                backgroundColor: theme.surface,
                borderLeftColor: theme.accentBlue,
              },
            ]}
          >
            <CustomButton
              title="🚀 오늘 아침 습관 시작"
              onPress={() => router.push('/(app)/morning-routine/today')}
              fullWidth
              style={styles.navButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 0,
    fontWeight: '700',
  },
  editContainer: {
    marginTop: 8,
  },
  subsectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {},
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  goalsDisplay: {
    marginTop: 8,
    gap: 12,
  },
  goalCard: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalLabel: {
    fontWeight: '700',
  },
  currentTargetBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(91, 141, 239, 0.1)',
  },
  goalCardContent: {
    gap: 8,
  },
  goalValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  goalValue: {
    fontWeight: '600',
  },
  navigationSection: {
    gap: 12,
  },
  navCard: {
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navButton: {
    marginBottom: 0,
  },
});
