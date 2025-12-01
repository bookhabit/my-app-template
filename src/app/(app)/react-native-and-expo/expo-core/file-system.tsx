import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Image,
} from 'react-native';

import { File, Directory, Paths } from 'expo-file-system';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function FileSystemScreen() {
  const { theme } = useTheme();

  // State
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('test.txt');
  const [directoryName, setDirectoryName] = useState('test-dir');
  const [downloadUrl, setDownloadUrl] = useState(
    'https://picsum.photos/200/300'
  );
  const [fileList, setFileList] = useState<(File | Directory)[]>([]);
  const [currentPath, setCurrentPath] = useState<Directory>(Paths.cache);
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '알 수 없음';
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  // File operations
  const createFile = async () => {
    try {
      setLoading(true);
      const file = new File(currentPath, fileName);
      await file.create();
      file.write(fileContent || 'Hello World!');
      Alert.alert('성공', `파일 생성: ${file.uri}`);
      await listDirectory();
    } catch (error: any) {
      Alert.alert('오류', `파일 생성 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const readFile = async () => {
    try {
      setLoading(true);
      const file = new File(currentPath, fileName);
      if (!file.exists) {
        Alert.alert('오류', '파일이 존재하지 않습니다.');
        return;
      }
      const content = await file.text();
      setFileContent(content);
      Alert.alert('성공', '파일을 읽었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `파일 읽기 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const writeFile = async () => {
    try {
      setLoading(true);
      const file = new File(currentPath, fileName);
      if (!file.exists) {
        await file.create();
      }
      file.write(fileContent);
      Alert.alert('성공', '파일을 저장했습니다.');
      await listDirectory();
    } catch (error: any) {
      Alert.alert('오류', `파일 쓰기 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async () => {
    try {
      setLoading(true);
      const file = new File(currentPath, fileName);
      if (!file.exists) {
        Alert.alert('오류', '파일이 존재하지 않습니다.');
        return;
      }
      file.delete();
      Alert.alert('성공', '파일을 삭제했습니다.');
      setFileContent('');
      await listDirectory();
    } catch (error: any) {
      Alert.alert('오류', `파일 삭제 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const getFileInfo = async () => {
    try {
      setLoading(true);
      const file = new File(currentPath, fileName);
      if (!file.exists) {
        Alert.alert('오류', '파일이 존재하지 않습니다.');
        return;
      }
      const info = await file.info({ md5: true });
      setFileInfo({
        ...info,
        uri: file.uri,
        name: file.name,
        extension: file.extension,
        size: file.size,
        type: file.type,
        exists: file.exists,
        md5: file.md5,
        creationTime: file.creationTime,
        modificationTime: file.modificationTime,
      });
    } catch (error: any) {
      Alert.alert('오류', `파일 정보 가져오기 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  // Directory operations
  const createDirectory = async () => {
    try {
      setLoading(true);
      const dir = new Directory(currentPath, directoryName);
      await dir.create({ intermediates: true });
      Alert.alert('성공', `디렉토리 생성: ${dir.uri}`);
      await listDirectory();
    } catch (error: any) {
      Alert.alert('오류', `디렉토리 생성 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const listDirectory = async () => {
    try {
      setLoading(true);
      const items = currentPath.list();
      setFileList(items);
    } catch (error: any) {
      Alert.alert(
        '오류',
        `디렉토리 목록 가져오기 실패: ${error.message || error}`
      );
      setFileList([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteDirectory = async () => {
    try {
      setLoading(true);
      const dir = new Directory(currentPath, directoryName);
      if (!dir.exists) {
        Alert.alert('오류', '디렉토리가 존재하지 않습니다.');
        return;
      }
      dir.delete();
      Alert.alert('성공', '디렉토리를 삭제했습니다.');
      await listDirectory();
    } catch (error: any) {
      Alert.alert('오류', `디렉토리 삭제 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const changeDirectory = (dir: Directory) => {
    setCurrentPath(dir);
    setFileList([]);
    setFileInfo(null);
  };

  // Download
  const downloadFile = async () => {
    try {
      setLoading(true);
      const file = await File.downloadFileAsync(
        downloadUrl,
        new Directory(Paths.cache)
      );
      Alert.alert('성공', `다운로드 완료: ${file.uri}`);
      setFileName(file.uri);
      await listDirectory();
    } catch (error: any) {
      Alert.alert('오류', `다운로드 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  // Paths
  const getPathsInfo = () => {
    return {
      cache: Paths.cache.uri,
      document: Paths.document.uri,
      bundle: Paths.bundle.uri,
      availableDiskSpace: formatBytes(Paths.availableDiskSpace),
      totalDiskSpace: formatBytes(Paths.totalDiskSpace),
    };
  };

  // Initialize
  useEffect(() => {
    listDirectory();
  }, [currentPath]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="FileSystem" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          FileSystem
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          로컬 파일 시스템 접근
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
              FileSystem API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • File: 파일 생성, 읽기, 쓰기, 삭제, 이동, 복사
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Directory: 디렉토리 생성, 리스트, 삭제, 이동, 복사
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Paths: 캐시, 문서, 번들 디렉토리 접근
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • FileHandle: 파일 핸들링 (읽기/쓰기)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 파일 다운로드/업로드 지원
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 동기/비동기 API 모두 지원
            </TextBox>
          </View>
        </View>

        {/* 경로 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📁 경로 정보
          </TextBox>

          <View style={styles.pathsContainer}>
            {Object.entries(getPathsInfo()).map(([key, value]) => (
              <View key={key} style={styles.pathRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  {key}:
                </TextBox>
                <TextBox
                  variant="body4"
                  color={theme.text}
                  style={styles.pathValue}
                >
                  {value}
                </TextBox>
              </View>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="Cache"
              onPress={() => changeDirectory(Paths.cache)}
              variant={
                currentPath.uri === Paths.cache.uri ? 'primary' : 'ghost'
              }
              style={styles.pathButton}
            />
            <CustomButton
              title="Document"
              onPress={() => changeDirectory(Paths.document)}
              variant={
                currentPath.uri === Paths.document.uri ? 'primary' : 'ghost'
              }
              style={styles.pathButton}
            />
            <CustomButton
              title="Bundle"
              onPress={() => changeDirectory(Paths.bundle)}
              variant={
                currentPath.uri === Paths.bundle.uri ? 'primary' : 'ghost'
              }
              style={styles.pathButton}
            />
          </View>

          <View
            style={[
              styles.currentPathBox,
              { backgroundColor: theme.background },
            ]}
          >
            <TextBox variant="body3" color={theme.text}>
              현재 경로: {currentPath.uri}
            </TextBox>
          </View>
        </View>

        {/* 파일 작업 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📄 파일 작업
          </TextBox>

          <View style={styles.inputContainer}>
            <TextBox variant="body3" color={theme.textSecondary}>
              파일명:
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={fileName}
              onChangeText={setFileName}
              placeholder="test.txt"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextBox variant="body3" color={theme.textSecondary}>
              내용:
            </TextBox>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={fileContent}
              onChangeText={setFileContent}
              placeholder="파일 내용을 입력하세요..."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="생성"
              onPress={createFile}
              style={styles.button}
              disabled={loading}
            />
            <CustomButton
              title="읽기"
              onPress={readFile}
              variant="ghost"
              style={styles.button}
              disabled={loading}
            />
            <CustomButton
              title="저장"
              onPress={writeFile}
              variant="ghost"
              style={styles.button}
              disabled={loading}
            />
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="삭제"
              onPress={deleteFile}
              variant="ghost"
              style={styles.button}
              disabled={loading}
            />
            <CustomButton
              title="정보"
              onPress={getFileInfo}
              variant="ghost"
              style={styles.button}
              disabled={loading}
            />
          </View>
        </View>

        {/* 디렉토리 작업 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📁 디렉토리 작업
          </TextBox>

          <View style={styles.inputContainer}>
            <TextBox variant="body3" color={theme.textSecondary}>
              디렉토리명:
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={directoryName}
              onChangeText={setDirectoryName}
              placeholder="test-dir"
            />
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="생성"
              onPress={createDirectory}
              style={styles.button}
              disabled={loading}
            />
            <CustomButton
              title="목록"
              onPress={listDirectory}
              variant="ghost"
              style={styles.button}
              disabled={loading}
            />
            <CustomButton
              title="삭제"
              onPress={deleteDirectory}
              variant="ghost"
              style={styles.button}
              disabled={loading}
            />
          </View>
        </View>

        {/* 파일 목록 */}
        {fileList.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📋 파일 목록 ({fileList.length}개)
            </TextBox>

            {fileList.map((item, index) => (
              <View
                key={index}
                style={[styles.itemCard, { backgroundColor: theme.background }]}
              >
                <View style={styles.itemHeader}>
                  <TextBox variant="body2" color={theme.text}>
                    {item.name}
                  </TextBox>
                  <TextBox
                    variant="body4"
                    color={
                      item instanceof Directory
                        ? theme.primary
                        : theme.textSecondary
                    }
                  >
                    {item instanceof Directory ? '📁 디렉토리' : '📄 파일'}
                  </TextBox>
                </View>

                <View style={styles.itemInfo}>
                  <TextBox variant="body4" color={theme.textSecondary}>
                    URI: {item.uri}
                  </TextBox>
                  {item instanceof File && (
                    <>
                      <TextBox variant="body4" color={theme.textSecondary}>
                        크기: {formatBytes(item.size)}
                      </TextBox>
                      <TextBox variant="body4" color={theme.textSecondary}>
                        타입: {item.type || '알 수 없음'}
                      </TextBox>
                    </>
                  )}
                </View>

                {item instanceof Directory && (
                  <CustomButton
                    title="열기"
                    onPress={() => changeDirectory(item)}
                    variant="ghost"
                    style={styles.itemButton}
                  />
                )}

                {item instanceof File && (
                  <CustomButton
                    title="선택"
                    onPress={() => {
                      setFileName(item.name);
                      setFileInfo(null);
                    }}
                    variant="ghost"
                    style={styles.itemButton}
                  />
                )}
              </View>
            ))}
          </View>
        )}

        {/* 파일 정보 */}
        {fileInfo && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              ℹ️ 파일 정보
            </TextBox>

            <View style={styles.infoContainer}>
              {Object.entries(fileInfo).map(([key, value]) => (
                <View key={key} style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    {key}:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {typeof value === 'boolean'
                      ? value
                        ? '✅'
                        : '❌'
                      : typeof value === 'number' && key.includes('Time')
                        ? formatDate(value)
                        : typeof value === 'number' && key === 'size'
                          ? formatBytes(value)
                          : String(value)}
                  </TextBox>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 파일 다운로드 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⬇️ 파일 다운로드
          </TextBox>

          <View style={styles.inputContainer}>
            <TextBox variant="body3" color={theme.textSecondary}>
              URL:
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={downloadUrl}
              onChangeText={setDownloadUrl}
              placeholder="https://example.com/file.jpg"
            />
          </View>

          <CustomButton
            title="다운로드"
            onPress={downloadFile}
            style={styles.button}
            disabled={loading}
          />
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
              {`// 1. 파일 생성 및 쓰기
import { File, Directory, Paths } from 'expo-file-system';

const file = new File(Paths.cache, 'test.txt');
await file.create();
file.write('Hello World!');

// 2. 파일 읽기
const content = await file.text();
const base64 = await file.base64();
const bytes = await file.bytes();

// 3. 파일 정보
const info = await file.info({ md5: true });
console.log('크기:', file.size);
console.log('타입:', file.type);
console.log('MD5:', file.md5);

// 4. 디렉토리 생성
const dir = new Directory(Paths.cache, 'subdir');
await dir.create({ intermediates: true });

// 5. 디렉토리 목록
const items = dir.list();
items.forEach(item => {
  if (item instanceof File) {
    console.log('파일:', item.name);
  } else if (item instanceof Directory) {
    console.log('디렉토리:', item.name);
  }
});

// 6. 파일 이동/복사
const newFile = new File(Paths.document, 'moved.txt');
file.move(newFile);
// 또는
file.copy(newFile);

// 7. 파일 삭제
file.delete();

// 8. 파일 다운로드
const file = await File.downloadFileAsync(
  'https://example.com/image.jpg',
  new Directory(Paths.cache)
);

// 9. FileHandle 사용
const handle = file.open();
handle.writeBytes(new Uint8Array([1, 2, 3]));
const bytes = handle.readBytes(10);
handle.close();

// 10. 경로 유틸리티
const joined = Paths.join(Paths.cache.uri, 'subdir', 'file.txt');
const basename = Paths.basename(joined);
const dirname = Paths.dirname(joined);
const ext = Paths.extname(joined);`}
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
              • Cache 디렉토리는 시스템이 삭제할 수 있음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Document 디렉토리는 영구 저장용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Bundle 디렉토리는 읽기 전용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: 일부 파일은 Content URI 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: 디렉토리 선택은 임시 접근만 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 큰 파일은 스트림 사용 권장
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
  pathsContainer: {
    gap: 8,
  },
  pathRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  pathValue: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pathButton: {
    flex: 1,
    minWidth: 100,
  },
  currentPathBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 8,
  },
  inputContainer: {
    gap: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  itemCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    gap: 4,
  },
  itemButton: {
    marginTop: 4,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
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
