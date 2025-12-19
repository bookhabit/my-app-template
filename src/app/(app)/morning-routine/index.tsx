import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  NativeModules,
} from 'react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '@/context/ThemeProvider';
import PedometerManager from '@/manager/PedometerManager';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

const { AOSPedometerModule } = NativeModules;

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
    totalSteps: number;
  } | null>(null);

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
      if (Platform.OS === 'android' && AOSPedometerModule) {
        try {
          await AOSPedometerModule.startStepCounterService();
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
      if (Platform.OS === 'android' && AOSPedometerModule) {
        try {
          await AOSPedometerModule.stopStepCounterService();
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
    if (Platform.OS !== 'android' || !AOSPedometerModule) {
      return;
    }

    try {
      const status = await AOSPedometerModule.getServiceStatus();
      setServiceStatus({
        isServiceRunning: status.isServiceRunning,
        totalSteps: status.totalSteps,
      });
      console.log('서비스 상태:', status);
    } catch (error: any) {
      console.error('서비스 상태 확인 실패:', error);
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
    checkPermission();
    checkNotificationPermission();

    // Android의 경우 서비스 상태 확인
    if (Platform.OS === 'android') {
      checkServiceStatus();
    }

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
              <>
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
                    {serviceStatus.isServiceRunning
                      ? '✅ 실행 중'
                      : '❌ 중지됨'}
                  </TextBox>
                </View>

                <View style={styles.infoRow}>
                  <TextBox variant="body2" color={theme.textSecondary}>
                    알림센터 걸음수:
                  </TextBox>
                  <TextBox variant="body2" color={theme.text}>
                    {serviceStatus.totalSteps.toLocaleString()} 걸음
                  </TextBox>
                </View>
              </>
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
});

export default MorningRoutineScreen;
