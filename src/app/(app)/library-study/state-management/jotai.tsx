import { View, StyleSheet } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import CustomHeader from '@/components/layout/CustomHeader';

export default function JotaiScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="Jotai" showBackButton />
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

