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

import { useHabitYoutubeVideo } from '@/hooks/morning-routine/useHabitYoutubeVideo';
import { useMorningRoutineGoals } from '@/hooks/morning-routine/useMorningRoutineGoals';
import { useStairsRecord } from '@/hooks/morning-routine/useStairsRecord';

export default function StairsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { getCurrentWeekStairsTarget } = useMorningRoutineGoals();
  const targetFloors = getCurrentWeekStairsTarget();
  const {
    todayRecord,
    isLoading,
    startStairs,
    completeStairs,
    isStairsActive,
    currentSteps,
  } = useStairsRecord(targetFloors);
  const {
    video,
    saveVideo,
    isLoading: isVideoLoading,
  } = useHabitYoutubeVideo('stairs');

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

  // 계단 운동 시작
  const handleStartStairs = async () => {
    try {
      await startStairs();
      Alert.alert('시작', '계단 운동을 시작했습니다.');
    } catch (error) {
      Alert.alert('오류', '계단 운동 시작에 실패했습니다.');
    }
  };

  // 계단 운동 완료
  const handleCompleteStairs = async () => {
    try {
      await completeStairs();
      Alert.alert('완료', '계단 운동 기록이 저장되었습니다.');
      router.back();
    } catch (error: any) {
      Alert.alert('오류', error.message || '계단 운동 완료에 실패했습니다.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="계단 운동" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* 목표 표시 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox variant="title2" style={styles.sectionTitle}>
            오늘 목표
          </TextBox>
          <TextBox variant="body1">목표 층수: {targetFloors}층</TextBox>
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

        {/* 계단 운동 시작/완료 섹션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox variant="title2" style={styles.sectionTitle}>
            계단 운동 기록
          </TextBox>

          {!isStairsActive && !todayRecord?.end_time && (
            <CustomButton
              title="계단 운동 시작"
              onPress={handleStartStairs}
              loading={isLoading}
              fullWidth
            />
          )}

          {isStairsActive && (
            <View style={styles.activeInfo}>
              <TextBox variant="body1">
                현재 걸음수: {currentSteps.toLocaleString()}걸음
              </TextBox>
              <CustomButton
                title="완료"
                onPress={handleCompleteStairs}
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
              {todayRecord.steps_count && (
                <TextBox variant="body1">
                  총 걸음수: {todayRecord.steps_count.toLocaleString()}걸음
                </TextBox>
              )}
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
    gap: 16,
  },
  completeButton: {
    marginTop: 8,
  },
  completedInfo: {
    marginTop: 8,
    gap: 8,
  },
});
