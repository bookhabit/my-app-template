# Core UI Components – Props Specification

> 본 문서는 애플리케이션의 핵심 UI 컴포넌트에 대해  
> **필수 props / 추가 props / 예외 케이스 처리 기준**을 정의한다.  
> 이 컴포넌트들은 **기능과 예외 처리를 담당하는 기초 컴포넌트**이며,  
> 뷰 계층에서는 이 컴포넌트들을 기반으로 **UI만 덧붙인 래퍼 컴포넌트**를 만들어 사용한다.

---

## 목차

1. [TextInput](#1-textinput)
2. [Button](#2-button)
3. [Checkbox](#3-checkbox)
4. [RadioGroup](#4-radiogroup)
5. [SearchBar](#5-searchbar)
6. [Select](#6-select)
7. [DatePicker](#7-datepicker)
8. [Switch](#8-switch)
9. [Slider](#9-slider)
10. [Dialog](#10-dialog)
11. [SnackBar](#11-snackbar)
12. [구현 원칙](#구현-원칙)

---

## 1. TextInput

### 개요

텍스트 입력을 위한 기본 컴포넌트입니다. 모든 텍스트 입력 필드는 이 컴포넌트를 기반으로 구현됩니다.

### TypeScript 타입 정의

```typescript
interface TextInputProps {
  // 필수 props
  value: string;
  onChange: (value: string) => void;
  
  // 선택 props
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  maxLength?: number;
  autoFocus?: boolean;
  keyboardType?: 'default' | 'email' | 'number' | 'phone-pad' | 'numeric';
  clearable?: boolean;
  readOnly?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  
  // 스타일 관련
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'filled' | 'outline';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconPress?: () => void;
  
  // React Native TextInput 기본 props 확장
  style?: StyleProp<TextStyle>;
  testID?: string;
}
```

### Props 상세 설명

#### 필수 Props

- **`value: string`**
  - 입력 필드의 현재 값
  - 제어 컴포넌트(Controlled Component) 패턴 사용
  - 빈 문자열 허용

- **`onChange: (value: string) => void`**
  - 값 변경 시 호출되는 콜백 함수
  - 새 값이 첫 번째 인자로 전달됨
  - 동기 함수여야 함 (비동기 처리 불가)

#### 선택 Props

- **`placeholder?: string`**
  - 입력 필드가 비어있을 때 표시되는 힌트 텍스트
  - 기본값: `undefined`

- **`disabled?: boolean`**
  - 입력 필드 비활성화 여부
  - `true`일 때: 입력 불가, 포커스 불가, 시각적 비활성화 표시
  - 기본값: `false`

- **`error?: string`**
  - 에러 메시지
  - 존재 시: 입력은 허용하되 에러 스타일 및 메시지 표시
  - 빈 문자열이면 에러로 간주하지 않음

- **`label?: string`**
  - 입력 필드 위에 표시되는 레이블
  - 접근성 향상 및 사용자 경험 개선

- **`maxLength?: number`**
  - 최대 입력 길이 제한
  - `undefined`일 때 제한 없음
  - IME 입력 중에도 적용

- **`autoFocus?: boolean`**
  - 마운트 시 자동 포커스
  - 기본값: `false`

- **`keyboardType?: 'default' | 'email' | 'number' | 'phone-pad' | 'numeric'`**
  - 키보드 타입 지정
  - 기본값: `'default'`

- **`clearable?: boolean`**
  - 우측에 클리어 버튼 표시 여부
  - `true`일 때 값이 있을 때만 클리어 버튼 표시
  - 기본값: `false`

- **`readOnly?: boolean`**
  - 읽기 전용 모드
  - `disabled`와 달리 포커스는 가능하나 입력 불가
  - 기본값: `false`

- **`secureTextEntry?: boolean`**
  - 비밀번호 입력 모드
  - `true`일 때 자동으로 visibility 토글 아이콘 표시
  - 기본값: `false`

### 예외 케이스 처리

#### 1. IME 입력 중 값 강제 변경 금지

```typescript
// ❌ 잘못된 예시
const [value, setValue] = useState('');
const [isComposing, setIsComposing] = useState(false);

// IME 입력 중에는 onChange 호출 차단
<TextInput
  value={value}
  onChange={(newValue) => {
    if (!isComposing) {
      setValue(newValue);
    }
  }}
  onCompositionStart={() => setIsComposing(true)}
  onCompositionEnd={() => setIsComposing(false)}
/>
```

**구현 가이드라인:**
- React Native의 `onCompositionStart`/`onCompositionEnd` 이벤트 활용
- IME 입력 중(`isComposing === true`)에는 외부에서 값 변경 시도 차단
- 컴포넌트 내부에서 처리하되, 상위에서도 주의 필요

#### 2. disabled 상태 처리

```typescript
// disabled === true일 때
- editable={false}
- 포커스 불가
- 시각적 비활성화 (opacity: 0.5)
- 터치 이벤트 무시
```

#### 3. error 상태 처리

```typescript
// error가 존재할 때
- 입력은 허용 (disabled와 독립적)
- 에러 스타일 적용 (빨간 테두리)
- 에러 메시지 표시
- label이 있으면 label도 에러 색상으로 변경
```

### 사용 예시

```typescript
import { TextInput } from '@/components/core/TextInput';
import { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  return (
    <>
      <TextInput
        value={email}
        onChange={setEmail}
        label="이메일"
        placeholder="example@email.com"
        keyboardType="email"
        error={emailError}
        autoFocus
        clearable
      />
      
      <TextInput
        value={password}
        onChange={setPassword}
        label="비밀번호"
        placeholder="비밀번호를 입력하세요"
        secureTextEntry
        error={password.length < 8 ? '8자 이상 입력하세요' : undefined}
        maxLength={50}
      />
    </>
  );
}
```

### 접근성 고려사항

- `accessibilityLabel`: label이 없을 때 필수
- `accessibilityHint`: 입력 형식 안내
- `accessibilityState`: disabled, error 상태 명시
- 에러 메시지는 `accessibilityLiveRegion`으로 스크린 리더에 전달

### 테스트 케이스

1. ✅ 기본 입력 동작
2. ✅ disabled 상태에서 입력 불가
3. ✅ error 메시지 표시 및 입력 허용
4. ✅ maxLength 제한 동작
5. ✅ clearable 버튼 동작
6. ✅ IME 입력 중 값 변경 차단
7. ✅ secureTextEntry 토글 동작

---

## 2. Button

### 개요

사용자 액션을 트리거하는 버튼 컴포넌트입니다. 모든 버튼은 이 컴포넌트를 기반으로 구현됩니다.

### TypeScript 타입 정의

```typescript
interface ButtonProps {
  // 필수 props
  title: string;
  onPress: () => void | Promise<void>;
  
  // 선택 props
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  haptic?: boolean;
  size?: 'small' | 'medium' | 'large';
  
  // 스타일 관련
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

### Props 상세 설명

#### 필수 Props

- **`title: string`**
  - 버튼에 표시될 텍스트
  - 빈 문자열 허용 (아이콘만 있는 버튼)

- **`onPress: () => void | Promise<void>`**
  - 버튼 클릭 시 호출되는 콜백
  - 동기/비동기 모두 지원
  - Promise인 경우 loading 상태 자동 관리

#### 선택 Props

- **`disabled?: boolean`**
  - 버튼 비활성화 여부
  - 기본값: `false`

- **`loading?: boolean`**
  - 로딩 상태
  - `true`일 때: 자동으로 `disabled` 처리, 로딩 인디케이터 표시
  - 기본값: `false`

- **`variant?: 'primary' | 'secondary' | 'danger' | 'ghost'`**
  - 버튼 스타일 변형
  - 기본값: `'primary'`

- **`iconLeft?: ReactNode`**
  - 버튼 텍스트 왼쪽에 표시될 아이콘

- **`iconRight?: ReactNode`**
  - 버튼 텍스트 오른쪽에 표시될 아이콘

- **`fullWidth?: boolean`**
  - 전체 너비 사용 여부
  - 기본값: `false`

- **`haptic?: boolean`**
  - 햅틱 피드백 사용 여부 (iOS/Android)
  - 기본값: `false`

### 예외 케이스 처리

#### 1. loading 상태 자동 disabled 처리

```typescript
// 내부 구현
const isDisabled = disabled || loading;

// loading === true일 때
- 자동으로 disabled 처리
- 로딩 인디케이터 표시
- title은 숨김 처리
```

#### 2. 연속 클릭 방지 (Debounce)

```typescript
// 내부 구현 예시
const [isProcessing, setIsProcessing] = useState(false);

const handlePress = async () => {
  if (isProcessing) return;
  
  setIsProcessing(true);
  try {
    await onPress();
  } finally {
    // 최소 300ms 대기 (debounce)
    setTimeout(() => setIsProcessing(false), 300);
  }
};
```

**구현 가이드라인:**
- 내부적으로 debounce 적용 (기본 300ms)
- `onPress`가 Promise인 경우 자동 처리
- 상위 컴포넌트에서 추가 debounce 불필요

#### 3. 에러 처리 책임 분리

```typescript
// ❌ 잘못된 예시 - Button에서 에러 처리
<Button
  onPress={async () => {
    try {
      await submit();
    } catch (error) {
      Alert.alert('에러', error.message); // Button 책임 아님
    }
  }}
/>

// ✅ 올바른 예시 - 상위에서 에러 처리
<Button
  onPress={async () => {
    await submit().catch(handleError);
  }}
/>
```

**원칙:**
- Button은 상태 복구만 담당
- 에러 메시지 표시는 상위 레이어 책임 (SnackBar, Dialog 등)

### 사용 예시

```typescript
import { Button } from '@/components/core/Button';
import { MaterialIcons } from '@expo/vector-icons';

function ActionButtons() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        title="제출하기"
        onPress={handleSubmit}
        loading={isSubmitting}
        variant="primary"
        iconLeft={<MaterialIcons name="send" size={20} />}
        fullWidth
      />
      
      <Button
        title="취소"
        onPress={handleCancel}
        variant="ghost"
        disabled={isSubmitting}
      />
    </>
  );
}
```

### 접근성 고려사항

- `accessibilityRole="button"` 명시
- `accessibilityState`: disabled, loading 상태
- `accessibilityLabel`: title이 없을 때 필수
- `accessibilityHint`: 액션 설명

### 테스트 케이스

1. ✅ 기본 클릭 동작
2. ✅ disabled 상태에서 클릭 불가
3. ✅ loading 상태 자동 disabled 처리
4. ✅ 연속 클릭 방지 (debounce)
5. ✅ Promise onPress 처리
6. ✅ 아이콘 표시
7. ✅ 햅틱 피드백 동작

---

## 3. Checkbox

### 개요

단일 선택 옵션을 위한 체크박스 컴포넌트입니다.

### TypeScript 타입 정의

```typescript
interface CheckboxProps {
  // 필수 props
  checked: boolean;
  onChange: (checked: boolean) => void;
  
  // 선택 props
  disabled?: boolean;
  label?: string;
  indeterminate?: boolean;
  required?: boolean;
  
  // 스타일 관련
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

### Props 상세 설명

#### 필수 Props

- **`checked: boolean`**
  - 체크 상태
  - 제어 컴포넌트 패턴

- **`onChange: (checked: boolean) => void`**
  - 상태 변경 콜백
  - 새 상태가 인자로 전달됨

#### 선택 Props

- **`disabled?: boolean`**
  - 비활성화 여부
  - 기본값: `false`

- **`label?: string`**
  - 체크박스 옆에 표시될 레이블
  - 레이블 클릭 시에도 토글됨

- **`indeterminate?: boolean`**
  - 불확정 상태 (부분 선택)
  - 사용자가 직접 토글 불가 (프로그래매틱 설정만)
  - 기본값: `false`

- **`required?: boolean`**
  - 필수 항목 여부
  - `true`일 때 해제 시 submit 차단
  - 기본값: `false`

### 예외 케이스 처리

#### 1. required 상태에서 해제 시 submit 차단

```typescript
// 상위 컴포넌트에서 처리
const [isChecked, setIsChecked] = useState(false);
const [canSubmit, setCanSubmit] = useState(false);

<Checkbox
  checked={isChecked}
  onChange={(newChecked) => {
    setIsChecked(newChecked);
    if (required && !newChecked) {
      setCanSubmit(false);
    } else {
      setCanSubmit(true);
    }
  }}
  required
/>
```

**구현 가이드라인:**
- Checkbox 자체는 submit 차단하지 않음
- `required` prop은 시각적 표시 및 상위 컴포넌트에 힌트 제공
- 실제 차단 로직은 상위에서 처리

#### 2. indeterminate 상태 처리

```typescript
// indeterminate는 사용자 직접 토글 불가
// 프로그래매틱 설정만 가능

<Checkbox
  checked={false}
  indeterminate={true} // 부분 선택 상태
  onChange={(checked) => {
    // indeterminate 상태에서는 onChange 호출 안 됨
  }}
/>
```

### 사용 예시

```typescript
import { Checkbox } from '@/components/core/Checkbox';

function AgreementForm() {
  const [agreed, setAgreed] = useState(false);

  return (
    <Checkbox
      checked={agreed}
      onChange={setAgreed}
      label="이용약관에 동의합니다"
      required
    />
  );
}
```

### 접근성 고려사항

- `accessibilityRole="checkbox"`
- `accessibilityState`: checked, disabled, indeterminate
- `accessibilityLabel`: label이 없을 때 필수

### 테스트 케이스

1. ✅ 기본 체크/언체크 동작
2. ✅ disabled 상태에서 토글 불가
3. ✅ label 클릭 시 토글
4. ✅ required 상태 시각적 표시
5. ✅ indeterminate 상태 표시 및 토글 불가

---

## 4. RadioGroup

### 개요

단일 선택 옵션 그룹을 위한 라디오 버튼 그룹 컴포넌트입니다.

### TypeScript 타입 정의

```typescript
interface RadioGroupProps {
  // 필수 props
  value: string | number;
  onChange: (value: string | number) => void;
  options: { label: string; value: string | number }[];
  
  // 선택 props
  disabled?: boolean;
  direction?: 'horizontal' | 'vertical';
  error?: string;
  
  // 스타일 관련
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

### Props 상세 설명

#### 필수 Props

- **`value: string | number`**
  - 현재 선택된 값
  - `options` 중 하나의 `value`와 일치해야 함

- **`onChange: (value: string | number) => void`**
  - 선택 변경 콜백

- **`options: { label: string; value: string | number }[]`**
  - 선택 가능한 옵션 목록
  - 빈 배열 허용 (선택 불가 상태)

#### 선택 Props

- **`disabled?: boolean`**
  - 전체 그룹 비활성화
  - 기본값: `false`

- **`direction?: 'horizontal' | 'vertical'`**
  - 레이아웃 방향
  - 기본값: `'vertical'`

- **`error?: string`**
  - 에러 메시지
  - 그룹 하단에 표시

### 예외 케이스 처리

#### 1. options 변경 시 기존 value 유효성 재검증

```typescript
// 내부 구현
useEffect(() => {
  const isValid = options.some(opt => opt.value === value);
  if (!isValid && options.length > 0) {
    // 기존 value가 유효하지 않으면 첫 번째 옵션으로 자동 변경
    onChange(options[0].value);
  }
}, [options]);
```

**구현 가이드라인:**
- `options`가 변경되면 현재 `value` 유효성 검사
- 유효하지 않으면 첫 번째 옵션으로 자동 변경 (또는 `null`로 초기화)
- 상위 컴포넌트에 변경 알림

#### 2. disabled 상태 처리

```typescript
// disabled === true일 때
- 모든 하위 Radio 비활성화
- 시각적 비활성화 표시
- 터치 이벤트 무시
```

### 사용 예시

```typescript
import { RadioGroup } from '@/components/core/RadioGroup';

function RoleSelection() {
  const [role, setRole] = useState('owner');

  const options = [
    { label: '반려동물 주인', value: 'owner' },
    { label: '돌봄 도우미', value: 'sitter' },
  ];

  return (
    <RadioGroup
      value={role}
      onChange={setRole}
      options={options}
      direction="vertical"
    />
  );
}
```

### 접근성 고려사항

- `accessibilityRole="radiogroup"`
- 각 Radio는 `accessibilityRole="radio"`
- `accessibilityState`: selected, disabled

### 테스트 케이스

1. ✅ 기본 선택 동작
2. ✅ disabled 상태에서 선택 불가
3. ✅ options 변경 시 value 유효성 재검증
4. ✅ 빈 options 처리
5. ✅ error 메시지 표시

---

## 5. SearchBar

### 개요

검색 입력을 위한 특화된 텍스트 입력 컴포넌트입니다.

### TypeScript 타입 정의

```typescript
interface SearchBarProps {
  // 필수 props
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  
  // 선택 props
  placeholder?: string;
  debounceDelay?: number;
  autoFocus?: boolean;
  clearable?: boolean;
  
  // 스타일 관련
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

### Props 상세 설명

#### 필수 Props

- **`value: string`**
  - 검색어 값

- **`onChange: (value: string) => void`**
  - 값 변경 콜백
  - debounce 적용됨

- **`onSubmit: () => void`**
  - 검색 실행 콜백
  - Enter 키 또는 검색 버튼 클릭 시 호출

#### 선택 Props

- **`placeholder?: string`**
  - 플레이스홀더 텍스트
  - 기본값: `'검색...'`

- **`debounceDelay?: number`**
  - debounce 지연 시간 (ms)
  - 기본값: `300`

- **`autoFocus?: boolean`**
  - 자동 포커스
  - 기본값: `false`

- **`clearable?: boolean`**
  - 클리어 버튼 표시
  - 기본값: `true`

### 예외 케이스 처리

#### 1. 빈 값 submit 허용 여부

```typescript
// 빈 값 submit 허용 여부는 상위에서 결정
// SearchBar는 항상 onSubmit 호출

<SearchBar
  value={searchTerm}
  onChange={setSearchTerm}
  onSubmit={() => {
    // 상위에서 빈 값 체크
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    }
  }}
/>
```

**구현 가이드라인:**
- SearchBar는 빈 값 submit을 차단하지 않음
- 상위 컴포넌트에서 빈 값 처리 로직 구현

#### 2. debounce 중 submit 호출 시 즉시 실행

```typescript
// 내부 구현
const debouncedOnChange = useMemo(
  () => debounce(onChange, debounceDelay),
  [onChange, debounceDelay]
);

const handleSubmit = () => {
  // debounce 취소하고 즉시 실행
  debouncedOnChange.cancel();
  onSubmit();
};
```

### 사용 예시

```typescript
import { SearchBar } from '@/components/core/SearchBar';
import { useState } from 'react';

function JobSearch() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SearchBar
      value={searchTerm}
      onChange={setSearchTerm}
      onSubmit={() => {
        if (searchTerm.trim()) {
          searchJobs(searchTerm);
        }
      }}
      placeholder="구인공고 검색..."
      debounceDelay={500}
    />
  );
}
```

### 접근성 고려사항

- `accessibilityRole="search"`
- `accessibilityLabel`: "검색 입력"
- `accessibilityHint`: "검색어를 입력하고 Enter를 누르세요"

### 테스트 케이스

1. ✅ 기본 입력 동작
2. ✅ debounce 동작
3. ✅ submit 동작
4. ✅ 빈 값 submit 처리
5. ✅ clearable 버튼 동작

---

## 6. Select

### 개요

드롭다운 선택 컴포넌트입니다.

### TypeScript 타입 정의

```typescript
interface SelectProps {
  // 필수 props
  value: string | number | null;
  options: { label: string; value: string | number }[];
  onChange: (value: string | number) => void;
  
  // 선택 props
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  loading?: boolean;
  emptyText?: string;
  
  // 스타일 관련
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

### Props 상세 설명

#### 필수 Props

- **`value: string | number | null`**
  - 현재 선택된 값
  - `null`일 때는 미선택 상태

- **`options: { label: string; value: string | number }[]`**
  - 선택 가능한 옵션 목록

- **`onChange: (value: string | number) => void`**
  - 선택 변경 콜백
  - `null`은 전달되지 않음 (선택 해제 불가)

#### 선택 Props

- **`placeholder?: string`**
  - 미선택 시 표시될 텍스트
  - 기본값: `'선택하세요'`

- **`disabled?: boolean`**
  - 비활성화 여부
  - 기본값: `false`

- **`searchable?: boolean`**
  - 검색 기능 활성화
  - 기본값: `false`

- **`loading?: boolean`**
  - 로딩 상태
  - `true`일 때 드롭다운 열기 불가
  - 기본값: `false`

- **`emptyText?: string`**
  - 옵션이 없을 때 표시될 텍스트
  - 기본값: `'선택할 항목이 없습니다'`

### 예외 케이스 처리

#### 1. loading 상태 처리

```typescript
// loading === true일 때
- 드롭다운 열기 불가
- 시각적 로딩 표시
- 기존 선택값 유지
```

#### 2. 빈 options 처리

```typescript
// options가 비어있을 때
- 선택 불가
- emptyText 표시
- 드롭다운은 열리지만 옵션 없음 표시
```

### 사용 예시

```typescript
import { Select } from '@/components/core/Select';

function DogSizeSelection() {
  const [size, setSize] = useState<string | null>(null);

  const options = [
    { label: '소형', value: 'small' },
    { label: '중형', value: 'medium' },
    { label: '대형', value: 'large' },
  ];

  return (
    <Select
      value={size}
      onChange={setSize}
      options={options}
      placeholder="크기를 선택하세요"
      searchable
    />
  );
}
```

### 접근성 고려사항

- `accessibilityRole="combobox"`
- `accessibilityState`: expanded, disabled
- `accessibilityLabel`: placeholder 또는 선택된 값

### 테스트 케이스

1. ✅ 기본 선택 동작
2. ✅ disabled 상태에서 선택 불가
3. ✅ loading 상태에서 드롭다운 열기 불가
4. ✅ 빈 options 처리
5. ✅ searchable 동작

---

## 7. DatePicker

### 개요

날짜 선택을 위한 컴포넌트입니다.

### TypeScript 타입 정의

```typescript
interface DatePickerProps {
  // 필수 props
  value: Date | null;
  onChange: (date: Date | null) => void;
  
  // 선택 props
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  placeholder?: string;
  mode?: 'date' | 'time' | 'datetime';
  
  // 스타일 관련
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

### Props 상세 설명

#### 필수 Props

- **`value: Date | null`**
  - 현재 선택된 날짜
  - `null`일 때는 미선택 상태

- **`onChange: (date: Date | null) => void`**
  - 날짜 변경 콜백

#### 선택 Props

- **`disabled?: boolean`**
  - 비활성화 여부
  - 기본값: `false`

- **`minDate?: Date`**
  - 선택 가능한 최소 날짜
  - 이전 날짜는 선택 불가

- **`maxDate?: Date`**
  - 선택 가능한 최대 날짜
  - 이후 날짜는 선택 불가

- **`format?: string`**
  - 날짜 표시 형식
  - 기본값: `'YYYY-MM-DD'`

- **`placeholder?: string`**
  - 미선택 시 표시될 텍스트
  - 기본값: `'날짜를 선택하세요'`

- **`mode?: 'date' | 'time' | 'datetime'`**
  - 선택 모드
  - 기본값: `'date'`

### 예외 케이스 처리

#### 1. minDate > maxDate 설정 금지

```typescript
// 내부 구현
useEffect(() => {
  if (minDate && maxDate && minDate > maxDate) {
    console.warn('DatePicker: minDate는 maxDate보다 작아야 합니다.');
  }
}, [minDate, maxDate]);
```

**구현 가이드라인:**
- 개발 모드에서 경고 출력
- 프로덕션에서는 무시 (상위에서 검증 필요)

#### 2. timezone 변환 처리

```typescript
// timezone 변환은 내부에서 처리하지 않음
// 상위 컴포넌트에서 처리

<DatePicker
  value={localDate}
  onChange={(date) => {
    // UTC로 변환하여 저장
    const utcDate = convertToUTC(date);
    saveDate(utcDate);
  }}
/>
```

**원칙:**
- DatePicker는 로컬 시간만 다룸
- timezone 변환은 상위 레이어 책임

### 사용 예시

```typescript
import { DatePicker } from '@/components/core/DatePicker';

function JobTimeSelection() {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const today = new Date();

  return (
    <DatePicker
      value={startTime}
      onChange={setStartTime}
      minDate={today}
      placeholder="시작 시간 선택"
      mode="datetime"
    />
  );
}
```

### 접근성 고려사항

- `accessibilityRole="button"`
- `accessibilityLabel`: 선택된 날짜 또는 placeholder
- `accessibilityHint`: "날짜를 선택하려면 두 번 탭하세요"

### 테스트 케이스

1. ✅ 기본 날짜 선택 동작
2. ✅ minDate/maxDate 제한 동작
3. ✅ disabled 상태에서 선택 불가
4. ✅ timezone 처리 (상위 책임)
5. ✅ mode별 동작

---

## 8. Switch

### 개요

토글 스위치 컴포넌트입니다.

### TypeScript 타입 정의

```typescript
interface SwitchProps {
  // 필수 props
  checked: boolean;
  onChange: (checked: boolean) => void;
  
  // 선택 props
  disabled?: boolean;
  label?: string;
  loading?: boolean;
  
  // 스타일 관련
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

### Props 상세 설명

#### 필수 Props

- **`checked: boolean`**
  - 스위치 상태

- **`onChange: (checked: boolean) => void`**
  - 상태 변경 콜백

#### 선택 Props

- **`disabled?: boolean`**
  - 비활성화 여부
  - 기본값: `false`

- **`label?: string`**
  - 스위치 옆에 표시될 레이블

- **`loading?: boolean`**
  - 로딩 상태
  - 기본값: `false`

### 예외 케이스 처리

#### 1. Optimistic UI 지원

```typescript
// 내부 구현
const [optimisticChecked, setOptimisticChecked] = useState(checked);

const handleChange = async (newChecked: boolean) => {
  // 즉시 UI 업데이트 (optimistic)
  setOptimisticChecked(newChecked);
  
  try {
    await onChange(newChecked);
  } catch (error) {
    // 실패 시 이전 상태로 rollback
    setOptimisticChecked(checked);
  }
};
```

**구현 가이드라인:**
- Optimistic UI 기본 지원
- 서버 실패 시 자동 rollback
- 상위 컴포넌트에서 추가 처리 불필요

#### 2. 서버 실패 시 rollback

```typescript
// 상위 컴포넌트 예시
const [notificationsEnabled, setNotificationsEnabled] = useState(false);

const handleToggle = async (enabled: boolean) => {
  try {
    await updateNotificationSettings(enabled);
    setNotificationsEnabled(enabled);
  } catch (error) {
    // Switch 컴포넌트가 자동으로 rollback
    // 여기서는 에러 메시지만 표시
    showError('설정 변경에 실패했습니다.');
  }
};
```

### 사용 예시

```typescript
import { Switch } from '@/components/core/Switch';

function NotificationSettings() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Switch
      checked={enabled}
      onChange={async (checked) => {
        await updateSettings({ notifications: checked });
        setEnabled(checked);
      }}
      label="푸시 알림 받기"
    />
  );
}
```

### 접근성 고려사항

- `accessibilityRole="switch"`
- `accessibilityState`: checked, disabled
- `accessibilityLabel`: label이 없을 때 필수

### 테스트 케이스

1. ✅ 기본 토글 동작
2. ✅ disabled 상태에서 토글 불가
3. ✅ Optimistic UI 동작
4. ✅ 서버 실패 시 rollback
5. ✅ loading 상태 처리

---

## 9. Slider

### 개요

값 범위 선택을 위한 슬라이더 컴포넌트입니다.

### TypeScript 타입 정의

```typescript
interface SliderProps {
  // 필수 props
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  
  // 선택 props
  disabled?: boolean;
  step?: number;
  showValue?: boolean;
  onChangeEnd?: (value: number) => void;
  
  // 스타일 관련
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

### Props 상세 설명

#### 필수 Props

- **`value: number`**
  - 현재 값
  - `min`과 `max` 사이의 값이어야 함

- **`onChange: (value: number) => void`**
  - 값 변경 콜백
  - 드래그 중 계속 호출됨

- **`min: number`**
  - 최소값

- **`max: number`**
  - 최대값

#### 선택 Props

- **`disabled?: boolean`**
  - 비활성화 여부
  - 기본값: `false`

- **`step?: number`**
  - 값 증가 단위
  - 기본값: `1`

- **`showValue?: boolean`**
  - 현재 값 표시 여부
  - 기본값: `false`

- **`onChangeEnd?: (value: number) => void`**
  - 드래그 종료 시 호출되는 콜백
  - 최종 값만 전달

### 예외 케이스 처리

#### 1. value가 min/max 벗어나면 강제 보정

```typescript
// 내부 구현
const clampedValue = Math.max(min, Math.min(max, value));

useEffect(() => {
  if (value !== clampedValue) {
    onChange(clampedValue);
  }
}, [value, min, max]);
```

**구현 가이드라인:**
- `value`가 범위를 벗어나면 자동으로 보정
- 보정된 값으로 `onChange` 호출

#### 2. 드래그 중 과도한 렌더링 방지

```typescript
// 내부 구현 - throttle 적용
const throttledOnChange = useMemo(
  () => throttle(onChange, 16), // 60fps
  [onChange]
);

// 드래그 중에는 throttledOnChange 사용
// onChangeEnd에서는 원본 onChange 사용
```

### 사용 예시

```typescript
import { Slider } from '@/components/core/Slider';

function AgeSelection() {
  const [age, setAge] = useState(5);

  return (
    <Slider
      value={age}
      onChange={setAge}
      min={0}
      max={20}
      step={1}
      showValue
      onChangeEnd={(finalAge) => {
        saveDogAge(finalAge);
      }}
    />
  );
}
```

### 접근성 고려사항

- `accessibilityRole="adjustable"`
- `accessibilityValue`: 현재 값과 범위
- `accessibilityLabel`: 슬라이더 용도 설명

### 테스트 케이스

1. ✅ 기본 드래그 동작
2. ✅ min/max 제한 동작
3. ✅ step 동작
4. ✅ value 범위 벗어남 보정
5. ✅ onChangeEnd 콜백 동작

---

## 10. Dialog

### 개요

모달 다이얼로그 컴포넌트입니다.

### TypeScript 타입 정의

```typescript
interface DialogProps {
  // 필수 props
  open: boolean;
  onClose: () => void;
  content: ReactNode;
  
  // 선택 props
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  disableBackdropClose?: boolean;
  closeOnConfirm?: boolean;
  
  // 스타일 관련
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

### Props 상세 설명

#### 필수 Props

- **`open: boolean`**
  - 다이얼로그 표시 여부

- **`onClose: () => void`**
  - 다이얼로그 닫기 콜백
  - backdrop 클릭, 취소 버튼, ESC 키 등에서 호출

- **`content: ReactNode`**
  - 다이얼로그 본문 내용

#### 선택 Props

- **`title?: string`**
  - 다이얼로그 제목

- **`confirmText?: string`**
  - 확인 버튼 텍스트
  - 기본값: `'확인'`

- **`cancelText?: string`**
  - 취소 버튼 텍스트
  - 기본값: `'취소'`

- **`onConfirm?: () => void | Promise<void>`**
  - 확인 버튼 클릭 시 호출
  - Promise인 경우 처리 중 close 차단

- **`disableBackdropClose?: boolean`**
  - backdrop 클릭 시 닫기 비활성화
  - 기본값: `false`

- **`closeOnConfirm?: boolean`**
  - 확인 후 자동 닫기 여부
  - 기본값: `true`

### 예외 케이스 처리

#### 1. confirm 처리 중 close 차단

```typescript
// 내부 구현
const [isProcessing, setIsProcessing] = useState(false);

const handleConfirm = async () => {
  if (!onConfirm) return;
  
  setIsProcessing(true);
  try {
    await onConfirm();
    if (closeOnConfirm) {
      onClose();
    }
  } finally {
    setIsProcessing(false);
  }
};

// isProcessing === true일 때
// - backdrop 클릭 무시
// - ESC 키 무시
// - 취소 버튼 비활성화 (선택사항)
```

#### 2. 중첩 Dialog 금지

```typescript
// 내부 구현 - Context 사용
const DialogContext = createContext<{ hasOpenDialog: boolean }>({
  hasOpenDialog: false,
});

// Dialog가 열려있을 때 다른 Dialog 열기 시도 시 경고
useEffect(() => {
  if (open && hasOpenDialog) {
    console.warn('Dialog: 중첩 Dialog는 지원하지 않습니다.');
  }
}, [open, hasOpenDialog]);
```

### 사용 예시

```typescript
import { Dialog } from '@/components/core/Dialog';
import { useState } from 'react';

function DeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button title="삭제" onPress={() => setIsOpen(true)} />
      
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="삭제 확인"
        content="정말 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={async () => {
          await deleteItem();
          setIsOpen(false);
        }}
        disableBackdropClose
      />
    </>
  );
}
```

### 접근성 고려사항

- `accessibilityRole="alertdialog"` (경고용)
- `accessibilityLabel`: title 또는 content 요약
- 포커스 트랩 (Dialog 내부에만 포커스)
- ESC 키로 닫기

### 테스트 케이스

1. ✅ 기본 열기/닫기 동작
2. ✅ confirm 처리 중 close 차단
3. ✅ backdrop 클릭 닫기
4. ✅ 중첩 Dialog 방지
5. ✅ 포커스 트랩 동작

---

## 11. SnackBar

### 개요

임시 알림 메시지를 표시하는 컴포넌트입니다.

### TypeScript 타입 정의

```typescript
interface SnackBarProps {
  // 필수 props
  open: boolean;
  message: string;
  onClose: () => void;
  
  // 선택 props
  duration?: number;
  type?: 'info' | 'success' | 'error' | 'warning';
  actionText?: string;
  onAction?: () => void;
  position?: 'top' | 'bottom';
  
  // 스타일 관련
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

### Props 상세 설명

#### 필수 Props

- **`open: boolean`**
  - SnackBar 표시 여부

- **`message: string`**
  - 표시될 메시지
  - 빈 문자열 허용하지 않음

- **`onClose: () => void`**
  - SnackBar 닫기 콜백
  - duration 종료, 사용자 닫기, action 클릭 시 호출

#### 선택 Props

- **`duration?: number`**
  - 자동 닫기 시간 (ms)
  - `0`이면 자동 닫기 안 함
  - 기본값: `4000`

- **`type?: 'info' | 'success' | 'error' | 'warning'`**
  - 메시지 타입
  - 타입별 색상 및 아이콘 자동 적용
  - 기본값: `'info'`

- **`actionText?: string`**
  - 액션 버튼 텍스트
  - 있으면 액션 버튼 표시

- **`onAction?: () => void`**
  - 액션 버튼 클릭 시 호출
  - 호출 후 자동으로 닫힘

- **`position?: 'top' | 'bottom'`**
  - 표시 위치
  - 기본값: `'bottom'`

### 예외 케이스 처리

#### 1. 동일 메시지 연속 호출 시 중복 방지

```typescript
// 내부 구현
const [lastMessage, setLastMessage] = useState<string | null>(null);
const [lastTimestamp, setLastTimestamp] = useState(0);

useEffect(() => {
  if (open && message) {
    const now = Date.now();
    // 동일 메시지이고 1초 이내면 무시
    if (message === lastMessage && now - lastTimestamp < 1000) {
      return;
    }
    setLastMessage(message);
    setLastTimestamp(now);
  }
}, [open, message]);
```

#### 2. 에러 메시지는 자동 dismiss 안 함

```typescript
// 내부 구현
const shouldAutoDismiss = type !== 'error' && duration > 0;

useEffect(() => {
  if (open && shouldAutoDismiss) {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }
}, [open, duration, type]);
```

**구현 가이드라인:**
- `type === 'error'`일 때는 `duration`이 있어도 자동 닫기 안 함
- 사용자가 명시적으로 닫아야 함

### 사용 예시

```typescript
import { SnackBar } from '@/components/core/SnackBar';
import { useState } from 'react';

function NotificationExample() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'info' as const,
  });

  const showSuccess = () => {
    setSnackbar({
      open: true,
      message: '저장되었습니다.',
      type: 'success',
    });
  };

  const showError = () => {
    setSnackbar({
      open: true,
      message: '오류가 발생했습니다.',
      type: 'error',
      duration: 0, // 자동 닫기 안 함
    });
  };

  return (
    <>
      <Button title="성공 메시지" onPress={showSuccess} />
      <Button title="에러 메시지" onPress={showError} />
      
      <SnackBar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        actionText="확인"
        onAction={() => {
          // 액션 처리
          setSnackbar({ ...snackbar, open: false });
        }}
      />
    </>
  );
}
```

### 접근성 고려사항

- `accessibilityRole="alert"`
- `accessibilityLiveRegion="polite"` (또는 "assertive")
- `accessibilityLabel`: message
- 타입별 적절한 아이콘 표시

### 테스트 케이스

1. ✅ 기본 표시/닫기 동작
2. ✅ duration 자동 닫기
3. ✅ 에러 메시지 자동 닫기 안 함
4. ✅ 동일 메시지 중복 방지
5. ✅ action 버튼 동작

---

## 구현 원칙

### 핵심 원칙 요약

1. **상태를 숨기지 않는다**
   - 모든 상태는 props로 제어
   - 내부 상태는 최소화 (UI 상태만)

2. **예외 처리는 컴포넌트 내부에서 최대한 흡수**
   - IME 입력 처리
   - 값 범위 검증
   - debounce/throttle
   - Optimistic UI

3. **비즈니스 판단은 상위 레이어 책임**
   - 에러 메시지 표시 (SnackBar, Dialog)
   - 서버 통신 실패 처리
   - 권한 검증
   - 데이터 변환

### 컴포넌트 계층 구조

```
┌─────────────────────────────────────┐
│   View Layer (뷰 계층)                │
│   - UI만 덧붙인 래퍼 컴포넌트          │
│   - 비즈니스 로직 포함 가능            │
└─────────────────────────────────────┘
              ↓ 사용
┌─────────────────────────────────────┐
│   Core Layer (기초 컴포넌트)         │
│   - 기능과 예외 처리 담당             │
│   - UI는 최소한만                    │
└─────────────────────────────────────┘
              ↓ 사용
┌─────────────────────────────────────┐
│   Design System                    │
│   - TextBox, Theme, Colors, Fonts   │
└─────────────────────────────────────┘
```

### 예시: 뷰 계층 컴포넌트

```typescript
// ❌ 잘못된 예시 - Core 컴포넌트에 비즈니스 로직 포함
<TextInput
  value={email}
  onChange={setEmail}
  onBlur={() => {
    // ❌ Core 컴포넌트에서 이메일 검증
    if (!isValidEmail(email)) {
      setError('올바른 이메일을 입력하세요');
    }
  }}
/>

// ✅ 올바른 예시 - 뷰 계층에서 비즈니스 로직 처리
function EmailInput({ value, onChange, error, onError }) {
  return (
    <TextInput
      value={value}
      onChange={onChange}
      onBlur={() => {
        // ✅ 뷰 계층에서 검증
        const validationError = validateEmail(value);
        onError(validationError);
      }}
      error={error}
    />
  );
}
```

### 파일 구조

```
src/
  components/
    core/              # 기초 컴포넌트
      TextInput.tsx
      Button.tsx
      Checkbox.tsx
      RadioGroup.tsx
      SearchBar.tsx
      Select.tsx
      DatePicker.tsx
      Switch.tsx
      Slider.tsx
      Dialog.tsx
      SnackBar.tsx
    
    forms/              # 뷰 계층 컴포넌트 (UI 덧붙임)
      EmailInput.tsx
      PasswordInput.tsx
      JobForm.tsx
      ...
    
    common/             # 공통 컴포넌트
      TextBox.tsx
      ...
```

### 테스트 전략

1. **Unit Test**: Core 컴포넌트의 기능 테스트
2. **Integration Test**: 뷰 계층 컴포넌트의 비즈니스 로직 테스트
3. **E2E Test**: 전체 플로우 테스트

---

## 참고 자료

- [React Native 공식 문서](https://reactnative.dev/)
- [디자인 시스템 문서](./DESIGN_SYSTEM.md)
- [접근성 가이드라인](https://reactnative.dev/docs/accessibility)

---

**문서 버전**: 1.0  
**최종 수정일**: 2026-01-20
