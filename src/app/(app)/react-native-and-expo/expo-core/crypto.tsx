import { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';

import * as Crypto from 'expo-crypto';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function CryptoScreen() {
  const { theme } = useTheme();

  // Input state
  const [inputText, setInputText] = useState('Hello World');
  const [byteCount, setByteCount] = useState(16);

  // Results
  const [hashResults, setHashResults] = useState<Record<string, string>>({});
  const [uuid, setUuid] = useState<string>('');
  const [randomBytes, setRandomBytes] = useState<Uint8Array | null>(null);
  const [randomBytesAsync, setRandomBytesAsync] = useState<Uint8Array | null>(
    null
  );
  const [randomValues, setRandomValues] = useState<Uint8Array | null>(null);
  const [digestResult, setDigestResult] = useState<string>('');

  const generateHash = async (algorithm: Crypto.CryptoDigestAlgorithm) => {
    try {
      const hexDigest = await Crypto.digestStringAsync(algorithm, inputText, {
        encoding: Crypto.CryptoEncoding.HEX,
      });
      const base64Digest = await Crypto.digestStringAsync(
        algorithm,
        inputText,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );

      setHashResults((prev) => ({
        ...prev,
        [algorithm]: `HEX: ${hexDigest}\nBASE64: ${base64Digest}`,
      }));
    } catch (error: any) {
      console.error(`${algorithm} 해시 생성 실패:`, error);
      const errorMessage = error?.message || String(error) || '알 수 없는 오류';
      setHashResults((prev) => ({
        ...prev,
        [algorithm]: `❌ 오류: ${errorMessage}`,
      }));
    }
  };

  const generateAllHashes = async () => {
    // MD2, MD4는 Android에서 지원되지 않을 수 있으므로 제외
    const algorithms = [
      Crypto.CryptoDigestAlgorithm.MD5,
      Crypto.CryptoDigestAlgorithm.SHA1,
      Crypto.CryptoDigestAlgorithm.SHA256,
      Crypto.CryptoDigestAlgorithm.SHA384,
      Crypto.CryptoDigestAlgorithm.SHA512,
    ];

    setHashResults({});
    for (const algorithm of algorithms) {
      await generateHash(algorithm);
    }
  };

  const generateUUID = () => {
    const newUuid = Crypto.randomUUID();
    setUuid(newUuid);
  };

  const generateRandomBytes = () => {
    try {
      const bytes = Crypto.getRandomBytes(byteCount);
      setRandomBytes(bytes);
    } catch (error) {
      Alert.alert('오류', `랜덤 바이트 생성 실패: ${error}`);
    }
  };

  const generateRandomBytesAsync = async () => {
    try {
      const bytes = await Crypto.getRandomBytesAsync(byteCount);
      setRandomBytesAsync(bytes);
    } catch (error) {
      Alert.alert('오류', `랜덤 바이트 생성 실패: ${error}`);
    }
  };

  const generateRandomValues = () => {
    try {
      const array = new Uint8Array(byteCount);
      Crypto.getRandomValues(array);
      setRandomValues(array);
    } catch (error) {
      Alert.alert('오류', `랜덤 값 생성 실패: ${error}`);
    }
  };

  const testDigest = async () => {
    try {
      const array = new Uint8Array(new TextEncoder().encode(inputText));
      const digest = await Crypto.digest(
        Crypto.CryptoDigestAlgorithm.SHA256,
        array
      );
      const hexString = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      setDigestResult(hexString);
    } catch (error) {
      Alert.alert('오류', `Digest 생성 실패: ${error}`);
    }
  };

  const formatBytes = (bytes: Uint8Array) => {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ');
  };

  const formatBytesDecimal = (bytes: Uint8Array) => {
    return Array.from(bytes).join(', ');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Crypto" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Crypto
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          암호화 해시 생성 및 랜덤 값 생성
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
              Crypto API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 암호화 해시 함수 제공 (SHA, MD 계열)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 네이티브 구현으로 빠른 속도
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • UUID 생성 (V4, RFC4122)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 암호학적으로 안전한 랜덤 값 생성
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 브라우저 Crypto API 호환
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • ⚠️ 양방향 암호화(AES)는 제공하지 않음
            </TextBox>
          </View>
        </View>

        {/* 해시 생성 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🔐 해시 생성
          </TextBox>

          <View style={styles.inputContainer}>
            <TextBox variant="body3" color={theme.textSecondary}>
              입력 텍스트:
            </TextBox>
            <View
              style={[styles.textInput, { backgroundColor: theme.background }]}
            >
              <TextBox variant="body3" color={theme.text}>
                {inputText}
              </TextBox>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="전체 해시 생성"
              onPress={generateAllHashes}
              style={styles.button}
            />
          </View>

          <View style={styles.algorithmGrid}>
            {[
              {
                name: 'MD2',
                algo: Crypto.CryptoDigestAlgorithm.MD2,
                supported: false,
              },
              {
                name: 'MD4',
                algo: Crypto.CryptoDigestAlgorithm.MD4,
                supported: false,
              },
              {
                name: 'MD5',
                algo: Crypto.CryptoDigestAlgorithm.MD5,
                supported: true,
              },
              {
                name: 'SHA-1',
                algo: Crypto.CryptoDigestAlgorithm.SHA1,
                supported: true,
              },
              {
                name: 'SHA-256',
                algo: Crypto.CryptoDigestAlgorithm.SHA256,
                supported: true,
              },
              {
                name: 'SHA-384',
                algo: Crypto.CryptoDigestAlgorithm.SHA384,
                supported: true,
              },
              {
                name: 'SHA-512',
                algo: Crypto.CryptoDigestAlgorithm.SHA512,
                supported: true,
              },
            ].map(({ name, algo, supported }) => (
              <View key={algo} style={styles.algorithmItem}>
                <View style={styles.algorithmButtonRow}>
                  <CustomButton
                    title={name}
                    onPress={() => generateHash(algo)}
                    variant="ghost"
                    style={styles.algorithmButton}
                  />
                  {!supported && (
                    <TextBox
                      variant="body4"
                      color={theme.warning}
                      style={styles.warningBadge}
                    >
                      (Android 미지원)
                    </TextBox>
                  )}
                </View>
                {hashResults[algo] && (
                  <View
                    style={[
                      styles.resultBox,
                      { backgroundColor: theme.background },
                    ]}
                  >
                    <TextBox
                      variant="body4"
                      color={
                        hashResults[algo].startsWith('❌')
                          ? theme.error
                          : theme.textSecondary
                      }
                      style={styles.resultText}
                    >
                      {hashResults[algo]}
                    </TextBox>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* UUID 생성 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🆔 UUID 생성
          </TextBox>

          <CustomButton
            title="UUID 생성"
            onPress={generateUUID}
            style={styles.button}
          />

          {uuid && (
            <View
              style={[
                styles.resultContainer,
                { backgroundColor: theme.background },
              ]}
            >
              <TextBox variant="body3" color={theme.text}>
                UUID (V4):
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.primary}
                style={styles.uuidText}
              >
                {uuid}
              </TextBox>
            </View>
          )}
        </View>

        {/* 랜덤 바이트 생성 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎲 랜덤 바이트 생성
          </TextBox>

          <View style={styles.inputContainer}>
            <TextBox variant="body3" color={theme.textSecondary}>
              바이트 수 (0-1024):
            </TextBox>
            <View
              style={[styles.textInput, { backgroundColor: theme.background }]}
            >
              <TextBox variant="body3" color={theme.text}>
                {byteCount}
              </TextBox>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="getRandomBytes"
              onPress={generateRandomBytes}
              style={styles.button}
            />
            <CustomButton
              title="getRandomBytesAsync"
              onPress={generateRandomBytesAsync}
              variant="ghost"
              style={styles.button}
            />
            <CustomButton
              title="getRandomValues"
              onPress={generateRandomValues}
              variant="ghost"
              style={styles.button}
            />
          </View>

          {randomBytes && (
            <View
              style={[
                styles.resultContainer,
                { backgroundColor: theme.background },
              ]}
            >
              <TextBox variant="body3" color={theme.text}>
                getRandomBytes 결과:
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.resultText}
              >
                HEX: {formatBytes(randomBytes)}
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.resultText}
              >
                Decimal: {formatBytesDecimal(randomBytes)}
              </TextBox>
            </View>
          )}

          {randomBytesAsync && (
            <View
              style={[
                styles.resultContainer,
                { backgroundColor: theme.background },
              ]}
            >
              <TextBox variant="body3" color={theme.text}>
                getRandomBytesAsync 결과:
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.resultText}
              >
                HEX: {formatBytes(randomBytesAsync)}
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.resultText}
              >
                Decimal: {formatBytesDecimal(randomBytesAsync)}
              </TextBox>
            </View>
          )}

          {randomValues && (
            <View
              style={[
                styles.resultContainer,
                { backgroundColor: theme.background },
              ]}
            >
              <TextBox variant="body3" color={theme.text}>
                getRandomValues 결과:
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.resultText}
              >
                HEX: {formatBytes(randomValues)}
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.resultText}
              >
                Decimal: {formatBytesDecimal(randomValues)}
              </TextBox>
            </View>
          )}
        </View>

        {/* Digest (ArrayBuffer) */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📦 Digest (ArrayBuffer)
          </TextBox>

          <CustomButton
            title="Digest 생성 (SHA-256)"
            onPress={testDigest}
            style={styles.button}
          />

          {digestResult && (
            <View
              style={[
                styles.resultContainer,
                { backgroundColor: theme.background },
              ]}
            >
              <TextBox variant="body3" color={theme.text}>
                Digest 결과 (HEX):
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.resultText}
              >
                {digestResult}
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
              {`// 1. 해시 생성 (문자열)
import * as Crypto from 'expo-crypto';

// HEX 형식
const hexDigest = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA256,
  'Hello World',
  Crypto.CryptoEncoding.HEX
);

// BASE64 형식
const base64Digest = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA512,
  'Hello World',
  Crypto.CryptoEncoding.BASE64
);

// 2. 해시 생성 (ArrayBuffer)
const array = new Uint8Array([1, 2, 3, 4, 5]);
const digest = await Crypto.digest(
  Crypto.CryptoDigestAlgorithm.SHA256,
  array
);
// ArrayBuffer 반환

// 3. UUID 생성
const uuid = Crypto.randomUUID();
// "550e8400-e29b-41d4-a716-446655440000"

// 4. 랜덤 바이트 생성
const bytes = Crypto.getRandomBytes(16);
// Uint8Array 반환

// 5. 랜덤 바이트 생성 (비동기)
const bytesAsync = await Crypto.getRandomBytesAsync(32);

// 6. getRandomValues (브라우저 호환)
import { getRandomValues } from 'expo-crypto';

const array = new Uint8Array(16);
getRandomValues(array);
// 배열이 직접 수정됨

// 7. 모든 해시 알고리즘
const algorithms = [
  Crypto.CryptoDigestAlgorithm.MD2,
  Crypto.CryptoDigestAlgorithm.MD4,
  Crypto.CryptoDigestAlgorithm.MD5,
  Crypto.CryptoDigestAlgorithm.SHA1,
  Crypto.CryptoDigestAlgorithm.SHA256,
  Crypto.CryptoDigestAlgorithm.SHA384,
  Crypto.CryptoDigestAlgorithm.SHA512,
];

for (const algo of algorithms) {
  const hash = await Crypto.digestStringAsync(
    algo,
    'data',
    Crypto.CryptoEncoding.HEX
  );
  console.log(\`\${algo}: \${hash}\`);
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
              • 양방향 암호화(AES)는 제공하지 않음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 웹: HTTPS 또는 localhost에서만 사용 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • getRandomBytes는 0-1024 범위만 지원
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • MD2, MD4, MD5는 보안상 취약 (SHA 사용 권장)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • SHA-256, SHA-384, SHA-512는 충돌 저항성 보장
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 개발 모드에서는 Math.random으로 폴백될 수 있음
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
  inputContainer: {
    gap: 8,
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 44,
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
  algorithmGrid: {
    marginTop: 12,
    gap: 12,
  },
  algorithmItem: {
    gap: 8,
  },
  algorithmButton: {
    alignSelf: 'flex-start',
  },
  algorithmButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningBadge: {
    fontSize: 10,
  },
  resultBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  resultContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 8,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
  uuidText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
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
