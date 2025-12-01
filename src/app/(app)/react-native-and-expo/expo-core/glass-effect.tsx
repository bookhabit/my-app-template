import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Platform,
  TextInput,
} from 'react-native';

import {
  GlassView,
  GlassContainer,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function GlassEffectScreen() {
  const { theme } = useTheme();

  // State
  const [glassStyle, setGlassStyle] = useState<'clear' | 'regular'>('regular');
  const [isInteractive, setIsInteractive] = useState(false);
  const [tintColor, setTintColor] = useState('#FFFFFF');
  const [spacing, setSpacing] = useState(10);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    setAvailable(isLiquidGlassAvailable());
  }, []);

  const backgroundImage =
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="GlassEffect" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          GlassEffect
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          iOS Liquid Glass 효과
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
              GlassEffect API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • iOS 26+ 네이티브 UIVisualEffectView 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Liquid Glass 효과 렌더링
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • GlassView: 단일 glass 효과
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • GlassContainer: 여러 glass view 결합
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 지원 플랫폼: iOS 26+ (다른 플랫폼은 View로 폴백)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • isInteractive: 인터랙티브 효과 (마운트 시 한 번만 설정)
            </TextBox>
          </View>
        </View>

        {/* 사용 가능 여부 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📊 사용 가능 여부
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                플랫폼:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {Platform.OS === 'ios' ? 'iOS' : Platform.OS}
              </TextBox>
            </View>

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                사용 가능:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  available === true
                    ? theme.success
                    : available === false
                      ? theme.error
                      : theme.textSecondary
                }
              >
                {available === true
                  ? '✅ 사용 가능'
                  : available === false
                    ? '❌ 사용 불가'
                    : '확인 중...'}
              </TextBox>
            </View>

            {Platform.OS !== 'ios' && (
              <View style={styles.infoRow}>
                <TextBox variant="body4" color={theme.warning}>
                  ⚠️ iOS 전용 기능입니다. 다른 플랫폼에서는 일반 View로
                  표시됩니다.
                </TextBox>
              </View>
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
            <View style={styles.optionRow}>
              <TextBox variant="body3" color={theme.text}>
                Glass 스타일:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="Regular"
                  onPress={() => setGlassStyle('regular')}
                  variant={glassStyle === 'regular' ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="Clear"
                  onPress={() => setGlassStyle('clear')}
                  variant={glassStyle === 'clear' ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            <View style={styles.optionRow}>
              <TextBox variant="body3" color={theme.text}>
                인터랙티브:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="활성"
                  onPress={() => setIsInteractive(true)}
                  variant={isInteractive ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="비활성"
                  onPress={() => setIsInteractive(false)}
                  variant={!isInteractive ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextBox variant="body3" color={theme.textSecondary}>
                틴트 색상 (HEX):
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={tintColor}
                onChangeText={setTintColor}
                placeholder="#FFFFFF"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextBox variant="body3" color={theme.textSecondary}>
                Container 간격:
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={String(spacing)}
                onChangeText={(text) => {
                  const num = parseInt(text, 10);
                  if (!isNaN(num)) setSpacing(num);
                }}
                keyboardType="numeric"
                placeholder="10"
              />
            </View>
          </View>
        </View>

        {/* GlassView 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🪟 GlassView 예제
          </TextBox>

          <View style={styles.glassDemoContainer}>
            <Image
              source={{ uri: backgroundImage }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />

            <GlassView
              style={styles.glassView1}
              glassEffectStyle={glassStyle}
              isInteractive={isInteractive}
              tintColor={tintColor}
            >
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.glassText}
              >
                GlassView 1
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.glassText}
              >
                {glassStyle} style
              </TextBox>
            </GlassView>

            <GlassView
              style={styles.glassView2}
              glassEffectStyle="clear"
              tintColor="#FF6B6B"
            >
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.glassText}
              >
                GlassView 2
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.glassText}
              >
                Clear + Red Tint
              </TextBox>
            </GlassView>

            <GlassView
              style={styles.glassView3}
              glassEffectStyle="regular"
              tintColor="#4ECDC4"
            >
              <TextBox
                variant="body2"
                color={theme.text}
                style={styles.glassText}
              >
                GlassView 3
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.glassText}
              >
                Regular + Teal Tint
              </TextBox>
            </GlassView>
          </View>
        </View>

        {/* GlassContainer 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎨 GlassContainer 예제
          </TextBox>

          <View style={styles.containerDemoContainer}>
            <Image
              source={{ uri: backgroundImage }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />

            <GlassContainer spacing={spacing} style={styles.glassContainer}>
              <GlassView
                style={styles.containerGlass1}
                isInteractive={isInteractive}
              >
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.containerText}
                >
                  1
                </TextBox>
              </GlassView>
              <GlassView style={styles.containerGlass2}>
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.containerText}
                >
                  2
                </TextBox>
              </GlassView>
              <GlassView style={styles.containerGlass3}>
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.containerText}
                >
                  3
                </TextBox>
              </GlassView>
            </GlassContainer>
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
              {`// 1. 기본 GlassView
import { GlassView } from 'expo-glass-effect';

<GlassView style={styles.glassView}>
  <Text>Glass Content</Text>
</GlassView>

// 2. Glass 스타일 설정
<GlassView
  glassEffectStyle="regular" // 또는 "clear"
  style={styles.glassView}
/>

// 3. 인터랙티브 효과
<GlassView
  isInteractive={true}
  style={styles.glassView}
>
  {/* 주의: isInteractive는 마운트 시 한 번만 설정 가능 */}
</GlassView>

// 4. 틴트 색상
<GlassView
  tintColor="#FF6B6B"
  style={styles.glassView}
/>

// 5. GlassContainer 사용
import { GlassView, GlassContainer } from 'expo-glass-effect';

<GlassContainer spacing={10} style={styles.container}>
  <GlassView style={styles.glass1} isInteractive />
  <GlassView style={styles.glass2} />
  <GlassView style={styles.glass3} />
</GlassContainer>

// 6. 사용 가능 여부 확인
import { isLiquidGlassAvailable } from 'expo-glass-effect';

const available = isLiquidGlassAvailable();
if (available) {
  // Glass 효과 사용 가능
}

// 7. 배경 이미지와 함께 사용
<View style={styles.container}>
  <Image
    source={{ uri: 'https://example.com/image.jpg' }}
    style={StyleSheet.absoluteFill}
  />
  <GlassView style={styles.glassView}>
    <Text>Glass Overlay</Text>
  </GlassView>
</View>`}
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
              • iOS 26+ 전용 기능 (다른 플랫폼은 View로 폴백)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • isInteractive는 마운트 시 한 번만 설정 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 인터랙티브 동작 변경 시 컴포넌트 재마운트 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 접근성 설정으로 효과가 비활성화될 수 있음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 배경 이미지나 콘텐츠 위에 오버레이로 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • GlassContainer의 spacing은 glass 요소 간 상호작용 거리
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
    gap: 16,
  },
  optionRow: {
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
  inputContainer: {
    gap: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  glassDemoContainer: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    position: 'relative',
  },
  containerDemoContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    position: 'relative',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  glassView1: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 150,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  glassView2: {
    position: 'absolute',
    top: 170,
    left: 20,
    width: 150,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  glassView3: {
    position: 'absolute',
    top: 290,
    left: 20,
    width: 150,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  glassText: {
    textAlign: 'center',
    marginVertical: 2,
  },
  glassContainer: {
    position: 'absolute',
    top: 100,
    left: 50,
    width: 250,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerGlass1: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerGlass2: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerGlass3: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerText: {
    fontWeight: 'bold',
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
