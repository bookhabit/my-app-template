# 디자인 시스템

이 문서는 애플리케이션의 디자인 시스템을 설명합니다. 색상, 폰트, 타이포그래피, 테마 관리에 대한 가이드라인을 포함합니다.

## 목차

- [색상 (Colors)](#색상-colors)
- [폰트 (Fonts)](#폰트-fonts)
- [텍스트 컴포넌트 (TextBox)](#텍스트-컴포넌트-textbox)
- [테마 관리 (ThemeProvider)](#테마-관리-themeprovider)

---

## 색상 (Colors)

**파일 위치**: `src/constants/colors.ts`

### 기본 색상 팔레트 (Palette)

#### Primary Colors
- **primary.light**: `#007AFF` - 라이트 모드 메인 색상
- **primary.dark**: `#0A84FF` - 다크 모드 메인 색상

#### Secondary Colors
- **secondary.light**: `#5856D6` - 라이트 모드 보조 색상
- **secondary.dark**: `#5E5CE6` - 다크 모드 보조 색상

### 상태 색상 (Status Colors)

#### Success
- **light**: `#34C759`
- **dark**: `#32D74B`

#### Error
- **light**: `#FF3B30`
- **dark**: `#FF453A`

#### Warning
- **light**: `#FF9500`
- **dark**: `#FF9F0A`

### 중립 색상 (Neutral Colors)

#### Background
- **light**: `#FFFFFF`
- **dark**: `#000000`

#### Surface
- **light**: `#F5F5F5`
- **dark**: `#1C1C1E`

#### Text
- **light**: `#000000`
- **dark**: `#FFFFFF`

#### Text Secondary
- **light**: `#666666`
- **dark**: `#ABABAB`

#### Placeholder
- **light**: `#999999`
- **dark**: `#6D6D6D`

#### Border
- **light**: `#E0E0E0`
- **dark**: `#38383A`

### 운동 앱 색상 팔레트 (Workout Palette)

#### 루틴 색상
- **routineA** (Red - 벤치/데드/이두)
  - light: `#FF6B6B`
  - dark: `#FF5252`
  - gradient: `['#FF6B6B', '#FF8E8E']`

- **routineB** (Teal - 밀프/스쿼트/삼두)
  - light: `#4ECDC4`
  - dark: `#26A69A`
  - gradient: `['#4ECDC4', '#6ED4CD']`

- **routineC** (Mint - 바벨로우/덤벨로우/후면/사레레)
  - light: `#95E1D3`
  - dark: `#80CBC4`
  - gradient: `['#95E1D3', '#B4E8DD']`

- **rest** (Gray - 휴식)
  - light: `#B8B8B8`
  - dark: `#757575`
  - gradient: `['#B8B8B8', '#D0D0D0']`

#### 운동 상태 색상
- **workoutCompleted**
  - light: `#4ECDC4`
  - dark: `#26A69A`

- **workoutActive** (밝은 블루 - 활성 상태)
  - light: `#5B8DEF`
  - dark: `#4A7FE8`

- **workoutChallenge**
  - light: `#FF6B6B`
  - dark: `#FF5252`

#### 액센트 색상
- **accentOrange** (메인 액센트)
  - light: `#5B8DEF` (밝은 블루 - 라이트 모드 메인)
  - dark: `#4A7FE8` (진한 블루 - 다크 모드 메인)

- **accentPurple**
  - light: `#9B59B6`
  - dark: `#8E24AA`

- **accentBlue**
  - light: `#3498DB`
  - dark: `#2980B9`

#### 배경 그라데이션
- **workoutBg**
  - light: `#F8F9FA`
  - dark: `#121212`

- **cardGradient**
  - light: `['#FFFFFF', '#F5F7FA']`
  - dark: `['#1E1E1E', '#2C2C2C']`

### 테마 객체

#### lightTheme
라이트 모드에서 사용되는 모든 색상 값이 포함된 테마 객체입니다.

#### darkTheme
다크 모드에서 사용되는 모든 색상 값이 포함된 테마 객체입니다.

---

## 폰트 (Fonts)

**파일 위치**: `src/constants/fonts.ts`

### 사용 가능한 폰트

#### Pretendard (한글 폰트)
- `PRETENDARD_REGULAR`: `'Pretendard-Regular'`
- `PRETENDARD_BOLD`: `'Pretendard-Bold'`
- `PRETENDARD_LIGHT`: `'Pretendard-Light'`

#### Roboto (영문 폰트)
- `ROBOTO_BOLD`: `'Roboto-Bold'`
- `ROBOTO_REGULAR`: `'Roboto-Regular'`
- `ROBOTO_LIGHT`: `'Roboto-Light'`

#### BMJUA (한글 제목 폰트)
- `BMJUA`: `'BMJUA'`

### 사용 예시

```typescript
import { FONTS } from '@/constants/fonts';

const style = {
  fontFamily: FONTS.PRETENDARD_BOLD,
  fontSize: 16,
};
```

---

## 텍스트 컴포넌트 (TextBox)

**파일 위치**: `src/components/common/TextBox.tsx`

### 개요

`TextBox`는 애플리케이션 전체에서 일관된 타이포그래피를 제공하는 텍스트 컴포넌트입니다. 미리 정의된 variant를 사용하여 다양한 텍스트 스타일을 적용할 수 있습니다.

### Variant 종류

#### Title Variants
- **title1**: 26px, BMJUA
- **title2**: 24px, BMJUA
- **title3**: 22px, BMJUA
- **title4**: 20px, BMJUA
- **title5**: 18px, BMJUA

#### Body Variants
- **body1**: 17px, Pretendard Bold
- **body2**: 16px, Pretendard Bold
- **body3**: 15px, Pretendard Regular
- **body4**: 14px, Pretendard Regular
- **body5**: 14px, Pretendard Light
- **body6**: 13px, Pretendard Light
- **body7**: 12px, Pretendard Light

#### Button Variants
- **button1**: 18px, Pretendard Bold
- **button2**: 16px, Pretendard Bold
- **button3**: 14px, Pretendard Regular
- **button4**: 12px, Pretendard Regular

#### Caption Variants
- **caption1**: 13px, Roboto Bold
- **caption2**: 12px, Roboto Regular
- **caption3**: 12px, Roboto Light

### Line Height 자동 계산

`TextBox` 컴포넌트는 variant와 폰트에 따라 자동으로 lineHeight를 계산합니다:

- **Title**: 기본 계수 1.3 (BMJUA는 +0.1)
- **Body**: 기본 계수 1.5 (가독성 중요)
- **Button**: 기본 계수 1.2 (조밀하게)
- **Caption**: 기본 계수 1.4 (Roboto는 +0.15)

### Props

```typescript
interface TextBoxProps extends TextProps {
  variant?: VariantKeys;  // 기본값: 'body1'
  color?: string;         // 텍스트 색상 (선택사항)
  style?: StyleProp<TextStyle>;  // 추가 스타일 (선택사항)
  children?: React.ReactNode;
}
```

### 사용 예시

```typescript
import TextBox from '@/components/common/TextBox';
import { useTheme } from '@/context/ThemeProvider';

function MyComponent() {
  const { theme } = useTheme();

  return (
    <>
      <TextBox variant="title1">제목 텍스트</TextBox>
      <TextBox variant="body1" color={theme.primary}>
        본문 텍스트
      </TextBox>
      <TextBox variant="button1">버튼 텍스트</TextBox>
      <TextBox variant="caption1">캡션 텍스트</TextBox>
    </>
  );
}
```

---

## 테마 관리 (ThemeProvider)

**파일 위치**: `src/context/ThemeProvider.tsx`

### 개요

`ThemeProvider`는 애플리케이션의 테마(라이트/다크 모드)를 관리하는 Context Provider입니다. 시스템 테마를 자동으로 감지하고, 애플리케이션 레벨에서 테마를 토글할 수 있는 기능을 제공합니다.

### Context API

#### ThemeContextType

```typescript
interface ThemeContextType {
  theme: typeof lightTheme | typeof darkTheme;  // 현재 테마 객체
  isDarkMode: boolean;                          // 다크 모드 여부
  toggleTheme: () => void;                      // 테마 토글 함수
}
```

### Hook: useTheme

`ThemeProvider` 내부에서만 사용 가능한 커스텀 훅입니다.

```typescript
import { useTheme } from '@/context/ThemeProvider';

function MyComponent() {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>
        현재 모드: {isDarkMode ? '다크' : '라이트'}
      </Text>
      <Button onPress={toggleTheme} title="테마 변경" />
    </View>
  );
}
```

### 동작 방식

1. **시스템 테마 감지**: `useColorScheme()` 훅을 사용하여 시스템의 색상 스키마를 감지합니다.
2. **자동 동기화**: 시스템 테마가 변경되면 자동으로 애플리케이션 테마도 업데이트됩니다.
3. **수동 토글**: `toggleTheme()` 함수를 통해 애플리케이션 레벨에서 테마를 수동으로 변경할 수 있습니다.

### 사용 예시

#### 앱 루트에 Provider 설정

```typescript
import { ThemeProvider } from '@/context/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      {/* 앱 컴포넌트들 */}
    </ThemeProvider>
  );
}
```

#### 컴포넌트에서 테마 사용

```typescript
import { useTheme } from '@/context/ThemeProvider';
import { View, StyleSheet } from 'react-native';

function ThemedComponent() {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={{ color: theme.text }}>테마 적용된 텍스트</Text>
      <Text style={{ color: theme.textSecondary }}>보조 텍스트</Text>
      <View style={{ borderColor: theme.border }} />
    </View>
  );
}
```

### 주의사항

- `useTheme` 훅은 반드시 `ThemeProvider` 내부에서만 사용해야 합니다.
- `ThemeProvider` 외부에서 `useTheme`를 호출하면 에러가 발생합니다.
- 테마 변경은 애플리케이션 전체에 즉시 반영됩니다.

---

## 참고 자료

- [React Native Text 컴포넌트](https://reactnative.dev/docs/text)
- [React Context API](https://react.dev/reference/react/createContext)
- [React Native useColorScheme](https://reactnative.dev/docs/usecolorscheme)
