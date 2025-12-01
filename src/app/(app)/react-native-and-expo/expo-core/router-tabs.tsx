import { useState } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function RouterTabsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="Router Tabs" showBackButton />
      <View style={styles.content}>
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Native Tabs 데모
          </TextBox>
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.description}
          >
            플랫폼 네이티브 탭을 사용한 실제 동작 데모입니다.
          </TextBox>
          <CustomButton
            title="Native Tabs 데모 열기"
            onPress={() =>
              router.push(
                '/(app)/react-native-and-expo/expo-core/router-native-tabs-demo/tab1' as any
              )
            }
            style={styles.button}
          />
        </View>

        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Custom Tabs (UI) 데모
          </TextBox>
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.description}
          >
            커스텀 탭 레이아웃을 사용한 실제 동작 데모입니다.
          </TextBox>
          <CustomButton
            title="Custom Tabs 데모 열기"
            onPress={() =>
              router.push(
                '/(app)/react-native-and-expo/expo-core/router-ui-demo/tab1' as any
              )
            }
            style={styles.button}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  description: {
    lineHeight: 20,
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
});
