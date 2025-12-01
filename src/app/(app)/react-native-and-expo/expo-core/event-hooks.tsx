import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useEvent, useEventListener } from 'expo';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

// 간단한 EventEmitter 구현 (Expo 훅과 호환되도록)
class SimpleEventEmitter {
  private listeners: Map<string, Set<Function>> = new Map();

  addListener(eventName: string, listener: Function) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(listener);

    // Expo 훅이 기대하는 subscription 객체 반환
    return {
      remove: () => {
        this.removeListener(eventName, listener);
      },
    };
  }

  removeListener(eventName: string, listener: Function) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  emit(eventName: string, ...args: any[]) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach((listener) => listener(...args));
    }
  }

  removeAllListeners(eventName?: string) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }
}

// useEvent 예제 컴포넌트
function UseEventExample({
  eventEmitter,
}: {
  eventEmitter: SimpleEventEmitter;
}) {
  const status = useEvent(eventEmitter as any, 'statusChange', {
    status: 'idle',
  } as { status: string });

  return (
    <View>
      <TextBox
        variant="body3"
        color={status.status === 'active' ? '#4CAF50' : '#757575'}
      >
        상태: {status.status}
      </TextBox>
    </View>
  );
}

// useEventListener 예제 컴포넌트
function UseEventListenerExample({
  eventEmitter,
  onEvent,
}: {
  eventEmitter: SimpleEventEmitter;
  onEvent: (data: any) => void;
}) {
  useEventListener(
    eventEmitter as any,
    'dataChange',
    (data: { value: number }) => {
      onEvent(data);
    }
  );

  return null;
}

export default function EventHooksScreen() {
  const { theme } = useTheme();
  const eventEmitterRef = useRef(new SimpleEventEmitter());
  const [useEventStatus, setUseEventStatus] = useState('idle');
  const [eventListenerLogs, setEventListenerLogs] = useState<string[]>([]);
  const [counter, setCounter] = useState(0);

  // useEvent 테스트를 위한 상태 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses = ['idle', 'loading', 'active', 'completed'];
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];
      eventEmitterRef.current.emit('statusChange', { status: randomStatus });
      setUseEventStatus(randomStatus);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const triggerDataChange = () => {
    const newValue = counter + 1;
    setCounter(newValue);
    eventEmitterRef.current.emit('dataChange', { value: newValue });
  };

  const handleEventListenerData = (data: { value: number }) => {
    setEventListenerLogs((prev) => [
      ...prev.slice(-4), // 최근 5개만 유지
      `값 변경: ${data.value} (${new Date().toLocaleTimeString()})`,
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Event Hooks" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Event Hooks
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          useEvent / useEventListener 테스트
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
              useEvent (이벤트 값 훅)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 이벤트에서 받은 값을 상태로 관리하는 훅
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 이벤트가 발생할 때마다 자동으로 값이 업데이트됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `initialValue`로 초기값 설정 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 컴포넌트가 언마운트되면 자동으로 리스너 제거
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              useEventListener (이벤트 리스너 훅)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 이벤트 발생 시 콜백 함수를 실행하는 훅
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `listener` 함수가 이벤트마다 호출됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 사이드 이펙트(로깅, 상태 업데이트 등)에 유용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 컴포넌트가 언마운트되면 자동으로 리스너 제거
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.success}
              style={styles.conceptTitle}
            >
              ✅ 장점
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `useEffect`와 `addListener`를 수동으로 관리할 필요 없음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 메모리 누수 방지 (자동 리스너 제거)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 네이티브 모듈, 비디오 플레이어 등과 함께 사용하기 좋음
            </TextBox>
          </View>
        </View>

        {/* useEvent 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. useEvent 테스트
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            이벤트에서 받은 값을 자동으로 상태로 관리합니다. 2초마다 상태가
            변경됩니다.
          </TextBox>

          <View
            style={[
              styles.exampleContainer,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
          >
            <UseEventExample eventEmitter={eventEmitterRef.current} />
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.exampleNote}
            >
              현재 상태: {useEventStatus}
            </TextBox>
          </View>
        </View>

        {/* useEventListener 테스트 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. useEventListener 테스트
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            이벤트 발생 시 콜백 함수를 실행합니다. 버튼을 눌러 이벤트를
            트리거하세요.
          </TextBox>

          <CustomButton
            title={`이벤트 트리거 (${counter})`}
            onPress={triggerDataChange}
            style={styles.button}
          />

          <UseEventListenerExample
            eventEmitter={eventEmitterRef.current}
            onEvent={handleEventListenerData}
          />

          {eventListenerLogs.length > 0 && (
            <View
              style={[styles.resultContainer, { borderColor: theme.success }]}
            >
              <TextBox
                variant="body2"
                color={theme.success}
                style={styles.resultTitle}
              >
                ✅ 이벤트 로그
              </TextBox>
              {eventListenerLogs.map((log, index) => (
                <TextBox
                  key={index}
                  variant="body3"
                  color={theme.text}
                  style={styles.resultItem}
                >
                  {log}
                </TextBox>
              ))}
            </View>
          )}
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
              {`// 1. useEvent - 이벤트 값을 상태로 관리
import { useEvent } from 'expo';
import { VideoPlayer } from 'expo-video';

export function PlayerStatus({ videoPlayer }) {
  const { status } = useEvent(
    videoPlayer,
    'statusChange',
    { status: videoPlayer.status } // 초기값
  );

  return <Text>Player status: {status.status}</Text>;
}

// 2. useEventListener - 이벤트 발생 시 콜백 실행
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

export function VideoPlayerView() {
  const player = useVideoPlayer(videoSource);

  useEventListener(player, 'playingChange', ({ isPlaying }) => {
    console.log('Player is playing:', isPlaying);
  });

  return <VideoView player={player} />;
}

// 3. 네이티브 모듈과 함께 사용
import { useEventListener } from 'expo';
import { NativeModules } from 'react-native';

const { MyNativeModule } = NativeModules;

export function MyComponent() {
  useEventListener(MyNativeModule, 'onDataUpdate', (data) => {
    console.log('Data updated:', data);
  });

  return <View>...</View>;
}`}
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
  button: {
    marginTop: 8,
  },
  resultContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  resultTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  resultItem: {
    marginLeft: 4,
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
  exampleContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    gap: 8,
  },
  exampleNote: {
    marginTop: 8,
    fontStyle: 'italic',
  },
});
