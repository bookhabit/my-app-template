import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import CustomHeader from '@/components/layout/CustomHeader';

export default function SharedObjectsScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="SharedObject / SharedRef" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          SharedObject / SharedRef
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          Native 객체 공유 테스트
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
              SharedObject (공유 객체)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • EventEmitter를 확장한 기본 클래스
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • C++로 구현되어 JSI를 통해 설치됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • JavaScript와 네이티브 객체 간의 브릿지 역할
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 이벤트를 발생시킬 수 있음 (EventEmitter 상속)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 예: VideoPlayer, Image 객체
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              SharedRef (공유 참조)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • SharedObject를 확장한 클래스
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 네이티브 객체에 대한 참조를 보유
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `nativeRefType` 속성으로 타입 식별
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 다른 독립적인 라이브러리 간에 참조 전달 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 예: ImageRef (expo-image), 다른 모듈로 이미지 전달
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.warning}
              style={styles.conceptTitle}
            >
              release() 메서드
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • JS와 네이티브 객체를 분리하여 수동 메모리 관리
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 호출 후 네이티브 함수 호출 시 에러 발생
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 성능이 중요한 경우에만 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • React 훅으로 생성된 객체는 자동으로 해제됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.conceptText}
            >
              ⚠️ 대부분의 경우 수동 호출 불필요
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.success}
              style={styles.conceptTitle}
            >
              ✅ 사용 사례
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • expo-image의 ImageRef를 expo-image-manipulator로 전달
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 파일 시스템 없이 직접 이미지 처리
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 네이티브 객체를 여러 모듈에서 공유
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 메모리 효율적인 데이터 전달
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
              {`// 1. SharedObject 기본 사용법
import { useVideoPlayer } from 'expo-video';

function VideoComponent() {
  const player = useVideoPlayer(source);
  
  // player는 SharedObject
  // 이벤트를 발생시킬 수 있음
  player.addEventListener('statusChange', (status) => {
    console.log('Status:', status);
  });
  
  // 컴포넌트 언마운트 시 자동으로 release() 호출됨
  return <VideoView player={player} />;
}

// 2. SharedRef 사용법 (expo-image 예제)
import { useImage, ImageRef } from 'expo-image';
import { manipulateAsync } from 'expo-image-manipulator';

function ImageManipulation() {
  const image = useImage(require('./image.jpg'));
  
  // ImageRef는 SharedRef
  // nativeRefType으로 타입 식별
  console.log(image.nativeRefType); // "ImageRef"
  
  // 다른 모듈로 직접 전달 가능
  const manipulate = async () => {
    const result = await manipulateAsync(
      image, // ImageRef 직접 전달
      [{ resize: { width: 200 } }]
    );
    // 파일 시스템 없이 메모리에서 직접 처리
  };
  
  return <Image source={image} />;
}

// 3. 수동 메모리 관리 (거의 사용하지 않음)
function ManualRelease() {
  const player = useVideoPlayer(source);
  
  useEffect(() => {
    return () => {
      // 성능이 중요한 경우에만 수동 해제
      // 대부분의 경우 자동으로 처리됨
      player.release();
    };
  }, []);
  
  return <VideoView player={player} />;
}

// 4. SharedRef 타입 확인
function CheckRefType(ref: SharedRef) {
  console.log(ref.nativeRefType);
  // "ImageRef", "VideoPlayerRef" 등
}`}
            </TextBox>
          </View>
        </View>

        {/* 실제 사용 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🔄 실제 사용 시나리오
          </TextBox>

          <View style={styles.scenarioContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.scenarioTitle}
            >
              시나리오: 이미지 편집 후 표시
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.scenarioText}
            >
              1. expo-image로 이미지 로드 → ImageRef 생성
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.scenarioText}
            >
              2. expo-image-manipulator에 ImageRef 직접 전달
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.scenarioText}
            >
              3. 파일 시스템 없이 메모리에서 직접 처리
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.scenarioText}
            >
              4. 편집된 이미지를 다시 ImageView에 표시
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.textSecondary}
              style={styles.scenarioNote}
            >
              💡 파일 읽기/쓰기 없이 효율적으로 처리
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
              • release() 호출 후에는 객체를 사용할 수 없음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • React 훅으로 생성된 객체는 자동 관리됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 성능이 중요한 경우에만 수동 release() 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • SharedRef는 타입 안정성을 위해 nativeRefType 확인 권장
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
  scenarioContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 8,
  },
  scenarioTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  scenarioText: {
    marginLeft: 8,
    lineHeight: 22,
  },
  scenarioNote: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    fontStyle: 'italic',
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
