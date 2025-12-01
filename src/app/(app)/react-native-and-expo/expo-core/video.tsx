import { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import { useEvent } from 'expo';
import {
  VideoView,
  useVideoPlayer,
  VideoSource,
  SourceLoadEventPayload,
} from 'expo-video';

import { useTheme } from '@/context/ThemeProvider';
import Slider from '@react-native-community/slider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

const sampleVideos: { name: string; source: VideoSource }[] = [
  {
    name: 'Big Buck Bunny',
    source:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    name: 'Elephants Dream',
    source:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    name: 'For Bigger Blazes',
    source:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
];

export default function VideoScreen() {
  const { theme } = useTheme();

  // State
  const [videoUrl, setVideoUrl] = useState(sampleVideos[0].source as string);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPosition, setBufferedPosition] = useState(0);

  // Player options
  const [nativeControls, setNativeControls] = useState(true);
  const [allowsFullscreen, setAllowsFullscreen] = useState(true);
  const [allowsPictureInPicture, setAllowsPictureInPicture] = useState(true);
  const [contentFit, setContentFit] = useState<'contain' | 'cover' | 'fill'>(
    'contain'
  );
  const [loop, setLoop] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showNowPlayingNotification, setShowNowPlayingNotification] =
    useState(false);
  const [staysActiveInBackground, setStaysActiveInBackground] = useState(false);

  const videoViewRef = useRef<any>(null);

  const player = useVideoPlayer(videoUrl as VideoSource, (player) => {
    player.loop = loop;
    player.muted = muted;
    player.volume = volume;
    player.playbackRate = playbackRate;
    player.showNowPlayingNotification = showNowPlayingNotification;
    player.staysActiveInBackground = staysActiveInBackground;
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  const { status } = useEvent(player, 'statusChange', {
    status: player.status,
  });

  const sourceLoadEvent = useEvent(player, 'sourceLoad', null);

  useEffect(() => {
    if (player) {
      setDuration(player.duration || 0);
    }
  }, [player, sourceLoadEvent]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (player) {
        setCurrentTime(player.currentTime);
        setBufferedPosition(player.bufferedPosition);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player]);

  useEffect(() => {
    if (player) {
      player.loop = loop;
    }
  }, [loop, player]);

  useEffect(() => {
    if (player) {
      player.muted = muted;
    }
  }, [muted, player]);

  useEffect(() => {
    if (player) {
      player.volume = volume;
    }
  }, [volume, player]);

  useEffect(() => {
    if (player) {
      player.playbackRate = playbackRate;
    }
  }, [playbackRate, player]);

  useEffect(() => {
    if (player) {
      player.showNowPlayingNotification = showNowPlayingNotification;
    }
  }, [showNowPlayingNotification, player]);

  useEffect(() => {
    if (player) {
      player.staysActiveInBackground = staysActiveInBackground;
    }
  }, [staysActiveInBackground, player]);

  const handlePlay = () => {
    player.play();
  };

  const handlePause = () => {
    player.pause();
  };

  const handleSeek = (time: number) => {
    player.currentTime = time;
    setCurrentTime(time);
  };

  const handleReplay = () => {
    player.replay();
  };

  const handleEnterFullscreen = async () => {
    try {
      await videoViewRef.current?.enterFullscreen();
      setIsFullscreen(true);
    } catch (error: any) {
      Alert.alert('오류', `전체화면 진입 실패: ${error.message || error}`);
    }
  };

  const handleExitFullscreen = async () => {
    try {
      await videoViewRef.current?.exitFullscreen();
      setIsFullscreen(false);
    } catch (error: any) {
      Alert.alert('오류', `전체화면 종료 실패: ${error.message || error}`);
    }
  };

  const handleStartPictureInPicture = async () => {
    try {
      await videoViewRef.current?.startPictureInPicture();
      setIsPictureInPicture(true);
    } catch (error: any) {
      Alert.alert('오류', `PiP 시작 실패: ${error.message || error}`);
    }
  };

  const handleStopPictureInPicture = async () => {
    try {
      await videoViewRef.current?.stopPictureInPicture();
      setIsPictureInPicture(false);
    } catch (error: any) {
      Alert.alert('오류', `PiP 종료 실패: ${error.message || error}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="Video" showBackButton />
      <View style={styles.content}>
        {/* 비디오 플레이어 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            비디오 플레이어
          </TextBox>
          <View
            style={[
              styles.videoContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <VideoView
              ref={videoViewRef}
              player={player}
              style={styles.video}
              nativeControls={nativeControls}
              allowsFullscreen={allowsFullscreen}
              allowsPictureInPicture={allowsPictureInPicture}
              contentFit={contentFit}
              onFullscreenEnter={() => setIsFullscreen(true)}
              onFullscreenExit={() => setIsFullscreen(false)}
              onPictureInPictureStart={() => setIsPictureInPicture(true)}
              onPictureInPictureStop={() => setIsPictureInPicture(false)}
            />
          </View>
        </View>

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
              재생 상태:{' '}
              <TextBox
                variant="body2"
                color={isPlaying ? theme.success : theme.textSecondary}
              >
                {isPlaying ? '재생 중' : '일시정지'}
              </TextBox>
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              상태:{' '}
              <TextBox variant="body2" color={theme.primary}>
                {status}
              </TextBox>
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              시간: {formatTime(currentTime)} / {formatTime(duration)}
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              버퍼: {formatTime(bufferedPosition)}
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              전체화면:{' '}
              <TextBox
                variant="body2"
                color={isFullscreen ? theme.success : theme.textSecondary}
              >
                {isFullscreen ? '활성화' : '비활성화'}
              </TextBox>
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              Picture-in-Picture:{' '}
              <TextBox
                variant="body2"
                color={isPictureInPicture ? theme.success : theme.textSecondary}
              >
                {isPictureInPicture ? '활성화' : '비활성화'}
              </TextBox>
            </TextBox>
          </View>
        </View>

        {/* 비디오 소스 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            비디오 소스
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              비디오 URL
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
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="https://example.com/video.mp4"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.buttonRow}>
            {sampleVideos.map((video) => (
              <CustomButton
                key={video.name}
                title={video.name}
                onPress={() => {
                  setVideoUrl(video.source as string);
                  player.replace(video.source);
                }}
                style={[styles.button, styles.flex1]}
                variant={videoUrl === video.source ? 'primary' : 'ghost'}
              />
            ))}
          </View>
        </View>

        {/* 재생 제어 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            재생 제어
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title={isPlaying ? '일시정지' : '재생'}
              onPress={isPlaying ? handlePause : handlePlay}
              style={[styles.button, styles.flex1]}
            />
            <CustomButton
              title="처음부터"
              onPress={handleReplay}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
          </View>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              재생 위치: {formatTime(currentTime)}
            </TextBox>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration || 1}
              value={currentTime}
              onValueChange={handleSeek}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.primary}
            />
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
          <View style={styles.optionsGrid}>
            <CustomButton
              title={
                nativeControls ? '네이티브 컨트롤 ON' : '네이티브 컨트롤 OFF'
              }
              onPress={() => setNativeControls(!nativeControls)}
              style={styles.button}
              variant={nativeControls ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={loop ? '반복 ON' : '반복 OFF'}
              onPress={() => setLoop(!loop)}
              style={styles.button}
              variant={loop ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={muted ? '음소거 ON' : '음소거 OFF'}
              onPress={() => setMuted(!muted)}
              style={styles.button}
              variant={muted ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={allowsFullscreen ? '전체화면 허용' : '전체화면 비허용'}
              onPress={() => setAllowsFullscreen(!allowsFullscreen)}
              style={styles.button}
              variant={allowsFullscreen ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={allowsPictureInPicture ? 'PiP 허용' : 'PiP 비허용'}
              onPress={() => setAllowsPictureInPicture(!allowsPictureInPicture)}
              style={styles.button}
              variant={allowsPictureInPicture ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={
                showNowPlayingNotification
                  ? 'Now Playing ON'
                  : 'Now Playing OFF'
              }
              onPress={() =>
                setShowNowPlayingNotification(!showNowPlayingNotification)
              }
              style={styles.button}
              variant={showNowPlayingNotification ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={
                staysActiveInBackground
                  ? '백그라운드 재생 ON'
                  : '백그라운드 재생 OFF'
              }
              onPress={() =>
                setStaysActiveInBackground(!staysActiveInBackground)
              }
              style={styles.button}
              variant={staysActiveInBackground ? 'primary' : 'ghost'}
            />
          </View>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              Content Fit
            </TextBox>
            <View style={styles.buttonRow}>
              {(['contain', 'cover', 'fill'] as const).map((fit) => (
                <CustomButton
                  key={fit}
                  title={fit}
                  onPress={() => setContentFit(fit)}
                  style={[styles.button, styles.flex1]}
                  variant={contentFit === fit ? 'primary' : 'ghost'}
                />
              ))}
            </View>
          </View>
        </View>

        {/* 볼륨 및 재생 속도 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            볼륨 및 재생 속도
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              볼륨: {(volume * 100).toFixed(0)}%
            </TextBox>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={setVolume}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.primary}
            />
          </View>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              재생 속도: {playbackRate.toFixed(2)}x
            </TextBox>
            <Slider
              style={styles.slider}
              minimumValue={0.25}
              maximumValue={2}
              value={playbackRate}
              onValueChange={setPlaybackRate}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.primary}
            />
          </View>
        </View>

        {/* 전체화면 및 PiP 제어 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            전체화면 및 PiP
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="전체화면 진입"
              onPress={handleEnterFullscreen}
              style={[styles.button, styles.flex1]}
              disabled={isFullscreen}
            />
            <CustomButton
              title="전체화면 종료"
              onPress={handleExitFullscreen}
              style={[styles.button, styles.flex1]}
              disabled={!isFullscreen}
              variant="ghost"
            />
            <CustomButton
              title="PiP 시작"
              onPress={handleStartPictureInPicture}
              style={[styles.button, styles.flex1]}
              disabled={isPictureInPicture}
            />
            <CustomButton
              title="PiP 종료"
              onPress={handleStopPictureInPicture}
              style={[styles.button, styles.flex1]}
              disabled={!isPictureInPicture}
              variant="ghost"
            />
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
  videoContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: 200,
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
