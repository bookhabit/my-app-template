import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ScrollView, StyleSheet, View, Alert, Pressable } from 'react-native';

import Checkbox from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@/context/ThemeProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { z } from 'zod';

import { Input } from '@/components/common/Input';
import SelectBox from '@/components/common/SelectBox';
import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

// Zod 스키마 정의
const formSchema = z
  .object({
    name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
    email: z.string().email('올바른 이메일 형식이 아닙니다'),
    password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
    confirmPassword: z.string(),
    age: z
      .number()
      .min(18, '나이는 18세 이상이어야 합니다')
      .max(100, '나이는 100세 이하여야 합니다'),
    phone: z
      .string()
      .regex(/^[0-9-]+$/, '올바른 전화번호 형식이 아닙니다')
      .min(10, '전화번호는 최소 10자 이상이어야 합니다'),
    website: z
      .string()
      .url('올바른 URL 형식이 아닙니다')
      .optional()
      .or(z.literal('')),
    birthDate: z.date().refine((date) => date <= new Date(), {
      message: '생년월일을 선택해주세요',
    }),
    satisfaction: z.number().min(0).max(100).optional(),
    favoriteColor: z.string().optional(),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, '약관에 동의해주세요'),
    subscribeNewsletter: z.boolean().optional(),
    gender: z.enum(['male', 'female', 'other'], {
      message: '성별을 선택해주세요',
    }),
    country: z.string().min(1, '국가를 선택해주세요'),
    bio: z.string().max(500, '자기소개는 500자 이하여야 합니다').optional(),
    searchQuery: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof formSchema>;

export default function ReactHookFormExample() {
  const { theme } = useTheme();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      agreeToTerms: false,
      subscribeNewsletter: false,
      satisfaction: 50,
      gender: 'male',
      favoriteColor: '#000000',
    },
  });

  const satisfactionValue = watch('satisfaction');

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

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (Math.random() < 0.1) {
        throw new Error('서버 오류가 발생했습니다. 다시 시도해주세요.');
      }

      console.log('제출된 데이터:', data);
      setSubmitSuccess(true);
      Alert.alert(
        '제출 성공',
        `이름: ${data.name}\n이메일: ${data.email}\n나이: ${data.age}`
      );
      reset();
      setAvatarUri(null);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다'
      );
      console.error('제출 오류:', error);
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
          React Hook Form + Zod
        </TextBox>
        <TextBox
          variant="body4"
          color={theme.textSecondary}
          style={styles.status}
        >
          Form 상태: {isDirty ? '변경됨' : '초기'} | 유효성:{' '}
          {isValid ? '✅ 통과' : '❌ 실패'} | 제출 중:{' '}
          {isSubmitting ? '⏳' : '✓'}
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

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="이름 (text)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="이름을 입력하세요"
                error={errors.name?.message}
                containerStyle={styles.inputHalf}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="이메일 (email)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
                containerStyle={styles.inputHalf}
              />
            )}
          />
        </View>

        {/* 비밀번호 입력 */}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="비밀번호 (password)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="최소 8자 이상"
              secureTextEntry
              error={errors.password?.message}
              containerStyle={styles.inputHalf}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="비밀번호 확인"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="비밀번호를 다시 입력하세요"
              secureTextEntry
              error={errors.confirmPassword?.message}
              containerStyle={styles.inputHalf}
            />
          )}
        />
      </View>

      {/* 숫자 입력 */}

      <Controller
        control={control}
        name="age"
        render={({ field: { onChange, value } }) => (
          <Input
            label="나이 (number)"
            value={value?.toString() || ''}
            onChangeText={(text) => onChange(text ? Number(text) : undefined)}
            placeholder="18-100"
            keyboardType="numeric"
            error={errors.age?.message}
            containerStyle={styles.inputHalf}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="전화번호 (tel)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="010-1234-5678"
            keyboardType="phone-pad"
            error={errors.phone?.message}
            containerStyle={styles.inputHalf}
          />
        )}
      />

      {/* URL 입력 */}
      <Controller
        control={control}
        name="website"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="웹사이트 (url)"
            value={value || ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="https://example.com"
            keyboardType="url"
            autoCapitalize="none"
            error={errors.website?.message}
          />
        )}
      />

      {/* 날짜 선택 */}
      <Controller
        control={control}
        name="birthDate"
        render={({ field: { onChange, value } }) => (
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
                  borderColor: errors.birthDate ? theme.error : theme.border,
                },
              ]}
            >
              <TextBox variant="body2" color={theme.text}>
                {value ? value.toLocaleDateString('ko-KR') : '날짜 선택'}
              </TextBox>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={value || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    onChange(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}
            {errors.birthDate && (
              <TextBox
                variant="caption3"
                color={theme.error}
                style={styles.errorText}
              >
                {errors.birthDate.message}
              </TextBox>
            )}
          </View>
        )}
      />

      {/* 범위 입력 */}
      <Controller
        control={control}
        name="satisfaction"
        render={({ field: { onChange, value } }) => (
          <View style={styles.sliderContainer}>
            <TextBox variant="body3" color={theme.text} style={styles.label}>
              만족도: {value || 0}% (range)
            </TextBox>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={value || 50}
              onValueChange={onChange}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
            />
            {errors.satisfaction && (
              <TextBox
                variant="caption3"
                color={theme.error}
                style={styles.errorText}
              >
                {errors.satisfaction.message}
              </TextBox>
            )}
          </View>
        )}
      />

      {/* 색상 선택 */}
      <Controller
        control={control}
        name="favoriteColor"
        render={({ field: { onChange, value } }) => (
          <View style={styles.colorContainer}>
            <TextBox variant="body3" color={theme.text} style={styles.label}>
              좋아하는 색상 (color)
            </TextBox>
            <View style={styles.colorRow}>
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: value || '#000000' },
                ]}
              />
              <Input
                value={value || '#000000'}
                onChangeText={onChange}
                placeholder="#000000"
                containerStyle={styles.colorInput}
              />
            </View>
          </View>
        )}
      />

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
        <Controller
          control={control}
          name="agreeToTerms"
          render={({ field: { onChange, value } }) => (
            <View style={styles.checkboxRow}>
              <Checkbox
                value={value}
                onValueChange={onChange}
                color={theme.primary}
              />
              <Pressable
                onPress={() => onChange(!value)}
                style={styles.checkboxLabel}
              >
                <TextBox variant="body3" color={theme.text}>
                  약관에 동의합니다 (checkbox) *
                </TextBox>
              </Pressable>
            </View>
          )}
        />
        {errors.agreeToTerms && (
          <TextBox
            variant="caption3"
            color={theme.error}
            style={styles.errorText}
          >
            {errors.agreeToTerms.message}
          </TextBox>
        )}

        <Controller
          control={control}
          name="subscribeNewsletter"
          render={({ field: { onChange, value } }) => (
            <View style={styles.checkboxRow}>
              <Checkbox
                value={value || false}
                onValueChange={onChange}
                color={theme.primary}
              />
              <Pressable
                onPress={() => onChange(!value)}
                style={styles.checkboxLabel}
              >
                <TextBox variant="body3" color={theme.text}>
                  뉴스레터 구독 (checkbox)
                </TextBox>
              </Pressable>
            </View>
          )}
        />
      </View>

      {/* 라디오 버튼 */}
      <View style={styles.radioContainer}>
        <TextBox variant="body3" color={theme.text} style={styles.label}>
          성별 (radio) *
        </TextBox>
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <View style={styles.radioGroup}>
              {(['male', 'female', 'other'] as const).map((option) => (
                <Pressable
                  key={option}
                  onPress={() => onChange(option)}
                  style={styles.radioOption}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor:
                          value === option ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    {value === option && (
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
          )}
        />
        {errors.gender && (
          <TextBox
            variant="caption3"
            color={theme.error}
            style={styles.errorText}
          >
            {errors.gender.message}
          </TextBox>
        )}
      </View>

      {/* 셀렉트 드롭다운 */}
      <Controller
        control={control}
        name="country"
        render={({ field: { onChange, value } }) => (
          <View style={styles.selectContainer}>
            <TextBox variant="body3" color={theme.text} style={styles.label}>
              국가 (select) *
            </TextBox>
            <SelectBox
              options={countryOptions}
              selectedValue={value}
              onValueChange={onChange}
              placeholder="선택하세요"
            />
            {errors.country && (
              <TextBox
                variant="caption3"
                color={theme.error}
                style={styles.errorText}
              >
                {errors.country.message}
              </TextBox>
            )}
          </View>
        )}
      />

      {/* 텍스트 영역 */}
      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="자기소개 (textarea)"
            value={value || ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="자기소개를 입력하세요 (최대 500자)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            error={errors.bio?.message}
          />
        )}
      />

      {/* 검색 입력 */}
      <Controller
        control={control}
        name="searchQuery"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="검색 (search)"
            value={value || ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="검색어를 입력하세요"
            error={errors.searchQuery?.message}
          />
        )}
      />

      {/* 제출 버튼 */}
      <View style={styles.buttonRow}>
        <CustomButton
          title={isSubmitting ? '제출 중...' : '제출'}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          variant="primary"
          size="large"
          loading={isSubmitting}
          fullWidth
          style={styles.submitButton}
        />
        <CustomButton
          title="초기화"
          onPress={() => {
            reset();
            setSubmitError(null);
            setSubmitSuccess(false);
            setAvatarUri(null);
          }}
          variant="outline"
          size="large"
          style={styles.resetButton}
        />
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
