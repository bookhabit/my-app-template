import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import CustomHeader from '@/components/layout/CustomHeader';
import ReactHookFormExample from './components/ReactHookFormExample';

export default function ReactHookFormZodScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="React Hook Form + Zod" showBackButton />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <TextBox variant="title2" color={theme.text} style={styles.heading}>
            React Hook Form + Zod
          </TextBox>
          <ReactHookFormExample />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    padding: 20,
  },
  heading: {
    marginBottom: 24,
  },
});
