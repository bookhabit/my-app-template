import { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import * as yup from 'yup';

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

export default function YupScreen() {
  const { theme } = useTheme();
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    age: '',
    password: '',
    confirmPassword: '',
  });

  const schema = yup.object({
    name: yup
      .string()
      .min(2, '이름은 최소 2자 이상이어야 합니다')
      .required('이름을 입력해주세요'),
    email: yup
      .string()
      .email('올바른 이메일 형식이 아닙니다')
      .required('이메일을 입력해주세요'),
    age: yup
      .number()
      .typeError('나이는 숫자여야 합니다')
      .min(18, '나이는 18세 이상이어야 합니다')
      .max(100, '나이는 100세 이하여야 합니다')
      .required('나이를 입력해주세요'),
    password: yup
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'
      )
      .required('비밀번호를 입력해주세요'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다')
      .required('비밀번호 확인을 입력해주세요'),
  });

  const handleValidate = async () => {
    try {
      const validated = await schema.validate(
        {
          ...formData,
          age: formData.age ? Number(formData.age) : undefined,
        },
        { abortEarly: false }
      );
      setValidationResult(`✅ 검증 성공!\n${JSON.stringify(validated, null, 2)}`);
      Alert.alert('검증 성공', '모든 필드가 유효합니다!');
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors = error.inner.map((err) => err.message).join('\n');
        setValidationResult(`❌ 검증 실패:\n${errors}`);
        Alert.alert('검증 실패', errors);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="Yup" showBackButton />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <TextBox variant="title2" color={theme.text} style={styles.heading}>
            Yup
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
                onChangeText={(value) => setFormData({ ...formData, name: value })}
                placeholder="최소 2자"
              />

              <Input
                label="이메일"
                value={formData.email}
                onChangeText={(value) => setFormData({ ...formData, email: value })}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="나이"
                value={formData.age}
                onChangeText={(value) => setFormData({ ...formData, age: value })}
                placeholder="18-100"
                keyboardType="numeric"
              />

              <Input
                label="비밀번호"
                value={formData.password}
                onChangeText={(value) => setFormData({ ...formData, password: value })}
                placeholder="최소 8자, 대소문자+숫자"
                secureTextEntry
              />

              <Input
                label="비밀번호 확인"
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  setFormData({ ...formData, confirmPassword: value })
                }
                placeholder="비밀번호를 다시 입력하세요"
                secureTextEntry
              />

              <CustomButton
                title="검증하기"
                onPress={handleValidate}
                variant="primary"
                size="large"
                fullWidth
                style={styles.validateButton}
              />

              {validationResult && (
                <View
                  style={[
                    styles.resultContainer,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <TextBox variant="body4" color={theme.text} style={styles.resultText}>
                    {validationResult}
                  </TextBox>
                </View>
              )}
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
  validateButton: {
    marginTop: 8,
  },
  resultContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  resultText: {
    fontFamily: 'monospace',
  },
});

