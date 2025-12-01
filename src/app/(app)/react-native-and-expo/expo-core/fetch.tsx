import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { fetch } from 'expo/fetch';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function FetchScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    bufferLength: number | null;
    error: string | null;
    chunks: number;
  }>({
    bufferLength: null,
    error: null,
    chunks: 0,
  });

  const testStreamingFetch = async () => {
    setLoading(true);
    setResult({ bufferLength: null, error: null, chunks: 0 });

    try {
      const resp = await fetch(
        'https://httpbin.org/drip?numbytes=512&duration=2',
        {
          headers: { Accept: 'text/event-stream' },
        }
      );
      console.log(resp);

      if (!resp.body) {
        throw new Error('Response body is null');
      }

      const reader = resp.body.getReader();
      const chunks: Uint8Array[] = [];
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        if (value) {
          chunks.push(value);
          chunkCount++;
        }
      }

      const buffer = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );

      let offset = 0;
      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.length;
      }

      setResult({
        bufferLength: buffer.length,
        error: null,
        chunks: chunkCount,
      });
    } catch (error) {
      setResult({
        bufferLength: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        chunks: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="expo/fetch" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          expo/fetch
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          WinterCG 표준 Fetch API 테스트
        </TextBox>

        {/* 테스트 섹션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            스트리밍 Fetch 테스트
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            httpbin.org/drip 엔드포인트를 사용하여 스트리밍 응답을 받고 청크를
            읽어서 버퍼를 생성합니다.
          </TextBox>

          <CustomButton
            title={loading ? '테스트 중...' : '스트리밍 테스트 실행'}
            onPress={testStreamingFetch}
            disabled={loading}
            style={styles.button}
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.loadingText}
              >
                스트리밍 데이터 수신 중...
              </TextBox>
            </View>
          )}

          {result.bufferLength !== null && (
            <View
              style={[styles.resultContainer, { borderColor: theme.border }]}
            >
              <TextBox
                variant="body2"
                color={theme.success}
                style={styles.resultTitle}
              >
                ✅ 테스트 성공
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.resultItem}
              >
                버퍼 크기: {result.bufferLength} bytes
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.resultItem}
              >
                청크 개수: {result.chunks}
              </TextBox>
            </View>
          )}

          {result.error && (
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
                {result.error}
              </TextBox>
            </View>
          )}
        </View>

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
              1. 스트리밍 데이터 (Streaming Data)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 전체 데이터를 한 번에 받는 대신, 작은 조각(chunk)으로 나눠서
              순차적으로 받는 방식
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 큰 파일이나 실시간 데이터를 효율적으로 처리할 수 있음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 예: 동영상 스트리밍, 실시간 채팅, 파일 다운로드
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              2. Reader (읽기 객체)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 스트림에서 데이터를 읽는 도구
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `resp.body.getReader()`로 생성
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `reader.read()`로 한 번에 하나의 chunk를 읽음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • {'{ done, value }'} 형태로 반환 (done: 끝났는지, value: 데이터)
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              3. Chunk (청크)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 스트림에서 받은 데이터의 작은 조각
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `Uint8Array` 타입의 바이너리 데이터
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 네트워크 상황에 따라 크기가 다를 수 있음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 예: 512바이트 데이터를 10개 청크로 받을 수도, 1개로 받을 수도
              있음
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              4. Buffer (버퍼)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 여러 chunk를 하나로 합친 완전한 데이터
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `Uint8Array`로 생성하여 모든 chunk를 순서대로 합침
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 최종적으로 사용할 수 있는 완전한 데이터 형태
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 예: 10개 청크(각 50바이트) → 500바이트 버퍼
            </TextBox>
          </View>
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
              {`import { fetch } from 'expo/fetch';

// 1. 스트리밍 응답 받기
const resp = await fetch(
  'https://httpbin.org/drip?numbytes=512&duration=2',
  { headers: { Accept: 'text/event-stream' } }
);

// 2. Reader 생성 (스트림 읽기 도구)
const reader = resp.body.getReader();

// 3. Chunk 배열 (받은 조각들을 저장)
const chunks = [];

// 4. Chunk를 하나씩 읽어서 배열에 저장
while (true) {
  const { done, value } = await reader.read();
  if (done) break;  // 끝났으면 종료
  chunks.push(value);  // chunk 저장
}

// 5. Buffer 생성 (모든 chunk를 하나로 합침)
const buffer = new Uint8Array(
  chunks.reduce((acc, chunk) => acc + chunk.length, 0)
);

// 6. Chunk들을 Buffer에 복사
let offset = 0;
for (const chunk of chunks) {
  buffer.set(chunk, offset);
  offset += chunk.length;
}

console.log(buffer.length); // 512`}
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  loadingText: {
    marginLeft: 4,
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
