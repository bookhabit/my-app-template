import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';

import { Input } from '@/components/common/Input';
import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';
import HabitYoutubeVideoSection from '@/components/morning-routine/HabitYoutubeVideoSection';

import { useMorningRoutineGoals } from '@/hooks/morning-routine/useMorningRoutineGoals';
import { useStairsRecord } from '@/hooks/morning-routine/useStairsRecord';

export default function StairsScreen() {
  console.log('계단 스크린');
  const router = useRouter();
  const { theme } = useTheme();
  const { getCurrentWeekStairsTarget } = useMorningRoutineGoals();
  const targetFloors = getCurrentWeekStairsTarget();
  const {
    todayRecord,
    isLoading,
    startStairs,
    completeStairs,
    isStairsActive,
    currentSteps,
    resetTodayRecord,
  } = useStairsRecord(targetFloors);

  // 계단 운동 시작
  const handleStartStairs = async () => {
    try {
      await startStairs();
      Alert.alert('시작', '계단 운동을 시작했습니다.');
    } catch (error) {
      Alert.alert('오류', '계단 운동 시작에 실패했습니다.');
    }
  };

  // 계단 운동 완료
  const handleCompleteStairs = async () => {
    try {
      await completeStairs();
      Alert.alert('완료', '계단 운동 기록이 저장되었습니다.');
      router.back();
    } catch (error: any) {
      Alert.alert('오류', error.message || '계단 운동 완료에 실패했습니다.');
    }
  };

  // 오늘 기록 초기화
  const handleResetTodayRecord = async () => {
    Alert.alert('기록 초기화', '오늘의 계단 운동 기록을 초기화하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '초기화',
        style: 'destructive',
        onPress: async () => {
          try {
            await resetTodayRecord();
            Alert.alert('완료', '오늘의 기록이 초기화되었습니다.');
          } catch (error: any) {
            Alert.alert('오류', error.message || '기록 초기화에 실패했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="계단 운동" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* 목표 표시 */}
        <View
          style={[
            styles.goalCard,
            {
              backgroundColor: theme.surface,
              borderLeftColor: theme.success,
            },
          ]}
        >
          <View style={styles.goalHeader}>
            <TextBox variant="title3" style={styles.goalTitle}>
              🎯 오늘 목표
            </TextBox>
          </View>
          <View style={styles.goalContent}>
            <TextBox variant="title1" color={theme.success}>
              {targetFloors}
            </TextBox>
            <TextBox variant="body2" color={theme.textSecondary}>
              층
            </TextBox>
          </View>
        </View>

        {/* 유튜브 영상 섹션 */}
        {/* <HabitYoutubeVideoSection habitType="stairs" /> */}

        {/* 계단 운동 시작/완료 섹션 */}
        <View
          style={[
            styles.recordCard,
            {
              backgroundColor: theme.surface,
              borderLeftColor: isStairsActive
                ? theme.success
                : todayRecord?.end_time
                  ? theme.accentBlue
                  : theme.primary,
            },
          ]}
        >
          <TextBox variant="title3" style={styles.sectionTitle}>
            🏃 계단 운동 기록
          </TextBox>

          {!isStairsActive && !todayRecord?.end_time && (
            <CustomButton
              title="🚀 계단 운동 시작"
              onPress={handleStartStairs}
              loading={isLoading}
              fullWidth
              style={styles.startButton}
            />
          )}

          {isStairsActive && (
            <View style={styles.activeInfo}>
              <View style={styles.activeBadge}>
                <TextBox variant="body2" color={theme.success}>
                  ⏱️ 진행 중...
                </TextBox>
              </View>
              <View style={styles.stepsInfo}>
                <TextBox variant="title2" color={theme.success}>
                  {currentSteps.toLocaleString()}
                </TextBox>
                <TextBox variant="body2" color={theme.textSecondary}>
                  걸음
                </TextBox>
              </View>
              <CustomButton
                title="✅ 완료"
                onPress={handleCompleteStairs}
                loading={isLoading}
                fullWidth
                style={styles.completeButton}
              />
            </View>
          )}

          {todayRecord?.end_time && (
            <View style={styles.completedInfo}>
              <View style={styles.completedBadge}>
                <TextBox variant="body2" color={theme.accentBlue}>
                  ✓ 완료
                </TextBox>
              </View>
              <TextBox variant="body1" style={styles.durationText}>
                ⏱️ {todayRecord.duration_minutes}분
              </TextBox>
              {todayRecord.steps_count && (
                <View style={styles.stepsInfo}>
                  <TextBox variant="title2" color={theme.accentBlue}>
                    {todayRecord.steps_count.toLocaleString()}
                  </TextBox>
                  <TextBox variant="body2" color={theme.textSecondary}>
                    걸음
                  </TextBox>
                </View>
              )}
            </View>
          )}
          {/* 초기화 버튼 */}
          <View style={styles.resetButtonContainer}>
            <CustomButton
              title="🔄 오늘 기록 초기화"
              variant="outline"
              onPress={handleResetTodayRecord}
              style={styles.resetButton}
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
  goalCard: {
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
  goalHeader: {
    marginBottom: 12,
  },
  goalTitle: {
    fontWeight: '700',
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  recordCard: {
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
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '700',
  },
  startButton: {
    marginTop: 8,
  },
  activeInfo: {
    marginTop: 12,
    gap: 16,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  stepsInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
  },
  completeButton: {
    marginTop: 8,
  },
  completedInfo: {
    marginTop: 12,
    gap: 12,
  },
  completedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(91, 141, 239, 0.1)',
  },
  durationText: {
    fontWeight: '600',
  },
  resetButtonContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  resetButton: {
    borderColor: '#FF3B30',
  },
});
