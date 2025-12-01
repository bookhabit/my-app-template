import { useState } from 'react';
import { ScrollView, StyleSheet, View, Image, TextInput } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/context/ThemeProvider';
import MaskedView from '@react-native-masked-view/masked-view';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function MaskedViewScreen() {
  const { theme } = useTheme();

  // State
  const [maskText, setMaskText] = useState('Masked Text');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="MaskedView" showBackButton />
      <View style={styles.content}>
        {/* 기본 사용 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            기본 사용 (그라데이션 마스크)
          </TextBox>
          <View
            style={[
              styles.maskContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <MaskedView
              style={styles.maskedView}
              maskElement={
                <View style={styles.maskElement}>
                  <TextBox
                    variant="title1"
                    color="white"
                    style={styles.maskText}
                  >
                    {maskText}
                  </TextBox>
                </View>
              }
            >
              <LinearGradient
                colors={[theme.primary, theme.secondary || theme.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              />
            </MaskedView>
          </View>
        </View>

        {/* 텍스트 입력 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            마스크 텍스트 변경
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
            value={maskText}
            onChangeText={setMaskText}
            placeholder="마스크 텍스트 입력"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        {/* 이미지 마스크 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            이미지 마스크
          </TextBox>
          <View
            style={[
              styles.maskContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <MaskedView
              style={styles.maskedView}
              maskElement={
                <View style={styles.circleMask}>
                  <View style={[styles.circle, { backgroundColor: 'white' }]} />
                </View>
              }
            >
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              />
            </MaskedView>
          </View>
        </View>

        {/* 복잡한 마스크 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            복잡한 마스크 (별 모양)
          </TextBox>
          <View
            style={[
              styles.maskContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <MaskedView
              style={styles.maskedView}
              maskElement={
                <View style={styles.starMask}>
                  <TextBox variant="title1" color="white">
                    ⭐
                  </TextBox>
                </View>
              }
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FF6347']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              />
            </MaskedView>
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
              • MaskedView는 자식 요소를 마스크로 사용하여 표시합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • maskElement의 흰색 부분이 표시되고, 검은색 부분은 투명합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 그라데이션, 이미지, 텍스트 등 다양한 요소를 마스크로 사용할 수
              있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • 마스크 요소는 반드시 자식 요소보다 크거나 같아야 합니다.
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
  maskContainer: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  maskedView: {
    width: '100%',
    height: '100%',
  },
  maskElement: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  maskText: {
    textAlign: 'center',
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  circleMask: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  starMask: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
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
