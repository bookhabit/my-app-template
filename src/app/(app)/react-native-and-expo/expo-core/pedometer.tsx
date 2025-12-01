import { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Platform,
  TextInput,
} from 'react-native';

import { Pedometer } from 'expo-sensors';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function PedometerScreen() {
  const { theme } = useTheme();

  // State
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<any>(null);
  const [pastStepCount, setPastStepCount] = useState<number | null>(null);
  const [currentStepCount, setCurrentStepCount] = useState<number>(0);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Date range for past steps
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');

  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    checkAvailability();
    checkPermissions();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await Pedometer.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      console.error('Failed to check availability:', error);
      setIsAvailable(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const perm = await Pedometer.getPermissionsAsync();
      setPermission(perm);
    } catch (error) {
      console.error('Failed to check permissions:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      setLoading(true);
      const perm = await Pedometer.requestPermissionsAsync();
      setPermission(perm);
      if (!perm.granted) {
        Alert.alert(
          '권한 거부',
          '걸음 센서 권한이 필요합니다. 설정에서 권한을 허용해주세요.'
        );
      }
    } catch (error: any) {
      Alert.alert('오류', `권한 요청 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const getPastStepCount = async () => {
    if (Platform.OS === 'android') {
      Alert.alert(
        '알림',
        'Android에서는 특정 기간의 걸음 수 조회가 아직 지원되지 않습니다.\n\n실시간 걸음 수 감시(watchStepCount)만 사용할 수 있습니다.'
      );
      return;
    }

    if (!isAvailable) {
      Alert.alert('알림', '걸음 센서를 사용할 수 없습니다.');
      return;
    }

    if (!permission?.granted) {
      Alert.alert('권한 필요', '걸음 센서 권한이 필요합니다.');
      return;
    }

    try {
      setLoading(true);
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);

      if (start > end) {
        Alert.alert('오류', '시작 날짜가 종료 날짜보다 늦을 수 없습니다.');
        return;
      }

      // iOS: 최대 7일 전까지의 데이터만 사용 가능
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (start < sevenDaysAgo) {
        Alert.alert(
          '알림',
          'iOS에서는 최대 7일 전까지의 데이터만 조회할 수 있습니다.'
        );
      }

      const result = await Pedometer.getStepCountAsync(start, end);
      if (result) {
        setPastStepCount(result.steps);
        Alert.alert('성공', `${result.steps}걸음을 걸었습니다.`);
      } else {
        setPastStepCount(0);
        Alert.alert('알림', '걸음 데이터를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('Failed to get past step count:', error);
      Alert.alert('오류', `걸음 수 조회 실패: ${error.message || error}`);
      setPastStepCount(null);
    } finally {
      setLoading(false);
    }
  };

  const startWatching = async () => {
    if (!isAvailable) {
      Alert.alert('알림', '걸음 센서를 사용할 수 없습니다.');
      return;
    }

    if (!permission?.granted) {
      Alert.alert('권한 필요', '걸음 센서 권한이 필요합니다.');
      return;
    }

    if (subscription) {
      Alert.alert('알림', '이미 감시 중입니다.');
      return;
    }

    try {
      const sub = Pedometer.watchStepCount((result) => {
        setCurrentStepCount(result.steps);
      });
      subscriptionRef.current = sub;
      setSubscription(sub);
      Alert.alert('시작', '걸음 수 감시를 시작했습니다.');
    } catch (error: any) {
      Alert.alert('오류', `감시 시작 실패: ${error.message || error}`);
    }
  };

  const stopWatching = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setSubscription(null);
    setCurrentStepCount(0);
    Alert.alert('중지', '걸음 수 감시를 중지했습니다.');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="Pedometer" showBackButton />
      <View style={styles.content}>
        {/* 개념 설명 */}
        <View style={styles.section}>
          <TextBox
            variant="title2"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Pedometer란?
          </TextBox>
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.description}
          >
            Pedometer는 디바이스의 걸음 센서를 사용하여 걸음 수를 조회하고
            실시간으로 감시할 수 있게 해주는 라이브러리입니다.
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
              • 특정 기간의 걸음 수 조회
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 실시간 걸음 수 감시 (watchStepCount)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • iOS: 최대 7일 전까지의 데이터만 조회 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android: 특정 기간 걸음 수 조회 미지원 (실시간 감시만 가능)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 백그라운드에서는 업데이트가 전달되지 않음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android: Health Connect API 기반 솔루션 권장
            </TextBox>
          </View>
        </View>

        {/* 사용 가능 여부 및 권한 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            사용 가능 여부 및 권한
          </TextBox>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              사용 가능:{' '}
              <TextBox
                variant="body2"
                color={isAvailable ? theme.success : theme.error}
              >
                {isAvailable === null
                  ? '확인 중...'
                  : isAvailable
                    ? '사용 가능'
                    : '사용 불가'}
              </TextBox>
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              권한 상태:{' '}
              <TextBox
                variant="body2"
                color={
                  permission?.granted
                    ? theme.success
                    : permission?.status === 'denied'
                      ? theme.error
                      : theme.textSecondary
                }
              >
                {permission?.status || '확인 중...'}
              </TextBox>
            </TextBox>
            <CustomButton
              title="권한 요청"
              onPress={requestPermissions}
              style={styles.button}
              disabled={loading || permission?.granted}
            />
            <CustomButton
              title="사용 가능 여부 확인"
              onPress={checkAvailability}
              style={styles.button}
            />
          </View>
        </View>

        {/* 과거 걸음 수 조회 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            과거 걸음 수 조회
          </TextBox>
          <View style={styles.dateRow}>
            <View style={styles.flex1}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                시작 날짜
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
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            <View style={styles.flex1}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                시작 시간
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
                value={startTime}
                onChangeText={setStartTime}
                placeholder="HH:MM"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>
          <View style={styles.dateRow}>
            <View style={styles.flex1}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                종료 날짜
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
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            <View style={styles.flex1}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                종료 시간
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
                value={endTime}
                onChangeText={setEndTime}
                placeholder="HH:MM"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>
          {Platform.OS === 'android' && (
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: theme.warning + '20',
                  borderColor: theme.warning,
                },
              ]}
            >
              <TextBox variant="body4" color={theme.text}>
                ⚠️ Android에서는 특정 기간의 걸음 수 조회가 지원되지 않습니다.
                실시간 걸음 수 감시만 사용할 수 있습니다.
              </TextBox>
            </View>
          )}
          <CustomButton
            title="걸음 수 조회"
            onPress={getPastStepCount}
            style={styles.button}
            disabled={
              loading ||
              !isAvailable ||
              !permission?.granted ||
              Platform.OS === 'android'
            }
          />
          {pastStepCount !== null && (
            <View
              style={[
                styles.resultBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextBox variant="title3" color={theme.text}>
                {pastStepCount.toLocaleString()} 걸음
              </TextBox>
            </View>
          )}
        </View>

        {/* 실시간 걸음 수 감시 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            실시간 걸음 수 감시
          </TextBox>
          <View style={styles.optionsRow}>
            <CustomButton
              title="감시 시작"
              onPress={startWatching}
              style={[styles.button, styles.flex1]}
              disabled={!isAvailable || !permission?.granted || !!subscription}
              variant={subscription ? 'ghost' : 'primary'}
            />
            <CustomButton
              title="감시 중지"
              onPress={stopWatching}
              style={[styles.button, styles.flex1]}
              disabled={!subscription}
              variant={subscription ? 'primary' : 'ghost'}
            />
          </View>
          {subscription && (
            <View
              style={[
                styles.resultBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextBox variant="title3" color={theme.primary}>
                {currentStepCount.toLocaleString()} 걸음
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.marginTop}
              >
                실시간으로 업데이트됩니다. 앱이 백그라운드에 있으면 업데이트가
                전달되지 않습니다.
              </TextBox>
            </View>
          )}
        </View>

        {/* 코드 예제 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            코드 예제
          </TextBox>
          <View
            style={[
              styles.codeBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.codeText}
            >
              {`import { Pedometer } from 'expo-sensors';

// 사용 가능 여부 확인
const isAvailable = await Pedometer.isAvailableAsync();

// 권한 확인 및 요청
const permission = await Pedometer.getPermissionsAsync();
if (!permission.granted) {
  await Pedometer.requestPermissionsAsync();
}

// 과거 걸음 수 조회
const end = new Date();
const start = new Date();
start.setDate(end.getDate() - 1); // 어제부터 오늘까지

const result = await Pedometer.getStepCountAsync(start, end);
if (result) {
  console.log('걸음 수:', result.steps);
}

// 실시간 걸음 수 감시
const subscription = Pedometer.watchStepCount((result) => {
  console.log('현재 걸음 수:', result.steps);
});

// 감시 중지
subscription.remove();`}
            </TextBox>
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
  description: {
    lineHeight: 20,
    marginBottom: 12,
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
  statusBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  marginTop: {
    marginTop: 8,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  flex1: {
    flex: 1,
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
  button: {
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  resultBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 12,
  },
  codeBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  codeText: {
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  warningBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
});
