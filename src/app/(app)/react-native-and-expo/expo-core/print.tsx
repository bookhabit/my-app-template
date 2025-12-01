import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

const DEFAULT_HTML = `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        text-align: center;
      }
      h1 {
        font-size: 50px;
        font-weight: normal;
        color: #333;
      }
      p {
        font-size: 18px;
        line-height: 1.6;
        color: #666;
      }
      @page {
        margin: 20px;
      }
    </style>
  </head>
  <body>
    <h1>Hello Expo Print!</h1>
    <p>This is a sample HTML document for printing.</p>
    <p>You can customize the HTML content and print it to a printer or save it as a PDF file.</p>
  </body>
</html>
`;

export default function PrintScreen() {
  const { theme } = useTheme();

  // State
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [selectedPrinter, setSelectedPrinter] = useState<Print.Printer | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [lastPrintResult, setLastPrintResult] = useState<string>('');

  // Print options
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );
  const [width, setWidth] = useState('612');
  const [height, setHeight] = useState('792');
  const [marginTop, setMarginTop] = useState('0');
  const [marginBottom, setMarginBottom] = useState('0');
  const [marginLeft, setMarginLeft] = useState('0');
  const [marginRight, setMarginRight] = useState('0');
  const [useMarkupFormatter, setUseMarkupFormatter] = useState(false);
  const [textZoom, setTextZoom] = useState('100');
  const [includeBase64, setIncludeBase64] = useState(false);

  const print = async () => {
    if (!html.trim()) {
      Alert.alert('알림', 'HTML 내용을 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      const options: Print.PrintOptions = {
        html,
        orientation:
          orientation === 'portrait'
            ? Print.Orientation.portrait
            : Print.Orientation.landscape,
        width: parseInt(width) || undefined,
        height: parseInt(height) || undefined,
        printerUrl: selectedPrinter?.url,
        useMarkupFormatter:
          Platform.OS === 'ios' ? useMarkupFormatter : undefined,
        margins:
          Platform.OS === 'ios'
            ? {
                top: parseInt(marginTop) || 0,
                bottom: parseInt(marginBottom) || 0,
                left: parseInt(marginLeft) || 0,
                right: parseInt(marginRight) || 0,
              }
            : undefined,
      };

      await Print.printAsync(options);
      setLastPrintResult('인쇄가 시작되었습니다.');
      Alert.alert('성공', '인쇄가 시작되었습니다.');
    } catch (error: any) {
      const errorMsg = `인쇄 실패: ${error.message || error}`;
      setLastPrintResult(errorMsg);
      Alert.alert('오류', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const printToFile = async () => {
    if (!html.trim()) {
      Alert.alert('알림', 'HTML 내용을 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      const options: Print.FilePrintOptions = {
        html,
        width: parseInt(width) || undefined,
        height: parseInt(height) || undefined,
        base64: includeBase64,
        textZoom:
          Platform.OS === 'android' ? parseInt(textZoom) || 100 : undefined,
        useMarkupFormatter:
          Platform.OS === 'ios' ? useMarkupFormatter : undefined,
        margins:
          Platform.OS === 'ios'
            ? {
                top: parseInt(marginTop) || 0,
                bottom: parseInt(marginBottom) || 0,
                left: parseInt(marginLeft) || 0,
                right: parseInt(marginRight) || 0,
              }
            : undefined,
      };

      const result = await Print.printToFileAsync(options);
      setLastPrintResult(
        `PDF 파일이 생성되었습니다:\nURI: ${result.uri}\n페이지 수: ${result.numberOfPages}`
      );
      Alert.alert(
        '성공',
        `PDF 파일이 생성되었습니다.\n페이지 수: ${result.numberOfPages}`
      );

      // 파일 공유
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
        });
      }
    } catch (error: any) {
      const errorMsg = `PDF 생성 실패: ${error.message || error}`;
      setLastPrintResult(errorMsg);
      Alert.alert('오류', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const selectPrinter = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('알림', '프린터 선택은 iOS에서만 사용할 수 있습니다.');
      return;
    }

    try {
      setLoading(true);
      const printer = await Print.selectPrinterAsync();
      setSelectedPrinter(printer);
      Alert.alert('성공', `프린터 선택: ${printer.name}`);
    } catch (error: any) {
      Alert.alert('오류', `프린터 선택 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
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
      <CustomHeader title="Print" showBackButton />
      <View style={styles.content}>
        {/* 개념 설명 */}
        <View style={styles.section}>
          <TextBox
            variant="title2"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Print란?
          </TextBox>
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.description}
          >
            expo-print는 Android와 iOS (AirPrint)에서 인쇄 기능을 제공하는
            라이브러리입니다. HTML을 프린터로 인쇄하거나 PDF 파일로 저장할 수
            있습니다.
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
              • HTML을 프린터로 인쇄
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • HTML을 PDF 파일로 저장
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • iOS: 프린터 선택 기능 (AirPrint)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • iOS: HTML에서 로컬 이미지 URL 미지원 (base64 인코딩 필요)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android: @page 스타일로 페이지 여백 설정
            </TextBox>
          </View>
        </View>

        {/* HTML 입력 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            HTML 내용
          </TextBox>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={html}
            onChangeText={setHtml}
            placeholder="HTML 내용을 입력하세요"
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={15}
            textAlignVertical="top"
          />
          <CustomButton
            title="기본 HTML로 재설정"
            onPress={() => setHtml(DEFAULT_HTML)}
            style={styles.button}
            variant="ghost"
          />
        </View>

        {/* 인쇄 옵션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            인쇄 옵션
          </TextBox>

          <View style={styles.optionsRow}>
            <CustomButton
              title="세로"
              onPress={() => setOrientation('portrait')}
              style={[styles.button, styles.flex1]}
              variant={orientation === 'portrait' ? 'primary' : 'ghost'}
            />
            <CustomButton
              title="가로"
              onPress={() => setOrientation('landscape')}
              style={[styles.button, styles.flex1]}
              variant={orientation === 'landscape' ? 'primary' : 'ghost'}
            />
          </View>

          <View style={styles.optionsRow}>
            <View style={styles.flex1}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                너비 (픽셀)
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
                value={width}
                onChangeText={setWidth}
                placeholder="612"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex1}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                높이 (픽셀)
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
                value={height}
                onChangeText={setHeight}
                placeholder="792"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          {Platform.OS === 'ios' && (
            <>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                페이지 여백 (iOS)
              </TextBox>
              <View style={styles.marginRow}>
                <View style={styles.flex1}>
                  <TextBox
                    variant="body4"
                    color={theme.textSecondary}
                    style={styles.label}
                  >
                    상단
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
                    value={marginTop}
                    onChangeText={setMarginTop}
                    placeholder="0"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <TextBox
                    variant="body4"
                    color={theme.textSecondary}
                    style={styles.label}
                  >
                    하단
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
                    value={marginBottom}
                    onChangeText={setMarginBottom}
                    placeholder="0"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <TextBox
                    variant="body4"
                    color={theme.textSecondary}
                    style={styles.label}
                  >
                    좌측
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
                    value={marginLeft}
                    onChangeText={setMarginLeft}
                    placeholder="0"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <TextBox
                    variant="body4"
                    color={theme.textSecondary}
                    style={styles.label}
                  >
                    우측
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
                    value={marginRight}
                    onChangeText={setMarginRight}
                    placeholder="0"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </>
          )}

          {Platform.OS === 'android' && (
            <View style={styles.inputGroup}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                텍스트 줌 (%)
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
                value={textZoom}
                onChangeText={setTextZoom}
                placeholder="100"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>
          )}

          {Platform.OS === 'ios' && (
            <View
              style={[
                styles.checkboxContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <CustomButton
                title={
                  useMarkupFormatter
                    ? 'Markup Formatter 사용'
                    : 'WebView 사용 (기본)'
                }
                onPress={() => setUseMarkupFormatter(!useMarkupFormatter)}
                style={styles.button}
                variant={useMarkupFormatter ? 'primary' : 'ghost'}
              />
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.hint}
              >
                Markup Formatter: 이미지를 표시하지 않지만 더 빠릅니다.
              </TextBox>
            </View>
          )}

          <View
            style={[
              styles.checkboxContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <CustomButton
              title={includeBase64 ? 'Base64 포함' : 'Base64 미포함'}
              onPress={() => setIncludeBase64(!includeBase64)}
              style={styles.button}
              variant={includeBase64 ? 'primary' : 'ghost'}
            />
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.hint}
            >
              Base64: PDF 파일에 base64 인코딩된 문자열 포함
              (printToFileAsync만)
            </TextBox>
          </View>
        </View>

        {/* 프린터 선택 (iOS만) */}
        {Platform.OS === 'ios' && (
          <View style={styles.section}>
            <TextBox
              variant="title3"
              color={theme.text}
              style={styles.sectionTitle}
            >
              프린터 선택 (iOS)
            </TextBox>
            <CustomButton
              title="프린터 선택"
              onPress={selectPrinter}
              style={styles.button}
              disabled={loading}
            />
            {selectedPrinter && (
              <View
                style={[
                  styles.infoBox,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <TextBox variant="body2" color={theme.text}>
                  선택된 프린터: {selectedPrinter.name}
                </TextBox>
                <TextBox
                  variant="body4"
                  color={theme.textSecondary}
                  style={styles.marginTop}
                >
                  URL: {selectedPrinter.url}
                </TextBox>
              </View>
            )}
          </View>
        )}

        {/* 인쇄 버튼 */}
        <View style={styles.section}>
          <View style={styles.optionsRow}>
            <CustomButton
              title="인쇄하기"
              onPress={print}
              style={[styles.button, styles.flex1]}
              disabled={loading}
            />
            <CustomButton
              title="PDF로 저장"
              onPress={printToFile}
              style={[styles.button, styles.flex1]}
              disabled={loading}
            />
          </View>
        </View>

        {/* 결과 */}
        {lastPrintResult && (
          <View style={styles.section}>
            <TextBox
              variant="title3"
              color={theme.text}
              style={styles.sectionTitle}
            >
              마지막 결과
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
                style={styles.codeText}
              >
                {lastPrintResult}
              </TextBox>
            </View>
          </View>
        )}

        {/* 코드 예제 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            코드 예제
          </TextBox>
          <View
            style={[
              styles.codeBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.codeText}
            >
              {`import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const html = \`
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <h1>Hello Expo!</h1>
  </body>
</html>
\`;

// 프린터로 인쇄
await Print.printAsync({
  html,
  orientation: Print.Orientation.portrait,
  printerUrl: selectedPrinter?.url, // iOS only
});

// PDF 파일로 저장
const { uri, numberOfPages } = await Print.printToFileAsync({
  html,
  base64: true,
  margins: { // iOS only
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
  },
});

// 파일 공유
if (await Sharing.isAvailableAsync()) {
  await Sharing.shareAsync(uri, {
    UTI: '.pdf',
    mimeType: 'application/pdf',
  });
}

// 프린터 선택 (iOS only)
const printer = await Print.selectPrinterAsync();
console.log('Selected:', printer.name);`}
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
  description: {
    lineHeight: 20,
    marginBottom: 12,
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
  textArea: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    minHeight: 200,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  marginRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  inputGroup: {
    gap: 8,
  },
  checkboxContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  button: {
    marginTop: 8,
  },
  marginTop: {
    marginTop: 8,
  },
  codeBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  codeText: {
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});
