import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Platform,
  Image,
  FlatList,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

const sampleVideos = [
  {
    name: 'Big Buck Bunny',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    name: 'Elephants Dream',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
];

interface Thumbnail {
  uri: string;
  width: number;
  height: number;
  time: number;
}

export default function VideoThumbnailsScreen() {
  const { theme } = useTheme();

  // State
  const [videoUri, setVideoUri] = useState(sampleVideos[0].uri);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [loading, setLoading] = useState(false);

  // Options
  const [time, setTime] = useState('10');
  const [maxWidth, setMaxWidth] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [quality, setQuality] = useState('0.8');

  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const pickVideo = async () => {
    try {
      if (!mediaLibraryPermission?.granted) {
        const result = await requestMediaLibraryPermission();
        if (!result.granted) {
          Alert.alert('알림', '미디어 라이브러리 권한이 필요합니다.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideoUri(result.assets[0].uri);
        setThumbnails([]);
      }
    } catch (error: any) {
      Alert.alert('오류', `비디오 선택 실패: ${error.message || error}`);
    }
  };

  const generateThumbnail = async () => {
    if (!videoUri) {
      Alert.alert('알림', '비디오를 선택하세요.');
      return;
    }

    try {
      setLoading(true);
      const timeValue = parseFloat(time) || 0;

      const options: VideoThumbnails.VideoThumbnailsOptions = {
        time: timeValue * 1000, // milliseconds
        quality: parseFloat(quality) || 0.8,
      };

      const result = await VideoThumbnails.getThumbnailAsync(videoUri, options);

      setThumbnails([
        {
          uri: result.uri,
          width: result.width,
          height: result.height,
          time: timeValue,
        },
        ...thumbnails,
      ]);

      Alert.alert('성공', '썸네일이 생성되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `썸네일 생성 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const generateMultipleThumbnails = async () => {
    if (!videoUri) {
      Alert.alert('알림', '비디오를 선택하세요.');
      return;
    }

    try {
      setLoading(true);
      const times = [5, 10, 15, 20, 25].map((t) => t * 1000); // milliseconds

      const options: VideoThumbnails.VideoThumbnailsOptions = {
        quality: parseFloat(quality) || 0.8,
      };

      const results = await Promise.all(
        times.map((time) =>
          VideoThumbnails.getThumbnailAsync(videoUri, { ...options, time })
        )
      );

      const newThumbnails = results.map((result, index) => ({
        uri: result.uri,
        width: result.width,
        height: result.height,
        time: times[index] / 1000,
      }));

      setThumbnails([...newThumbnails, ...thumbnails]);
      Alert.alert(
        '성공',
        `${newThumbnails.length}개의 썸네일이 생성되었습니다.`
      );
    } catch (error: any) {
      Alert.alert('오류', `썸네일 생성 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
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
      <CustomHeader title="Video Thumbnails" showBackButton />
      <View style={styles.content}>
        {/* 비디오 선택 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            비디오 선택
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              비디오 URI
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
              value={videoUri}
              onChangeText={setVideoUri}
              placeholder="비디오 URI"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.buttonRow}>
            {sampleVideos.map((video) => (
              <CustomButton
                key={video.name}
                title={video.name}
                onPress={() => setVideoUri(video.uri)}
                style={[styles.button, styles.flex1]}
                variant={videoUri === video.uri ? 'primary' : 'ghost'}
              />
            ))}
            <CustomButton
              title="비디오 선택"
              onPress={pickVideo}
              style={[styles.button, styles.flex1]}
            />
          </View>
        </View>

        {/* 옵션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            옵션
          </TextBox>
          <View style={styles.optionsRow}>
            <View style={styles.optionItem}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                Time (초)
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
                value={time}
                onChangeText={setTime}
                placeholder="10"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.optionItem}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                Quality (0.0-1.0)
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
                value={quality}
                onChangeText={setQuality}
                placeholder="0.8"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <View style={styles.optionsRow}>
            <View style={styles.optionItem}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                Max Width (선택)
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
                value={maxWidth}
                onChangeText={setMaxWidth}
                placeholder="비워두면 원본 크기"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.optionItem}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                Max Height (선택)
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
                value={maxHeight}
                onChangeText={setMaxHeight}
                placeholder="비워두면 원본 크기"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* 썸네일 생성 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            썸네일 생성
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="단일 썸네일 생성"
              onPress={generateThumbnail}
              style={[styles.button, styles.flex1]}
              disabled={loading || !videoUri}
            />
            <CustomButton
              title="다중 썸네일 생성"
              onPress={generateMultipleThumbnails}
              style={[styles.button, styles.flex1]}
              disabled={loading || !videoUri}
              variant="ghost"
            />
          </View>
        </View>

        {/* 생성된 썸네일 */}
        {thumbnails.length > 0 && (
          <View style={styles.section}>
            <TextBox
              variant="title3"
              color={theme.text}
              style={styles.sectionTitle}
            >
              생성된 썸네일 ({thumbnails.length}개)
            </TextBox>
            <FlatList
              data={thumbnails}
              keyExtractor={(item, index) => `${item.uri}-${index}`}
              numColumns={2}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.thumbnailItem,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.thumbnailImage}
                  />
                  <TextBox
                    variant="body4"
                    color={theme.textSecondary}
                    style={styles.thumbnailInfo}
                  >
                    {item.width} × {item.height}
                  </TextBox>
                  <TextBox variant="body4" color={theme.textSecondary}>
                    {item.time.toFixed(1)}초
                  </TextBox>
                </View>
              )}
            />
            <CustomButton
              title="썸네일 목록 초기화"
              onPress={() => setThumbnails([])}
              style={styles.button}
              variant="ghost"
            />
          </View>
        )}
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
  inputGroup: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionItem: {
    flex: 1,
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    height: 100,
  },
  flex1: {
    flex: 1,
    minWidth: '30%',
  },
  button: {
    marginTop: 8,
  },
  thumbnailItem: {
    flex: 1,
    margin: 4,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 4,
    marginBottom: 8,
  },
  thumbnailInfo: {
    marginBottom: 4,
  },
});
