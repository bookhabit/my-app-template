import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

interface ExpoCoreItem {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  category: string;
}

const expoCoreItems: ExpoCoreItem[] = [
  {
    id: 'fetch',
    title: 'expo/fetch',
    description: 'WinterCG 표준 Fetch API',
    route: '/(app)/react-native-and-expo/expo-core/fetch',
    icon: 'cloud-download',
    category: '네트워크',
  },
  {
    id: 'encoding',
    title: 'TextEncoder / TextDecoder',
    description: '인코딩 API',
    route: '/(app)/react-native-and-expo/expo-core/encoding',
    icon: 'code',
    category: '텍스트 인코딩',
  },
  {
    id: 'streams',
    title: 'Streams API',
    description: 'ReadableStream / WritableStream / TransformStream',
    route: '/(app)/react-native-and-expo/expo-core/streams',
    icon: 'swap-vert',
    category: '스트림',
  },
  {
    id: 'url',
    title: 'URL API',
    description: 'URL / URLSearchParams',
    route: '/(app)/react-native-and-expo/expo-core/url',
    icon: 'link',
    category: 'URL API',
  },
  {
    id: 'event-hooks',
    title: 'Event Hooks',
    description: 'useEvent / useEventListener',
    route: '/(app)/react-native-and-expo/expo-core/event-hooks',
    icon: 'event',
    category: '이벤트 시스템',
  },
  {
    id: 'shared-objects',
    title: 'SharedObject / SharedRef',
    description: 'Native 객체 공유',
    route: '/(app)/react-native-and-expo/expo-core/shared-objects',
    icon: 'share',
    category: 'Shared Native Objects',
  },

  {
    id: 'pedometer',
    title: 'Pedometer',
    description: '걸음 센서를 사용한 걸음 수 조회 및 실시간 감지',
    route: '/(app)/react-native-and-expo/expo-core/pedometer',
    icon: 'directions-walk',
    category: '센서',
  },
  {
    id: 'accelerometer',
    title: 'Accelerometer',
    description: '기기의 가속도계 센서를 사용한 3차원 가속도 측정',
    route: '/(app)/react-native-and-expo/expo-core/accelerometer',
    icon: 'vibration',
    category: '센서',
  },
  {
    id: 'asset',
    title: 'Expo Asset',
    description: '애셋(이미지, 폰트, 사운드 등) 다운로드 및 관리',
    route: '/(app)/react-native-and-expo/expo-core/asset',
    icon: 'image',
    category: '애셋 관리',
  },
  {
    id: 'audio',
    title: 'Expo Audio',
    description: '오디오 재생 및 녹음 기능',
    route: '/(app)/react-native-and-expo/expo-core/audio',
    icon: 'volume-up',
    category: '미디어',
  },
  {
    id: 'barometer',
    title: 'Barometer',
    description: '기기의 기압계 센서를 사용한 대기압 측정',
    route: '/(app)/react-native-and-expo/expo-core/barometer',
    icon: 'cloud',
    category: '센서',
  },
  {
    id: 'battery',
    title: 'Battery',
    description: '기기의 배터리 정보 및 상태 모니터링',
    route: '/(app)/react-native-and-expo/expo-core/battery',
    icon: 'battery-full',
    category: '시스템 정보',
  },
  {
    id: 'blur',
    title: 'BlurView',
    description: '하위 콘텐츠를 블러 처리하는 React 컴포넌트',
    route: '/(app)/react-native-and-expo/expo-core/blur',
    icon: 'blur-on',
    category: 'UI 컴포넌트',
  },
  {
    id: 'brightness',
    title: 'Brightness',
    description: '화면 밝기 조절 및 모니터링',
    route: '/(app)/react-native-and-expo/expo-core/brightness',
    icon: 'brightness-6',
    category: '시스템 정보',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    description: '시스템 캘린더 및 이벤트 관리',
    route: '/(app)/react-native-and-expo/expo-core/calendar',
    icon: 'event',
    category: '시스템 정보',
  },
  {
    id: 'camera',
    title: 'Camera',
    description: '카메라 프리뷰, 사진 촬영, 비디오 녹화, 바코드 스캔',
    route: '/(app)/react-native-and-expo/expo-core/camera',
    icon: 'camera-alt',
    category: '미디어',
  },
  {
    id: 'cellular',
    title: 'Cellular',
    description: '셀룰러 서비스 제공자 정보 및 연결 상태',
    route: '/(app)/react-native-and-expo/expo-core/cellular',
    icon: 'signal-cellular-alt',
    category: '시스템 정보',
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    description: '기본 체크박스 컴포넌트',
    route: '/(app)/react-native-and-expo/expo-core/checkbox',
    icon: 'check-box',
    category: 'UI 컴포넌트',
  },
  {
    id: 'clipboard',
    title: 'Clipboard',
    description: '클립보드 읽기/쓰기 기능',
    route: '/(app)/react-native-and-expo/expo-core/clipboard',
    icon: 'content-copy',
    category: '시스템 정보',
  },
  {
    id: 'constants',
    title: 'Constants',
    description: '앱 설치 기간 동안 변하지 않는 시스템 정보',
    route: '/(app)/react-native-and-expo/expo-core/constants',
    icon: 'settings',
    category: '시스템 정보',
  },
  {
    id: 'contacts',
    title: 'Contacts',
    description: '시스템 연락처 읽기/쓰기 및 관리',
    route: '/(app)/react-native-and-expo/expo-core/contacts',
    icon: 'contacts',
    category: '시스템 정보',
  },
  {
    id: 'crypto',
    title: 'Crypto',
    description: '암호화 해시 생성 및 랜덤 값 생성',
    route: '/(app)/react-native-and-expo/expo-core/crypto',
    icon: 'lock',
    category: '보안',
  },
  {
    id: 'device',
    title: 'Device',
    description: '물리적 디바이스의 시스템 정보',
    route: '/(app)/react-native-and-expo/expo-core/device',
    icon: 'devices',
    category: '시스템 정보',
  },
  {
    id: 'device-motion',
    title: 'DeviceMotion',
    description: '디바이스 모션 및 방향 센서',
    route: '/(app)/react-native-and-expo/expo-core/device-motion',
    icon: '3d-rotation',
    category: '센서',
  },
  {
    id: 'document-picker',
    title: 'DocumentPicker',
    description: '시스템 문서 선택 UI',
    route: '/(app)/react-native-and-expo/expo-core/document-picker',
    icon: 'description',
    category: '파일 관리',
  },
  {
    id: 'file-system',
    title: 'FileSystem',
    description: '로컬 파일 시스템 접근',
    route: '/(app)/react-native-and-expo/expo-core/file-system',
    icon: 'folder',
    category: '파일 관리',
  },
  {
    id: 'glass-effect',
    title: 'GlassEffect',
    description: 'iOS Liquid Glass 효과',
    route: '/(app)/react-native-and-expo/expo-core/glass-effect',
    icon: 'blur-on',
    category: 'UI 컴포넌트',
  },
  {
    id: 'gl',
    title: 'GLView',
    description: 'OpenGL ES 렌더링 타겟',
    route: '/(app)/react-native-and-expo/expo-core/gl',
    icon: 'view-in-ar',
    category: '그래픽',
  },
  {
    id: 'gyroscope',
    title: 'Gyroscope',
    description: '기기의 자이로스코프 센서를 사용한 3차원 회전 측정',
    route: '/(app)/react-native-and-expo/expo-core/gyroscope',
    icon: '3d-rotation',
    category: '센서',
  },
  {
    id: 'haptics',
    title: 'Haptics',
    description: '햅틱 피드백 (진동) 효과',
    route: '/(app)/react-native-and-expo/expo-core/haptics',
    icon: 'vibration',
    category: '시스템 정보',
  },
  {
    id: 'image-manipulator',
    title: 'ImageManipulator',
    description: '로컬 파일 시스템의 이미지 조작',
    route: '/(app)/react-native-and-expo/expo-core/image-manipulator',
    icon: 'image',
    category: '미디어',
  },
  {
    id: 'image-picker',
    title: 'ImagePicker',
    description: '시스템 UI를 통한 이미지/비디오 선택 및 촬영',
    route: '/(app)/react-native-and-expo/expo-core/image-picker',
    icon: 'photo-library',
    category: '미디어',
  },
  {
    id: 'intent-launcher',
    title: 'IntentLauncher',
    description: 'Android Intent 실행 (설정, 앱 열기)',
    route: '/(app)/react-native-and-expo/expo-core/intent-launcher',
    icon: 'launch',
    category: '시스템',
  },
  {
    id: 'keep-awake',
    title: 'KeepAwake',
    description: '화면이 꺼지지 않도록 유지',
    route: '/(app)/react-native-and-expo/expo-core/keep-awake',
    icon: 'brightness-5',
    category: '시스템',
  },
  {
    id: 'light-sensor',
    title: 'LightSensor',
    description: '조도 센서 (Android 전용)',
    route: '/(app)/react-native-and-expo/expo-core/light-sensor',
    icon: 'wb-sunny',
    category: '센서',
  },
  {
    id: 'live-photo',
    title: 'LivePhoto',
    description: 'iOS Live Photo 표시 및 재생',
    route: '/(app)/react-native-and-expo/expo-core/live-photo',
    icon: 'photo-camera',
    category: '미디어',
  },
  {
    id: 'local-authentication',
    title: 'LocalAuthentication',
    description: '생체 인식 인증 (지문, FaceID, TouchID)',
    route: '/(app)/react-native-and-expo/expo-core/local-authentication',
    icon: 'fingerprint',
    category: '보안',
  },
  {
    id: 'localization',
    title: 'Localization',
    description: '디바이스 로케일 및 캘린더 정보',
    route: '/(app)/react-native-and-expo/expo-core/localization',
    icon: 'language',
    category: '시스템',
  },
  {
    id: 'location',
    title: 'Location',
    description: '위치 정보 및 지오코딩',
    route: '/(app)/react-native-and-expo/expo-core/location',
    icon: 'location-on',
    category: '시스템',
  },
  {
    id: 'magnetometer',
    title: 'Magnetometer',
    description: '자기장 센서 (마이크로테슬라)',
    route: '/(app)/react-native-and-expo/expo-core/magnetometer',
    icon: 'explore',
    category: '센서',
  },
  {
    id: 'mail-composer',
    title: 'MailComposer',
    description: '시스템 이메일 작성 UI',
    route: '/(app)/react-native-and-expo/expo-core/mail-composer',
    icon: 'mail',
    category: '시스템',
  },
  {
    id: 'media-library',
    title: 'MediaLibrary',
    description: '디바이스 미디어 라이브러리 접근 및 관리',
    route: '/(app)/react-native-and-expo/expo-core/media-library',
    icon: 'photo-library',
    category: '미디어',
  },
  {
    id: 'network',
    title: 'Network',
    description: '네트워크 정보 (IP 주소, 연결 상태, 비행기 모드)',
    route: '/(app)/react-native-and-expo/expo-core/network',
    icon: 'network-check',
    category: '시스템',
  },
  {
    id: 'print',
    title: 'Print',
    description: 'HTML 인쇄 및 PDF 생성 (AirPrint)',
    route: '/(app)/react-native-and-expo/expo-core/print',
    icon: 'print',
    category: '시스템',
  },
  {
    id: 'router-tabs',
    title: 'Router Tabs',
    description: 'Native Tabs 및 Custom Tab Layouts',
    route: '/(app)/react-native-and-expo/expo-core/router-tabs',
    icon: 'view-column',
    category: '네비게이션',
  },
  {
    id: 'screen-capture',
    title: 'ScreenCapture',
    description: '화면 캡처 방지 및 스크린샷 감지',
    route: '/(app)/react-native-and-expo/expo-core/screen-capture',
    icon: 'screenshot',
    category: '시스템',
  },
  {
    id: 'screen-orientation',
    title: 'ScreenOrientation',
    description: '화면 방향 제어 및 감지',
    route: '/(app)/react-native-and-expo/expo-core/screen-orientation',
    icon: 'screen-rotation',
    category: '시스템',
  },
  {
    id: 'secure-store',
    title: 'SecureStore',
    description: '암호화된 키-값 저장소',
    route: '/(app)/react-native-and-expo/expo-core/secure-store',
    icon: 'lock',
    category: '보안',
  },
  {
    id: 'server',
    title: 'Server',
    description: '서버 사이드 API 및 런타임',
    route: '/(app)/react-native-and-expo/expo-core/server',
    icon: 'dns',
    category: '네트워크',
  },
  {
    id: 'sharing',
    title: 'Sharing',
    description: '파일 공유 기능 (다른 앱으로 공유)',
    route: '/(app)/react-native-and-expo/expo-core/sharing',
    icon: 'share',
    category: '시스템',
  },
  {
    id: 'sms',
    title: 'SMS',
    description: '시스템 SMS UI를 통한 메시지 전송',
    route: '/(app)/react-native-and-expo/expo-core/sms',
    icon: 'sms',
    category: '시스템',
  },
  {
    id: 'speech',
    title: 'Speech',
    description: '텍스트-음성 변환 (TTS) 기능',
    route: '/(app)/react-native-and-expo/expo-core/speech',
    icon: 'record-voice-over',
    category: '미디어',
  },
  {
    id: 'symbols',
    title: 'Symbols',
    description: 'iOS SF Symbols 라이브러리 접근',
    route: '/(app)/react-native-and-expo/expo-core/symbols',
    icon: 'category',
    category: 'UI 컴포넌트',
  },
  {
    id: 'system-ui',
    title: 'SystemUI',
    description: '시스템 UI 요소 상호작용 (배경색, UI 스타일)',
    route: '/(app)/react-native-and-expo/expo-core/system-ui',
    icon: 'palette',
    category: '시스템',
  },
  {
    id: 'video',
    title: 'Video',
    description: '비디오 재생 컴포넌트 및 플레이어',
    route: '/(app)/react-native-and-expo/expo-core/video',
    icon: 'videocam',
    category: '미디어',
  },
  {
    id: 'video-thumbnails',
    title: 'Video Thumbnails',
    description: '비디오에서 썸네일 이미지 생성',
    route: '/(app)/react-native-and-expo/expo-core/video-thumbnails',
    icon: 'image',
    category: '미디어',
  },
  {
    id: 'web-browser',
    title: 'WebBrowser',
    description: '시스템 웹 브라우저 UI 열기',
    route: '/(app)/react-native-and-expo/expo-core/web-browser',
    icon: 'open-in-browser',
    category: '시스템',
  },
];

