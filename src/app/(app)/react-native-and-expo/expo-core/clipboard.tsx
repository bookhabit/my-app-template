import { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Image,
  Platform,
  Alert,
} from 'react-native';

import * as Clipboard from 'expo-clipboard';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function ClipboardScreen() {
  const { theme } = useTheme();

  // Text clipboard
  const [textInput, setTextInput] = useState('복사할 텍스트를 입력하세요');
  const [clipboardText, setClipboardText] = useState<string>('');
  const [hasText, setHasText] = useState<boolean | null>(null);

  // Image clipboard
  const [clipboardImage, setClipboardImage] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState<boolean | null>(null);

  // URL clipboard
  const [urlInput, setUrlInput] = useState('https://expo.dev');
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const [hasUrl, setHasUrl] = useState<boolean | null>(null);

  // Clipboard listener
  const [listenerActive, setListenerActive] = useState(false);
  const [lastClipboardEvent, setLastClipboardEvent] = useState<string>('');
  const clipboardSubscriptionRef = useRef<Clipboard.Subscription | null>(null);

  // Paste button (iOS 16+)
  const [isPasteButtonAvailable, setIsPasteButtonAvailable] = useState(false);
  const [pasteButtonData, setPasteButtonData] = useState<any>(null);

  useEffect(() => {
    checkPasteButtonAvailability();
    checkClipboardContent();

    // Cleanup listener on unmount
    return () => {
      if (clipboardSubscriptionRef.current) {
        Clipboard.removeClipboardListener(clipboardSubscriptionRef.current);
        clipboardSubscriptionRef.current = null;
      }
    };
  }, []);

  const checkPasteButtonAvailability = () => {
    const available = Clipboard.isPasteButtonAvailable;
    setIsPasteButtonAvailable(available);
  };

  const checkClipboardContent = async () => {
    try {
      const [hasTextResult, hasImageResult] = await Promise.all([
        Clipboard.hasStringAsync(),
        Clipboard.hasImageAsync(),
      ]);

      setHasText(hasTextResult);
      setHasImage(hasImageResult);

      // hasUrlAsync는 iOS에서만 지원됨
      if (Platform.OS === 'ios') {
        try {
          const hasUrlResult = await Clipboard.hasUrlAsync();
          setHasUrl(hasUrlResult);
        } catch (error) {
          console.warn('hasUrlAsync error:', error);
          setHasUrl(null);
        }
      } else {
        setHasUrl(null); // Android에서는 지원되지 않음
      }
    } catch (error) {
      console.error('Failed to check clipboard content:', error);
    }
  };

  const copyText = async () => {
    try {
      const success = await Clipboard.setStringAsync(textInput, {
        inputFormat: Clipboard.StringFormat.PLAIN_TEXT,
      });
      if (success) {
        Alert.alert('성공', '텍스트가 클립보드에 복사되었습니다.');
        await checkClipboardContent();
      }
    } catch (error) {
      Alert.alert('오류', `텍스트 복사 실패: ${error}`);
    }
  };

  const pasteText = async () => {
    try {
      const text = await Clipboard.getStringAsync({
        preferredFormat: Clipboard.StringFormat.PLAIN_TEXT,
      });
      setClipboardText(text);
      Alert.alert('성공', '클립보드에서 텍스트를 가져왔습니다.');
      await checkClipboardContent();
    } catch (error) {
      Alert.alert('오류', `텍스트 붙여넣기 실패: ${error}`);
    }
  };

  const copyUrl = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('알림', 'URL 클립보드는 iOS에서만 지원됩니다.');
      return;
    }

    try {
      await Clipboard.setUrlAsync(urlInput);
      Alert.alert('성공', 'URL이 클립보드에 복사되었습니다.');
      await checkClipboardContent();
    } catch (error) {
      Alert.alert('오류', `URL 복사 실패: ${error}`);
    }
  };

  const pasteUrl = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('알림', 'URL 클립보드는 iOS에서만 지원됩니다.');
      return;
    }

    try {
      const url = await Clipboard.getUrlAsync();
      setClipboardUrl(url);
      if (url) {
        Alert.alert('성공', '클립보드에서 URL을 가져왔습니다.');
      } else {
        Alert.alert('알림', '클립보드에 URL이 없습니다.');
      }
      await checkClipboardContent();
    } catch (error) {
      Alert.alert('오류', `URL 붙여넣기 실패: ${error}`);
    }
  };

  const copyImage = async () => {
    try {
      // 예제: base64 이미지 (실제로는 ImagePicker 등에서 가져온 이미지 사용)
      // 여기서는 예제용으로 간단한 1x1 PNG 이미지 사용
      const base64Image =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      await Clipboard.setImageAsync(base64Image);
      Alert.alert('성공', '이미지가 클립보드에 복사되었습니다.');
      await checkClipboardContent();
    } catch (error) {
      Alert.alert('오류', `이미지 복사 실패: ${error}`);
    }
  };

  const pasteImage = async () => {
    try {
      const image = await Clipboard.getImageAsync({
        format: 'png',
        jpegQuality: 1,
      });
      if (image) {
        setClipboardImage(image.data);
        Alert.alert('성공', '클립보드에서 이미지를 가져왔습니다.');
      } else {
        Alert.alert('알림', '클립보드에 이미지가 없습니다.');
        setClipboardImage(null);
      }
      await checkClipboardContent();
    } catch (error) {
      Alert.alert('오류', `이미지 붙여넣기 실패: ${error}`);
    }
  };

  const toggleClipboardListener = () => {
    if (listenerActive) {
      // 리스너 제거
      if (clipboardSubscriptionRef.current) {
        Clipboard.removeClipboardListener(clipboardSubscriptionRef.current);
        clipboardSubscriptionRef.current = null;
      }
      setListenerActive(false);
      setLastClipboardEvent('');
    } else {
      // 리스너 추가
      const subscription = Clipboard.addClipboardListener((event) => {
        const contentTypes = event.contentTypes
          .map((type) => {
            switch (type) {
              case Clipboard.ContentType.PLAIN_TEXT:
                return '텍스트';
              case Clipboard.ContentType.HTML:
                return 'HTML';
              case Clipboard.ContentType.IMAGE:
                return '이미지';
              case Clipboard.ContentType.URL:
                return 'URL';
              default:
                return type;
            }
          })
          .join(', ');

        setLastClipboardEvent(
          `클립보드 변경됨: ${contentTypes} (${new Date().toLocaleTimeString()})`
        );
      });
      clipboardSubscriptionRef.current = subscription;
      setListenerActive(true);
    }
  };

  const handlePasteButtonPress = (data: any) => {
    setPasteButtonData(data);
    if (data.type === 'text') {
      setClipboardText(data.text);
      Alert.alert('붙여넣기', `텍스트: ${data.text}`);
    } else if (data.type === 'image') {
      setClipboardImage(data.data);
      Alert.alert('붙여넣기', '이미지가 붙여넣어졌습니다.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Clipboard" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Clipboard
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          클립보드 읽기/쓰기 기능
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
              Clipboard API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 클립보드에서 텍스트, 이미지, URL 읽기/쓰기
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 클립보드 내용 변경 감지 (리스너)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • iOS 16+: ClipboardPasteButton 컴포넌트 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 웹: AsyncClipboard API 사용 (브라우저 지원 필요)
            </TextBox>
          </View>
        </View>

        {/* 클립보드 상태 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📊 클립보드 상태
          </TextBox>

          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                텍스트 있음:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  hasText === true
                    ? theme.success
                    : hasText === false
                      ? theme.error
                      : theme.textSecondary
                }
              >
                {hasText === true
                  ? '✅ 있음'
                  : hasText === false
                    ? '❌ 없음'
                    : '확인 중...'}
              </TextBox>
            </View>

            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                이미지 있음:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  hasImage === true
                    ? theme.success
                    : hasImage === false
                      ? theme.error
                      : theme.textSecondary
                }
              >
                {hasImage === true
                  ? '✅ 있음'
                  : hasImage === false
                    ? '❌ 없음'
                    : '확인 중...'}
              </TextBox>
            </View>

            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                URL 있음:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  Platform.OS === 'ios'
                    ? hasUrl === true
                      ? theme.success
                      : hasUrl === false
                        ? theme.error
                        : theme.textSecondary
                    : theme.textSecondary
                }
              >
                {Platform.OS === 'ios'
                  ? hasUrl === true
                    ? '✅ 있음'
                    : hasUrl === false
                      ? '❌ 없음'
                      : '확인 중...'
                  : 'Android 미지원'}
              </TextBox>
            </View>

            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                Paste Button 사용 가능:
              </TextBox>
              <TextBox
                variant="body3"
                color={isPasteButtonAvailable ? theme.success : theme.error}
              >
                {isPasteButtonAvailable ? '✅ iOS 16+' : '❌ 사용 불가'}
              </TextBox>
            </View>

            <CustomButton
              title="클립보드 상태 확인"
              onPress={checkClipboardContent}
              style={styles.button}
            />
          </View>
        </View>

        {/* 텍스트 클립보드 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📝 텍스트 클립보드
          </TextBox>

          <View style={styles.inputContainer}>
            <TextBox variant="body3" color={theme.textSecondary}>
              복사할 텍스트:
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={textInput}
              onChangeText={setTextInput}
              multiline
            />
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="텍스트 복사"
              onPress={copyText}
              style={styles.button}
            />
            <CustomButton
              title="텍스트 붙여넣기"
              onPress={pasteText}
              variant="ghost"
              style={styles.button}
            />
          </View>

          {clipboardText && (
            <View style={styles.resultContainer}>
              <TextBox variant="body3" color={theme.text}>
                붙여넣은 텍스트:
              </TextBox>
              <View
                style={[
                  styles.textResult,
                  { backgroundColor: theme.background },
                ]}
              >
                <TextBox variant="body4" color={theme.text}>
                  {clipboardText}
                </TextBox>
              </View>
            </View>
          )}
        </View>

        {/* URL 클립보드 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🔗 URL 클립보드
          </TextBox>

          <View style={styles.inputContainer}>
            <TextBox variant="body3" color={theme.textSecondary}>
              복사할 URL:
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={urlInput}
              onChangeText={setUrlInput}
              keyboardType="url"
            />
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="URL 복사"
              onPress={copyUrl}
              style={styles.button}
            />
            <CustomButton
              title="URL 붙여넣기"
              onPress={pasteUrl}
              variant="ghost"
              style={styles.button}
            />
          </View>

          {clipboardUrl && (
            <View style={styles.resultContainer}>
              <TextBox variant="body3" color={theme.text}>
                붙여넣은 URL:
              </TextBox>
              <View
                style={[
                  styles.textResult,
                  { backgroundColor: theme.background },
                ]}
              >
                <TextBox variant="body4" color={theme.primary}>
                  {clipboardUrl}
                </TextBox>
              </View>
            </View>
          )}
        </View>

        {/* 이미지 클립보드 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🖼️ 이미지 클립보드
          </TextBox>

          <View style={styles.buttonRow}>
            <CustomButton
              title="이미지 복사 (예제)"
              onPress={copyImage}
              style={styles.button}
            />
            <CustomButton
              title="이미지 붙여넣기"
              onPress={pasteImage}
              variant="ghost"
              style={styles.button}
            />
          </View>

          {clipboardImage && (
            <View style={styles.resultContainer}>
              <TextBox variant="body3" color={theme.text}>
                붙여넣은 이미지:
              </TextBox>
              <Image
                source={{ uri: clipboardImage }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        {/* 클립보드 리스너 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            👂 클립보드 리스너
          </TextBox>

          <View style={styles.buttonRow}>
            <CustomButton
              title={listenerActive ? '리스너 중지' : '리스너 시작'}
              onPress={toggleClipboardListener}
              variant={listenerActive ? 'ghost' : 'primary'}
              style={styles.button}
            />
          </View>

          {listenerActive && (
            <View style={styles.infoContainer}>
              <TextBox variant="body3" color={theme.text}>
                리스너 활성화됨 (웹에서는 동작하지 않음)
              </TextBox>
            </View>
          )}

          {lastClipboardEvent && (
            <View style={styles.resultContainer}>
              <TextBox variant="body3" color={theme.text}>
                마지막 이벤트:
              </TextBox>
              <View
                style={[
                  styles.textResult,
                  { backgroundColor: theme.background },
                ]}
              >
                <TextBox variant="body4" color={theme.text}>
                  {lastClipboardEvent}
                </TextBox>
              </View>
            </View>
          )}
        </View>

        {/* Paste Button (iOS 16+) */}
        {isPasteButtonAvailable && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📋 Paste Button (iOS 16+)
            </TextBox>

            <View style={styles.pasteButtonContainer}>
              <Clipboard.ClipboardPasteButton
                style={styles.pasteButton}
                onPress={handlePasteButtonPress}
                acceptedContentTypes={['plain-text', 'image']}
                backgroundColor={theme.primary}
                foregroundColor="white"
                cornerStyle="capsule"
                displayMode="iconAndLabel"
              />
            </View>

            <TextBox variant="body4" color={theme.textSecondary}>
              위 버튼을 눌러 클립보드에서 텍스트나 이미지를 붙여넣을 수
              있습니다.
            </TextBox>

            {pasteButtonData && (
              <View style={styles.resultContainer}>
                <TextBox variant="body3" color={theme.text}>
                  붙여넣기 결과:
                </TextBox>
                <View
                  style={[
                    styles.textResult,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <TextBox variant="body4" color={theme.text}>
                    타입: {pasteButtonData.type}
                  </TextBox>
                  {pasteButtonData.type === 'text' && (
                    <TextBox variant="body4" color={theme.text}>
                      텍스트: {pasteButtonData.text}
                    </TextBox>
                  )}
                </View>
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
              {`// 1. 텍스트 복사/붙여넣기
import * as Clipboard from 'expo-clipboard';

// 복사
await Clipboard.setStringAsync('Hello World', {
  inputFormat: Clipboard.StringFormat.PLAIN_TEXT,
});

// 붙여넣기
const text = await Clipboard.getStringAsync({
  preferredFormat: Clipboard.StringFormat.PLAIN_TEXT,
});

// 2. URL 복사/붙여넣기
await Clipboard.setUrlAsync('https://expo.dev');
const url = await Clipboard.getUrlAsync();

// 3. 이미지 복사/붙여넣기
await Clipboard.setImageAsync(base64Image);
const image = await Clipboard.getImageAsync({
  format: 'png',
  jpegQuality: 1,
});

// 4. 클립보드 내용 확인
const hasText = await Clipboard.hasStringAsync();
const hasImage = await Clipboard.hasImageAsync();
const hasUrl = await Clipboard.hasUrlAsync();

// 5. 클립보드 리스너
const subscription = Clipboard.addClipboardListener((event) => {
  console.log('Content types:', event.contentTypes);
  // event.contentTypes: ['plain-text', 'image', 'url', 'html']
});

// 리스너 제거
Clipboard.removeClipboardListener(subscription);

// 6. Paste Button (iOS 16+)
import { ClipboardPasteButton } from 'expo-clipboard';

if (Clipboard.isPasteButtonAvailable) {
  <ClipboardPasteButton
    style={{ width: 200, height: 44 }}
    onPress={(data) => {
      if (data.type === 'text') {
        console.log('Text:', data.text);
      } else if (data.type === 'image') {
        console.log('Image:', data.data);
      }
    }}
    acceptedContentTypes={['plain-text', 'image']}
    backgroundColor="#4630EB"
    foregroundColor="white"
    cornerStyle="capsule"
    displayMode="iconAndLabel"
  />
}`}
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
              • 웹: AsyncClipboard API 사용 (브라우저 지원 필요)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 웹: 클립보드 접근 시 권한 요청 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 클립보드 리스너는 웹에서 동작하지 않음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Paste Button은 iOS 16+에서만 사용 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 이미지는 base64 문자열로 저장/로드
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • setStringAsync는 웹에서 boolean 반환, 네이티브에서는 항상 true
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
  inputContainer: {
    gap: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 44,
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
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  infoContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  pasteButtonContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  pasteButton: {
    width: 200,
    height: 44,
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
