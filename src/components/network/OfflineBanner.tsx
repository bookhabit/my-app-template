import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useNetwork } from '@/context/NetworkContext';
import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

/**
 * OfflineBanner
 *
 * 화면 상단에 고정되는 오프라인 알림 바
 * - 오프라인 시 자동 표시
 * - 재연결 시 자동 숨김
 * - 모달보다 덜 방해적
 */
export const OfflineBanner: React.FC = () => {
  const { theme } = useTheme();
  const { isConnected, isInternetReachable } = useNetwork();

  const [slideAnim] = React.useState(new Animated.Value(-100));

  const isOffline = !isConnected || isInternetReachable === false;

  React.useEffect(() => {
    if (isOffline) {
      // 오프라인: 슬라이드 다운
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // 온라인: 슬라이드 업
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: 8,
          transform: [{ translateY: slideAnim }],
          backgroundColor: theme.warning,
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialIcons name="wifi-off" size={20} color={theme.text} />
        <TextBox variant="caption2" color={theme.text}>
          오프라인 상태입니다.
        </TextBox>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingBottom: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
});
