import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  AppState,
  AppStateStatus,
} from 'react-native';

import {
  getLocales,
  getCalendars,
  useLocales,
  useCalendars,
  Locale,
  Calendar,
  CalendarIdentifier,
  Weekday,
} from 'expo-localization';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function LocalizationScreen() {
  const { theme } = useTheme();

  // Hook 사용
  const hookLocales = useLocales();
  const hookCalendars = useCalendars();

  // State
  const [locales, setLocales] = useState<Locale[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadData();

    // Android: 앱이 포그라운드로 돌아올 때 로케일 재확인
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          loadData();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const loadData = () => {
    try {
      const loadedLocales = getLocales();
      const loadedCalendars = getCalendars();
      setLocales(loadedLocales);
      setCalendars(loadedCalendars);
      setLastUpdate(new Date());
    } catch (error: any) {
      console.error('로케일 데이터 로드 실패:', error);
    }
  };

  const getCalendarName = (calendar: CalendarIdentifier | null): string => {
    if (!calendar) return '알 수 없음';

    const calendarNames: Record<string, string> = {
      gregory: '그레고리력',
      gregorian: '그레고리력',
      buddhist: '불교력',
      chinese: '중국력',
      coptic: '콥트력',
      dangi: '단기력',
      ethioaa: '에티오피아력 (Amete Alem)',
      ethiopic: '에티오피아력 (Amete Mihret)',
      hebrew: '히브리력',
      indian: '인도력',
      islamic: '이슬람력',
      'islamic-civil': '이슬람력 (Civil)',
      'islamic-rgsa': '이슬람력 (RGSA)',
      'islamic-tbla': '이슬람력 (TBLA)',
      'islamic-umalqura': '이슬람력 (Umm al-Qura)',
      iso8601: 'ISO 8601',
      japanese: '일본력',
      persian: '페르시아력',
      roc: 'ROC (중화민국)',
    };

    return calendarNames[calendar] || calendar;
  };

  const getWeekdayName = (weekday: Weekday | null): string => {
    if (!weekday) return '알 수 없음';

    const weekdayNames: Record<number, string> = {
      1: '일요일',
      2: '월요일',
      3: '화요일',
      4: '수요일',
      5: '목요일',
      6: '금요일',
      7: '토요일',
    };

    return weekdayNames[weekday] || `Weekday ${weekday}`;
  };

  const getMeasurementSystemName = (
    system: 'metric' | 'us' | 'uk' | null
  ): string => {
    switch (system) {
      case 'metric':
        return '미터법';
      case 'us':
        return '미국 단위';
      case 'uk':
        return '영국 단위';
      default:
        return '알 수 없음';
    }
  };

  const getTextDirectionName = (direction: 'ltr' | 'rtl' | null): string => {
    switch (direction) {
      case 'ltr':
        return '왼쪽에서 오른쪽 (LTR)';
      case 'rtl':
        return '오른쪽에서 왼쪽 (RTL)';
      default:
        return '알 수 없음';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Localization" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Localization
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          디바이스 로케일 및 캘린더 정보
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
              Localization API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 디바이스의 로케일 설정 정보 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 언어, 지역, 통화, 측정 단위 등
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 캘린더 타입, 시간대, 24시간 형식
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • getLocales() / useLocales(): 동기/비동기
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • getCalendars() / useCalendars(): 동기/비동기
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Android: 앱 포그라운드 시 자동 업데이트
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • i18n 라이브러리와 함께 사용 권장
            </TextBox>
          </View>
        </View>

        {/* Hook 사용 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎣 Hook 사용 (자동 업데이트)
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                로케일 수:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {hookLocales.length}개
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                캘린더 수:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {hookCalendars.length}개
              </TextBox>
            </View>
          </View>
        </View>

        {/* 로케일 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🌍 로케일 정보 ({locales.length}개)
          </TextBox>

          <View style={styles.infoRow}>
            <TextBox variant="body3" color={theme.textSecondary}>
              마지막 업데이트:
            </TextBox>
            <TextBox variant="body3" color={theme.text}>
              {lastUpdate.toLocaleTimeString('ko-KR')}
            </TextBox>
          </View>

          <CustomButton
            title="데이터 새로고침"
            onPress={loadData}
            variant="ghost"
            style={styles.button}
          />

          {locales.map((locale, index) => (
            <View
              key={index}
              style={[styles.localeCard, { backgroundColor: theme.background }]}
            >
              <View style={styles.cardHeader}>
                <TextBox variant="body2" color={theme.text}>
                  로케일 #{index + 1}
                  {index === 0 && (
                    <TextBox variant="body4" color={theme.primary}>
                      {' '}
                      (기본)
                    </TextBox>
                  )}
                </TextBox>
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Language Tag:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {locale.languageTag}
                  </TextBox>
                </View>

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Language Code:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {locale.languageCode || 'N/A'}
                  </TextBox>
                </View>

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Region Code:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {locale.regionCode || 'N/A'}
                  </TextBox>
                </View>

                {locale.languageRegionCode && (
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Language Region:
                    </TextBox>
                    <TextBox variant="body3" color={theme.text}>
                      {locale.languageRegionCode}
                    </TextBox>
                  </View>
                )}

                {locale.languageScriptCode && (
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Script Code:
                    </TextBox>
                    <TextBox variant="body3" color={theme.text}>
                      {locale.languageScriptCode}
                    </TextBox>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Text Direction:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {getTextDirectionName(locale.textDirection)}
                  </TextBox>
                </View>

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Currency Code:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {locale.currencyCode || 'N/A'}
                  </TextBox>
                </View>

                {locale.currencySymbol && (
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Currency Symbol:
                    </TextBox>
                    <TextBox variant="body3" color={theme.text}>
                      {locale.currencySymbol}
                    </TextBox>
                  </View>
                )}

                {locale.languageCurrencyCode && (
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Language Currency:
                    </TextBox>
                    <TextBox variant="body3" color={theme.text}>
                      {locale.languageCurrencyCode}
                    </TextBox>
                  </View>
                )}

                {locale.languageCurrencySymbol && (
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Language Currency Symbol:
                    </TextBox>
                    <TextBox variant="body3" color={theme.text}>
                      {locale.languageCurrencySymbol}
                    </TextBox>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Measurement System:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {getMeasurementSystemName(locale.measurementSystem)}
                  </TextBox>
                </View>

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Temperature Unit:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {locale.temperatureUnit === 'celsius'
                      ? '섭씨 (°C)'
                      : locale.temperatureUnit === 'fahrenheit'
                        ? '화씨 (°F)'
                        : 'N/A'}
                  </TextBox>
                </View>

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Decimal Separator:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {locale.decimalSeparator || 'N/A'}
                  </TextBox>
                </View>

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Digit Grouping Separator:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {locale.digitGroupingSeparator || 'N/A'}
                  </TextBox>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 캘린더 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📅 캘린더 정보 ({calendars.length}개)
          </TextBox>

          {calendars.map((calendar, index) => (
            <View
              key={index}
              style={[styles.localeCard, { backgroundColor: theme.background }]}
            >
              <View style={styles.cardHeader}>
                <TextBox variant="body2" color={theme.text}>
                  캘린더 #{index + 1}
                  {index === 0 && (
                    <TextBox variant="body4" color={theme.primary}>
                      {' '}
                      (기본)
                    </TextBox>
                  )}
                </TextBox>
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Calendar:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {getCalendarName(calendar.calendar)}
                  </TextBox>
                </View>

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Time Zone:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {calendar.timeZone || 'N/A'}
                  </TextBox>
                </View>

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    24시간 형식:
                  </TextBox>
                  <TextBox
                    variant="body3"
                    color={
                      calendar.uses24hourClock === null
                        ? theme.textSecondary
                        : calendar.uses24hourClock
                          ? theme.success
                          : theme.text
                    }
                  >
                    {calendar.uses24hourClock === null
                      ? 'N/A'
                      : calendar.uses24hourClock
                        ? '✅ 사용'
                        : '❌ 미사용'}
                  </TextBox>
                </View>

                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    첫 번째 요일:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {getWeekdayName(calendar.firstWeekday)}
                  </TextBox>
                </View>
              </View>
            </View>
          ))}
        </View>

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
              {`// 1. 기본 사용 (동기)
import { getLocales, getCalendars } from 'expo-localization';

const locales = getLocales();
const calendars = getCalendars();

console.log('기본 로케일:', locales[0].languageTag);
console.log('기본 캘린더:', calendars[0].calendar);

// 2. Hook 사용 (자동 업데이트)
import { useLocales, useCalendars } from 'expo-localization';

function MyComponent() {
  const locales = useLocales();
  const calendars = useCalendars();
  
  return (
    <Text>언어: {locales[0].languageCode}</Text>
  );
}

// 3. 로케일 정보 사용
const locale = getLocales()[0];

console.log('언어:', locale.languageCode); // 'ko'
console.log('지역:', locale.regionCode); // 'KR'
console.log('통화:', locale.currencyCode); // 'KRW'
console.log('통화 기호:', locale.currencySymbol); // '₩'
console.log('측정 단위:', locale.measurementSystem); // 'metric'
console.log('온도 단위:', locale.temperatureUnit); // 'celsius'
console.log('텍스트 방향:', locale.textDirection); // 'ltr'
console.log('소수점 구분자:', locale.decimalSeparator); // '.'
console.log('천 단위 구분자:', locale.digitGroupingSeparator); // ','

// 4. 캘린더 정보 사용
const calendar = getCalendars()[0];

console.log('캘린더:', calendar.calendar); // 'gregory'
console.log('시간대:', calendar.timeZone); // 'Asia/Seoul'
console.log('24시간 형식:', calendar.uses24hourClock); // true
console.log('첫 번째 요일:', calendar.firstWeekday); // 1 (일요일)

// 5. Android: 앱 포그라운드 시 업데이트
import { AppState } from 'react-native';
import { getLocales } from 'expo-localization';

useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      const locales = getLocales(); // 로케일 재확인
    }
  });

  return () => subscription.remove();
}, []);

// 6. 다국어 지원 예제
const locale = getLocales()[0];
const messages = {
  en: { hello: 'Hello' },
  ko: { hello: '안녕하세요' },
  ja: { hello: 'こんにちは' },
};

const t = (key: string) => {
  const lang = locale.languageCode || 'en';
  return messages[lang]?.[key] || messages.en[key];
};

console.log(t('hello')); // 언어에 따라 다름

// 7. 통화 포맷팅
const locale = getLocales()[0];
const amount = 1234.56;

const formatted = new Intl.NumberFormat(locale.languageTag, {
  style: 'currency',
  currency: locale.currencyCode || 'USD',
}).format(amount);

console.log(formatted); // '₩1,235' (한국)

// 8. 날짜 포맷팅
const locale = getLocales()[0];
const calendar = getCalendars()[0];
const date = new Date();

const formatted = new Intl.DateTimeFormat(locale.languageTag, {
  calendar: calendar.calendar || 'gregory',
  timeZone: calendar.timeZone || undefined,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(date);

console.log(formatted); // '2024년 1월 15일' (한국)

// 9. 숫자 포맷팅
const locale = getLocales()[0];
const number = 1234567.89;

const formatted = new Intl.NumberFormat(locale.languageTag, {
  useGrouping: true,
}).format(number);

console.log(formatted); // '1,234,567.89' (미국) 또는 '1.234.567,89' (유럽)

// 10. RTL 언어 지원
const locale = getLocales()[0];

if (locale.textDirection === 'rtl') {
  // 오른쪽에서 왼쪽 레이아웃 적용
  styles.container.flexDirection = 'row-reverse';
}

// 11. 측정 단위 변환
const locale = getLocales()[0];

if (locale.measurementSystem === 'metric') {
  // 미터법 사용
  const distance = '5 km';
} else if (locale.measurementSystem === 'us') {
  // 미국 단위 사용
  const distance = '3.1 miles';
}

// 12. 온도 단위 변환
const locale = getLocales()[0];

if (locale.temperatureUnit === 'celsius') {
  // 섭씨 사용
  const temp = '25°C';
} else if (locale.temperatureUnit === 'fahrenheit') {
  // 화씨 사용
  const temp = '77°F';
}

// 13. i18n 라이브러리와 함께 사용
import { getLocales } from 'expo-localization';
import i18n from 'i18n-js';

const locale = getLocales()[0];
i18n.locale = locale.languageTag;
i18n.defaultLocale = 'en';

// 14. 여러 로케일 처리
const locales = getLocales();

locales.forEach((locale, index) => {
  console.log(\`로케일 \${index + 1}:\`, locale.languageTag);
  // 사용자 설정 순서대로 정렬됨
});

// 15. 조건부 렌더링
const locale = getLocales()[0];

{locale.regionCode === 'KR' && (
  <Text>한국 전용 콘텐츠</Text>
)}`}
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
              • iOS: 앱 실행 중 로케일 변경 없음 (재시작 필요)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: 설정 변경 시 앱 포그라운드에서 자동 업데이트
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Web: currencyCode, measurementSystem은 null일 수 있음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: currencyCode는 Region 설정에서 가져옴
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: currencyCode는 로케일별로 다름
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • languageCurrencyCode vs currencyCode 차이 주의
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • i18n 라이브러리와 함께 사용 권장
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • RTL 언어 지원 시 레이아웃 조정 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: SECRET 레벨은 SIM 잠금일 수 있음
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
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    gap: 8,
  },
  localeCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 12,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingBottom: 8,
  },
  button: {
    flex: 1,
    minWidth: 100,
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
