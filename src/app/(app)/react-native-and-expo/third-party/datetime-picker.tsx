import { useState } from 'react';
import { ScrollView, StyleSheet, View, Platform, Alert } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

// Note: Requires native build - run: cd ios && pod install && cd .. && npx expo run:ios
let DateTimePicker: any;
let DateTimePickerEvent: any;
try {
  const dtp = require('@react-native-community/datetimepicker');
  DateTimePicker = dtp.default;
  DateTimePickerEvent = dtp.DateTimePickerEvent;
} catch (e) {
  console.warn('DateTimePicker native module not linked');
  DateTimePicker = null;
}

export default function DateTimePickerScreen() {
  const { theme } = useTheme();

  // State
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time' | 'datetime'>('date');
  const [show, setShow] = useState(false);
  const [display, setDisplay] = useState<
    'default' | 'spinner' | 'clock' | 'calendar'
  >('default');
  const [is24Hour, setIs24Hour] = useState(true);
  const [minimumDate, setMinimumDate] = useState<Date | undefined>(undefined);
  const [maximumDate, setMaximumDate] = useState<Date | undefined>(undefined);
  const [minuteInterval, setMinuteInterval] = useState(1);
  const [timeZoneOffsetInMinutes, setTimeZoneOffsetInMinutes] = useState<
    number | undefined
  >(undefined);
  const [textColor, setTextColor] = useState<string | undefined>(undefined);
  const [accentColor, setAccentColor] = useState<string | undefined>(undefined);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
      Alert.alert(
        '선택됨',
        `날짜/시간: ${selectedDate.toLocaleString('ko-KR')}`
      );
    } else if (event.type === 'dismissed') {
      Alert.alert('취소됨', '선택이 취소되었습니다.');
    }
  };

  const showPicker = (pickerMode: 'date' | 'time' | 'datetime') => {
    setMode(pickerMode);
    setShow(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="DateTimePicker" showBackButton />
      <View style={styles.content}>
        {/* 현재 선택된 날짜/시간 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            현재 선택된 날짜/시간
          </TextBox>
          <View
            style={[
              styles.dateBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="title2" color={theme.text}>
              {formatDate(date)}
            </TextBox>
          </View>
        </View>

        {/* 피커 열기 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            피커 열기
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="날짜 선택"
              onPress={() => showPicker('date')}
              style={[styles.button, styles.flex1]}
            />
            <CustomButton
              title="시간 선택"
              onPress={() => showPicker('time')}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
            {Platform.OS === 'ios' && (
              <CustomButton
                title="날짜+시간"
                onPress={() => showPicker('datetime')}
                style={[styles.button, styles.flex1]}
                variant="ghost"
              />
            )}
          </View>
        </View>

        {/* 옵션 */}
        {Platform.OS === 'ios' && (
          <View style={styles.section}>
            <TextBox
              variant="title3"
              color={theme.text}
              style={styles.sectionTitle}
            >
              옵션 (iOS)
            </TextBox>
            <View style={styles.buttonRow}>
              <CustomButton
                title={is24Hour ? '24시간 형식 ON' : '24시간 형식 OFF'}
                onPress={() => setIs24Hour(!is24Hour)}
                style={[styles.button, styles.flex1]}
                variant={is24Hour ? 'primary' : 'ghost'}
              />
            </View>
            <View style={styles.buttonRow}>
              <CustomButton
                title="최소 날짜 설정"
                onPress={() => {
                  const minDate = new Date();
                  minDate.setDate(minDate.getDate() - 7);
                  setMinimumDate(minDate);
                  Alert.alert('설정됨', `최소 날짜: ${formatDate(minDate)}`);
                }}
                style={[styles.button, styles.flex1]}
                variant="ghost"
              />
              <CustomButton
                title="최대 날짜 설정"
                onPress={() => {
                  const maxDate = new Date();
                  maxDate.setDate(maxDate.getDate() + 7);
                  setMaximumDate(maxDate);
                  Alert.alert('설정됨', `최대 날짜: ${formatDate(maxDate)}`);
                }}
                style={[styles.button, styles.flex1]}
                variant="ghost"
              />
              <CustomButton
                title="제한 해제"
                onPress={() => {
                  setMinimumDate(undefined);
                  setMaximumDate(undefined);
                  Alert.alert('해제됨', '날짜 제한이 해제되었습니다.');
                }}
                style={[styles.button, styles.flex1]}
                variant="ghost"
              />
            </View>
          </View>
        )}

        {Platform.OS === 'android' && (
          <View style={styles.section}>
            <TextBox
              variant="title3"
              color={theme.text}
              style={styles.sectionTitle}
            >
              옵션 (Android)
            </TextBox>
            <View style={styles.buttonRow}>
              <CustomButton
                title={is24Hour ? '24시간 형식 ON' : '24시간 형식 OFF'}
                onPress={() => setIs24Hour(!is24Hour)}
                style={[styles.button, styles.flex1]}
                variant={is24Hour ? 'primary' : 'ghost'}
              />
            </View>
          </View>
        )}

        {/* DateTimePicker */}
        {show && DateTimePicker ? (
          <DateTimePicker
            value={date}
            mode={mode}
            display={display}
            is24Hour={is24Hour}
            onChange={onChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            minuteInterval={minuteInterval}
            timeZoneOffsetInMinutes={timeZoneOffsetInMinutes}
            textColor={textColor}
            accentColor={accentColor || theme.primary}
            style={styles.picker}
          />
        ) : show ? (
          <View style={[styles.picker, { padding: 20, alignItems: 'center' }]}>
            <TextBox variant="body2" color={theme.text}>
              DateTimePicker 네이티브 모듈이 링크되지 않았습니다.
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.textSecondary}
              style={{ marginTop: 8 }}
            >
              네이티브 빌드가 필요합니다: cd ios && pod install
            </TextBox>
          </View>
        ) : null}

        {/* 참고사항 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            참고사항
          </TextBox>
          <View
            style={[
              styles.infoBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • iOS: date, time, datetime 모드 지원
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android: date, time 모드만 지원 (datetime은 별도 처리 필요)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android에서는 피커가 모달로 표시됩니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • iOS에서는 인라인으로 표시됩니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • minimumDate, maximumDate로 날짜 범위를 제한할 수 있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • minuteInterval로 분 간격을 설정할 수 있습니다 (1, 2, 3, 4, 5, 6,
              10, 12, 15, 20, 30).
            </TextBox>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  dateBox: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flex1: {
    flex: 1,
    minWidth: '30%',
  },
  button: {
    marginTop: 8,
  },
  picker: {
    width: '100%',
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  infoText: {
    lineHeight: 20,
  },
});
