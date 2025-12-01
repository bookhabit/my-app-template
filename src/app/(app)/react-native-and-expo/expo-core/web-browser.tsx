import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Platform,
  Linking,
} from 'react-native';

import * as WebBrowser from 'expo-web-browser';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

const sampleUrls = [
  'https://expo.dev',
  'https://reactnative.dev',
  'https://docs.expo.dev',
  'https://github.com',
];

export default function WebBrowserScreen() {
  const { theme } = useTheme();

  // State
  const [url, setUrl] = useState('https://expo.dev');
  const [lastResult, setLastResult] = useState<string>('');

  // Options
  const [toolbarColor, setToolbarColor] = useState('#ffffff');
  const [controlsColor, setControlsColor] = useState('#000000');
  const [showTitle, setShowTitle] = useState(true);
  const [enableBarCollapsing, setEnableBarCollapsing] = useState(false);
  const [showInRecents, setShowInRecents] = useState(false);
  const [enableDefaultShare, setEnableDefaultShare] = useState(false);
  const [dismissButtonStyle, setDismissButtonStyle] = useState<
    'cancel' | 'close' | 'done'
  >('cancel');
  const [presentationStyle, setPresentationStyle] =
    useState<WebBrowser.WebBrowserPresentationStyle>(
      WebBrowser.WebBrowserPresentationStyle.AUTOMATIC
    );
  const [readerMode, setReaderMode] = useState(false);
  const [ephemeralWebSession, setEphemeralWebSession] = useState(false);

  const openBrowser = async () => {
    if (!url.trim()) {
      Alert.alert('알림', 'URL을 입력하세요.');
      return;
    }

    try {
      const options: WebBrowser.WebBrowserOpenOptions = {
        toolbarColor,
        controlsColor,
        showTitle,
        enableBarCollapsing,
        showInRecents,
        enableDefaultShareMenuItem: enableDefaultShare,
        dismissButtonStyle,
        presentationStyle,
        readerMode,
      };

      const result = await WebBrowser.openBrowserAsync(url, options);
      setLastResult(`타입: ${result.type}`);
    } catch (error: any) {
      Alert.alert('오류', `브라우저 열기 실패: ${error.message || error}`);
      setLastResult(`오류: ${error.message || error}`);
    }
  };

  const openAuthSession = async () => {
    if (!url.trim()) {
      Alert.alert('알림', 'URL을 입력하세요.');
      return;
    }

    try {
      const options: WebBrowser.AuthSessionOpenOptions = {
        toolbarColor,
        controlsColor,
        showTitle,
        enableBarCollapsing,
        showInRecents,
        enableDefaultShareMenuItem: enableDefaultShare,
        dismissButtonStyle,
        presentationStyle,
        readerMode,
        preferEphemeralSession: ephemeralWebSession,
      };

      const result = await WebBrowser.openAuthSessionAsync(url, null, options);
      if (result.type === 'success' && 'url' in result) {
        setLastResult(`타입: ${result.type}, URL: ${result.url}`);
      } else {
        setLastResult(`타입: ${result.type}`);
      }
    } catch (error: any) {
      Alert.alert('오류', `인증 세션 열기 실패: ${error.message || error}`);
      setLastResult(`오류: ${error.message || error}`);
    }
  };

  const warmUpAsync = async () => {
    try {
      await WebBrowser.warmUpAsync();
      Alert.alert('성공', '브라우저가 준비되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `준비 실패: ${error.message || error}`);
    }
  };

  const coolDownAsync = async () => {
    try {
      await WebBrowser.coolDownAsync();
      Alert.alert('성공', '브라우저가 정리되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `정리 실패: ${error.message || error}`);
    }
  };

  const mayInitWithUrlAsync = async () => {
    if (!url.trim()) {
      Alert.alert('알림', 'URL을 입력하세요.');
      return;
    }

    try {
      const result = await WebBrowser.mayInitWithUrlAsync(url);
      Alert.alert('결과', `초기화 가능: ${result ? '예' : '아니오'}`);
    } catch (error: any) {
      Alert.alert('오류', `초기화 확인 실패: ${error.message || error}`);
    }
  };

  const dismissBrowser = async () => {
    try {
      await WebBrowser.dismissBrowser();
      Alert.alert('성공', '브라우저가 닫혔습니다.');
    } catch (error: any) {
      Alert.alert('오류', `브라우저 닫기 실패: ${error.message || error}`);
    }
  };

  const dismissAuthSession = async () => {
    try {
      await WebBrowser.dismissAuthSession();
      Alert.alert('성공', '인증 세션이 닫혔습니다.');
    } catch (error: any) {
      Alert.alert('오류', `인증 세션 닫기 실패: ${error.message || error}`);
    }
  };

  const openURL = async () => {
    if (!url.trim()) {
      Alert.alert('알림', 'URL을 입력하세요.');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        setLastResult('외부 브라우저로 열림');
      } else {
        Alert.alert('알림', '이 URL을 열 수 없습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', `URL 열기 실패: ${error.message || error}`);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="WebBrowser" showBackButton />
      <View style={styles.content}>
        {/* URL 입력 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            URL 입력
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              URL
            </TextBox>
            <TextInput
              style={[
                styles.textInput,
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
          </View>
          <View style={styles.buttonRow}>
            {sampleUrls.map((sampleUrl) => (
              <CustomButton
                key={sampleUrl}
                title={sampleUrl.replace('https://', '')}
                onPress={() => setUrl(sampleUrl)}
                style={[styles.button, styles.flex1]}
                variant={url === sampleUrl ? 'primary' : 'ghost'}
              />
            ))}
          </View>
        </View>

        {/* 브라우저 열기 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            브라우저 열기
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="브라우저 열기"
              onPress={openBrowser}
              style={[styles.button, styles.flex1]}
            />
            <CustomButton
              title="인증 세션 열기"
              onPress={openAuthSession}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
            <CustomButton
              title="외부 브라우저 열기"
              onPress={openURL}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
          </View>
          {lastResult && (
            <View
              style={[
                styles.resultBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextBox variant="body2" color={theme.text}>
                결과:
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.primary}
                style={styles.marginTop}
              >
                {lastResult}
              </TextBox>
            </View>
          )}
        </View>

        {/* 옵션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            옵션
          </TextBox>
          <View style={styles.optionsRow}>
            <View style={styles.optionItem}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                Toolbar Color
              </TextBox>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={toolbarColor}
                onChangeText={setToolbarColor}
                placeholder="#ffffff"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            <View style={styles.optionItem}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                Controls Color
              </TextBox>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={controlsColor}
                onChangeText={setControlsColor}
                placeholder="#000000"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>
          <View style={styles.optionsGrid}>
            <CustomButton
              title={showTitle ? '제목 표시 ON' : '제목 표시 OFF'}
              onPress={() => setShowTitle(!showTitle)}
              style={styles.button}
              variant={showTitle ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={enableBarCollapsing ? '바 접기 ON' : '바 접기 OFF'}
              onPress={() => setEnableBarCollapsing(!enableBarCollapsing)}
              style={styles.button}
              variant={enableBarCollapsing ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={showInRecents ? '최근 항목 표시 ON' : '최근 항목 표시 OFF'}
              onPress={() => setShowInRecents(!showInRecents)}
              style={styles.button}
              variant={showInRecents ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={enableDefaultShare ? '기본 공유 ON' : '기본 공유 OFF'}
              onPress={() => setEnableDefaultShare(!enableDefaultShare)}
              style={styles.button}
              variant={enableDefaultShare ? 'primary' : 'ghost'}
            />
            {Platform.OS === 'ios' && (
              <>
                <CustomButton
                  title={readerMode ? 'Reader Mode ON' : 'Reader Mode OFF'}
                  onPress={() => setReaderMode(!readerMode)}
                  style={styles.button}
                  variant={readerMode ? 'primary' : 'ghost'}
                />
                <CustomButton
                  title={ephemeralWebSession ? '임시 세션 ON' : '임시 세션 OFF'}
                  onPress={() => setEphemeralWebSession(!ephemeralWebSession)}
                  style={styles.button}
                  variant={ephemeralWebSession ? 'primary' : 'ghost'}
                />
              </>
            )}
          </View>
          {Platform.OS === 'ios' && (
            <>
              <View style={styles.inputGroup}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  Dismiss Button Style
                </TextBox>
                <View style={styles.buttonRow}>
                  {(['cancel', 'close', 'done'] as const).map((style) => (
                    <CustomButton
                      key={style}
                      title={style}
                      onPress={() => setDismissButtonStyle(style)}
                      style={[styles.button, styles.flex1]}
                      variant={
                        dismissButtonStyle === style ? 'primary' : 'ghost'
                      }
                    />
                  ))}
                </View>
              </View>
              <View style={styles.inputGroup}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  Presentation Style
                </TextBox>
                <View style={styles.buttonRow}>
                  {[
                    {
                      label: 'automatic',
                      value: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
                    },
                    {
                      label: 'fullScreen',
                      value: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                    },
                    {
                      label: 'pageSheet',
                      value: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
                    },
                    {
                      label: 'formSheet',
                      value: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
                    },
                    {
                      label: 'overFullScreen',
                      value:
                        WebBrowser.WebBrowserPresentationStyle.OVER_FULL_SCREEN,
                    },
                  ].map(({ label, value }) => (
                    <CustomButton
                      key={label}
                      title={label}
                      onPress={() => setPresentationStyle(value)}
                      style={[styles.button, styles.flex1]}
                      variant={
                        presentationStyle === value ? 'primary' : 'ghost'
                      }
                    />
                  ))}
                </View>
              </View>
            </>
          )}
        </View>

        {/* 유틸리티 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            유틸리티
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="브라우저 준비"
              onPress={warmUpAsync}
              style={[styles.button, styles.flex1]}
            />
            <CustomButton
              title="브라우저 정리"
              onPress={coolDownAsync}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
            <CustomButton
              title="초기화 가능 확인"
              onPress={mayInitWithUrlAsync}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
            <CustomButton
              title="브라우저 닫기"
              onPress={dismissBrowser}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
            <CustomButton
              title="인증 세션 닫기"
              onPress={dismissAuthSession}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
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
  inputGroup: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionItem: {
    flex: 1,
    gap: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  resultBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  marginTop: {
    marginTop: 8,
  },
});
