import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function URLScreen() {
  const { theme } = useTheme();
  const [urlResult, setUrlResult] = useState<{
    parts: Record<string, string> | null;
    error: string | null;
  }>({
    parts: null,
    error: null,
  });
  const [searchParamsResult, setSearchParamsResult] = useState<{
    params: Record<string, string> | null;
    stringified: string | null;
    error: string | null;
  }>({
    params: null,
    stringified: null,
    error: null,
  });
  const [combinedResult, setCombinedResult] = useState<{
    url: string | null;
    error: string | null;
  }>({
    url: null,
    error: null,
  });
  const [nonAsciiResult, setNonAsciiResult] = useState<{
    url: string | null;
    note: string | null;
  }>({
    url: null,
    note: null,
  });

  const testURL = () => {
    try {
      const url = new URL('https://expo.dev/path/to/page?query=value#hash');
      setUrlResult({
        parts: {
          href: url.href,
          protocol: url.protocol,
          host: url.host,
          hostname: url.hostname,
          port: url.port || '(없음)',
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
          origin: url.origin,
        },
        error: null,
      });
    } catch (error) {
      setUrlResult({
        parts: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testURLSearchParams = () => {
    try {
      const params = new URLSearchParams();
      params.append('name', 'John');
      params.append('age', '30');
      params.append('city', 'Seoul');
      params.set('age', '31'); // age를 31로 업데이트

      const paramsObj: Record<string, string> = {};
      params.forEach((value, key) => {
        paramsObj[key] = value;
      });

      setSearchParamsResult({
        params: paramsObj,
        stringified: params.toString(),
        error: null,
      });
    } catch (error) {
      setSearchParamsResult({
        params: null,
        stringified: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testCombined = () => {
    try {
      const url = new URL('https://expo.dev/search');
      const params = new URLSearchParams();
      params.append('q', 'react native');
      params.append('sort', 'date');
      url.search = params.toString();

      setCombinedResult({
        url: url.toString(),
        error: null,
      });
    } catch (error) {
      setCombinedResult({
        url: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testNonAscii = () => {
    try {
      const url = new URL('http://🥓');
      setNonAsciiResult({
        url: url.toString(),
        note: '네이티브 플랫폼에서는 Non-ASCII 문자가 그대로 표시됩니다. (Web/Node.js는 Punycode로 변환)',
      });
    } catch (error) {
      setNonAsciiResult({
        url: null,
        note: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="URL API" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          URL API
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          URL / URLSearchParams 테스트
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
              URL (Uniform Resource Locator)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • URL을 파싱하고 구성 요소에 접근할 수 있는 API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `protocol`, `host`, `pathname`, `search`, `hash` 등 접근 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 예: https://expo.dev/path?query=value#hash
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              URLSearchParams (쿼리 파라미터)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • URL의 쿼리 문자열을 쉽게 다룰 수 있는 API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `append()`, `set()`, `get()`, `delete()` 등 메서드 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 예: ?name=John&age=30
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.warning}
              style={styles.conceptTitle}
            >
              ⚠️ 제한사항
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 네이티브 플랫폼에서는 Non-ASCII 문자(이모지 등)를 호스트명에
              사용할 수 없음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Web/Node.js는 Punycode로 자동 변환하지만, 네이티브는 그대로 표시
            </TextBox>
          </View>
        </View>

        {/* URL 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. URL 파싱 테스트
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            URL을 파싱하여 각 구성 요소를 추출합니다.
          </TextBox>

          <CustomButton
            title="URL 파싱 테스트"
            onPress={testURL}
            style={styles.button}
          />

          {urlResult.parts && (
            <View
              style={[styles.resultContainer, { borderColor: theme.success }]}
            >
              <TextBox
                variant="body2"
                color={theme.success}
                style={styles.resultTitle}
              >
                ✅ URL 구성 요소
              </TextBox>
              {Object.entries(urlResult.parts).map(([key, value]) => (
                <TextBox
                  key={key}
                  variant="body3"
                  color={theme.text}
                  style={styles.resultItem}
                >
                  {key}: {value}
                </TextBox>
              ))}
            </View>
          )}

          {urlResult.error && (
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
                {urlResult.error}
              </TextBox>
            </View>
          )}
        </View>

        {/* URLSearchParams 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. URLSearchParams 테스트
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            쿼리 파라미터를 추가하고 조작합니다.
          </TextBox>

          <CustomButton
            title="URLSearchParams 테스트"
            onPress={testURLSearchParams}
            style={styles.button}
          />

          {searchParamsResult.params && (
            <View
              style={[styles.resultContainer, { borderColor: theme.success }]}
            >
              <TextBox
                variant="body2"
                color={theme.success}
                style={styles.resultTitle}
              >
                ✅ 쿼리 파라미터
              </TextBox>
              {Object.entries(searchParamsResult.params).map(([key, value]) => (
                <TextBox
                  key={key}
                  variant="body3"
                  color={theme.text}
                  style={styles.resultItem}
                >
                  {key}: {value}
                </TextBox>
              ))}
              <TextBox
                variant="body3"
                color={theme.text}
                style={[styles.resultItem, styles.resultItemHighlight]}
              >
                문자열: {searchParamsResult.stringified}
              </TextBox>
            </View>
          )}

          {searchParamsResult.error && (
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
                {searchParamsResult.error}
              </TextBox>
            </View>
          )}
        </View>

        {/* URL + URLSearchParams 조합 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            3. URL + URLSearchParams 조합
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            URL에 쿼리 파라미터를 추가합니다.
          </TextBox>

          <CustomButton
            title="URL + SearchParams 테스트"
            onPress={testCombined}
            style={styles.button}
          />

          {combinedResult.url && (
            <View
              style={[styles.resultContainer, { borderColor: theme.success }]}
            >
              <TextBox
                variant="body2"
                color={theme.success}
                style={styles.resultTitle}
              >
                ✅ 완성된 URL
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.resultItem}
              >
                {combinedResult.url}
              </TextBox>
            </View>
          )}

          {combinedResult.error && (
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
                {combinedResult.error}
              </TextBox>
            </View>
          )}
        </View>

        {/* Non-ASCII 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            4. Non-ASCII 문자 테스트 (제한사항)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            이모지가 포함된 호스트명을 테스트합니다.
          </TextBox>

          <CustomButton
            title="Non-ASCII 테스트"
            onPress={testNonAscii}
            style={styles.button}
          />

          {nonAsciiResult.url && (
            <View
              style={[styles.resultContainer, { borderColor: theme.warning }]}
            >
              <TextBox
                variant="body2"
                color={theme.warning}
                style={styles.resultTitle}
              >
                ⚠️ Non-ASCII URL
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.resultItem}
              >
                {nonAsciiResult.url}
              </TextBox>
              {nonAsciiResult.note && (
                <TextBox
                  variant="body4"
                  color={theme.textSecondary}
                  style={[styles.resultItem, styles.resultNote]}
                >
                  {nonAsciiResult.note}
                </TextBox>
              )}
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
              {`// 1. URL 기본 사용법
const url = new URL('https://expo.dev/path?query=value#hash');

console.log(url.protocol);  // "https:"
console.log(url.host);      // "expo.dev"
console.log(url.pathname);  // "/path"
console.log(url.search);    // "?query=value"
console.log(url.hash);      // "#hash"

// 2. URLSearchParams 기본 사용법
const params = new URLSearchParams();
params.append('name', 'John');
params.append('age', '30');
params.set('age', '31');  // 업데이트

console.log(params.toString());  // "name=John&age=31"
console.log(params.get('name')); // "John"

// 3. URL + URLSearchParams 조합
const url = new URL('https://expo.dev/search');
const params = new URLSearchParams();
params.append('q', 'react native');
url.search = params.toString();

console.log(url.toString());
// "https://expo.dev/search?q=react+native"

// 4. Non-ASCII 문자 (제한사항)
const url = new URL('http://🥓');
console.log(url.toString());
// 네이티브: "http://🥓/"
// Web/Node.js: "http://xn--pr9h/"`}
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
  resultItemHighlight: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  resultNote: {
    fontStyle: 'italic',
    marginTop: 8,
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
