import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';

import { Input } from '@/components/common/Input';
import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';
import HabitYoutubeVideoSection from '@/components/morning-routine/HabitYoutubeVideoSection';

import { useReadingRecord } from '@/hooks/morning-routine/useReadingRecord';

export default function ReadingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    todayRecord,
    isLoading,
    startReading,
    completeReading,
    isReading,
    resetTodayRecord,
  } = useReadingRecord();

  // 완료 폼 상태
  const [bookName, setBookName] = useState('');
  const [pageStart, setPageStart] = useState('');
  const [pageEnd, setPageEnd] = useState('');
  const [summary, setSummary] = useState('');

  // 독서 시작
  const handleStartReading = async () => {
    try {
      await startReading();
      Alert.alert('시작', '독서를 시작했습니다.');
    } catch (error) {
      Alert.alert('오류', '독서 시작에 실패했습니다.');
    }
  };

  // 독서 완료
  const handleCompleteReading = async () => {
    if (!bookName.trim()) {
      Alert.alert('오류', '책 이름을 입력해주세요.');
      return;
    }
    if (!pageStart || !pageEnd) {
      Alert.alert('오류', '페이지 범위를 입력해주세요.');
      return;
    }
    if (!summary.trim()) {
      Alert.alert('오류', '한줄 요약을 입력해주세요.');
      return;
    }

    try {
      await completeReading(
        bookName,
        parseInt(pageStart, 10),
        parseInt(pageEnd, 10),
        summary
      );
      Alert.alert('완료', '독서 기록이 저장되었습니다.');
      // 폼 초기화
      setBookName('');
      setPageStart('');
      setPageEnd('');
      setSummary('');
      router.back();
    } catch (error: any) {
      Alert.alert('오류', error.message || '독서 완료에 실패했습니다.');
    }
  };

  // 오늘 기록 초기화
  const handleResetTodayRecord = async () => {
    Alert.alert('기록 초기화', '오늘의 독서 기록을 초기화하시겠습니까?', [
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
      <CustomHeader title="독서" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* 유튜브 영상 섹션 */}
        <HabitYoutubeVideoSection habitType="reading" />

        {/* 독서 시작/완료 섹션 */}
        <View
          style={[
            styles.recordCard,
            {
              backgroundColor: theme.surface,
              borderLeftColor: isReading
                ? theme.success
                : todayRecord?.end_time
                  ? theme.accentBlue
                  : theme.primary,
            },
          ]}
        >
          <TextBox variant="title3" style={styles.sectionTitle}>
            📚 독서 기록
          </TextBox>

          {!isReading && !todayRecord?.end_time && (
            <CustomButton
              title="🚀 독서 시작"
              onPress={handleStartReading}
              loading={isLoading}
              fullWidth
              style={styles.startButton}
            />
          )}

          {isReading && (
            <View style={styles.completeForm}>
              <View style={styles.activeBadge}>
                <TextBox variant="body2" color={theme.success}>
                  ⏱️ 진행 중...
                </TextBox>
              </View>
              <Input
                label="책 이름"
                value={bookName}
                onChangeText={setBookName}
                placeholder="책 이름을 입력하세요"
                style={styles.input}
              />
              <View style={styles.pageRow}>
                <Input
                  label="시작 페이지"
                  value={pageStart}
                  onChangeText={setPageStart}
                  keyboardType="numeric"
                  placeholder="시작"
                  style={[styles.input, styles.pageInput]}
                />
                <Input
                  label="종료 페이지"
                  value={pageEnd}
                  onChangeText={setPageEnd}
                  keyboardType="numeric"
                  placeholder="종료"
                  style={[styles.input, styles.pageInput]}
                />
              </View>
              <Input
                label="오늘 배운 한줄 요약"
                value={summary}
                onChangeText={setSummary}
                placeholder="한줄 요약을 입력하세요"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <CustomButton
                title="완료"
                onPress={handleCompleteReading}
                loading={isLoading}
                fullWidth
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
              {todayRecord.book_name && (
                <View style={styles.bookInfo}>
                  <TextBox variant="body2" color={theme.textSecondary}>
                    📖
                  </TextBox>
                  <TextBox variant="body1" style={styles.bookName}>
                    {todayRecord.book_name}
                  </TextBox>
                </View>
              )}
              {todayRecord.page_start && todayRecord.page_end && (
                <View style={styles.pageInfo}>
                  <TextBox variant="body2" color={theme.textSecondary}>
                    📄 {todayRecord.page_start} - {todayRecord.page_end} 페이지
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
  activeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    marginBottom: 12,
  },
  videoContainer: {
    marginBottom: 16,
  },
  videoWrapper: {
    width: '100%',
    minHeight: 200,
  },
  editVideoContainer: {
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  editButton: {
    marginTop: 8,
  },
  completeForm: {
    marginTop: 8,
    gap: 12,
  },
  pageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pageInput: {
    flex: 1,
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
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(91, 141, 239, 0.05)',
  },
  bookName: {
    fontWeight: '600',
  },
  pageInfo: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(91, 141, 239, 0.05)',
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
