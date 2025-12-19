import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
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
import { useReadingRecord } from '@/hooks/morning-routine/useReadingRecord';

export default function ReadingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { todayRecord, isLoading, startReading, completeReading, isReading } =
    useReadingRecord();
  const {
    video,
    saveVideo,
    isLoading: isVideoLoading,
  } = useHabitYoutubeVideo('reading');

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

  // 완료 폼 상태
  const [bookName, setBookName] = useState('');
  const [pageStart, setPageStart] = useState('');
  const [pageEnd, setPageEnd] = useState('');
  const [summary, setSummary] = useState('');

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

  // 독서 시작
  const handleStartReading = async () => {
    try {
      await startReading();
      Alert.alert('시작', '독서를 시작했습니다.');
    } catch (error) {
      Alert.alert('오류', '독서 시작에 실패했습니다.');
    }
  };

  // 독서 완료
  const handleCompleteReading = async () => {
    if (!bookName.trim()) {
      Alert.alert('오류', '책 이름을 입력해주세요.');
      return;
    }
    if (!pageStart || !pageEnd) {
      Alert.alert('오류', '페이지 범위를 입력해주세요.');
      return;
    }
    if (!summary.trim()) {
      Alert.alert('오류', '한줄 요약을 입력해주세요.');
      return;
    }

    try {
      await completeReading(
        bookName,
        parseInt(pageStart, 10),
        parseInt(pageEnd, 10),
        summary
      );
      Alert.alert('완료', '독서 기록이 저장되었습니다.');
      // 폼 초기화
      setBookName('');
      setPageStart('');
      setPageEnd('');
      setSummary('');
      router.back();
    } catch (error: any) {
      Alert.alert('오류', error.message || '독서 완료에 실패했습니다.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="독서" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
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

        {/* 독서 시작/완료 섹션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox variant="title2" style={styles.sectionTitle}>
            독서 기록
          </TextBox>

          {!isReading && !todayRecord?.end_time && (
            <CustomButton
              title="독서 시작"
              onPress={handleStartReading}
              loading={isLoading}
              fullWidth
            />
          )}

          {isReading && (
            <View style={styles.completeForm}>
              <Input
                label="책 이름"
                value={bookName}
                onChangeText={setBookName}
                placeholder="책 이름을 입력하세요"
                style={styles.input}
              />
              <View style={styles.pageRow}>
                <Input
                  label="시작 페이지"
                  value={pageStart}
                  onChangeText={setPageStart}
                  keyboardType="numeric"
                  placeholder="시작"
                  style={[styles.input, styles.pageInput]}
                />
                <Input
                  label="종료 페이지"
                  value={pageEnd}
                  onChangeText={setPageEnd}
                  keyboardType="numeric"
                  placeholder="종료"
                  style={[styles.input, styles.pageInput]}
                />
              </View>
              <Input
                label="오늘 배운 한줄 요약"
                value={summary}
                onChangeText={setSummary}
                placeholder="한줄 요약을 입력하세요"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <CustomButton
                title="완료"
                onPress={handleCompleteReading}
                loading={isLoading}
                fullWidth
              />
            </View>
          )}

          {todayRecord?.end_time && (
            <View style={styles.completedInfo}>
              <TextBox variant="body1">
                완료 시간: {todayRecord.duration_minutes}분
              </TextBox>
              {todayRecord.book_name && (
                <TextBox variant="body1">책: {todayRecord.book_name}</TextBox>
              )}
              {todayRecord.page_start && todayRecord.page_end && (
                <TextBox variant="body1">
                  페이지: {todayRecord.page_start} - {todayRecord.page_end}
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
  completeForm: {
    marginTop: 8,
    gap: 12,
  },
  pageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pageInput: {
    flex: 1,
  },
  completedInfo: {
    marginTop: 8,
    gap: 8,
  },
});
