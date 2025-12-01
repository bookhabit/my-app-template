import { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, Alert, Platform } from 'react-native';

import * as ScreenOrientation from 'expo-screen-orientation';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function ScreenOrientationScreen() {
  const { theme } = useTheme();

  // State
  const [currentOrientation, setCurrentOrientation] =
    useState<ScreenOrientation.Orientation | null>(null);
  const [orientationLock, setOrientationLock] =
    useState<ScreenOrientation.OrientationLock | null>(null);
  const [platformLock, setPlatformLock] =
    useState<ScreenOrientation.PlatformOrientationInfo | null>(null);
  const [isSupported, setIsSupported] = useState<Record<string, boolean>>({});

  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    loadOrientationData();
    startOrientationListener();

    return () => {
      if (subscriptionRef.current) {
        ScreenOrientation.removeOrientationChangeListener(
          subscriptionRef.current
        );
      }
    };
  }, []);

  const loadOrientationData = async () => {
    try {
      const [orientation, lock, platform] = await Promise.all([
        ScreenOrientation.getOrientationAsync(),
        ScreenOrientation.getOrientationLockAsync(),
        ScreenOrientation.getPlatformOrientationLockAsync(),
      ]);

      setCurrentOrientation(orientation);
      setOrientationLock(lock);
      setPlatformLock(platform);

      // Check support for each lock type
      const locks = [
        ScreenOrientation.OrientationLock.DEFAULT,
        ScreenOrientation.OrientationLock.ALL,
        ScreenOrientation.OrientationLock.PORTRAIT,
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
        ScreenOrientation.OrientationLock.PORTRAIT_DOWN,
        ScreenOrientation.OrientationLock.LANDSCAPE,
        ScreenOrientation.OrientationLock.LANDSCAPE_LEFT,
        ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT,
      ];

      const supportChecks = await Promise.all(
        locks.map((lockType) =>
          ScreenOrientation.supportsOrientationLockAsync(lockType).then(
            (supported) => ({ lockType, supported })
          )
        )
      );

      const supportMap: Record<string, boolean> = {};
      supportChecks.forEach(({ lockType, supported }) => {
        supportMap[lockType] = supported;
      });
      setIsSupported(supportMap);
    } catch (error) {
      console.error('Failed to load orientation data:', error);
    }
  };

  const startOrientationListener = () => {
    const subscription = ScreenOrientation.addOrientationChangeListener(
      (event) => {
        setCurrentOrientation(event.orientationInfo.orientation);
        setOrientationLock(event.orientationLock);
        Alert.alert(
          '방향 변경',
          `새로운 방향: ${getOrientationText(event.orientationInfo.orientation)}`
        );
      }
    );
    subscriptionRef.current = subscription;
  };

  const lockOrientation = async (lock: ScreenOrientation.OrientationLock) => {
    try {
      await ScreenOrientation.lockAsync(lock);
      await loadOrientationData();
      Alert.alert('성공', `방향이 ${getLockText(lock)}로 고정되었습니다.`);
    } catch (error: any) {
      Alert.alert('오류', `방향 고정 실패: ${error.message || error}`);
    }
  };

  const unlockOrientation = async () => {
    try {
      await ScreenOrientation.unlockAsync();
      await loadOrientationData();
      Alert.alert('성공', '방향 고정이 해제되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `방향 고정 해제 실패: ${error.message || error}`);
    }
  };

  const getOrientationText = (orientation: ScreenOrientation.Orientation) => {
    switch (orientation) {
      case ScreenOrientation.Orientation.PORTRAIT_UP:
        return '세로 (정상)';
      case ScreenOrientation.Orientation.PORTRAIT_DOWN:
        return '세로 (뒤집힘)';
      case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
        return '가로 (왼쪽)';
      case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
        return '가로 (오른쪽)';
      case ScreenOrientation.Orientation.UNKNOWN:
        return '알 수 없음';
    }
  };

  const getLockText = (lock: ScreenOrientation.OrientationLock) => {
    switch (lock) {
      case ScreenOrientation.OrientationLock.DEFAULT:
        return '기본';
      case ScreenOrientation.OrientationLock.ALL:
        return '모든 방향';
      case ScreenOrientation.OrientationLock.PORTRAIT:
        return '세로 (모든)';
      case ScreenOrientation.OrientationLock.PORTRAIT_UP:
        return '세로 (정상)';
      case ScreenOrientation.OrientationLock.PORTRAIT_DOWN:
        return '세로 (뒤집힘)';
      case ScreenOrientation.OrientationLock.LANDSCAPE:
        return '가로 (모든)';
      case ScreenOrientation.OrientationLock.LANDSCAPE_LEFT:
        return '가로 (왼쪽)';
      case ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT:
        return '가로 (오른쪽)';
      default:
        return lock.toString();
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
      <CustomHeader title="ScreenOrientation" showBackButton />
      <View style={styles.content}>
        {/* 현재 상태 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            현재 상태
          </TextBox>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              현재 방향:{' '}
              <TextBox variant="body2" color={theme.primary}>
                {currentOrientation !== null
                  ? getOrientationText(currentOrientation)
                  : '로딩 중...'}
              </TextBox>
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              방향 고정:{' '}
              <TextBox variant="body2" color={theme.primary}>
                {orientationLock !== null
                  ? getLockText(orientationLock)
                  : '로딩 중...'}
              </TextBox>
            </TextBox>
            <CustomButton
              title="상태 새로고침"
              onPress={loadOrientationData}
              style={styles.button}
            />
          </View>
        </View>

        {/* 방향 고정 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            방향 고정
          </TextBox>
          <View style={styles.buttonGrid}>
            <CustomButton
              title="기본"
              onPress={() =>
                lockOrientation(ScreenOrientation.OrientationLock.DEFAULT)
              }
              style={styles.gridButton}
              variant="ghost"
            />
            <CustomButton
              title="모든 방향"
              onPress={() =>
                lockOrientation(ScreenOrientation.OrientationLock.ALL)
              }
              style={styles.gridButton}
              variant="ghost"
              disabled={
                isSupported[ScreenOrientation.OrientationLock.ALL] === false
              }
            />
            <CustomButton
              title="세로 (모든)"
              onPress={() =>
                lockOrientation(ScreenOrientation.OrientationLock.PORTRAIT)
              }
              style={styles.gridButton}
              variant="ghost"
            />
            <CustomButton
              title="세로 (정상)"
              onPress={() =>
                lockOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP)
              }
              style={styles.gridButton}
              variant="ghost"
            />
            <CustomButton
              title="세로 (뒤집힘)"
              onPress={() =>
                lockOrientation(ScreenOrientation.OrientationLock.PORTRAIT_DOWN)
              }
              style={styles.gridButton}
              variant="ghost"
              disabled={
                isSupported[ScreenOrientation.OrientationLock.PORTRAIT_DOWN] ===
                false
              }
            />
            <CustomButton
              title="가로 (모든)"
              onPress={() =>
                lockOrientation(ScreenOrientation.OrientationLock.LANDSCAPE)
              }
              style={styles.gridButton}
              variant="ghost"
            />
            <CustomButton
              title="가로 (왼쪽)"
              onPress={() =>
                lockOrientation(
                  ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
                )
              }
              style={styles.gridButton}
              variant="ghost"
            />
            <CustomButton
              title="가로 (오른쪽)"
              onPress={() =>
                lockOrientation(
                  ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
                )
              }
              style={styles.gridButton}
              variant="ghost"
            />
          </View>
          <CustomButton
            title="방향 고정 해제"
            onPress={unlockOrientation}
            style={styles.button}
            variant="primary"
          />
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
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridButton: {
    flex: 1,
    minWidth: '30%',
  },
  button: {
    marginTop: 8,
  },
});
