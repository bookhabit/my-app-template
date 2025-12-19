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
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <View style={styles.sectionHeader}>
            <TextBox variant="title2" style={styles.sectionTitle}>
              2026년 목표 설정
            </TextBox>
            {!isEditing && (
              <CustomButton
                title="수정"
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
              <View style={styles.goalItem}>
                <TextBox variant="body2" style={styles.goalLabel}>
                  독서
                </TextBox>
                <TextBox variant="body1">
                  초기: {goals?.reading_initial_minutes || '-'}분 / 증량:{' '}
                  {goals?.reading_increment_minutes || '-'}분
                </TextBox>
              </View>

              {/* 계단 목표 */}
              <View style={styles.goalItem}>
                <TextBox variant="body2" style={styles.goalLabel}>
                  계단 (현재 주차 목표: {currentWeekStairsTarget}층)
                </TextBox>
                <TextBox variant="body1">
                  초기: {goals?.stairs_initial_floors || '-'}층 / 증량:{' '}
                  {goals?.stairs_increment_floors || '-'}층 / 최대:{' '}
                  {goals?.stairs_max_floors || '-'}층
                </TextBox>
              </View>

              {/* 푸쉬업 목표 */}
              <View style={styles.goalItem}>
                <TextBox variant="body2" style={styles.goalLabel}>
                  푸쉬업 (현재 주차 목표: {currentWeekPushupTarget}개)
                </TextBox>
                <TextBox variant="body1">
                  초기: {goals?.pushup_initial_count || '-'}개 / 증량:{' '}
                  {goals?.pushup_increment_count || '-'}개 / 최대:{' '}
                  {goals?.pushup_max_count || '-'}개
                </TextBox>
              </View>
            </View>
          )}
        </View>

        {/* 네비게이션 버튼 */}
        <View style={styles.navigationSection}>
          <CustomButton
            title="아침습관 월별 기록 보기"
            onPress={() => router.push('/(app)/morning-routine/monthly')}
            fullWidth
            style={styles.navButton}
          />
          <CustomButton
            title="오늘 아침 습관 시작"
            onPress={() => router.push('/(app)/morning-routine/today')}
            fullWidth
            style={styles.navButton}
          />
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
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 0,
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
  },
  goalItem: {
    marginBottom: 16,
  },
  goalLabel: {
    marginBottom: 4,
    fontWeight: '600',
  },
  navigationSection: {
    gap: 12,
  },
  navButton: {
    marginBottom: 0,
  },
});