export default function ExpoModulesScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleItemPress = (route: string) => {
    router.push(route as any);
  };

  const renderSection = (category: string, items: ExpoCoreItem[]) => {
    if (items.length === 0) return null;

    return (
      <View key={category} style={styles.section}>
        <TextBox
          variant="title3"
          color={theme.text}
          style={styles.sectionTitle}
        >
          {category}
        </TextBox>
        <View style={styles.itemList}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.itemCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => handleItemPress(item.route)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <MaterialIcons
                    name={item.icon}
                    size={24}
                    color={theme.primary}
                  />
                  <View style={styles.cardText}>
                    <TextBox
                      variant="body2"
                      color={theme.text}
                      style={styles.cardTitle}
                    >
                      {item.title}
                    </TextBox>
                    <TextBox
                      variant="body4"
                      color={theme.textSecondary}
                      style={styles.cardDescription}
                    >
                      {item.description}
                    </TextBox>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  // 카테고리별로 그룹화
  const categories = Array.from(
    new Set(expoCoreItems.map((item) => item.category))
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Expo Core API" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Expo Core API
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          Expo 핵심 시스템 API를 테스트해보세요
        </TextBox>

        {categories.map((category) => {
          const items = expoCoreItems.filter(
            (item) => item.category === category
          );
          return renderSection(category, items);
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  itemList: {
    gap: 12,
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cardContent: {
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    lineHeight: 18,
  },
});
