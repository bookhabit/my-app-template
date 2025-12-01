import { useState } from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

// Note: Requires native build - run: cd ios && pod install && cd .. && npx expo run:ios
let SkiaComponents: any = null;
try {
  SkiaComponents = require('@shopify/react-native-skia');
} catch (e) {
  console.warn('React Native Skia native module not linked');
}
const { Canvas, Circle, Rect, Path, LinearGradient, vec } =
  SkiaComponents || {};

const { width } = Dimensions.get('window');
const canvasSize = width - 40;

export default function SkiaScreen() {
  const { theme } = useTheme();

  // State
  const [circleX, setCircleX] = useState(canvasSize / 2);
  const [circleY, setCircleY] = useState(canvasSize / 2);
  const [circleRadius, setCircleRadius] = useState(50);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="React Native Skia" showBackButton />
      <View style={styles.content}>
        {/* 기본 도형 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            기본 도형
          </TextBox>
          <View
            style={[
              styles.canvasContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {Canvas ? (
              <Canvas style={styles.canvas}>
                {/* 원 */}
                <Circle
                  cx={circleX}
                  cy={circleY}
                  r={circleRadius}
                  color={theme.primary}
                />
                {/* 사각형 */}
                <Rect
                  x={20}
                  y={20}
                  width={100}
                  height={100}
                  color={theme.secondary || theme.primary}
                />
                {/* 그라데이션 원 */}
                <Circle cx={canvasSize - 100} cy={100} r={50}>
                  <LinearGradient
                    start={vec(0, 0)}
                    end={vec(100, 100)}
                    colors={[theme.primary, theme.secondary || theme.primary]}
                  />
                </Circle>
              </Canvas>
            ) : (
              <View
                style={[
                  styles.canvas,
                  { justifyContent: 'center', alignItems: 'center' },
                ]}
              >
                <TextBox variant="body2" color={theme.text}>
                  React Native Skia 네이티브 모듈이 링크되지 않았습니다.
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
        </View>

        {/* 경로 그리기 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            경로 그리기
          </TextBox>
          <View
            style={[
              styles.canvasContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {Canvas ? (
              <Canvas style={styles.canvas}>
                <Path
                  path="M 50 50 L 150 50 L 100 150 Z"
                  color={theme.primary}
                  style="fill"
                />
                <Path
                  path="M 200 50 Q 250 100 300 50"
                  color={theme.secondary || theme.primary}
                  style="stroke"
                  strokeWidth={3}
                />
              </Canvas>
            ) : (
              <View
                style={[
                  styles.canvas,
                  { justifyContent: 'center', alignItems: 'center' },
                ]}
              >
                <TextBox variant="body2" color={theme.text}>
                  React Native Skia 네이티브 모듈이 링크되지 않았습니다.
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
              • React Native Skia는 고성능 2D 그래픽 라이브러리입니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Canvas 컴포넌트로 그래픽을 그릴 수 있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • Circle, Rect, Path 등 다양한 도형을 지원합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • LinearGradient, RadialGradient 등 그라데이션을 지원합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 애니메이션, 이미지 처리, 텍스트 렌더링 등 다양한 기능을
              제공합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 60fps의 부드러운 애니메이션을 제공합니다.
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
  canvasContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: canvasSize - 40,
    height: canvasSize - 40,
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
