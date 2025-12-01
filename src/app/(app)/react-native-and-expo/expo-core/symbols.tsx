import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Platform,
} from 'react-native';

import { SymbolView, SFSymbol } from 'expo-symbols';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

const sampleSymbols: SFSymbol[] = [
  'house.fill',
  'heart.fill',
  'star.fill',
  'bell.fill',
  'person.fill',
  'gear',
  'camera.fill',
  'music.note',
  'book.fill',
  'airpods.chargingcase',
  'car.fill',
  'gamecontroller.fill',
];

export default function SymbolsScreen() {
  const { theme } = useTheme();

  // State
  const [symbolName, setSymbolName] = useState<SFSymbol>('house.fill');
  const [size, setSize] = useState('35');
  const [tintColor, setTintColor] = useState('#007AFF');
  const [type, setType] = useState<
    'monochrome' | 'hierarchical' | 'palette' | 'multicolor'
  >('monochrome');
  const [scale, setScale] = useState<
    'default' | 'unspecified' | 'small' | 'medium' | 'large'
  >('unspecified');
  const [weight, setWeight] = useState<
    | 'unspecified'
    | 'ultraLight'
    | 'thin'
    | 'light'
    | 'regular'
    | 'medium'
    | 'semibold'
    | 'bold'
    | 'heavy'
    | 'black'
  >('unspecified');
  const [resizeMode, setResizeMode] = useState<
    | 'scaleToFill'
    | 'scaleAspectFit'
    | 'scaleAspectFill'
    | 'redraw'
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
  >('scaleAspectFit');

  // Animation
  const [animationType, setAnimationType] = useState<
    'bounce' | 'pulse' | 'scale' | null
  >(null);
  const [animationDirection, setAnimationDirection] = useState<
    'up' | 'down' | null
  >(null);
  const [animationSpeed, setAnimationSpeed] = useState('1.0');
  const [animationRepeating, setAnimationRepeating] = useState(false);
  const [animationRepeatCount, setAnimationRepeatCount] = useState('');
  const [wholeSymbol, setWholeSymbol] = useState(false);

  // Variable Animation
  const [variableCumulative, setVariableCumulative] = useState(false);
  const [variableIterative, setVariableIterative] = useState(false);
  const [variableDimInactive, setVariableDimInactive] = useState(false);
  const [variableHideInactive, setVariableHideInactive] = useState(false);
  const [variableReversing, setVariableReversing] = useState(false);
  const [variableNonReversing, setVariableNonReversing] = useState(false);

  // Palette colors
  const [paletteColor1, setPaletteColor1] = useState('#FF0000');
  const [paletteColor2, setPaletteColor2] = useState('#00FF00');
  const [paletteColor3, setPaletteColor3] = useState('#0000FF');

  const getAnimationSpec = () => {
    if (!animationType) return undefined;

    const spec: any = {
      effect: {
        type: animationType,
        wholeSymbol,
      },
      speed: parseFloat(animationSpeed) || 1.0,
      repeating: animationRepeating,
    };

    if (animationDirection) {
      spec.effect.direction = animationDirection;
    }

    if (animationRepeatCount) {
      spec.repeatCount = parseInt(animationRepeatCount) || undefined;
    }

    const variableSpec: any = {};
    if (variableCumulative) variableSpec.cumulative = true;
    if (variableIterative) variableSpec.iterative = true;
    if (variableDimInactive) variableSpec.dimInactiveLayers = true;
    if (variableHideInactive) variableSpec.hideInactiveLayers = true;
    if (variableReversing) variableSpec.reversing = true;
    if (variableNonReversing) variableSpec.nonReversing = true;

    if (Object.keys(variableSpec).length > 0) {
      spec.variableAnimationSpec = variableSpec;
    }

    return spec;
  };

  const getColors = () => {
    if (type === 'palette') {
      return [paletteColor1, paletteColor2, paletteColor3].filter((c) => c);
    }
    return undefined;
  };

  if (Platform.OS !== 'ios') {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: 20 },
        ]}
      >
        <CustomHeader title="Symbols" showBackButton />
        <View style={styles.content}>
          <View
            style={[
              styles.infoBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              SF Symbols는 iOS 전용 기능입니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.marginTop}
            >
              Android와 Web에서는 fallback이 표시됩니다.
            </TextBox>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="Symbols" showBackButton />
      <View style={styles.content}>
        {/* 프리뷰 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            프리뷰
          </TextBox>
          <View
            style={[
              styles.previewBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <SymbolView
              name={symbolName}
              size={parseInt(size) || 35}
              tintColor={tintColor}
              type={type}
              scale={scale}
              weight={weight}
              resizeMode={resizeMode}
              colors={getColors()}
              animationSpec={getAnimationSpec()}
              fallback={
                <View
                  style={[styles.fallback, { backgroundColor: theme.border }]}
                />
              }
            />
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.marginTop}
            >
              {symbolName}
            </TextBox>
          </View>
        </View>

        {/* 심볼 선택 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            심볼 선택
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              심볼 이름
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
              value={symbolName}
              onChangeText={(text) => setSymbolName(text as SFSymbol)}
              placeholder="house.fill"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.symbolGrid}>
            {sampleSymbols.map((symbol) => (
              <CustomButton
                key={symbol}
                title={symbol}
                onPress={() => setSymbolName(symbol)}
                style={styles.symbolButton}
                variant={symbolName === symbol ? 'primary' : 'ghost'}
              />
            ))}
          </View>
        </View>

        {/* 기본 옵션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            기본 옵션
          </TextBox>
          <View style={styles.optionsRow}>
            <View style={styles.optionItem}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                Size
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
                value={size}
                onChangeText={setSize}
                placeholder="35"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.optionItem}>
              <TextBox variant="body2" color={theme.text} style={styles.label}>
                Tint Color
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
                value={tintColor}
                onChangeText={setTintColor}
                placeholder="#007AFF"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              Type
            </TextBox>
            <View style={styles.buttonRow}>
              {(
                ['monochrome', 'hierarchical', 'palette', 'multicolor'] as const
              ).map((t) => (
                <CustomButton
                  key={t}
                  title={t}
                  onPress={() => setType(t)}
                  style={[styles.button, styles.flex1]}
                  variant={type === t ? 'primary' : 'ghost'}
                />
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              Scale
            </TextBox>
            <View style={styles.buttonRow}>
              {(
                ['unspecified', 'default', 'small', 'medium', 'large'] as const
              ).map((s) => (
                <CustomButton
                  key={s}
                  title={s}
                  onPress={() => setScale(s)}
                  style={[styles.button, styles.flex1]}
                  variant={scale === s ? 'primary' : 'ghost'}
                />
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              Weight
            </TextBox>
            <View style={styles.buttonRow}>
              {(
                [
                  'unspecified',
                  'ultraLight',
                  'thin',
                  'light',
                  'regular',
                  'medium',
                  'semibold',
                  'bold',
                  'heavy',
                  'black',
                ] as const
              ).map((w) => (
                <CustomButton
                  key={w}
                  title={w}
                  onPress={() => setWeight(w)}
                  style={[styles.button, styles.flex1]}
                  variant={weight === w ? 'primary' : 'ghost'}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Palette Colors */}
        {type === 'palette' && (
          <View style={styles.section}>
            <TextBox
              variant="title3"
              color={theme.text}
              style={styles.sectionTitle}
            >
              Palette Colors
            </TextBox>
            <View style={styles.optionsRow}>
              <View style={styles.optionItem}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  Color 1
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
                  value={paletteColor1}
                  onChangeText={setPaletteColor1}
                  placeholder="#FF0000"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.optionItem}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  Color 2
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
                  value={paletteColor2}
                  onChangeText={setPaletteColor2}
                  placeholder="#00FF00"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.optionItem}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  Color 3
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
                  value={paletteColor3}
                  onChangeText={setPaletteColor3}
                  placeholder="#0000FF"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            </View>
          </View>
        )}

        {/* 애니메이션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            애니메이션
          </TextBox>
          <View style={styles.inputGroup}>
            <TextBox variant="body2" color={theme.text} style={styles.label}>
              Animation Type
            </TextBox>
            <View style={styles.buttonRow}>
              <CustomButton
                title="없음"
                onPress={() => setAnimationType(null)}
                style={[styles.button, styles.flex1]}
                variant={animationType === null ? 'primary' : 'ghost'}
              />
              {(['bounce', 'pulse', 'scale'] as const).map((at) => (
                <CustomButton
                  key={at}
                  title={at}
                  onPress={() => setAnimationType(at)}
                  style={[styles.button, styles.flex1]}
                  variant={animationType === at ? 'primary' : 'ghost'}
                />
              ))}
            </View>
          </View>
          {animationType && (
            <>
              <View style={styles.inputGroup}>
                <TextBox
                  variant="body2"
                  color={theme.text}
                  style={styles.label}
                >
                  Direction
                </TextBox>
                <View style={styles.buttonRow}>
                  <CustomButton
                    title="없음"
                    onPress={() => setAnimationDirection(null)}
                    style={[styles.button, styles.flex1]}
                    variant={animationDirection === null ? 'primary' : 'ghost'}
                  />
                  {(['up', 'down'] as const).map((d) => (
                    <CustomButton
                      key={d}
                      title={d}
                      onPress={() => setAnimationDirection(d)}
                      style={[styles.button, styles.flex1]}
                      variant={animationDirection === d ? 'primary' : 'ghost'}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.optionsRow}>
                <View style={styles.optionItem}>
                  <TextBox
                    variant="body2"
                    color={theme.text}
                    style={styles.label}
                  >
                    Speed
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
                    value={animationSpeed}
                    onChangeText={setAnimationSpeed}
                    placeholder="1.0"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.optionItem}>
                  <TextBox
                    variant="body2"
                    color={theme.text}
                    style={styles.label}
                  >
                    Repeat Count
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
                    value={animationRepeatCount}
                    onChangeText={setAnimationRepeatCount}
                    placeholder="무한"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View
                style={[
                  styles.checkboxContainer,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <CustomButton
                  title={animationRepeating ? '반복 활성화' : '반복 비활성화'}
                  onPress={() => setAnimationRepeating(!animationRepeating)}
                  style={styles.button}
                  variant={animationRepeating ? 'primary' : 'ghost'}
                />
                <CustomButton
                  title={
                    wholeSymbol ? '전체 심볼 애니메이션' : '레이어별 애니메이션'
                  }
                  onPress={() => setWholeSymbol(!wholeSymbol)}
                  style={styles.button}
                  variant={wholeSymbol ? 'primary' : 'ghost'}
                />
              </View>
            </>
          )}
        </View>

        {/* Variable Animation */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Variable Animation
          </TextBox>
          <View
            style={[
              styles.checkboxContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <CustomButton
              title={
                variableCumulative ? 'Cumulative 활성화' : 'Cumulative 비활성화'
              }
              onPress={() => {
                setVariableCumulative(!variableCumulative);
                if (!variableCumulative) setVariableIterative(false);
              }}
              style={styles.button}
              variant={variableCumulative ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={
                variableIterative ? 'Iterative 활성화' : 'Iterative 비활성화'
              }
              onPress={() => {
                setVariableIterative(!variableIterative);
                if (!variableIterative) setVariableCumulative(false);
              }}
              style={styles.button}
              variant={variableIterative ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={
                variableDimInactive
                  ? 'Dim Inactive 활성화'
                  : 'Dim Inactive 비활성화'
              }
              onPress={() => setVariableDimInactive(!variableDimInactive)}
              style={styles.button}
              variant={variableDimInactive ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={
                variableHideInactive
                  ? 'Hide Inactive 활성화'
                  : 'Hide Inactive 비활성화'
              }
              onPress={() => setVariableHideInactive(!variableHideInactive)}
              style={styles.button}
              variant={variableHideInactive ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={
                variableReversing ? 'Reversing 활성화' : 'Reversing 비활성화'
              }
              onPress={() => {
                setVariableReversing(!variableReversing);
                if (!variableReversing) setVariableNonReversing(false);
              }}
              style={styles.button}
              variant={variableReversing ? 'primary' : 'ghost'}
            />
            <CustomButton
              title={
                variableNonReversing
                  ? 'Non-Reversing 활성화'
                  : 'Non-Reversing 비활성화'
              }
              onPress={() => {
                setVariableNonReversing(!variableNonReversing);
                if (!variableNonReversing) setVariableReversing(false);
              }}
              style={styles.button}
              variant={variableNonReversing ? 'primary' : 'ghost'}
            />
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
  previewBox: {
    padding: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  marginTop: {
    marginTop: 16,
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
  symbolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symbolButton: {
    flex: 1,
    minWidth: '30%',
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
  },
  flex1: {
    flex: 1,
    minWidth: '30%',
  },
  button: {
    marginTop: 8,
  },
  checkboxContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  fallback: {
    width: 35,
    height: 35,
    borderRadius: 4,
  },
});
