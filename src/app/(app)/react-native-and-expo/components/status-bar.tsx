import { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

export default function StatusBarScreen() {
  const { theme } = useTheme();
  const [barStyle, setBarStyle] = useState<
    'default' | 'light-content' | 'dark-content'
  >('default');
  const [hidden, setHidden] = useState(false);
  const [animated, setAnimated] = useState(true);
  const [translucent, setTranslucent] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#000000');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <StatusBar
        barStyle={barStyle}
        hidden={hidden}
        animated={animated}
        backgroundColor={
          Platform.OS === 'android' ? backgroundColor : undefined
        }
        translucent={Platform.OS === 'android' ? translucent : undefined}
      />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          StatusBar 컴포넌트
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          앱 상단의 상태 표시줄(시간, 배터리, 네트워크 등)을 제어하는
          컴포넌트/API
        </TextBox>

        {/* StatusBar란? */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            StatusBar란?
          </TextBox>
          <View style={styles.infoContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 앱 상단의 상태 표시줄(시간, 배터리, 네트워크 등)을 제어
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 컴포넌트 방식(권장)과 정적 API 방식 지원
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 여러 개의 StatusBar를 렌더링하면 나중에 렌더링된 것이 적용됨
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • iOS와 Android 동작 방식이 다름
            </TextBox>
          </View>
        </View>

        {/* barStyle 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. barStyle (텍스트/아이콘 색상)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            상태바의 텍스트와 아이콘 색상 설정
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="default"
              onPress={() => setBarStyle('default')}
              variant={barStyle === 'default' ? 'primary' : 'outline'}
              size="small"
            />
            <CustomButton
              title="light-content"
              onPress={() => setBarStyle('light-content')}
              variant={barStyle === 'light-content' ? 'primary' : 'outline'}
              size="small"
            />
            <CustomButton
              title="dark-content"
              onPress={() => setBarStyle('dark-content')}
              variant={barStyle === 'dark-content' ? 'primary' : 'outline'}
              size="small"
            />
          </View>
          <View style={styles.infoBox}>
            <TextBox variant="body4" color={theme.textSecondary}>
              • default: iOS는 dark, Android는 light
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              • light-content: 흰색 텍스트/아이콘
            </TextBox>
            <TextBox variant="body4" color={theme.textSecondary}>
              • dark-content: 검은색 텍스트/아이콘 (Android는 API {'>='} 23)
            </TextBox>
          </View>
        </View>

        {/* hidden 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. hidden (상태바 숨기기)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            상태바를 숨기거나 표시
          </TextBox>
          <CustomButton
            title={hidden ? '표시하기' : '숨기기'}
            onPress={() => setHidden(!hidden)}
            variant={hidden ? 'primary' : 'outline'}
            size="small"
            style={styles.toggleButton}
          />
        </View>

        {/* animated 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            3. animated (애니메이션)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            backgroundColor, barStyle, hidden 변경 시 애니메이션 적용 여부
          </TextBox>
          <CustomButton
            title={animated ? '애니메이션 끄기' : '애니메이션 켜기'}
            onPress={() => setAnimated(!animated)}
            variant={animated ? 'primary' : 'outline'}
            size="small"
            style={styles.toggleButton}
          />
          <View style={styles.infoBox}>
            <TextBox variant="body4" color={theme.textSecondary}>
              animated가 true일 때 barStyle을 변경해보세요
            </TextBox>
          </View>
        </View>

        {/* backgroundColor 예제 (Android) */}
        {Platform.OS === 'android' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              4. backgroundColor (Android)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              상태바 배경색 설정 (Android 전용)
            </TextBox>
            <TextBox variant="body4" color={theme.error} style={styles.warning}>
              ⚠️ Android 15(API 35)부터 deprecated, 적용 안됨
            </TextBox>
            <View style={styles.buttonRow}>
              <CustomButton
                title="검은색"
                onPress={() => setBackgroundColor('#000000')}
                variant={backgroundColor === '#000000' ? 'primary' : 'outline'}
                size="small"
              />
              <CustomButton
                title="흰색"
                onPress={() => setBackgroundColor('#FFFFFF')}
                variant={backgroundColor === '#FFFFFF' ? 'primary' : 'outline'}
                size="small"
              />
              <CustomButton
                title="파란색"
                onPress={() => setBackgroundColor('#0066FF')}
                variant={backgroundColor === '#0066FF' ? 'primary' : 'outline'}
                size="small"
              />
            </View>
          </View>
        )}

        {/* translucent 예제 (Android) */}
        {Platform.OS === 'android' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              5. translucent (Android)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              상태바를 반투명 처리하여 화면을 상태바 아래까지 그리기 가능
            </TextBox>
            <TextBox variant="body4" color={theme.error} style={styles.warning}>
              ⚠️ Android 15(API 35)부터 deprecated
            </TextBox>
            <CustomButton
              title={translucent ? '불투명' : '반투명'}
              onPress={() => setTranslucent(!translucent)}
              variant={translucent ? 'primary' : 'outline'}
              size="small"
              style={styles.toggleButton}
            />
          </View>
        )}

        {/* Static API 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            6. Static API (Imperative)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            화면 이동에 따라 빠르게 스타일 변경할 때 사용
          </TextBox>
          <TextBox variant="body4" color={theme.error} style={styles.warning}>
            ⚠️ 컴포넌트 + static API를 섞어 사용 권장하지 않음
          </TextBox>
          <View style={styles.buttonRow}>
            <CustomButton
              title="setBarStyle"
              onPress={() => {
                StatusBar.setBarStyle('light-content', true);
                Alert.alert(
                  'StatusBar',
                  'barStyle이 light-content로 변경되었습니다'
                );
              }}
              variant="outline"
              size="small"
            />
            <CustomButton
              title="setHidden"
              onPress={() => {
                StatusBar.setHidden(true, 'fade');
                setTimeout(() => {
                  StatusBar.setHidden(false, 'fade');
                }, 2000);
              }}
              variant="outline"
              size="small"
            />
            {Platform.OS === 'android' && (
              <CustomButton
                title="setBackgroundColor"
                onPress={() => {
                  StatusBar.setBackgroundColor('#FF0000', true);
                  Alert.alert(
                    'StatusBar',
                    '배경색이 빨간색으로 변경되었습니다'
                  );
                }}
                variant="outline"
                size="small"
              />
            )}
          </View>
        </View>

        {/* 실무 패턴 1: 헤더 밝은 배경 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            7. 실무 패턴: 헤더 밝은 배경
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            헤더가 밝은 배경일 때 상태바는 dark-content
          </TextBox>
          <View
            style={[
              styles.patternExample,
              { backgroundColor: '#FFFFFF', borderColor: theme.border },
            ]}
          >
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <TextBox variant="body2" color="#000000">
              밝은 배경 예제
            </TextBox>
            <TextBox variant="body4" color="#666666">
              상태바 텍스트가 검은색으로 표시됩니다
            </TextBox>
          </View>
        </View>

        {/* 실무 패턴 2: 전체 화면 이미지 배경 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            8. 실무 패턴: 전체 화면 이미지 배경
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            전체 화면 이미지 배경일 때 투명 상태바
          </TextBox>
          <View
            style={[
              styles.patternExample,
              {
                backgroundColor: '#1a1a1a',
                borderColor: theme.border,
              },
            ]}
          >
            <StatusBar
              translucent
              backgroundColor="transparent"
              barStyle="light-content"
            />
            <TextBox variant="body2" color="#FFFFFF">
              어두운 배경 예제
            </TextBox>
            <TextBox variant="body4" color="#CCCCCC">
              상태바가 투명하고 텍스트가 흰색으로 표시됩니다
            </TextBox>
          </View>
        </View>

        {/* iOS/Android 차이점 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📊 iOS/Android 차이점
          </TextBox>
          <View style={styles.tableContainer}>
            <View style={[styles.tableRow, { backgroundColor: theme.border }]}>
              <View style={styles.tableCell}>
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.tableHeader}
                >
                  기능
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.tableHeader}
                >
                  iOS
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.tableHeader}
                >
                  Android
                </TextBox>
              </View>
            </View>
            <View
              style={[styles.tableRow, { backgroundColor: theme.background }]}
            >
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  barStyle
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.primary}>
                  ✅ 지원
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  API {'>='} 23
                </TextBox>
              </View>
            </View>
            <View
              style={[styles.tableRow, { backgroundColor: theme.background }]}
            >
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  backgroundColor
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.error}>
                  ❌ 미지원
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  ✅ 지원 (API 35부터 deprecated)
                </TextBox>
              </View>
            </View>
            <View
              style={[styles.tableRow, { backgroundColor: theme.background }]}
            >
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  translucent
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.error}>
                  ❌ 미지원
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  ✅ 지원 (API 35부터 deprecated)
                </TextBox>
              </View>
            </View>
            <View
              style={[styles.tableRow, { backgroundColor: theme.background }]}
            >
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  networkActivityIndicatorVisible
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.primary}>
                  ✅ 지원
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.error}>
                  ❌ 미지원
                </TextBox>
              </View>
            </View>
          </View>
        </View>

        {/* Constants */}
        {Platform.OS === 'android' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              9. Constants
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.description}
            >
              StatusBar.currentHeight: 상태바 + 노치 포함 높이 값 (Android)
            </TextBox>
            <View style={styles.infoBox}>
              <TextBox variant="body3" color={theme.text}>
                현재 높이: {StatusBar.currentHeight || 0}px
              </TextBox>
            </View>
          </View>
        )}

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
              • 컴포넌트 방식과 static API를 섞어 사용하지 말 것
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 여러 개의 StatusBar를 렌더링하면 나중에 렌더링된 것이 적용됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android 15(API 35)부터 backgroundColor, translucent가 deprecated
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • barStyle의 dark-content는 Android API {'>='} 23에서만 지원
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
  description: {
    marginBottom: 12,
    marginTop: 4,
  },
  infoContainer: {
    gap: 8,
  },
  infoItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  toggleButton: {
    alignSelf: 'flex-start',
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  warning: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '600',
  },
  tableContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tableHeader: {
    fontWeight: '600',
  },
  patternExample: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minHeight: 100,
    justifyContent: 'center',
  },
  warningContainer: {
    gap: 8,
  },
  warningItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
