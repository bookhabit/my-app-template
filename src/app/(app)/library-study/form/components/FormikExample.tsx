import { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert, Pressable } from 'react-native';

import Checkbox from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@/context/ThemeProvider';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { Input } from '@/components/common/Input';
import SelectBox from '@/components/common/SelectBox';
import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

// Yup 스키마 정의
const validationSchema = yup.object({
  name: yup
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .required('이름을 입력해주세요'),
  email: yup
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .required('이메일을 입력해주세요'),
  password: yup
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .required('비밀번호를 입력해주세요'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다')
    .required('비밀번호 확인을 입력해주세요'),
  age: yup
    .number()
    .min(18, '나이는 18세 이상이어야 합니다')
    .max(100, '나이는 100세 이하여야 합니다')
    .required('나이를 입력해주세요'),
  phone: yup
    .string()
    .matches(/^[0-9-]+$/, '올바른 전화번호 형식이 아닙니다')
    .min(10, '전화번호는 최소 10자 이상이어야 합니다')
    .required('전화번호를 입력해주세요'),
  website: yup.string().url('올바른 URL 형식이 아닙니다').optional(),
  birthDate: yup.date().required('생년월일을 선택해주세요'),
  satisfaction: yup.number().min(0).max(100).optional(),
  favoriteColor: yup.string().optional(),
  agreeToTerms: yup.boolean().oneOf([true], '약관에 동의해주세요').required(),
  subscribeNewsletter: yup.boolean().optional(),
  gender: yup
    .string<'male' | 'female' | 'other'>()
    .oneOf(['male', 'female', 'other'], '성별을 선택해주세요')
    .required('성별을 선택해주세요'),
  country: yup.string().required('국가를 선택해주세요'),
  bio: yup.string().max(500, '자기소개는 500자 이하여야 합니다').optional(),
  searchQuery: yup.string().optional(),
});

type FormValues = yup.InferType<typeof validationSchema>;

export default function FormikExample() {
  const { theme } = useTheme();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: 0,
      phone: '',
      website: '',
      birthDate: new Date(),
      satisfaction: 50,
      favoriteColor: '#000000',
      agreeToTerms: false,
      subscribeNewsletter: false,
      gender: 'male' as 'male' | 'female' | 'other',
      country: '',
      bio: '',
      searchQuery: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(false);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (Math.random() < 0.1) {
          throw new Error('서버 오류가 발생했습니다. 다시 시도해주세요.');
        }

        console.log('제출된 데이터:', values);
        setSubmitSuccess(true);
        Alert.alert(
          '제출 성공',
          `이름: ${values.name}\n이메일: ${values.email}\n나이: ${values.age}`
        );
        resetForm();
        setAvatarUri(null);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다'
        );
        console.error('제출 오류:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const countryOptions = [
    { label: '대한민국', value: 'kr' },
    { label: '미국', value: 'us' },
    { label: '일본', value: 'jp' },
    { label: '중국', value: 'cn' },
    { label: '영국', value: 'uk' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.surface }]}
      contentContainerStyle={styles.content}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <TextBox variant="title3" color={theme.text} style={styles.title}>
          Formik + Yup
        </TextBox>
        <TextBox
          variant="body4"
          color={theme.textSecondary}
          style={styles.status}
        >
          Form 상태: {formik.dirty ? '변경됨' : '초기'} | 유효성:{' '}
          {formik.isValid ? '✅ 통과' : '❌ 실패'} | 제출 중:{' '}
          {formik.isSubmitting ? '⏳' : '✓'}
        </TextBox>

        {submitError && (
          <View
            style={[
              styles.errorContainer,
              {
                backgroundColor: theme.error + '20',
                borderColor: theme.error,
              },
            ]}
          >
            <TextBox variant="body4" color={theme.error}>
              {submitError}
            </TextBox>
          </View>
        )}

        {submitSuccess && (
          <View
            style={[
              styles.successContainer,
              {
                backgroundColor: theme.primary + '20',
                borderColor: theme.primary,
              },
            ]}
          >
            <TextBox variant="body4" color={theme.primary}>
              제출이 성공적으로 완료되었습니다!
            </TextBox>
          </View>
        )}

        <View style={styles.form}>
          {/* 기본 텍스트 입력 */}

          <Input
            label="이름 (text)"
            value={formik.values.name}
            onChangeText={formik.handleChange('name')}
            onBlur={formik.handleBlur('name')}
            placeholder="이름을 입력하세요"
            error={
              formik.touched.name && formik.errors.name
                ? formik.errors.name
                : undefined
            }
            containerStyle={styles.inputHalf}
          />

          <Input
            label="이메일 (email)"
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={
              formik.touched.email && formik.errors.email
                ? formik.errors.email
                : undefined
            }
            containerStyle={styles.inputHalf}
          />

          {/* 비밀번호 입력 */}

          <Input
            label="비밀번호 (password)"
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            placeholder="최소 8자 이상"
            secureTextEntry
            error={
              formik.touched.password && formik.errors.password
                ? formik.errors.password
                : undefined
            }
            containerStyle={styles.inputHalf}
          />

          <Input
            label="비밀번호 확인"
            value={formik.values.confirmPassword}
            onChangeText={formik.handleChange('confirmPassword')}
            onBlur={formik.handleBlur('confirmPassword')}
            placeholder="비밀번호를 다시 입력하세요"
            secureTextEntry
            error={
              formik.touched.confirmPassword && formik.errors.confirmPassword
                ? formik.errors.confirmPassword
                : undefined
            }
            containerStyle={styles.inputHalf}
          />

          {/* 숫자 입력 */}

          <Input
            label="나이 (number)"
            value={formik.values.age?.toString() || ''}
            onChangeText={(text) =>
              formik.setFieldValue('age', text ? Number(text) : 0)
            }
            onBlur={formik.handleBlur('age')}
            placeholder="18-100"
            keyboardType="numeric"
            error={
              formik.touched.age && formik.errors.age
                ? formik.errors.age
                : undefined
            }
            containerStyle={styles.inputHalf}
          />

          <Input
            label="전화번호 (tel)"
            value={formik.values.phone}
            onChangeText={formik.handleChange('phone')}
            onBlur={formik.handleBlur('phone')}
            placeholder="010-1234-5678"
            keyboardType="phone-pad"
            error={
              formik.touched.phone && formik.errors.phone
                ? formik.errors.phone
                : undefined
            }
            containerStyle={styles.inputHalf}
          />

          {/* URL 입력 */}
          <Input
            label="웹사이트 (url)"
            value={formik.values.website || ''}
            onChangeText={formik.handleChange('website')}
            onBlur={formik.handleBlur('website')}
            placeholder="https://example.com"
            keyboardType="url"
            autoCapitalize="none"
            error={
              formik.touched.website && formik.errors.website
                ? formik.errors.website
                : undefined
            }
          />

          {/* 날짜 선택 */}
          <View style={styles.dateContainer}>
            <TextBox variant="body3" color={theme.text} style={styles.label}>
              생년월일 (date) *
            </TextBox>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.dateButton,
                {
                  backgroundColor: theme.surface,
                  borderColor:
                    formik.touched.birthDate && formik.errors.birthDate
                      ? theme.error
                      : theme.border,
                },
              ]}
            >
              <TextBox variant="body2" color={theme.text}>
                {formik.values.birthDate
                  ? formik.values.birthDate.toLocaleDateString('ko-KR')
                  : '날짜 선택'}
              </TextBox>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={formik.values.birthDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    formik.setFieldValue('birthDate', selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}
            {formik.touched.birthDate && formik.errors.birthDate && (
              <TextBox
                variant="caption3"
                color={theme.error}
                style={styles.errorText}
              >
                {''}
              </TextBox>
            )}
          </View>

          {/* 범위 입력 */}
          <View style={styles.sliderContainer}>
            <TextBox variant="body3" color={theme.text} style={styles.label}>
              만족도: {formik.values.satisfaction || 0}% (range)
            </TextBox>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={formik.values.satisfaction || 50}
              onValueChange={(value) =>
                formik.setFieldValue('satisfaction', value)
              }
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
            />
            {formik.touched.satisfaction && formik.errors.satisfaction && (
              <TextBox
                variant="caption3"
                color={theme.error}
                style={styles.errorText}
              >
                {formik.errors.satisfaction}
              </TextBox>
            )}
          </View>

          {/* 색상 선택 */}
          <View style={styles.colorContainer}>
            <TextBox variant="body3" color={theme.text} style={styles.label}>
              좋아하는 색상 (color)
            </TextBox>
            <View style={styles.colorRow}>
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: formik.values.favoriteColor || '#000000' },
                ]}
              />
              <Input
                value={formik.values.favoriteColor || '#000000'}
                onChangeText={formik.handleChange('favoriteColor')}
                placeholder="#000000"
                containerStyle={styles.colorInput}
              />
            </View>
          </View>

          {/* 파일 업로드 */}
          <View style={styles.fileContainer}>
            <TextBox variant="body3" color={theme.text} style={styles.label}>
              프로필 사진 (file)
            </TextBox>
            <CustomButton
              title={avatarUri ? '이미지 변경' : '이미지 선택'}
              onPress={pickImage}
              variant="outline"
              size="medium"
            />
            {avatarUri && (
              <TextBox
                variant="caption2"
                color={theme.textSecondary}
                style={styles.fileInfo}
              >
                이미지가 선택되었습니다
              </TextBox>
            )}
          </View>

          {/* 체크박스 */}
          <View style={styles.checkboxContainer}>
            <View style={styles.checkboxRow}>
              <Checkbox
                value={formik.values.agreeToTerms}
                onValueChange={(value) =>
                  formik.setFieldValue('agreeToTerms', value)
                }
                color={theme.primary}
              />
              <Pressable
                onPress={() =>
                  formik.setFieldValue(
                    'agreeToTerms',
                    !formik.values.agreeToTerms
                  )
                }
                style={styles.checkboxLabel}
              >
                <TextBox variant="body3" color={theme.text}>
                  약관에 동의합니다 (checkbox) *
                </TextBox>
              </Pressable>
            </View>
            {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
              <TextBox
                variant="caption3"
                color={theme.error}
                style={styles.errorText}
              >
                {formik.errors.agreeToTerms}
              </TextBox>
            )}

            <View style={styles.checkboxRow}>
              <Checkbox
                value={formik.values.subscribeNewsletter || false}
                onValueChange={(value) =>
                  formik.setFieldValue('subscribeNewsletter', value)
                }
                color={theme.primary}
              />
              <Pressable
                onPress={() =>
                  formik.setFieldValue(
                    'subscribeNewsletter',
                    !formik.values.subscribeNewsletter
                  )
                }
                style={styles.checkboxLabel}
              >
                <TextBox variant="body3" color={theme.text}>
                  뉴스레터 구독 (checkbox)
                </TextBox>
              </Pressable>
            </View>
          </View>

          {/* 라디오 버튼 */}
          <View style={styles.radioContainer}>
            <TextBox variant="body3" color={theme.text} style={styles.label}>
              성별 (radio) *
            </TextBox>
            <View style={styles.radioGroup}>
              {(['male', 'female', 'other'] as const).map((option) => (
                <Pressable
                  key={option}
                  onPress={() => formik.setFieldValue('gender', option)}
                  style={styles.radioOption}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor:
                          formik.values.gender === option
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                  >
                    {formik.values.gender === option && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: theme.primary },
                        ]}
                      />
                    )}
                  </View>
                  <TextBox variant="body3" color={theme.text}>
                    {option === 'male'
                      ? '남성'
                      : option === 'female'
                        ? '여성'
                        : '기타'}
                  </TextBox>
                </Pressable>
              ))}
            </View>
            {formik.touched.gender && formik.errors.gender && (
              <TextBox
                variant="caption3"
                color={theme.error}
                style={styles.errorText}
              >
                {formik.errors.gender}
              </TextBox>
            )}
          </View>

          {/* 셀렉트 드롭다운 */}
          <View style={styles.selectContainer}>
            <TextBox variant="body3" color={theme.text} style={styles.label}>
              국가 (select) *
            </TextBox>
            <SelectBox
              options={countryOptions}
              selectedValue={formik.values.country}
              onValueChange={(value) => formik.setFieldValue('country', value)}
              placeholder="선택하세요"
            />
            {formik.touched.country && formik.errors.country && (
              <TextBox
                variant="caption3"
                color={theme.error}
                style={styles.errorText}
              >
                {formik.errors.country}
              </TextBox>
            )}
          </View>

          {/* 텍스트 영역 */}
          <Input
            label="자기소개 (textarea)"
            value={formik.values.bio || ''}
            onChangeText={formik.handleChange('bio')}
            onBlur={formik.handleBlur('bio')}
            placeholder="자기소개를 입력하세요 (최대 500자)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            error={
              formik.touched.bio && formik.errors.bio
                ? formik.errors.bio
                : undefined
            }
          />

          {/* 검색 입력 */}
          <Input
            label="검색 (search)"
            value={formik.values.searchQuery || ''}
            onChangeText={formik.handleChange('searchQuery')}
            onBlur={formik.handleBlur('searchQuery')}
            placeholder="검색어를 입력하세요"
            error={
              formik.touched.searchQuery && formik.errors.searchQuery
                ? formik.errors.searchQuery
                : undefined
            }
          />

          {/* 제출 버튼 */}
          <View style={styles.buttonRow}>
            <CustomButton
              title={formik.isSubmitting ? '제출 중...' : '제출'}
              onPress={formik.handleSubmit}
              disabled={formik.isSubmitting}
              variant="primary"
              size="large"
              loading={formik.isSubmitting}
              fullWidth
              style={styles.submitButton}
            />
            <CustomButton
              title="초기화"
              onPress={() => {
                formik.resetForm();
                setSubmitError(null);
                setSubmitSuccess(false);
                setAvatarUri(null);
              }}
              variant="outline"
              size="large"
              style={styles.resetButton}
            />
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
    padding: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  title: {
    marginBottom: 8,
  },
  status: {
    marginBottom: 16,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  successContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  dateContainer: {
    gap: 8,
  },
  dateButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  label: {
    marginBottom: 8,
  },
  errorText: {
    marginTop: 4,
  },
  sliderContainer: {
    gap: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  colorContainer: {
    gap: 8,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  colorInput: {
    flex: 1,
  },
  fileContainer: {
    gap: 8,
  },
  fileInfo: {
    marginTop: 4,
  },
  checkboxContainer: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxLabel: {
    flex: 1,
  },
  radioContainer: {
    gap: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  selectContainer: {
    gap: 8,
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
});
