import { useState } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';

import { BlurView } from 'expo-blur';

import { useTheme } from '@/context/ThemeProvider';
import Slider from '@react-native-community/slider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function BlurScreen() {
  const { theme } = useTheme();
  const [intensity, setIntensity] = useState(50);
  const [selectedTint, setSelectedTint] = useState<
    'light' | 'dark' | 'default' | 'extraLight'
  >('default');

  const tintOptions: Array<{
    value: 'light' | 'dark' | 'default' | 'extraLight';
    label: string;
  }> = [
    { value: 'default', label: '기본' },
    { value: 'light', label: '밝음' },
    { value: 'dark', label: '어두움' },
    { value: 'extraLight', label: '매우 밝음' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="BlurView" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          BlurView
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          하위 콘텐츠를 블러 처리하는 React 컴포넌트
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
              BlurView (블러 뷰)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 하위 콘텐츠를 블러 처리하는 컴포넌트
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 네비게이션 바, 탭 바, 모달 등에 주로 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • intensity: 블러 강도 (1-100)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • tint: 블러 색상 톤 (light, dark, default 등)
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.warning}
              style={styles.conceptTitle}
            >
              ⚠️ 주의사항
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Android는 실험적 기능 (experimentalBlurMethod 필요)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • borderRadius 사용 시 overflow: 'hidden' 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 동적 콘텐츠는 BlurView보다 먼저 렌더링해야 함
            </TextBox>
          </View>
        </View>

        {/* 배경 콘텐츠 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎨 배경 콘텐츠
          </TextBox>

          <View style={styles.backgroundContainer}>
            {[...Array(20).keys()].map((i) => (
              <View
                key={`box-${i}`}
                style={[
                  styles.backgroundBox,
                  i % 2 === 1
                    ? { backgroundColor: theme.primary }
                    : { backgroundColor: theme.warning },
                ]}
              />
            ))}
          </View>
        </View>

        {/* 기본 BlurView 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. 기본 BlurView
          </TextBox>

          <View style={styles.blurExampleContainer}>
            <View style={styles.backgroundContainer}>
              {[...Array(12).keys()].map((i) => (
                <View
                  key={`bg-${i}`}
                  style={[
                    styles.backgroundBox,
                    i % 2 === 1
                      ? { backgroundColor: theme.primary }
                      : { backgroundColor: theme.warning },
                  ]}
                />
              ))}
            </View>
            <BlurView intensity={80} style={styles.blurView}>
              <TextBox variant="body2" color={theme.text}>
                기본 BlurView (intensity: 80)
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.blurDescription}
              >
                하위 콘텐츠가 블러 처리됩니다
              </TextBox>
            </BlurView>
          </View>
        </View>

        {/* 다양한 Tint 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. 다양한 Tint 옵션
          </TextBox>

          <View style={styles.tintExamplesContainer}>
            {tintOptions.map((option) => (
              <View key={option.value} style={styles.tintExample}>
                <View style={styles.backgroundContainer}>
                  {[...Array(8).keys()].map((i) => (
                    <View
                      key={`tint-bg-${i}`}
                      style={[
                        styles.backgroundBox,
                        i % 2 === 1
                          ? { backgroundColor: theme.primary }
                          : { backgroundColor: theme.warning },
                      ]}
                    />
                  ))}
                </View>
                <BlurView
                  intensity={70}
                  tint={option.value}
                  style={styles.blurView}
                >
                  <TextBox
                    variant="body3"
                    color={option.value === 'dark' ? '#fff' : theme.text}
                  >
                    {option.label}
                  </TextBox>
                </BlurView>
              </View>
            ))}
          </View>
        </View>

        {/* 인터랙티브 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            3. 인터랙티브 예제
          </TextBox>

          <View style={styles.interactiveContainer}>
            {/* Intensity 조절 */}
            <View style={styles.controlGroup}>
              <TextBox variant="body3" color={theme.text}>
                Intensity: {intensity}
              </TextBox>
              {Platform.OS === 'ios' ? (
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={100}
                  value={intensity}
                  onValueChange={setIntensity}
                  minimumTrackTintColor={theme.primary}
                  maximumTrackTintColor={theme.border}
                />
              ) : (
                <View style={styles.androidSliderContainer}>
                  <CustomButton
                    title="-"
                    onPress={() => setIntensity(Math.max(1, intensity - 10))}
                    variant="ghost"
                    style={styles.sliderButton}
                  />
                  <TextBox variant="body2" color={theme.text}>
                    {intensity}
                  </TextBox>
                  <CustomButton
                    title="+"
                    onPress={() => setIntensity(Math.min(100, intensity + 10))}
                    variant="ghost"
                    style={styles.sliderButton}
                  />
                </View>
              )}
            </View>

            {/* Tint 선택 */}
            <View style={styles.controlGroup}>
              <TextBox variant="body3" color={theme.text}>
                Tint:
              </TextBox>
              <View style={styles.tintButtons}>
                {tintOptions.map((option) => (
                  <CustomButton
                    key={option.value}
                    title={option.label}
                    onPress={() => setSelectedTint(option.value)}
                    variant={
                      selectedTint === option.value ? 'primary' : 'ghost'
                    }
                    style={styles.tintButton}
                  />
                ))}
              </View>
            </View>

            {/* BlurView 미리보기 */}
            <View style={styles.previewContainer}>
              <View style={styles.backgroundContainer}>
                {[...Array(15).keys()].map((i) => (
                  <View
                    key={`preview-bg-${i}`}
                    style={[
                      styles.backgroundBox,
                      i % 2 === 1
                        ? { backgroundColor: theme.primary }
                        : { backgroundColor: theme.warning },
                    ]}
                  />
                ))}
              </View>
              <BlurView
                intensity={intensity}
                tint={selectedTint}
                style={styles.previewBlurView}
              >
                <TextBox
                  variant="body2"
                  color={selectedTint === 'dark' ? '#fff' : theme.text}
                >
                  Intensity: {intensity}
                </TextBox>
                <TextBox
                  variant="body4"
                  color={selectedTint === 'dark' ? '#fff' : theme.textSecondary}
                  style={styles.blurDescription}
                >
                  Tint:{' '}
                  {tintOptions.find((o) => o.value === selectedTint)?.label}
                </TextBox>
              </BlurView>
            </View>
          </View>
        </View>

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
              {`import { BlurView } from 'expo-blur';

// 기본 사용법
<BlurView intensity={80} style={styles.blurContainer}>
  <Text>블러 처리된 콘텐츠</Text>
</BlurView>

// 다양한 Tint 옵션
<BlurView intensity={70} tint="light" style={styles.blurContainer}>
  <Text>밝은 블러</Text>
</BlurView>

<BlurView intensity={90} tint="dark" style={styles.blurContainer}>
  <Text style={{ color: '#fff' }}>어두운 블러</Text>
</BlurView>

// borderRadius 사용 (overflow: 'hidden' 필요)
<BlurView
  intensity={100}
  style={[
    styles.blurContainer,
    { borderRadius: 20, overflow: 'hidden' }
  ]}
>
  <Text>둥근 모서리 블러</Text>
</BlurView>

// Android 실험적 기능
<BlurView
  intensity={80}
  experimentalBlurMethod="dimezisBlurView"
  style={styles.blurContainer}
>
  <Text>Android 블러 (실험적)</Text>
</BlurView>

// react-native-reanimated로 애니메이션
import Animated from 'react-native-reanimated';
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

<AnimatedBlurView
  intensity={animatedIntensity}
  style={styles.blurContainer}
>
  <Text>애니메이션 블러</Text>
</AnimatedBlurView>`}
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
              • Android는 실험적 기능 (experimentalBlurMethod 필요)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • borderRadius 사용 시 overflow: 'hidden' 스타일 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 동적 콘텐츠(FlatList 등)는 BlurView보다 먼저 렌더링
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • BlurView가 먼저 렌더링되면 블러 효과가 업데이트되지 않음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 올바른 순서: {'<FlatList />'} → {'<BlurView />'}
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • intensity는 react-native-reanimated로 애니메이션 가능
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
  backgroundContainer: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundBox: {
    width: '25%',
    height: '20%',
  },
  blurExampleContainer: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    position: 'relative',
  },
  blurView: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  blurDescription: {
    marginTop: 8,
    textAlign: 'center',
  },
  tintExamplesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  tintExample: {
    width: '47%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  interactiveContainer: {
    gap: 16,
    marginTop: 12,
  },
  controlGroup: {
    gap: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  androidSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  sliderButton: {
    minWidth: 50,
  },
  tintButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tintButton: {
    flex: 1,
    minWidth: 80,
  },
  previewContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    position: 'relative',
  },
  previewBlurView: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
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
