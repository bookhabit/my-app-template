import { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Alert,
  Platform,
  TextInput,
  FlatList,
} from 'react-native';

import * as MediaLibrary from 'expo-media-library';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function MediaLibraryScreen() {
  const { theme } = useTheme();

  // Permissions
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  // State
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<MediaLibrary.Album | null>(
    null
  );
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [assetInfo, setAssetInfo] = useState<MediaLibrary.AssetInfo | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [listenerActive, setListenerActive] = useState(false);
  const [lastChangeEvent, setLastChangeEvent] = useState<string>('');

  // Options
  const [includeSmartAlbums, setIncludeSmartAlbums] = useState(true);
  const [mediaType, setMediaType] =
    useState<MediaLibrary.MediaTypeValue>('photo');
  const [sortBy, setSortBy] =
    useState<MediaLibrary.SortByValue>('creationTime');
  const [first, setFirst] = useState('20');
  const [resolveWithFullInfo, setResolveWithFullInfo] = useState(false);

  // Album operations
  const [newAlbumName, setNewAlbumName] = useState('');
  const [selectedAssetForAlbum, setSelectedAssetForAlbum] =
    useState<string>('');

  // Asset operations
  const [assetUriToSave, setAssetUriToSave] = useState('');

  const subscriptionRef = useRef<MediaLibrary.Subscription | null>(null);

  useEffect(() => {
    checkAvailability();
    if (permissionResponse?.granted) {
      loadAlbums();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, [permissionResponse]);

  const checkAvailability = async () => {
    try {
      const available = await MediaLibrary.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      console.error('Failed to check availability:', error);
      setIsAvailable(false);
    }
  };

  const loadAlbums = async () => {
    if (!permissionResponse?.granted) {
      Alert.alert('권한 필요', '미디어 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    try {
      setLoading(true);
      const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums,
      });
      setAlbums(fetchedAlbums);
    } catch (error: any) {
      Alert.alert('오류', `앨범 로드 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async (album?: MediaLibrary.Album) => {
    if (!permissionResponse?.granted) {
      Alert.alert('권한 필요', '미디어 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    try {
      setLoading(true);
      const options: MediaLibrary.AssetsOptions = {
        mediaType: mediaType,
        sortBy: sortBy,
        first: parseInt(first) || 20,
        resolveWithFullInfo,
        album: album?.id,
      };

      const result = await MediaLibrary.getAssetsAsync(options);
      setAssets(result.assets);
      setSelectedAlbum(album || null);
    } catch (error: any) {
      Alert.alert('오류', `에셋 로드 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const getAssetInfo = async (assetId: string) => {
    try {
      setLoading(true);
      const info = await MediaLibrary.getAssetInfoAsync(assetId, {
        shouldDownloadFromNetwork: true,
      });
      setAssetInfo(info);
      Alert.alert('성공', '에셋 정보를 가져왔습니다.');
    } catch (error: any) {
      Alert.alert('오류', `에셋 정보 가져오기 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const createAlbum = async () => {
    if (!newAlbumName.trim()) {
      Alert.alert('알림', '앨범 이름을 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      let album: MediaLibrary.Album;

      if (selectedAssetForAlbum) {
        // Android: 에셋이 필요함
        album = await MediaLibrary.createAlbumAsync(
          newAlbumName,
          selectedAssetForAlbum,
          true // copyAsset
        );
      } else {
        // iOS: 빈 앨범 생성 가능
        album = await MediaLibrary.createAlbumAsync(newAlbumName);
      }

      Alert.alert('성공', `앨범 "${album.title}"이 생성되었습니다.`);
      setNewAlbumName('');
      setSelectedAssetForAlbum('');
      await loadAlbums();
    } catch (error: any) {
      Alert.alert('오류', `앨범 생성 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteAlbum = async (album: MediaLibrary.Album) => {
    Alert.alert('앨범 삭제', `"${album.title}" 앨범을 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await MediaLibrary.deleteAlbumsAsync(album.id, false);
            Alert.alert('성공', '앨범이 삭제되었습니다.');
            await loadAlbums();
            if (selectedAlbum?.id === album.id) {
              setSelectedAlbum(null);
              setAssets([]);
            }
          } catch (error: any) {
            Alert.alert('오류', `앨범 삭제 실패: ${error.message || error}`);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const deleteAsset = async (assetId: string) => {
    Alert.alert('에셋 삭제', '이 에셋을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await MediaLibrary.deleteAssetsAsync(assetId);
            Alert.alert('성공', '에셋이 삭제되었습니다.');
            if (selectedAlbum) {
              await loadAssets(selectedAlbum);
            } else {
              await loadAssets();
            }
          } catch (error: any) {
            Alert.alert('오류', `에셋 삭제 실패: ${error.message || error}`);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const saveToLibrary = async () => {
    if (!assetUriToSave.trim()) {
      Alert.alert('알림', '저장할 파일 URI를 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      await MediaLibrary.saveToLibraryAsync(assetUriToSave);
      Alert.alert('성공', '파일이 미디어 라이브러리에 저장되었습니다.');
      setAssetUriToSave('');
      if (selectedAlbum) {
        await loadAssets(selectedAlbum);
      } else {
        await loadAssets();
      }
    } catch (error: any) {
      Alert.alert('오류', `저장 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const createAsset = async (uri: string) => {
    try {
      setLoading(true);
      const asset = await MediaLibrary.createAssetAsync(uri, selectedAlbum?.id);
      Alert.alert('성공', `에셋이 생성되었습니다: ${asset.filename}`);
      if (selectedAlbum) {
        await loadAssets(selectedAlbum);
      } else {
        await loadAssets();
      }
    } catch (error: any) {
      Alert.alert('오류', `에셋 생성 실패: ${error.message || error}`);
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
      setLastChangeEvent('');
    } else {
      const subscription = MediaLibrary.addListener((event) => {
        const eventStr = JSON.stringify(
          {
            hasIncrementalChanges: event.hasIncrementalChanges,
            insertedAssets: event.insertedAssets?.length || 0,
            deletedAssets: event.deletedAssets?.length || 0,
            updatedAssets: event.updatedAssets?.length || 0,
          },
          null,
          2
        );
        setLastChangeEvent(eventStr);
      });
      subscriptionRef.current = subscription;
      setListenerActive(true);
    }
  };

  const getMediaTypeText = (type: MediaLibrary.MediaTypeValue) => {
    switch (type) {
      case 'photo':
        return '사진';
      case 'video':
        return '비디오';
      case 'audio':
        return '오디오';
      case 'unknown':
        return '알 수 없음';
      default:
        return type;
    }
  };

  const getSortByText = (sort: MediaLibrary.SortByValue) => {
    if (Array.isArray(sort)) {
      return `${sort[0]} (${sort[1] ? '오름차순' : '내림차순'})`;
    }
    return sort;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="MediaLibrary" showBackButton />
      <View style={styles.content}>
        {/* 개념 설명 */}
        <View style={styles.section}>
          <TextBox
            variant="title2"
            color={theme.text}
            style={styles.sectionTitle}
          >
            MediaLibrary란?
          </TextBox>
          <TextBox
            variant="body3"
            color={theme.textSecondary}
            style={styles.description}
          >
            expo-media-library는 디바이스의 미디어 라이브러리에 접근하여 사진,
            비디오, 오디오를 읽고, 저장하고, 관리할 수 있게 해주는
            라이브러리입니다.
          </TextBox>
          <View
            style={[
              styles.infoBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 앨범 목록 조회 및 에셋 가져오기
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 에셋 생성, 저장, 삭제
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 앨범 생성, 삭제, 에셋 추가/제거
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 미디어 라이브러리 변경 이벤트 구독
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Android: 빈 앨범 생성 불가 (에셋 또는 URI 필요)
            </TextBox>
          </View>
        </View>

        {/* 사용 가능 여부 및 권한 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            사용 가능 여부 및 권한
          </TextBox>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              사용 가능:{' '}
              <TextBox
                variant="body2"
                color={isAvailable ? theme.success : theme.error}
              >
                {isAvailable === null
                  ? '확인 중...'
                  : isAvailable
                    ? '사용 가능'
                    : '사용 불가'}
              </TextBox>
            </TextBox>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.marginTop}
            >
              권한 상태:{' '}
              <TextBox
                variant="body2"
                color={
                  permissionResponse?.granted
                    ? theme.success
                    : permissionResponse?.status === 'denied'
                      ? theme.error
                      : theme.textSecondary
                }
              >
                {permissionResponse?.status || '확인 중...'}
              </TextBox>
            </TextBox>
            {permissionResponse?.accessPrivileges && (
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.marginTop}
              >
                접근 권한:{' '}
                <TextBox variant="body2" color={theme.textSecondary}>
                  {permissionResponse.accessPrivileges === 'all'
                    ? '전체 접근'
                    : permissionResponse.accessPrivileges === 'limited'
                      ? '제한된 접근'
                      : '접근 없음'}
                </TextBox>
              </TextBox>
            )}
            <CustomButton
              title="권한 요청"
              onPress={requestPermission}
              style={styles.button}
              disabled={permissionResponse?.granted}
            />
          </View>
        </View>

        {/* 앨범 목록 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            앨범 목록
          </TextBox>
          <View style={styles.optionsRow}>
            <CustomButton
              title={
                includeSmartAlbums ? '스마트 앨범 포함' : '스마트 앨범 제외'
              }
              onPress={() => setIncludeSmartAlbums(!includeSmartAlbums)}
              style={[styles.button, styles.flex1]}
              variant={includeSmartAlbums ? 'primary' : 'ghost'}
            />
            <CustomButton
              title="앨범 새로고침"
              onPress={loadAlbums}
              style={[styles.button, styles.flex1]}
              disabled={loading || !permissionResponse?.granted}
            />
          </View>
          {albums.length > 0 && (
            <View
              style={[
                styles.albumsContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <FlatList
                data={albums}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.albumItem,
                      {
                        backgroundColor:
                          selectedAlbum?.id === item.id
                            ? theme.primary + '20'
                            : 'transparent',
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.albumItemContent}>
                      <View style={styles.flex1}>
                        <TextBox variant="body2" color={theme.text}>
                          {item.title}
                        </TextBox>
                        <TextBox variant="body4" color={theme.textSecondary}>
                          {item.assetCount ?? 0}개 에셋
                          {item.type && ` • ${item.type}`}
                        </TextBox>
                      </View>
                      <View style={styles.albumActions}>
                        <CustomButton
                          title="에셋 보기"
                          onPress={() => loadAssets(item)}
                          style={styles.smallButton}
                          variant="ghost"
                        />
                        <CustomButton
                          title="삭제"
                          onPress={() => deleteAlbum(item)}
                          style={styles.smallButton}
                          variant="ghost"
                        />
                      </View>
                    </View>
                  </View>
                )}
              />
            </View>
          )}
        </View>

        {/* 에셋 목록 */}
        {selectedAlbum && (
          <View style={styles.section}>
            <TextBox
              variant="title3"
              color={theme.text}
              style={styles.sectionTitle}
            >
              에셋 목록: {selectedAlbum.title}
            </TextBox>
            <View
              style={[
                styles.assetsContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {assets.length > 0 ? (
                <FlatList
                  data={assets}
                  keyExtractor={(item) => item.id}
                  numColumns={3}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={styles.assetItem}>
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.assetImage}
                        resizeMode="cover"
                      />
                      <CustomButton
                        title="정보"
                        onPress={() => getAssetInfo(item.id)}
                        style={styles.assetButton}
                        variant="ghost"
                      />
                      <CustomButton
                        title="삭제"
                        onPress={() => deleteAsset(item.id)}
                        style={styles.assetButton}
                        variant="ghost"
                      />
                    </View>
                  )}
                />
              ) : (
                <TextBox variant="body3" color={theme.textSecondary}>
                  에셋이 없습니다.
                </TextBox>
              )}
            </View>
          </View>
        )}

        {/* 에셋 옵션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            에셋 옵션
          </TextBox>
          <View style={styles.optionsRow}>
            <View style={styles.flex1}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                미디어 타입
              </TextBox>
              <View style={styles.optionsRow}>
                {(['photo', 'video', 'audio'] as const).map((type) => (
                  <CustomButton
                    key={type}
                    title={getMediaTypeText(type)}
                    onPress={() => setMediaType(type)}
                    style={[styles.button, styles.flex1]}
                    variant={mediaType === type ? 'primary' : 'ghost'}
                  />
                ))}
              </View>
            </View>
          </View>
          <View style={styles.optionsRow}>
            <View style={styles.flex1}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                정렬 기준
              </TextBox>
              <View style={styles.optionsRow}>
                {(
                  [
                    'creationTime',
                    'modificationTime',
                    'mediaType',
                    'width',
                    'height',
                    'duration',
                  ] as const
                ).map((sort) => (
                  <CustomButton
                    key={sort}
                    title={sort}
                    onPress={() => setSortBy(sort)}
                    style={[styles.button, styles.flex1]}
                    variant={
                      (Array.isArray(sortBy) ? sortBy[0] : sortBy) === sort
                        ? 'primary'
                        : 'ghost'
                    }
                  />
                ))}
              </View>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              페이지 크기
            </TextBox>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={first}
              onChangeText={setFirst}
              placeholder="20"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
          <View
            style={[
              styles.checkboxContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <CustomButton
              title={
                resolveWithFullInfo ? '전체 정보 포함됨' : '전체 정보 미포함'
              }
              onPress={() => setResolveWithFullInfo(!resolveWithFullInfo)}
              style={styles.button}
              variant={resolveWithFullInfo ? 'primary' : 'ghost'}
            />
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.hint}
            >
              전체 정보 포함: EXIF 데이터 및 방향 정보 포함 (Android에서 이미지
              방향 수정 가능)
            </TextBox>
          </View>
          <CustomButton
            title="에셋 로드"
            onPress={() => loadAssets(selectedAlbum || undefined)}
            style={styles.button}
            disabled={loading || !permissionResponse?.granted}
          />
        </View>

        {/* 앨범 생성 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            앨범 생성
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              앨범 이름
            </TextBox>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={newAlbumName}
              onChangeText={setNewAlbumName}
              placeholder="새 앨범 이름"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          {Platform.OS === 'android' && (
            <View style={styles.inputGroup}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                초기 에셋 ID (Android 필수)
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.hint}
              >
                Android에서는 빈 앨범을 생성할 수 없으므로 에셋 ID 또는 URI가
                필요합니다.
              </TextBox>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={selectedAssetForAlbum}
                onChangeText={setSelectedAssetForAlbum}
                placeholder="에셋 ID 또는 URI"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          )}
          <CustomButton
            title="앨범 생성"
            onPress={createAlbum}
            style={styles.button}
            disabled={loading || !permissionResponse?.granted}
          />
        </View>

        {/* 에셋 저장 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            에셋 저장
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              파일 URI
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.hint}
            >
              저장할 파일의 로컬 URI (예: file:///path/to/image.jpg)
            </TextBox>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={assetUriToSave}
              onChangeText={setAssetUriToSave}
              placeholder="file:///path/to/file.jpg"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.optionsRow}>
            <CustomButton
              title="라이브러리에 저장"
              onPress={saveToLibrary}
              style={[styles.button, styles.flex1]}
              disabled={loading || !permissionResponse?.granted}
            />
            <CustomButton
              title="에셋 생성"
              onPress={() => createAsset(assetUriToSave)}
              style={[styles.button, styles.flex1]}
              disabled={
                loading || !permissionResponse?.granted || !assetUriToSave
              }
            />
          </View>
        </View>

        {/* 에셋 정보 */}
        {assetInfo && (
          <View style={styles.section}>
            <TextBox
              variant="title3"
              color={theme.text}
              style={styles.sectionTitle}
            >
              에셋 정보
            </TextBox>
            <View
              style={[
                styles.infoBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextBox variant="body2" color={theme.text}>
                파일명: {assetInfo.filename}
              </TextBox>
              <TextBox variant="body2" color={theme.text}>
                크기: {assetInfo.width} x {assetInfo.height}
              </TextBox>
              <TextBox variant="body2" color={theme.text}>
                미디어 타입: {getMediaTypeText(assetInfo.mediaType)}
              </TextBox>
              <TextBox variant="body2" color={theme.text}>
                생성 시간: {new Date(assetInfo.creationTime).toLocaleString()}
              </TextBox>
              {assetInfo.duration > 0 && (
                <TextBox variant="body2" color={theme.text}>
                  재생 시간: {assetInfo.duration.toFixed(2)}초
                </TextBox>
              )}
              {assetInfo.location && (
                <TextBox variant="body2" color={theme.text}>
                  위치: {assetInfo.location.latitude},{' '}
                  {assetInfo.location.longitude}
                </TextBox>
              )}
              {assetInfo.localUri && (
                <TextBox variant="body2" color={theme.text}>
                  로컬 URI: {assetInfo.localUri}
                </TextBox>
              )}
              {assetInfo.orientation && (
                <TextBox variant="body2" color={theme.text}>
                  방향: {assetInfo.orientation}
                </TextBox>
              )}
            </View>
          </View>
        )}

        {/* 미디어 라이브러리 변경 리스너 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            미디어 라이브러리 변경 리스너
          </TextBox>
          <CustomButton
            title={listenerActive ? '리스너 중지' : '리스너 시작'}
            onPress={toggleListener}
            style={styles.button}
            variant={listenerActive ? 'primary' : 'ghost'}
          />
          {lastChangeEvent && (
            <View
              style={[
                styles.infoBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.codeText}
              >
                {lastChangeEvent}
              </TextBox>
            </View>
          )}
        </View>

        {/* 코드 예제 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            코드 예제
          </TextBox>
          <View
            style={[
              styles.codeBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.codeText}
            >
              {`import * as MediaLibrary from 'expo-media-library';

// 권한 확인 및 요청
const [permission, requestPermission] = MediaLibrary.usePermissions();

// 앨범 목록 가져오기
const albums = await MediaLibrary.getAlbumsAsync({
  includeSmartAlbums: true,
});

// 에셋 가져오기
const result = await MediaLibrary.getAssetsAsync({
  mediaType: MediaLibrary.MediaType.photo,
  sortBy: MediaLibrary.SortBy.creationTime,
  first: 20,
  resolveWithFullInfo: true,
});

// 에셋 정보 가져오기
const info = await MediaLibrary.getAssetInfoAsync(assetId, {
  shouldDownloadFromNetwork: true,
});

// 에셋 저장
await MediaLibrary.saveToLibraryAsync('file:///path/to/image.jpg');

// 에셋 생성
const asset = await MediaLibrary.createAssetAsync('file:///path/to/image.jpg');

// 앨범 생성 (Android에서는 에셋 필요)
const album = await MediaLibrary.createAlbumAsync('My Album', assetId);

// 에셋 삭제
await MediaLibrary.deleteAssetsAsync(assetId);

// 앨범 삭제
await MediaLibrary.deleteAlbumsAsync(albumId);

// 변경 리스너
const subscription = MediaLibrary.addListener((event) => {
  console.log('변경됨:', event);
});`}
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
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  button: {
    marginTop: 8,
  },
  smallButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 32,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  checkboxContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  albumsContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 300,
  },
  albumItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  albumItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  albumActions: {
    flexDirection: 'row',
    gap: 8,
  },
  assetsContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 400,
  },
  assetItem: {
    width: '33.33%',
    padding: 4,
  },
  assetImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 4,
  },
  assetButton: {
    marginTop: 4,
    paddingVertical: 4,
    minHeight: 28,
  },
  inputGroup: {
    gap: 8,
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
