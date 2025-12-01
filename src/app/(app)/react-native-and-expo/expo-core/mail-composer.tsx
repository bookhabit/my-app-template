import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import * as MailComposer from 'expo-mail-composer';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function MailComposerScreen() {
  const { theme } = useTheme();

  // Availability
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [mailClients, setMailClients] = useState<MailComposer.MailClient[]>([]);

  // Compose options
  const [recipients, setRecipients] = useState('user@example.com');
  const [ccRecipients, setCcRecipients] = useState('');
  const [bccRecipients, setBccRecipients] = useState('');
  const [subject, setSubject] = useState('테스트 이메일');
  const [body, setBody] = useState(
    '이것은 expo-mail-composer를 사용한 테스트 이메일입니다.'
  );
  const [isHtml, setIsHtml] = useState(false);
  const [attachments, setAttachments] = useState('');

  // Result
  const [lastResult, setLastResult] =
    useState<MailComposer.MailComposerResult | null>(null);

  useEffect(() => {
    checkAvailability();
    loadMailClients();
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await MailComposer.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      console.error('Failed to check availability:', error);
      setIsAvailable(false);
    }
  };

  const loadMailClients = () => {
    try {
      const clients = MailComposer.getClients();
      setMailClients(clients);
    } catch (error) {
      console.error('Failed to load mail clients:', error);
      setMailClients([]);
    }
  };

  const composeEmail = async () => {
    if (!isAvailable) {
      Alert.alert(
        '알림',
        '이메일 작성 기능을 사용할 수 없습니다.\n\niOS에서는 Mail 앱에 계정이 설정되어 있어야 합니다.'
      );
      return;
    }

    try {
      const options: MailComposer.MailComposerOptions = {
        recipients: recipients
          .split(',')
          .map((r) => r.trim())
          .filter((r) => r.length > 0),
        ccRecipients: ccRecipients
          .split(',')
          .map((r) => r.trim())
          .filter((r) => r.length > 0),
        bccRecipients: bccRecipients
          .split(',')
          .map((r) => r.trim())
          .filter((r) => r.length > 0),
        subject: subject || undefined,
        body: body || undefined,
        isHtml: isHtml,
        attachments: attachments
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a.length > 0),
      };

      // 빈 배열 제거
      if (options.recipients?.length === 0) delete options.recipients;
      if (options.ccRecipients?.length === 0) delete options.ccRecipients;
      if (options.bccRecipients?.length === 0) delete options.bccRecipients;
      if (options.attachments?.length === 0) delete options.attachments;

      const result = await MailComposer.composeAsync(options);
      setLastResult(result);

      let message = '';
      switch (result.status) {
        case MailComposer.MailComposerStatus.SENT:
          message = '이메일이 전송되었습니다.';
          break;
        case MailComposer.MailComposerStatus.SAVED:
          message = '이메일이 저장되었습니다.';
          break;
        case MailComposer.MailComposerStatus.CANCELLED:
          message = '이메일 작성이 취소되었습니다.';
          break;
        case MailComposer.MailComposerStatus.UNDETERMINED:
          message = '이메일 상태를 확인할 수 없습니다.';
          break;
        default:
          message = `이메일 상태: ${result.status}`;
      }

      Alert.alert('완료', message);
    } catch (error) {
      console.error('Failed to compose email:', error);
      Alert.alert('오류', `이메일 작성 실패: ${error}`);
    }
  };

  const getStatusText = (status: MailComposer.MailComposerStatus) => {
    switch (status) {
      case MailComposer.MailComposerStatus.SENT:
        return '전송됨 (SENT)';
      case MailComposer.MailComposerStatus.SAVED:
        return '저장됨 (SAVED)';
      case MailComposer.MailComposerStatus.CANCELLED:
        return '취소됨 (CANCELLED)';
      case MailComposer.MailComposerStatus.UNDETERMINED:
        return '확인 불가 (UNDETERMINED)';
      default:
        return status;
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
      <CustomHeader title="MailComposer" showBackButton />
      <View style={styles.content}>
        {/* 개념 설명 */}
        <View style={styles.section}>
          <TextBox
            variant="title2"
            color={theme.text}
            style={styles.sectionTitle}
          >
            MailComposer란?
          </TextBox>
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.description}
          >
            expo-mail-composer는 시스템의 이메일 작성 UI를 사용하여 이메일을
            작성하고 전송할 수 있게 해주는 라이브러리입니다.
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
              • iOS: Mail 앱의 모달 UI를 표시합니다. Mail 앱에 계정이 설정되어
              있어야 합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android: 이메일 앱 Intent를 실행합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • iOS Simulator에서는 사용할 수 없습니다 (Mail 계정 로그인 불가).
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android에서는 status가 항상 SENT로 반환됩니다.
            </TextBox>
          </View>
        </View>

        {/* 사용 가능 여부 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            사용 가능 여부
          </TextBox>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              상태:{' '}
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
            <CustomButton
              title="다시 확인"
              onPress={checkAvailability}
              style={styles.button}
            />
          </View>
        </View>

        {/* 이메일 클라이언트 목록 */}
        {mailClients.length > 0 && (
          <View style={styles.section}>
            <TextBox
              variant="title3"
              color={theme.text}
              style={styles.sectionTitle}
            >
              사용 가능한 이메일 클라이언트
            </TextBox>
            <View
              style={[
                styles.clientsBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {mailClients.map((client, index) => (
                <View key={index} style={styles.clientItem}>
                  <TextBox variant="body2" color={theme.text}>
                    {client.label}
                  </TextBox>
                  {client.packageName && (
                    <TextBox variant="body4" color={theme.textSecondary}>
                      Package: {client.packageName}
                    </TextBox>
                  )}
                  {client.url && (
                    <TextBox variant="body4" color={theme.textSecondary}>
                      URL Scheme: {client.url}
                    </TextBox>
                  )}
                </View>
              ))}
            </View>
            <CustomButton
              title="클라이언트 목록 새로고침"
              onPress={loadMailClients}
              style={styles.button}
            />
          </View>
        )}

        {/* 이메일 작성 옵션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            이메일 작성 옵션
          </TextBox>

          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              받는 사람 (Recipients)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.hint}
            >
              쉼표로 구분하여 여러 주소 입력 가능
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
              value={recipients}
              onChangeText={setRecipients}
              placeholder="user@example.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              참조 (CC Recipients)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.hint}
            >
              쉼표로 구분하여 여러 주소 입력 가능
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
              value={ccRecipients}
              onChangeText={setCcRecipients}
              placeholder="cc@example.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              숨은 참조 (BCC Recipients)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.hint}
            >
              쉼표로 구분하여 여러 주소 입력 가능
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
              value={bccRecipients}
              onChangeText={setBccRecipients}
              placeholder="bcc@example.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              제목 (Subject)
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
              value={subject}
              onChangeText={setSubject}
              placeholder="이메일 제목"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              본문 (Body)
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
              value={body}
              onChangeText={setBody}
              placeholder="이메일 본문"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              첨부 파일 (Attachments)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.hint}
            >
              앱 내부 파일 URI를 쉼표로 구분하여 입력 (예:
              file:///path/to/file.pdf)
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
              value={attachments}
              onChangeText={setAttachments}
              placeholder="file:///path/to/file.pdf"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View
            style={[
              styles.checkboxContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <CustomButton
              title={isHtml ? 'HTML 모드 활성화됨' : 'HTML 모드 비활성화'}
              onPress={() => setIsHtml(!isHtml)}
              style={[
                styles.button,
                isHtml && { backgroundColor: theme.primary + '20' },
              ]}
              variant={isHtml ? 'primary' : 'ghost'}
            />
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.hint}
            >
              HTML 모드: 본문에 HTML 태그가 포함되어 있으면 활성화하세요.
              Android에서는 완벽하게 작동하지 않을 수 있습니다.
            </TextBox>
          </View>
        </View>

        {/* 이메일 작성 버튼 */}
        <View style={styles.section}>
          <CustomButton
            title="이메일 작성하기"
            onPress={composeEmail}
            style={[styles.button, styles.primaryButton]}
            disabled={!isAvailable}
          />
        </View>

        {/* 마지막 결과 */}
        {lastResult && (
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
                styles.resultBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextBox variant="body2" color={theme.text}>
                상태: {getStatusText(lastResult.status)}
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
              {`import * as MailComposer from 'expo-mail-composer';

// 사용 가능 여부 확인
const isAvailable = await MailComposer.isAvailableAsync();

// 이메일 클라이언트 목록 가져오기
const clients = MailComposer.getClients();

// 이메일 작성
const result = await MailComposer.composeAsync({
  recipients: ['user@example.com'],
  ccRecipients: ['cc@example.com'],
  bccRecipients: ['bcc@example.com'],
  subject: '테스트 이메일',
  body: '이메일 본문',
  isHtml: false,
  attachments: ['file:///path/to/file.pdf'],
});

// 결과 확인
switch (result.status) {
  case MailComposer.MailComposerStatus.SENT:
    console.log('전송됨');
    break;
  case MailComposer.MailComposerStatus.SAVED:
    console.log('저장됨');
    break;
  case MailComposer.MailComposerStatus.CANCELLED:
    console.log('취소됨');
    break;
}`}
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
  statusBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  clientsBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  clientItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    gap: 4,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
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
  primaryButton: {
    marginTop: 0,
  },
  resultBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
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
