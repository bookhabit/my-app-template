import { useState } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function SegmentedControlScreen() {
  const { theme } = useTheme();

  // State
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [values, setValues] = useState(['One', 'Two', 'Three']);
  const [enabled, setEnabled] = useState(true);
  const [momentary, setMomentary] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'auto'>(
    'auto'
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 20 },
      ]}
    >
      <CustomHeader title="SegmentedControl" showBackButton />
      <View style={styles.content}>
        {/* 기본 사용 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            기본 사용
          </TextBox>
          <SegmentedControl
            values={values}
            selectedIndex={selectedIndex}
            onChange={(event) => {
              setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
            }}
            enabled={enabled}
            tintColor={theme.primary}
            backgroundColor={theme.surface}
            activeFontStyle={{ color: 'white' }}
            fontStyle={{ color: theme.text }}
          />
          <View
            style={[
              styles.resultBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextBox variant="body2" color={theme.text}>
              선택된 인덱스: {selectedIndex} ({values[selectedIndex]})
            </TextBox>
          </View>
        </View>

        {/* 다양한 옵션 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            옵션
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title={enabled ? '활성화 ON' : '활성화 OFF'}
              onPress={() => setEnabled(!enabled)}
              style={[styles.button, styles.flex1]}
              variant={enabled ? 'primary' : 'ghost'}
            />
            {Platform.OS === 'ios' && (
              <CustomButton
                title={momentary ? 'Momentary ON' : 'Momentary OFF'}
                onPress={() => setMomentary(!momentary)}
                style={[styles.button, styles.flex1]}
                variant={momentary ? 'primary' : 'ghost'}
              />
            )}
          </View>
        </View>

        {/* 값 변경 */}
        <View style={styles.section}>
          <TextBox
            variant="title3"
            color={theme.text}
            style={styles.sectionTitle}
          >
            세그먼트 값 변경
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="2개 세그먼트"
              onPress={() => setValues(['First', 'Second'])}
              style={[styles.button, styles.flex1]}
              variant={values.length === 2 ? 'primary' : 'ghost'}
            />
            <CustomButton
              title="3개 세그먼트"
              onPress={() => setValues(['One', 'Two', 'Three'])}
              style={[styles.button, styles.flex1]}
              variant={values.length === 3 ? 'primary' : 'ghost'}
            />
            <CustomButton
              title="4개 세그먼트"
              onPress={() => setValues(['A', 'B', 'C', 'D'])}
              style={[styles.button, styles.flex1]}
              variant={values.length === 4 ? 'primary' : 'ghost'}
            />
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
              • iOS와 Android 모두에서 동작합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • values 배열로 세그먼트의 레이블을 설정합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • selectedIndex로 선택된 세그먼트를 제어합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • iOS: momentary 속성으로 터치 후 즉시 해제되도록 설정할 수
              있습니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • tintColor로 선택된 세그먼트의 색상을 설정합니다.
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.infoText}
            >
              • backgroundColor로 배경색을 설정합니다.
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
  resultBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
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
