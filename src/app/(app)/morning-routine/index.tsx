import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  TextInput,
  LayoutRectangle,
} from 'react-native';
import { PLAYER_STATES } from 'react-native-youtube-iframe';

import { useRouter } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';
import PedometerManager from '@/manager/PedometerManager';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';
import HorizontalVideoPlayer from '@/components/player/HorizontalVideoPlayer';
import ShortsVideoPlayer from '@/components/player/ShortsVideoPlayer';

import ForegroundServiceUtils from '@/utils/foregroundServiceUtils';
import { extractYouTubeInfo } from '@/utils/youtube';

const MorningRoutineScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [pedometerManager] = useState(() => new PedometerManager());

  // 상태 관리
  const [permissionStatus, setPermissionStatus] = useState<{
    hasPermission: boolean;
    message: string;
  } | null>(null);
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState<{
      hasPermission: boolean;
      message: string;
    } | null>(null);
  const [todaySteps, setTodaySteps] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<{
    isServiceRunning: boolean;
  } | null>(null);

  // 유튜브 비디오 관련 상태
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isShorts, setIsShorts] = useState(false);
  const [playerState, setPlayerState] = useState<PLAYER_STATES>(
    PLAYER_STATES.UNSTARTED
  );
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [videoLayout, setVideoLayout] = useState<LayoutRectangle | null>(null);

  // 권한 상태 확인
  const checkPermission = async () => {
    try {
      setIsLoading(true);
      const status = await pedometerManager.checkPermissionStatus();
      setPermissionStatus(status);
      console.log('권한 상태:', status);
    } catch (error: any) {
      console.error('권한 확인 실패:', error);
      Alert.alert('오류', `권한 확인 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 권한 요청
  const requestPermission = async () => {
    try {
      setIsLoading(true);
      const result = await pedometerManager.requestPermission();
      console.log('권한 요청 결과:', result);

      if (result.granted) {
        Alert.alert('성공', '권한이 허용되었습니다.');
        await checkPermission();
        // 권한이 허용되면 자동 시작
        await autoStart();
      } else {
        Alert.alert('권한 필요', result.message);
      }
    } catch (error: any) {
      console.error('권한 요청 실패:', error);
      Alert.alert('오류', `권한 요청 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 알림 권한 상태 확인
  const checkNotificationPermission = async () => {
    try {
      setIsLoading(true);
      const status = await pedometerManager.checkNotificationPermissionStatus();
      setNotificationPermissionStatus(status);
      console.log('알림 권한 상태:', status);
    } catch (error: any) {
      console.error('알림 권한 확인 실패:', error);
      Alert.alert('오류', `알림 권한 확인 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    try {
      setIsLoading(true);
      const result = await pedometerManager.requestNotificationPermission();
      console.log('알림 권한 요청 결과:', result);

      if (result.granted) {
        Alert.alert('성공', '알림 권한이 허용되었습니다.');
        await checkNotificationPermission();
      } else {
        Alert.alert('알림 권한 필요', result.message);
      }
    } catch (error: any) {
      console.error('알림 권한 요청 실패:', error);
      Alert.alert('오류', `알림 권한 요청 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 오늘 걸음수 조회
  const loadTodaySteps = async () => {
    try {
      setIsLoading(true);
      const result = await pedometerManager.loadTodaySteps();
      setTodaySteps(result.totalSteps);
      console.log('오늘 걸음수:', result);
      Alert.alert(
        '성공',
        `오늘 걸음수: ${result.totalSteps.toLocaleString()} 걸음`
      );
    } catch (error: any) {
      console.error('걸음수 조회 실패:', error);
      Alert.alert('오류', `걸음수 조회 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 실시간 업데이트 시작
  const startUpdates = async () => {
    try {
      setIsLoading(true);
      const result = await pedometerManager.startUpdates();
      setIsUpdating(true);
      console.log('실시간 업데이트 시작:', result);
      Alert.alert(
        '성공',
        result.message || '실시간 업데이트가 시작되었습니다.'
      );

      // Android의 경우 서비스 시작
      if (Platform.OS === 'android') {
        try {
          await ForegroundServiceUtils.startService();
          console.log('Foreground Service 시작됨');
        } catch (error: any) {
          console.error('서비스 시작 실패:', error);
        }
      }

      // 서비스 상태 확인
      await checkServiceStatus();
    } catch (error: any) {
      console.error('실시간 업데이트 시작 실패:', error);
      Alert.alert('오류', `실시간 업데이트 시작 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 실시간 업데이트 중지
  const stopUpdates = async () => {
    try {
      setIsLoading(true);
      const result = await pedometerManager.stopUpdates();
      setIsUpdating(false);
      console.log('실시간 업데이트 중지:', result);
      Alert.alert(
        '성공',
        result.message || '실시간 업데이트가 중지되었습니다.'
      );

      // Android의 경우 서비스 중지
      if (Platform.OS === 'android') {
        try {
          await ForegroundServiceUtils.stopService();
          console.log('Foreground Service 중지됨');
        } catch (error: any) {
          console.error('서비스 중지 실패:', error);
        }
      }

      // 서비스 상태 확인
      await checkServiceStatus();
    } catch (error: any) {
      console.error('실시간 업데이트 중지 실패:', error);
      Alert.alert('오류', `실시간 업데이트 중지 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 서비스 상태 확인 (Android 전용)
  const checkServiceStatus = async () => {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      const status = await ForegroundServiceUtils.getServiceStatus();
      if (status) {
        setServiceStatus({
          isServiceRunning: status.isServiceRunning,
        });
        // 서비스에서 걸음수도 가져와서 todaySteps 업데이트
        if (status.totalSteps !== undefined) {
          setTodaySteps(status.totalSteps);
        }
        console.log('서비스 상태:', status);
      }
    } catch (error: any) {
      console.error('서비스 상태 확인 실패:', error);
    }
  };

  // 자동 시작 함수
  const autoStart = async () => {
    try {
      // 1. 만보기 권한 확인
      const permissionStatus = await pedometerManager.checkPermissionStatus();
      setPermissionStatus(permissionStatus);

      if (!permissionStatus.hasPermission) {
        console.log('⚠️ 만보기 권한이 없어서 자동 시작하지 않습니다.');
        return;
      }

      console.log('✅ 만보기 권한 확인됨 - 자동 시작');

      // 2. 오늘 걸음수 로드
      try {
        const result = await pedometerManager.loadTodaySteps();
        setTodaySteps(result.totalSteps);
        console.log('📊 초기 걸음수 로드:', result.totalSteps);
      } catch (error: any) {
        console.error('초기 걸음수 로드 실패:', error);
      }

      // 3. 실시간 업데이트 시작
      try {
        await pedometerManager.startUpdates();
        setIsUpdating(true);
        console.log('🔄 실시간 업데이트 자동 시작');
      } catch (error: any) {
        console.error('실시간 업데이트 자동 시작 실패:', error);
      }

      // 4. Android의 경우 포그라운드 서비스 시작
      if (Platform.OS === 'android') {
        try {
          await ForegroundServiceUtils.startService();
          console.log('🚀 Foreground Service 자동 시작');
        } catch (error: any) {
          console.error('Foreground Service 자동 시작 실패:', error);
        }

        // 서비스 상태 확인
        await checkServiceStatus();
      }
    } catch (error: any) {
      console.error('자동 시작 실패:', error);
    }
  };

  // 유튜브 비디오 로드
  const handleLoadVideo = () => {
    if (!youtubeUrl.trim()) {
      Alert.alert('오류', '유튜브 링크를 입력해주세요.');
      return;
    }

    const { videoId: extractedId, isShorts: isShortsVideo } =
      extractYouTubeInfo(youtubeUrl.trim());

    if (!extractedId) {
      Alert.alert('오류', '유효한 유튜브 링크가 아닙니다.');
      return;
    }

    setVideoId(extractedId);
    setIsShorts(isShortsVideo);
    setIsPlayerReady(false);
    setPlayerState(PLAYER_STATES.UNSTARTED);
    console.log('유튜브 비디오 ID:', extractedId, '쇼츠:', isShortsVideo);
  };

  // 플레이어 상태 변경 핸들러
  const handlePlayerStateChange = (state: PLAYER_STATES) => {
    setPlayerState(state);
    console.log('플레이어 상태 변경:', state);
  };

  // 플레이어 준비 핸들러
  const handlePlayerReady = () => {
    setIsPlayerReady(true);
    console.log('플레이어 준비 완료');
  };

  // 플레이어 에러 핸들러
  const handlePlayerError = (error: any) => {
    console.error('플레이어 에러:', error);
    Alert.alert('오류', '비디오 재생 중 오류가 발생했습니다.');
  };

  // 완료 버튼 - 만보기 기능 종료
  const handleComplete = async () => {
    try {
      setIsLoading(true);

      // 1. 실시간 업데이트 중지
      if (isUpdating) {
        try {
          await pedometerManager.stopUpdates();
          setIsUpdating(false);
          console.log('✅ 실시간 업데이트 중지됨');
        } catch (error: any) {
          console.error('실시간 업데이트 중지 실패:', error);
        }
      }

      // 2. Android의 경우 포그라운드 서비스 중지
      if (Platform.OS === 'android') {
        try {
          await ForegroundServiceUtils.stopService();
          console.log('✅ Foreground Service 중지됨');
        } catch (error: any) {
          console.error('서비스 중지 실패:', error);
        }
      }

      // 3. 화면에서 나가기
      router.back();
    } catch (error: any) {
      console.error('완료 처리 실패:', error);
      Alert.alert('오류', `완료 처리 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 이벤트 리스너 설정
  useEffect(() => {
    const eventEmitter = pedometerManager.getEventEmitter();

    const subscription = eventEmitter.addListener(
      'StepUpdate',
      (data: { totalSteps: number }) => {
        console.log('걸음수 업데이트 이벤트:', data);
        setTodaySteps(data.totalSteps);

        // 서비스 상태도 함께 업데이트
        if (Platform.OS === 'android') {
          checkServiceStatus();
        }
      }
    );

    // 초기 권한 상태 확인
    const initialize = async () => {
      await checkPermission();
      await checkNotificationPermission();

      // Android의 경우 서비스 상태 확인
      if (Platform.OS === 'android') {
        await checkServiceStatus();
      }

      // 만보기 권한이 있으면 자동 시작
      const permissionStatus = await pedometerManager.checkPermissionStatus();
      if (permissionStatus.hasPermission) {
        await autoStart();
      }
    };

    initialize();

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader
        title="만보기 테스트"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 만보기 권한 섹션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="body1"
            color={theme.text}
            style={styles.sectionTitle}
          >
            만보기 권한 관리
          </TextBox>

          <View style={styles.infoRow}>
            <TextBox variant="body2" color={theme.textSecondary}>
              권한 상태:
            </TextBox>
            <TextBox
              variant="body2"
              color={
                permissionStatus?.hasPermission
                  ? theme.success || '#4CAF50'
                  : theme.error || '#F44336'
              }
            >
              {permissionStatus?.hasPermission ? '✅ 허용됨' : '❌ 거부됨'}
            </TextBox>
          </View>

          {permissionStatus && (
            <TextBox
              variant="caption1"
              color={theme.textSecondary}
              style={styles.messageText}
            >
              {permissionStatus.message}
            </TextBox>
          )}

          <View style={styles.buttonRow}>
            <CustomButton
              title="권한 확인"
              variant="outline"
              onPress={checkPermission}
              loading={isLoading}
              style={styles.button}
            />
            <CustomButton
              title="권한 요청"
              variant="primary"
              onPress={requestPermission}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        </View>

        {/* 알림 권한 섹션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="body1"
            color={theme.text}
            style={styles.sectionTitle}
          >
            알림 권한 관리
          </TextBox>

          <View style={styles.infoRow}>
            <TextBox variant="body2" color={theme.textSecondary}>
              알림 권한 상태:
            </TextBox>
            <TextBox
              variant="body2"
              color={
                notificationPermissionStatus?.hasPermission
                  ? theme.success || '#4CAF50'
                  : theme.error || '#F44336'
              }
            >
              {notificationPermissionStatus?.hasPermission
                ? '✅ 허용됨'
                : '❌ 거부됨'}
            </TextBox>
          </View>

          {notificationPermissionStatus && (
            <TextBox
              variant="caption1"
              color={theme.textSecondary}
              style={styles.messageText}
            >
              {notificationPermissionStatus.message}
            </TextBox>
          )}

          <View style={styles.buttonRow}>
            <CustomButton
              title="알림 권한 확인"
              variant="outline"
              onPress={checkNotificationPermission}
              loading={isLoading}
              style={styles.button}
            />
            <CustomButton
              title="알림 권한 요청"
              variant="primary"
              onPress={requestNotificationPermission}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        </View>

        {/* 걸음수 조회 섹션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="body1"
            color={theme.text}
            style={styles.sectionTitle}
          >
            걸음수 조회
          </TextBox>

          {todaySteps !== null && (
            <View style={styles.stepsContainer}>
              <TextBox
                variant="body3"
                color={theme.primary}
                style={styles.stepsNumber}
              >
                {todaySteps.toLocaleString()}
              </TextBox>
              <TextBox variant="body1" color={theme.textSecondary}>
                걸음
              </TextBox>
            </View>
          )}

          <CustomButton
            title="오늘 걸음수 조회"
            variant="primary"
            onPress={loadTodaySteps}
            loading={isLoading}
            fullWidth
            style={styles.button}
          />
        </View>

        {/* 실시간 업데이트 섹션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="body1"
            color={theme.text}
            style={styles.sectionTitle}
          >
            실시간 업데이트
          </TextBox>

          <View style={styles.infoRow}>
            <TextBox variant="body2" color={theme.textSecondary}>
              업데이트 상태:
            </TextBox>
            <TextBox
              variant="body2"
              color={
                isUpdating ? theme.success || '#4CAF50' : theme.textSecondary
              }
            >
              {isUpdating ? '🟢 실행 중' : '⚪ 중지됨'}
            </TextBox>
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="시작"
              variant="primary"
              onPress={startUpdates}
              loading={isLoading}
              disabled={isUpdating}
              style={styles.button}
            />
            <CustomButton
              title="중지"
              variant="danger"
              onPress={stopUpdates}
              loading={isLoading}
              disabled={!isUpdating}
              style={styles.button}
            />
          </View>
        </View>

        {/* 알림센터 확인 섹션 (Android 전용) */}
        {Platform.OS === 'android' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="body1"
              color={theme.text}
              style={styles.sectionTitle}
            >
              알림센터 확인
            </TextBox>

            {serviceStatus && (
              <View style={styles.infoRow}>
                <TextBox variant="body2" color={theme.textSecondary}>
                  서비스 상태:
                </TextBox>
                <TextBox
                  variant="body2"
                  color={
                    serviceStatus.isServiceRunning
                      ? theme.success || '#4CAF50'
                      : theme.error || '#F44336'
                  }
                >
                  {serviceStatus.isServiceRunning ? '✅ 실행 중' : '❌ 중지됨'}
                </TextBox>
              </View>
            )}

            <CustomButton
              title="서비스 상태 확인"
              variant="outline"
              onPress={checkServiceStatus}
              loading={isLoading}
              fullWidth
              style={styles.button}
            />

            <TextBox
              variant="caption1"
              color={theme.textSecondary}
              style={styles.hintText}
            >
              💡 알림센터에서 걸음수를 확인할 수 있습니다.{'\n'}
              실시간 업데이트를 시작하면 알림이 표시됩니다.
            </TextBox>
          </View>
        )}

        {/* 유튜브 비디오 플레이어 섹션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="body1"
            color={theme.text}
            style={styles.sectionTitle}
          >
            유튜브 비디오 재생
          </TextBox>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border || theme.textSecondary,
              },
            ]}
            placeholder="유튜브 링크를 입력하세요"
            placeholderTextColor={theme.textSecondary}
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <CustomButton
            title="비디오 로드"
            variant="primary"
            onPress={handleLoadVideo}
            fullWidth
            style={styles.button}
          />

          {videoId && (
            <View
              style={styles.videoContainer}
              onLayout={(event) => {
                setVideoLayout(event.nativeEvent.layout);
              }}
            >
              {isShorts ? (
                videoLayout ? (
                  <ShortsVideoPlayer
                    videoId={videoId}
                    onChangeState={handlePlayerStateChange}
                    onReady={handlePlayerReady}
                    onError={handlePlayerError}
                    layout={videoLayout}
                  />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <TextBox variant="body2" color={theme.textSecondary}>
                      로딩 중...
                    </TextBox>
                  </View>
                )
              ) : (
                <HorizontalVideoPlayer
                  videoId={videoId}
                  onChangeState={handlePlayerStateChange}
                  onReady={handlePlayerReady}
                  onError={handlePlayerError}
                />
              )}
              {isPlayerReady && (
                <TextBox
                  variant="caption1"
                  color={theme.textSecondary}
                  style={styles.videoStatus}
                >
                  {isShorts ? '쇼츠' : '일반 영상'} 플레이어 준비 완료
                </TextBox>
              )}
            </View>
          )}
        </View>

        {/* 플랫폼 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="body1"
            color={theme.text}
            style={styles.sectionTitle}
          >
            플랫폼 정보
          </TextBox>

          <View style={styles.infoRow}>
            <TextBox variant="body2" color={theme.textSecondary}>
              플랫폼:
            </TextBox>
            <TextBox variant="body2" color={theme.text}>
              {Platform.OS === 'ios' ? 'iOS' : 'Android'}
            </TextBox>
          </View>
        </View>

        {/* 완료 버튼 */}
        <View style={styles.completeSection}>
          <CustomButton
            title="완료"
            variant="primary"
            onPress={handleComplete}
            loading={isLoading}
            fullWidth
            style={styles.completeButton}
          />
          <TextBox
            variant="caption1"
            color={theme.textSecondary}
            style={styles.completeHint}
          >
            완료 버튼을 누르면 만보기 기능이 종료되고 이전 화면으로 돌아갑니다.
          </TextBox>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  messageText: {
    marginTop: 4,
    lineHeight: 20,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  stepsNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  hintText: {
    marginTop: 8,
    lineHeight: 20,
  },
  completeSection: {
    paddingTop: 8,
    paddingBottom: 32,
    gap: 8,
  },
  completeButton: {
    marginBottom: 4,
  },
  completeHint: {
    textAlign: 'center',
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  videoContainer: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 200,
  },
  videoPlaceholder: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoStatus: {
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MorningRoutineScreen;
