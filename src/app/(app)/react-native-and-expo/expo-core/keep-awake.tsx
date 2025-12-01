import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Platform,
  TextInput,
} from 'react-native';

import {
  useKeepAwake,
  activateKeepAwakeAsync,
  deactivateKeepAwake,
  isAvailableAsync,
  addListener,
  ExpoKeepAwakeTag,
  KeepAwakeEventState,
} from 'expo-keep-awake';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

// Hook을 사용하는 컴포넌트
function KeepAwakeHookExample() {
  const { theme } = useTheme();
  const [customTag, setCustomTag] = useState('');
  const [useCustomTag, setUseCustomTag] = useState(false);

  // Hook 사용 (태그 없음)
  useKeepAwake();

  // Hook 사용 (커스텀 태그)
  if (useCustomTag && customTag) {
    useKeepAwake(customTag);
  }

  return (
    <View
      style={[
        styles.exampleContainer,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <TextBox variant="body2" color={theme.text} style={styles.exampleTitle}>
        useKeepAwake Hook 예제
      </TextBox>
      <TextBox variant="body4" color={theme.textSecondary}>
        이 컴포넌트가 마운트된 동안 화면이 꺼지지 않습니다.
      </TextBox>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.tagInput,
            { backgroundColor: theme.background, color: theme.text },
          ]}
          value={customTag}
          onChangeText={setCustomTag}
          placeholder="커스텀 태그 (선택사항)"
          placeholderTextColor={theme.textSecondary}
        />
        <CustomButton
          title={useCustomTag ? '기본 태그 사용' : '커스텀 태그 사용'}
          onPress={() => setUseCustomTag(!useCustomTag)}
          variant="ghost"
          style={styles.tagButton}
        />
      </View>
    </View>
  );
}

