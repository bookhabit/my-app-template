import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

export default function PressableScreen() {
  const { theme } = useTheme();
  const [pressCount, setPressCount] = useState(0);
  const [longPressCount, setLongPressCount] = useState(0);
  const [pressInStatus, setPressInStatus] = useState<string>('');
  const [pressOutStatus, setPressOutStatus] = useState<string>('');
  const [customLongPressCount, setCustomLongPressCount] = useState(0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Pressable 컴포넌트
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          Pressable은 터치 가능한 영역을 만드는 컴포넌트입니다. Button보다 더
          유연한 스타일링이 가능합니다.
        </TextBox>

        {/* 기본 Pressable 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            기본 Pressable
          </TextBox>
          <Pressable
            style={({ pressed }) => [
              styles.pressableButton,
              {
                backgroundColor: pressed ? theme.secondary : theme.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => setPressCount((prev) => prev + 1)}
          >
            <TextBox variant="body2" color="#FFFFFF">
              눌러보세요 ({pressCount})
            </TextBox>
          </Pressable>
        </View>

        {/* Long Press 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Long Press
          </TextBox>
          <Pressable
            style={({ pressed }) => [
              styles.pressableButton,
              {
                backgroundColor: pressed ? theme.secondary : theme.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onLongPress={() => setLongPressCount((prev) => prev + 1)}
          >
            <TextBox variant="body2" color="#FFFFFF">
              길게 눌러보세요 ({longPressCount})
            </TextBox>
          </Pressable>
        </View>

        {/* 다양한 스타일 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            다양한 스타일
          </TextBox>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.outlineButton,
                {
                  borderColor: theme.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <TextBox variant="body2" color={theme.primary}>
                Outline
              </TextBox>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.roundedButton,
                {
                  backgroundColor: theme.secondary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <TextBox variant="body2" color="#FFFFFF">
                Rounded
              </TextBox>
            </Pressable>
          </View>
        </View>

        {/* 비활성화 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            비활성화 (disabled)
          </TextBox>
          <Pressable
            style={[
              styles.pressableButton,
              {
                backgroundColor: theme.border,
                opacity: 0.5,
              },
            ]}
            disabled
          >
            <TextBox variant="body2" color={theme.textSecondary}>
              비활성화된 버튼
            </TextBox>
          </Pressable>
        </View>

        {/* onPressIn / onPressOut 이벤트 흐름 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            이벤트 흐름 (onPressIn / onPressOut)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            onPressIn → onPressOut → onPress 순서로 호출
          </TextBox>
          <Pressable
            style={({ pressed }) => [
              styles.pressableButton,
              {
                backgroundColor: pressed ? theme.secondary : theme.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPressIn={() => setPressInStatus('onPressIn: 터치 시작')}
            onPressOut={() => setPressOutStatus('onPressOut: 터치 해제')}
            onPress={() => {
              setPressInStatus('');
              setPressOutStatus('');
              setPressCount((prev) => prev + 1);
            }}
          >
            <TextBox variant="body2" color="#FFFFFF">
              터치해보세요 ({pressCount})
            </TextBox>
          </Pressable>
          {pressInStatus ? (
            <TextBox
              variant="body4"
              color={theme.primary}
              style={styles.statusText}
            >
              {pressInStatus}
            </TextBox>
          ) : null}
          {pressOutStatus ? (
            <TextBox
              variant="body4"
              color={theme.secondary}
              style={styles.statusText}
            >
              {pressOutStatus}
            </TextBox>
          ) : null}
        </View>

        {/* pressRetentionOffset 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            pressRetentionOffset
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            누른 상태에서 손가락이 살짝 벗어나도 "눌린 상태" 유지
          </TextBox>
          <Pressable
            style={({ pressed }) => [
              styles.pressableButton,
              {
                backgroundColor: pressed ? theme.secondary : theme.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            pressRetentionOffset={{ top: 30, bottom: 30, left: 30, right: 30 }}
            onPress={() => Alert.alert('성공', 'pressRetentionOffset 작동')}
          >
            <TextBox variant="body2" color="#FFFFFF">
              누른 채로 살짝 이동해보세요
            </TextBox>
          </Pressable>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.infoText}
          >
            pressRetentionOffset: 30px (기본값보다 넓게 설정)
          </TextBox>
        </View>

        {/* delayLongPress 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            delayLongPress (Long Press 시간 커스터마이징)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            기본값: 500ms, delayLongPress로 변경 가능
          </TextBox>
          <Pressable
            style={({ pressed }) => [
              styles.pressableButton,
              {
                backgroundColor: pressed ? theme.secondary : theme.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            delayLongPress={1000}
            onLongPress={() => setCustomLongPressCount((prev) => prev + 1)}
          >
            <TextBox variant="body2" color="#FFFFFF">
              1초 이상 길게 누르세요 ({customLongPressCount})
            </TextBox>
          </Pressable>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.infoText}
          >
            delayLongPress: 1000ms (1초)
          </TextBox>
        </View>

        {/* hitSlop 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            hitSlop (터치 영역 확장)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            작은 버튼의 터치 영역을 확장하여 UX 개선
          </TextBox>
          <View style={styles.hitSlopContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.smallButton,
                {
                  backgroundColor: pressed ? theme.secondary : theme.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => Alert.alert('일반 버튼', '작은 터치 영역')}
            >
              <TextBox variant="body4" color="#FFFFFF">
                작은 버튼
              </TextBox>
            </Pressable>
            <Pressable
              hitSlop={20}
              style={({ pressed }) => [
                styles.smallButton,
                {
                  backgroundColor: pressed ? theme.secondary : theme.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => Alert.alert('hitSlop 적용', '확장된 터치 영역')}
            >
              <TextBox variant="body4" color="#FFFFFF">
                hitSlop: 20
              </TextBox>
            </Pressable>
          </View>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.infoText}
          >
            hitSlop이 적용된 버튼은 보이는 영역보다 넓게 터치 가능합니다
          </TextBox>
        </View>

        {/* children function 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            children function (pressed 상태 활용)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            children을 함수로 받아 pressed 상태에 따라 UI 변경
          </TextBox>
          <Pressable
            style={({ pressed }) => [
              styles.pressableButton,
              {
                backgroundColor: pressed ? theme.secondary : theme.primary,
              },
            ]}
            onPress={() => {}}
          >
            {({ pressed }) => (
              <TextBox variant="body2" color="#FFFFFF">
                {pressed ? '눌림!' : '누르세요'}
              </TextBox>
            )}
          </Pressable>
        </View>

        {/* style function 고급 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            style function 고급 활용
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            pressed 상태에 따라 복잡한 스타일 적용
          </TextBox>
          <Pressable
            style={({ pressed }) => [
              styles.advancedButton,
              {
                backgroundColor: pressed ? theme.secondary : theme.primary,
                transform: pressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
                shadowOpacity: pressed ? 0.3 : 0.5,
              },
            ]}
            onPress={() => {}}
          >
            <TextBox variant="body2" color="#FFFFFF">
              스케일 + 그림자 효과
            </TextBox>
          </Pressable>
        </View>

        {/* Android ripple 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Android Ripple 효과
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            Android에서 물결 효과 적용 (iOS에서는 무시됨)
          </TextBox>
          <Pressable
            style={({ pressed }) => [
              styles.pressableButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            android_ripple={{
              color: '#FFFFFF',
              radius: 100,
              borderless: false,
            }}
            onPress={() => {}}
          >
            <TextBox variant="body2" color="#FFFFFF">
              Ripple 효과 (Android)
            </TextBox>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.pressableButton,
              {
                backgroundColor: theme.secondary,
                opacity: pressed ? 0.9 : 1,
                marginTop: 12,
              },
            ]}
            android_ripple={{
              color: '#000000',
              borderless: true,
            }}
            onPress={() => {}}
          >
            <TextBox variant="body2" color="#FFFFFF">
              Borderless Ripple
            </TextBox>
          </Pressable>
        </View>

        {/* android_disableSound 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            android_disableSound
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            Android 시스템 클릭 소리 제거
          </TextBox>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.outlineButton,
                {
                  borderColor: theme.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => {}}
            >
              <TextBox variant="body2" color={theme.primary}>
                소리 있음
              </TextBox>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.outlineButton,
                {
                  borderColor: theme.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              android_disableSound
              onPress={() => {}}
            >
              <TextBox variant="body2" color={theme.primary}>
                소리 없음
              </TextBox>
            </Pressable>
          </View>
        </View>

        {/* 실무 패턴: 카드형 Pressable */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            실무 패턴: 카드형 Pressable
          </TextBox>
          <Pressable
            style={({ pressed }) => [
              styles.cardButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                opacity: pressed ? 0.8 : 1,
                transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
              },
            ]}
            onPress={() => {}}
          >
            <View style={styles.cardContent}>
              <TextBox variant="title5" color={theme.text}>
                카드 제목
              </TextBox>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.cardDescription}
              >
                카드 설명 텍스트가 여기에 표시됩니다
              </TextBox>
            </View>
          </Pressable>
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
              • onPressIn → onPressOut → onPress 순서로 호출됨
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • hitSlop으로 작은 버튼의 터치 영역 확장 가능
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • pressRetentionOffset으로 터치 안정성 향상
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • style과 children을 함수로 받아 pressed 상태 활용
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • android_ripple로 Android 네이티브 물결 효과 적용
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • Button보다 Pressable이 더 유연한 스타일링 가능
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
  pressableButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  outlineButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundedButton: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    marginBottom: 12,
    marginTop: 4,
  },
  statusText: {
    marginTop: 8,
    fontWeight: '600',
  },
  infoText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  hitSlopContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  smallButton: {
    width: 80,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advancedButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  cardButton: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cardContent: {
    gap: 8,
  },
  cardDescription: {
    marginTop: 4,
  },
  tipsContainer: {
    gap: 8,
  },
  tipItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
