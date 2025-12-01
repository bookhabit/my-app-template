import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Image,
  Platform,
} from 'react-native';

import {
  CameraView,
  CameraType,
  FlashMode,
  useCameraPermissions,
  useMicrophonePermissions,
  VideoQuality,
  VideoStabilization,
  BarcodeScanningResult,
} from 'expo-camera';

import { useTheme } from '@/context/ThemeProvider';
import Slider from '@react-native-community/slider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function CameraScreen() {
  const { theme } = useTheme();
  const cameraRef = useRef<CameraView>(null);

  // Permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  // Camera state
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [mode, setMode] = useState<'picture' | 'video'>('picture');
  const [mirror, setMirror] = useState(false);
  const [enableTorch, setEnableTorch] = useState(false);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('1080p');
  const [videoStabilization, setVideoStabilization] =
    useState<VideoStabilization>('auto');

  // Capture state
  const [photo, setPhoto] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [barcodeData, setBarcodeData] = useState<BarcodeScanningResult | null>(
    null
  );

  // Camera info
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [supportedFeatures, setSupportedFeatures] = useState<any>(null);

  useEffect(() => {
    checkAvailability();
    loadCameraInfo();
  }, []);

  const checkAvailability = async () => {
    try {
      console.log('checkAvailability');
      const available = await CameraView.isAvailableAsync();
      console.log('CameraView.isAvailableAsync', available);
      setIsAvailable(available);
    } catch (error) {
      setIsAvailable(false);
    }
  };

  const loadCameraInfo = async () => {
    if (!cameraRef.current) return;

    try {
      const sizes = await cameraRef.current.getAvailablePictureSizesAsync();
      setAvailableSizes(sizes);
      if (sizes.length > 0) {
        setSelectedSize(sizes[0]);
      }

      const features = cameraRef.current.getSupportedFeatures();
      setSupportedFeatures(features);
    } catch (error) {
      console.error('Failed to load camera info:', error);
    }
  };

  const handleCameraReady = () => {
    console.log('Camera is ready');
    setIsAvailable(true); // 카메라가 준비되었으므로 사용 가능으로 설정
    loadCameraInfo();
  };

  const handleMountError = (event: { message: string }) => {
    Alert.alert('카메라 오류', event.message);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  const toggleMode = () => {
    setMode((current) => (current === 'picture' ? 'video' : 'picture'));
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert('오류', '카메라가 준비되지 않았습니다.');
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: true,
        skipProcessing: false,
      });

      setPhoto(photo.uri);
      Alert.alert('성공', '사진이 촬영되었습니다.');
    } catch (error) {
      Alert.alert('오류', `사진 촬영 실패: ${error}`);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) {
      Alert.alert('오류', '카메라가 준비되지 않았습니다.');
      return;
    }

    try {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60, // 60초
        maxFileSize: 100 * 1024 * 1024, // 100MB
      });

      setRecordingUri(video?.uri || null);
      setIsRecording(false);
      Alert.alert('성공', '비디오 녹화가 완료되었습니다.');
    } catch (error) {
      setIsRecording(false);
      Alert.alert('오류', `비디오 녹화 실패: ${error}`);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    setBarcodeData(result);
    Alert.alert('바코드 스캔', `타입: ${result.type}\n데이터: ${result.data}`);
  };

  const launchScanner = async () => {
    try {
      await CameraView.launchScanner({
        barcodeTypes: ['qr', 'code128', 'ean13'],
        isGuidanceEnabled: true,
        isHighlightingEnabled: true,
        isPinchToZoomEnabled: true,
      });
    } catch (error) {
      Alert.alert('오류', `스캐너 실행 실패: ${error}`);
    }
  };

  if (!cameraPermission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <CustomHeader title="Camera" showBackButton />
        <View style={styles.loadingContainer}>
          <TextBox variant="body2" color={theme.text}>
            권한 확인 중...
          </TextBox>
        </View>
      </View>
    );
  }

  if (!cameraPermission?.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <CustomHeader title="Camera" showBackButton />
        <View style={styles.permissionContainer}>
          <TextBox variant="title3" color={theme.text} style={styles.message}>
            카메라 권한이 필요합니다
          </TextBox>
          <CustomButton
            title="카메라 권한 요청"
            onPress={requestCameraPermission}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Camera" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Camera
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          카메라 프리뷰, 사진 촬영, 비디오 녹화, 바코드 스캔
        </TextBox>

        {/* 개념 설명 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📚 개념 설명
          </TextBox>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              CameraView
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 디바이스의 전면/후면 카메라 프리뷰를 렌더링하는 컴포넌트
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 사진 촬영 및 비디오 녹화 기능 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 바코드/QR 코드 스캔 기능 내장
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 줌, 플래시, 토치 등 다양한 카메라 설정 지원
            </TextBox>
          </View>
        </View>

        {/* 상태 정보 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📊 카메라 상태
          </TextBox>

          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                사용 가능:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  isAvailable === true
                    ? theme.success
                    : isAvailable === false
                      ? theme.error
                      : theme.textSecondary
                }
              >
                {isAvailable === true
                  ? '✅ 사용 가능'
                  : isAvailable === false
                    ? '❌ 사용 불가'
                    : '확인 중...'}
              </TextBox>
            </View>

            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                카메라 권한:
              </TextBox>
              <TextBox
                variant="body3"
                color={cameraPermission.granted ? theme.success : theme.error}
              >
                {cameraPermission.granted ? '✅ 허용됨' : '❌ 거부됨'}
              </TextBox>
            </View>

            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                마이크 권한:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  microphonePermission?.granted ? theme.success : theme.error
                }
              >
                {microphonePermission?.granted ? '✅ 허용됨' : '❌ 거부됨'}
              </TextBox>
            </View>

            {!microphonePermission?.granted && (
              <CustomButton
                title="마이크 권한 요청"
                onPress={requestMicrophonePermission}
                variant="ghost"
                style={styles.button}
              />
            )}
          </View>
        </View>

        {/* 카메라 프리뷰 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📷 카메라 프리뷰
          </TextBox>

          <View style={styles.cameraContainer}>
            {isActive ? (
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                flash={flash}
                zoom={zoom}
                mode={mode}
                mirror={mirror}
                enableTorch={enableTorch}
                videoQuality={videoQuality}
                videoStabilizationMode={videoStabilization}
                onCameraReady={handleCameraReady}
                onMountError={handleMountError}
                onBarcodeScanned={handleBarcodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr', 'code128', 'ean13', 'ean8'],
                }}
                active={isActive}
              />
            ) : (
              <View
                style={[
                  styles.camera,
                  {
                    backgroundColor: theme.background,
                    justifyContent: 'center',
                  },
                ]}
              >
                <TextBox variant="body2" color={theme.textSecondary}>
                  카메라가 비활성화되었습니다
                </TextBox>
              </View>
            )}

            <View style={styles.cameraControls}>
              <CustomButton
                title={isActive ? '카메라 중지' : '카메라 시작'}
                onPress={() => setIsActive(!isActive)}
                variant="ghost"
                style={styles.smallButton}
              />
              <CustomButton
                title={facing === 'back' ? '전면' : '후면'}
                onPress={toggleCameraFacing}
                variant="ghost"
                style={styles.smallButton}
              />
              <CustomButton
                title={`플래시: ${flash}`}
                onPress={toggleFlash}
                variant="ghost"
                style={styles.smallButton}
              />
              <CustomButton
                title={mode === 'picture' ? '사진' : '비디오'}
                onPress={toggleMode}
                variant="ghost"
                style={styles.smallButton}
              />
            </View>

            <View style={styles.zoomContainer}>
              <TextBox variant="body4" color={theme.textSecondary}>
                줌: {Math.round(zoom * 100)}%
              </TextBox>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={zoom}
                onValueChange={setZoom}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.border}
                thumbTintColor={theme.primary}
              />
            </View>

            <View style={styles.checkboxRow}>
              <CustomButton
                title={mirror ? '✅ 미러링' : '❌ 미러링'}
                onPress={() => setMirror(!mirror)}
                variant="ghost"
                style={styles.checkboxButton}
              />
              <CustomButton
                title={enableTorch ? '✅ 토치' : '❌ 토치'}
                onPress={() => setEnableTorch(!enableTorch)}
                variant="ghost"
                style={styles.checkboxButton}
              />
            </View>
          </View>
        </View>

        {/* 사진 촬영 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📸 사진 촬영
          </TextBox>

          <View style={styles.buttonRow}>
            <CustomButton
              title="사진 촬영"
              onPress={takePicture}
              style={styles.button}
            />
          </View>

          {photo && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: photo }} style={styles.image} />
              <CustomButton
                title="사진 삭제"
                onPress={() => setPhoto(null)}
                variant="ghost"
                style={styles.button}
              />
            </View>
          )}
        </View>

        {/* 비디오 녹화 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎥 비디오 녹화
          </TextBox>

          <View style={styles.buttonRow}>
            {!isRecording ? (
              <CustomButton
                title="녹화 시작"
                onPress={startRecording}
                style={styles.button}
              />
            ) : (
              <CustomButton
                title="녹화 중지"
                onPress={stopRecording}
                variant="ghost"
                style={styles.button}
              />
            )}
          </View>

          <View style={styles.videoSettings}>
            <View style={styles.settingRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                비디오 품질:
              </TextBox>
              <View style={styles.buttonRow}>
                {(
                  ['2160p', '1080p', '720p', '480p', '4:3'] as VideoQuality[]
                ).map((quality) => (
                  <CustomButton
                    key={quality}
                    title={quality}
                    onPress={() => setVideoQuality(quality)}
                    variant={videoQuality === quality ? 'primary' : 'ghost'}
                    style={styles.smallButton}
                  />
                ))}
              </View>
            </View>

            <View style={styles.settingRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                비디오 안정화:
              </TextBox>
              <View style={styles.buttonRow}>
                {(
                  [
                    'off',
                    'standard',
                    'cinematic',
                    'auto',
                  ] as VideoStabilization[]
                ).map((stab) => (
                  <CustomButton
                    key={stab}
                    title={stab}
                    onPress={() => setVideoStabilization(stab)}
                    variant={videoStabilization === stab ? 'primary' : 'ghost'}
                    style={styles.smallButton}
                  />
                ))}
              </View>
            </View>
          </View>

          {recordingUri && (
            <View style={styles.videoContainer}>
              <TextBox variant="body3" color={theme.text}>
                녹화 완료: {recordingUri}
              </TextBox>
              <CustomButton
                title="비디오 정보 초기화"
                onPress={() => setRecordingUri(null)}
                variant="ghost"
                style={styles.button}
              />
            </View>
          )}
        </View>

        {/* 바코드 스캔 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📱 바코드 스캔
          </TextBox>

          <View style={styles.buttonRow}>
            <CustomButton
              title="스캐너 실행"
              onPress={launchScanner}
              style={styles.button}
            />
          </View>

          {barcodeData && (
            <View style={styles.barcodeContainer}>
              <TextBox variant="body2" color={theme.text}>
                바코드 타입: {barcodeData.type}
              </TextBox>
              <TextBox variant="body3" color={theme.textSecondary}>
                데이터: {barcodeData.data}
              </TextBox>
              <CustomButton
                title="바코드 정보 초기화"
                onPress={() => setBarcodeData(null)}
                variant="ghost"
                style={styles.button}
              />
            </View>
          )}
        </View>

        {/* 카메라 설정 */}
        {availableSizes.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              ⚙️ 카메라 설정
            </TextBox>

            <View style={styles.settingRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                사용 가능한 사진 크기:
              </TextBox>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.sizeList}
              >
                {availableSizes.map((size) => (
                  <CustomButton
                    key={size}
                    title={size}
                    onPress={() => setSelectedSize(size)}
                    variant={selectedSize === size ? 'primary' : 'ghost'}
                    style={styles.sizeButton}
                  />
                ))}
              </ScrollView>
            </View>

            {supportedFeatures && (
              <View style={styles.featuresContainer}>
                <TextBox variant="body3" color={theme.text}>
                  지원 기능:
                </TextBox>
                <TextBox variant="body4" color={theme.textSecondary}>
                  • 모던 바코드 스캐너:{' '}
                  {supportedFeatures.isModernBarcodeScannerAvailable
                    ? '✅'
                    : '❌'}
                </TextBox>
                <TextBox variant="body4" color={theme.textSecondary}>
                  • 녹화 토글:{' '}
                  {supportedFeatures.toggleRecordingAsyncAvailable
                    ? '✅'
                    : '❌'}
                </TextBox>
              </View>
            )}
          </View>
        )}

        {/* 코드 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💻 코드 예제
          </TextBox>
          <View
            style={[
              styles.codeContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <TextBox variant="body4" color={theme.text} style={styles.codeText}>
              {`// 1. 기본 카메라 사용
import { CameraView, useCameraPermissions } from 'expo-camera';

const [permission, requestPermission] = useCameraPermissions();

if (!permission?.granted) {
  return <Button onPress={requestPermission} title="권한 요청" />;
}

return (
  <CameraView style={styles.camera} facing="back" />
);

// 2. 사진 촬영
const cameraRef = useRef<CameraView>(null);

const takePicture = async () => {
  const photo = await cameraRef.current?.takePictureAsync({
    quality: 0.8,
    base64: false,
    exif: true,
  });
  console.log('Photo URI:', photo?.uri);
};

// 3. 비디오 녹화
const startRecording = async () => {
  const video = await cameraRef.current?.recordAsync({
    maxDuration: 60,
    quality: '1080p',
    videoStabilizationMode: 'auto',
  });
  console.log('Video URI:', video?.uri);
};

// 4. 바코드 스캔
<CameraView
  onBarcodeScanned={handleBarcodeScanned}
  barcodeScannerSettings={{
    barcodeTypes: ['qr', 'code128'],
  }}
/>

// 5. 카메라 설정
<CameraView
  facing="back"
  flash="auto"
  zoom={0.5}
  mode="picture"
  mirror={false}
  enableTorch={false}
  videoQuality="1080p"
  videoStabilizationMode="auto"
/>`}
            </TextBox>
          </View>
        </View>

        {/* 주의사항 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚠️ 주의사항
          </TextBox>
          <View style={styles.warningContainer}>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 한 번에 하나의 CameraView만 활성화 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 화면을 벗어날 때 CameraView를 언마운트해야 함
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 비디오 녹화 중 카메라 전환 시 녹화가 중지됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 촬영한 사진/비디오는 임시 파일이므로 영구 저장 필요 시
              FileSystem.copy 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 웹에서는 base64 문자열로 반환됨
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
  content: {
    padding: 20,
    gap: 16,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  conceptContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 6,
  },
  conceptTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  conceptText: {
    marginLeft: 8,
    lineHeight: 20,
  },
  statusContainer: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    minWidth: 100,
  },
  smallButton: {
    minWidth: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  cameraContainer: {
    marginTop: 12,
    gap: 12,
  },
  camera: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cameraControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zoomContainer: {
    gap: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkboxButton: {
    flex: 1,
  },
  imageContainer: {
    marginTop: 12,
    gap: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  videoSettings: {
    marginTop: 12,
    gap: 12,
  },
  settingRow: {
    gap: 8,
  },
  videoContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 8,
  },
  barcodeContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 8,
  },
  sizeList: {
    marginTop: 8,
  },
  sizeButton: {
    marginRight: 8,
  },
  featuresContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 8,
  },
  codeContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  warningContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    gap: 8,
  },
  warningItem: {
    marginLeft: 8,
    lineHeight: 22,
  },
});
