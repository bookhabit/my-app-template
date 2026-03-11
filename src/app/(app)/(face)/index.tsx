import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  Platform,
  Linking,
} from 'react-native';

import * as LocalAuthentication from 'expo-local-authentication';

export default function FaceIdAuthenticationPage() {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  // 1. 기기가 생체 인증 하드웨어를 지원하는지 확인
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
  }, []);

  const handleAuthentication = async () => {
    try {
      // 2. 등록된 생체 정보(지문, 얼굴 등)가 있는지 확인
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!enrolled) {
        Alert.alert(
          '등록된 정보 없음',
          '기기에 등록된 Face ID나 지문이 없습니다. 설정에서 등록하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '설정으로 이동',
              onPress: () => openBiometricSettings(),
            },
          ]
        );
        return;
      }

      // 3. 실제 인증 실행
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '인증이 필요합니다', // iOS/Android 공통 문구
        fallbackLabel: '비밀번호 입력', // 인증 실패 시 버튼 문구 (iOS 전용)
        disableDeviceFallback: false, // 실패 시 숫자 비번 등으로 대체 허용 여부
      });
      console.log('인증 결과:', result);

      if (result.success) {
        Alert.alert('인증 성공!', '환영합니다.');
        // 여기서 메인 화면으로 이동하거나 보안 데이터를 로드하세요.
      } else {
        Alert.alert('인증 실패', '다시 시도해주세요.');
      }
    } catch (error: any) {
      Alert.alert('오류 발생', error.message);
    }
  };

  const openBiometricSettings = () => {
    if (Platform.OS === 'ios') {
      // iOS: 앱의 설정 페이지로 이동 (사용자가 직접 '암호 및 보안'으로 이동해야 함)
      Linking.openSettings();
    } else {
      // Android: 보안 설정 화면으로 바로 이동
      Linking.sendIntent('android.settings.SECURITY_SETTINGS');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isBiometricSupported
          ? '생체 인증 사용 가능'
          : '이 기기는 생체 인증을 지원하지 않습니다.'}
      </Text>

      <Button
        title="Face ID / 지문으로 로그인"
        onPress={handleAuthentication}
        disabled={!isBiometricSupported}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 18, marginBottom: 20 },
});
