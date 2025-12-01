import { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

// 샘플 이미지 URL
const BACKGROUND_IMAGE_URL =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
const CARD_IMAGE_URL =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600';

export default function ImageBackgroundScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, boolean>>({});

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          ImageBackground 컴포넌트
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          ImageBackground는 배경 이미지를 사용하는 컴포넌트입니다. 여기서
          테스트해보세요.
        </TextBox>

        {/* 기본 ImageBackground 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. 기본 ImageBackground
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            ⚠️ width, height 반드시 지정 필요
          </TextBox>
          <ImageBackground
            source={{ uri: BACKGROUND_IMAGE_URL }}
            style={[styles.basicBackground, { borderColor: theme.border }]}
            imageStyle={styles.basicImageStyle}
            onLoadStart={() => {
              setLoading((prev) => ({ ...prev, basic: true }));
              setError((prev) => ({ ...prev, basic: false }));
            }}
            onLoad={() => {
              setLoading((prev) => ({ ...prev, basic: false }));
            }}
            onError={() => {
              setLoading((prev) => ({ ...prev, basic: false }));
              setError((prev) => ({ ...prev, basic: true }));
            }}
          >
            {loading['basic'] && (
              <ActivityIndicator size="small" color="#FFFFFF" />
            )}
            {error['basic'] ? (
              <TextBox variant="body2" color="#FFFFFF">
                이미지 로드 실패
              </TextBox>
            ) : (
              <TextBox
                variant="title4"
                color="#FFFFFF"
                style={styles.overlayText}
              >
                배경 이미지 위의 텍스트
              </TextBox>
            )}
          </ImageBackground>
        </View>

        {/* imageStyle 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. imageStyle (내부 Image 스타일)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            borderRadius, 그림자 등 내부 이미지에 적용
          </TextBox>
          <ImageBackground
            source={{ uri: CARD_IMAGE_URL }}
            style={[styles.imageStyleBackground, { borderColor: theme.border }]}
            imageStyle={styles.roundedImageStyle}
          >
            <View style={styles.imageStyleContent}>
              <TextBox
                variant="body2"
                color="#FFFFFF"
                style={styles.shadowText}
              >
                둥근 모서리 배경
              </TextBox>
            </View>
          </ImageBackground>
        </View>

        {/* resizeMode 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            3. resizeMode
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            cover, contain, stretch, center, repeat
          </TextBox>
          <View style={styles.resizeModeContainer}>
            {(['cover', 'contain', 'stretch'] as const).map((mode) => (
              <View key={mode} style={styles.resizeModeItem}>
                <TextBox
                  variant="body4"
                  color={theme.text}
                  style={styles.resizeModeLabel}
                >
                  {mode}
                </TextBox>
                <ImageBackground
                  source={{ uri: BACKGROUND_IMAGE_URL }}
                  style={[
                    styles.resizeModeBackground,
                    { borderColor: theme.border },
                  ]}
                  imageStyle={styles.resizeModeImageStyle}
                  resizeMode={mode}
                >
                  <TextBox variant="caption1" color="#FFFFFF">
                    {mode}
                  </TextBox>
                </ImageBackground>
              </View>
            ))}
          </View>
        </View>

        {/* blurRadius 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            4. blurRadius (블러 효과)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            배경 이미지에 블러 효과 적용
          </TextBox>
          <ImageBackground
            source={{ uri: BACKGROUND_IMAGE_URL }}
            style={[styles.blurBackground, { borderColor: theme.border }]}
            imageStyle={styles.blurImageStyle}
            blurRadius={10}
          >
            <View style={styles.blurContent}>
              <TextBox
                variant="title4"
                color="#FFFFFF"
                style={styles.shadowText}
              >
                블러 배경
              </TextBox>
              <TextBox
                variant="body3"
                color="#FFFFFF"
                style={styles.shadowText}
              >
                텍스트가 더 잘 보입니다
              </TextBox>
            </View>
          </ImageBackground>
        </View>

        {/* 이벤트 배너 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            5. 이벤트 배너 패턴
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            배경 이미지 + 오버레이 + 텍스트 + 버튼
          </TextBox>
          <ImageBackground
            source={{ uri: CARD_IMAGE_URL }}
            style={[styles.bannerBackground, { borderColor: theme.border }]}
            imageStyle={styles.bannerImageStyle}
          >
            <View style={styles.bannerOverlay}>
              <TextBox
                variant="title3"
                color="#FFFFFF"
                style={styles.shadowText}
              >
                특별 이벤트
              </TextBox>
              <TextBox
                variant="body2"
                color="#FFFFFF"
                style={[styles.shadowText, styles.bannerSubtitle]}
              >
                지금 바로 확인하세요!
              </TextBox>
              <CustomButton
                title="자세히 보기"
                onPress={() => {}}
                variant="outline"
                size="small"
                style={styles.bannerButton}
              />
            </View>
          </ImageBackground>
        </View>

        {/* 카드 UI 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            6. 카드 UI 패턴
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            이미지 배경 + 정보 오버레이
          </TextBox>
          <ImageBackground
            source={{ uri: CARD_IMAGE_URL }}
            style={[styles.cardBackground, { borderColor: theme.border }]}
            imageStyle={styles.cardImageStyle}
          >
            <View style={styles.cardOverlay}>
              <TextBox
                variant="title4"
                color="#FFFFFF"
                style={styles.shadowText}
              >
                카드 제목
              </TextBox>
              <TextBox
                variant="body3"
                color="#FFFFFF"
                style={[styles.shadowText, styles.cardDescription]}
              >
                카드 설명 텍스트가 여기에 표시됩니다
              </TextBox>
            </View>
          </ImageBackground>
        </View>

        {/* 홈 화면 배경 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            7. 홈 화면 배경 패턴
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            전체 화면 배경 + 중앙 콘텐츠
          </TextBox>
          <ImageBackground
            source={{ uri: BACKGROUND_IMAGE_URL }}
            style={[styles.homeBackground, { borderColor: theme.border }]}
            imageStyle={styles.homeImageStyle}
          >
            <View style={styles.homeContent}>
              <TextBox
                variant="title2"
                color="#FFFFFF"
                style={styles.shadowText}
              >
                Welcome
              </TextBox>
              <TextBox
                variant="body2"
                color="#FFFFFF"
                style={[styles.shadowText, styles.homeSubtitle]}
              >
                환영합니다
              </TextBox>
            </View>
          </ImageBackground>
        </View>

        {/* 커스텀 배경 패턴 (Image + View 조합) */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            8. 커스텀 배경 패턴 (Image + View)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            복잡한 효과가 필요할 때 직접 구현
          </TextBox>
          <View
            style={[styles.customBackground, { borderColor: theme.border }]}
          >
            <ImageBackground
              source={{ uri: BACKGROUND_IMAGE_URL }}
              style={StyleSheet.absoluteFill}
              imageStyle={styles.customImageStyle}
              blurRadius={5}
            />
            <View style={styles.customOverlay} />
            <View style={styles.customContent}>
              <TextBox
                variant="title4"
                color="#FFFFFF"
                style={styles.shadowText}
              >
                커스텀 배경
              </TextBox>
              <TextBox
                variant="body3"
                color="#FFFFFF"
                style={styles.shadowText}
              >
                블러 + 오버레이 효과
              </TextBox>
            </View>
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
              • width, height 반드시 지정 (배경이므로 크기 없으면 안 보임)
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • imageStyle로 내부 이미지 스타일 제어 (borderRadius, 그림자 등)
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • 복잡한 배경은 Image + View 조합으로 커스텀 구현 권장
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • 텍스트 가독성을 위해 오버레이(View with opacity) 추가 고려
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • ImageBackground는 Image의 모든 props 상속 (onLoad, onError 등)
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
  description: {
    marginBottom: 12,
    marginTop: 4,
  },
  basicBackground: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  basicImageStyle: {
    borderRadius: 12,
  },
  overlayText: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  imageStyleBackground: {
    width: '100%',
    height: 150,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  roundedImageStyle: {
    borderRadius: 20,
  },
  imageStyleContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowText: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
  resizeModeBackground: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  resizeModeImageStyle: {
    borderRadius: 8,
  },
  blurBackground: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  blurImageStyle: {
    borderRadius: 12,
  },
  blurContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bannerBackground: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  bannerImageStyle: {
    borderRadius: 12,
  },
  bannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bannerSubtitle: {
    marginTop: 8,
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardBackground: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImageStyle: {
    borderRadius: 12,
  },
  cardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardDescription: {
    marginTop: 8,
  },
  homeBackground: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  homeImageStyle: {
    borderRadius: 12,
  },
  homeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeSubtitle: {
    marginTop: 12,
  },
  customBackground: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  customImageStyle: {
    borderRadius: 12,
  },
  customOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  customContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tipsContainer: {
    gap: 8,
  },
  tipItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
