import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';

export default function SwitchScreen() {
  const { theme } = useTheme();
  const [basicSwitch, setBasicSwitch] = useState(false);
  const [disabledSwitch, setDisabledSwitch] = useState(false);
  const [customSwitch, setCustomSwitch] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Switch 컴포넌트
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          Switch 컴포넌트를 테스트해보세요.
        </TextBox>

        {/* 기본 Switch 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. 기본 Switch
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            Controlled Component: value + onValueChange 필수
          </TextBox>
          <View style={styles.switchRow}>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.switchLabel}
            >
              기본 스위치
            </TextBox>
            <Switch value={basicSwitch} onValueChange={setBasicSwitch} />
          </View>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.statusText}
          >
            상태: {basicSwitch ? 'ON' : 'OFF'}
          </TextBox>
        </View>

        {/* disabled 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. disabled (비활성화)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            disabled={true}로 토글 불가능하게 설정
          </TextBox>
          <View style={styles.switchRow}>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.switchLabel}
            >
              비활성화된 스위치
            </TextBox>
            <Switch
              value={disabledSwitch}
              onValueChange={setDisabledSwitch}
              disabled={true}
            />
          </View>
          <View style={styles.switchRow}>
            <TextBox
              variant="body2"
              color={theme.textSecondary}
              style={styles.switchLabel}
            >
              활성화된 스위치
            </TextBox>
            <Switch
              value={disabledSwitch}
              onValueChange={setDisabledSwitch}
              disabled={false}
            />
          </View>
        </View>

        {/* thumbColor 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            3. thumbColor (그립 색상)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            스위치 그립(움직이는 부분)의 색상 설정
          </TextBox>
          <View style={styles.switchRow}>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.switchLabel}
            >
              기본 그립 색상
            </TextBox>
            <Switch value={customSwitch} onValueChange={setCustomSwitch} />
          </View>
          <View style={styles.switchRow}>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.switchLabel}
            >
              커스텀 그립 (빨강)
            </TextBox>
            <Switch
              value={customSwitch}
              onValueChange={setCustomSwitch}
              thumbColor="#FF0000"
            />
          </View>
          <View style={styles.switchRow}>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.switchLabel}
            >
              커스텀 그립 (파랑)
            </TextBox>
            <Switch
              value={customSwitch}
              onValueChange={setCustomSwitch}
              thumbColor={theme.primary}
            />
          </View>
        </View>

        {/* trackColor 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            4. trackColor (트랙 색상)
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            false(꺼짐)와 true(켜짐) 상태의 트랙 색상 설정
          </TextBox>
          <View style={styles.switchRow}>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.switchLabel}
            >
              기본 트랙 색상
            </TextBox>
            <Switch value={customSwitch} onValueChange={setCustomSwitch} />
          </View>
          <View style={styles.switchRow}>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.switchLabel}
            >
              커스텀 트랙 (회색/파랑)
            </TextBox>
            <Switch
              value={customSwitch}
              onValueChange={setCustomSwitch}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </View>
          <View style={styles.switchRow}>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.switchLabel}
            >
              커스텀 트랙 (빨강/초록)
            </TextBox>
            <Switch
              value={customSwitch}
              onValueChange={setCustomSwitch}
              trackColor={{ false: '#FF6B6B', true: '#51CF66' }}
            />
          </View>
        </View>

        {/* thumbColor + trackColor 조합 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            5. thumbColor + trackColor 조합
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            그립과 트랙 색상을 함께 커스터마이징
          </TextBox>
          <View style={styles.switchRow}>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.switchLabel}
            >
              테마 색상 조합
            </TextBox>
            <Switch
              value={customSwitch}
              onValueChange={setCustomSwitch}
              thumbColor="#FFFFFF"
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>
          <View style={styles.switchRow}>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.switchLabel}
            >
              다크 모드 스타일
            </TextBox>
            <Switch
              value={customSwitch}
              onValueChange={setCustomSwitch}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#3E3E3E', true: '#4ECDC4' }}
            />
          </View>
        </View>

        {/* 실무 패턴: 설정 화면 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            6. 실무 패턴: 설정 화면
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            실제 앱 설정 화면에서 사용하는 패턴
          </TextBox>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <TextBox variant="body2" color={theme.text}>
                  알림 받기
                </TextBox>
                <TextBox
                  variant="body4"
                  color={theme.textSecondary}
                  style={styles.settingDescription}
                >
                  푸시 알림을 받습니다
                </TextBox>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                thumbColor="#FFFFFF"
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <TextBox variant="body2" color={theme.text}>
                  다크 모드
                </TextBox>
                <TextBox
                  variant="body4"
                  color={theme.textSecondary}
                  style={styles.settingDescription}
                >
                  어두운 테마 사용
                </TextBox>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                thumbColor="#FFFFFF"
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <TextBox variant="body2" color={theme.text}>
                  Wi-Fi
                </TextBox>
                <TextBox
                  variant="body4"
                  color={theme.textSecondary}
                  style={styles.settingDescription}
                >
                  무선 네트워크 연결
                </TextBox>
              </View>
              <Switch
                value={wifi}
                onValueChange={setWifi}
                thumbColor="#FFFFFF"
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <TextBox variant="body2" color={theme.textSecondary}>
                  Bluetooth
                </TextBox>
                <TextBox
                  variant="body4"
                  color={theme.textSecondary}
                  style={styles.settingDescription}
                >
                  블루투스 연결 (비활성화)
                </TextBox>
              </View>
              <Switch
                value={bluetooth}
                onValueChange={setBluetooth}
                disabled={true}
                thumbColor="#FFFFFF"
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>
          </View>
        </View>

        {/* onChange 이벤트 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            7. onChange 이벤트
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            onValueChange와 달리 이벤트 객체를 받음
          </TextBox>
          <View style={styles.switchRow}>
            <TextBox
              variant="body2"
              color={theme.text}
              style={styles.switchLabel}
            >
              onChange 이벤트
            </TextBox>
            <Switch
              value={basicSwitch}
              onValueChange={setBasicSwitch}
              onChange={(e) => {
                console.log('onChange event:', e.nativeEvent.value);
              }}
            />
          </View>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.infoText}
          >
            콘솔에서 onChange 이벤트 확인 가능
          </TextBox>
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
              • Controlled Component이므로 value + onValueChange 세트로 관리
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • thumbColor로 그립 색상, trackColor로 트랙 색상 제어
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • trackColor는 {`{ false: color, true: color }`} 형태로 설정
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • iOS는 ios_backgroundColor로 추가 배경색 설정 가능
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • disabled 상태로 토글 가능 여부 제어
            </TextBox>
            <TextBox variant="body4" color={theme.text} style={styles.tipItem}>
              • iOS와 Android에서 트랙/그립 색상 처리 방식 차이 있음
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    flex: 1,
  },
  statusText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  settingsContainer: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingDescription: {
    marginTop: 4,
  },
  infoText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  tipsContainer: {
    gap: 8,
  },
  tipItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
