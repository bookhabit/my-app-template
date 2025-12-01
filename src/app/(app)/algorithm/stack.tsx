import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

export default function StackScreen() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingBottom: 0 },
      ]}
    >
      <View style={styles.content}>
        <TextBox variant="body2" color={theme.textSecondary}>
          이 화면은 스택(Stack) 학습 내용을 정리할 수 있는 자리입니다.
        </TextBox>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
});
