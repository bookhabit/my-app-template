import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

import { useMonthlyRecords } from '@/hooks/morning-routine/useMonthlyRecords';

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
  };

  // 월 변경 핸들러
  const handleMonthChange = (month: { year: number; month: number }) => {
    setSelectedYear(month.year);
    setSelectedMonth(month.month);
    setSelectedDate(null); // 선택된 날짜 초기화
  };

  // 선택된 날짜의 기록 조회
  const selectedDateRecord = selectedDate ? records[selectedDate] : null;

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
            {selectedDateRecord ? (
              <View style={styles.recordsList}>
                <View style={styles.recordItem}>
                  <TextBox variant="body1">
                    독서: {selectedDateRecord.reading ? '✓' : '✗'}
                  </TextBox>
                </View>
                <View style={styles.recordItem}>
                  <TextBox variant="body1">
                    계단: {selectedDateRecord.stairs ? '✓' : '✗'}
                  </TextBox>
                </View>
                <View style={styles.recordItem}>
                  <TextBox variant="body1">
                    푸쉬업: {selectedDateRecord.pushup ? '✓' : '✗'}
                  </TextBox>
                </View>
              </View>
            ) : (
              <TextBox variant="body2" color={theme.textSecondary}>
                이 날짜에는 기록이 없습니다.
              </TextBox>
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
    gap: 12,
  },
  recordItem: {
    paddingVertical: 8,
  },
});
