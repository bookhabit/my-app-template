import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';

import { useRouter } from 'expo-router';

import { useAuthState } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

export default function CreateAccountScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { register } = useAuthState();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});

      // 회원가입 성공 시 authState의 상태가 변경되면
      // index.tsx와 _layout.tsx에서 자동으로 라우팅 처리됨
      await register({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
      });

      // 상태 변경만 하면 자동 라우팅되므로 별도 라우팅 불필요
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '회원가입에 실패했습니다.';
      Alert.alert('회원가입 실패', errorMessage);

      // 이메일 중복 에러 처리
      if (
        errorMessage.includes('Email already in use') ||
        errorMessage.includes('이메일')
      ) {
        setErrors({ email: '이미 사용 중인 이메일입니다.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginPress = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <TextBox variant="title1" color={theme.text} style={styles.title}>
            ✨ 회원가입
          </TextBox>

          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.subtitle}
          >
            새 계정을 만들어주세요
          </TextBox>

          <View style={[styles.form, { backgroundColor: theme.surface }]}>
            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text} style={styles.label}>
                이름 (선택)
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    borderColor: errors.name
                      ? theme.error || '#ff4444'
                      : theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="이름을 입력하세요"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
                autoCapitalize="words"
                editable={!isLoading}
              />
              {errors.name && (
                <TextBox
                  variant="caption2"
                  color={theme.error || '#ff4444'}
                  style={styles.errorText}
                >
                  {errors.name}
                </TextBox>
              )}
            </View>

            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text} style={styles.label}>
                이메일
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    borderColor: errors.email
                      ? theme.error || '#ff4444'
                      : theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="이메일을 입력하세요"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
              {errors.email && (
                <TextBox
                  variant="caption2"
                  color={theme.error || '#ff4444'}
                  style={styles.errorText}
                >
                  {errors.email}
                </TextBox>
              )}
            </View>

            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text} style={styles.label}>
                비밀번호
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    borderColor: errors.password
                      ? theme.error || '#ff4444'
                      : theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="비밀번호를 입력하세요 (최소 6자)"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined });
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!isLoading}
              />
              {errors.password && (
                <TextBox
                  variant="caption2"
                  color={theme.error || '#ff4444'}
                  style={styles.errorText}
                >
                  {errors.password}
                </TextBox>
              )}
            </View>

            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text} style={styles.label}>
                비밀번호 확인
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    borderColor: errors.confirmPassword
                      ? theme.error || '#ff4444'
                      : theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="비밀번호를 다시 입력하세요"
                placeholderTextColor={theme.textSecondary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined });
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!isLoading}
              />
              {errors.confirmPassword && (
                <TextBox
                  variant="caption2"
                  color={theme.error || '#ff4444'}
                  style={styles.errorText}
                >
                  {errors.confirmPassword}
                </TextBox>
              )}
            </View>

            <Pressable
              style={[
                styles.registerButton,
                {
                  backgroundColor: isLoading
                    ? theme.textSecondary
                    : theme.primary,
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <TextBox variant="button2" color="#fff">
                  회원가입
                </TextBox>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <TextBox variant="caption2" color={theme.textSecondary}>
              이미 계정이 있으신가요?{' '}
            </TextBox>
            <Pressable onPress={handleLoginPress} disabled={isLoading}>
              <TextBox variant="caption2" color={theme.primary}>
                로그인
              </TextBox>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  content: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  errorText: {
    marginTop: 4,
  },
});