export default function KeepAwakeScreen() {
  const { theme } = useTheme();

  // State
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [customTag, setCustomTag] = useState('my-custom-tag');
  const [listenerActive, setListenerActive] = useState(false);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  // Hook 사용 (이 스크린 전체에서 화면이 꺼지지 않도록)
  useKeepAwake();

  useEffect(() => {
    checkAvailability();
    return () => {
      // 컴포넌트 언마운트 시 모든 태그 비활성화
      activeTags.forEach((tag) => {
        deactivateKeepAwake(tag);
      });
    };
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await isAvailableAsync();
      setIsAvailable(available);
    } catch (error: any) {
      Alert.alert(
        '오류',
        `사용 가능 여부 확인 실패: ${error.message || error}`
      );
      setIsAvailable(false);
    }
  };

  const activateWithTag = async (tag: string) => {
    try {
      await activateKeepAwakeAsync(tag);
      setActiveTags((prev) => new Set(prev).add(tag));
      Alert.alert('성공', `KeepAwake 활성화: ${tag}`);
    } catch (error: any) {
      Alert.alert('오류', `KeepAwake 활성화 실패: ${error.message || error}`);
    }
  };

  const deactivateWithTag = async (tag: string) => {
    try {
      await deactivateKeepAwake(tag);
      setActiveTags((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tag);
        return newSet;
      });
      Alert.alert('성공', `KeepAwake 비활성화: ${tag}`);
    } catch (error: any) {
      Alert.alert('오류', `KeepAwake 비활성화 실패: ${error.message || error}`);
    }
  };

  const activateDefault = async () => {
    await activateWithTag(ExpoKeepAwakeTag);
  };

  const deactivateDefault = async () => {
    await deactivateWithTag(ExpoKeepAwakeTag);
  };

  const activateCustom = async () => {
    if (!customTag.trim()) {
      Alert.alert('오류', '태그를 입력해주세요.');
      return;
    }
    await activateWithTag(customTag.trim());
  };

  const deactivateCustom = async () => {
    if (!customTag.trim()) {
      Alert.alert('오류', '태그를 입력해주세요.');
      return;
    }
    await deactivateWithTag(customTag.trim());
  };

  const deactivateAll = async () => {
    try {
      const tagsArray = Array.from(activeTags);
      for (const tag of tagsArray) {
        await deactivateKeepAwake(tag);
      }
      setActiveTags(new Set());
      Alert.alert('성공', '모든 KeepAwake 비활성화');
    } catch (error: any) {
      Alert.alert('오류', `비활성화 실패: ${error.message || error}`);
    }
  };

  const toggleListener = () => {
    if (listenerActive) {
      // 리스너는 addListener가 반환한 subscription을 저장해야 하지만,
      // 여기서는 간단히 상태만 관리
      setListenerActive(false);
      setLastEvent(null);
    } else {
      try {
        const subscription = addListener((event) => {
          setLastEvent(
            `State: ${event.state === KeepAwakeEventState.RELEASE ? 'RELEASE' : 'UNKNOWN'}`
          );
        });
        setListenerActive(true);
        // 실제로는 subscription을 저장해서 cleanup 시 제거해야 함
        Alert.alert('성공', '리스너 활성화됨 (웹에서만 동작)');
      } catch (error: any) {
        Alert.alert('오류', `리스너 등록 실패: ${error.message || error}`);
      }
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="KeepAwake" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          KeepAwake
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          화면이 꺼지지 않도록 유지
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
              KeepAwake API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 화면이 자동으로 꺼지지 않도록 유지
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • useKeepAwake: Hook으로 컴포넌트 마운트 시 자동 활성화
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • activateKeepAwakeAsync: 명령형으로 활성화
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • deactivateKeepAwake: 명령형으로 비활성화
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Tag 시스템: 여러 태그로 독립적으로 관리 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 모든 태그가 비활성화되어야 화면이 꺼짐
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 웹: 제한적 지원 (탭이 활성일 때만)
            </TextBox>
          </View>
        </View>

        {/* 사용 가능 여부 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ✅ 사용 가능 여부
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                상태:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  isAvailable === null
                    ? theme.textSecondary
                    : isAvailable
                      ? theme.success
                      : theme.error
                }
              >
                {isAvailable === null
                  ? '확인 중...'
                  : isAvailable
                    ? '✅ 사용 가능'
                    : '❌ 사용 불가'}
              </TextBox>
            </View>
          </View>

          <CustomButton
            title="사용 가능 여부 확인"
            onPress={checkAvailability}
            variant="ghost"
            style={styles.button}
          />
        </View>

        {/* Hook 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎣 useKeepAwake Hook
          </TextBox>

          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            이 스크린 전체에서 useKeepAwake가 활성화되어 있어 화면이 꺼지지
            않습니다.
          </TextBox>

          <KeepAwakeHookExample />
        </View>

        {/* 명령형 함수 - 기본 태그 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🔧 명령형 함수 (기본 태그)
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                태그:
              </TextBox>
              <TextBox variant="body3" color={theme.text}>
                {ExpoKeepAwakeTag}
              </TextBox>
            </View>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                활성화 상태:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  activeTags.has(ExpoKeepAwakeTag) ? theme.success : theme.text
                }
              >
                {activeTags.has(ExpoKeepAwakeTag) ? '✅ 활성화' : '❌ 비활성화'}
              </TextBox>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="활성화"
              onPress={activateDefault}
              style={styles.button}
              disabled={activeTags.has(ExpoKeepAwakeTag)}
            />
            <CustomButton
              title="비활성화"
              onPress={deactivateDefault}
              variant="ghost"
              style={styles.button}
              disabled={!activeTags.has(ExpoKeepAwakeTag)}
            />
          </View>
        </View>

        {/* 명령형 함수 - 커스텀 태그 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🏷️ 명령형 함수 (커스텀 태그)
          </TextBox>

          <View style={styles.inputContainer}>
            <TextBox variant="body3" color={theme.text}>
              태그 이름:
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={customTag}
              onChangeText={setCustomTag}
              placeholder="my-custom-tag"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                활성화 상태:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  customTag.trim() && activeTags.has(customTag.trim())
                    ? theme.success
                    : theme.text
                }
              >
                {customTag.trim() && activeTags.has(customTag.trim())
                  ? '✅ 활성화'
                  : '❌ 비활성화'}
              </TextBox>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="활성화"
              onPress={activateCustom}
              style={styles.button}
              disabled={!customTag.trim() || activeTags.has(customTag.trim())}
            />
            <CustomButton
              title="비활성화"
              onPress={deactivateCustom}
              variant="ghost"
              style={styles.button}
              disabled={!customTag.trim() || !activeTags.has(customTag.trim())}
            />
          </View>
        </View>

        {/* 활성화된 태그 목록 */}
        {activeTags.size > 0 && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📋 활성화된 태그 ({activeTags.size}개)
            </TextBox>

            <View style={styles.tagsContainer}>
              {Array.from(activeTags).map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.tagItem,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <TextBox variant="body3" color={theme.text}>
                    {tag}
                  </TextBox>
                  <CustomButton
                    title="비활성화"
                    onPress={() => deactivateWithTag(tag)}
                    variant="ghost"
                    style={styles.tagDeactivateButton}
                  />
                </View>
              ))}
            </View>

            <CustomButton
              title="모두 비활성화"
              onPress={deactivateAll}
              variant="ghost"
              style={styles.button}
            />
          </View>
        )}

        {/* 리스너 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            👂 이벤트 리스너
          </TextBox>

          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            웹에서만 동작합니다. 탭이 비활성화되면 이벤트가 발생합니다.
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                리스너 상태:
              </TextBox>
              <TextBox
                variant="body3"
                color={listenerActive ? theme.success : theme.text}
              >
                {listenerActive ? '✅ 활성화' : '❌ 비활성화'}
              </TextBox>
            </View>
            {lastEvent && (
              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  마지막 이벤트:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {lastEvent}
                </TextBox>
              </View>
            )}
          </View>

          <CustomButton
            title={listenerActive ? '리스너 비활성화' : '리스너 활성화'}
            onPress={toggleListener}
            variant={listenerActive ? 'ghost' : 'primary'}
            style={styles.button}
          />
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
              {`// 1. Hook 사용 (가장 간단한 방법)
import { useKeepAwake } from 'expo-keep-awake';

export default function MyScreen() {
  useKeepAwake(); // 컴포넌트 마운트 시 자동 활성화
  return <View>...</View>;
}

// 2. Hook with 커스텀 태그
import { useKeepAwake } from 'expo-keep-awake';

export default function MyScreen() {
  useKeepAwake('my-custom-tag');
  return <View>...</View>;
}

// 3. Hook with 옵션
import { useKeepAwake } from 'expo-keep-awake';

export default function MyScreen() {
  useKeepAwake('my-tag', {
    listener: ({ state }) => {
      console.log('KeepAwake state:', state);
    },
    suppressDeactivateWarnings: true, // Android 경고 억제
  });
  return <View>...</View>;
}

// 4. 명령형 활성화/비활성화
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
  ExpoKeepAwakeTag,
} from 'expo-keep-awake';

// 기본 태그로 활성화
await activateKeepAwakeAsync();

// 또는 명시적으로 기본 태그 지정
await activateKeepAwakeAsync(ExpoKeepAwakeTag);

// 커스텀 태그로 활성화
await activateKeepAwakeAsync('my-custom-tag');

// 비활성화
await deactivateKeepAwake(); // 기본 태그
await deactivateKeepAwake('my-custom-tag'); // 커스텀 태그

// 5. 다중 태그 관리
await activateKeepAwakeAsync('tag1');
await activateKeepAwakeAsync('tag2');
await activateKeepAwakeAsync('tag3');

// 각각 비활성화해야 화면이 꺼짐
await deactivateKeepAwake('tag1');
await deactivateKeepAwake('tag2');
await deactivateKeepAwake('tag3');

// 6. 사용 가능 여부 확인
import { isAvailableAsync } from 'expo-keep-awake';

const available = await isAvailableAsync();
if (available) {
  await activateKeepAwakeAsync();
}

// 7. 이벤트 리스너 (웹 전용)
import { addListener, KeepAwakeEventState } from 'expo-keep-awake';

const subscription = addListener((event) => {
  if (event.state === KeepAwakeEventState.RELEASE) {
    console.log('KeepAwake released');
  }
});

// Cleanup
subscription.remove();

// 8. 조건부 Hook 사용
import { useKeepAwake } from 'expo-keep-awake';
import { useState } from 'react';

export default function MyScreen() {
  const [shouldKeepAwake, setShouldKeepAwake] = useState(true);
  
  if (shouldKeepAwake) {
    useKeepAwake();
  }
  
  return (
    <View>
      <Button
        title="Toggle KeepAwake"
        onPress={() => setShouldKeepAwake(!shouldKeepAwake)}
      />
    </View>
  );
}

// 9. 컴포넌트별 독립적 관리
function VideoPlayer() {
  useKeepAwake('video-player');
  return <Video />;
}

function Timer() {
  useKeepAwake('timer');
  return <TimerDisplay />;
}

// 두 컴포넌트가 모두 마운트되어 있으면 화면이 꺼지지 않음
// 하나라도 언마운트되면 해당 태그는 자동으로 비활성화됨

// 10. cleanup 예제
import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

export default function MyScreen() {
  useEffect(() => {
    const tag = 'my-tag';
    activateKeepAwakeAsync(tag);
    
    return () => {
      deactivateKeepAwake(tag);
    };
  }, []);
  
  return <View>...</View>;
}`}
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
              • 배터리 소모가 증가할 수 있음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 모든 태그가 비활성화되어야 화면이 꺼짐
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Hook은 컴포넌트 언마운트 시 자동으로 비활성화됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 명령형 함수는 수동으로 비활성화해야 함
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 웹: 제한적 지원 (탭이 활성일 때만 동작)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: Activity가 종료되면 경고 발생 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • suppressDeactivateWarnings 옵션으로 경고 억제 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 비디오 플레이어, 타이머 등에 유용
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
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  inputContainer: {
    gap: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  exampleContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  exampleTitle: {
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  tagButton: {
    minWidth: 120,
  },
  tagsContainer: {
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  tagDeactivateButton: {
    minWidth: 80,
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
