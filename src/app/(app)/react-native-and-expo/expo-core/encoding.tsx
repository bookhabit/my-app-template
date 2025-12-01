import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function EncodingScreen() {
  const { theme } = useTheme();
  const [basicResult, setBasicResult] = useState<{
    encoded: number[] | null;
    decoded: string | null;
    error: string | null;
  }>({
    encoded: null,
    decoded: null,
    error: null,
  });
  const [streamResult, setStreamResult] = useState<{
    encoded: number[] | null;
    decoded: string | null;
    error: string | null;
  }>({
    encoded: null,
    decoded: null,
    error: null,
  });

  const testBasicEncoding = () => {
    try {
      const text = 'hello';
      const encoder = new TextEncoder();
      const encoded = encoder.encode(text);
      const decoder = new TextDecoder();
      const decoded = decoder.decode(encoded);

      setBasicResult({
        encoded: Array.from(encoded),
        decoded,
        error: null,
      });
    } catch (error) {
      setBasicResult({
        encoded: null,
        decoded: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testStreamEncoding = async () => {
    try {
      const encoder = new TextEncoderStream();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue('Hello');
          controller.enqueue('World');
          controller.close();
        },
      });

      const reader = stream.pipeThrough(encoder).getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
        }
      }

      // 모든 chunk를 하나의 배열로 합치기
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      // 디코딩
      const decoder = new TextDecoderStream();
      const decodedStream = new ReadableStream({
        start(controller) {
          controller.enqueue(combined);
          controller.close();
        },
      });

      const decodedReader = decodedStream.pipeThrough(decoder).getReader();
      let decodedText = '';
      while (true) {
        const { done, value } = await decodedReader.read();
        if (done) break;
        if (value) {
          decodedText += value;
        }
      }

      setStreamResult({
        encoded: Array.from(combined),
        decoded: decodedText,
        error: null,
      });
    } catch (error) {
      setStreamResult({
        encoded: null,
        decoded: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="TextEncoder / TextDecoder" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Encoding APIs
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          TextEncoder / TextDecoder 테스트
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
              TextEncoder (텍스트 인코더)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 문자열을 UTF-8 바이트 배열(Uint8Array)로 변환
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 네트워크 전송이나 파일 저장 시 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 예: "hello" → [104, 101, 108, 108, 111]
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              TextDecoder (텍스트 디코더)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 바이트 배열(Uint8Array)을 문자열로 변환
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 네트워크에서 받은 데이터나 파일을 읽을 때 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 예: [104, 101, 108, 108, 111] → "hello"
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.conceptText}
            >
              ⚠️ 네이티브 플랫폼에서는 UTF-8만 지원
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              Stream 버전 (TextEncoderStream / TextDecoderStream)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 큰 데이터를 메모리에 모두 로드하지 않고 스트림으로 처리
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `pipeThrough()`로 스트림을 연결하여 변환
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 실시간 데이터 처리에 유용
            </TextBox>
          </View>
        </View>

        {/* 기본 사용법 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. 기본 사용법 (TextEncoder / TextDecoder)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            문자열 "hello"를 인코딩하고 다시 디코딩합니다.
          </TextBox>

          <CustomButton
            title="기본 인코딩/디코딩 테스트"
            onPress={testBasicEncoding}
            style={styles.button}
          />

          {basicResult.encoded && (
            <View
              style={[styles.resultContainer, { borderColor: theme.success }]}
            >
              <TextBox
                variant="body2"
                color={theme.success}
                style={styles.resultTitle}
              >
                ✅ 인코딩 결과
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.resultItem}
              >
                원본: "hello"
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.resultItem}
              >
                인코딩: [{basicResult.encoded.join(', ')}]
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.resultItem}
              >
                디코딩: "{basicResult.decoded}"
              </TextBox>
            </View>
          )}

          {basicResult.error && (
            <View
              style={[styles.resultContainer, { borderColor: theme.error }]}
            >
              <TextBox
                variant="body2"
                color={theme.error}
                style={styles.resultTitle}
              >
                ❌ 오류 발생
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.resultItem}
              >
                {basicResult.error}
              </TextBox>
            </View>
          )}
        </View>

        {/* 스트림 사용법 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. 스트림 사용법 (TextEncoderStream / TextDecoderStream)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            "Hello"와 "World"를 스트림으로 인코딩하고 다시 디코딩합니다.
          </TextBox>

          <CustomButton
            title="스트림 인코딩/디코딩 테스트"
            onPress={testStreamEncoding}
            style={styles.button}
          />

          {streamResult.encoded && (
            <View
              style={[styles.resultContainer, { borderColor: theme.success }]}
            >
              <TextBox
                variant="body2"
                color={theme.success}
                style={styles.resultTitle}
              >
                ✅ 스트림 인코딩 결과
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.resultItem}
              >
                원본: "Hello" + "World"
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.resultItem}
              >
                인코딩: [{streamResult.encoded.join(', ')}]
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.resultItem}
              >
                디코딩: "{streamResult.decoded}"
              </TextBox>
            </View>
          )}

          {streamResult.error && (
            <View
              style={[styles.resultContainer, { borderColor: theme.error }]}
            >
              <TextBox
                variant="body2"
                color={theme.error}
                style={styles.resultTitle}
              >
                ❌ 오류 발생
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.resultItem}
              >
                {streamResult.error}
              </TextBox>
            </View>
          )}
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
              {`// 1. 기본 사용법
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// 문자열 → 바이트 배열
const encoded = encoder.encode('hello');
// [104, 101, 108, 108, 111]

// 바이트 배열 → 문자열
const decoded = decoder.decode(encoded);
// "hello"

// 2. 스트림 사용법
const encoder = new TextEncoderStream();
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue('Hello');
    controller.enqueue('World');
    controller.close();
  },
});

// 스트림을 인코더로 연결
const reader = stream.pipeThrough(encoder).getReader();

// 인코딩된 데이터 읽기
reader.read().then(({ done, value }) => {
  console.log(value); // Uint8Array [72, 101, 108, 108, 111]
});`}
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
  description: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  resultContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  resultTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  resultItem: {
    marginLeft: 4,
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
});
