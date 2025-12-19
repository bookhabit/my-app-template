import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  LayoutRectangle,
} from 'react-native';
import { PLAYER_STATES } from 'react-native-youtube-iframe';

import { useRouter } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';

import { Input } from '@/components/common/Input';
import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';
import HorizontalVideoPlayer from '@/components/player/HorizontalVideoPlayer';
import ShortsVideoPlayer from '@/components/player/ShortsVideoPlayer';
import Stopwatch from '@/components/workout/Stopwatch';

import { useHabitYoutubeVideo } from '@/hooks/morning-routine/useHabitYoutubeVideo';
import { useMorningRoutineGoals } from '@/hooks/morning-routine/useMorningRoutineGoals';
import { usePushupRecord } from '@/hooks/morning-routine/usePushupRecord';

export default function PushupScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { getCurrentWeekPushupTarget } = useMorningRoutineGoals();
  const targetCount = getCurrentWeekPushupTarget();
  const {
    todayRecord,
    isLoading,
    startPushup,
    completePushup,
    isPushupActive,
  } = usePushupRecord(targetCount);
  const {
    video,
    saveVideo,
    isLoading: isVideoLoading,
  } = useHabitYoutubeVideo('pushup');

  // 유튜브 영상 관련 상태
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

  // 푸쉬업 시작
  const handleStartPushup = async () => {
    try {
      await startPushup();
      Alert.alert('시작', '푸쉬업을 시작했습니다.');
    } catch (error) {
      Alert.alert('오류', '푸쉬업 시작에 실패했습니다.');
    }
  };

  // 푸쉬업 완료
  const handleCompletePushup = async () => {
    try {
      await completePushup();
      Alert.alert('완료', '푸쉬업 기록이 저장되었습니다.');
      router.back();
    } catch (error: any) {
      Alert.alert('오류', error.message || '푸쉬업 완료에 실패했습니다.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="푸쉬업" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* 목표 표시 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox variant="title2" style={styles.sectionTitle}>
            오늘 목표
          </TextBox>
          <TextBox variant="body1">목표 개수: {targetCount}개</TextBox>
        </View>

        {/* 유튜브 영상 섹션 */}
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

        {/* 타이머 섹션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Stopwatch />
        </View>

        {/* 푸쉬업 시작/완료 섹션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox variant="title2" style={styles.sectionTitle}>
            푸쉬업 기록
          </TextBox>

          {!isPushupActive && !todayRecord?.end_time && (
            <CustomButton
              title="푸쉬업 시작"
              onPress={handleStartPushup}
              loading={isLoading}
              fullWidth
            />
          )}

          {isPushupActive && (
            <View style={styles.activeInfo}>
              <CustomButton
                title="완료"
                onPress={handleCompletePushup}
                loading={isLoading}
                fullWidth
                style={styles.completeButton}
              />
            </View>
          )}

          {todayRecord?.end_time && (
            <View style={styles.completedInfo}>
              <TextBox variant="body1">
                완료 시간: {todayRecord.duration_minutes}분
              </TextBox>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  videoContainer: {
    marginBottom: 16,
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
  activeInfo: {
    marginTop: 8,
  },
  completeButton: {
    marginTop: 8,
  },
  completedInfo: {
    marginTop: 8,
    gap: 8,
  },
});
