import { useState } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';
import { Picker } from '@react-native-picker/picker';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

const languages = [
  { label: '한국어', value: 'ko' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
  { label: '中文', value: 'zh' },
  { label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
  { label: 'Deutsch', value: 'de' },
];

const colors = [
  { label: '빨강', value: 'red' },
  { label: '파랑', value: 'blue' },
  { label: '초록', value: 'green' },
  { label: '노랑', value: 'yellow' },
  { label: '보라', value: 'purple' },
];

export default function PickerScreen() {
  const { theme } = useTheme();

  // State
  const [selectedLanguage, setSelectedLanguage] = useState('ko');
  const [selectedColor, setSelectedColor] = useState('red');
  const [enabled, setEnabled] = useState(true);
  const [prompt, setPrompt] = useState('언어를 선택하세요');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="Picker" showBackButton />
      <View style={styles.content}>
        {/* 언어 선택 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            언어 선택
          </TextBox>
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Picker
              selectedValue={selectedLanguage}
              onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
              enabled={enabled}
              style={[styles.picker, { color: theme.text }]}
              itemStyle={{ color: theme.text }}
            >
              {languages.map((lang) => (
                <Picker.Item
                  key={lang.value}
                  label={lang.label}
                  value={lang.value}
                />
              ))}
            </Picker>
          </View>
          <View
            style={[
              styles.resultBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              선택된 언어:{' '}
              {languages.find((l) => l.value === selectedLanguage)?.label}
            </TextBox>
          </View>
        </View>

        {/* 색상 선택 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            색상 선택
          </TextBox>
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Picker
              selectedValue={selectedColor}
              onValueChange={(itemValue) => setSelectedColor(itemValue)}
              enabled={enabled}
              style={[styles.picker, { color: theme.text }]}
              itemStyle={{ color: theme.text }}
            >
              {colors.map((color) => (
                <Picker.Item
                  key={color.value}
                  label={color.label}
                  value={color.value}
                />
              ))}
            </Picker>
          </View>
          <View
            style={[
              styles.resultBox,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderLeftWidth: 4,
                borderLeftColor: selectedColor,
              },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              선택된 색상:{' '}
              {colors.find((c) => c.value === selectedColor)?.label}
            </TextBox>
          </View>
        </View>

        {/* 옵션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            옵션
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title={enabled ? '활성화 ON' : '활성화 OFF'}
              onPress={() => setEnabled(!enabled)}
              style={[styles.button, styles.flex1]}
              variant={enabled ? 'primary' : 'ghost'}
            />
          </View>
          {Platform.OS === 'android' && (
            <View style={styles.inputGroup}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                Prompt (Android)
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                Android에서는 prompt 속성을 사용할 수 있습니다.
              </TextBox>
            </View>
          )}
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
              • iOS: 드롭다운 스타일의 피커가 표시됩니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android: 다이얼로그 스타일의 피커가 표시됩니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • enabled 속성으로 피커를 비활성화할 수 있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android에서는 prompt 속성으로 다이얼로그 제목을 설정할 수
              있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • itemStyle로 각 항목의 스타일을 설정할 수 있습니다.
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
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : undefined,
  },
  resultBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flex1: {
    flex: 1,
    minWidth: '30%',
  },
  button: {
    marginTop: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
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
