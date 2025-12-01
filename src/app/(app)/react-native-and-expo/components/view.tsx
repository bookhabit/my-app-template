import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

export default function ViewScreen() {
  const { theme } = useTheme();
  const [layoutInfo, setLayoutInfo] = useState<string>('');
  const [responderStatus, setResponderStatus] = useState<string>('');
  const [pointerEventStatus, setPointerEventStatus] = useState<string>('');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          View 컴포넌트
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          View는 React Native의 가장 기본적인 컴포넌트입니다. 모든 UI 요소의
          컨테이너 역할을 합니다.
        </TextBox>

        {/* 기본 View 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            기본 View
          </TextBox>
          <View style={styles.exampleContainer}>
            <View style={[styles.box, { backgroundColor: theme.primary }]} />
          </View>
        </View>

        {/* Flexbox 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            Flexbox 레이아웃
          </TextBox>
          <View style={styles.flexRow}>
            <View
              style={[styles.flexBox, { backgroundColor: theme.primary }]}
            />
            <View
              style={[styles.flexBox, { backgroundColor: theme.secondary }]}
            />
            <View
              style={[styles.flexBox, { backgroundColor: theme.primary }]}
            />
          </View>
        </View>

        {/* 중첩 View 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            중첩 View
          </TextBox>
          <View style={styles.nestedContainer}>
            <View
              style={[styles.nestedBox, { backgroundColor: theme.primary }]}
            >
              <View
                style={[styles.innerBox, { backgroundColor: theme.secondary }]}
              />
            </View>
          </View>
        </View>

        {/* Accessibility Props 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. Accessibility (접근성) Props
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            스크린 리더 사용자를 위한 접근성 설정
          </TextBox>

          {/* accessible & accessibilityLabel */}
          <View style={styles.exampleBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.exampleTitle}
            >
              accessible + accessibilityLabel
            </TextBox>
            <View
              accessible={true}
              accessibilityLabel="접근성 예제 버튼"
              accessibilityHint="이 버튼을 누르면 알림이 표시됩니다"
              accessibilityRole="button"
              style={[
                styles.accessibilityButton,
                { backgroundColor: theme.primary },
              ]}
              onTouchEnd={() => Alert.alert('접근성', '버튼이 눌렸습니다')}
            >
              <TextBox variant="body2" color="#FFFFFF">
                접근성 버튼 (스크린 리더로 테스트)
              </TextBox>
            </View>
          </View>

          {/* accessibilityState */}
          <View style={styles.exampleBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.exampleTitle}
            >
              accessibilityState
            </TextBox>
            <View
              accessible={true}
              accessibilityLabel="선택 가능한 항목"
              accessibilityState={{ selected: true, disabled: false }}
              style={[
                styles.stateBox,
                {
                  backgroundColor: theme.primary,
                  opacity: 0.8,
                },
              ]}
            >
              <TextBox variant="body2" color="#FFFFFF">
                선택됨 (selected: true)
              </TextBox>
            </View>
          </View>

          {/* accessibilityValue */}
          <View style={styles.exampleBox}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.exampleTitle}
            >
              accessibilityValue
            </TextBox>
            <View
              accessible={true}
              accessibilityLabel="진행률 표시기"
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: 75, text: '75%' }}
              style={[
                styles.progressContainer,
                { backgroundColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.progressBar,
                  {
                    width: '75%',
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            </View>
            <TextBox variant="body4" color={theme.textSecondary}>
              진행률: 75%
            </TextBox>
          </View>
        </View>

        {/* onLayout 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. 레이아웃 & 스타일 Props
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            onLayout: View의 크기와 위치 정보 가져오기
          </TextBox>
          <View
            onLayout={(event) => {
              const { width, height, x, y } = event.nativeEvent.layout;
              setLayoutInfo(
                `Width: ${width.toFixed(0)}, Height: ${height.toFixed(0)}, X: ${x.toFixed(0)}, Y: ${y.toFixed(0)}`
              );
            }}
            style={[styles.layoutBox, { backgroundColor: theme.primary }]}
          >
            <TextBox variant="body2" color="#FFFFFF">
              레이아웃 정보 확인
            </TextBox>
          </View>
          {layoutInfo ? (
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              {layoutInfo}
            </TextBox>
          ) : (
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              위 박스를 터치하면 레이아웃 정보가 표시됩니다
            </TextBox>
          )}
        </View>

        {/* Responder System 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            3. 터치/제스처 (Responder) Props
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            Responder System: 터치 이벤트 처리 우선순위 제어
          </TextBox>
          <View
            onStartShouldSetResponder={() => {
              setResponderStatus('터치 시작 감지');
              return true;
            }}
            onResponderGrant={() => {
              setResponderStatus('터치 권한 획득 (Grant)');
            }}
            onResponderMove={() => {
              setResponderStatus('터치 이동 중 (Move)');
            }}
            onResponderRelease={() => {
              setResponderStatus('터치 해제 (Release)');
            }}
            onResponderTerminate={() => {
              setResponderStatus('터치 종료 (Terminate)');
            }}
            style={[styles.responderBox, { backgroundColor: theme.secondary }]}
          >
            <TextBox variant="body2" color="#FFFFFF">
              터치해보세요 (Responder 이벤트)
            </TextBox>
          </View>
          {responderStatus ? (
            <TextBox
              variant="body4"
              color={theme.primary}
              style={styles.infoText}
            >
              {responderStatus}
            </TextBox>
          ) : null}
        </View>

        {/* hitSlop 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            4. 터치 범위 조정 (hitSlop)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            실제 View보다 터치 가능한 영역 확장
          </TextBox>
          <View style={styles.hitSlopContainer}>
            <View
              style={[styles.hitSlopBox, { backgroundColor: theme.border }]}
            >
              <TextBox variant="body4" color={theme.textSecondary}>
                일반 버튼 (작은 터치 영역)
              </TextBox>
            </View>
            <View
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              style={[styles.hitSlopBox, { backgroundColor: theme.primary }]}
              onTouchEnd={() =>
                Alert.alert('hitSlop', '확장된 터치 영역이 작동했습니다!')
              }
            >
              <TextBox variant="body2" color="#FFFFFF">
                hitSlop 적용 (터치 영역 확장)
              </TextBox>
            </View>
          </View>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.infoText}
          >
            hitSlop이 적용된 버튼은 보이는 영역보다 넓게 터치 가능합니다
          </TextBox>
        </View>

        {/* pointerEvents 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            5. Pointer Events
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            터치 이벤트 전파 제어
          </TextBox>
          <View style={styles.pointerContainer}>
            {/* pointerEvents: 'none' */}
            <View
              pointerEvents="none"
              style={[
                styles.pointerBox,
                {
                  backgroundColor: theme.border,
                  opacity: 0.5,
                },
              ]}
            >
              <TextBox variant="body4" color={theme.textSecondary}>
                pointerEvents: 'none'
              </TextBox>
              <TextBox variant="caption1" color={theme.textSecondary}>
                터치 불가능
              </TextBox>
            </View>

            {/* pointerEvents: 'box-none' */}
            <View
              pointerEvents="box-none"
              style={[styles.pointerBox, { backgroundColor: theme.secondary }]}
            >
              <TextBox variant="body4" color="#FFFFFF">
                pointerEvents: 'box-none'
              </TextBox>
              <TextBox variant="caption1" color="#FFFFFF">
                부모 터치 불가, 자식 터치 가능
              </TextBox>
            </View>

            {/* pointerEvents: 'box-only' */}
            <View
              pointerEvents="box-only"
              style={[styles.pointerBox, { backgroundColor: theme.primary }]}
            >
              <TextBox variant="body4" color="#FFFFFF">
                pointerEvents: 'box-only'
              </TextBox>
              <TextBox variant="caption1" color="#FFFFFF">
                부모만 터치 가능
              </TextBox>
            </View>
          </View>
        </View>

        {/* testID 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            6. 테스트용 Props (testID, nativeID)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            E2E 테스트에서 요소를 찾을 때 사용
          </TextBox>
          <View
            testID="test-view-example"
            nativeID="native-view-example"
            style={[styles.testBox, { backgroundColor: theme.primary }]}
          >
            <TextBox variant="body2" color="#FFFFFF">
              testID: "test-view-example"
            </TextBox>
            <TextBox variant="body4" color="#FFFFFF" style={styles.marginTop}>
              nativeID: "native-view-example"
            </TextBox>
          </View>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.infoText}
          >
            테스트 코드에서 이 요소를 찾을 때 사용됩니다
          </TextBox>
        </View>

        {/* collapsable 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            7. 성능 최적화 Props
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            collapsable, removeClippedSubviews 등
          </TextBox>
          <View style={styles.optimizationContainer}>
            <View
              collapsable={true}
              style={[styles.optBox, { backgroundColor: theme.secondary }]}
            >
              <TextBox variant="body3" color="#FFFFFF">
                collapsable: true
              </TextBox>
              <TextBox
                variant="caption1"
                color="#FFFFFF"
                style={styles.marginTop}
              >
                레이아웃 최적화 활성화
              </TextBox>
            </View>
            <View
              removeClippedSubviews={true}
              style={[styles.optBox, { backgroundColor: theme.primary }]}
            >
              <TextBox variant="body3" color="#FFFFFF">
                removeClippedSubviews: true
              </TextBox>
              <TextBox
                variant="caption1"
                color="#FFFFFF"
                style={styles.marginTop}
              >
                화면 밖 뷰 렌더링 최적화
              </TextBox>
            </View>
          </View>
        </View>

        {/* role 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            8. 역할 관련 Props (role)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            웹 ARIA role과 유사, accessibilityRole보다 우선 적용
          </TextBox>
          <View style={styles.roleContainer}>
            <View
              role="button"
              accessible={true}
              accessibilityLabel="역할: 버튼"
              style={[styles.roleBox, { backgroundColor: theme.primary }]}
            >
              <TextBox variant="body2" color="#FFFFFF">
                role="button"
              </TextBox>
            </View>
            <View
              role="none"
              accessible={true}
              accessibilityLabel="역할: 없음"
              style={[styles.roleBox, { backgroundColor: theme.secondary }]}
            >
              <TextBox variant="body2" color="#FFFFFF">
                role="none"
              </TextBox>
            </View>
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
    minHeight: 100,
  },
  box: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  flexRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  flexBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  nestedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  nestedBox: {
    width: 120,
    height: 120,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  description: {
    marginBottom: 12,
    marginTop: 4,
  },
  exampleBox: {
    marginBottom: 16,
    gap: 8,
  },
  exampleTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  accessibilityButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateBox: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  layoutBox: {
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  infoText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  responderBox: {
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  hitSlopContainer: {
    gap: 12,
    marginTop: 12,
  },
  hitSlopBox: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointerContainer: {
    gap: 12,
    marginTop: 12,
  },
  pointerBox: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  testBox: {
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marginTop: {
    marginTop: 8,
  },
  optimizationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  optBox: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  roleBox: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
});
