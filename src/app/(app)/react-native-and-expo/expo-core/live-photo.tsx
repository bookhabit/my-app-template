import { useState, useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert, Platform } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import {
  LivePhotoView,
  LivePhotoAsset,
  LivePhotoViewType,
  ContentFit,
  PlaybackStyle,
} from 'expo-live-photo';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function LivePhotoScreen() {
  const { theme } = useTheme();

  const viewRef = useRef<LivePhotoViewType>(null);

  // State
  const [livePhoto, setLivePhoto] = useState<LivePhotoAsset | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [contentFit, setContentFit] = useState<ContentFit>('contain');
  const [isMuted, setIsMuted] = useState(true);
  const [useDefaultGesture, setUseDefaultGesture] = useState(true);
  const [loadStatus, setLoadStatus] = useState<string>('대기 중...');
  const [playbackStatus, setPlaybackStatus] = useState<string>('정지');

  useEffect(() => {
    setIsAvailable(LivePhotoView.isAvailable());
  }, []);

  const pickLivePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['livePhotos'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0].pairedVideoAsset?.uri) {
        const asset: LivePhotoAsset = {
          photoUri: result.assets[0].uri,
          pairedVideoUri: result.assets[0].pairedVideoAsset.uri,
        };
        setLivePhoto(asset);
        setLoadStatus('로딩 중...');
        setPlaybackStatus('정지');
        Alert.alert('성공', 'Live Photo를 선택했습니다.');
      } else {
        Alert.alert('오류', 'Live Photo를 선택하지 못했습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', `Live Photo 선택 실패: ${error.message || error}`);
    }
  };

  const startPlaybackHint = () => {
    if (!viewRef.current) {
      Alert.alert('오류', 'LivePhotoView가 준비되지 않았습니다.');
      return;
    }
    try {
      viewRef.current.startPlayback('hint');
      setPlaybackStatus('재생 중 (Hint)');
    } catch (error: any) {
      Alert.alert('오류', `재생 시작 실패: ${error.message || error}`);
    }
  };

  const startPlaybackFull = () => {
    if (!viewRef.current) {
      Alert.alert('오류', 'LivePhotoView가 준비되지 않았습니다.');
      return;
    }
    try {
      viewRef.current.startPlayback('full');
      setPlaybackStatus('재생 중 (Full)');
    } catch (error: any) {
      Alert.alert('오류', `재생 시작 실패: ${error.message || error}`);
    }
  };

  const stopPlayback = () => {
    if (!viewRef.current) {
      Alert.alert('오류', 'LivePhotoView가 준비되지 않았습니다.');
      return;
    }
    try {
      viewRef.current.stopPlayback();
      setPlaybackStatus('정지');
    } catch (error: any) {
      Alert.alert('오류', `재생 중지 실패: ${error.message || error}`);
    }
  };

  const clearLivePhoto = () => {
    setLivePhoto(null);
    setLoadStatus('대기 중...');
    setPlaybackStatus('정지');
  };

  if (!isAvailable) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={[{ paddingBottom: 20 }]}
      >
        <CustomHeader title="LivePhoto" showBackButton />
        <View style={styles.content}>
          <TextBox variant="title2" color={theme.text} style={styles.heading}>
            LivePhoto
          </TextBox>
          <View
            style={[
              styles.warningBox,
              {
                backgroundColor: theme.error + '20',
                borderColor: theme.error,
              },
            ]}
          >
            <TextBox variant="body2" color={theme.error}>
              ❌ LivePhoto는 iOS에서만 사용 가능합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.warningText}
            >
              현재 플랫폼: {Platform.OS}
            </TextBox>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="LivePhoto" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          LivePhoto
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          iOS Live Photo 표시 (iOS 전용)
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
              LivePhoto API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • iOS Live Photo 표시 및 재생
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • LivePhotoAsset: photoUri + pairedVideoUri
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • ImagePicker로 Live Photo 선택
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 재생 스타일: hint (짧은 미리보기), full (전체 재생)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 기본 제스처: 길게 누르면 재생
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • iOS 전용 (Android에서는 사용 불가)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 원본 Live Photo 파일만 사용 가능 (메타데이터 필요)
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
            📊 상태 정보
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                사용 가능:
              </TextBox>
              <TextBox
                variant="body3"
                color={isAvailable ? theme.success : theme.error}
              >
                {isAvailable ? '✅ 사용 가능' : '❌ 사용 불가'}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                로드 상태:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {loadStatus}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                재생 상태:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {playbackStatus}
              </TextBox>
            </View>

            {livePhoto && (
              <>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Photo URI:
                  </TextBox>
                  <TextBox
                    variant="body4"
                    color={theme.textSecondary}
                    style={styles.uriText}
                  >
                    {livePhoto.photoUri.substring(0, 50)}...
                  </TextBox>
                </View>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    Video URI:
                  </TextBox>
                  <TextBox
                    variant="body4"
                    color={theme.textSecondary}
                    style={styles.uriText}
                  >
                    {livePhoto.pairedVideoUri.substring(0, 50)}...
                  </TextBox>
                </View>
              </>
            )}
          </View>
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
            <View style={styles.optionGroup}>
              <TextBox variant="body2" color={theme.text}>
                Content Fit:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="Contain"
                  onPress={() => setContentFit('contain')}
                  variant={contentFit === 'contain' ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="Cover"
                  onPress={() => setContentFit('cover')}
                  variant={contentFit === 'cover' ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            <View style={styles.optionGroup}>
              <TextBox variant="body2" color={theme.text}>
                음소거:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="켜기"
                  onPress={() => setIsMuted(true)}
                  variant={isMuted ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="끄기"
                  onPress={() => setIsMuted(false)}
                  variant={!isMuted ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            <View style={styles.optionGroup}>
              <TextBox variant="body2" color={theme.text}>
                기본 제스처 인식기:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="사용"
                  onPress={() => setUseDefaultGesture(true)}
                  variant={useDefaultGesture ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="사용 안 함"
                  onPress={() => setUseDefaultGesture(false)}
                  variant={!useDefaultGesture ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Live Photo 선택 및 표시 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📸 Live Photo
          </TextBox>

          {!livePhoto ? (
            <View style={styles.emptyContainer}>
              <TextBox
                variant="body3"
                color={theme.textSecondary}
                style={styles.emptyText}
              >
                Live Photo를 선택해주세요
              </TextBox>
              <CustomButton
                title="Live Photo 선택"
                onPress={pickLivePhoto}
                style={styles.button}
              />
            </View>
          ) : (
            <>
              <LivePhotoView
                ref={viewRef}
                source={livePhoto}
                style={styles.livePhotoView}
                contentFit={contentFit}
                isMuted={isMuted}
                useDefaultGestureRecognizer={useDefaultGesture}
                onLoadStart={() => {
                  setLoadStatus('로딩 시작...');
                }}
                onPreviewPhotoLoad={() => {
                  setLoadStatus('미리보기 사진 로드 완료');
                }}
                onLoadComplete={() => {
                  setLoadStatus('로드 완료');
                  Alert.alert('성공', 'Live Photo가 로드되었습니다!');
                }}
                onLoadError={(error) => {
                  setLoadStatus(`로드 실패: ${error.message}`);
                  Alert.alert('오류', `Live Photo 로드 실패: ${error.message}`);
                }}
                onPlaybackStart={() => {
                  setPlaybackStatus('재생 중');
                }}
                onPlaybackStop={() => {
                  setPlaybackStatus('정지');
                }}
              />

              <View style={styles.buttonRow}>
                <CustomButton
                  title="다시 선택"
                  onPress={pickLivePhoto}
                  variant="ghost"
                  style={styles.button}
                />
                <CustomButton
                  title="초기화"
                  onPress={clearLivePhoto}
                  variant="ghost"
                  style={styles.button}
                />
              </View>
            </>
          )}
        </View>

        {/* 재생 제어 */}
        {livePhoto && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              ▶️ 재생 제어
            </TextBox>

            <View style={styles.playbackButtons}>
              <CustomButton
                title="Hint 재생"
                onPress={startPlaybackHint}
                style={styles.button}
              />
              <CustomButton
                title="Full 재생"
                onPress={startPlaybackFull}
                style={styles.button}
              />
              <CustomButton
                title="정지"
                onPress={stopPlayback}
                variant="ghost"
                style={styles.button}
              />
            </View>

            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              • Hint: 짧은 미리보기 재생
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              • Full: 전체 비디오 재생
            </TextBox>
            {useDefaultGesture && (
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.description}
              >
                • 길게 누르면 자동 재생
              </TextBox>
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
              {`// 1. 기본 사용
import { LivePhotoView, LivePhotoAsset } from 'expo-live-photo';
import { useRef } from 'react';

const viewRef = useRef<LivePhotoViewType>(null);
const [livePhoto, setLivePhoto] = useState<LivePhotoAsset | null>(null);

<LivePhotoView
  ref={viewRef}
  source={livePhoto}
  style={{ width: 300, height: 300 }}
/>

// 2. ImagePicker로 Live Photo 선택
import * as ImagePicker from 'expo-image-picker';

const pickLivePhoto = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['livePhotos'],
  });

  if (!result.canceled && result.assets[0].pairedVideoAsset?.uri) {
    setLivePhoto({
      photoUri: result.assets[0].uri,
      pairedVideoUri: result.assets[0].pairedVideoAsset.uri,
    });
  }
};

// 3. 사용 가능 여부 확인
import { LivePhotoView } from 'expo-live-photo';

if (!LivePhotoView.isAvailable()) {
  return <Text>Live Photo를 사용할 수 없습니다.</Text>;
}

// 4. 재생 제어
const startHint = () => {
  viewRef.current?.startPlayback('hint');
};

const startFull = () => {
  viewRef.current?.startPlayback('full');
};

const stop = () => {
  viewRef.current?.stopPlayback();
};

// 5. 콜백 사용
<LivePhotoView
  ref={viewRef}
  source={livePhoto}
  onLoadStart={() => console.log('로딩 시작')}
  onPreviewPhotoLoad={() => console.log('미리보기 로드')}
  onLoadComplete={() => console.log('로드 완료')}
  onLoadError={(error) => console.error('로드 실패:', error.message)}
  onPlaybackStart={() => console.log('재생 시작')}
  onPlaybackStop={() => console.log('재생 중지')}
/>

// 6. 옵션 설정
<LivePhotoView
  ref={viewRef}
  source={livePhoto}
  contentFit="cover" // 또는 "contain"
  isMuted={false} // 오디오 재생
  useDefaultGestureRecognizer={true} // 길게 누르기 제스처
/>

// 7. LivePhotoAsset 구조
const livePhoto: LivePhotoAsset = {
  photoUri: 'file:///path/to/photo.jpg',
  pairedVideoUri: 'file:///path/to/video.mov',
};

// 8. 조건부 렌더링
{livePhoto && (
  <LivePhotoView
    ref={viewRef}
    source={livePhoto}
    style={styles.livePhoto}
  />
)}

// 9. ref를 통한 메서드 호출
const viewRef = useRef<LivePhotoViewType>(null);

// 재생 시작
viewRef.current?.startPlayback('hint');
viewRef.current?.startPlayback('full');

// 재생 중지
viewRef.current?.stopPlayback();

// 10. 완전한 예제
import { useState, useRef } from 'react';
import { View, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  LivePhotoView,
  LivePhotoAsset,
  LivePhotoViewType,
} from 'expo-live-photo';

export default function LivePhotoExample() {
  const viewRef = useRef<LivePhotoViewType>(null);
  const [livePhoto, setLivePhoto] = useState<LivePhotoAsset | null>(null);

  const pickLivePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['livePhotos'],
    });

    if (!result.canceled && result.assets[0].pairedVideoAsset?.uri) {
      setLivePhoto({
        photoUri: result.assets[0].uri,
        pairedVideoUri: result.assets[0].pairedVideoAsset.uri,
      });
    }
  };

  if (!LivePhotoView.isAvailable()) {
    return <Text>Live Photo를 사용할 수 없습니다.</Text>;
  }

  return (
    <View>
      <LivePhotoView
        ref={viewRef}
        source={livePhoto}
        style={{ width: 300, height: 300 }}
        onLoadComplete={() => console.log('로드 완료')}
      />
      <Button title="Live Photo 선택" onPress={pickLivePhoto} />
      <Button
        title="재생"
        onPress={() => viewRef.current?.startPlayback('full')}
      />
      <Button
        title="정지"
        onPress={() => viewRef.current?.stopPlayback()}
      />
    </View>
  );
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
              • iOS 전용 (Android에서는 사용 불가)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 원본 Live Photo 파일만 사용 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 사진과 비디오는 메타데이터로 연결되어야 함
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 편집된 사진/비디오는 Live Photo로 사용 불가
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • ImagePicker에서 mediaTypes: ['livePhotos'] 필수
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • pairedVideoAsset이 없으면 Live Photo가 아님
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 기본 제스처: 길게 누르면 자동 재생
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • isMuted: false로 설정하면 오디오 재생
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • contentFit: 'contain' (기본) 또는 'cover'
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
  warningBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    marginTop: 4,
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
  description: {
    marginTop: 4,
    lineHeight: 20,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    gap: 8,
  },
  uriText: {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'monospace',
    fontSize: 10,
  },
  optionsContainer: {
    gap: 20,
  },
  optionGroup: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  optionButton: {
    flex: 1,
    minWidth: 80,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
  },
  livePhotoView: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 12,
  },
  playbackButtons: {
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
