import { useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Platform,
  Share,
} from 'react-native';

import * as MediaLibrary from 'expo-media-library';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

// Note: Requires native build - run: cd ios && pod install && cd .. && npx expo run:ios
let ViewShot: any;
try {
  ViewShot = require('react-native-view-shot').default;
} catch (e) {
  console.warn('ViewShot native module not linked');
  ViewShot = null;
}

export default function ViewShotScreen() {
  const { theme } = useTheme();

  // State
  const [captureFormat, setCaptureFormat] = useState<
    'jpg' | 'png' | 'webm' | 'raw'
  >('png');
  const [captureQuality, setCaptureQuality] = useState(1.0);
  const viewShotRef = useRef<any>(null);

  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    MediaLibrary.usePermissions();

  const captureView = async () => {
    if (!ViewShot) {
      Alert.alert(
        '알림',
        'ViewShot 네이티브 모듈이 링크되지 않았습니다. 네이티브 빌드가 필요합니다.'
      );
      return;
    }
    if (!viewShotRef.current) {
      Alert.alert('오류', 'ViewShot ref가 없습니다.');
      return;
    }

    try {
      const uri = await viewShotRef.current.capture();
      Alert.alert('성공', `캡처 완료: ${uri}`);
      return uri;
    } catch (error: any) {
      Alert.alert('오류', `캡처 실패: ${error.message || error}`);
    }
  };

  const captureAndShare = async () => {
    const uri = await captureView();
    if (uri) {
      try {
        await Share.share({
          message: 'ViewShot으로 캡처한 이미지',
          url: uri,
        });
      } catch (error: any) {
        Alert.alert('오류', `공유 실패: ${error.message || error}`);
      }
    }
  };

  const captureAndSave = async () => {
    if (!mediaLibraryPermission?.granted) {
      const result = await requestMediaLibraryPermission();
      if (!result.granted) {
        Alert.alert('알림', '미디어 라이브러리 권한이 필요합니다.');
        return;
      }
    }

    const uri = await captureView();
    if (uri) {
      try {
        await MediaLibrary.createAssetAsync(uri);
        Alert.alert('성공', '이미지가 갤러리에 저장되었습니다.');
      } catch (error: any) {
        Alert.alert('오류', `저장 실패: ${error.message || error}`);
      }
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
      <CustomHeader title="ViewShot" showBackButton />
      <View style={styles.content}>
        {/* 캡처할 뷰 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            캡처할 뷰
          </TextBox>
          {ViewShot ? (
            <ViewShot
              ref={viewShotRef}
              options={{
                format: captureFormat,
                quality: captureQuality,
              }}
              style={[
                styles.captureView,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.captureContent}>
                <TextBox
                  variant="title2"
                  color={theme.text}
                  style={styles.captureTitle}
                >
                  캡처할 내용
                </TextBox>
                <TextBox
                  variant="body2"
                  color={theme.textSecondary}
                  style={styles.captureDescription}
                >
                  이 뷰는 ViewShot으로 캡처할 수 있습니다.
                </TextBox>
                <View
                  style={[
                    styles.captureBox,
                    { backgroundColor: theme.primary, opacity: 0.2 },
                  ]}
                />
              </View>
            </ViewShot>
          ) : (
            <View
              style={[
                styles.captureView,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <TextBox variant="body2" color={theme.text}>
                ViewShot 네이티브 모듈이 링크되지 않았습니다.
              </TextBox>
              <TextBox
                variant="body3"
                color={theme.textSecondary}
                style={{ marginTop: 8 }}
              >
                네이티브 빌드가 필요합니다: cd ios && pod install
              </TextBox>
            </View>
          )}
        </View>

        {/* 캡처 옵션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            캡처 옵션
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title={captureFormat === 'png' ? 'PNG ON' : 'PNG OFF'}
              onPress={() => setCaptureFormat('png')}
              style={[styles.button, styles.flex1]}
              variant={captureFormat === 'png' ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={captureFormat === 'jpg' ? 'JPG ON' : 'JPG OFF'}
              onPress={() => setCaptureFormat('jpg')}
              style={[styles.button, styles.flex1]}
              variant={captureFormat === 'jpg' ? 'primary' : 'ghost'}
            />
          </View>
        </View>

        {/* 캡처 액션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            캡처 액션
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="캡처하기"
              onPress={captureView}
              style={[styles.button, styles.flex1]}
            />
            <CustomButton
              title="캡처 후 공유"
              onPress={captureAndShare}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
            <CustomButton
              title="캡처 후 저장"
              onPress={captureAndSave}
              style={[styles.button, styles.flex1]}
              variant="ghost"
            />
          </View>
        </View>

        {/* 참고사항 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            참고사항
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
              • ViewShot은 React Native 뷰를 이미지로 캡처합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • PNG, JPG, WebM, Raw 형식을 지원합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • quality 옵션으로 이미지 품질을 조절할 수 있습니다 (0.0-1.0).
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • capture() 메서드로 캡처를 실행합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • iOS와 Android 모두에서 동작합니다.
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
  captureView: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 20,
  },
  captureContent: {
    alignItems: 'center',
    gap: 16,
  },
  captureTitle: {
    marginBottom: 8,
  },
  captureDescription: {
    textAlign: 'center',
  },
  captureBox: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flex1: {
    flex: 1,
    minWidth: '30%',
  },
  button: {
    marginTop: 8,
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
});
