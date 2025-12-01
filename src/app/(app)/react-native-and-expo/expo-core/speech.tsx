import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import * as Speech from 'expo-speech';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

interface Voice {
  identifier: string;
  language: string;
  name: string;
  quality: Speech.VoiceQuality;
}

export default function SpeechScreen() {
  const { theme } = useTheme();

  // State
  const [text, setText] = useState(
    '안녕하세요! 이것은 텍스트 음성 변환 테스트입니다.'
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [maxLength, setMaxLength] = useState<number>(0);

  // Options
  const [language, setLanguage] = useState('ko-KR');
  const [pitch, setPitch] = useState('1.0');
  const [rate, setRate] = useState('1.0');
  const [volume, setVolume] = useState('1.0');
  const [useApplicationAudioSession, setUseApplicationAudioSession] =
    useState(true);

  // Callbacks
  const [onStartCalled, setOnStartCalled] = useState(false);
  const [onDoneCalled, setOnDoneCalled] = useState(false);
  const [onStoppedCalled, setOnStoppedCalled] = useState(false);
  const [onErrorCalled, setOnErrorCalled] = useState<string>('');
  const [onBoundaryCalled, setOnBoundaryCalled] = useState<string>('');

  useEffect(() => {
    loadVoices();
    checkMaxLength();
    checkSpeakingStatus();
  }, []);

  const loadVoices = async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      setAvailableVoices(voices as Voice[]);
      if (voices.length > 0) {
        setSelectedVoice(voices[0].identifier);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const checkMaxLength = () => {
    setMaxLength(Speech.maxSpeechInputLength);
  };

  const checkSpeakingStatus = async () => {
    try {
      const speaking = await Speech.isSpeakingAsync();
      setIsSpeaking(speaking);
    } catch (error) {
      console.error('Failed to check speaking status:', error);
    }
  };

  const speak = () => {
    if (!text.trim()) {
      Alert.alert('알림', '텍스트를 입력하세요.');
      return;
    }

    if (text.length > maxLength) {
      Alert.alert(
        '알림',
        `텍스트가 너무 깁니다. 최대 ${maxLength}자까지 가능합니다.`
      );
      return;
    }

    // Reset callbacks
    setOnStartCalled(false);
    setOnDoneCalled(false);
    setOnStoppedCalled(false);
    setOnErrorCalled('');
    setOnBoundaryCalled('');

    const options: Speech.SpeechOptions = {
      language: language || undefined,
      pitch: parseFloat(pitch) || 1.0,
      rate: parseFloat(rate) || 1.0,
      voice: selectedVoice || undefined,
      onStart: () => {
        setOnStartCalled(true);
        setIsSpeaking(true);
      },
      onDone: () => {
        setOnDoneCalled(true);
        setIsSpeaking(false);
      },
      onStopped: () => {
        setOnStoppedCalled(true);
        setIsSpeaking(false);
      },
      onError: (error: Error) => {
        setOnErrorCalled(error.message);
        setIsSpeaking(false);
        Alert.alert('오류', `음성 변환 오류: ${error.message}`);
      },
      onBoundary: (event: any) => {
        setOnBoundaryCalled(`Word: ${event.charIndex}`);
      },
    };

    if (Platform.OS === 'ios') {
      options.volume = parseFloat(volume) || 1.0;
      options.useApplicationAudioSession = useApplicationAudioSession;
    }

    try {
      Speech.speak(text, options);
      setIsSpeaking(true);
    } catch (error: any) {
      Alert.alert('오류', `음성 변환 시작 실패: ${error.message || error}`);
    }
  };

  const pause = async () => {
    if (Platform.OS === 'android') {
      Alert.alert('알림', 'Android에서는 pause를 지원하지 않습니다.');
      return;
    }

    try {
      await Speech.pause();
      setIsSpeaking(false);
    } catch (error: any) {
      Alert.alert('오류', `일시정지 실패: ${error.message || error}`);
    }
  };

  const resume = async () => {
    if (Platform.OS === 'android') {
      Alert.alert('알림', 'Android에서는 resume을 지원하지 않습니다.');
      return;
    }

    try {
      await Speech.resume();
      setIsSpeaking(true);
    } catch (error: any) {
      Alert.alert('오류', `재개 실패: ${error.message || error}`);
    }
  };

  const stop = async () => {
    try {
      await Speech.stop();
      setIsSpeaking(false);
      setOnStoppedCalled(true);
    } catch (error: any) {
      Alert.alert('오류', `중지 실패: ${error.message || error}`);
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
      <CustomHeader title="Speech" showBackButton />
      <View style={styles.content}>
        {/* 상태 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            상태
          </TextBox>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              현재 재생 중:{' '}
              <TextBox
                variant="body2"
                color={isSpeaking ? theme.success : theme.textSecondary}
              >
                {isSpeaking ? '예' : '아니오'}
              </TextBox>
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              최대 텍스트 길이:{' '}
              <TextBox variant="body2" color={theme.primary}>
                {maxLength.toLocaleString()}자
              </TextBox>
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              사용 가능한 음성:{' '}
              <TextBox variant="body2" color={theme.primary}>
                {availableVoices.length}개
              </TextBox>
            </TextBox>
            {Platform.OS === 'ios' && (
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.marginTop}
              >
                ⚠️ iOS에서는 무음 모드일 때 소리가 나지 않습니다.
              </TextBox>
            )}
            <CustomButton
              title="재생 상태 확인"
              onPress={checkSpeakingStatus}
              style={styles.button}
            />
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
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              읽을 텍스트 ({text.length}/{maxLength})
            </TextBox>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={text}
              onChangeText={setText}
              placeholder="읽을 텍스트를 입력하세요"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={6}
            />
            {text.length > maxLength && (
              <TextBox
                variant="body4"
                color={theme.error}
                style={styles.marginTop}
              >
                텍스트가 너무 깁니다!
              </TextBox>
            )}
          </View>
        </View>

        {/* 음성 선택 */}
        {availableVoices.length > 0 && (
          <View style={styles.section}>
            <TextBox
              variant="title3"
              color={theme.text}
              style={styles.sectionTitle}
            >
              음성 선택
            </TextBox>
            <View style={styles.inputGroup}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                사용할 음성
              </TextBox>
              <ScrollView
                style={[
                  styles.voiceList,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                nestedScrollEnabled
              >
                {availableVoices.map((voice) => (
                  <CustomButton
                    key={voice.identifier}
                    title={`${voice.name} (${voice.language}) - ${voice.quality}`}
                    onPress={() => setSelectedVoice(voice.identifier)}
                    style={styles.voiceButton}
                    variant={
                      selectedVoice === voice.identifier ? 'primary' : 'ghost'
                    }
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* 옵션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            옵션
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              언어 코드 (IETF BCP 47)
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
              value={language}
              onChangeText={setLanguage}
              placeholder="ko-KR"
              placeholderTextColor={theme.textSecondary}
            />
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.hint}
            >
              예: ko-KR, en-US, ja-JP
            </TextBox>
          </View>
          <View style={styles.optionsRow}>
            <View style={styles.optionItem}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                Pitch (0.0 - 2.0)
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
                value={pitch}
                onChangeText={setPitch}
                placeholder="1.0"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.optionItem}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                Rate (0.0 - 2.0)
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
                value={rate}
                onChangeText={setRate}
                placeholder="1.0"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          {Platform.OS === 'ios' && (
            <>
              <View style={styles.inputGroup}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  Volume (0.0 - 1.0)
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
                  value={volume}
                  onChangeText={setVolume}
                  placeholder="1.0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
              <View
                style={[
                  styles.checkboxContainer,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <CustomButton
                  title={
                    useApplicationAudioSession
                      ? 'Application Audio Session 사용'
                      : '시스템 Audio Session 사용'
                  }
                  onPress={() =>
                    setUseApplicationAudioSession(!useApplicationAudioSession)
                  }
                  style={styles.button}
                  variant={useApplicationAudioSession ? 'primary' : 'ghost'}
                />
                <TextBox
                  variant="body4"
                  color={theme.textSecondary}
                  style={styles.hint}
                >
                  false로 설정하면 시스템이 자동으로 오디오 세션을 관리합니다.
                </TextBox>
              </View>
            </>
          )}
        </View>

        {/* 제어 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            제어
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="읽기 시작"
              onPress={speak}
              style={[styles.button, styles.flex1]}
              disabled={isSpeaking || !text.trim()}
            />
            {Platform.OS === 'ios' && (
              <>
                <CustomButton
                  title="일시정지"
                  onPress={pause}
                  style={[styles.button, styles.flex1]}
                  disabled={!isSpeaking}
                  variant="ghost"
                />
                <CustomButton
                  title="재개"
                  onPress={resume}
                  style={[styles.button, styles.flex1]}
                  disabled={isSpeaking}
                  variant="ghost"
                />
              </>
            )}
            <CustomButton
              title="중지"
              onPress={stop}
              style={[styles.button, styles.flex1]}
              disabled={!isSpeaking}
              variant="ghost"
            />
          </View>
        </View>

        {/* 콜백 상태 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            콜백 상태
          </TextBox>
          <View
            style={[
              styles.callbackBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              onStart:{' '}
              <TextBox
                variant="body2"
                color={onStartCalled ? theme.success : theme.textSecondary}
              >
                {onStartCalled ? '호출됨' : '대기 중'}
              </TextBox>
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              onDone:{' '}
              <TextBox
                variant="body2"
                color={onDoneCalled ? theme.success : theme.textSecondary}
              >
                {onDoneCalled ? '호출됨' : '대기 중'}
              </TextBox>
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              onStopped:{' '}
              <TextBox
                variant="body2"
                color={onStoppedCalled ? theme.success : theme.textSecondary}
              >
                {onStoppedCalled ? '호출됨' : '대기 중'}
              </TextBox>
            </TextBox>
            {onErrorCalled && (
              <TextBox
                variant="body2"
                color={theme.error}
                style={styles.marginTop}
              >
                onError: {onErrorCalled}
              </TextBox>
            )}
            {onBoundaryCalled && (
              <TextBox
                variant="body2"
                color={theme.primary}
                style={styles.marginTop}
              >
                onBoundary: {onBoundaryCalled}
              </TextBox>
            )}
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
  marginTop: {
    marginTop: 8,
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
  textArea: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionItem: {
    flex: 1,
    gap: 8,
  },
  checkboxContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
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
  voiceList: {
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
  },
  voiceButton: {
    marginBottom: 8,
  },
  callbackBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
});
