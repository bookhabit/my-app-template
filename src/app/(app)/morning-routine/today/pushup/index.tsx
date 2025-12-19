import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';
import HabitYoutubeVideoSection from '@/components/morning-routine/HabitYoutubeVideoSection';
import Stopwatch from '@/components/workout/Stopwatch';

import { useMorningRoutineGoals } from '@/hooks/morning-routine/useMorningRoutineGoals';
import { usePushupRecord } from '@/hooks/morning-routine/usePushupRecord';

export default function PushupScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { getCurrentWeekPushupTarget } = useMorningRoutineGoals();
  const targetCount = getCurrentWeekPushupTarget();
  const {
    todayRecord,
    isLoading,
    startPushup,
    completePushup,
    isPushupActive,
    resetTodayRecord,
  } = usePushupRecord(targetCount);

  // 푸쉬업 시작
  const handleStartPushup = async () => {
    try {
      await startPushup();
      Alert.alert('시작', '푸쉬업을 시작했습니다.');
    } catch (error) {
      Alert.alert('오류', '푸쉬업 시작에 실패했습니다.');
    }
  };

  // 푸쉬업 완료
  const handleCompletePushup = async () => {
    try {
      await completePushup();
      Alert.alert('완료', '푸쉬업 기록이 저장되었습니다.');
      router.back();
    } catch (error: any) {
      Alert.alert('오류', error.message || '푸쉬업 완료에 실패했습니다.');
    }
  };

  // 오늘 기록 초기화
  const handleResetTodayRecord = async () => {
    Alert.alert('기록 초기화', '오늘의 푸쉬업 기록을 초기화하시겠습니까?', [
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
      <CustomHeader title="푸쉬업" />
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
              borderLeftColor: theme.accentBlue,
            },
          ]}
        >
          <View style={styles.goalHeader}>
            <TextBox variant="title3" style={styles.goalTitle}>
              🎯 오늘 목표
            </TextBox>
          </View>
          <View style={styles.goalContent}>
            <TextBox variant="title1" color={theme.accentBlue}>
              {targetCount}
            </TextBox>
            <TextBox variant="body2" color={theme.textSecondary}>
              개
            </TextBox>
          </View>
        </View>

        {/* 유튜브 영상 섹션 */}
        <HabitYoutubeVideoSection habitType="pushup" />

        {/* 타이머 섹션 */}
        <View
          style={[
            styles.timerCard,
            {
              backgroundColor: theme.surface,
              borderLeftColor: theme.accentPurple,
            },
          ]}
        >
          <TextBox variant="title3" style={styles.timerTitle}>
            ⏱️ 타이머
          </TextBox>
          <Stopwatch />
        </View>

        {/* 푸쉬업 시작/완료 섹션 */}
        <View
          style={[
            styles.recordCard,
            {
              backgroundColor: theme.surface,
              borderLeftColor: isPushupActive
                ? theme.success
                : todayRecord?.end_time
                  ? theme.accentBlue
                  : theme.primary,
            },
          ]}
        >
          <TextBox variant="title3" style={styles.sectionTitle}>
            📝 푸쉬업 기록
          </TextBox>

          {!isPushupActive && !todayRecord?.end_time && (
            <CustomButton
              title="🚀 푸쉬업 시작"
              onPress={handleStartPushup}
              loading={isLoading}
              fullWidth
              style={styles.startButton}
            />
          )}

          {isPushupActive && (
            <View style={styles.activeInfo}>
              <View style={styles.activeBadge}>
                <TextBox variant="body2" color={theme.success}>
                  ⏱️ 진행 중...
                </TextBox>
              </View>
              <CustomButton
                title="✅ 완료"
                onPress={handleCompletePushup}
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
  activeInfo: {
    marginTop: 12,
    gap: 12,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  startButton: {
    marginTop: 8,
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
  timerCard: {
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
  timerTitle: {
    marginBottom: 12,
    fontWeight: '700',
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
