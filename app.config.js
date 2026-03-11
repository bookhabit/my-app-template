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
