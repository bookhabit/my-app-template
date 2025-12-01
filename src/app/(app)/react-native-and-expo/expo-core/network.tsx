import { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Platform,
} from 'react-native';

import * as Network from 'expo-network';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function NetworkScreen() {
  const { theme } = useTheme();

  // Network state from hook
  const networkState = Network.useNetworkState();

  // State
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [networkStateAsync, setNetworkStateAsync] =
    useState<Network.NetworkState | null>(null);
  const [isAirplaneMode, setIsAirplaneMode] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [listenerActive, setListenerActive] = useState(false);
  const [lastNetworkEvent, setLastNetworkEvent] = useState<string>('');

  const subscriptionRef = useRef<Network.EventSubscription | null>(null);

  useEffect(() => {
    loadNetworkData();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      const [ip, state, airplane] = await Promise.all([
        Network.getIpAddressAsync(),
        Network.getNetworkStateAsync(),
        Network.isAirplaneModeEnabledAsync(),
      ]);

      setIpAddress(ip);
      setNetworkStateAsync(state);
      setIsAirplaneMode(airplane);
    } catch (error: any) {
      console.error('Failed to load network data:', error);
      Alert.alert('오류', `네트워크 정보 로드 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleListener = () => {
    if (listenerActive) {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      setListenerActive(false);
      setLastNetworkEvent('');
    } else {
      const subscription = Network.addNetworkStateListener((event) => {
        const eventStr = JSON.stringify(
          {
            type: event.type,
            isConnected: event.isConnected,
            isInternetReachable: event.isInternetReachable,
          },
          null,
          2
        );
        setLastNetworkEvent(eventStr);
      });
      subscriptionRef.current = subscription;
      setListenerActive(true);
    }
  };

  const getNetworkTypeText = (type?: Network.NetworkStateType) => {
    if (!type) return '알 수 없음';
    switch (type) {
      case Network.NetworkStateType.NONE:
        return '연결 없음 (NONE)';
      case Network.NetworkStateType.UNKNOWN:
        return '알 수 없음 (UNKNOWN)';
      case Network.NetworkStateType.WIFI:
        return 'Wi-Fi';
      case Network.NetworkStateType.CELLULAR:
        return '셀룰러';
      case Network.NetworkStateType.ETHERNET:
        return '이더넷';
      case Network.NetworkStateType.BLUETOOTH:
        return '블루투스';
      case Network.NetworkStateType.VPN:
        return 'VPN';
      case Network.NetworkStateType.WIMAX:
        return 'WiMAX';
      case Network.NetworkStateType.OTHER:
        return '기타';
      default:
        return type;
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
      <CustomHeader title="Network" showBackButton />
      <View style={styles.content}>
        {/* 개념 설명 */}
        <View style={styles.section}>
          <TextBox variant="title2" color={theme.text} style={styles.sectionTitle}>
            Network란?
          </TextBox>
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.description}
          >
            expo-network는 디바이스의 네트워크 정보에 접근하여 IP 주소, 네트워크
            상태, 비행기 모드 상태 등을 확인할 수 있게 해주는 라이브러리입니다.
          </TextBox>
          <View
            style={[
              styles.infoBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body4" color={theme.textSecondary} style={styles.infoText}>
              • IP 주소 조회 (IPv4)
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary} style={styles.infoText}>
              • 네트워크 연결 상태 및 타입 확인
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary} style={styles.infoText}>
              • 비행기 모드 상태 확인
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary} style={styles.infoText}>
              • 네트워크 상태 변경 리스너
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary} style={styles.infoText}>
              • Web: ipify 서비스를 사용하여 공용 IP 주소 조회
            </TextBox>
          </View>
        </View>

        {/* useNetworkState Hook */}
        <View style={styles.section}>
          <TextBox variant="title3" color={theme.text} style={styles.sectionTitle}>
            useNetworkState Hook
          </TextBox>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              네트워크 타입:{' '}
              <TextBox
                variant="body2"
                color={theme.primary}
              >
                {getNetworkTypeText(networkState?.type)}
              </TextBox>
            </TextBox>
            <TextBox variant="body2" color={theme.text} style={styles.marginTop}>
              연결됨:{' '}
              <TextBox
                variant="body2"
                color={networkState?.isConnected ? theme.success : theme.error}
              >
                {networkState?.isConnected !== undefined
                  ? networkState.isConnected
                    ? '예'
                    : '아니오'
                  : '알 수 없음'}
              </TextBox>
            </TextBox>
            <TextBox variant="body2" color={theme.text} style={styles.marginTop}>
              인터넷 접근 가능:{' '}
              <TextBox
                variant="body2"
                color={
                  networkState?.isInternetReachable ? theme.success : theme.error
                }
              >
                {networkState?.isInternetReachable !== undefined
                  ? networkState.isInternetReachable
                    ? '예'
                    : '아니오'
                  : '알 수 없음'}
              </TextBox>
            </TextBox>
          </View>
        </View>

        {/* 네트워크 정보 */}
        <View style={styles.section}>
          <TextBox variant="title3" color={theme.text} style={styles.sectionTitle}>
            네트워크 정보
          </TextBox>
          <CustomButton
            title="정보 새로고침"
            onPress={loadNetworkData}
            style={styles.button}
            disabled={loading}
          />
          <View
            style={[
              styles.infoBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              IP 주소:{' '}
              <TextBox
                variant="body2"
                color={ipAddress === '0.0.0.0' ? theme.error : theme.primary}
              >
                {ipAddress || '로딩 중...'}
              </TextBox>
            </TextBox>
            {ipAddress === '0.0.0.0' && (
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.marginTop}
              >
                IP 주소를 가져올 수 없습니다.
              </TextBox>
            )}
            <TextBox variant="body2" color={theme.text} style={styles.marginTop}>
              네트워크 타입 (Async):{' '}
              <TextBox variant="body2" color={theme.primary}>
                {getNetworkTypeText(networkStateAsync?.type)}
              </TextBox>
            </TextBox>
            <TextBox variant="body2" color={theme.text} style={styles.marginTop}>
              연결됨 (Async):{' '}
              <TextBox
                variant="body2"
                color={
                  networkStateAsync?.isConnected ? theme.success : theme.error
                }
              >
                {networkStateAsync?.isConnected !== undefined
                  ? networkStateAsync.isConnected
                    ? '예'
                    : '아니오'
                  : '알 수 없음'}
              </TextBox>
            </TextBox>
            <TextBox variant="body2" color={theme.text} style={styles.marginTop}>
              인터넷 접근 가능 (Async):{' '}
              <TextBox
                variant="body2"
                color={
                  networkStateAsync?.isInternetReachable
                    ? theme.success
                    : theme.error
                }
              >
                {networkStateAsync?.isInternetReachable !== undefined
                  ? networkStateAsync.isInternetReachable
                    ? '예'
                    : '아니오'
                  : '알 수 없음'}
              </TextBox>
            </TextBox>
            <TextBox variant="body2" color={theme.text} style={styles.marginTop}>
              비행기 모드:{' '}
              <TextBox
                variant="body2"
                color={isAirplaneMode ? theme.warning : theme.success}
              >
                {isAirplaneMode !== null
                  ? isAirplaneMode
                    ? '활성화됨'
                    : '비활성화됨'
                  : '알 수 없음'}
              </TextBox>
            </TextBox>
          </View>
        </View>

        {/* 네트워크 상태 변경 리스너 */}
        <View style={styles.section}>
          <TextBox variant="title3" color={theme.text} style={styles.sectionTitle}>
            네트워크 상태 변경 리스너
          </TextBox>
          <CustomButton
            title={listenerActive ? '리스너 중지' : '리스너 시작'}
            onPress={toggleListener}
            style={styles.button}
            variant={listenerActive ? 'primary' : 'ghost'}
          />
          {lastNetworkEvent && (
            <View
              style={[
                styles.infoBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextBox variant="body4" color={theme.textSecondary} style={styles.codeText}>
                {lastNetworkEvent}
              </TextBox>
            </View>
          )}
        </View>

        {/* 코드 예제 */}
        <View style={styles.section}>
          <TextBox variant="title3" color={theme.text} style={styles.sectionTitle}>
            코드 예제
          </TextBox>
          <View
            style={[
              styles.codeBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body4" color={theme.textSecondary} style={styles.codeText}>
              {`import * as Network from 'expo-network';

// Hook 사용 (자동 업데이트)
const networkState = Network.useNetworkState();
console.log('Type:', networkState.type);
console.log('Connected:', networkState.isConnected);
console.log('Internet Reachable:', networkState.isInternetReachable);

// IP 주소 가져오기
const ipAddress = await Network.getIpAddressAsync();
console.log('IP:', ipAddress); // "192.168.32.44"

// 네트워크 상태 가져오기
const state = await Network.getNetworkStateAsync();
console.log('State:', state);

// 비행기 모드 확인
const isAirplaneMode = await Network.isAirplaneModeEnabledAsync();
console.log('Airplane Mode:', isAirplaneMode);

// 네트워크 상태 변경 리스너
const subscription = Network.addNetworkStateListener((event) => {
  console.log('Network changed:', event);
});

// 리스너 제거
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
  button: {
    marginTop: 8,
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
});

