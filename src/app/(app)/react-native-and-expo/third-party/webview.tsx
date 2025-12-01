import { useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

// Note: Requires native build - run: cd ios && pod install && cd .. && npx expo run:ios
let WebView: any;
try {
  WebView = require('react-native-webview').WebView;
} catch (e) {
  console.warn('WebView native module not linked');
  WebView = null;
}

const sampleUrls = [
  'https://expo.dev',
  'https://reactnative.dev',
  'https://docs.expo.dev',
  'https://github.com',
];

export default function WebViewScreen() {
  const { theme } = useTheme();

  // State
  const [url, setUrl] = useState('https://expo.dev');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [injectedJavaScript, setInjectedJavaScript] = useState('');
  const [javaScriptEnabled, setJavaScriptEnabled] = useState(true);
  const [domStorageEnabled, setDomStorageEnabled] = useState(true);
  const [scalesPageToFit, setScalesPageToFit] = useState(true);

  const webViewRef = useRef<any>(null);

  const goBack = () => {
    webViewRef.current?.goBack();
  };

  const goForward = () => {
    webViewRef.current?.goForward();
  };

  const reload = () => {
    webViewRef.current?.reload();
  };

  const stopLoading = () => {
    webViewRef.current?.stopLoading();
  };

  const injectJavaScript = () => {
    if (!injectedJavaScript.trim()) {
      Alert.alert('알림', 'JavaScript 코드를 입력하세요.');
      return;
    }

    webViewRef.current?.injectJavaScript(injectedJavaScript);
    Alert.alert('성공', 'JavaScript가 주입되었습니다.');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="WebView" showBackButton />
      {/* URL 입력 */}
      <View style={[styles.urlSection, { borderBottomColor: theme.border }]}>
        <TextInput
          style={[
            styles.urlInput,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          value={url}
          onChangeText={setUrl}
          placeholder="https://expo.dev"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <View style={styles.urlButtons}>
          {sampleUrls.map((sampleUrl) => (
            <CustomButton
              key={sampleUrl}
              title={sampleUrl.replace('https://', '')}
              onPress={() => setUrl(sampleUrl)}
              style={[styles.urlButton, styles.flex1]}
              variant={url === sampleUrl ? 'primary' : 'ghost'}
            />
          ))}
        </View>
      </View>

      {/* 웹뷰 */}
      <View style={styles.webViewContainer}>
        {WebView ? (
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webView}
            onNavigationStateChange={(navState: any) => {
              setCanGoBack(navState.canGoBack);
              setCanGoForward(navState.canGoForward);
              setTitle(navState.title);
            }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={(syntheticEvent: any) => {
              const { nativeEvent } = syntheticEvent;
              Alert.alert(
                '오류',
                `로드 실패: ${nativeEvent.description || nativeEvent.message}`
              );
            }}
            javaScriptEnabled={javaScriptEnabled}
            domStorageEnabled={domStorageEnabled}
            scalesPageToFit={scalesPageToFit}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <TextBox variant="body2" color={theme.text}>
                  로딩 중...
                </TextBox>
              </View>
            )}
          />
        ) : (
          <View
            style={[
              styles.webView,
              { justifyContent: 'center', alignItems: 'center' },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              WebView 네이티브 모듈이 링크되지 않았습니다.
            </TextBox>
            <TextBox
              variant="body3"
              color={theme.textSecondary}
              style={{ marginTop: 8 }}
            >
              네이티브 빌드가 필요합니다: cd ios && pod install
            </TextBox>
          </View>
        )}
      </View>

      {/* 컨트롤 */}
      <View style={[styles.controlsSection, { borderTopColor: theme.border }]}>
        <View style={styles.controlRow}>
          <CustomButton
            title="◀ 뒤로"
            onPress={goBack}
            style={[styles.controlButton, styles.flex1]}
            disabled={!canGoBack || !WebView}
            variant="ghost"
          />
          <CustomButton
            title="앞으로 ▶"
            onPress={goForward}
            style={[styles.controlButton, styles.flex1]}
            disabled={!canGoForward || !WebView}
            variant="ghost"
          />
          <CustomButton
            title="새로고침"
            onPress={reload}
            style={[styles.controlButton, styles.flex1]}
            disabled={!WebView}
            variant="ghost"
          />
          <CustomButton
            title="중지"
            onPress={stopLoading}
            style={[styles.controlButton, styles.flex1]}
            disabled={!loading || !WebView}
            variant="ghost"
          />
        </View>
        {title && (
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.title}
          >
            {title}
          </TextBox>
        )}
      </View>

      {/* 옵션 - 별도 스크롤뷰로 분리 */}
      <ScrollView
        style={[styles.optionsSection, { borderTopColor: theme.border }]}
        contentContainerStyle={styles.optionsContent}
      >
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            옵션
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title={javaScriptEnabled ? 'JavaScript ON' : 'JavaScript OFF'}
              onPress={() => setJavaScriptEnabled(!javaScriptEnabled)}
              style={[styles.button, styles.flex1]}
              variant={javaScriptEnabled ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={domStorageEnabled ? 'DOM Storage ON' : 'DOM Storage OFF'}
              onPress={() => setDomStorageEnabled(!domStorageEnabled)}
              style={[styles.button, styles.flex1]}
              variant={domStorageEnabled ? 'primary' : 'ghost'}
            />
            {Platform.OS === 'ios' && (
              <CustomButton
                title={scalesPageToFit ? 'Scale to Fit ON' : 'Scale to Fit OFF'}
                onPress={() => setScalesPageToFit(!scalesPageToFit)}
                style={[styles.button, styles.flex1]}
                variant={scalesPageToFit ? 'primary' : 'ghost'}
              />
            )}
          </View>
        </View>

        {/* JavaScript 주입 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            JavaScript 주입
          </TextBox>
          <TextInput
            style={[
              styles.jsInput,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={injectedJavaScript}
            onChangeText={setInjectedJavaScript}
            placeholder="alert('Hello from WebView!');"
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={3}
          />
          <CustomButton
            title="JavaScript 실행"
            onPress={injectJavaScript}
            style={styles.button}
          />
        </View>

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
              • WebView는 웹 콘텐츠를 표시합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • onNavigationStateChange로 네비게이션 상태를 추적할 수 있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • injectJavaScript로 JavaScript를 주입할 수 있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • javaScriptEnabled로 JavaScript 실행을 제어할 수 있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • iOS와 Android 모두에서 동작합니다.
            </TextBox>
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
  urlSection: {
    padding: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  urlInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  urlButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  urlButton: {
    minWidth: '20%',
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsSection: {
    padding: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    minWidth: '20%',
  },
  title: {
    textAlign: 'center',
    marginTop: 8,
  },
  optionsSection: {
    maxHeight: 180,
    borderTopWidth: 1,
  },
  optionsContent: {
    padding: 12,
    gap: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
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
  jsInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 80,
    textAlignVertical: 'top',
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
