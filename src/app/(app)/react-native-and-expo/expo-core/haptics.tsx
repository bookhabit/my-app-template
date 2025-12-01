import { useState } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';

import * as Haptics from 'expo-haptics';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function HapticsScreen() {
  const { theme } = useTheme();

  const [lastTriggered, setLastTriggered] = useState<string>('');

  const triggerHaptic = async (name: string, hapticFn: () => Promise<void>) => {
    try {
      await hapticFn();
      setLastTriggered(name);
    } catch (error: any) {
      console.error(`Haptic ${name} failed:`, error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Haptics" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Haptics
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          햅틱 피드백 (진동) 효과
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
              Haptics API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • iOS: Taptic Engine 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Android: Vibrator 또는 Haptics Engine 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 웹: Web Vibration API 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Selection: 선택 변경 피드백
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Notification: 성공/경고/오류 피드백
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Impact: 충돌 효과 (가벼움/중간/무거움/딱딱함/부드러움)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Android 전용: 다양한 햅틱 타입 지원
            </TextBox>
          </View>
        </View>

        {/* 마지막 트리거 */}
        {lastTriggered && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              ✅ 마지막 트리거
            </TextBox>
            <TextBox variant="body2" color={theme.primary}>
              {lastTriggered}
            </TextBox>
          </View>
        )}

        {/* Selection */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            👆 Selection
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            선택 변경이 등록되었을 때 사용
          </TextBox>
          <CustomButton
            title="Selection 피드백"
            onPress={() =>
              triggerHaptic('Selection', () => Haptics.selectionAsync())
            }
            style={styles.button}
          />
        </View>

        {/* Notification */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🔔 Notification
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            작업 완료/경고/오류 알림 피드백
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="Success"
              onPress={() =>
                triggerHaptic('Notification: Success', () =>
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  )
                )
              }
              variant="ghost"
              style={styles.button}
            />
            <CustomButton
              title="Warning"
              onPress={() =>
                triggerHaptic('Notification: Warning', () =>
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Warning
                  )
                )
              }
              variant="ghost"
              style={styles.button}
            />
            <CustomButton
              title="Error"
              onPress={() =>
                triggerHaptic('Notification: Error', () =>
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                  )
                )
              }
              variant="ghost"
              style={styles.button}
            />
          </View>
        </View>

        {/* Impact */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            💥 Impact
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            UI 요소 간 충돌 효과
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="Light"
              onPress={() =>
                triggerHaptic('Impact: Light', () =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                )
              }
              variant="ghost"
              style={styles.button}
            />
            <CustomButton
              title="Medium"
              onPress={() =>
                triggerHaptic('Impact: Medium', () =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                )
              }
              variant="ghost"
              style={styles.button}
            />
            <CustomButton
              title="Heavy"
              onPress={() =>
                triggerHaptic('Impact: Heavy', () =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                )
              }
              variant="ghost"
              style={styles.button}
            />
          </View>
          <View style={styles.buttonRow}>
            <CustomButton
              title="Rigid"
              onPress={() =>
                triggerHaptic('Impact: Rigid', () =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
                )
              }
              variant="ghost"
              style={styles.button}
            />
            <CustomButton
              title="Soft"
              onPress={() =>
                triggerHaptic('Impact: Soft', () =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
                )
              }
              variant="ghost"
              style={styles.button}
            />
          </View>
        </View>

        {/* Android Haptics */}
        {Platform.OS === 'android' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              🤖 Android Haptics
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              Android 전용 햅틱 타입 (VIBRATE 권한 불필요)
            </TextBox>

            <View style={styles.buttonRow}>
              <CustomButton
                title="Confirm"
                onPress={() =>
                  triggerHaptic('Android: Confirm', () =>
                    Haptics.performAndroidHapticsAsync(
                      Haptics.AndroidHaptics.Confirm
                    )
                  )
                }
                variant="ghost"
                style={styles.button}
              />
              <CustomButton
                title="Reject"
                onPress={() =>
                  triggerHaptic('Android: Reject', () =>
                    Haptics.performAndroidHapticsAsync(
                      Haptics.AndroidHaptics.Reject
                    )
                  )
                }
                variant="ghost"
                style={styles.button}
              />
            </View>

            <View style={styles.buttonRow}>
              <CustomButton
                title="Long Press"
                onPress={() =>
                  triggerHaptic('Android: Long Press', () =>
                    Haptics.performAndroidHapticsAsync(
                      Haptics.AndroidHaptics.Long_Press
                    )
                  )
                }
                variant="ghost"
                style={styles.button}
              />
              <CustomButton
                title="Keyboard Tap"
                onPress={() =>
                  triggerHaptic('Android: Keyboard Tap', () =>
                    Haptics.performAndroidHapticsAsync(
                      Haptics.AndroidHaptics.Keyboard_Tap
                    )
                  )
                }
                variant="ghost"
                style={styles.button}
              />
            </View>

            <View style={styles.buttonRow}>
              <CustomButton
                title="Toggle On"
                onPress={() =>
                  triggerHaptic('Android: Toggle On', () =>
                    Haptics.performAndroidHapticsAsync(
                      Haptics.AndroidHaptics.Toggle_On
                    )
                  )
                }
                variant="ghost"
                style={styles.button}
              />
              <CustomButton
                title="Toggle Off"
                onPress={() =>
                  triggerHaptic('Android: Toggle Off', () =>
                    Haptics.performAndroidHapticsAsync(
                      Haptics.AndroidHaptics.Toggle_Off
                    )
                  )
                }
                variant="ghost"
                style={styles.button}
              />
            </View>

            <View style={styles.buttonRow}>
              <CustomButton
                title="Drag Start"
                onPress={() =>
                  triggerHaptic('Android: Drag Start', () =>
                    Haptics.performAndroidHapticsAsync(
                      Haptics.AndroidHaptics.Drag_Start
                    )
                  )
                }
                variant="ghost"
                style={styles.button}
              />
              <CustomButton
                title="Gesture Start"
                onPress={() =>
                  triggerHaptic('Android: Gesture Start', () =>
                    Haptics.performAndroidHapticsAsync(
                      Haptics.AndroidHaptics.Gesture_Start
                    )
                  )
                }
                variant="ghost"
                style={styles.button}
              />
            </View>

            <View style={styles.buttonRow}>
              <CustomButton
                title="Segment Tick"
                onPress={() =>
                  triggerHaptic('Android: Segment Tick', () =>
                    Haptics.performAndroidHapticsAsync(
                      Haptics.AndroidHaptics.Segment_Tick
                    )
                  )
                }
                variant="ghost"
                style={styles.button}
              />
              <CustomButton
                title="Clock Tick"
                onPress={() =>
                  triggerHaptic('Android: Clock Tick', () =>
                    Haptics.performAndroidHapticsAsync(
                      Haptics.AndroidHaptics.Clock_Tick
                    )
                  )
                }
                variant="ghost"
                style={styles.button}
              />
            </View>
          </View>
        )}

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
              {`// 1. Selection 피드백
import * as Haptics from 'expo-haptics';

await Haptics.selectionAsync();

// 2. Notification 피드백
await Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Success
);
await Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Warning
);
await Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Error
);

// 3. Impact 피드백
await Haptics.impactAsync(
  Haptics.ImpactFeedbackStyle.Light
);
await Haptics.impactAsync(
  Haptics.ImpactFeedbackStyle.Medium
);
await Haptics.impactAsync(
  Haptics.ImpactFeedbackStyle.Heavy
);
await Haptics.impactAsync(
  Haptics.ImpactFeedbackStyle.Rigid
);
await Haptics.impactAsync(
  Haptics.ImpactFeedbackStyle.Soft
);

// 4. Android 전용 햅틱
if (Platform.OS === 'android') {
  await Haptics.performAndroidHapticsAsync(
    Haptics.AndroidHaptics.Confirm
  );
  await Haptics.performAndroidHapticsAsync(
    Haptics.AndroidHaptics.Reject
  );
  await Haptics.performAndroidHapticsAsync(
    Haptics.AndroidHaptics.Long_Press
  );
  await Haptics.performAndroidHapticsAsync(
    Haptics.AndroidHaptics.Keyboard_Tap
  );
  await Haptics.performAndroidHapticsAsync(
    Haptics.AndroidHaptics.Toggle_On
  );
  await Haptics.performAndroidHapticsAsync(
    Haptics.AndroidHaptics.Drag_Start
  );
  await Haptics.performAndroidHapticsAsync(
    Haptics.AndroidHaptics.Segment_Tick
  );
}

// 5. 버튼 클릭 시 사용
<Button
  title="Press Me"
  onPress={async () => {
    await Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Medium
    );
    // 버튼 액션 실행
  }}
/>

// 6. 스와이프 제스처와 함께 사용
const onSwipe = async () => {
  await Haptics.selectionAsync();
  // 스와이프 액션 실행
};

// 7. 토글 스위치와 함께 사용
const onToggle = async (value: boolean) => {
  if (Platform.OS === 'android') {
    await Haptics.performAndroidHapticsAsync(
      value
        ? Haptics.AndroidHaptics.Toggle_On
        : Haptics.AndroidHaptics.Toggle_Off
    );
  } else {
    await Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light
    );
  }
};`}
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
              • iOS: Low Power Mode 활성화 시 동작하지 않음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: 사용자가 설정에서 Taptic Engine 비활성화 시 동작 안함
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: 카메라 활성화 시 동작하지 않음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: 음성 인식 활성화 시 동작하지 않음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: VIBRATE 권한 자동 추가 (impactAsync 등)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: performAndroidHapticsAsync는 VIBRATE 권한 불필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 웹: 브라우저 및 하드웨어 지원 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 웹: 백그라운드 탭에서는 무시될 수 있음
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
  description: {
    marginBottom: 8,
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
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: 100,
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
