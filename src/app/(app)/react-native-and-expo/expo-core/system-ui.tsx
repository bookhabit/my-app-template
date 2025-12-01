import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import * as SystemUI from 'expo-system-ui';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function SystemUIScreen() {
  const { theme } = useTheme();

  // State
  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState<
    string | null
  >(null);

  useEffect(() => {
    loadBackgroundColor();
  }, []);

  const loadBackgroundColor = async () => {
    try {
      const color = await SystemUI.getBackgroundColorAsync();
      setCurrentBackgroundColor(color as string);
      if (color) {
        setBackgroundColor(color as string);
      }
    } catch (error) {
      console.error('Failed to load background color:', error);
    }
  };

  const setBackgroundColorAsync = async () => {
    try {
      const color = backgroundColor.trim() || null;
      await SystemUI.setBackgroundColorAsync(color);
      setCurrentBackgroundColor(color);
      Alert.alert('성공', `배경색이 ${color || '기본값'}으로 설정되었습니다.`);
      await loadBackgroundColor();
    } catch (error: any) {
      Alert.alert('오류', `배경색 설정 실패: ${error.message || error}`);
    }
  };

  const presetColors = [
    { name: '검정', value: '#000000' },
    { name: '흰색', value: '#FFFFFF' },
    { name: '빨강', value: '#FF0000' },
    { name: '초록', value: '#00FF00' },
    { name: '파랑', value: '#0000FF' },
    { name: '기본값', value: '' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="SystemUI" showBackButton />
      <View style={styles.content}>
        {/* 현재 상태 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            현재 상태
          </TextBox>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              현재 배경색:{' '}
              <TextBox variant="body2" color={theme.primary}>
                {currentBackgroundColor || '설정되지 않음 (기본값)'}
              </TextBox>
            </TextBox>
            {currentBackgroundColor && (
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: currentBackgroundColor },
                ]}
              />
            )}
            <CustomButton
              title="배경색 새로고침"
              onPress={loadBackgroundColor}
              style={styles.button}
            />
          </View>
        </View>

        {/* 배경색 설정 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            배경색 설정
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              배경색 (CSS 3 색상)
            </TextBox>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={backgroundColor}
              onChangeText={setBackgroundColor}
              placeholder="#FFFFFF 또는 black, transparent"
              placeholderTextColor={theme.textSecondary}
            />
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.hint}
            >
              CSS 3 (SVG) 색상 형식을 사용하세요. 예: #FFFFFF, rgb(255,255,255),
              black, transparent. 빈 값은 기본값으로 설정됩니다.
            </TextBox>
          </View>
          {backgroundColor && (
            <View
              style={[
                styles.colorPreview,
                {
                  backgroundColor: backgroundColor,
                  borderColor: theme.border,
                },
              ]}
            />
          )}
          <CustomButton
            title="배경색 설정"
            onPress={setBackgroundColorAsync}
            style={styles.button}
          />
        </View>

        {/* 프리셋 색상 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            프리셋 색상
          </TextBox>
          <View style={styles.presetGrid}>
            {presetColors.map((preset) => (
              <CustomButton
                key={preset.name}
                title={preset.name}
                onPress={() => {
                  setBackgroundColor(preset.value);
                  if (preset.value) {
                    setBackgroundColorAsync();
                  } else {
                    SystemUI.setBackgroundColorAsync(null);
                    setCurrentBackgroundColor(null);
                  }
                }}
                style={styles.presetButton}
                variant={backgroundColor === preset.value ? 'primary' : 'ghost'}
              />
            ))}
          </View>
        </View>

        {/* 참고사항 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            참고사항
          </TextBox>
          <View
            style={[
              styles.infoBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 배경색은 루트 뷰의 배경색을 설정합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android에서는 userInterfaceStyle도 설정할 수 있지만, 이는
              app.json에서만 설정 가능합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • iOS에서는 backgroundColor를 app.json에서 설정할 수 있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • null을 전달하면 기본값으로 되돌립니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • CSS 3 (SVG) 색상 형식을 지원합니다: hex, rgb, rgba, named colors
              등.
            </TextBox>
          </View>
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
  statusBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  colorPreview: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  button: {
    marginTop: 8,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    minWidth: '30%',
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  infoText: {
    lineHeight: 20,
  },
});
