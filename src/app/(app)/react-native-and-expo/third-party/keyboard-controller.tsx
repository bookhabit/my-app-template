import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Keyboard,
  Platform,
} from 'react-native';
// Note: KeyboardController requires native build
// Uncomment after running: cd ios && pod install && cd .. && npx expo run:ios
// import {
//   KeyboardController,
//   useKeyboardHandler,
//   useReanimatedKeyboardAnimation,
// } from 'react-native-keyboard-controller';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function KeyboardControllerScreen() {
  const { theme } = useTheme();

  // State
  const [text, setText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Keyboard handler (optional - only if native module is linked)
  // useKeyboardHandler(
  //   {
  //     onStart: (e) => {
  //       'worklet';
  //       console.log('Keyboard started:', e.height);
  //     },
  //     onMove: (e) => {
  //       'worklet';
  //       console.log('Keyboard moved:', e.height);
  //     },
  //     onEnd: (e) => {
  //       'worklet';
  //       console.log('Keyboard ended:', e.height);
  //     },
  //   },
  //   []
  // );

  // Reanimated keyboard animation (optional - only if native module is linked)
  // const { height, progress } = useReanimatedKeyboardAnimation();

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    // <KeyboardController>
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <CustomHeader title="KeyboardController" showBackButton />
      <View style={styles.content}>
        {/* 키보드 상태 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            키보드 상태
          </TextBox>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              키보드 표시:{' '}
              <TextBox
                variant="body2"
                color={isKeyboardVisible ? theme.success : theme.error}
              >
                {isKeyboardVisible ? '표시됨' : '숨김'}
              </TextBox>
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              키보드 높이: {keyboardHeight}px
            </TextBox>
          </View>
        </View>

        {/* 텍스트 입력 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            텍스트 입력
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
            value={text}
            onChangeText={setText}
            placeholder="텍스트를 입력하세요"
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* 키보드 제어 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            키보드 제어
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="키보드 숨기기"
              onPress={() => Keyboard.dismiss()}
              style={[styles.button, styles.flex1]}
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
              • KeyboardController는 키보드 애니메이션을 제어합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • useKeyboardHandler로 키보드 이벤트를 처리할 수 있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • useReanimatedKeyboardAnimation으로 애니메이션 값을 가져올 수
              있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 부드러운 키보드 애니메이션을 제공합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • iOS와 Android 모두에서 동작합니다.
            </TextBox>
          </View>
        </View>
      </View>
    </ScrollView>
    // </KeyboardController>
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
    gap: 8,
  },
  marginTop: {
    marginTop: 8,
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
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
