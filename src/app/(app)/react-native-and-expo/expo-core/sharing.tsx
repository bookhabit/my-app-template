import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Platform,
  Image,
} from 'react-native';

import { Asset } from 'expo-asset';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function SharingScreen() {
  const { theme } = useTheme();

  // State
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [fileUri, setFileUri] = useState<string>('');
  const [shareResult, setShareResult] = useState<string>('');

  // Options
  const [dialogTitle, setDialogTitle] = useState('파일 공유');
  const [mimeType, setMimeType] = useState('text/plain');
  const [uti, setUti] = useState('public.plain-text');
  const [anchorX, setAnchorX] = useState('0');
  const [anchorY, setAnchorY] = useState('0');
  const [anchorWidth, setAnchorWidth] = useState('0');
  const [anchorHeight, setAnchorHeight] = useState('0');

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await Sharing.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      console.error('Failed to check availability:', error);
      setIsAvailable(false);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFileUri(result.assets[0].uri);
        setShareResult(`파일 선택됨: ${result.assets[0].name}`);
      } else {
        setShareResult('파일 선택 취소됨');
      }
    } catch (error: any) {
      Alert.alert('오류', `파일 선택 실패: ${error.message || error}`);
      setShareResult(`오류: ${error.message || error}`);
    }
  };

  const createTextFile = async () => {
    try {
      const fileName = 'shared-text.txt';
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      const content = `이것은 공유할 텍스트 파일입니다.\n생성 시간: ${new Date().toLocaleString('ko-KR')}`;

      await FileSystem.writeAsStringAsync(fileUri, content);
      setFileUri(fileUri);
      setShareResult(`텍스트 파일 생성됨: ${fileName}`);
      Alert.alert('성공', '텍스트 파일이 생성되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `파일 생성 실패: ${error.message || error}`);
      setShareResult(`오류: ${error.message || error}`);
    }
  };

  const createImageFile = async () => {
    try {
      // 예제 이미지 다운로드
      const imageUrl = 'https://picsum.photos/800/600';
      const fileName = 'shared-image.jpg';
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      setFileUri(downloadResult.uri);
      setShareResult(`이미지 파일 다운로드됨: ${fileName}`);
      Alert.alert('성공', '이미지 파일이 다운로드되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `이미지 다운로드 실패: ${error.message || error}`);
      setShareResult(`오류: ${error.message || error}`);
    }
  };

  const shareFile = async () => {
    if (!fileUri) {
      Alert.alert('알림', '공유할 파일을 선택하거나 생성하세요.');
      return;
    }

    if (!isAvailable) {
      Alert.alert('알림', '이 기기에서 파일 공유를 사용할 수 없습니다.');
      return;
    }

    try {
      const options: Sharing.SharingOptions = {};

      if (Platform.OS === 'android') {
        if (dialogTitle) {
          options.dialogTitle = dialogTitle;
        }
        if (mimeType) {
          options.mimeType = mimeType;
        }
      }

      if (Platform.OS === 'ios') {
        if (uti) {
          options.UTI = uti;
        }
        if (anchorX && anchorY && anchorWidth && anchorHeight) {
          const x = parseFloat(anchorX) || 0;
          const y = parseFloat(anchorY) || 0;
          const width = parseFloat(anchorWidth) || 0;
          const height = parseFloat(anchorHeight) || 0;
          if (x > 0 || y > 0 || width > 0 || height > 0) {
            options.anchor = { x, y, width, height };
          }
        }
      }

      await Sharing.shareAsync(fileUri, options);
      setShareResult('파일 공유 성공');
      Alert.alert('성공', '파일이 공유되었습니다.');
    } catch (error: any) {
      if (error.message && error.message.includes('User canceled')) {
        setShareResult('사용자가 공유를 취소했습니다.');
      } else {
        Alert.alert('오류', `파일 공유 실패: ${error.message || error}`);
        setShareResult(`오류: ${error.message || error}`);
      }
    }
  };

  const shareUrl = async () => {
    if (!isAvailable) {
      Alert.alert('알림', '이 기기에서 파일 공유를 사용할 수 없습니다.');
      return;
    }

    try {
      const url = 'https://expo.dev';
      await Sharing.shareAsync(url);
      setShareResult('URL 공유 성공');
      Alert.alert('성공', 'URL이 공유되었습니다.');
    } catch (error: any) {
      if (error.message && error.message.includes('User canceled')) {
        setShareResult('사용자가 공유를 취소했습니다.');
      } else {
        Alert.alert('오류', `URL 공유 실패: ${error.message || error}`);
        setShareResult(`오류: ${error.message || error}`);
      }
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
      <CustomHeader title="Sharing" showBackButton />
      <View style={styles.content}>
        {/* 상태 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            상태
          </TextBox>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              공유 API 사용 가능:{' '}
              <TextBox
                variant="body2"
                color={isAvailable ? theme.success : theme.error}
              >
                {isAvailable === null
                  ? '확인 중...'
                  : isAvailable
                    ? '사용 가능'
                    : '사용 불가'}
              </TextBox>
            </TextBox>
            {Platform.OS === 'web' && (
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.marginTop}
              >
                ⚠️ Web에서는 HTTPS가 필요하며, 로컬 파일 공유는 지원되지
                않습니다.
              </TextBox>
            )}
            <CustomButton
              title="사용 가능 여부 확인"
              onPress={checkAvailability}
              style={styles.button}
            />
          </View>
        </View>

        {/* 파일 선택/생성 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            파일 준비
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="파일 선택"
              onPress={pickFile}
              style={[styles.button, styles.flex1]}
            />
            <CustomButton
              title="텍스트 파일 생성"
              onPress={createTextFile}
              style={[styles.button, styles.flex1]}
            />
            <CustomButton
              title="이미지 파일 생성"
              onPress={createImageFile}
              style={[styles.button, styles.flex1]}
            />
          </View>
          {fileUri && (
            <View
              style={[
                styles.infoBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextBox variant="body4" color={theme.textSecondary}>
                선택된 파일:
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.marginTop}
              >
                {fileUri}
              </TextBox>
              {fileUri.endsWith('.jpg') || fileUri.endsWith('.png') ? (
                <Image
                  source={{ uri: fileUri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              ) : null}
            </View>
          )}
        </View>

        {/* 공유 옵션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            공유 옵션
          </TextBox>
          {Platform.OS === 'android' && (
            <>
              <View style={styles.inputGroup}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  Dialog Title
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
                  value={dialogTitle}
                  onChangeText={setDialogTitle}
                  placeholder="파일 공유"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  MIME Type
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
                  value={mimeType}
                  onChangeText={setMimeType}
                  placeholder="text/plain"
                  placeholderTextColor={theme.textSecondary}
                />
                <TextBox
                  variant="body4"
                  color={theme.textSecondary}
                  style={styles.hint}
                >
                  예: text/plain, image/jpeg, application/pdf
                </TextBox>
              </View>
            </>
          )}
          {Platform.OS === 'ios' && (
            <>
              <View style={styles.inputGroup}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  UTI (Uniform Type Identifier)
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
                  value={uti}
                  onChangeText={setUti}
                  placeholder="public.plain-text"
                  placeholderTextColor={theme.textSecondary}
                />
                <TextBox
                  variant="body4"
                  color={theme.textSecondary}
                  style={styles.hint}
                >
                  예: public.plain-text, public.jpeg, com.adobe.pdf
                </TextBox>
              </View>
              <View style={styles.inputGroup}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  Anchor (iPad용) - X, Y, Width, Height
                </TextBox>
                <View style={styles.anchorRow}>
                  <TextInput
                    style={[
                      styles.anchorInput,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                    value={anchorX}
                    onChangeText={setAnchorX}
                    placeholder="X"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[
                      styles.anchorInput,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                    value={anchorY}
                    onChangeText={setAnchorY}
                    placeholder="Y"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[
                      styles.anchorInput,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                    value={anchorWidth}
                    onChangeText={setAnchorWidth}
                    placeholder="Width"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[
                      styles.anchorInput,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                    value={anchorHeight}
                    onChangeText={setAnchorHeight}
                    placeholder="Height"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </>
          )}
        </View>

        {/* 공유 실행 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            파일 공유
          </TextBox>
          <CustomButton
            title="파일 공유하기"
            onPress={shareFile}
            style={styles.button}
            disabled={!isAvailable || !fileUri}
          />
          <CustomButton
            title="URL 공유하기 (Web 테스트)"
            onPress={shareUrl}
            style={styles.button}
            disabled={!isAvailable}
            variant="ghost"
          />
          {shareResult && (
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
                {shareResult}
              </TextBox>
            </View>
          )}
        </View>

        {/* 참고사항 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            참고사항
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
              • Web에서는 HTTPS가 필요하며, 로컬 파일 공유는 지원되지 않습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 현재는 앱에서 다른 앱으로 공유만 지원됩니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android: dialogTitle, mimeType 옵션 사용 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • iOS: UTI, anchor (iPad용) 옵션 사용 가능
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
  statusBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  marginTop: {
    marginTop: 8,
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
  inputGroup: {
    gap: 8,
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
  anchorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  anchorInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
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
  resultBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginTop: 12,
    borderRadius: 8,
  },
});
