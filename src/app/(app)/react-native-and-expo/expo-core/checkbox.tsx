import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import Checkbox from 'expo-checkbox';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function CheckboxScreen() {
  const { theme } = useTheme();

  // Basic checkbox states
  const [basicChecked, setBasicChecked] = useState(false);
  const [customColorChecked, setCustomColorChecked] = useState(false);
  const [disabledChecked, setDisabledChecked] = useState(false);

  // Multiple checkboxes
  const [checkboxes, setCheckboxes] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
  });

  // Controlled checkbox
  const [controlledChecked, setControlledChecked] = useState(false);

  const handleCheckboxChange = (key: string) => {
    setCheckboxes((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const selectAll = () => {
    setCheckboxes({
      option1: true,
      option2: true,
      option3: true,
      option4: true,
    });
  };

  const deselectAll = () => {
    setCheckboxes({
      option1: false,
      option2: false,
      option3: false,
      option4: false,
    });
  };

  const getSelectedCount = () => {
    return Object.values(checkboxes).filter(Boolean).length;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Checkbox" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Checkbox
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          기본 체크박스 컴포넌트
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
              Checkbox Component
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 모든 플랫폼에서 사용 가능한 기본 체크박스 컴포넌트
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • boolean 값을 입력받는 UI 요소
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • value, onValueChange props로 제어
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • color prop으로 색상 커스터마이징 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • disabled prop으로 비활성화 가능
            </TextBox>
          </View>
        </View>

        {/* 기본 체크박스 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ✅ 기본 체크박스
          </TextBox>

          <View style={styles.checkboxRow}>
            <Checkbox
              value={basicChecked}
              onValueChange={setBasicChecked}
              style={styles.checkbox}
            />
            <TextBox variant="body3" color={theme.text}>
              기본 체크박스 (현재: {basicChecked ? '체크됨' : '체크 안됨'})
            </TextBox>
          </View>
        </View>

        {/* 커스텀 색상 체크박스 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎨 커스텀 색상 체크박스
          </TextBox>

          <View style={styles.checkboxRow}>
            <Checkbox
              value={customColorChecked}
              onValueChange={setCustomColorChecked}
              color={customColorChecked ? theme.primary : undefined}
              style={styles.checkbox}
            />
            <TextBox variant="body3" color={theme.text}>
              커스텀 색상 체크박스
            </TextBox>
          </View>

          <View style={styles.colorExamples}>
            <View style={styles.checkboxRow}>
              <Checkbox
                value={true}
                color="#FF6B6B"
                style={styles.checkbox}
                disabled
              />
              <TextBox variant="body4" color={theme.textSecondary}>
                빨간색 (#FF6B6B)
              </TextBox>
            </View>
            <View style={styles.checkboxRow}>
              <Checkbox
                value={true}
                color="#4ECDC4"
                style={styles.checkbox}
                disabled
              />
              <TextBox variant="body4" color={theme.textSecondary}>
                청록색 (#4ECDC4)
              </TextBox>
            </View>
            <View style={styles.checkboxRow}>
              <Checkbox
                value={true}
                color="#FFE66D"
                style={styles.checkbox}
                disabled
              />
              <TextBox variant="body4" color={theme.textSecondary}>
                노란색 (#FFE66D)
              </TextBox>
            </View>
            <View style={styles.checkboxRow}>
              <Checkbox
                value={true}
                color={theme.primary}
                style={styles.checkbox}
                disabled
              />
              <TextBox variant="body4" color={theme.textSecondary}>
                테마 색상
              </TextBox>
            </View>
          </View>
        </View>

        {/* 비활성화 체크박스 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🚫 비활성화 체크박스
          </TextBox>

          <View style={styles.checkboxRow}>
            <Checkbox
              value={disabledChecked}
              onValueChange={setDisabledChecked}
              disabled
              style={styles.checkbox}
            />
            <TextBox variant="body3" color={theme.textSecondary}>
              비활성화된 체크박스 (클릭 불가)
            </TextBox>
          </View>

          <View style={styles.checkboxRow}>
            <Checkbox value={true} disabled style={styles.checkbox} />
            <TextBox variant="body3" color={theme.textSecondary}>
              비활성화 + 체크됨
            </TextBox>
          </View>

          <View style={styles.checkboxRow}>
            <Checkbox value={false} disabled style={styles.checkbox} />
            <TextBox variant="body3" color={theme.textSecondary}>
              비활성화 + 체크 안됨
            </TextBox>
          </View>
        </View>

        {/* 여러 체크박스 그룹 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📋 여러 체크박스 그룹
          </TextBox>

          <View style={styles.checkboxGroup}>
            <View style={styles.checkboxRow}>
              <Checkbox
                value={checkboxes.option1}
                onValueChange={() => handleCheckboxChange('option1')}
                color={theme.primary}
                style={styles.checkbox}
              />
              <TextBox variant="body3" color={theme.text}>
                옵션 1
              </TextBox>
            </View>

            <View style={styles.checkboxRow}>
              <Checkbox
                value={checkboxes.option2}
                onValueChange={() => handleCheckboxChange('option2')}
                color={theme.primary}
                style={styles.checkbox}
              />
              <TextBox variant="body3" color={theme.text}>
                옵션 2
              </TextBox>
            </View>

            <View style={styles.checkboxRow}>
              <Checkbox
                value={checkboxes.option3}
                onValueChange={() => handleCheckboxChange('option3')}
                color={theme.primary}
                style={styles.checkbox}
              />
              <TextBox variant="body3" color={theme.text}>
                옵션 3
              </TextBox>
            </View>

            <View style={styles.checkboxRow}>
              <Checkbox
                value={checkboxes.option4}
                onValueChange={() => handleCheckboxChange('option4')}
                color={theme.primary}
                style={styles.checkbox}
              />
              <TextBox variant="body3" color={theme.text}>
                옵션 4
              </TextBox>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="전체 선택"
              onPress={selectAll}
              style={styles.button}
            />
            <CustomButton
              title="전체 해제"
              onPress={deselectAll}
              variant="ghost"
              style={styles.button}
            />
          </View>

          <View style={styles.infoContainer}>
            <TextBox variant="body3" color={theme.text}>
              선택된 항목: {getSelectedCount()} / 4
            </TextBox>
          </View>
        </View>

        {/* 제어된 체크박스 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎮 제어된 체크박스
          </TextBox>

          <View style={styles.checkboxRow}>
            <Checkbox
              value={controlledChecked}
              onValueChange={setControlledChecked}
              color={theme.primary}
              style={styles.checkbox}
            />
            <TextBox variant="body3" color={theme.text}>
              외부에서 제어되는 체크박스
            </TextBox>
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="체크"
              onPress={() => setControlledChecked(true)}
              style={styles.button}
              disabled={controlledChecked}
            />
            <CustomButton
              title="체크 해제"
              onPress={() => setControlledChecked(false)}
              variant="ghost"
              style={styles.button}
              disabled={!controlledChecked}
            />
          </View>

          <View style={styles.infoContainer}>
            <TextBox variant="body3" color={theme.text}>
              현재 상태: {controlledChecked ? '체크됨 ✅' : '체크 안됨 ❌'}
            </TextBox>
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
              {`// 1. 기본 체크박스
import { Checkbox } from 'expo-checkbox';
import { useState } from 'react';

const [isChecked, setChecked] = useState(false);

<Checkbox
  value={isChecked}
  onValueChange={setChecked}
/>

// 2. 커스텀 색상
<Checkbox
  value={isChecked}
  onValueChange={setChecked}
  color={isChecked ? '#4630EB' : undefined}
/>

// 3. 비활성화
<Checkbox
  value={isChecked}
  onValueChange={setChecked}
  disabled
/>

// 4. 여러 체크박스 관리
const [checkboxes, setCheckboxes] = useState({
  option1: false,
  option2: false,
  option3: false,
});

const handleChange = (key: string) => {
  setCheckboxes(prev => ({
    ...prev,
    [key]: !prev[key],
  }));
};

<Checkbox
  value={checkboxes.option1}
  onValueChange={() => handleChange('option1')}
/>

// 5. onChange 이벤트 사용
<Checkbox
  value={isChecked}
  onValueChange={setChecked}
  onChange={(event) => {
    console.log('Checkbox changed:', event.nativeEvent.value);
  }}
/>`}
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
              • value와 onValueChange를 함께 사용하여 제어 컴포넌트로 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • color prop은 체크된 상태일 때만 적용됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • disabled 상태에서는 불투명하게 표시되고 클릭 불가
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 모든 플랫폼(iOS, Android, Web)에서 동일하게 동작
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • onChange와 onValueChange 중 하나만 사용 권장
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    margin: 0,
  },
  checkboxGroup: {
    gap: 8,
    marginTop: 8,
  },
  colorExamples: {
    marginTop: 12,
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  infoContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
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
