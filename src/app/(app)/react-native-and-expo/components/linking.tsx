import { useEffect, useState } from 'react';
import {
  Alert,
  Linking as RNLinking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

export default function LinkingScreen() {
  const { theme } = useTheme();
  const [initialURL, setInitialURL] = useState<string | null>(null);
  const [currentURL, setCurrentURL] = useState<string | null>(null);
  const [canOpenResult, setCanOpenResult] = useState<string>('');
  const [parsedURL, setParsedURL] = useState<string>('');
  const [createdURL, setCreatedURL] = useState<string>('');
  const [schemeURL, setSchemeURL] = useState<string>(
    'monymony://workout/today'
  );

  useEffect(() => {
    // 앱이 Deep Link로 실행되었는지 확인
    Linking.getInitialURL().then((url) => {
      if (url) {
        setInitialURL(url);
        parseURL(url);
      }
    });

    // 앱 실행 중 들어오는 Deep Link 처리
    const subscription = Linking.addEventListener('url', ({ url }) => {
      setCurrentURL(url);
      parseURL(url);
      Alert.alert('Deep Link', `받은 URL: ${url}`);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // URL 파싱 함수
  const parseURL = (url: string) => {
    try {
      const parsed = Linking.parse(url);
      setParsedURL(
        JSON.stringify(
          {
            scheme: parsed.scheme,
            hostname: parsed.hostname,
            path: parsed.path,
            queryParams: parsed.queryParams,
          },
          null,
          2
        )
      );
    } catch (error) {
      setParsedURL(`파싱 오류: ${error}`);
    }
  };

  // createURL 테스트
  const handleCreateURL = () => {
    const url = Linking.createURL('workout/today', {
      queryParams: { date: new Date().toISOString().split('T')[0] },
    });
    setCreatedURL(url);
  };

  const handleOpenURL = async (url: string) => {
    try {
      const canOpen = await RNLinking.canOpenURL(url);
      if (canOpen) {
        await RNLinking.openURL(url);
        Alert.alert('성공', `${url}을 열었습니다`);
      } else {
        Alert.alert('실패', `${url}을 열 수 없습니다`);
      }
    } catch (error) {
      Alert.alert('오류', `URL 열기 실패: ${error}`);
    }
  };

  const handleCanOpenURL = async (url: string) => {
    try {
      const canOpen = await RNLinking.canOpenURL(url);
      setCanOpenResult(
        `${url}\n열 수 있음: ${canOpen ? '✅ 예' : '❌ 아니오'}`
      );
    } catch (error) {
      setCanOpenResult(`오류: ${error}`);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Linking API
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          앱에서 링크 열기, 다른 앱으로 연결, Deep Link 처리를 담당하는 API
        </TextBox>

        {/* Linking이란? */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Linking이란?
          </TextBox>
          <View style={styles.infoContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 외부 앱/웹페이지 열기
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 자체 앱으로 들어오는 링크 처리 (Deep Linking, Universal Linking)
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 앱 설정 열기
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • Android Intent 실행
            </TextBox>
          </View>
        </View>

        {/* URL Scheme 개념 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. URL Scheme 개념
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            URL Scheme = 링크의 프로토콜
          </TextBox>
          <View style={styles.infoBox}>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • https://... (웹페이지)
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • mailto:hello@world.dev (이메일)
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • tel:+821012345678 (전화)
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • sms:01012345678 (문자)
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.codeItem}>
              • myapp://news/1234 (Custom Scheme)
            </TextBox>
          </View>
        </View>

        {/* 기본 제공 URL Schemes */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. 기본 제공 URL Schemes
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="이메일 열기"
              onPress={() => handleOpenURL('mailto:test@example.com')}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="전화 걸기"
              onPress={() => handleOpenURL('tel:01012345678')}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="문자 보내기"
              onPress={() => handleOpenURL('sms:01012345678')}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="웹 열기"
              onPress={() => handleOpenURL('https://expo.dev')}
              variant="outline"
              size="small"
            />
          </View>
        </View>

        {/* canOpenURL 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            3. canOpenURL (URL 열 수 있는지 확인)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            해당 URL을 열 수 있는 앱이 있는지 확인
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="mailto 확인"
              onPress={() => handleCanOpenURL('mailto:test@example.com')}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="tel 확인"
              onPress={() => handleCanOpenURL('tel:01012345678')}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="https 확인"
              onPress={() => handleCanOpenURL('https://expo.dev')}
              variant="outline"
              size="small"
            />
          </View>
          {canOpenResult ? (
            <View
              style={[
                styles.resultBox,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.codeText}
              >
                {canOpenResult}
              </TextBox>
            </View>
          ) : null}
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.warning}
          >
            ⚠️ iOS 9+에서는 Info.plist에 LSApplicationQueriesSchemes 등록 필요
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.warning}
          >
            ⚠️ Android 11+에서는 manifest에 &lt;queries&gt; 필요
          </TextBox>
        </View>

        {/* openSettings 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            4. openSettings (앱 설정 열기)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            앱 설정 화면 열기 (푸시 권한 설정 시 많이 사용)
          </TextBox>
          <CustomButton
            title="앱 설정 열기"
            onPress={async () => {
              try {
                await RNLinking.openSettings();
              } catch (error) {
                Alert.alert('오류', `설정 열기 실패: ${error}`);
              }
            }}
            variant="outline"
            size="small"
            style={styles.toggleButton}
          />
        </View>

        {/* Deep Link 처리 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            5. Deep Link 처리
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            앱이 Deep Link로 열렸는지 확인하고 처리
          </TextBox>
          <View style={styles.infoBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              getInitialURL()
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              앱이 꺼진 상태에서 Deep Link로 실행된 경우
            </TextBox>
            {initialURL ? (
              <View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
              >
                <TextBox
                  variant="body4"
                  color={theme.primary}
                  style={styles.codeText}
                >
                  {initialURL}
                </TextBox>
              </View>
            ) : (
              <TextBox variant="body4" color={theme.textSecondary}>
                Deep Link로 실행되지 않음
              </TextBox>
            )}
          </View>
          <View style={styles.infoBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              addEventListener('url')
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              앱 실행 중 들어오는 Deep Link
            </TextBox>
            {currentURL ? (
              <View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
              >
                <TextBox
                  variant="body4"
                  color={theme.primary}
                  style={styles.codeText}
                >
                  {currentURL}
                </TextBox>
              </View>
            ) : (
              <TextBox variant="body4" color={theme.textSecondary}>
                대기 중... (앱 실행 중 Deep Link를 받으면 표시됨)
              </TextBox>
            )}
          </View>
        </View>

        {/* sendIntent 예제 (Android) */}
        {Platform.OS === 'android' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              6. sendIntent (Android 전용)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              직접 Android Intent 실행
            </TextBox>
            <View style={styles.buttonRow}>
              <CustomButton
                title="알림 설정"
                onPress={() => {
                  RNLinking.sendIntent(
                    'android.settings.APP_NOTIFICATION_SETTINGS'
                  );
                }}
                variant="outline"
                size="small"
              />
              <CustomButton
                title="WiFi 설정"
                onPress={() => {
                  RNLinking.sendIntent('android.settings.WIFI_SETTINGS');
                }}
                variant="outline"
                size="small"
              />
            </View>
          </View>
        )}

        {/* Deep Link vs Universal Link */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            7. Deep Link vs Universal Link
          </TextBox>
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonItem}>
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.comparisonTitle}
              >
                Deep Link (Custom Scheme)
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.comparisonText}
              >
                • 예: myapp://news/1234
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.comparisonText}
              >
                • 앱 설치 O → 앱 실행
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.comparisonText}
              >
                • 앱 설치 X → 동작 안 함
              </TextBox>
            </View>
            <View style={styles.comparisonItem}>
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.comparisonTitle}
              >
                Universal Link (iOS) / App Link (Android)
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.comparisonText}
              >
                • 예: https://www.myapp.io/records/1234
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.comparisonText}
              >
                • 모바일 → 앱 실행
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.comparisonText}
              >
                • PC → 웹페이지 열림
              </TextBox>
            </View>
          </View>
        </View>

        {/* 실무 패턴 1: 앱 외부로 이동 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            8. 실무 패턴: 앱 외부로 이동
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            전화, 문자, 이메일 등 외부 앱으로 이동
          </TextBox>
          <View style={styles.codeBox}>
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {`Linking.openURL(\`tel:\${phoneNumber}\`);`}
            </TextBox>
          </View>
        </View>

        {/* 실무 패턴 2: Deep Link + 화면 이동 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            9. 실무 패턴: Deep Link + 화면 이동
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            Deep Link를 받아서 해당 화면으로 이동
          </TextBox>
          <View style={styles.codeBox}>
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {`useEffect(() => {
  Linking.getInitialURL().then(url => {
    if (url) navigateFromDeepLink(url);
  });

  const event = Linking.addEventListener('url', ({ url }) => {
    navigateFromDeepLink(url);
  });

  return () => event.remove();
}, []);`}
            </TextBox>
          </View>
        </View>

        {/* Custom Scheme 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            10. Custom Scheme 테스트
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            앱의 Custom Scheme으로 특정 화면 열기
          </TextBox>
          <View style={styles.inputContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.label}>
              Scheme URL:
            </TextBox>
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.codeText}
              >
                {schemeURL}
              </TextBox>
            </View>
          </View>
          <View style={styles.buttonRow}>
            <CustomButton
              title="workout/today 열기"
              onPress={() => {
                setSchemeURL('monymony://workout/today');
                Linking.openURL('monymony://workout/today');
              }}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="today-study 열기"
              onPress={() => {
                setSchemeURL('monymony://today-study');
                Linking.openURL('monymony://today-study');
              }}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="알고리즘 열기"
              onPress={() => {
                setSchemeURL('monymony://algorithm');
                Linking.openURL('monymony://algorithm');
              }}
              variant="outline"
              size="small"
            />
          </View>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.warning}
          >
            💡 터미널에서 테스트: npx uri-scheme open monymony://workout/today
            --android
          </TextBox>
        </View>

        {/* URL 파싱 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            11. URL 파싱 (Linking.parse)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            URL을 scheme, hostname, path, queryParams로 분해
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="예제 URL 파싱"
              onPress={() => {
                const testURL =
                  'monymony://workout/today?date=2024-01-15&mode=rest';
                parseURL(testURL);
              }}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="현재 URL 파싱"
              onPress={() => {
                if (currentURL) {
                  parseURL(currentURL);
                } else if (initialURL) {
                  parseURL(initialURL);
                } else {
                  Alert.alert('알림', '파싱할 URL이 없습니다.');
                }
              }}
              variant="outline"
              size="small"
            />
          </View>
          {parsedURL ? (
            <View
              style={[
                styles.resultBox,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.codeText}
              >
                {parsedURL}
              </TextBox>
            </View>
          ) : null}
          <View style={styles.codeBox}>
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {`const parsed = Linking.parse('monymony://workout/today?date=2024-01-15');
// 결과:
// {
//   scheme: 'monymony',
//   hostname: null,
//   path: 'workout/today',
//   queryParams: { date: '2024-01-15' }
// }`}
            </TextBox>
          </View>
        </View>

        {/* Linking.createURL 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            12. Linking.createURL
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            내 앱으로 돌아오는 URL 생성 (환경에 따라 자동 변환)
          </TextBox>
          <CustomButton
            title="URL 생성 테스트"
            onPress={handleCreateURL}
            variant="outline"
            size="small"
            style={styles.toggleButton}
          />
          {createdURL ? (
            <View
              style={[
                styles.resultBox,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <TextBox
                variant="body4"
                color={theme.primary}
                style={styles.codeText}
              >
                {createdURL}
              </TextBox>
            </View>
          ) : null}
          <View style={styles.codeBox}>
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {`const url = Linking.createURL('workout/today', {
  queryParams: { date: '2024-01-15' }
});
// Production: monymony://workout/today?date=2024-01-15
// Expo Go: exp://127.0.0.1:8081/--/workout/today?date=2024-01-15`}
            </TextBox>
          </View>
        </View>

        {/* In-app Browser 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            13. In-app Browser (expo-web-browser)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            앱 내에서 웹 페이지 열기 (인증, 보안 목적에 유용)
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="Expo.dev 열기"
              onPress={async () => {
                try {
                  await WebBrowser.openBrowserAsync('https://expo.dev');
                } catch (error) {
                  Alert.alert('오류', `브라우저 열기 실패: ${error}`);
                }
              }}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="React Native 열기"
              onPress={async () => {
                try {
                  await WebBrowser.openBrowserAsync('https://reactnative.dev');
                } catch (error) {
                  Alert.alert('오류', `브라우저 열기 실패: ${error}`);
                }
              }}
              variant="outline"
              size="small"
            />
          </View>
          <View style={styles.codeBox}>
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {`import * as WebBrowser from 'expo-web-browser';

await WebBrowser.openBrowserAsync('https://expo.dev');`}
            </TextBox>
          </View>
        </View>

        {/* 주요 메소드 요약 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📌 주요 메소드 요약
          </TextBox>
          <View style={styles.methodContainer}>
            <View style={styles.methodItem}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.methodName}
              >
                addEventListener('url', handler)
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                앱 실행 중 들어오는 Deep Link 처리
              </TextBox>
            </View>
            <View style={styles.methodItem}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.methodName}
              >
                getInitialURL()
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                앱이 Deep Link로 실행된 경우 URL 반환
              </TextBox>
            </View>
            <View style={styles.methodItem}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.methodName}
              >
                canOpenURL(url)
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                해당 URL을 열 수 있는 앱이 있는지 확인
              </TextBox>
            </View>
            <View style={styles.methodItem}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.methodName}
              >
                openSettings()
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                앱 설정 화면 열기
              </TextBox>
            </View>
            <View style={styles.methodItem}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.methodName}
              >
                openURL(url)
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                해당 URL을 여는 기능 (메일, 문자, 전화, 웹 등)
              </TextBox>
            </View>
            {Platform.OS === 'android' && (
              <View style={styles.methodItem}>
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.methodName}
                >
                  sendIntent(action, extras?)
                </TextBox>
                <TextBox variant="body4" color={theme.textSecondary}>
                  직접 Android Intent 실행 (Android 전용)
                </TextBox>
              </View>
            )}
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
              • iOS 9+에서는 canOpenURL 사용 시 Info.plist에
              LSApplicationQueriesSchemes 등록 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android 11+에서는 manifest에 &lt;queries&gt; 태그 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Deep Link 활성화를 위해서는 Native 코드 설정 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Expo Managed 사용자는 Expo Linking 문서 참고 필요
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
    gap: 20,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
    marginTop: 4,
  },
  infoContainer: {
    gap: 8,
  },
  infoItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  toggleButton: {
    alignSelf: 'flex-start',
  },
  codeItem: {
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  resultBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  codeText: {
    fontFamily: 'monospace',
  },
  warning: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  comparisonContainer: {
    gap: 12,
  },
  comparisonItem: {
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  comparisonTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  comparisonText: {
    marginLeft: 8,
    lineHeight: 20,
  },
  codeBox: {
    padding: 16,
    borderRadius: 8,
  },
  methodContainer: {
    gap: 12,
  },
  methodItem: {
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  methodName: {
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  warningContainer: {
    gap: 8,
  },
  warningItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
  inputBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});
