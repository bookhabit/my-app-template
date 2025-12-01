import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

export default function TextScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Text 컴포넌트
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          Text는 텍스트를 표시하는 컴포넌트입니다. React Native에서는 모든
          텍스트가 Text 컴포넌트로 감싸져야 합니다.
        </TextBox>

        {/* 기본 Text 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
            accessibilityHint="기본 Text"
          >
            기본 Text
          </TextBox>
          <Text style={[styles.basicText, { color: theme.text }]}>
            Hello World
          </Text>
        </View>

        {/* 스타일링 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            다양한 스타일
          </TextBox>
          <Text style={[styles.boldText, { color: theme.text }]}>
            Bold Text
          </Text>
          <Text style={[styles.italicText, { color: theme.text }]}>
            Italic Text
          </Text>
          <Text style={[styles.largeText, { color: theme.text }]}>
            Large Text
          </Text>
          <Text style={[styles.coloredText, { color: theme.primary }]}>
            Colored Text
          </Text>
        </View>

        {/* 중첩 Text 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            중첩 Text
          </TextBox>
          <Text style={[styles.nestedText, { color: theme.text }]}>
            Welcome to{' '}
            <Text style={[styles.boldText, { color: theme.primary }]}>
              React Native
            </Text>{' '}
            with nested text!
          </Text>
        </View>

        {/* 텍스트 정렬 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            텍스트 정렬
          </TextBox>
          <Text style={[styles.leftAlign, { color: theme.text }]}>
            Left Aligned Text
          </Text>
          <Text style={[styles.centerAlign, { color: theme.text }]}>
            Center Aligned Text
          </Text>
          <Text style={[styles.rightAlign, { color: theme.text }]}>
            Right Aligned Text
          </Text>
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
  basicText: {
    fontSize: 16,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  italicText: {
    fontStyle: 'italic',
    fontSize: 16,
  },
  largeText: {
    fontSize: 24,
  },
  coloredText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nestedText: {
    fontSize: 16,
    lineHeight: 24,
  },
  leftAlign: {
    fontSize: 16,
    textAlign: 'left',
  },
  centerAlign: {
    fontSize: 16,
    textAlign: 'center',
  },
  rightAlign: {
    fontSize: 16,
    textAlign: 'right',
  },
});
