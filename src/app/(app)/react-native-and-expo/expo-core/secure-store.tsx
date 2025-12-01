import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Platform,
  TextInput,
} from 'react-native';

import * as SecureStore from 'expo-secure-store';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function SecureStoreScreen() {
  const { theme } = useTheme();

  // State
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [canUseBiometric, setCanUseBiometric] = useState(false);

  // Store operations
  const [storeKey, setStoreKey] = useState('myKey');
  const [storeValue, setStoreValue] = useState('mySecretValue');
  const [retrievedValue, setRetrievedValue] = useState<string | null>(null);
  const [retrieveKey, setRetrieveKey] = useState('myKey');

  // Options
  const [requireAuth, setRequireAuth] = useState(false);
  const [authPrompt, setAuthPrompt] = useState('인증이 필요합니다');
  const [keychainService, setKeychainService] = useState('');
  const [accessGroup, setAccessGroup] = useState('');
  const [keychainAccessible, setKeychainAccessible] =
    useState<string>('WHEN_UNLOCKED');

  // Stored keys list
  const [storedKeys, setStoredKeys] = useState<string[]>([]);

  useEffect(() => {
    checkAvailability();
    checkBiometric();
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await SecureStore.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      console.error('Failed to check availability:', error);
      setIsAvailable(false);
    }
  };

  const checkBiometric = () => {
    const canUse = SecureStore.canUseBiometricAuthentication();
    setCanUseBiometric(canUse);
  };

  const storeItem = async () => {
    if (!storeKey.trim() || !storeValue.trim()) {
      Alert.alert('알림', '키와 값을 입력하세요.');
      return;
    }

    try {
      const options: SecureStore.SecureStoreOptions = {
        requireAuthentication: requireAuth,
        authenticationPrompt: requireAuth ? authPrompt : undefined,
        keychainService: keychainService || undefined,
        accessGroup: accessGroup || undefined,
        keychainAccessible:
          Platform.OS === 'ios'
            ? (SecureStore as any)[keychainAccessible]
            : undefined,
      };

      await SecureStore.setItemAsync(storeKey, storeValue, options);
      Alert.alert('성공', '값이 저장되었습니다.');
      setStoredKeys((prev) =>
        prev.includes(storeKey) ? prev : [...prev, storeKey]
      );
    } catch (error: any) {
      Alert.alert('오류', `저장 실패: ${error.message || error}`);
    }
  };

  const retrieveItem = async () => {
    if (!retrieveKey.trim()) {
      Alert.alert('알림', '키를 입력하세요.');
      return;
    }

    try {
      const options: SecureStore.SecureStoreOptions = {
        requireAuthentication: requireAuth,
        authenticationPrompt: requireAuth ? authPrompt : undefined,
        keychainService: keychainService || undefined,
        accessGroup: accessGroup || undefined,
        keychainAccessible:
          Platform.OS === 'ios'
            ? (SecureStore as any)[keychainAccessible]
            : undefined,
      };

      const value = await SecureStore.getItemAsync(retrieveKey, options);
      setRetrievedValue(value);
      if (value) {
        Alert.alert('성공', '값을 가져왔습니다.');
      } else {
        Alert.alert('알림', '해당 키에 대한 값이 없습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', `조회 실패: ${error.message || error}`);
      setRetrievedValue(null);
    }
  };

  const deleteItem = async (key: string) => {
    try {
      const options: SecureStore.SecureStoreOptions = {
        keychainService: keychainService || undefined,
        accessGroup: accessGroup || undefined,
      };

      await SecureStore.deleteItemAsync(key, options);
      Alert.alert('성공', '값이 삭제되었습니다.');
      setStoredKeys((prev) => prev.filter((k) => k !== key));
      if (retrieveKey === key) {
        setRetrievedValue(null);
      }
    } catch (error: any) {
      Alert.alert('오류', `삭제 실패: ${error.message || error}`);
    }
  };

  const getAccessibleConstant = (value: string) => {
    const constants: Record<string, any> = {
      WHEN_UNLOCKED: SecureStore.WHEN_UNLOCKED,
      WHEN_UNLOCKED_THIS_DEVICE_ONLY:
        SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      AFTER_FIRST_UNLOCK: SecureStore.AFTER_FIRST_UNLOCK,
      AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY:
        SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      ALWAYS: SecureStore.ALWAYS,
      ALWAYS_THIS_DEVICE_ONLY: SecureStore.ALWAYS_THIS_DEVICE_ONLY,
      WHEN_PASSCODE_SET_THIS_DEVICE_ONLY:
        SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    };
    return constants[value];
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="SecureStore" showBackButton />
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
              사용 가능:{' '}
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
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              생체 인증 사용 가능:{' '}
              <TextBox
                variant="body2"
                color={canUseBiometric ? theme.success : theme.textSecondary}
              >
                {canUseBiometric ? '예' : '아니오'}
              </TextBox>
            </TextBox>
          </View>
        </View>

        {/* 값 저장 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            값 저장
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              키
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
              value={storeKey}
              onChangeText={setStoreKey}
              placeholder="myKey"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              값
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
              value={storeValue}
              onChangeText={setStoreValue}
              placeholder="mySecretValue"
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
              title={requireAuth ? '인증 필요함' : '인증 불필요'}
              onPress={() => setRequireAuth(!requireAuth)}
              style={styles.button}
              variant={requireAuth ? 'primary' : 'ghost'}
              disabled={!canUseBiometric}
            />
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.hint}
            >
              생체 인증이 필요할 때만 활성화하세요. Expo Go에서는 지원되지 않을
              수 있습니다.
            </TextBox>
          </View>
          {requireAuth && (
            <View style={styles.inputGroup}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                인증 프롬프트 메시지
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
                value={authPrompt}
                onChangeText={setAuthPrompt}
                placeholder="인증이 필요합니다"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          )}
          {Platform.OS === 'ios' && (
            <>
              <View style={styles.inputGroup}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  Keychain Service (선택사항)
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
                  value={keychainService}
                  onChangeText={setKeychainService}
                  placeholder="com.example.service"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  Access Group (선택사항)
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
                  value={accessGroup}
                  onChangeText={setAccessGroup}
                  placeholder="group.com.example"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  Keychain Accessible
                </TextBox>
                <View style={styles.optionsRow}>
                  {[
                    'WHEN_UNLOCKED',
                    'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
                    'AFTER_FIRST_UNLOCK',
                    'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
                  ].map((value) => (
                    <CustomButton
                      key={value}
                      title={value.replace(/_/g, ' ')}
                      onPress={() => setKeychainAccessible(value)}
                      style={[styles.button, styles.flex1]}
                      variant={
                        keychainAccessible === value ? 'primary' : 'ghost'
                      }
                    />
                  ))}
                </View>
              </View>
            </>
          )}
          <CustomButton
            title="값 저장"
            onPress={storeItem}
            style={styles.button}
            disabled={!isAvailable}
          />
        </View>

        {/* 값 조회 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            값 조회
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              키
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
              value={retrieveKey}
              onChangeText={setRetrieveKey}
              placeholder="myKey"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <CustomButton
            title="값 조회"
            onPress={retrieveItem}
            style={styles.button}
            disabled={!isAvailable}
          />
          {retrievedValue !== null && (
            <View
              style={[
                styles.resultBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextBox variant="body2" color={theme.text}>
                조회된 값:
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.primary}
                style={styles.marginTop}
              >
                {retrievedValue || '(없음)'}
              </TextBox>
            </View>
          )}
        </View>

        {/* 저장된 키 목록 */}
        {storedKeys.length > 0 && (
          <View style={styles.section}>
            <TextBox
              variant="title3"
              color={theme.text}
              style={styles.sectionTitle}
            >
              저장된 키 목록
            </TextBox>
            <View
              style={[
                styles.keysContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {storedKeys.map((key) => (
                <View
                  key={key}
                  style={[styles.keyItem, { borderColor: theme.border }]}
                >
                  <TextBox
                    variant="body2"
                    color={theme.text}
                    style={styles.flex1}
                  >
                    {key}
                  </TextBox>
                  <CustomButton
                    title="조회"
                    onPress={() => {
                      setRetrieveKey(key);
                      retrieveItem();
                    }}
                    style={styles.smallButton}
                    variant="ghost"
                  />
                  <CustomButton
                    title="삭제"
                    onPress={() => deleteItem(key)}
                    style={styles.smallButton}
                    variant="ghost"
                  />
                </View>
              ))}
            </View>
          </View>
        )}
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
  checkboxContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  button: {
    marginTop: 8,
  },
  smallButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 32,
  },
  resultBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  keysContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  keyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
});
