import React, { useState, LayoutRectangle } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { PLAYER_STATES } from 'react-native-youtube-iframe';

import { useTheme } from '@/context/ThemeProvider';
import { useHabitYoutubeVideo } from '@/hooks/morning-routine/useHabitYoutubeVideo';

import { Input } from '@/components/common/Input';
import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import HorizontalVideoPlayer from '@/components/player/HorizontalVideoPlayer';
import ShortsVideoPlayer from '@/components/player/ShortsVideoPlayer';

interface HabitYoutubeVideoSectionProps {
  habitType: 'reading' | 'stairs' | 'pushup';
}

export default function HabitYoutubeVideoSection({
  habitType,
}: HabitYoutubeVideoSectionProps) {
  const { theme } = useTheme();
  const { video, saveVideo, isLoading: isVideoLoading } =
    useHabitYoutubeVideo(habitType);

  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [playerState, setPlayerState] = useState<PLAYER_STATES>(
    PLAYER_STATES.UNSTARTED
  );
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [videoLayout, setVideoLayout] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // 영상 로드
  const handleLoadVideo = async () => {
    if (!youtubeUrl.trim()) {
      Alert.alert('오류', '유튜브 링크를 입력해주세요.');
      return;
    }

    try {
      await saveVideo(youtubeUrl);
      setYoutubeUrl('');
      setIsEditingVideo(false);
      Alert.alert('성공', '영상이 등록되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '영상 등록에 실패했습니다.');
    }
  };

  return (
    <View style={[styles.section, { backgroundColor: theme.surface }]}>
      <TextBox variant="title2" style={styles.sectionTitle}>
        유튜브 영상
      </TextBox>

      {!isEditingVideo && video && (
        <View style={styles.videoContainer}>
          {video.is_shorts ? (
            <View
              onLayout={(e) => setVideoLayout(e.nativeEvent.layout)}
              style={styles.videoWrapper}
            >
              {videoLayout.width > 0 && (
                <ShortsVideoPlayer
                  videoId={video.video_id}
                  onChangeState={setPlayerState}
                  onReady={() => setIsPlayerReady(true)}
                  onError={(error) => {
                    console.error('영상 재생 오류:', error);
                    Alert.alert('오류', '영상 재생에 실패했습니다.');
                  }}
                  layout={videoLayout}
                />
              )}
            </View>
          ) : (
            <HorizontalVideoPlayer
              videoId={video.video_id}
              onChangeState={setPlayerState}
              onReady={() => setIsPlayerReady(true)}
              onError={(error) => {
                console.error('영상 재생 오류:', error);
                Alert.alert('오류', '영상 재생에 실패했습니다.');
              }}
            />
          )}
        </View>
      )}

      {isEditingVideo && (
        <View style={styles.editVideoContainer}>
          <Input
            label="유튜브 링크"
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            placeholder="https://youtube.com/..."
            style={styles.input}
          />
          <View style={styles.buttonRow}>
            <CustomButton
              title="취소"
              variant="outline"
              onPress={() => {
                setIsEditingVideo(false);
                setYoutubeUrl('');
              }}
              style={styles.button}
            />
            <CustomButton
              title="등록"
              onPress={handleLoadVideo}
              loading={isVideoLoading}
              style={styles.button}
            />
          </View>
        </View>
      )}

      {!isEditingVideo && (
        <CustomButton
          title={video ? '영상 수정' : '영상 등록'}
          variant="outline"
          onPress={() => setIsEditingVideo(true)}
          style={styles.editButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  videoContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoWrapper: {
    width: '100%',
    minHeight: 200,
  },
  editVideoContainer: {
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  editButton: {
    marginTop: 8,
  },
});

