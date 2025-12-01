import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

// 샘플 이미지 URL (React Native 공식 로고)
const SAMPLE_IMAGE_URL = 'https://reactnative.dev/img/tiny_logo.png';
const LARGE_IMAGE_URL =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';

export default function ImageScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, boolean>>({});
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [loadProgress, setLoadProgress] = useState<string>('');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Image 컴포넌트
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          Image 컴포넌트는 이미지를 표시하는 데 사용됩니다. 로컬 이미지와
          네트워크 이미지를 모두 지원합니다.
        </TextBox>

        {/* 기본 Image 예제 - 네트워크 이미지 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. 네트워크 이미지 (source=&#123;&#123; uri &#125;&#125;)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            ⚠️ 네트워크 이미지는 width/height 필수
          </TextBox>
          <View style={styles.exampleContainer}>
            {loading['network'] && (
              <ActivityIndicator
                size="small"
                color={theme.primary}
                style={styles.loader}
              />
            )}
            {error['network'] ? (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: theme.error + '20',
                    borderColor: theme.error,
                  },
                ]}
              >
                <TextBox variant="body4" color={theme.error}>
                  이미지 로드 실패
                </TextBox>
              </View>
            ) : (
              <Image
                source={{ uri: SAMPLE_IMAGE_URL }}
                style={[styles.networkImage, { borderColor: theme.border }]}
                onLoadStart={() => {
                  setLoading((prev) => ({ ...prev, network: true }));
                  setError((prev) => ({ ...prev, network: false }));
                }}
                onLoad={() => {
                  setLoading((prev) => ({ ...prev, network: false }));
                }}
                onError={() => {
                  setLoading((prev) => ({ ...prev, network: false }));
                  setError((prev) => ({ ...prev, network: true }));
                }}
                resizeMode="contain"
              />
            )}
          </View>
        </View>

        {/* resizeMode 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. resizeMode (이미지 크기 맞추기)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            cover, contain, stretch, repeat, center
          </TextBox>

          <View style={styles.resizeModeContainer}>
            {(['cover', 'contain', 'stretch', 'center'] as const).map(
              (mode) => (
                <View key={mode} style={styles.resizeModeItem}>
                  <TextBox
                    variant="body4"
                    color={theme.text}
                    style={styles.resizeModeLabel}
                  >
                    {mode}
                  </TextBox>
                  <View
                    style={[
                      styles.resizeModeBox,
                      { borderColor: theme.border },
                    ]}
                  >
                    <Image
                      source={{ uri: SAMPLE_IMAGE_URL }}
                      style={styles.resizeModeImage}
                      resizeMode={mode}
                    />
                  </View>
                </View>
              )
            )}
          </View>
        </View>

        {/* defaultSource 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            3. defaultSource (로딩 중 기본 이미지)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            ⚠️ Android debug에서는 무시됨
          </TextBox>
          <View style={styles.exampleContainer}>
            <Image
              source={{ uri: LARGE_IMAGE_URL }}
              defaultSource={require('@/assets/images/icon.png')}
              style={[styles.defaultSourceImage, { borderColor: theme.border }]}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* onLoad / onError / onProgress 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            4. 이벤트 핸들러 (onLoad, onError, onProgress)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            이미지 로딩 상태 감지
          </TextBox>
          <View style={styles.exampleContainer}>
            {loading['events'] && (
              <ActivityIndicator
                size="small"
                color={theme.primary}
                style={styles.loader}
              />
            )}
            <Image
              source={{ uri: LARGE_IMAGE_URL }}
              style={[styles.eventImage, { borderColor: theme.border }]}
              onLoadStart={() => {
                setLoading((prev) => ({ ...prev, events: true }));
                setLoadProgress('로딩 시작...');
              }}
              onLoad={(e) => {
                setLoading((prev) => ({ ...prev, events: false }));
                const { width, height } = e.nativeEvent.source;
                console.log('width', width);
                console.log('height', height);
                setImageSize({ width, height });
                setLoadProgress(`로드 완료! (${width}x${height})`);
              }}
              onError={(e) => {
                setLoading((prev) => ({ ...prev, events: false }));
                setLoadProgress(
                  `에러: ${e.nativeEvent.error || '이미지 로드 실패'}`
                );
              }}
              onProgress={(e) => {
                const { loaded, total } = e.nativeEvent;
                console.log('loaded', loaded);
                console.log('total', total);
                const percent =
                  total > 0 ? Math.round((loaded / total) * 100) : 0;
                setLoadProgress(`로딩 중... ${percent}%`);
              }}
              resizeMode="cover"
            />
            {loadProgress ? (
              <TextBox
                variant="body4"
                color={theme.primary}
                style={styles.progressText}
              >
                {loadProgress}
              </TextBox>
            ) : null}
            {imageSize && (
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.infoText}
              >
                이미지 크기: {imageSize.width} x {imageSize.height}
              </TextBox>
            )}
          </View>
        </View>

        {/* blurRadius 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            5. blurRadius (블러 효과)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            iOS는 blur 5 이상 추천
          </TextBox>
          <View style={styles.blurContainer}>
            <View style={styles.blurItem}>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.blurLabel}
              >
                원본
              </TextBox>
              <Image
                source={{ uri: SAMPLE_IMAGE_URL }}
                style={[styles.blurImage, { borderColor: theme.border }]}
                resizeMode="cover"
              />
            </View>
            <View style={styles.blurItem}>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.blurLabel}
              >
                blurRadius: 5
              </TextBox>
              <Image
                source={{ uri: SAMPLE_IMAGE_URL }}
                style={[styles.blurImage, { borderColor: theme.border }]}
                blurRadius={5}
                resizeMode="cover"
              />
            </View>
            <View style={styles.blurItem}>
              <TextBox
                variant="body4"
                color={theme.text}
                style={styles.blurLabel}
              >
                blurRadius: 10
              </TextBox>
              <Image
                source={{ uri: SAMPLE_IMAGE_URL }}
                style={[styles.blurImage, { borderColor: theme.border }]}
                blurRadius={10}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* tintColor 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            6. tintColor (색상 틴트)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            흰색·아이콘용 이미지에 색상 적용
          </TextBox>
          <View style={styles.tintContainer}>
            {[
              theme.primary,
              theme.secondary,
              '#FF0000',
              '#00FF00',
              '#0000FF',
            ].map((color, index) => (
              <View key={index} style={styles.tintItem}>
                <Image
                  source={require('@/assets/images/icon.png')}
                  style={[styles.tintImage, { tintColor: color }]}
                  resizeMode="contain"
                />
                <TextBox variant="caption1" color={theme.textSecondary}>
                  {color}
                </TextBox>
              </View>
            ))}
          </View>
        </View>

        {/* Image.getSize() 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            7. Image.getSize() 메서드
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            이미지 크기를 가져와서 비율 계산
          </TextBox>
          <CustomButton
            title="이미지 크기 가져오기"
            onPress={async () => {
              try {
                const size = await Image.getSize(SAMPLE_IMAGE_URL);
                Alert.alert(
                  '이미지 크기',
                  `Width: ${size.width}\nHeight: ${size.height}\n비율: ${(size.width / size.height).toFixed(2)}`
                );
              } catch (error) {
                Alert.alert('에러', '이미지 크기를 가져올 수 없습니다');
              }
            }}
            variant="outline"
            size="small"
          />
        </View>

        {/* Image.prefetch() 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            8. Image.prefetch() 메서드
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            이미지를 디스크 캐시에 미리 다운로드
          </TextBox>
          <CustomButton
            title="이미지 프리페치"
            onPress={async () => {
              try {
                await Image.prefetch(SAMPLE_IMAGE_URL);
                Alert.alert('성공', '이미지가 캐시에 저장되었습니다');
              } catch (error) {
                Alert.alert('에러', '이미지 프리페치 실패');
              }
            }}
            variant="outline"
            size="small"
          />
        </View>

        {/* 반응형 이미지 (비율 유지) 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            9. 반응형 이미지 (비율 유지)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            onLoad에서 비율 계산 후 aspectRatio 적용
          </TextBox>
          <View style={styles.responsiveContainer}>
            <Image
              source={{ uri: LARGE_IMAGE_URL }}
              style={[
                styles.responsiveImage,
                {
                  aspectRatio,
                  borderColor: theme.border,
                },
              ]}
              onLoad={(e) => {
                const { width, height } = e.nativeEvent.source;
                setAspectRatio(width / height);
              }}
              resizeMode="cover"
            />
          </View>
          {aspectRatio !== 1 && (
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              비율: {aspectRatio.toFixed(2)} (width / height)
            </TextBox>
          )}
        </View>

        {/* 로딩 상태 표시 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            10. 로딩 상태 표시 패턴
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            onLoadStart, onLoadEnd로 로딩 상태 관리
          </TextBox>
          <View style={styles.loadingContainer}>
            {loading['loading-pattern'] && (
              <View
                style={[
                  styles.loadingOverlay,
                  { backgroundColor: theme.background + 'CC' },
                ]}
              >
                <ActivityIndicator size="large" color={theme.primary} />
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.loadingText}
                >
                  이미지 로딩 중...
                </TextBox>
              </View>
            )}
            <Image
              source={{ uri: LARGE_IMAGE_URL }}
              style={[styles.loadingImage, { borderColor: theme.border }]}
              onLoadStart={() => {
                setLoading((prev) => ({ ...prev, 'loading-pattern': true }));
              }}
              onLoadEnd={() => {
                setLoading((prev) => ({ ...prev, 'loading-pattern': false }));
              }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* 다양한 크기 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            11. 다양한 크기
          </TextBox>
          <View style={styles.sizeContainer}>
            <View style={styles.sizeItem}>
              <Image
                source={{ uri: SAMPLE_IMAGE_URL }}
                style={[styles.smallImage, { borderColor: theme.border }]}
                resizeMode="cover"
              />
              <TextBox variant="caption1" color={theme.textSecondary}>
                60x60
              </TextBox>
            </View>
            <View style={styles.sizeItem}>
              <Image
                source={{ uri: SAMPLE_IMAGE_URL }}
                style={[styles.mediumImage, { borderColor: theme.border }]}
                resizeMode="cover"
              />
              <TextBox variant="caption1" color={theme.textSecondary}>
                100x100
              </TextBox>
            </View>
            <View style={styles.sizeItem}>
              <Image
                source={{ uri: SAMPLE_IMAGE_URL }}
                style={[styles.largeImage, { borderColor: theme.border }]}
                resizeMode="cover"
              />
              <TextBox variant="caption1" color={theme.textSecondary}>
                140x140
              </TextBox>
            </View>
          </View>
        </View>

        {/* 원형 Image 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            12. 원형 Image (프로필 이미지)
          </TextBox>
          <View style={styles.circleContainer}>
            <Image
              source={{ uri: SAMPLE_IMAGE_URL }}
              style={[styles.circleImage, { borderColor: theme.border }]}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* 실무 팁 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💡 실무 팁
          </TextBox>
          <View style={styles.tipsContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • 네트워크 이미지는 반드시 width/height 지정
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • Android에서 GIF/WebP 사용 시 gradle 설정 필요
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • resizeMethod: 'scale'은 고품질, 'resize'는 메모리 절약
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • 대용량 이미지는 FastImage 라이브러리 사용 권장
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • iOS는 cache 옵션으로 캐시 전략 제어 가능
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
    gap: 20,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  exampleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  placeholderBox: {
    width: 200,
    height: 150,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    marginBottom: 12,
    marginTop: 4,
  },
  networkImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
  },
  loader: {
    position: 'absolute',
    zIndex: 1,
  },
  errorBox: {
    width: 200,
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resizeModeContainer: {
    gap: 16,
  },
  resizeModeItem: {
    gap: 8,
  },
  resizeModeLabel: {
    fontWeight: '600',
  },
  resizeModeBox: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  resizeModeImage: {
    width: '100%',
    height: '100%',
  },
  defaultSourceImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
  },
  progressText: {
    marginTop: 8,
    fontWeight: '600',
  },
  infoText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  blurContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-around',
  },
  blurItem: {
    alignItems: 'center',
    gap: 8,
  },
  blurLabel: {
    fontSize: 12,
  },
  blurImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
  },
  tintContainer: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  tintItem: {
    alignItems: 'center',
    gap: 4,
  },
  tintImage: {
    width: 50,
    height: 50,
  },
  responsiveContainer: {
    width: '100%',
  },
  responsiveImage: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
  },
  loadingContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
  },
  loadingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeItem: {
    alignItems: 'center',
    gap: 8,
  },
  smallImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
  },
  mediumImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
  },
  largeImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
    borderWidth: 1,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  circleImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  tipsContainer: {
    gap: 8,
  },
  tipItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
