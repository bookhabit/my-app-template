import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

export default function DimensionsScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Dimensions
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          Dimensions를 테스트해보세요.
        </TextBox>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox variant="body2" color={theme.textSecondary}>
            Dimensions 예제를 추가하세요
          </TextBox>
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
});
