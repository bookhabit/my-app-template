import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

// @ts-ignore - TurboModule은 런타임에 로드됨
import NativeLocalStorage from '../../../../../specs/NativeLocalStorage';

const EMPTY = '<empty>';

export default function NewArchitectureNativeModuleScreen() {
  const { theme } = useTheme();
  const [value, setValue] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  useEffect(() => {
    try {
      const storedValue = NativeLocalStorage?.getItem('myKey');
      setValue(storedValue ?? null);
    } catch (error) {
      console.error('Error getting item:', error);
      setValue(null);
    }
  }, []);

  const saveValue = () => {
    try {
      NativeLocalStorage?.setItem(editingValue || EMPTY, 'myKey');
      setValue(editingValue || EMPTY);
      setEditingValue('');
    } catch (error) {
      console.error('Error setting item:', error);
    }
  };

  const clearAll = () => {
    try {
      NativeLocalStorage?.clear();
      setValue(null);
      setEditingValue('');
    } catch (error) {
      console.error('Error clearing:', error);
    }
  };

  const deleteValue = () => {
    try {
      NativeLocalStorage?.removeItem('myKey');
      setValue(null);
      setEditingValue('');
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          New Architecture Native Module
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          TurboModule을 사용한 네이티브 모듈 예제
        </TextBox>

        {/* 현재 저장된 값 표시 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            현재 저장된 값
          </TextBox>
          <View
            style={[
              styles.valueBox,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
              },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              {value ?? 'No Value'}
            </TextBox>
          </View>
        </View>

        {/* 입력 필드 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            값 입력
          </TextBox>
          <TextInput
            placeholder="저장할 텍스트를 입력하세요"
            value={editingValue}
            onChangeText={setEditingValue}
            style={styles.input}
          />
        </View>

        {/* 버튼들 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            작업
          </TextBox>
          <View style={styles.buttonContainer}>
            <CustomButton
              title="저장"
              onPress={saveValue}
              variant="primary"
              style={styles.button}
            />
            <CustomButton
              title="삭제"
              onPress={deleteValue}
              variant="outline"
              style={styles.button}
            />
            <CustomButton
              title="전체 삭제"
              onPress={clearAll}
              variant="outline"
              style={styles.button}
            />
          </View>
        </View>

        {/* 설명 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📌 New Architecture (TurboModule)란?
          </TextBox>
          <View style={styles.infoContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • React Native의 새로운 아키텍처에서 사용하는 네이티브 모듈
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • TurboModule을 통해 JavaScript와 네이티브 코드 간 통신
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 기존 NativeModule보다 더 빠르고 효율적
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • TypeScript 타입 안정성 제공
            </TextBox>
          </View>
        </View>

        {/* 사용법 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📋 사용법
          </TextBox>
          <View style={styles.codeBox}>
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {`import NativeLocalStorage from './specs/NativeLocalStorage';

// 값 저장
NativeLocalStorage.setItem('value', 'key');

// 값 가져오기
const value = NativeLocalStorage.getItem('key');

// 값 삭제
NativeLocalStorage.removeItem('key');

// 전체 삭제
NativeLocalStorage.clear();`}
            </TextBox>
          </View>
        </View>

        {/* 주의사항 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚠️ 주의사항
          </TextBox>
          <View style={styles.warningContainer}>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • New Architecture가 활성화되어 있어야 동작합니다
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 네이티브 코드 구현이 필요합니다 (Android/iOS)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • TurboModuleRegistry에 모듈이 등록되어 있어야 합니다
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 모듈이 없으면 에러가 발생할 수 있습니다
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
  valueBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 60,
    justifyContent: 'center',
  },
  input: {
    marginTop: 8,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    width: '100%',
  },
  infoContainer: {
    gap: 8,
  },
  infoItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
  codeBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
    marginTop: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    color: '#d4d4d4',
    lineHeight: 20,
  },
  warningContainer: {
    gap: 8,
  },
  warningItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
