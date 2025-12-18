import { View, StyleSheet } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

export default function JotaiScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text}>
          Jotai
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
    padding: 20,
  },
});
