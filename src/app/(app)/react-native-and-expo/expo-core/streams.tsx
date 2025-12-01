import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function StreamsScreen() {
  const { theme } = useTheme();
  const [readableResult, setReadableResult] = useState<{
    values: string[];
    error: string | null;
  }>({
    values: [],
    error: null,
  });
  const [writableResult, setWritableResult] = useState<{
    written: string[];
    error: string | null;
  }>({
    written: [],
    error: null,
  });
  const [transformResult, setTransformResult] = useState<{
    transformed: string[];
    error: string | null;
  }>({
    transformed: [],
    error: null,
  });

  const testReadableStream = async () => {
    try {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue('Hello');
          controller.enqueue('World');
          controller.close();
        },
      });

      const reader = stream.getReader();
      const values: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          values.push(value);
        }
      }

      setReadableResult({ values, error: null });
    } catch (error) {
      setReadableResult({
        values: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testWritableStream = async () => {
    try {
      const written: string[] = [];

      const stream = new WritableStream({
        write(chunk) {
          written.push(chunk);
        },
        close() {
          // 스트림이 닫힐 때
        },
      });

      const writer = stream.getWriter();
      await writer.write('Hello');
      await writer.write('World');
      await writer.close();

      setWritableResult({ written, error: null });
    } catch (error) {
      setWritableResult({
        written: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testTransformStream = async () => {
    try {
      // 대문자로 변환하는 TransformStream
      const transform = new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(chunk.toUpperCase());
        },
      });

      const readable = new ReadableStream({
        start(controller) {
          controller.enqueue('hello');
          controller.enqueue('world');
          controller.close();
        },
      });

      const reader = readable.pipeThrough(transform).getReader();
      const transformed: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          transformed.push(value);
        }
      }

      setTransformResult({ transformed, error: null });
    } catch (error) {
      setTransformResult({
        transformed: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Streams API" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Streams API
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          ReadableStream / WritableStream / TransformStream 테스트
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
              ReadableStream (읽기 스트림)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 데이터를 읽을 수 있는 스트림
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `controller.enqueue()`로 데이터를 추가
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `getReader()`로 reader를 얻어서 데이터를 읽음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 예: 파일 읽기, 네트워크 응답
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              WritableStream (쓰기 스트림)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 데이터를 쓸 수 있는 스트림
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `getWriter()`로 writer를 얻어서 데이터를 작성
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `write()` 메서드로 데이터를 전송
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 예: 파일 쓰기, 네트워크 요청
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              TransformStream (변환 스트림)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 데이터를 변환하면서 전달하는 스트림
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `transform()` 메서드에서 데이터를 변환
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `pipeThrough()`로 스트림을 연결
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 예: 인코딩/디코딩, 데이터 변환
            </TextBox>
          </View>
        </View>

        {/* ReadableStream 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. ReadableStream 테스트
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            "Hello"와 "World"를 순차적으로 읽어옵니다.
          </TextBox>

          <CustomButton
            title="ReadableStream 테스트"
            onPress={testReadableStream}
            style={styles.button}
          />

          {readableResult.values.length > 0 && (
            <View
              style={[styles.resultContainer, { borderColor: theme.success }]}
            >
              <TextBox
                variant="body2"
                color={theme.success}
                style={styles.resultTitle}
              >
                ✅ 읽은 값들
              </TextBox>
              {readableResult.values.map((value, index) => (
                <TextBox
                  key={index}
                  variant="body3"
                  color={theme.text}
                  style={styles.resultItem}
                >
                  {index + 1}. "{value}"
                </TextBox>
              ))}
            </View>
          )}

          {readableResult.error && (
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
                {readableResult.error}
              </TextBox>
            </View>
          )}
        </View>

        {/* WritableStream 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. WritableStream 테스트
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            "Hello"와 "World"를 스트림에 작성합니다.
          </TextBox>

          <CustomButton
            title="WritableStream 테스트"
            onPress={testWritableStream}
            style={styles.button}
          />

          {writableResult.written.length > 0 && (
            <View
              style={[styles.resultContainer, { borderColor: theme.success }]}
            >
              <TextBox
                variant="body2"
                color={theme.success}
                style={styles.resultTitle}
              >
                ✅ 작성된 값들
              </TextBox>
              {writableResult.written.map((value, index) => (
                <TextBox
                  key={index}
                  variant="body3"
                  color={theme.text}
                  style={styles.resultItem}
                >
                  {index + 1}. "{value}"
                </TextBox>
              ))}
            </View>
          )}

          {writableResult.error && (
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
                {writableResult.error}
              </TextBox>
            </View>
          )}
        </View>

        {/* TransformStream 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            3. TransformStream 테스트
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            "hello"와 "world"를 대문자로 변환합니다.
          </TextBox>

          <CustomButton
            title="TransformStream 테스트"
            onPress={testTransformStream}
            style={styles.button}
          />

          {transformResult.transformed.length > 0 && (
            <View
              style={[styles.resultContainer, { borderColor: theme.success }]}
            >
              <TextBox
                variant="body2"
                color={theme.success}
                style={styles.resultTitle}
              >
                ✅ 변환된 값들
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.resultItem}
              >
                원본: "hello", "world"
              </TextBox>
              {transformResult.transformed.map((value, index) => (
                <TextBox
                  key={index}
                  variant="body3"
                  color={theme.text}
                  style={styles.resultItem}
                >
                  변환: "{value}"
                </TextBox>
              ))}
            </View>
          )}

          {transformResult.error && (
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
                {transformResult.error}
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
              {`// 1. ReadableStream
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue('Hello');
    controller.enqueue('World');
    controller.close();
  },
});

const reader = stream.getReader();
reader.read().then(({ done, value }) => {
  console.log(value); // "Hello"
});
reader.read().then(({ done, value }) => {
  console.log(value); // "World"
});

// 2. WritableStream
const writable = new WritableStream({
  write(chunk) {
    console.log('Written:', chunk);
  },
});

const writer = writable.getWriter();
await writer.write('Hello');
await writer.write('World');
await writer.close();

// 3. TransformStream
const transform = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase());
  },
});

const readable = new ReadableStream({
  start(controller) {
    controller.enqueue('hello');
    controller.close();
  },
});

// 스트림 연결
const reader = readable.pipeThrough(transform).getReader();
const { value } = await reader.read();
console.log(value); // "HELLO"`}
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
