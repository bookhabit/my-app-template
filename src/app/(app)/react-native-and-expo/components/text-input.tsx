import { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

export default function TextInputScreen() {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [multiline, setMultiline] = useState('');
  const [email, setEmail] = useState('');
  const [numeric, setNumeric] = useState('');
  const [phone, setPhone] = useState('');
  const [focusStatus, setFocusStatus] = useState<string>('');
  const [selectionInfo, setSelectionInfo] = useState<string>('');
  const [submitText, setSubmitText] = useState('');
  const [autoCompleteText, setAutoCompleteText] = useState('');

  const inputRef = useRef<TextInput>(null);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          TextInput 컴포넌트
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          TextInput은 사용자로부터 텍스트 입력을 받는 컴포넌트입니다.
        </TextBox>

        {/* 기본 TextInput 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            기본 TextInput
          </TextBox>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="텍스트를 입력하세요"
            placeholderTextColor={theme.textSecondary}
            value={text}
            onChangeText={setText}
          />
          <TextBox variant="body4" color={theme.textSecondary}>
            입력된 값: {text || '(없음)'}
          </TextBox>
        </View>

        {/* 비밀번호 입력 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            비밀번호 입력 (secureTextEntry)
          </TextBox>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="비밀번호를 입력하세요"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* 여러 줄 입력 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            여러 줄 입력 (multiline)
          </TextBox>
          <TextInput
            style={[
              styles.multilineInput,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="여러 줄 텍스트를 입력하세요"
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            value={multiline}
            onChangeText={setMultiline}
          />
        </View>

        {/* 키보드 타입 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            키보드 타입 (keyboardType)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            입력 타입에 맞는 키보드 자동 표시
          </TextBox>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="숫자 입력 (numeric)"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            value={numeric}
            onChangeText={setNumeric}
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
                marginTop: 12,
              },
            ]}
            placeholder="이메일 입력 (email-address)"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
                marginTop: 12,
              },
            ]}
            placeholder="전화번호 입력 (phone-pad)"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
                marginTop: 12,
              },
            ]}
            placeholder="소수점 입력 (decimal-pad)"
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Focus/Blur 이벤트 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Focus/Blur 이벤트
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            onFocus, onBlur로 포커스 상태 감지
          </TextBox>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: focusStatus.includes('Focus')
                  ? theme.primary
                  : theme.border,
                color: theme.text,
              },
            ]}
            placeholder="포커스해보세요"
            placeholderTextColor={theme.textSecondary}
            onFocus={() => setFocusStatus('Focus: 입력창이 활성화되었습니다')}
            onBlur={() => setFocusStatus('Blur: 입력창이 비활성화되었습니다')}
          />
          {focusStatus ? (
            <TextBox
              variant="body4"
              color={theme.primary}
              style={styles.infoText}
            >
              {focusStatus}
            </TextBox>
          ) : null}
        </View>

        {/* onSubmitEditing & onEndEditing 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Submit 이벤트
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            onSubmitEditing: 키보드 submit 버튼 클릭 시
          </TextBox>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="입력 후 키보드의 완료 버튼을 누르세요"
            placeholderTextColor={theme.textSecondary}
            value={submitText}
            onChangeText={setSubmitText}
            onSubmitEditing={(e) => {
              Alert.alert('Submit', `입력된 값: ${e.nativeEvent.text}`);
            }}
            onEndEditing={(e) => {
              setSubmitText(e.nativeEvent.text);
            }}
          />
        </View>

        {/* submitBehavior 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            submitBehavior (RN 0.72+)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            return key 동작 제어: 'submit', 'blurAndSubmit', 'newline'
          </TextBox>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="submitBehavior: 'submit'"
            placeholderTextColor={theme.textSecondary}
            submitBehavior="submit"
            onSubmitEditing={() =>
              Alert.alert('Submit', 'submit 이벤트만 실행')
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
                marginTop: 12,
              },
            ]}
            placeholder="submitBehavior: 'newline' (multiline)"
            placeholderTextColor={theme.textSecondary}
            multiline
            submitBehavior="newline"
          />
        </View>

        {/* onSelectionChange 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Selection Change 이벤트
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            드래그/커서 위치 변화 감지
          </TextBox>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="텍스트를 선택해보세요"
            placeholderTextColor={theme.textSecondary}
            defaultValue="텍스트를 드래그하여 선택해보세요"
            onSelectionChange={(e) => {
              const { start, end } = e.nativeEvent.selection;
              setSelectionInfo(
                `선택 범위: ${start} ~ ${end} (길이: ${end - start})`
              );
            }}
          />
          {selectionInfo ? (
            <TextBox
              variant="body4"
              color={theme.primary}
              style={styles.infoText}
            >
              {selectionInfo}
            </TextBox>
          ) : null}
        </View>

        {/* autoComplete 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            autoComplete (자동완성)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            크로스 플랫폼 자동완성 힌트 제공
          </TextBox>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="이메일 자동완성"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            value={autoCompleteText}
            onChangeText={setAutoCompleteText}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
                marginTop: 12,
              },
            ]}
            placeholder="비밀번호 자동완성"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            autoComplete="new-password"
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
                marginTop: 12,
              },
            ]}
            placeholder="이름 자동완성"
            placeholderTextColor={theme.textSecondary}
            autoComplete="name"
          />
        </View>

        {/* maxLength 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            maxLength (입력 제한)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            최대 입력 글자 수 제한
          </TextBox>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="최대 10자까지만 입력 가능"
            placeholderTextColor={theme.textSecondary}
            maxLength={10}
          />
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.infoText}
          >
            최대 10자까지만 입력할 수 있습니다
          </TextBox>
        </View>

        {/* 플랫폼별 차이점 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            플랫폼별 차이점
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            Android: underlineColorAndroid로 기본 선 제거
          </TextBox>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Android 기본 선 제거"
            placeholderTextColor={theme.textSecondary}
            underlineColorAndroid="transparent"
          />
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.infoText}
          >
            iOS: clearButtonMode로 입력창 오른쪽 ❌ 버튼 표시 가능
          </TextBox>
        </View>

        {/* focus() & blur() 제어 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            focus() & blur() 제어
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            ref를 사용하여 프로그래밍 방식으로 포커스 제어
          </TextBox>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="ref로 제어되는 입력창"
            placeholderTextColor={theme.textSecondary}
          />
          <View style={styles.buttonRow}>
            <CustomButton
              title="Focus"
              onPress={() => inputRef.current?.focus()}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="Blur"
              onPress={() => inputRef.current?.blur()}
              variant="outline"
              size="small"
            />
          </View>
        </View>

        {/* 실무 조합 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            실무 조합 예제
          </TextBox>

          {/* 이메일 입력 */}
          <View style={styles.exampleBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.exampleTitle}
            >
              이메일 입력
            </TextBox>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="이메일을 입력하세요"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* 비밀번호 입력 */}
          <View style={styles.exampleBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.exampleTitle}
            >
              비밀번호 입력
            </TextBox>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          {/* 숫자만 입력 (인증번호 등) */}
          <View style={styles.exampleBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.exampleTitle}
            >
              숫자만 입력 (인증번호)
            </TextBox>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="인증번호 6자리"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          {/* 멀티라인 (채팅/메모) */}
          <View style={styles.exampleBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.exampleTitle}
            >
              멀티라인 (채팅/메모)
            </TextBox>
            <TextInput
              style={[
                styles.multilineInput,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="여러 줄 텍스트를 입력하세요"
              placeholderTextColor={theme.textSecondary}
              multiline
              textAlignVertical="top"
              numberOfLines={4}
            />
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              textAlignVertical="top"으로 Android/iOS 정렬 통일
            </TextBox>
          </View>
        </View>

        {/* 주의사항 및 팁 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚠️ 주의사항 및 팁
          </TextBox>
          <View style={styles.tipsContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • multiline + border: Android는 단일 border만 가능 → View로 감싸서
              border 처리
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • Android 자동 full screen 편집: disableFullscreenUI={true}로 해결
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • autoComplete와 textContentType 동시 사용 금지
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • multiline 기본 정렬: iOS는 상단, Android는 중앙 →
              textAlignVertical="top"으로 통일
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • placeholder 위치 커스터마이징은 RN에서 직접 불가능
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
    gap: 20,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  description: {
    marginBottom: 12,
    marginTop: 4,
  },
  infoText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  exampleBox: {
    marginBottom: 16,
    gap: 8,
  },
  exampleTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  tipsContainer: {
    gap: 8,
  },
  tipItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
