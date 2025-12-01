import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Platform,
  Alert,
  TextInput,
  Linking,
} from 'react-native';

import * as Calendar from 'expo-calendar';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function CalendarScreen() {
  const { theme } = useTheme();

  // State
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [calendarPermission, setCalendarPermission] =
    useState<string>('확인 중...');
  const [calendarCanAskAgain, setCalendarCanAskAgain] = useState<boolean>(true);
  const [reminderPermission, setReminderPermission] =
    useState<string>('확인 중...');
  const [reminderCanAskAgain, setReminderCanAskAgain] = useState<boolean>(true);
  const [calendars, setCalendars] = useState<Calendar.Calendar[]>([]);
  const [events, setEvents] = useState<Calendar.Event[]>([]);
  const [reminders, setReminders] = useState<Calendar.Reminder[]>([]);
  const [defaultCalendar, setDefaultCalendar] =
    useState<Calendar.Calendar | null>(null);
  const [sources, setSources] = useState<Calendar.Source[]>([]);

  // Event creation form
  const [eventTitle, setEventTitle] = useState('테스트 이벤트');
  const [eventLocation, setEventLocation] = useState('서울시 강남구');
  const [eventNotes, setEventNotes] = useState('이벤트 설명입니다');
  const [eventUrl, setEventUrl] = useState('https://expo.dev');
  const [isAllDay, setIsAllDay] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(
    null
  );

  useEffect(() => {
    checkAvailability();
    checkPermissions();
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await Calendar.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      setIsAvailable(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const calendarStatus = await Calendar.getCalendarPermissionsAsync();
      setCalendarPermission(
        calendarStatus.status === 'granted'
          ? '허용됨'
          : calendarStatus.status === 'denied'
            ? '거부됨'
            : '확인 필요'
      );
      setCalendarCanAskAgain(calendarStatus.canAskAgain);

      // 리마인더 권한은 iOS에서만 확인
      if (Platform.OS === 'ios') {
        try {
          const reminderStatus = await Calendar.getRemindersPermissionsAsync();
          setReminderPermission(
            reminderStatus.status === 'granted'
              ? '허용됨'
              : reminderStatus.status === 'denied'
                ? '거부됨'
                : '확인 필요'
          );
          setReminderCanAskAgain(reminderStatus.canAskAgain);
        } catch (error) {
          console.error('Reminder permission check error:', error);
          setReminderPermission('사용 불가');
          setReminderCanAskAgain(false);
        }
      } else {
        setReminderPermission('Android 미지원');
        setReminderCanAskAgain(false);
      }
    } catch (error) {
      console.error('Permission check error:', error);
    }
  };

  const requestCalendarPermissions = async () => {
    try {
      const { status, canAskAgain } =
        await Calendar.requestCalendarPermissionsAsync();
      setCalendarPermission(
        status === 'granted'
          ? '허용됨'
          : status === 'denied'
            ? '거부됨'
            : '확인 필요'
      );
      setCalendarCanAskAgain(canAskAgain);

      if (status === 'granted') {
        await loadCalendars();
      } else if (status === 'denied' && !canAskAgain) {
        Alert.alert(
          '권한 필요',
          '캘린더 권한이 거부되었습니다. 앱 설정에서 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '설정 열기',
              onPress: openAppSettings,
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('오류', '권한 요청 중 오류가 발생했습니다.');
    }
  };

  const requestReminderPermissions = async () => {
    try {
      const { status, canAskAgain } =
        await Calendar.requestRemindersPermissionsAsync();
      setReminderPermission(
        status === 'granted'
          ? '허용됨'
          : status === 'denied'
            ? '거부됨'
            : '확인 필요'
      );
      setReminderCanAskAgain(canAskAgain);

      if (status === 'denied' && !canAskAgain) {
        Alert.alert(
          '권한 필요',
          '리마인더 권한이 거부되었습니다. 앱 설정에서 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '설정 열기',
              onPress: openAppSettings,
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('오류', '권한 요청 중 오류가 발생했습니다.');
    }
  };

  const openAppSettings = async () => {
    try {
      await Linking.openSettings();
      // 설정에서 돌아온 후 권한 상태 다시 확인
      setTimeout(() => {
        checkPermissions();
      }, 1000);
    } catch (error) {
      Alert.alert('오류', '앱 설정을 열 수 없습니다.');
    }
  };

  const loadCalendars = async () => {
    try {
      // 캘린더 목록 로드
      const eventCalendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );
      console.log('eventCalendars', eventCalendars);
      setCalendars(eventCalendars);

      if (eventCalendars.length > 0) {
        setSelectedCalendarId(eventCalendars[0].id);
      }

      // 기본 캘린더 로드 (iOS에서만 지원되거나 일부 플랫폼에서 실패할 수 있음)
      try {
        const defaultCal = await Calendar.getDefaultCalendarAsync();
        console.log('defaultCal', defaultCal);
        setDefaultCalendar(defaultCal);
      } catch (error) {
        console.warn('getDefaultCalendarAsync error:', error);
        // Android에서는 지원되지 않을 수 있으므로 에러를 무시
        setDefaultCalendar(null);
      }

      // 소스 목록 로드 (일부 플랫폼에서 실패할 수 있음)
      try {
        const sourcesList = await Calendar.getSourcesAsync();
        console.log('sourcesList', sourcesList);
        setSources(sourcesList);
      } catch (error) {
        console.warn('getSourcesAsync error:', error);
        // 에러가 발생해도 계속 진행
        setSources([]);
      }
    } catch (error) {
      console.error('loadCalendars error:', error);
      Alert.alert('오류', `캘린더 로드 중 오류가 발생했습니다: ${error}`);
    }
  };

  const loadEvents = async () => {
    if (!selectedCalendarId) {
      Alert.alert('알림', '캘린더를 먼저 선택하세요.');
      return;
    }

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const eventsList = await Calendar.getEventsAsync(
        [selectedCalendarId],
        startDate,
        endDate
      );
      setEvents(eventsList);
    } catch (error) {
      Alert.alert('오류', '이벤트 로드 중 오류가 발생했습니다.');
    }
  };

  const loadReminders = async () => {
    if (!selectedCalendarId) {
      Alert.alert('알림', '캘린더를 먼저 선택하세요.');
      return;
    }

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const remindersList = await Calendar.getRemindersAsync(
        [selectedCalendarId],
        Calendar.ReminderStatus.INCOMPLETE,
        startDate,
        endDate
      );
      setReminders(remindersList);
    } catch (error) {
      Alert.alert('오류', '리마인더 로드 중 오류가 발생했습니다.');
    }
  };

  const createCalendar = async () => {
    try {
      if (Platform.OS === 'ios') {
        const defaultSource = await Calendar.getDefaultCalendarAsync();
        const source = defaultSource.source;

        const calendarId = await Calendar.createCalendarAsync({
          title: 'Expo 테스트 캘린더',
          color: '#FF6B6B',
          entityType: Calendar.EntityTypes.EVENT,
          sourceId: source.id,
          source: source,
          name: 'expoTestCalendar',
          ownerAccount: 'personal',
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
          allowsModifications: true,
          isVisible: true,
          timeZone: 'Asia/Seoul',
        });

        Alert.alert('성공', `캘린더 생성됨: ${calendarId}`);
        await loadCalendars();
      } else {
        const calendarId = await Calendar.createCalendarAsync({
          title: 'Expo 테스트 캘린더',
          color: '#4ECDC4',
          entityType: Calendar.EntityTypes.EVENT,
          source: {
            isLocalAccount: true,
            name: 'Expo Calendar',
            type: Calendar.SourceType.LOCAL,
          },
          sourceId: 'local',
          name: 'expoTestCalendar',
          ownerAccount: 'personal',
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
          allowsModifications: true,
          isVisible: true,
          timeZone: 'Asia/Seoul',
        });

        Alert.alert('성공', `캘린더 생성됨: ${calendarId}`);
        await loadCalendars();
      }
    } catch (error) {
      Alert.alert('오류', `캘린더 생성 실패: ${error}`);
    }
  };

  const createEventWithAllProps = async () => {
    if (!selectedCalendarId) {
      Alert.alert('알림', '캘린더를 먼저 선택하세요.');
      return;
    }

    try {
      const startDate = new Date();
      startDate.setHours(14, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(15, 30, 0, 0);

      const eventId = await Calendar.createEventAsync(selectedCalendarId, {
        title: eventTitle,
        startDate: startDate,
        endDate: endDate,
        allDay: isAllDay,
        location: eventLocation,
        notes: eventNotes,
        url: eventUrl,
        timeZone: 'Asia/Seoul',
        availability: Calendar.Availability.BUSY,
        alarms: [
          {
            relativeOffset: -15, // 15분 전 알림
            method: Calendar.AlarmMethod.ALERT,
          },
          {
            relativeOffset: -60, // 1시간 전 알림
            method: Calendar.AlarmMethod.EMAIL,
          },
        ],
        recurrenceRule: {
          frequency: Calendar.Frequency.WEEKLY,
          interval: 1,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
          daysOfTheWeek: [
            { dayOfTheWeek: Calendar.DayOfTheWeek.Monday },
            { dayOfTheWeek: Calendar.DayOfTheWeek.Wednesday },
            { dayOfTheWeek: Calendar.DayOfTheWeek.Friday },
          ],
        },
      });

      Alert.alert('성공', `이벤트 생성됨: ${eventId}`);
      await loadEvents();
    } catch (error) {
      Alert.alert('오류', `이벤트 생성 실패: ${error}`);
    }
  };

  const createSimpleEvent = async () => {
    if (!selectedCalendarId) {
      Alert.alert('알림', '캘린더를 먼저 선택하세요.');
      return;
    }

    try {
      const startDate = new Date();
      startDate.setHours(10, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(11, 0, 0, 0);

      const eventId = await Calendar.createEventAsync(selectedCalendarId, {
        title: '간단한 이벤트',
        startDate: startDate,
        endDate: endDate,
        allDay: false,
        location: '회의실 A',
        notes: '간단한 테스트 이벤트입니다',
        timeZone: 'Asia/Seoul',
        availability: Calendar.Availability.FREE,
        alarms: [
          {
            relativeOffset: -10,
            method: Calendar.AlarmMethod.DEFAULT,
          },
        ],
      });

      Alert.alert('성공', `이벤트 생성됨: ${eventId}`);
      await loadEvents();
    } catch (error) {
      Alert.alert('오류', `이벤트 생성 실패: ${error}`);
    }
  };

  const createEventWithSystemUI = async () => {
    try {
      const startDate = new Date();
      startDate.setHours(15, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(16, 0, 0, 0);

      const result = await Calendar.createEventInCalendarAsync(
        {
          title: '시스템 UI로 생성된 이벤트',
          startDate: startDate,
          endDate: endDate,
          allDay: false,
          location: '서울시 강남구',
          notes: '시스템 캘린더 UI를 통해 생성된 이벤트입니다',
          timeZone: 'Asia/Seoul',
          availability: Calendar.Availability.BUSY,
        },
        {
          startNewActivityTask: false,
        }
      );

      Alert.alert('완료', `결과: ${result.action}, ID: ${result.id || 'N/A'}`);
      await loadEvents();
    } catch (error) {
      Alert.alert('오류', `이벤트 생성 실패: ${error}`);
    }
  };

  const createReminder = async () => {
    if (!selectedCalendarId) {
      Alert.alert('알림', '캘린더를 먼저 선택하세요.');
      return;
    }

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      dueDate.setHours(12, 0, 0, 0);

      const reminderId = await Calendar.createReminderAsync(
        selectedCalendarId,
        {
          title: '테스트 리마인더',
          dueDate: dueDate,
          startDate: new Date(),
          location: '집',
          notes: '리마인더 설명입니다',
          timeZone: 'Asia/Seoul',
          completed: false,
          alarms: [
            {
              relativeOffset: -30,
              method: Calendar.AlarmMethod.ALERT,
            },
          ],
          recurrenceRule: {
            frequency: Calendar.Frequency.DAILY,
            interval: 1,
            occurrence: 7, // 7일 동안
          },
        }
      );

      Alert.alert('성공', `리마인더 생성됨: ${reminderId}`);
      await loadReminders();
    } catch (error) {
      Alert.alert('오류', `리마인더 생성 실패: ${error}`);
    }
  };

  const updateEvent = async (eventId: string) => {
    try {
      await Calendar.updateEventAsync(
        eventId,
        {
          title: '수정된 이벤트',
          notes: '이벤트가 수정되었습니다',
          location: '수정된 위치',
        },
        {
          futureEvents: false,
        }
      );

      Alert.alert('성공', '이벤트가 수정되었습니다.');
      await loadEvents();
    } catch (error) {
      Alert.alert('오류', `이벤트 수정 실패: ${error}`);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await Calendar.deleteEventAsync(eventId, {
        futureEvents: false,
      });

      Alert.alert('성공', '이벤트가 삭제되었습니다.');
      await loadEvents();
    } catch (error) {
      Alert.alert('오류', `이벤트 삭제 실패: ${error}`);
    }
  };

  const addAttendee = async (eventId: string) => {
    try {
      const attendeeId = await Calendar.createAttendeeAsync(eventId, {
        name: '테스트 참석자',
        email: 'test@example.com',
        role: Calendar.AttendeeRole.REQUIRED,
        status: Calendar.AttendeeStatus.INVITED,
        type: Calendar.AttendeeType.PERSON,
      });

      Alert.alert('성공', `참석자 추가됨: ${attendeeId}`);
    } catch (error) {
      Alert.alert('오류', `참석자 추가 실패: ${error}`);
    }
  };

  const openEventInSystemUI = async (eventId: string) => {
    try {
      const result = await Calendar.openEventInCalendarAsync(
        {
          id: eventId,
        },
        {
          allowsEditing: true,
          allowsCalendarPreview: true,
          startNewActivityTask: false,
        }
      );

      Alert.alert('완료', `결과: ${result.action}`);
    } catch (error) {
      Alert.alert('오류', `이벤트 열기 실패: ${error}`);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('ko-KR');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Calendar" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Calendar
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          시스템 캘린더 및 이벤트 관리
        </TextBox>

        {/* 개념 설명 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📚 개념 설명
          </TextBox>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              Calendar API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 시스템 캘린더와 이벤트를 관리하는 API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 캘린더 생성/수정/삭제
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 이벤트 생성/수정/삭제
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 리마인더 관리 (iOS)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 참석자 관리
            </TextBox>
          </View>
        </View>

        {/* 상태 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📊 API 상태
          </TextBox>

          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                사용 가능:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  isAvailable === true
                    ? theme.success
                    : isAvailable === false
                      ? theme.error
                      : theme.textSecondary
                }
              >
                {isAvailable === true
                  ? '✅ 사용 가능'
                  : isAvailable === false
                    ? '❌ 사용 불가'
                    : '확인 중...'}
              </TextBox>
            </View>

            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                캘린더 권한:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {calendarPermission}
              </TextBox>
            </View>

            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                리마인더 권한:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {reminderPermission}
              </TextBox>
            </View>

            <View style={styles.buttonRow}>
              {calendarPermission === '거부됨' && !calendarCanAskAgain ? (
                <CustomButton
                  title="앱 설정 열기"
                  onPress={openAppSettings}
                  style={styles.smallButton}
                />
              ) : calendarPermission !== '허용됨' ? (
                <CustomButton
                  title="캘린더 권한 요청"
                  onPress={requestCalendarPermissions}
                  variant="ghost"
                  style={styles.smallButton}
                />
              ) : null}

              {Platform.OS === 'ios' &&
                (reminderPermission === '거부됨' && !reminderCanAskAgain ? (
                  <CustomButton
                    title="앱 설정 열기"
                    onPress={openAppSettings}
                    style={styles.smallButton}
                  />
                ) : reminderPermission !== '허용됨' ? (
                  <CustomButton
                    title="리마인더 권한 요청"
                    onPress={requestReminderPermissions}
                    variant="ghost"
                    style={styles.smallButton}
                  />
                ) : null)}
            </View>

            {(calendarPermission === '거부됨' && !calendarCanAskAgain) ||
            (Platform.OS === 'ios' &&
              reminderPermission === '거부됨' &&
              !reminderCanAskAgain) ? (
              <View
                style={[
                  styles.warningContainer,
                  { backgroundColor: 'rgba(255, 193, 7, 0.1)' },
                ]}
              >
                <TextBox variant="body4" color={theme.warning}>
                  ⚠️ 권한이 거부되었습니다. 앱 설정에서 권한을 허용해주세요.
                </TextBox>
              </View>
            ) : null}
          </View>
        </View>

        {/* 캘린더 관리 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📅 캘린더 관리
          </TextBox>

          <View style={styles.buttonRow}>
            <CustomButton
              title="캘린더 목록 로드"
              onPress={loadCalendars}
              style={styles.button}
            />
            <CustomButton
              title="캘린더 생성"
              onPress={createCalendar}
              style={styles.button}
            />
          </View>

          {calendars.length > 0 && (
            <View style={styles.listContainer}>
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.listTitle}
              >
                캘린더 목록 ({calendars.length}개)
              </TextBox>
              {calendars.map((cal) => (
                <View
                  key={cal.id}
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                    selectedCalendarId === cal.id && {
                      borderColor: theme.primary,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <View style={styles.listItemContent}>
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: cal.color },
                      ]}
                    />
                    <View style={styles.listItemText}>
                      <TextBox variant="body3" color={theme.text}>
                        {cal.title}
                      </TextBox>
                      <TextBox variant="body4" color={theme.textSecondary}>
                        ID: {cal.id}
                      </TextBox>
                      {cal.allowsModifications !== undefined && (
                        <TextBox variant="body4" color={theme.textSecondary}>
                          수정 가능: {cal.allowsModifications ? '예' : '아니오'}
                        </TextBox>
                      )}
                      {cal.isVisible !== undefined && (
                        <TextBox variant="body4" color={theme.textSecondary}>
                          표시: {cal.isVisible ? '예' : '아니오'}
                        </TextBox>
                      )}
                    </View>
                  </View>
                  <CustomButton
                    title="선택"
                    onPress={() => setSelectedCalendarId(cal.id)}
                    variant={
                      selectedCalendarId === cal.id ? 'primary' : 'ghost'
                    }
                    style={styles.selectButton}
                  />
                </View>
              ))}
            </View>
          )}

          {defaultCalendar && (
            <View style={styles.infoContainer}>
              <TextBox variant="body3" color={theme.text}>
                기본 캘린더: {defaultCalendar.title}
              </TextBox>
            </View>
          )}
        </View>

        {/* 이벤트 생성 (많은 props 사용) */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ✨ 이벤트 생성 (모든 Props 사용)
          </TextBox>

          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <TextBox variant="body3" color={theme.textSecondary}>
                제목
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={eventTitle}
                onChangeText={setEventTitle}
                placeholder="이벤트 제목"
              />
            </View>

            <View style={styles.formGroup}>
              <TextBox variant="body3" color={theme.textSecondary}>
                위치
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={eventLocation}
                onChangeText={setEventLocation}
                placeholder="이벤트 위치"
              />
            </View>

            <View style={styles.formGroup}>
              <TextBox variant="body3" color={theme.textSecondary}>
                설명
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={eventNotes}
                onChangeText={setEventNotes}
                placeholder="이벤트 설명"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <TextBox variant="body3" color={theme.textSecondary}>
                URL
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={eventUrl}
                onChangeText={setEventUrl}
                placeholder="https://example.com"
              />
            </View>

            <View style={styles.checkboxRow}>
              <CustomButton
                title={isAllDay ? '✅ 종일 이벤트' : '❌ 종일 이벤트'}
                onPress={() => setIsAllDay(!isAllDay)}
                variant="ghost"
                style={styles.checkboxButton}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="모든 Props로 생성"
              onPress={createEventWithAllProps}
              style={styles.button}
            />
            <CustomButton
              title="간단한 이벤트"
              onPress={createSimpleEvent}
              variant="ghost"
              style={styles.button}
            />
            <CustomButton
              title="시스템 UI로 생성"
              onPress={createEventWithSystemUI}
              variant="ghost"
              style={styles.button}
            />
          </View>
        </View>

        {/* 이벤트 목록 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📋 이벤트 목록
          </TextBox>

          <CustomButton
            title="이벤트 로드"
            onPress={loadEvents}
            style={styles.button}
          />

          {events.length > 0 && (
            <View style={styles.listContainer}>
              {events.map((event) => (
                <View
                  key={event.id}
                  style={[
                    styles.eventItem,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.eventContent}>
                    <TextBox variant="body2" color={theme.text}>
                      {event.title}
                    </TextBox>
                    <TextBox variant="body4" color={theme.textSecondary}>
                      시작: {formatDate(event.startDate)}
                    </TextBox>
                    <TextBox variant="body4" color={theme.textSecondary}>
                      종료: {formatDate(event.endDate)}
                    </TextBox>
                    {event.location && (
                      <TextBox variant="body4" color={theme.textSecondary}>
                        위치: {event.location}
                      </TextBox>
                    )}
                    {event.notes && (
                      <TextBox variant="body4" color={theme.textSecondary}>
                        설명: {event.notes}
                      </TextBox>
                    )}
                    {event.allDay && (
                      <TextBox variant="body4" color={theme.primary}>
                        종일 이벤트
                      </TextBox>
                    )}
                    {event.recurrenceRule && (
                      <TextBox variant="body4" color={theme.warning}>
                        반복: {event.recurrenceRule.frequency}
                      </TextBox>
                    )}
                  </View>
                  <View style={styles.eventActions}>
                    <CustomButton
                      title="수정"
                      onPress={() => updateEvent(event.id)}
                      variant="ghost"
                      style={styles.smallButton}
                    />
                    <CustomButton
                      title="삭제"
                      onPress={() => deleteEvent(event.id)}
                      variant="ghost"
                      style={styles.smallButton}
                    />
                    <CustomButton
                      title="참석자 추가"
                      onPress={() => addAttendee(event.id)}
                      variant="ghost"
                      style={styles.smallButton}
                    />
                    <CustomButton
                      title="시스템 UI 열기"
                      onPress={() => openEventInSystemUI(event.id)}
                      variant="ghost"
                      style={styles.smallButton}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 리마인더 (iOS만) */}
        {Platform.OS === 'ios' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              🔔 리마인더 (iOS)
            </TextBox>

            <CustomButton
              title="리마인더 생성"
              onPress={createReminder}
              style={styles.button}
            />

            <CustomButton
              title="리마인더 로드"
              onPress={loadReminders}
              style={styles.button}
            />

            {reminders.length > 0 && (
              <View style={styles.listContainer}>
                {reminders.map((reminder) => (
                  <View
                    key={reminder.id}
                    style={[
                      styles.eventItem,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <TextBox variant="body2" color={theme.text}>
                      {reminder.title}
                    </TextBox>
                    {reminder.dueDate && (
                      <TextBox variant="body4" color={theme.textSecondary}>
                        마감: {formatDate(reminder.dueDate)}
                      </TextBox>
                    )}
                    {reminder.completed !== undefined && (
                      <TextBox variant="body4" color={theme.textSecondary}>
                        완료: {reminder.completed ? '예' : '아니오'}
                      </TextBox>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 코드 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💻 코드 예제
          </TextBox>
          <View
            style={[
              styles.codeContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {`// 1. 모든 Props를 사용한 이벤트 생성
const eventId = await Calendar.createEventAsync(calendarId, {
  title: '회의',
  startDate: new Date('2024-01-15T14:00:00'),
  endDate: new Date('2024-01-15T15:30:00'),
  allDay: false,
  location: '서울시 강남구',
  notes: '중요한 회의입니다',
  url: 'https://example.com',
  timeZone: 'Asia/Seoul',
  availability: Calendar.Availability.BUSY,
  alarms: [
    {
      relativeOffset: -15, // 15분 전
      method: Calendar.AlarmMethod.ALERT,
    },
    {
      absoluteDate: new Date('2024-01-15T13:45:00'),
      method: Calendar.AlarmMethod.EMAIL,
    },
  ],
  recurrenceRule: {
    frequency: Calendar.Frequency.WEEKLY,
    interval: 1,
    endDate: new Date('2024-12-31'),
    daysOfTheWeek: [
      { dayOfTheWeek: Calendar.DayOfTheWeek.Monday },
    ],
  },
});

// 2. 캘린더 생성 (모든 Props)
const calendarId = await Calendar.createCalendarAsync({
  title: '내 캘린더',
  color: '#FF6B6B',
  entityType: Calendar.EntityTypes.EVENT,
  sourceId: source.id,
  source: source,
  name: 'myCalendar',
  ownerAccount: 'personal',
  accessLevel: Calendar.CalendarAccessLevel.OWNER,
  allowsModifications: true,
  isVisible: true,
  timeZone: 'Asia/Seoul',
});

// 3. 참석자 추가
const attendeeId = await Calendar.createAttendeeAsync(eventId, {
  name: '홍길동',
  email: 'hong@example.com',
  role: Calendar.AttendeeRole.REQUIRED,
  status: Calendar.AttendeeStatus.INVITED,
  type: Calendar.AttendeeType.PERSON,
});

// 4. 리마인더 생성 (iOS)
const reminderId = await Calendar.createReminderAsync(calendarId, {
  title: '할 일',
  dueDate: new Date('2024-01-20T12:00:00'),
  startDate: new Date('2024-01-20T09:00:00'),
  location: '집',
  notes: '리마인더 설명',
  completed: false,
  alarms: [{ relativeOffset: -30 }],
  recurrenceRule: {
    frequency: Calendar.Frequency.DAILY,
    interval: 1,
    occurrence: 7,
  },
});`}
            </TextBox>
          </View>
        </View>

        {/* 주의사항 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚠️ 주의사항
          </TextBox>
          <View style={styles.warningContainer}>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 캘린더/리마인더 권한 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 리마인더는 iOS에서만 사용 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 반복 이벤트 수정 시 futureEvents 옵션 주의
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 시스템 UI는 플랫폼별로 다르게 동작
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 캘린더 삭제 시 모든 이벤트도 삭제됨 (주의)
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
  content: {
    padding: 20,
    gap: 16,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  conceptContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 6,
  },
  conceptTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  conceptText: {
    marginLeft: 8,
    lineHeight: 20,
  },
  statusContainer: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  smallButton: {
    minWidth: 80,
  },
  listContainer: {
    marginTop: 12,
    gap: 8,
  },
  listTitle: {
    marginBottom: 8,
  },
  listItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  listItemText: {
    flex: 1,
    gap: 4,
  },
  selectButton: {
    alignSelf: 'flex-end',
  },
  infoContainer: {
    marginTop: 12,
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  formContainer: {
    gap: 12,
    marginTop: 12,
  },
  formGroup: {
    gap: 4,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxButton: {
    alignSelf: 'flex-start',
  },
  eventItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  eventContent: {
    gap: 4,
  },
  eventActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  codeContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  warningContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    gap: 8,
  },
  warningItem: {
    marginLeft: 8,
    lineHeight: 22,
  },
});
