import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

import {
  useMonthlyRecords,
  type DateRecordDetail,
} from '@/hooks/morning-routine/useMonthlyRecords';

export default function MonthlyRecordsScreen() {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );

  const { records, isLoading, getDateRecord } = useMonthlyRecords(
    selectedYear,
    selectedMonth
  );

  const [selectedDateDetail, setSelectedDateDetail] =
    useState<DateRecordDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 오늘 날짜 문자열 가져오기
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  // 캘린더 표시용 날짜 포맷팅
  const getMarkedDates = () => {
    const marked: any = {};
    const today = getTodayDateString();

    Object.keys(records).forEach((date) => {
      const record = records[date];
      const dots: any[] = [];
      if (record.reading)
        dots.push({ color: theme.primary, selectedColor: theme.primary });
      if (record.stairs)
        dots.push({ color: theme.success, selectedColor: theme.success });
      if (record.pushup)
        dots.push({ color: theme.accentBlue, selectedColor: theme.accentBlue });

      const isToday = date === today;
      const isSelected = date === selectedDate;
      console.log('isToday', isToday);

      marked[date] = {
        dots: dots.length > 0 ? dots : undefined,
        selected: isSelected,
        selectedColor: theme.primary,
        // 오늘 날짜에 border 추가 (multi-dot에서도 customStyles 사용 가능)
        ...(isToday && {
          customStyles: {
            container: {
              borderWidth: 2,
              borderColor: theme.accentOrange,
              borderRadius: 8,
            },
            text: {
              color: theme.primary,
              fontWeight: 'bold',
            },
          },
        }),
      };
    });

    // 오늘 날짜가 records에 없어도 표시
    if (!marked[today]) {
      marked[today] = {
        customStyles: {
          container: {
            borderWidth: 2,
            borderColor: theme.primary,
            borderRadius: 8,
          },
          text: {
            color: theme.primary,
            fontWeight: 'bold',
          },
        },
      };
    }

    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: theme.primary,
      };
    }

    return marked;
  };

  // 날짜 클릭 핸들러
  const handleDatePress = async (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setIsLoadingDetail(true);
    try {
      const detail = await getDateRecord(day.dateString);
      setSelectedDateDetail(detail);
    } catch (error) {
      console.error('날짜별 기록 조회 실패:', error);
      setSelectedDateDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // 월 변경 핸들러
  const handleMonthChange = (month: { year: number; month: number }) => {
    setSelectedYear(month.year);
    setSelectedMonth(month.month);
    setSelectedDate(null); // 선택된 날짜 초기화
    setSelectedDateDetail(null); // 상세 정보도 초기화
  };

  // 페이지 수 계산
  const getPageCount = (
    start: number | null,
    end: number | null
  ): number | null => {
    if (start === null || end === null) return null;
    return end - start;
  };

  // 시간 포맷팅 (분 -> 시:분)
  const formatDuration = (minutes: number | null): string => {
    if (minutes === null) return '-';
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="월별 기록" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* 캘린더 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Calendar
            current={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`}
            markedDates={getMarkedDates()}
            onDayPress={handleDatePress}
            onMonthChange={handleMonthChange}
            markingType="multi-dot"
            theme={{
              backgroundColor: theme.surface,
              calendarBackground: theme.surface,
              textSectionTitleColor: theme.text,
              selectedDayBackgroundColor: theme.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.primary,
              dayTextColor: theme.text,
              textDisabledColor: theme.textSecondary,
              dotColor: theme.primary,
              selectedDotColor: '#ffffff',
              arrowColor: theme.primary,
              monthTextColor: theme.text,
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
            }}
          />
        </View>

        {/* 선택된 날짜의 기록 표시 */}
        {selectedDate && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox variant="title2" style={styles.sectionTitle}>
              {selectedDate} 기록
            </TextBox>
            {isLoadingDetail ? (
              <TextBox variant="body2" color={theme.textSecondary}>
                기록을 불러오는 중...
              </TextBox>
            ) : selectedDateDetail ? (
              <View style={styles.recordsList}>
                {/* 독서 기록 */}
                {selectedDateDetail.reading && (
                  <View
                    style={[
                      styles.recordCard,
                      {
                        backgroundColor: theme.background,
                        borderLeftColor: theme.primary,
                      },
                    ]}
                  >
                    <View style={styles.recordHeader}>
                      <View style={styles.recordIconContainer}>
                        <View
                          style={[
                            styles.recordIcon,
                            { backgroundColor: `${theme.primary}20` },
                          ]}
                        >
                          <TextBox
                            variant="body1"
                            style={{ color: theme.primary }}
                          >
                            📖
                          </TextBox>
                        </View>
                      </View>
                      <View style={styles.recordContent}>
                        <TextBox variant="title3" style={styles.recordTitle}>
                          독서
                        </TextBox>
                        {selectedDateDetail.reading.book_name && (
                          <TextBox
                            variant="body2"
                            color={theme.text}
                            style={styles.recordText}
                          >
                            {selectedDateDetail.reading.book_name}
                          </TextBox>
                        )}
                        <View style={styles.recordDetails}>
                          {selectedDateDetail.reading.page_start !== null &&
                            selectedDateDetail.reading.page_end !== null && (
                              <View style={styles.detailRow}>
                                <TextBox
                                  variant="body2"
                                  color={theme.textSecondary}
                                >
                                  페이지:{' '}
                                </TextBox>
                                <TextBox variant="body2" color={theme.text}>
                                  {selectedDateDetail.reading.page_start} -{' '}
                                  {selectedDateDetail.reading.page_end} (
                                  {getPageCount(
                                    selectedDateDetail.reading.page_start,
                                    selectedDateDetail.reading.page_end
                                  )}
                                  페이지)
                                </TextBox>
                              </View>
                            )}
                          {selectedDateDetail.reading.duration_minutes !==
                            null && (
                            <View style={styles.detailRow}>
                              <TextBox
                                variant="body2"
                                color={theme.textSecondary}
                              >
                                시간:{' '}
                              </TextBox>
                              <TextBox variant="body2" color={theme.text}>
                                {formatDuration(
                                  selectedDateDetail.reading.duration_minutes
                                )}
                              </TextBox>
                            </View>
                          )}
                          {selectedDateDetail.reading.summary && (
                            <View
                              style={[
                                styles.summaryContainer,
                                { borderTopColor: theme.border || '#e0e0e0' },
                              ]}
                            >
                              <TextBox
                                variant="body2"
                                color={theme.textSecondary}
                              >
                                요약:
                              </TextBox>
                              <TextBox
                                variant="body2"
                                color={theme.text}
                                style={styles.summaryText}
                              >
                                {selectedDateDetail.reading.summary}
                              </TextBox>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* 계단 기록 */}
                {selectedDateDetail.stairs && (
                  <View
                    style={[
                      styles.recordCard,
                      {
                        backgroundColor: theme.background,
                        borderLeftColor: theme.success,
                      },
                    ]}
                  >
                    <View style={styles.recordHeader}>
                      <View style={styles.recordIconContainer}>
                        <View
                          style={[
                            styles.recordIcon,
                            { backgroundColor: `${theme.success}20` },
                          ]}
                        >
                          <TextBox
                            variant="body1"
                            style={{ color: theme.success }}
                          >
                            🏃
                          </TextBox>
                        </View>
                      </View>
                      <View style={styles.recordContent}>
                        <TextBox variant="title3" style={styles.recordTitle}>
                          계단 오르기
                        </TextBox>
                        <View style={styles.recordDetails}>
                          <View style={styles.detailRow}>
                            <TextBox
                              variant="body2"
                              color={theme.textSecondary}
                            >
                              목표 층수:{' '}
                            </TextBox>
                            <TextBox variant="body2" color={theme.text}>
                              {selectedDateDetail.stairs.target_floors}층
                            </TextBox>
                          </View>
                          {selectedDateDetail.stairs.duration_minutes !==
                            null && (
                            <View style={styles.detailRow}>
                              <TextBox
                                variant="body2"
                                color={theme.textSecondary}
                              >
                                완료 시간:{' '}
                              </TextBox>
                              <TextBox variant="body2" color={theme.text}>
                                {formatDuration(
                                  selectedDateDetail.stairs.duration_minutes
                                )}
                              </TextBox>
                            </View>
                          )}
                          {selectedDateDetail.stairs.steps_count !== null && (
                            <View style={styles.detailRow}>
                              <TextBox
                                variant="body2"
                                color={theme.textSecondary}
                              >
                                총 걸음 수:{' '}
                              </TextBox>
                              <TextBox variant="body2" color={theme.text}>
                                {selectedDateDetail.stairs.steps_count.toLocaleString()}
                                걸음
                              </TextBox>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* 푸쉬업 기록 */}
                {selectedDateDetail.pushup && (
                  <View
                    style={[
                      styles.recordCard,
                      {
                        backgroundColor: theme.background,
                        borderLeftColor: theme.accentBlue,
                      },
                    ]}
                  >
                    <View style={styles.recordHeader}>
                      <View style={styles.recordIconContainer}>
                        <View
                          style={[
                            styles.recordIcon,
                            { backgroundColor: `${theme.accentBlue}20` },
                          ]}
                        >
                          <TextBox
                            variant="body1"
                            style={{ color: theme.accentBlue }}
                          >
                            💪
                          </TextBox>
                        </View>
                      </View>
                      <View style={styles.recordContent}>
                        <TextBox variant="title3" style={styles.recordTitle}>
                          푸쉬업
                        </TextBox>
                        <View style={styles.recordDetails}>
                          <View style={styles.detailRow}>
                            <TextBox
                              variant="body2"
                              color={theme.textSecondary}
                            >
                              목표 개수:{' '}
                            </TextBox>
                            <TextBox variant="body2" color={theme.text}>
                              {selectedDateDetail.pushup.target_count}개
                            </TextBox>
                          </View>
                          {selectedDateDetail.pushup.duration_minutes !==
                            null && (
                            <View style={styles.detailRow}>
                              <TextBox
                                variant="body2"
                                color={theme.textSecondary}
                              >
                                완료 시간:{' '}
                              </TextBox>
                              <TextBox variant="body2" color={theme.text}>
                                {formatDuration(
                                  selectedDateDetail.pushup.duration_minutes
                                )}
                              </TextBox>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* 기록이 없는 경우 */}
                {!selectedDateDetail.reading &&
                  !selectedDateDetail.stairs &&
                  !selectedDateDetail.pushup && (
                    <View style={styles.emptyContainer}>
                      <TextBox variant="body2" color={theme.textSecondary}>
                        이 날짜에는 기록이 없습니다.
                      </TextBox>
                    </View>
                  )}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <TextBox variant="body2" color={theme.textSecondary}>
                  이 날짜에는 기록이 없습니다.
                </TextBox>
              </View>
            )}
          </View>
        )}
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
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  recordsList: {
    gap: 16,
  },
  recordCard: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recordIconContainer: {
    marginRight: 12,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  recordText: {
    marginBottom: 8,
    fontWeight: '500',
  },
  recordDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  summaryText: {
    marginTop: 4,
    lineHeight: 20,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});
