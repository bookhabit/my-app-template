import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';

import Constants from 'expo-constants';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function ConstantsScreen() {
  const { theme } = useTheme();

  const [webViewUserAgent, setWebViewUserAgent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWebViewUserAgent();
  }, []);

  const loadWebViewUserAgent = async () => {
    if (typeof Constants.getWebViewUserAgentAsync === 'function') {
      setLoading(true);
      try {
        const userAgent = await Constants.getWebViewUserAgentAsync();
        setWebViewUserAgent(userAgent);
      } catch (error) {
        console.error('Failed to get web view user agent:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getExecutionEnvironmentText = () => {
    const env = Constants.executionEnvironment;
    // ExecutionEnvironment enum은 직접 접근 불가하므로 문자열로 비교

    if (env === 'bare') {
      return 'Bare (네이티브 앱)';
    } else if (env === 'standalone') {
      return 'Standalone (독립 앱)';
    } else if (env === 'storeClient') {
      return 'Store Client (스토어 앱)';
    }
    return env || '알 수 없음';
  };

  const getAppOwnershipText = () => {
    if (Constants.appOwnership === null) return 'null (Bare 워크플로우)';
    // AppOwnership enum은 직접 접근 불가하므로 문자열로 비교
    if (Constants.appOwnership === 'expo') {
      return 'Expo (Expo Go)';
    }
    return Constants.appOwnership;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Constants" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Constants
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          앱 설치 기간 동안 변하지 않는 시스템 정보
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
              Constants API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 앱 설치 기간 동안 변하지 않는 시스템 정보 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 실행 환경, 앱 설정, 플랫폼 정보 등
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • expoConfig: app.json/app.config.js 설정 정보
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • executionEnvironment: 실행 환경 (Bare, Standalone, StoreClient)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 일부 속성은 deprecated (expo-device로 이동)
            </TextBox>
          </View>
        </View>

        {/* 실행 환경 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🚀 실행 환경
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                Execution Environment:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {getExecutionEnvironmentText()}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                App Ownership:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {getAppOwnershipText()}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                Debug Mode:
              </TextBox>
              <TextBox
                variant="body3"
                color={Constants.debugMode ? theme.warning : theme.success}
              >
                {Constants.debugMode ? '✅ 활성화' : '❌ 비활성화'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                Is Headless:
              </TextBox>
              <TextBox
                variant="body3"
                color={Constants.isHeadless ? theme.warning : theme.success}
              >
                {Constants.isHeadless ? '✅ 예' : '❌ 아니오'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                Session ID:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                {Constants.sessionId}
              </TextBox>
            </View>
          </View>
        </View>

        {/* 앱 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📱 앱 정보
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                Expo Version:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {Constants.expoVersion || 'null'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                Expo Runtime Version:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {Constants.expoRuntimeVersion || 'null'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                Experience URL:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                {Constants.experienceUrl || 'null'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                Linking URI:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                {Constants.linkingUri || 'null'}
              </TextBox>
            </View>

            {Constants.intentUri && (
              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  Intent URI:
                </TextBox>
                <TextBox variant="body4" color={theme.textSecondary}>
                  {Constants.intentUri}
                </TextBox>
              </View>
            )}
          </View>
        </View>

        {/* 플랫폼 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💻 플랫폼 정보
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                Platform:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {Platform.OS}
              </TextBox>
            </View>

            {Constants.platform && (
              <>
                {Platform.OS === 'ios' && Constants.platform.ios && (
                  <>
                    <View style={styles.infoRow}>
                      <TextBox variant="body3" color={theme.textSecondary}>
                        iOS Build Number:
                      </TextBox>
                      <TextBox variant="body3" color={theme.text}>
                        {Constants.platform.ios.buildNumber || 'null'}
                      </TextBox>
                    </View>
                    <View style={styles.infoRow}>
                      <TextBox variant="body3" color={theme.textSecondary}>
                        iOS System Version:
                      </TextBox>
                      <TextBox variant="body3" color={theme.text}>
                        {Constants.platform.ios.systemVersion || 'null'}
                      </TextBox>
                    </View>
                    <View style={styles.infoRow}>
                      <TextBox variant="body3" color={theme.textSecondary}>
                        iOS Platform:
                      </TextBox>
                      <TextBox variant="body3" color={theme.text}>
                        {Constants.platform.ios.platform || 'null'}
                      </TextBox>
                    </View>
                    <View style={styles.infoRow}>
                      <TextBox variant="body3" color={theme.textSecondary}>
                        iOS Model:
                      </TextBox>
                      <TextBox variant="body3" color={theme.text}>
                        {Constants.platform.ios.model || 'null'}
                      </TextBox>
                    </View>
                    <View style={styles.infoRow}>
                      <TextBox variant="body3" color={theme.textSecondary}>
                        iOS User Interface Idiom:
                      </TextBox>
                      <TextBox variant="body3" color={theme.text}>
                        {Constants.platform.ios.userInterfaceIdiom || 'null'}
                      </TextBox>
                    </View>
                  </>
                )}

                {Platform.OS === 'android' && Constants.platform.android && (
                  <>
                    <View style={styles.infoRow}>
                      <TextBox variant="body3" color={theme.textSecondary}>
                        Android Version Code:
                      </TextBox>
                      <TextBox variant="body3" color={theme.text}>
                        {Constants.platform.android.versionCode || 'null'}
                      </TextBox>
                    </View>
                  </>
                )}
              </>
            )}

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                Status Bar Height:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {Constants.statusBarHeight}px
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                System Fonts:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                {Constants.systemFonts.length > 0
                  ? `${Constants.systemFonts.length}개`
                  : '없음'}
              </TextBox>
            </View>

            {Constants.systemFonts.length > 0 && (
              <View style={styles.fontList}>
                {Constants.systemFonts.slice(0, 10).map((font, index) => (
                  <TextBox
                    key={index}
                    variant="body4"
                    color={theme.textSecondary}
                  >
                    • {font}
                  </TextBox>
                ))}
                {Constants.systemFonts.length > 10 && (
                  <TextBox variant="body4" color={theme.textSecondary}>
                    ... 외 {Constants.systemFonts.length - 10}개
                  </TextBox>
                )}
              </View>
            )}
          </View>
        </View>

        {/* WebView User Agent */}
        {typeof Constants.getWebViewUserAgentAsync === 'function' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              🌐 WebView User Agent
            </TextBox>

            <CustomButton
              title="User Agent 가져오기"
              onPress={loadWebViewUserAgent}
              style={styles.button}
              disabled={loading}
            />

            {webViewUserAgent && (
              <View style={styles.resultContainer}>
                <TextBox variant="body3" color={theme.text}>
                  User Agent:
                </TextBox>
                <View
                  style={[
                    styles.textResult,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <TextBox variant="body4" color={theme.textSecondary}>
                    {webViewUserAgent}
                  </TextBox>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Expo Config */}
        {Constants.expoConfig && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              ⚙️ Expo Config
            </TextBox>

            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  App Name:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {Constants.expoConfig.name || 'null'}
                </TextBox>
              </View>

              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  App Version:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {Constants.expoConfig.version || 'null'}
                </TextBox>
              </View>

              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  App Slug:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {Constants.expoConfig.slug || 'null'}
                </TextBox>
              </View>

              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  SDK Version:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {Constants.expoConfig.sdkVersion || 'null'}
                </TextBox>
              </View>

              {Platform.OS === 'ios' && Constants.expoConfig.ios && (
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    iOS Bundle Identifier:
                  </TextBox>
                  <TextBox variant="body4" color={theme.textSecondary}>
                    {Constants.expoConfig.ios.bundleIdentifier || 'null'}
                  </TextBox>
                </View>
              )}

              {Platform.OS === 'android' && Constants.expoConfig.android && (
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Android Package:
                  </TextBox>
                  <TextBox variant="body4" color={theme.textSecondary}>
                    {Constants.expoConfig.android.package || 'null'}
                  </TextBox>
                </View>
              )}
            </View>
          </View>
        )}

        {/* EAS Config */}
        {Constants.easConfig && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              ☁️ EAS Config
            </TextBox>

            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  Project ID:
                </TextBox>
                <TextBox variant="body4" color={theme.textSecondary}>
                  {Constants.easConfig.projectId || 'null'}
                </TextBox>
              </View>
            </View>
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
              {`// 1. 기본 사용
import Constants from 'expo-constants';

// 실행 환경 확인
const env = Constants.executionEnvironment;
// Constants.ExecutionEnvironment.Bare
// Constants.ExecutionEnvironment.Standalone
// Constants.ExecutionEnvironment.StoreClient

// 2. 앱 정보
const expoVersion = Constants.expoVersion; // Expo Go 버전
const runtimeVersion = Constants.expoRuntimeVersion;
const sessionId = Constants.sessionId; // 세션 고유 ID

// 3. 디버그 모드 확인
if (Constants.debugMode) {
  console.log('Debug mode is enabled');
}

// 4. 플랫폼 정보
const statusBarHeight = Constants.statusBarHeight;
const systemFonts = Constants.systemFonts; // 시스템 폰트 목록

// 5. Expo Config (app.json/app.config.js)
const appName = Constants.expoConfig?.name;
const appVersion = Constants.expoConfig?.version;
const bundleId = Constants.expoConfig?.ios?.bundleIdentifier;
const packageName = Constants.expoConfig?.android?.package;

// 6. WebView User Agent
const userAgent = await Constants.getWebViewUserAgentAsync();

// 7. 플랫폼별 정보
if (Constants.platform?.ios) {
  const buildNumber = Constants.platform.ios.buildNumber;
  const systemVersion = Constants.platform.ios.systemVersion;
  const model = Constants.platform.ios.model;
}

if (Constants.platform?.android) {
  const versionCode = Constants.platform.android.versionCode;
}

// 8. EAS Config
if (Constants.easConfig) {
  const projectId = Constants.easConfig.projectId;
}

// 9. Deprecated 속성 (expo-device로 이동 권장)
// Constants.deviceName -> Device.deviceName
// Constants.deviceYearClass -> Device.deviceYearClass
// Constants.platform.ios.model -> Device.modelName
// Constants.platform.ios.systemVersion -> Device.osVersion`}
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
              • 일부 속성은 deprecated (expo-device로 이동)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • expoConfig는 null일 수 있음 (Expo Go에서)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • sessionId는 앱 실행마다 변경됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • statusBarHeight는 기본값 (위치 추적/전화 중 변경 반영 안됨)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • getWebViewUserAgentAsync는 비동기 함수
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • executionEnvironment는 AppOwnership보다 권장됨
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
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  fontList: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 4,
  },
  button: {
    minWidth: 100,
  },
  resultContainer: {
    marginTop: 12,
    gap: 8,
  },
  textResult: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
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
