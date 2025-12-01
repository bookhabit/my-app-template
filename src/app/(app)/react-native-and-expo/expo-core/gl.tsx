import { useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Alert,
  Platform,
} from 'react-native';

import { GLView } from 'expo-gl';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function GLScreen() {
  const { theme } = useTheme();

  // State
  const [msaaSamples, setMsaaSamples] = useState(4);
  const [enableWorklet, setEnableWorklet] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [renderMode, setRenderMode] = useState<'point' | 'triangle' | 'clear'>(
    'point'
  );
  const glViewRef = useRef<GLView>(null);

  // WebGL 렌더링 함수들
  const renderPoint = (gl: any) => {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.2, 0.3, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader
    const vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(
      vert,
      `
      void main(void) {
        gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
        gl_PointSize = 100.0;
      }
    `
    );
    gl.compileShader(vert);

    // Fragment shader
    const frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(
      frag,
      `
      void main(void) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    `
    );
    gl.compileShader(frag);

    // Program
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
    gl.flush();
    gl.endFrameEXP();
  };

  const renderTriangle = (gl: any) => {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.1, 0.1, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader
    const vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(
      vert,
      `
      attribute vec2 position;
      void main(void) {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `
    );
    gl.compileShader(vert);

    // Fragment shader
    const frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(
      frag,
      `
      void main(void) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
      }
    `
    );
    gl.compileShader(frag);

    // Program
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Create buffer with triangle vertices
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const vertices = new Float32Array([
      -0.5,
      -0.5, // bottom left
      0.5,
      -0.5, // bottom right
      0.0,
      0.5, // top
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.flush();
    gl.endFrameEXP();
  };

  const renderClear = (gl: any) => {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.flush();
    gl.endFrameEXP();
  };

  const onContextCreate = (gl: any) => {
    console.log('GL Context created:', gl.contextId);
    console.log('WebGL2 support:', gl instanceof WebGL2RenderingContext);

    // 렌더링 모드에 따라 그리기
    if (renderMode === 'point') {
      renderPoint(gl);
    } else if (renderMode === 'triangle') {
      renderTriangle(gl);
    } else {
      renderClear(gl);
    }
  };

  const takeSnapshot = async () => {
    try {
      if (!glViewRef.current) {
        Alert.alert('오류', 'GLView가 없습니다.');
        return;
      }

      const result = await glViewRef.current.takeSnapshotAsync({
        format: 'png',
        compress: 1.0,
        flip: false,
      });

      setSnapshot(result?.uri as string | null);
      Alert.alert('성공', `스냅샷 저장: ${result.width}x${result.height}`);
    } catch (error: any) {
      Alert.alert('오류', `스냅샷 실패: ${error.message || error}`);
    }
  };

  const changeRenderMode = (mode: 'point' | 'triangle' | 'clear') => {
    setRenderMode(mode);
    // GLView를 다시 렌더링하기 위해 key를 변경하거나 재마운트 필요
    // 여기서는 간단히 상태만 변경
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="GLView" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          GLView
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          OpenGL ES 렌더링 타겟
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
              GLView API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • OpenGL ES 렌더링 컨텍스트 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • WebGL2 API와 유사한 인터페이스
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 2D/3D 그래픽 렌더링
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Shader, Program, Buffer 사용
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 스냅샷 기능 (이미지 저장)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 멀티샘플링 지원 (iOS)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Reanimated worklet 지원
            </TextBox>
          </View>
        </View>

        {/* 옵션 설정 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚙️ 옵션 설정
          </TextBox>

          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <TextBox variant="body3" color={theme.text}>
                렌더링 모드:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="점"
                  onPress={() => changeRenderMode('point')}
                  variant={renderMode === 'point' ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="삼각형"
                  onPress={() => changeRenderMode('triangle')}
                  variant={renderMode === 'triangle' ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="클리어"
                  onPress={() => changeRenderMode('clear')}
                  variant={renderMode === 'clear' ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            <View style={styles.optionRow}>
              <TextBox variant="body3" color={theme.text}>
                MSAA 샘플 (iOS):
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="0 (OFF)"
                  onPress={() => setMsaaSamples(0)}
                  variant={msaaSamples === 0 ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="4"
                  onPress={() => setMsaaSamples(4)}
                  variant={msaaSamples === 4 ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>

            <View style={styles.optionRow}>
              <TextBox variant="body3" color={theme.text}>
                Worklet 지원:
              </TextBox>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="활성"
                  onPress={() => setEnableWorklet(true)}
                  variant={enableWorklet ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
                <CustomButton
                  title="비활성"
                  onPress={() => setEnableWorklet(false)}
                  variant={!enableWorklet ? 'primary' : 'ghost'}
                  style={styles.optionButton}
                />
              </View>
            </View>
          </View>
        </View>

        {/* GLView 렌더링 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎨 GLView 렌더링
          </TextBox>

          <View style={styles.glContainer}>
            <GLView
              ref={glViewRef}
              style={styles.glView}
              onContextCreate={onContextCreate}
              msaaSamples={msaaSamples}
              enableExperimentalWorkletSupport={enableWorklet}
              key={`${renderMode}-${msaaSamples}-${enableWorklet}`}
            />
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="스냅샷"
              onPress={takeSnapshot}
              style={styles.button}
            />
          </View>
        </View>

        {/* 스냅샷 결과 */}
        {snapshot && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📸 스냅샷 결과
            </TextBox>
            <Image source={{ uri: snapshot }} style={styles.snapshotImage} />
            <TextBox variant="body4" color={theme.textSecondary}>
              URI: {snapshot}
            </TextBox>
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
              {`// 1. 기본 GLView 사용
import { GLView } from 'expo-gl';

function onContextCreate(gl) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.flush();
  gl.endFrameEXP();
}

<GLView
  style={{ width: 300, height: 300 }}
  onContextCreate={onContextCreate}
/>

// 2. Shader 사용
function onContextCreate(gl) {
  // Vertex shader
  const vert = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vert, \`
    void main(void) {
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
      gl_PointSize = 100.0;
    }
  \`);
  gl.compileShader(vert);

  // Fragment shader
  const frag = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(frag, \`
    void main(void) {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  \`);
  gl.compileShader(frag);

  // Program
  const program = gl.createProgram();
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.useProgram(program);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 1);
  gl.flush();
  gl.endFrameEXP();
}

// 3. 삼각형 그리기
function renderTriangle(gl) {
  // ... shader code ...
  
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const vertices = new Float32Array([
    -0.5, -0.5,
    0.5, -0.5,
    0.0, 0.5,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.flush();
  gl.endFrameEXP();
}

// 4. 스냅샷
const snapshot = await glViewRef.current.takeSnapshotAsync({
  format: 'png',
  compress: 1.0,
  flip: false,
});
console.log('Snapshot URI:', snapshot.uri);

// 5. 멀티샘플링 (iOS)
<GLView
  msaaSamples={4} // 0 = OFF, 4 = 4x MSAA
  onContextCreate={onContextCreate}
/>

// 6. Reanimated worklet 지원
import { runOnUI } from 'react-native-reanimated';

function onContextCreate(gl) {
  runOnUI((contextId: number) => {
    'worklet';
    const gl = GLView.getWorkletContext(contextId);
    // WebGL code here
  })(gl.contextId);
}

<GLView
  enableExperimentalWorkletSupport
  onContextCreate={onContextCreate}
/>

// 7. WebGL2 지원 확인
function onContextCreate(gl) {
  if (gl instanceof WebGL2RenderingContext) {
    console.log('WebGL2 supported');
  } else {
    console.log('WebGL1 only');
  }
}

// 8. Headless context
const gl = await GLView.createContextAsync();
// 렌더링...
await GLView.destroyContextAsync(gl);`}
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
              • 원격 디버깅 시 정상 동작하지 않음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 일부 Android 기기는 WebGL2 미지원
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • MSAA는 iOS에서만 지원
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Worklet 내에서는 제한된 API만 사용 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Three.js, Pixi.js는 worklet에서 작동하지 않음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 인자 검증이 없어 잘못된 값 시 크래시 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • endFrameEXP()를 호출해야 화면에 표시됨
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
  optionsContainer: {
    gap: 16,
  },
  optionRow: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: 80,
  },
  button: {
    marginTop: 8,
  },
  glContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginTop: 12,
  },
  glView: {
    width: '100%',
    height: '100%',
  },
  snapshotImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
    resizeMode: 'contain',
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
