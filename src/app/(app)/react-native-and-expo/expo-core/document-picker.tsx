import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Alert,
  Platform,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function DocumentPickerScreen() {
  const { theme } = useTheme();

  // State
  const [selectedFiles, setSelectedFiles] = useState<
    DocumentPicker.DocumentPickerAsset[]
  >([]);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Options
  const [multiple, setMultiple] = useState(false);
  const [copyToCache, setCopyToCache] = useState(true);
  const [includeBase64, setIncludeBase64] = useState(false);
  const [mimeType, setMimeType] = useState<string>('*/*');

  const pickDocument = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: mimeType === '*/*' ? '*/*' : mimeType.split(','),
        multiple,
        copyToCacheDirectory: copyToCache,
        base64: includeBase64,
      });

      if (!result.canceled) {
        setSelectedFiles(result.assets);
        setFileContent('');
        Alert.alert('성공', `${result.assets.length}개의 파일을 선택했습니다.`);
      } else {
        Alert.alert('취소', '파일 선택이 취소되었습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', `파일 선택 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const readFileContent = async (uri: string) => {
    try {
      setLoading(true);
      const content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      setFileContent(content);
    } catch (error: any) {
      Alert.alert('오류', `파일 읽기 실패: ${error.message || error}`);
      setFileContent('');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return '알 수 없음';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setFileContent('');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="DocumentPicker" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          DocumentPicker
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          시스템 문서 선택 UI
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
              DocumentPicker API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 시스템 UI를 통한 문서 선택
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 단일/다중 파일 선택 지원
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • MIME 타입 필터링
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 캐시 디렉토리 복사 옵션
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Base64 인코딩 옵션
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • expo-file-system과 연동 가능
            </TextBox>
          </View>
        </View>

        {/* 옵션 설정 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚙️ 옵션 설정
          </TextBox>

          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <TextBox variant="body3" color={theme.text}>
                다중 선택:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="단일"
                  onPress={() => setMultiple(false)}
                  variant={!multiple ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="다중"
                  onPress={() => setMultiple(true)}
                  variant={multiple ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            <View style={styles.optionRow}>
              <TextBox variant="body3" color={theme.text}>
                캐시 복사:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="활성"
                  onPress={() => setCopyToCache(true)}
                  variant={copyToCache ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="비활성"
                  onPress={() => setCopyToCache(false)}
                  variant={!copyToCache ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            <View style={styles.optionRow}>
              <TextBox variant="body3" color={theme.text}>
                Base64 포함:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="포함"
                  onPress={() => setIncludeBase64(true)}
                  variant={includeBase64 ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="제외"
                  onPress={() => setIncludeBase64(false)}
                  variant={!includeBase64 ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            <View style={styles.optionRow}>
              <TextBox variant="body3" color={theme.text}>
                MIME 타입:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="모든 파일"
                  onPress={() => setMimeType('*/*')}
                  variant={mimeType === '*/*' ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="이미지"
                  onPress={() => setMimeType('image/*')}
                  variant={mimeType === 'image/*' ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="PDF"
                  onPress={() => setMimeType('application/pdf')}
                  variant={mimeType === 'application/pdf' ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 파일 선택 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📄 파일 선택
          </TextBox>

          <CustomButton
            title={loading ? '선택 중...' : '문서 선택'}
            onPress={pickDocument}
            style={styles.button}
            disabled={loading}
          />

          {selectedFiles.length > 0 && (
            <CustomButton
              title="선택 초기화"
              onPress={clearSelection}
              variant="ghost"
              style={styles.button}
            />
          )}
        </View>

        {/* 선택된 파일 목록 */}
        {selectedFiles.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📋 선택된 파일 ({selectedFiles.length}개)
            </TextBox>

            {selectedFiles.map((file, index) => (
              <View
                key={index}
                style={[styles.fileCard, { backgroundColor: theme.background }]}
              >
                <View style={styles.fileHeader}>
                  <TextBox
                    variant="body2"
                    color={theme.text}
                    style={styles.fileName}
                  >
                    {file.name}
                  </TextBox>
                </View>

                <View style={styles.fileInfo}>
                  <View style={styles.infoRow}>
                    <TextBox variant="body4" color={theme.textSecondary}>
                      URI:
                    </TextBox>
                    <TextBox
                      variant="body4"
                      color={theme.textSecondary}
                      style={styles.uriText}
                    >
                      {file.uri}
                    </TextBox>
                  </View>

                  {file.size && (
                    <View style={styles.infoRow}>
                      <TextBox variant="body4" color={theme.textSecondary}>
                        크기:
                      </TextBox>
                      <TextBox variant="body4" color={theme.text}>
                        {formatFileSize(file.size)}
                      </TextBox>
                    </View>
                  )}

                  {file.mimeType && (
                    <View style={styles.infoRow}>
                      <TextBox variant="body4" color={theme.textSecondary}>
                        MIME 타입:
                      </TextBox>
                      <TextBox variant="body4" color={theme.text}>
                        {file.mimeType}
                      </TextBox>
                    </View>
                  )}

                  <View style={styles.infoRow}>
                    <TextBox variant="body4" color={theme.textSecondary}>
                      수정일:
                    </TextBox>
                    <TextBox variant="body4" color={theme.text}>
                      {formatDate(file.lastModified)}
                    </TextBox>
                  </View>

                  {file.base64 && (
                    <View style={styles.infoRow}>
                      <TextBox variant="body4" color={theme.textSecondary}>
                        Base64:
                      </TextBox>
                      <TextBox
                        variant="body4"
                        color={theme.textSecondary}
                        style={styles.base64Text}
                      >
                        {file.base64.substring(0, 50)}...
                      </TextBox>
                    </View>
                  )}

                  {/* 이미지 미리보기 */}
                  {file.mimeType?.startsWith('image/') && (
                    <View style={styles.imagePreview}>
                      <Image
                        source={{ uri: file.uri }}
                        style={styles.previewImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}

                  {/* 파일 읽기 버튼 */}
                  {copyToCache && (
                    <CustomButton
                      title="파일 내용 읽기"
                      onPress={() => readFileContent(file.uri)}
                      variant="ghost"
                      style={styles.readButton}
                    />
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 파일 내용 */}
        {fileContent && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📝 파일 내용
            </TextBox>
            <View
              style={[styles.contentBox, { backgroundColor: theme.background }]}
            >
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.contentText}
              >
                {fileContent.length > 1000
                  ? `${fileContent.substring(0, 1000)}... (${fileContent.length}자)`
                  : fileContent}
              </TextBox>
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
              {`// 1. 기본 사용 (단일 파일)
import * as DocumentPicker from 'expo-document-picker';

const result = await DocumentPicker.getDocumentAsync();

if (!result.canceled) {
  const file = result.assets[0];
  console.log('파일명:', file.name);
  console.log('URI:', file.uri);
  console.log('크기:', file.size);
  console.log('MIME 타입:', file.mimeType);
}

// 2. 다중 파일 선택
const result = await DocumentPicker.getDocumentAsync({
  multiple: true,
});

if (!result.canceled) {
  result.assets.forEach((file, index) => {
    console.log(\`파일 \${index + 1}:\`, file.name);
  });
}

// 3. MIME 타입 필터링
// 이미지만
const result = await DocumentPicker.getDocumentAsync({
  type: 'image/*',
});

// PDF만
const result = await DocumentPicker.getDocumentAsync({
  type: 'application/pdf',
});

// 여러 타입
const result = await DocumentPicker.getDocumentAsync({
  type: ['image/*', 'application/pdf'],
});

// 4. 캐시 디렉토리 복사 (expo-file-system과 연동)
const result = await DocumentPicker.getDocumentAsync({
  copyToCacheDirectory: true, // 기본값: true
});

if (!result.canceled) {
  const file = result.assets[0];
  // 즉시 읽기 가능
  const content = await FileSystem.readAsStringAsync(file.uri);
}

// 5. Base64 포함
const result = await DocumentPicker.getDocumentAsync({
  base64: true,
});

if (!result.canceled && result.assets[0].base64) {
  console.log('Base64:', result.assets[0].base64);
}

// 6. expo-file-system과 함께 사용
import * as FileSystem from 'expo-file-system';

const result = await DocumentPicker.getDocumentAsync({
  copyToCacheDirectory: true,
  type: 'text/*',
});

if (!result.canceled) {
  const file = result.assets[0];
  
  // 파일 읽기
  const content = await FileSystem.readAsStringAsync(file.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  
  // 파일 정보
  const info = await FileSystem.getInfoAsync(file.uri);
  console.log('파일 존재:', info.exists);
  console.log('파일 크기:', info.size);
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
              • 웹: 사용자 액션(버튼 클릭) 후에만 호출 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • copyToCacheDirectory: false일 때 expo-file-system으로 즉시 읽기
              불가
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • base64: true일 때 큰 파일은 메모리 문제 발생 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: iCloud 스토리지 사용 시 추가 설정 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 웹: 취소 이벤트가 브라우저마다 다르게 동작
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: 일부 파일은 URI만 제공되고 직접 접근 불가
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
  optionsContainer: {
    gap: 16,
  },
  optionRow: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: 80,
  },
  button: {
    marginTop: 8,
  },
  fileCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 12,
  },
  fileHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingBottom: 8,
  },
  fileName: {
    fontWeight: 'bold',
  },
  fileInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  uriText: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'right',
  },
  base64Text: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'right',
  },
  imagePreview: {
    marginTop: 8,
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  readButton: {
    marginTop: 8,
  },
  contentBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    maxHeight: 300,
  },
  contentText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
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
