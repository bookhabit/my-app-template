import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';

export default function KeyboardAvoidingViewScreen() {
  const { theme } = useTheme();
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [text3, setText3] = useState('');
  const [text4, setText4] = useState('');
  const [text5, setText5] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [selectedBehavior, setSelectedBehavior] = useState<
    'height' | 'position' | 'padding'
  >('padding');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          KeyboardAvoidingView 컴포넌트
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          키보드가 나타날 때 View의 위치나 높이를 자동으로 조절하여 입력창이
          키보드에 가려지지 않도록 해주는 컴포넌트입니다.
        </TextBox>

        {/* KeyboardAvoidingView란? */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            KeyboardAvoidingView란?
          </TextBox>
          <View style={styles.infoContainer}>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 키보드가 나타날 때 View의 위치나 높이를 자동으로 조절
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 입력창이 키보드에 가려지지 않도록 해줌
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • iOS / Android 동작 방식 다름 → behavior 설정 필수
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.infoItem}>
              • 주로 TextInput이 하단에 있는 화면에서 사용
            </TextBox>
          </View>
        </View>

        {/* behavior 비교 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. behavior 비교
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            키보드 등장 시 View가 어떻게 움직일지 결정
          </TextBox>

          <View style={styles.buttonRow}>
            <CustomButton
              title="height"
              onPress={() => setSelectedBehavior('height')}
              variant={selectedBehavior === 'height' ? 'primary' : 'outline'}
              size="small"
            />
            <CustomButton
              title="position"
              onPress={() => setSelectedBehavior('position')}
              variant={selectedBehavior === 'position' ? 'primary' : 'outline'}
              size="small"
            />
            <CustomButton
              title="padding"
              onPress={() => setSelectedBehavior('padding')}
              variant={selectedBehavior === 'padding' ? 'primary' : 'outline'}
              size="small"
            />
          </View>

          <View style={styles.behaviorInfo}>
            <TextBox
              variant="body3"
              color={theme.text}
              style={styles.infoTitle}
            >
              {selectedBehavior === 'height' &&
                'height: 키보드 높이만큼 View 높이를 줄임'}
              {selectedBehavior === 'position' &&
                'position: View를 위로 이동시켜 위치 조정'}
              {selectedBehavior === 'padding' &&
                'padding: View의 bottom padding을 키보드 높이만큼 추가'}
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.recommendation}
            >
              권장: iOS → padding, Android → height
            </TextBox>
          </View>

          <KeyboardAvoidingView
            behavior={selectedBehavior}
            style={[
              styles.kavContainer,
              { backgroundColor: theme.background + '80' },
            ]}
            contentContainerStyle={
              selectedBehavior === 'position'
                ? styles.positionContent
                : undefined
            }
          >
            <View style={styles.testArea}>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.testLabel}
              >
                테스트 영역 (아래 입력창을 눌러보세요)
              </TextBox>
              <View style={styles.spacer} />
              <TextInput
                style={[
                  styles.testInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="입력창을 눌러 키보드 테스트"
                placeholderTextColor={theme.textSecondary}
                value={text1}
                onChangeText={setText1}
              />
            </View>
          </KeyboardAvoidingView>
        </View>

        {/* keyboardVerticalOffset 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. keyboardVerticalOffset
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            화면 최상단과 KeyboardAvoidingView 사이의 여백을 추가로 지정
            (헤더/네비게이션 바가 있을 때 필수)
          </TextBox>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            style={[
              styles.kavContainer,
              { backgroundColor: theme.background + '80' },
            ]}
          >
            <View style={styles.testArea}>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.testLabel}
              >
                keyboardVerticalOffset: {Platform.OS === 'ios' ? '80' : '0'}
              </TextBox>
              <View style={styles.spacer} />
              <TextInput
                style={[
                  styles.testInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="입력창 테스트"
                placeholderTextColor={theme.textSecondary}
                value={text2}
                onChangeText={setText2}
              />
            </View>
          </KeyboardAvoidingView>
        </View>

        {/* enabled 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            3. enabled (기능 활성화/비활성화)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            KeyboardAvoidingView 기능을 켜고 끄는 옵션
          </TextBox>
          <CustomButton
            title={enabled ? '비활성화' : '활성화'}
            onPress={() => setEnabled(!enabled)}
            variant={enabled ? 'primary' : 'outline'}
            size="small"
            style={styles.toggleButton}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            enabled={enabled}
            style={[
              styles.kavContainer,
              { backgroundColor: theme.background + '80' },
            ]}
          >
            <View style={styles.testArea}>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.testLabel}
              >
                enabled: {enabled ? 'true' : 'false'}
              </TextBox>
              <View style={styles.spacer} />
              <TextInput
                style={[
                  styles.testInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="입력창 테스트"
                placeholderTextColor={theme.textSecondary}
                value={text3}
                onChangeText={setText3}
              />
            </View>
          </KeyboardAvoidingView>
        </View>

        {/* contentContainerStyle 예제 (position일 때) */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            4. contentContainerStyle (behavior='position'일 때)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            behavior가 'position'일 때만 적용됨. 내부 콘텐츠의 스타일 지정
          </TextBox>
          <KeyboardAvoidingView
            behavior="position"
            contentContainerStyle={[
              styles.positionContent,
              { backgroundColor: theme.background + '80' },
            ]}
            style={styles.kavContainer}
          >
            <View style={styles.testArea}>
              <TextBox
                variant="body4"
                color={theme.textSecondary}
                style={styles.testLabel}
              >
                contentContainerStyle 적용됨
              </TextBox>
              <View style={styles.spacer} />
              <TextInput
                style={[
                  styles.testInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="입력창 테스트"
                placeholderTextColor={theme.textSecondary}
                value={text4}
                onChangeText={setText4}
              />
            </View>
          </KeyboardAvoidingView>
        </View>

        {/* 실무 예제: 채팅 입력 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            5. 실무 예제: 채팅 입력 창
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            채팅 앱에서 하단 입력창이 키보드에 가려지지 않도록
          </TextBox>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            style={styles.chatContainer}
          >
            <View
              style={[
                styles.chatMessages,
                { backgroundColor: theme.background },
              ]}
            >
              <TextBox variant="body4" color={theme.textSecondary}>
                메시지 영역
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                (스크롤 가능한 메시지 리스트)
              </TextBox>
            </View>
            <View
              style={[
                styles.chatInputContainer,
                {
                  backgroundColor: theme.surface,
                  borderTopColor: theme.border,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.chatInput,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="메시지를 입력하세요..."
                placeholderTextColor={theme.textSecondary}
                multiline
                value={text5}
                onChangeText={setText5}
              />
              <CustomButton
                title="전송"
                onPress={() => {
                  setText5('');
                }}
                variant="primary"
                size="small"
              />
            </View>
          </KeyboardAvoidingView>
        </View>

        {/* 실무 예제: 로그인 폼 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            6. 실무 예제: 로그인 폼
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            로그인/회원가입 화면에서 입력 필드가 키보드에 가려지지 않도록
          </TextBox>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            style={styles.formContainer}
          >
            <View style={styles.formContent}>
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.formLabel}
              >
                이메일
              </TextBox>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="이메일을 입력하세요"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextBox
                variant="body3"
                color={theme.text}
                style={styles.formLabel}
              >
                비밀번호
              </TextBox>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
              <CustomButton
                title="로그인"
                onPress={() => {}}
                variant="primary"
                size="medium"
                style={styles.formButton}
              />
            </View>
          </KeyboardAvoidingView>
        </View>

        {/* 요약 테이블 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📌 주요 Props 요약
          </TextBox>
          <View style={styles.tableContainer}>
            <View style={[styles.tableRow, { backgroundColor: theme.border }]}>
              <View style={styles.tableCell}>
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.tableHeader}
                >
                  Prop
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox
                  variant="body3"
                  color={theme.text}
                  style={styles.tableHeader}
                >
                  설명
                </TextBox>
              </View>
            </View>
            <View
              style={[styles.tableRow, { backgroundColor: theme.background }]}
            >
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  behavior
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  height / position / padding
                </TextBox>
              </View>
            </View>
            <View
              style={[styles.tableRow, { backgroundColor: theme.background }]}
            >
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  enabled
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  기능 활성화 여부 (기본값: true)
                </TextBox>
              </View>
            </View>
            <View
              style={[styles.tableRow, { backgroundColor: theme.background }]}
            >
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  keyboardVerticalOffset
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  상단 여백 (헤더 있을 때 필수)
                </TextBox>
              </View>
            </View>
            <View
              style={[styles.tableRow, { backgroundColor: theme.background }]}
            >
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  contentContainerStyle
                </TextBox>
              </View>
              <View style={styles.tableCell}>
                <TextBox variant="body4" color={theme.text}>
                  behavior='position'일 때 컨테이너 스타일
                </TextBox>
              </View>
            </View>
          </View>
        </View>

        {/* 사용 시기 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎯 언제 사용해야 할까?
          </TextBox>
          <View style={styles.usageContainer}>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.usageItem}
            >
              ✔ 채팅 입력 창
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.usageItem}
            >
              ✔ 댓글 입력 화면
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.usageItem}
            >
              ✔ 로그인/회원가입 폼
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.usageItem}
            >
              ✔ TextInput이 하단에 위치한 모든 곳
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
              • iOS와 Android 동작 방식이 다르므로 behavior를 플랫폼별로 설정
              권장
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 헤더/네비게이션 바가 있을 때 keyboardVerticalOffset 필수
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • ScrollView와 함께 사용할 때는 주의 필요 (중첩 스크롤 이슈)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • behavior='position'일 때만 contentContainerStyle이 적용됨
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
  behaviorInfo: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  infoTitle: {
    fontWeight: '600',
  },
  recommendation: {
    fontStyle: 'italic',
  },
  kavContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  testArea: {
    padding: 16,
    minHeight: 200,
  },
  testLabel: {
    marginBottom: 12,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
    minHeight: 100,
  },
  testInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  positionContent: {
    padding: 16,
  },
  toggleButton: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  chatContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    height: 300,
  },
  chatMessages: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  formContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  formContent: {
    padding: 20,
    gap: 16,
  },
  formLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  formButton: {
    marginTop: 8,
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
  usageContainer: {
    gap: 8,
  },
  usageItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
  warningContainer: {
    gap: 8,
  },
  warningItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
