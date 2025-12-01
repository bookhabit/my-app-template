import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

// Note: Requires native build - run: cd ios && pod install && cd .. && npx expo run:ios
let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.warn('AsyncStorage native module not linked');
  AsyncStorage = null;
}

export default function AsyncStorageScreen() {
  const { theme } = useTheme();

  // State
  const [key, setKey] = useState('testKey');
  const [value, setValue] = useState('testValue');
  const [storedValue, setStoredValue] = useState<string | null>(null);
  const [allKeys, setAllKeys] = useState<string[]>([]);

  useEffect(() => {
    loadAllKeys();
  }, []);

  const loadAllKeys = async () => {
    if (!AsyncStorage) {
      setAllKeys([]);
      return;
    }
    try {
      const keys = await AsyncStorage.getAllKeys();
      setAllKeys(keys);
    } catch (error: any) {
      Alert.alert('오류', `키 목록 로드 실패: ${error.message || error}`);
    }
  };

  const storeData = async () => {
    if (!AsyncStorage) {
      Alert.alert(
        '알림',
        'AsyncStorage 네이티브 모듈이 링크되지 않았습니다. 네이티브 빌드가 필요합니다.'
      );
      return;
    }
    if (!key.trim()) {
      Alert.alert('알림', '키를 입력하세요.');
      return;
    }

    try {
      await AsyncStorage.setItem(key, value);
      Alert.alert('성공', '데이터가 저장되었습니다.');
      await loadAllKeys();
      await getData();
    } catch (error: any) {
      Alert.alert('오류', `저장 실패: ${error.message || error}`);
    }
  };

  const getData = async () => {
    if (!AsyncStorage) {
      Alert.alert(
        '알림',
        'AsyncStorage 네이티브 모듈이 링크되지 않았습니다. 네이티브 빌드가 필요합니다.'
      );
      return;
    }
    if (!key.trim()) {
      Alert.alert('알림', '키를 입력하세요.');
      return;
    }

    try {
      const value = await AsyncStorage.getItem(key);
      setStoredValue(value);
      if (value === null) {
        Alert.alert('알림', '저장된 데이터가 없습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', `읽기 실패: ${error.message || error}`);
    }
  };

  const removeData = async () => {
    if (!AsyncStorage) {
      Alert.alert(
        '알림',
        'AsyncStorage 네이티브 모듈이 링크되지 않았습니다. 네이티브 빌드가 필요합니다.'
      );
      return;
    }
    if (!key.trim()) {
      Alert.alert('알림', '키를 입력하세요.');
      return;
    }

    try {
      await AsyncStorage.removeItem(key);
      setStoredValue(null);
      Alert.alert('성공', '데이터가 삭제되었습니다.');
      await loadAllKeys();
    } catch (error: any) {
      Alert.alert('오류', `삭제 실패: ${error.message || error}`);
    }
  };

  const clearAll = async () => {
    if (!AsyncStorage) {
      Alert.alert(
        '알림',
        'AsyncStorage 네이티브 모듈이 링크되지 않았습니다. 네이티브 빌드가 필요합니다.'
      );
      return;
    }
    try {
      await AsyncStorage.clear();
      setStoredValue(null);
      setAllKeys([]);
      Alert.alert('성공', '모든 데이터가 삭제되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `전체 삭제 실패: ${error.message || error}`);
    }
  };

  const getMultiple = async () => {
    if (!AsyncStorage) {
      Alert.alert(
        '알림',
        'AsyncStorage 네이티브 모듈이 링크되지 않았습니다. 네이티브 빌드가 필요합니다.'
      );
      return;
    }
    if (allKeys.length === 0) {
      Alert.alert('알림', '저장된 키가 없습니다.');
      return;
    }

    try {
      const values = await AsyncStorage.multiGet(allKeys);
      const result = values
        .map(([k, v]) => `${k}: ${v || '(null)'}`)
        .join('\n');
      Alert.alert('모든 데이터', result);
    } catch (error: any) {
      Alert.alert('오류', `다중 읽기 실패: ${error.message || error}`);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="AsyncStorage" showBackButton />
      <View style={styles.content}>
        {/* 키-값 입력 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            키-값 저장
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              키
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
              value={key}
              onChangeText={setKey}
              placeholder="키를 입력하세요"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              값
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
              value={value}
              onChangeText={setValue}
              placeholder="값을 입력하세요"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.buttonRow}>
            <CustomButton
              title="저장"
              onPress={storeData}
              style={[styles.button, styles.flex1]}
            />
            <CustomButton
              title="읽기"
              onPress={getData}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
            <CustomButton
              title="삭제"
              onPress={removeData}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
          </View>
        </View>

        {/* 저장된 값 표시 */}
        {storedValue !== null && (
          <View style={styles.section}>
            <TextBox
              variant="title3"
              color={theme.text}
              style={styles.sectionTitle}
            >
              저장된 값
            </TextBox>
            <View
              style={[
                styles.resultBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextBox variant="body2" color={theme.text}>
                {storedValue}
              </TextBox>
            </View>
          </View>
        )}

        {/* 키 목록 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            저장된 키 목록 ({allKeys.length}개)
          </TextBox>
          {allKeys.length > 0 ? (
            <View
              style={[
                styles.keysBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {allKeys.map((k) => (
                <TextBox
                  key={k}
                  variant="body3"
                  color={theme.text}
                  style={styles.keyItem}
                >
                  • {k}
                </TextBox>
              ))}
            </View>
          ) : (
            <TextBox variant="body3" color={theme.textSecondary}>
              저장된 키가 없습니다.
            </TextBox>
          )}
        </View>

        {/* 유틸리티 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            유틸리티
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="모든 데이터 읽기"
              onPress={getMultiple}
              style={[styles.button, styles.flex1]}
            />
            <CustomButton
              title="키 목록 새로고침"
              onPress={loadAllKeys}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
            <CustomButton
              title="전체 삭제"
              onPress={clearAll}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
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
              • AsyncStorage는 비동기 키-값 저장소입니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 데이터는 앱이 삭제될 때까지 유지됩니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 모든 값은 문자열로 저장됩니다. 객체는 JSON.stringify()를
              사용하세요.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • multiGet, multiSet, multiRemove로 여러 키를 한 번에 처리할 수
              있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 민감한 정보는 SecureStore를 사용하세요.
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
  inputGroup: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
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
  resultBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  keysBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  keyItem: {
    marginBottom: 4,
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
