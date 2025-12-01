import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as SMS from 'expo-sms';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function SMSScreen() {
  const { theme } = useTheme();

  // State
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState('01012345678');
  const [message, setMessage] = useState(
    '안녕하세요! 이것은 테스트 메시지입니다.'
  );
  const [sendResult, setSendResult] = useState<string>('');

  // Attachment
  const [attachmentUri, setAttachmentUri] = useState<string>('');
  const [attachmentMimeType, setAttachmentMimeType] = useState('image/png');
  const [attachmentFilename, setAttachmentFilename] =
    useState('attachment.png');

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await SMS.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      console.error('Failed to check availability:', error);
      setIsAvailable(false);
    }
  };

  const pickAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAttachmentUri(asset.uri);
        setAttachmentMimeType(asset.mimeType || 'image/png');
        setAttachmentFilename(asset.name || 'attachment.png');
        setSendResult(`첨부 파일 선택됨: ${asset.name}`);
      } else {
        setSendResult('첨부 파일 선택 취소됨');
      }
    } catch (error: any) {
      Alert.alert('오류', `첨부 파일 선택 실패: ${error.message || error}`);
      setSendResult(`오류: ${error.message || error}`);
    }
  };

  const createImageAttachment = async () => {
    try {
      const imageUrl = 'https://picsum.photos/800/600';
      const fileName = 'sms-attachment.jpg';
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

      // Android에서는 content URI가 필요합니다
      let contentUri = downloadResult.uri;
      if (Platform.OS === 'android') {
        contentUri = await FileSystem.getContentUriAsync(downloadResult.uri);
      }

      setAttachmentUri(contentUri);
      setAttachmentMimeType('image/jpeg');
      setAttachmentFilename(fileName);
      setSendResult(`이미지 첨부 파일 생성됨: ${fileName}`);
      Alert.alert('성공', '이미지 첨부 파일이 생성되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `이미지 생성 실패: ${error.message || error}`);
      setSendResult(`오류: ${error.message || error}`);
    }
  };

  const sendSMS = async () => {
    if (!phoneNumbers.trim()) {
      Alert.alert('알림', '전화번호를 입력하세요.');
      return;
    }

    if (!message.trim()) {
      Alert.alert('알림', '메시지를 입력하세요.');
      return;
    }

    if (!isAvailable) {
      Alert.alert('알림', '이 기기에서 SMS를 사용할 수 없습니다.');
      return;
    }

    try {
      const addresses = phoneNumbers
        .split(',')
        .map((num) => num.trim())
        .filter((num) => num.length > 0);

      const options: SMS.SMSOptions = {};

      if (attachmentUri) {
        if (Platform.OS === 'android') {
          // Android에서는 content URI가 필요합니다
          const contentUri = await FileSystem.getContentUriAsync(attachmentUri);
          options.attachments = {
            uri: contentUri,
            mimeType: attachmentMimeType,
            filename: attachmentFilename,
          };
        } else {
          // iOS
          options.attachments = {
            uri: attachmentUri,
            mimeType: attachmentMimeType,
            filename: attachmentFilename,
          };
        }
      }

      const result = await SMS.sendSMSAsync(addresses, message, options);

      let resultText = '';
      switch (result.result) {
        case 'sent':
          resultText = '메시지가 전송되었습니다.';
          break;
        case 'cancelled':
          resultText = '사용자가 전송을 취소했습니다.';
          break;
        case 'unknown':
          resultText =
            '전송 상태를 확인할 수 없습니다. (Android에서는 항상 unknown)';
          break;
        default:
          resultText = `결과: ${result.result}`;
      }

      setSendResult(resultText);
      Alert.alert('완료', resultText);
    } catch (error: any) {
      Alert.alert('오류', `SMS 전송 실패: ${error.message || error}`);
      setSendResult(`오류: ${error.message || error}`);
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
      <CustomHeader title="SMS" showBackButton />
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
              SMS 사용 가능:{' '}
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
            {Platform.OS === 'ios' && (
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.marginTop}
              >
                ⚠️ iOS 시뮬레이터에서는 항상 false를 반환합니다.
              </TextBox>
            )}
            {Platform.OS === 'web' && (
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.marginTop}
              >
                ⚠️ 웹에서는 지원되지 않습니다.
              </TextBox>
            )}
            <CustomButton
              title="사용 가능 여부 확인"
              onPress={checkAvailability}
              style={styles.button}
            />
          </View>
        </View>

        {/* 수신자 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            수신자
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              전화번호 (쉼표로 구분)
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
              value={phoneNumbers}
              onChangeText={setPhoneNumbers}
              placeholder="01012345678, 01098765432"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
            />
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.hint}
            >
              여러 번호를 쉼표로 구분하여 입력할 수 있습니다.
            </TextBox>
          </View>
        </View>

        {/* 메시지 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            메시지
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              메시지 내용
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
              value={message}
              onChangeText={setMessage}
              placeholder="메시지를 입력하세요"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={6}
            />
          </View>
        </View>

        {/* 첨부 파일 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            첨부 파일 (선택사항)
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="파일 선택"
              onPress={pickAttachment}
              style={[styles.button, styles.flex1]}
            />
            <CustomButton
              title="이미지 생성"
              onPress={createImageAttachment}
              style={[styles.button, styles.flex1]}
            />
          </View>
          {attachmentUri && (
            <View
              style={[
                styles.infoBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextBox variant="body4" color={theme.textSecondary}>
                첨부 파일:
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.marginTop}
              >
                {attachmentFilename}
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.marginTop}
              >
                MIME Type: {attachmentMimeType}
              </TextBox>
              <CustomButton
                title="첨부 파일 제거"
                onPress={() => {
                  setAttachmentUri('');
                  setAttachmentFilename('');
                  setAttachmentMimeType('image/png');
                }}
                style={styles.button}
                variant="ghost"
              />
            </View>
          )}
          {Platform.OS === 'android' && (
            <View
              style={[
                styles.infoBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextBox variant="body4" color={theme.textSecondary}>
                ⚠️ Android에서는 content URI가 필요합니다.
                FileSystem.getContentUriAsync()를 사용하여 변환합니다.
              </TextBox>
            </View>
          )}
        </View>

        {/* 전송 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            SMS 전송
          </TextBox>
          <CustomButton
            title="SMS 전송하기"
            onPress={sendSMS}
            style={styles.button}
            disabled={!isAvailable}
          />
          {sendResult && (
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
                {sendResult}
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
              • iOS 시뮬레이터와 웹에서는 항상 false를 반환합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android에서는 전송 상태를 확인할 수 없어 항상 'unknown'을
              반환합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android에서 첨부 파일을 사용하려면 content URI가 필요합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 실제 메시지 내용이나 수신자 목록은 확인하지 않습니다.
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
  textArea: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  button: {
    marginTop: 8,
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginTop: 12,
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
});
