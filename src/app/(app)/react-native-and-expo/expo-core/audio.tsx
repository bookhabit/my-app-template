import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';

import {
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
} from 'expo-audio';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function AudioScreen() {
  const { theme } = useTheme();

  // Audio Player
  const player = useAudioPlayer(require('@/assets/images/example_audio.mp3'), {
    updateInterval: 100,
  });
  const playerStatus = useAudioPlayerStatus(player);

  // Audio Recorder
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const [recordingPermission, setRecordingPermission] =
    useState<string>('확인 중...');
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  useEffect(() => {
    checkRecordingPermissions();
    setupAudioMode();
  }, []);

  const checkRecordingPermissions = async () => {
    try {
      const { status } = await getRecordingPermissionsAsync();
      setRecordingPermission(
        status === 'granted'
          ? '허용됨'
          : status === 'denied'
            ? '거부됨'
            : '확인 필요'
      );
    } catch (error) {
      setRecordingPermission('오류 발생');
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await requestRecordingPermissionsAsync();
      setRecordingPermission(
        status === 'granted'
          ? '허용됨'
          : status === 'denied'
            ? '거부됨'
            : '확인 필요'
      );

      if (status !== 'granted') {
        Alert.alert(
          '권한 필요',
          '녹음 기능을 사용하려면 마이크 권한이 필요합니다.'
        );
      }
    } catch (error) {
      Alert.alert('오류', '권한 요청 중 오류가 발생했습니다.');
    }
  };

  const setupAudioMode = async () => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    } catch (error) {
      console.error('Audio mode setup error:', error);
    }
  };

  const handlePlay = () => {
    if (playerStatus.didJustFinish) {
      player.seekTo(0);
    }
    player.play();
  };

  const handlePause = () => {
    player.pause();
  };

  const handleStop = () => {
    player.pause();
    player.seekTo(0);
  };

  const handleSeek = (seconds: number) => {
    player.seekTo(seconds);
  };

  const handleStartRecording = async () => {
    try {
      if (recordingPermission !== '허용됨') {
        await requestPermissions();
        return;
      }

      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordedUri(null);
    } catch (error) {
      Alert.alert('오류', '녹음 시작 중 오류가 발생했습니다.');
    }
  };

  const handleStopRecording = async () => {
    try {
      await recorder.stop();
      if (recorderState.url) {
        setRecordedUri(recorderState.url);
      }
    } catch (error) {
      Alert.alert('오류', '녹음 중지 중 오류가 발생했습니다.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    return formatTime(seconds);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Expo Audio" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Expo Audio
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          오디오 재생 및 녹음 기능
        </TextBox>

        {/* 개념 설명 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📚 개념 설명
          </TextBox>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              AudioPlayer (오디오 재생)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 오디오 파일을 재생하는 플레이어
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • useAudioPlayer 훅으로 생성
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • play(), pause(), seekTo() 등의 메서드 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 재생 속도, 볼륨, 루프 등 제어 가능
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              AudioRecorder (오디오 녹음)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 마이크로 오디오를 녹음하는 레코더
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • useAudioRecorder 훅으로 생성
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • HIGH_QUALITY, LOW_QUALITY 프리셋 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 녹음 권한 필요 (마이크 접근)
            </TextBox>
          </View>
        </View>

        {/* 오디오 재생 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎵 오디오 재생
          </TextBox>

          <View style={styles.playerContainer}>
            {/* 재생 상태 */}
            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  상태:
                </TextBox>
                <TextBox
                  variant="body2"
                  color={
                    playerStatus.playing
                      ? theme.success
                      : playerStatus.isLoaded
                        ? theme.text
                        : theme.textSecondary
                  }
                >
                  {playerStatus.playing
                    ? '▶ 재생 중'
                    : playerStatus.isLoaded
                      ? '⏸ 일시정지'
                      : '⏳ 로딩 중'}
                </TextBox>
              </View>

              <View style={styles.statusRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  재생 시간:
                </TextBox>
                <TextBox variant="body2" color={theme.text}>
                  {formatTime(playerStatus.currentTime)} /{' '}
                  {formatTime(playerStatus.duration || 0)}
                </TextBox>
              </View>

              {playerStatus.isBuffering && (
                <View style={styles.statusRow}>
                  <TextBox variant="body4" color={theme.warning}>
                    버퍼링 중...
                  </TextBox>
                </View>
              )}
            </View>

            {/* 프로그레스 바 */}
            {playerStatus.duration > 0 && (
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: theme.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (playerStatus.currentTime / playerStatus.duration) *
                          100
                        }%`,
                        backgroundColor: theme.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* 재생 컨트롤 */}
            <View style={styles.controlsContainer}>
              <CustomButton
                title="⏮ 처음으로"
                onPress={() => handleSeek(0)}
                variant="ghost"
                style={styles.controlButton}
              />
              <CustomButton
                title={playerStatus.playing ? '⏸ 일시정지' : '▶ 재생'}
                onPress={playerStatus.playing ? handlePause : handlePlay}
                style={[
                  styles.controlButton,
                  styles.playButton,
                  { backgroundColor: theme.primary },
                ]}
              />
              <CustomButton
                title="⏹ 정지"
                onPress={handleStop}
                variant="ghost"
                style={styles.controlButton}
              />
            </View>

            {/* 추가 제어 */}
            <View style={styles.advancedControls}>
              <View style={styles.controlRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  볼륨:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {Math.round(player.volume * 100)}%
                </TextBox>
              </View>
              <View style={styles.controlRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  재생 속도:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {player.playbackRate.toFixed(1)}x
                </TextBox>
              </View>
              <View style={styles.controlRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  루프:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {player.loop ? '✅' : '❌'}
                </TextBox>
              </View>
            </View>
          </View>
        </View>

        {/* 오디오 녹음 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎤 오디오 녹음
          </TextBox>

          {/* 권한 상태 */}
          <View style={styles.permissionContainer}>
            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                마이크 권한:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  recordingPermission === '허용됨'
                    ? theme.success
                    : recordingPermission === '거부됨'
                      ? theme.error
                      : theme.text
                }
              >
                {recordingPermission}
              </TextBox>
            </View>

            {recordingPermission !== '허용됨' && (
              <CustomButton
                title="권한 요청"
                onPress={requestPermissions}
                style={styles.button}
              />
            )}
          </View>

          {/* 녹음 상태 */}
          {recordingPermission === '허용됨' && (
            <View style={styles.recorderContainer}>
              <View style={styles.statusContainer}>
                <View style={styles.statusRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    녹음 상태:
                  </TextBox>
                  <TextBox
                    variant="body2"
                    color={recorderState.isRecording ? theme.error : theme.text}
                  >
                    {recorderState.isRecording ? '🔴 녹음 중' : '⏸ 대기 중'}
                  </TextBox>
                </View>

                {recorderState.isRecording && (
                  <View style={styles.statusRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      녹음 시간:
                    </TextBox>
                    <TextBox variant="body2" color={theme.text}>
                      {formatDuration(recorderState.durationMillis)}
                    </TextBox>
                  </View>
                )}

                {recordedUri && (
                  <View style={styles.statusRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      저장 위치:
                    </TextBox>
                    <TextBox
                      variant="body4"
                      color={theme.text}
                      style={styles.uriText}
                    >
                      {recordedUri}
                    </TextBox>
                  </View>
                )}
              </View>

              {/* 녹음 컨트롤 */}
              <View style={styles.controlsContainer}>
                <CustomButton
                  title={
                    recorderState.isRecording ? '⏹ 녹음 중지' : '🔴 녹음 시작'
                  }
                  onPress={
                    recorderState.isRecording
                      ? handleStopRecording
                      : handleStartRecording
                  }
                  style={[
                    styles.button,
                    {
                      backgroundColor: recorderState.isRecording
                        ? theme.error
                        : theme.success,
                    },
                  ]}
                />
              </View>

              {/* 녹음된 오디오 재생 */}
              {recordedUri && (
                <View style={styles.recordedAudioContainer}>
                  <TextBox
                    variant="body2"
                    color={theme.text}
                    style={styles.recordedAudioTitle}
                  >
                    녹음된 오디오 재생
                  </TextBox>
                  <RecorderPlayer uri={recordedUri} />
                </View>
              )}
            </View>
          )}
        </View>

        {/* 코드 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💻 코드 예제
          </TextBox>
          <View
            style={[
              styles.codeContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {`// 1. 오디오 재생
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

function AudioPlayer() {
  const player = useAudioPlayer(require('./audio.mp3'));
  const status = useAudioPlayerStatus(player);

  return (
    <View>
      <Button
        title={status.playing ? 'Pause' : 'Play'}
        onPress={() => {
          if (status.playing) {
            player.pause();
          } else {
            player.play();
          }
        }}
      />
      <Text>
        {status.currentTime} / {status.duration}
      </Text>
    </View>
  );
}

// 2. 오디오 녹음
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';

function AudioRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);

  useEffect(() => {
    (async () => {
      const { granted } = await requestRecordingPermissionsAsync();
      if (granted) {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      }
    })();
  }, []);

  const startRecording = async () => {
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stopRecording = async () => {
    await recorder.stop();
    console.log('Recording URI:', recorder.uri);
  };

  return (
    <View>
      <Button
        title={state.isRecording ? 'Stop' : 'Record'}
        onPress={state.isRecording ? stopRecording : startRecording}
      />
      <Text>Duration: {state.durationMillis}ms</Text>
    </View>
  );
}

// 3. 재생 속도 및 볼륨 제어
const player = useAudioPlayer(source);

// 재생 속도 변경 (0.5x ~ 2.0x)
player.playbackRate = 1.5; // 1.5배 속도

// 볼륨 조절 (0.0 ~ 1.0)
player.volume = 0.5; // 50% 볼륨

// 루프 설정
player.loop = true;

// 특정 위치로 이동
player.seekTo(30); // 30초 위치로`}
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
              • 녹음 기능 사용 시 마이크 권한 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 헤드폰/블루투스 연결 해제 시 자동 정지
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS 백그라운드 재생은 별도 설정 필요 (UIBackgroundModes)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Web에서는 HTTPS 환경 필요 (마이크 접근)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • expo-av과 달리 재생 완료 후 자동 재설정 안 됨 (seekTo 필요)
            </TextBox>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// 녹음된 오디오를 재생하는 컴포넌트
function RecorderPlayer({ uri }: { uri: string }) {
  const { theme } = useTheme();
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    if (status.didJustFinish) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <View
      style={[
        styles.recordedPlayerContainer,
        { backgroundColor: theme.background, borderColor: theme.border },
      ]}
    >
      <View style={styles.recordedPlayerControls}>
        <CustomButton
          title={status.playing ? '⏸ 일시정지' : '▶ 재생'}
          onPress={status.playing ? () => player.pause() : handlePlay}
          variant="ghost"
          style={styles.smallButton}
        />
        <TextBox variant="body4" color={theme.textSecondary}>
          {formatTime(status.currentTime)} / {formatTime(status.duration || 0)}
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
    gap: 16,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  conceptContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 6,
  },
  conceptTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  conceptText: {
    marginLeft: 8,
    lineHeight: 20,
  },
  playerContainer: {
    gap: 16,
  },
  statusContainer: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    flex: 1,
  },
  playButton: {
    flex: 2,
  },
  advancedControls: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 8,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginTop: 8,
  },
  permissionContainer: {
    gap: 12,
  },
  recorderContainer: {
    marginTop: 16,
    gap: 16,
  },
  uriText: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'right',
    marginLeft: 8,
  },
  recordedAudioContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 8,
  },
  recordedAudioTitle: {
    marginBottom: 4,
  },
  recordedPlayerContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  recordedPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  codeContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  warningContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    gap: 8,
  },
  warningItem: {
    marginLeft: 8,
    lineHeight: 22,
  },
});
