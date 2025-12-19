import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <TextBox variant="title2" color={theme.error} style={styles.title}>
          ⚠️ 오류가 발생했습니다
        </TextBox>

        <View style={[styles.errorBox, { backgroundColor: theme.surface }]}>
          <TextBox variant="body3" color={theme.text} style={styles.errorName}>
            {error.name}
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.errorMessage}
          >
            {error.message}
          </TextBox>

          {error.stack && (
            <ScrollView
              style={[
                styles.stackTrace,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <TextBox variant="caption3" color={theme.textSecondary}>
                {error.stack}
              </TextBox>
            </ScrollView>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={resetError}
          >
            <TextBox variant="button2" color="#fff">
              🔄 다시 시도
            </TextBox>
          </Pressable>

          <Pressable
            style={[
              styles.homeButton,
              {
                backgroundColor: 'transparent',
                borderColor: theme.primary,
                borderWidth: 2,
              },
            ]}
            onPress={() => {
              resetError();
              router.replace('/(app)/(tabs)');
            }}
          >
            <TextBox variant="button2" color={theme.primary}>
              🏠 홈으로 가기
            </TextBox>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorName: {
    marginBottom: 8,
  },
  errorMessage: {
    marginBottom: 12,
  },
  stackTrace: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 300,
  },
  buttonContainer: {
    gap: 12,
  },
  retryButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  homeButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
});
