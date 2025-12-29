import { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import CustomHeader from '@/components/layout/CustomHeader';
import { Input } from '@/components/common/Input';
import { CustomButton } from '@/components/common/button';

interface FormData {
  name: string;
  email: string;
  age: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  age?: string;
  password?: string;
  confirmPassword?: string;
}

export default function VanillaReactScreen() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    age: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value) return '이름을 입력해주세요';
        if (value.length < 2) return '이름은 최소 2자 이상이어야 합니다';
        break;
      case 'email':
        if (!value) return '이메일을 입력해주세요';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return '올바른 이메일 형식이 아닙니다';
        break;
      case 'age':
        if (!value) return '나이를 입력해주세요';
        const ageNum = Number(value);
        if (isNaN(ageNum)) return '나이는 숫자여야 합니다';
        if (ageNum < 18) return '나이는 18세 이상이어야 합니다';
        if (ageNum > 100) return '나이는 100세 이하여야 합니다';
        break;
      case 'password':
        if (!value) return '비밀번호를 입력해주세요';
        if (value.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다';
        break;
      case 'confirmPassword':
        if (!value) return '비밀번호 확인을 입력해주세요';
        if (value !== formData.password) return '비밀번호가 일치하지 않습니다';
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof FormData]);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async () => {
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmittedData({ ...formData });
      Alert.alert('제출 성공', '폼이 성공적으로 제출되었습니다.');
      console.log('제출된 데이터:', formData);
    } catch (error) {
      console.error('제출 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      age: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setTouched({});
    setSubmittedData(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="순수 React (Vanilla React)" showBackButton />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <TextBox variant="title2" color={theme.text} style={styles.heading}>
            순수 React (Vanilla React)
          </TextBox>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.form}>
              <Input
                label="이름"
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                onBlur={() => handleBlur('name')}
                placeholder="이름을 입력하세요"
                error={touched.name && errors.name ? errors.name : undefined}
              />

              <Input
                label="이메일"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                onBlur={() => handleBlur('email')}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={touched.email && errors.email ? errors.email : undefined}
              />

              <Input
                label="나이"
                value={formData.age}
                onChangeText={(value) => handleChange('age', value)}
                onBlur={() => handleBlur('age')}
                placeholder="18-100"
                keyboardType="numeric"
                error={touched.age && errors.age ? errors.age : undefined}
              />

              <Input
                label="비밀번호"
                value={formData.password}
                onChangeText={(value) => handleChange('password', value)}
                onBlur={() => handleBlur('password')}
                placeholder="최소 8자"
                secureTextEntry
                error={touched.password && errors.password ? errors.password : undefined}
              />

              <Input
                label="비밀번호 확인"
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange('confirmPassword', value)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="비밀번호를 다시 입력하세요"
                secureTextEntry
                error={
                  touched.confirmPassword && errors.confirmPassword
                    ? errors.confirmPassword
                    : undefined
                }
              />

              <View style={styles.buttonRow}>
                <CustomButton
                  title={isSubmitting ? '제출 중...' : '제출'}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  variant="primary"
                  size="large"
                  loading={isSubmitting}
                  fullWidth
                  style={styles.submitButton}
                />
                <CustomButton
                  title="초기화"
                  onPress={handleReset}
                  variant="outline"
                  size="large"
                  style={styles.resetButton}
                />
              </View>
            </View>

            {submittedData && (
              <View
                style={[
                  styles.resultContainer,
                  {
                    backgroundColor: theme.primary + '20',
                    borderColor: theme.primary,
                  },
                ]}
              >
                <TextBox variant="body3" color={theme.primary} style={styles.resultTitle}>
                  제출된 데이터:
                </TextBox>
                <TextBox variant="body4" color={theme.text}>
                  {JSON.stringify(submittedData, null, 2)}
                </TextBox>
              </View>
            )}

            <View
              style={[
                styles.statusContainer,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <TextBox variant="body3" color={theme.text} style={styles.statusTitle}>
                현재 Form 상태:
              </TextBox>
              <View style={styles.statusRow}>
                <TextBox variant="body4" color={theme.textSecondary}>
                  변경됨:{' '}
                  {Object.values(formData).some((v) => v !== '') ? '✅' : '❌'}
                </TextBox>
                <TextBox variant="body4" color={theme.textSecondary}>
                  유효성:{' '}
                  {Object.keys(errors).length === 0 &&
                  Object.values(formData).every((v) => v !== '')
                    ? '✅ 통과'
                    : '❌ 실패'}
                </TextBox>
                <TextBox variant="body4" color={theme.textSecondary}>
                  제출 중: {isSubmitting ? '⏳' : '✓'}
                </TextBox>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    padding: 20,
  },
  heading: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  form: {
    gap: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  submitButton: {
    flex: 1,
  },
  resetButton: {
    flex: 0.5,
  },
  resultContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  resultTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  statusRow: {
    gap: 8,
  },
});

