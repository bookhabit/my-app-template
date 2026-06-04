const versionInfo = require('./versionInfo.json');

export default {
  expo: {
    name: 'monymony',
    slug: 'monymony',
    version: versionInfo.VERSION,
    runtimeVersion: versionInfo.RUNTIME_VERSION,
    appVersionSource: 'local',
    orientation: 'portrait',
    icon: 'src/assets/images/icon.png',
    scheme: 'monymony',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      bundleIdentifier: 'com.hyunjin-l.monymony',
      supportsTablet: true,
      buildNumber: String(versionInfo.BUILD_NUMBER),
    },
    android: {
      package: 'com.hyunjin_l.monymony',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './src/assets/images/icon.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      versionCode: versionInfo.BUILD_NUMBER,
    },
    web: {
      output: 'static',
      favicon: 'src/assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-camera',
        {
          cameraPermission: '카메라를 사용해 게임을 진행합니다.',
          microphonePermission: '마이크를 사용해 게임을 진행합니다.',
        },
      ],
      [
        'expo-audio',
        {
          microphonePermission: '마이크를 사용해 게임을 진행합니다.',
        },
      ],
      [
        'expo-speech-recognition',
        {
          microphonePermission: '음성 인식 게임을 위해 마이크를 사용합니다.',
          speechRecognitionPermission: '음성 인식 게임을 위해 음성 인식 권한이 필요합니다.',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: 'src/assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      [
        'expo-local-authentication',
        {
          faceIDPermission: 'Allow 테스트앱 to use Face ID.',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: '반경 탈출 게임을 위해 위치 정보를 사용합니다.',
          locationWhenInUsePermission: '반경 탈출 게임을 위해 위치 정보를 사용합니다.',
        },
      ],
      [
        'expo-media-library',
        {
          photosPermission: '게임 결과 사진을 저장합니다.',
          savePhotosPermission: '게임 결과 사진을 갤러리에 저장합니다.',
        },
      ],
      [
        'react-native-ble-plx',
        {
          isBackgroundEnabled: false,
          modes: ['peripheral', 'central'],
          bluetoothAlwaysPermission: '블루투스 게임을 위해 Bluetooth 접근이 필요합니다.',
        },
      ],
      '@shopify/react-native-skia',
      'expo-font',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: '067668ac-deee-418a-8f2b-29eed40da930',
      },
    },
    updates: {
      url: 'https://u.expo.dev/067668ac-deee-418a-8f2b-29eed40da930',
    },
    runtimeVersion: '1.0.0',
  },
};
