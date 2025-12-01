import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Alert,
  Platform,
  TextInput,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function ImagePickerScreen() {
  const { theme } = useTheme();

  // Permissions
  const [cameraPermission, requestCameraPermission] =
    ImagePicker.useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();

  // State
  const [selectedAssets, setSelectedAssets] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Options
  const [allowsEditing, setAllowsEditing] = useState(false);
  const [allowsMultipleSelection, setAllowsMultipleSelection] = useState(false);
  const [mediaTypes, setMediaTypes] = useState<
    ('images' | 'videos' | 'livePhotos')[]
  >(['images']);
  const [quality, setQuality] = useState('1.0');
  const [aspect, setAspect] = useState<[number, number] | null>(null);
  const [aspectX, setAspectX] = useState('4');
  const [aspectY, setAspectY] = useState('3');
  const [includeBase64, setIncludeBase64] = useState(false);
  const [includeExif, setIncludeExif] = useState(false);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [selectionLimit, setSelectionLimit] = useState('0');
  const [videoMaxDuration, setVideoMaxDuration] = useState('0');
  const [shape, setShape] = useState<'rectangle' | 'oval'>('rectangle');

  const pickFromLibrary = async () => {
    try {
      setLoading(true);

      if (!mediaLibraryPermission?.granted) {
        const result = await requestMediaLibraryPermission();
        if (!result.granted) {
          Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypes.length === 1 ? mediaTypes[0] : mediaTypes,
        allowsEditing: allowsEditing && !allowsMultipleSelection,
        allowsMultipleSelection,
        aspect: aspect,
        quality: parseFloat(quality) || 1.0,
        base64: includeBase64,
        exif: includeExif,
        selectionLimit: allowsMultipleSelection
          ? parseInt(selectionLimit) || 0
          : undefined,
        shape: allowsEditing ? shape : undefined,
      });

      if (!result.canceled) {
        setSelectedAssets(result.assets);
        Alert.alert(
          '성공',
          `${result.assets.length}개의 미디어를 선택했습니다.`
        );
      } else {
        Alert.alert('취소', '미디어 선택이 취소되었습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', `미디어 선택 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setLoading(true);

      if (!cameraPermission?.granted) {
        const result = await requestCameraPermission();
        if (!result.granted) {
          Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: mediaTypes.length === 1 ? mediaTypes[0] : mediaTypes,
        allowsEditing,
        aspect: aspect,
        quality: parseFloat(quality) || 1.0,
        base64: includeBase64,
        exif: includeExif,
        cameraType:
          cameraType === 'front'
            ? ImagePicker.CameraType.front
            : ImagePicker.CameraType.back,
        videoMaxDuration: parseFloat(videoMaxDuration) || 0,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
        shape: allowsEditing ? shape : undefined,
      });

      if (!result.canceled) {
        setSelectedAssets(result.assets);
        Alert.alert(
          '성공',
          `${result.assets.length}개의 미디어를 촬영했습니다.`
        );
      } else {
        Alert.alert('취소', '촬영이 취소되었습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', `촬영 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedAssets([]);
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return '알 수 없음';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDuration = (ms: number | null | undefined) => {
    if (!ms) return null;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const updateAspect = () => {
    const x = parseFloat(aspectX);
    const y = parseFloat(aspectY);
    if (!isNaN(x) && !isNaN(y) && x > 0 && y > 0) {
      setAspect([x, y]);
    } else {
      setAspect(null);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="ImagePicker" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          ImagePicker
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          시스템 UI를 통한 이미지/비디오 선택 및 촬영
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
              ImagePicker API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 갤러리에서 이미지/비디오 선택
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 카메라로 사진/비디오 촬영
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 이미지 편집 (자르기, 회전)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 다중 선택 지원
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 품질 조절, Base64, EXIF 데이터
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Live Photos 지원 (iOS)
            </TextBox>
          </View>
        </View>

        {/* 권한 상태 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🔐 권한 상태
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                카메라:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  cameraPermission?.granted
                    ? theme.success
                    : cameraPermission?.status === 'denied'
                      ? theme.error
                      : theme.warning
                }
              >
                {cameraPermission?.granted
                  ? '✅ 허용됨'
                  : cameraPermission?.status === 'denied'
                    ? '❌ 거부됨'
                    : cameraPermission?.status === 'undetermined'
                      ? '⏳ 미결정'
                      : '확인 중...'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                미디어 라이브러리:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  mediaLibraryPermission?.granted
                    ? theme.success
                    : mediaLibraryPermission?.status === 'denied'
                      ? theme.error
                      : theme.warning
                }
              >
                {mediaLibraryPermission?.granted
                  ? '✅ 허용됨'
                  : mediaLibraryPermission?.status === 'denied'
                    ? '❌ 거부됨'
                    : mediaLibraryPermission?.status === 'undetermined'
                      ? '⏳ 미결정'
                      : '확인 중...'}
              </TextBox>
            </View>

            {mediaLibraryPermission?.accessPrivileges && (
              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  접근 권한:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {mediaLibraryPermission.accessPrivileges === 'all'
                    ? '전체'
                    : mediaLibraryPermission.accessPrivileges === 'limited'
                      ? '제한됨'
                      : '없음'}
                </TextBox>
              </View>
            )}
          </View>

          {!cameraPermission?.granted && (
            <CustomButton
              title="카메라 권한 요청"
              onPress={requestCameraPermission}
              style={styles.button}
            />
          )}

          {!mediaLibraryPermission?.granted && (
            <CustomButton
              title="미디어 라이브러리 권한 요청"
              onPress={requestMediaLibraryPermission}
              variant="ghost"
              style={styles.button}
            />
          )}
        </View>

        {/* 옵션 설정 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚙️ 옵션 설정
          </TextBox>

          <View style={styles.optionsContainer}>
            {/* Media Types */}
            <View style={styles.optionGroup}>
              <TextBox variant="body2" color={theme.text}>
                미디어 타입:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="이미지"
                  onPress={() => setMediaTypes(['images'])}
                  variant={mediaTypes.includes('images') ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="비디오"
                  onPress={() => setMediaTypes(['videos'])}
                  variant={mediaTypes.includes('videos') ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                {Platform.OS === 'ios' && (
                  <CustomButton
                    title="Live Photos"
                    onPress={() => setMediaTypes(['livePhotos'])}
                    variant={
                      mediaTypes.includes('livePhotos') ? 'primary' : 'ghost'
                    }
                    style={styles.optionButton}
                  />
                )}
              </View>
            </View>

            {/* Allows Editing */}
            <View style={styles.optionGroup}>
              <TextBox variant="body2" color={theme.text}>
                편집 허용:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="활성"
                  onPress={() => setAllowsEditing(true)}
                  variant={allowsEditing ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="비활성"
                  onPress={() => setAllowsEditing(false)}
                  variant={!allowsEditing ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            {/* Allows Multiple Selection */}
            <View style={styles.optionGroup}>
              <TextBox variant="body2" color={theme.text}>
                다중 선택:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="활성"
                  onPress={() => setAllowsMultipleSelection(true)}
                  variant={allowsMultipleSelection ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="비활성"
                  onPress={() => setAllowsMultipleSelection(false)}
                  variant={!allowsMultipleSelection ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            {/* Aspect Ratio */}
            {allowsEditing && !allowsMultipleSelection && (
              <View style={styles.optionGroup}>
                <TextBox variant="body2" color={theme.text}>
                  종횡비 (Android):
                </TextBox>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: theme.background, color: theme.text },
                    ]}
                    value={aspectX}
                    onChangeText={setAspectX}
                    placeholder="4"
                    keyboardType="numeric"
                  />
                  <TextBox variant="body2" color={theme.text}>
                    :
                  </TextBox>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: theme.background, color: theme.text },
                    ]}
                    value={aspectY}
                    onChangeText={setAspectY}
                    placeholder="3"
                    keyboardType="numeric"
                  />
                  <CustomButton
                    title="적용"
                    onPress={updateAspect}
                    variant="ghost"
                    style={styles.aspectButton}
                  />
                </View>
              </View>
            )}

            {/* Shape (Android) */}
            {allowsEditing && Platform.OS === 'android' && (
              <View style={styles.optionGroup}>
                <TextBox variant="body2" color={theme.text}>
                  자르기 모양 (Android):
                </TextBox>
                <View style={styles.buttonRow}>
                  <CustomButton
                    title="사각형"
                    onPress={() => setShape('rectangle')}
                    variant={shape === 'rectangle' ? 'primary' : 'ghost'}
                    style={styles.optionButton}
                  />
                  <CustomButton
                    title="타원"
                    onPress={() => setShape('oval')}
                    variant={shape === 'oval' ? 'primary' : 'ghost'}
                    style={styles.optionButton}
                  />
                </View>
              </View>
            )}

            {/* Quality */}
            <View style={styles.optionGroup}>
              <TextBox variant="body2" color={theme.text}>
                품질 (0.0 - 1.0):
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={quality}
                onChangeText={setQuality}
                placeholder="1.0"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Selection Limit */}
            {allowsMultipleSelection && (
              <View style={styles.optionGroup}>
                <TextBox variant="body2" color={theme.text}>
                  선택 제한 (0 = 무제한):
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={selectionLimit}
                  onChangeText={setSelectionLimit}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            )}

            {/* Video Max Duration */}
            {mediaTypes.includes('videos') && (
              <View style={styles.optionGroup}>
                <TextBox variant="body2" color={theme.text}>
                  비디오 최대 길이 (초, 0 = 무제한):
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={videoMaxDuration}
                  onChangeText={setVideoMaxDuration}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            )}

            {/* Camera Type */}
            <View style={styles.optionGroup}>
              <TextBox variant="body2" color={theme.text}>
                카메라 타입:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="후면"
                  onPress={() => setCameraType('back')}
                  variant={cameraType === 'back' ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="전면"
                  onPress={() => setCameraType('front')}
                  variant={cameraType === 'front' ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            {/* Base64 */}
            <View style={styles.optionGroup}>
              <TextBox variant="body2" color={theme.text}>
                Base64 포함:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="포함"
                  onPress={() => setIncludeBase64(true)}
                  variant={includeBase64 ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="제외"
                  onPress={() => setIncludeBase64(false)}
                  variant={!includeBase64 ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            {/* EXIF */}
            <View style={styles.optionGroup}>
              <TextBox variant="body2" color={theme.text}>
                EXIF 데이터 포함:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="포함"
                  onPress={() => setIncludeExif(true)}
                  variant={includeExif ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="제외"
                  onPress={() => setIncludeExif(false)}
                  variant={!includeExif ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 액션 버튼 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📸 액션
          </TextBox>

          <View style={styles.buttonRow}>
            <CustomButton
              title={loading ? '처리 중...' : '갤러리에서 선택'}
              onPress={pickFromLibrary}
              style={styles.button}
              disabled={loading}
            />
            <CustomButton
              title={loading ? '처리 중...' : '카메라로 촬영'}
              onPress={takePhoto}
              variant="ghost"
              style={styles.button}
              disabled={loading}
            />
          </View>

          {selectedAssets.length > 0 && (
            <CustomButton
              title="선택 초기화"
              onPress={clearSelection}
              variant="ghost"
              style={styles.button}
            />
          )}
        </View>

        {/* 선택된 미디어 */}
        {selectedAssets.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📋 선택된 미디어 ({selectedAssets.length}개)
            </TextBox>

            {selectedAssets.map((asset, index) => (
              <View
                key={index}
                style={[
                  styles.assetCard,
                  { backgroundColor: theme.background },
                ]}
              >
                <View style={styles.assetHeader}>
                  <TextBox variant="body2" color={theme.text}>
                    {asset.type === 'image' ? '🖼️ 이미지' : '🎥 비디오'} #
                    {index + 1}
                  </TextBox>
                  {asset.fileName && (
                    <TextBox variant="body4" color={theme.textSecondary}>
                      {asset.fileName}
                    </TextBox>
                  )}
                </View>

                {/* 이미지 미리보기 */}
                {asset.type === 'image' && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: asset.uri }}
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                  </View>
                )}

                {/* 비디오 정보 */}
                {asset.type === 'video' && (
                  <View style={styles.videoInfo}>
                    <TextBox variant="body3" color={theme.text}>
                      비디오 (미리보기 불가)
                    </TextBox>
                    {asset.duration && (
                      <TextBox variant="body4" color={theme.textSecondary}>
                        길이: {formatDuration(asset.duration)}
                      </TextBox>
                    )}
                  </View>
                )}

                {/* Asset 정보 */}
                <View style={styles.assetInfo}>
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      크기:
                    </TextBox>
                    <TextBox variant="body3" color={theme.text}>
                      {asset.width} x {asset.height}
                    </TextBox>
                  </View>

                  {asset.fileSize && (
                    <View style={styles.infoRow}>
                      <TextBox variant="body3" color={theme.textSecondary}>
                        파일 크기:
                      </TextBox>
                      <TextBox variant="body3" color={theme.text}>
                        {formatFileSize(asset.fileSize)}
                      </TextBox>
                    </View>
                  )}

                  {asset.mimeType && (
                    <View style={styles.infoRow}>
                      <TextBox variant="body3" color={theme.textSecondary}>
                        MIME 타입:
                      </TextBox>
                      <TextBox variant="body3" color={theme.text}>
                        {asset.mimeType}
                      </TextBox>
                    </View>
                  )}

                  {asset.assetId && (
                    <View style={styles.infoRow}>
                      <TextBox variant="body3" color={theme.textSecondary}>
                        Asset ID:
                      </TextBox>
                      <TextBox
                        variant="body4"
                        color={theme.textSecondary}
                        style={styles.assetIdText}
                      >
                        {asset.assetId}
                      </TextBox>
                    </View>
                  )}

                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      URI:
                    </TextBox>
                    <TextBox
                      variant="body4"
                      color={theme.textSecondary}
                      style={styles.uriText}
                    >
                      {asset.uri}
                    </TextBox>
                  </View>

                  {asset.base64 && (
                    <View style={styles.infoRow}>
                      <TextBox variant="body3" color={theme.textSecondary}>
                        Base64:
                      </TextBox>
                      <TextBox
                        variant="body4"
                        color={theme.textSecondary}
                        style={styles.base64Text}
                      >
                        {asset.base64.substring(0, 50)}...
                      </TextBox>
                    </View>
                  )}

                  {asset.exif && (
                    <View style={styles.exifContainer}>
                      <TextBox variant="body3" color={theme.text}>
                        EXIF 데이터:
                      </TextBox>
                      <TextBox
                        variant="body4"
                        color={theme.textSecondary}
                        style={styles.exifText}
                      >
                        {JSON.stringify(asset.exif, null, 2).substring(0, 200)}
                        ...
                      </TextBox>
                    </View>
                  )}

                  {asset.pairedVideoAsset && (
                    <View style={styles.pairedVideoContainer}>
                      <TextBox variant="body3" color={theme.primary}>
                        📹 Paired Video (Live Photo):
                      </TextBox>
                      <TextBox variant="body4" color={theme.textSecondary}>
                        URI: {asset.pairedVideoAsset.uri}
                      </TextBox>
                    </View>
                  )}
                </View>
              </View>
            ))}
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
              {`// 1. 기본 사용 (갤러리에서 선택)
import * as ImagePicker from 'expo-image-picker';

const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 1,
});

if (!result.canceled) {
  const image = result.assets[0];
  console.log('URI:', image.uri);
  console.log('크기:', image.width, 'x', image.height);
}

// 2. 카메라로 촬영
const result = await ImagePicker.launchCameraAsync({
  allowsEditing: true,
  quality: 0.8,
});

// 3. 다중 선택
const result = await ImagePicker.launchImageLibraryAsync({
  allowsMultipleSelection: true,
  selectionLimit: 5, // 최대 5개
});

if (!result.canceled) {
  result.assets.forEach((asset, index) => {
    console.log(\`이미지 \${index + 1}:\`, asset.uri);
  });
}

// 4. 비디오 선택
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['videos'],
  videoMaxDuration: 60, // 최대 60초
});

// 5. 이미지와 비디오 모두
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images', 'videos'],
});

// 6. Base64 포함
const result = await ImagePicker.launchImageLibraryAsync({
  base64: true,
});

if (!result.canceled && result.assets[0].base64) {
  const dataUri = 'data:image/jpeg;base64,' + result.assets[0].base64;
  // Image 컴포넌트에 사용 가능
}

// 7. EXIF 데이터 포함
const result = await ImagePicker.launchImageLibraryAsync({
  exif: true,
});

if (!result.canceled && result.assets[0].exif) {
  console.log('EXIF:', result.assets[0].exif);
}

// 8. 종횡비 설정 (Android)
const result = await ImagePicker.launchImageLibraryAsync({
  allowsEditing: true,
  aspect: [4, 3], // 4:3 비율
});

// 9. 자르기 모양 (Android)
const result = await ImagePicker.launchImageLibraryAsync({
  allowsEditing: true,
  shape: 'oval', // 또는 'rectangle'
});

// 10. 권한 관리
const [status, requestPermission] = ImagePicker.useCameraPermissions();
const [mediaStatus, requestMediaPermission] = 
  ImagePicker.useMediaLibraryPermissions();

// 11. 카메라 타입 선택
const result = await ImagePicker.launchCameraAsync({
  cameraType: ImagePicker.CameraType.front, // 또는 .back
});

// 12. Live Photos (iOS)
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['livePhotos'],
});

if (!result.canceled && result.assets[0].pairedVideoAsset) {
  const image = result.assets[0];
  const video = result.assets[0].pairedVideoAsset;
  // Live Photo 구성 요소
}

// 13. 품질 조절
const result = await ImagePicker.launchImageLibraryAsync({
  quality: 0.5, // 0.0 (낮은 품질) - 1.0 (최고 품질)
});

// 14. Android Pending Result
// MainActivity가 종료된 경우 데이터 복구
const pendingResult = await ImagePicker.getPendingResultAsync();
if (pendingResult && !pendingResult.canceled) {
  // 선택된 미디어 사용
}`}
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
              • allowsEditing과 allowsMultipleSelection은 동시 사용 불가
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 웹: 사용자 액션(버튼 클릭) 후에만 호출 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: .bmp 이미지 자르기는 .png로 변환됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: GIF는 quality=1.0, allowsEditing=false일 때만
              애니메이션 유지
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: allowsEditing=true일 때 비디오 최대 길이 10분 제한
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: MainActivity 종료 시 getPendingResultAsync()로 복구
              가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: Live Photos는 원본 품질로 반환 (quality 옵션 무시)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: EXIF 데이터에 GPS 태그는 카메라 촬영 시 포함되지 않음
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
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionsContainer: {
    gap: 20,
  },
  optionGroup: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: 80,
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    flex: 1,
  },
  aspectButton: {
    minWidth: 60,
  },
  assetCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 12,
  },
  assetHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingBottom: 8,
    gap: 4,
  },
  imageContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  videoInfo: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    alignItems: 'center',
    gap: 4,
  },
  assetInfo: {
    gap: 8,
  },
  assetIdText: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'right',
  },
  uriText: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'right',
  },
  base64Text: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'right',
  },
  exifContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  exifText: {
    fontFamily: 'monospace',
    fontSize: 10,
    marginTop: 4,
  },
  pairedVideoContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    gap: 4,
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
