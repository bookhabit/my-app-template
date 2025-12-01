import { useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function ImageManipulatorScreen() {
  const { theme } = useTheme();

  // State
  const [sourceUri, setSourceUri] = useState<string>('');
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [resultInfo, setResultInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Manipulation options
  const [rotateDegrees, setRotateDegrees] = useState('90');
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [cropX, setCropX] = useState('0');
  const [cropY, setCropY] = useState('0');
  const [cropWidth, setCropWidth] = useState('');
  const [cropHeight, setCropHeight] = useState('');
  const [flipType, setFlipType] = useState<'horizontal' | 'vertical'>(
    'vertical'
  );
  const [saveFormat, setSaveFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [compress, setCompress] = useState('1.0');
  const [includeBase64, setIncludeBase64] = useState(false);

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSourceUri(result.assets[0].uri);
        setResultUri(null);
        setResultInfo(null);
      }
    } catch (error: any) {
      Alert.alert('오류', `이미지 선택 실패: ${error.message || error}`);
    }
  };

  const manipulateImage = async () => {
    if (!sourceUri) {
      Alert.alert('오류', '이미지를 먼저 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      const context = ImageManipulator.ImageManipulator.manipulate(sourceUri);

      // Rotate
      if (rotateDegrees) {
        const degrees = parseFloat(rotateDegrees);
        if (!isNaN(degrees) && degrees !== 0) {
          context.rotate(degrees);
        }
      }

      // Resize
      if (resizeWidth || resizeHeight) {
        const width = resizeWidth ? parseFloat(resizeWidth) : null;
        const height = resizeHeight ? parseFloat(resizeHeight) : null;
        if (width || height) {
          context.resize({ width, height });
        }
      }

      // Crop
      if (cropWidth && cropHeight) {
        const x = parseFloat(cropX) || 0;
        const y = parseFloat(cropY) || 0;
        const width = parseFloat(cropWidth);
        const height = parseFloat(cropHeight);
        if (!isNaN(width) && !isNaN(height)) {
          context.crop({ originX: x, originY: y, width, height });
        }
      }

      // Flip
      context.flip(flipType);

      // Render
      const imageRef = await context.renderAsync();

      // Save
      const result = await imageRef.saveAsync({
        format:
          ImageManipulator.SaveFormat[
            saveFormat.toUpperCase() as keyof typeof ImageManipulator.SaveFormat
          ],
        compress: parseFloat(compress) || 1.0,
        base64: includeBase64,
      });

      setResultUri(result.uri);
      setResultInfo({
        uri: result.uri,
        width: imageRef.width,
        height: imageRef.height,
        base64: result.base64 ? `${result.base64.substring(0, 50)}...` : null,
      });

      Alert.alert(
        '성공',
        `이미지 조작 완료: ${imageRef.width}x${imageRef.height}`
      );
    } catch (error: any) {
      Alert.alert('오류', `이미지 조작 실패: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const resetManipulation = () => {
    setResultUri(null);
    setResultInfo(null);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="ImageManipulator" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          ImageManipulator
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          로컬 파일 시스템의 이미지 조작
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
              ImageManipulator API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 이미지 회전, 크기 조정, 자르기, 뒤집기
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 체이닝 가능한 동기 메서드
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 백그라운드 스레드에서 변환 처리
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • JPEG, PNG, WEBP 형식 지원
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 압축 품질 조절 (0.0 - 1.0)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Base64 인코딩 옵션
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • useImageManipulator 훅 또는 manipulate() 메서드 사용
            </TextBox>
          </View>
        </View>

        {/* 이미지 선택 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🖼️ 이미지 선택
          </TextBox>

          <CustomButton
            title="이미지 선택"
            onPress={pickImage}
            style={styles.button}
          />

          {sourceUri && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: sourceUri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
              <TextBox variant="body4" color={theme.textSecondary}>
                {sourceUri}
              </TextBox>
            </View>
          )}
        </View>

        {/* 조작 옵션 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚙️ 조작 옵션
          </TextBox>

          {/* Rotate */}
          <View style={styles.optionGroup}>
            <TextBox variant="body2" color={theme.text}>
              회전 (Rotate)
            </TextBox>
            <View style={styles.inputContainer}>
              <TextBox variant="body3" color={theme.textSecondary}>
                각도:
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={rotateDegrees}
                onChangeText={setRotateDegrees}
                placeholder="90"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Resize */}
          <View style={styles.optionGroup}>
            <TextBox variant="body2" color={theme.text}>
              크기 조정 (Resize)
            </TextBox>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  너비:
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={resizeWidth}
                  onChangeText={setResizeWidth}
                  placeholder="자동"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  높이:
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={resizeHeight}
                  onChangeText={setResizeHeight}
                  placeholder="자동"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Crop */}
          <View style={styles.optionGroup}>
            <TextBox variant="body2" color={theme.text}>
              자르기 (Crop)
            </TextBox>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  X:
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={cropX}
                  onChangeText={setCropX}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  Y:
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={cropY}
                  onChangeText={setCropY}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  너비:
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={cropWidth}
                  onChangeText={setCropWidth}
                  placeholder="자동"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  높이:
                </TextBox>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text },
                  ]}
                  value={cropHeight}
                  onChangeText={setCropHeight}
                  placeholder="자동"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Flip */}
          <View style={styles.optionGroup}>
            <TextBox variant="body2" color={theme.text}>
              뒤집기 (Flip)
            </TextBox>
            <View style={styles.buttonRow}>
              <CustomButton
                title="수평"
                onPress={() => setFlipType('horizontal')}
                variant={flipType === 'horizontal' ? 'primary' : 'ghost'}
                style={styles.optionButton}
              />
              <CustomButton
                title="수직"
                onPress={() => setFlipType('vertical')}
                variant={flipType === 'vertical' ? 'primary' : 'ghost'}
                style={styles.optionButton}
              />
            </View>
          </View>

          {/* Save Options */}
          <View style={styles.optionGroup}>
            <TextBox variant="body2" color={theme.text}>
              저장 옵션
            </TextBox>
            <View style={styles.buttonRow}>
              <CustomButton
                title="JPEG"
                onPress={() => setSaveFormat('jpeg')}
                variant={saveFormat === 'jpeg' ? 'primary' : 'ghost'}
                style={styles.optionButton}
              />
              <CustomButton
                title="PNG"
                onPress={() => setSaveFormat('png')}
                variant={saveFormat === 'png' ? 'primary' : 'ghost'}
                style={styles.optionButton}
              />
              <CustomButton
                title="WEBP"
                onPress={() => setSaveFormat('webp')}
                variant={saveFormat === 'webp' ? 'primary' : 'ghost'}
                style={styles.optionButton}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextBox variant="body3" color={theme.textSecondary}>
                압축 (0.0-1.0):
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={compress}
                onChangeText={setCompress}
                placeholder="1.0"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.buttonRow}>
              <CustomButton
                title="Base64 포함"
                onPress={() => setIncludeBase64(true)}
                variant={includeBase64 ? 'primary' : 'ghost'}
                style={styles.optionButton}
              />
              <CustomButton
                title="Base64 제외"
                onPress={() => setIncludeBase64(false)}
                variant={!includeBase64 ? 'primary' : 'ghost'}
                style={styles.optionButton}
              />
            </View>
          </View>
        </View>

        {/* 조작 실행 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎨 조작 실행
          </TextBox>

          <View style={styles.buttonRow}>
            <CustomButton
              title={loading ? '처리 중...' : '이미지 조작'}
              onPress={manipulateImage}
              style={styles.button}
              disabled={loading || !sourceUri}
            />
            {resultUri && (
              <CustomButton
                title="초기화"
                onPress={resetManipulation}
                variant="ghost"
                style={styles.button}
              />
            )}
          </View>
        </View>

        {/* 결과 이미지 */}
        {resultUri && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              ✅ 결과 이미지
            </TextBox>

            <View style={styles.imageContainer}>
              <Image
                source={{ uri: resultUri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </View>

            {resultInfo && (
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    크기:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {resultInfo.width} x {resultInfo.height}
                  </TextBox>
                </View>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    URI:
                  </TextBox>
                  <TextBox
                    variant="body4"
                    color={theme.textSecondary}
                    style={styles.uriText}
                  >
                    {resultInfo.uri}
                  </TextBox>
                </View>
                {resultInfo.base64 && (
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Base64:
                    </TextBox>
                    <TextBox
                      variant="body4"
                      color={theme.textSecondary}
                      style={styles.base64Text}
                    >
                      {resultInfo.base64}
                    </TextBox>
                  </View>
                )}
              </View>
            )}
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
              {`// 1. useImageManipulator 훅 사용
import { useImageManipulator, FlipType, SaveFormat } from 'expo-image-manipulator';

const context = useImageManipulator(imageUri);

// 체이닝으로 여러 변환 적용
context
  .rotate(90)
  .flip(FlipType.Vertical)
  .resize({ width: 300 });

// 렌더링 및 저장
const imageRef = await context.renderAsync();
const result = await imageRef.saveAsync({
  format: SaveFormat.PNG,
});

// 2. ImageManipulator.manipulate() 사용
import * as ImageManipulator from 'expo-image-manipulator';

const context = ImageManipulator.ImageManipulator.manipulate(imageUri);
context.rotate(90).flip(ImageManipulator.FlipType.Vertical);
const imageRef = await context.renderAsync();
const result = await imageRef.saveAsync();

// 3. 회전
context.rotate(90); // 시계 방향
context.rotate(-90); // 반시계 방향

// 4. 크기 조정
context.resize({ width: 300 }); // 높이 자동 계산
context.resize({ height: 200 }); // 너비 자동 계산
context.resize({ width: 300, height: 200 }); // 둘 다 지정

// 5. 자르기
context.crop({
  originX: 0,
  originY: 0,
  width: 200,
  height: 200,
});

// 6. 뒤집기
context.flip(ImageManipulator.FlipType.Horizontal);
context.flip(ImageManipulator.FlipType.Vertical);

// 7. Extent (크기 및 오프셋 설정)
context.extent({
  originX: 0,
  originY: 0,
  width: 400,
  height: 400,
  backgroundColor: '#FFFFFF',
});

// 8. 저장 옵션
const result = await imageRef.saveAsync({
  format: SaveFormat.JPEG, // 또는 PNG, WEBP
  compress: 0.8, // 0.0 - 1.0
  base64: true, // Base64 포함
});

// 9. Reset (원본으로 되돌리기)
context.reset();

// 10. 체이닝 예제
const context = useImageManipulator(imageUri);
context
  .rotate(45)
  .resize({ width: 500 })
  .flip(FlipType.Horizontal)
  .crop({ originX: 50, originY: 50, width: 300, height: 300 });

const imageRef = await context.renderAsync();
const result = await imageRef.saveAsync({
  format: SaveFormat.PNG,
  compress: 1.0,
});`}
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
              • 모든 변환은 체이닝으로 순서대로 적용됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • renderAsync() 호출 전까지는 실제 변환이 실행되지 않음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Flip은 한 번에 하나의 축만 가능 (둘 다 하려면 두 번 호출)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Resize에서 하나만 지정하면 비율 유지하며 자동 계산
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • PNG는 무손실 압축, JPEG는 손실 압축
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • WEBP: iOS에서는 PNG로 대체될 수 있음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 결과 이미지는 캐시 디렉토리에 저장됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 원본 파일은 변경되지 않음
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
  imageContainer: {
    marginTop: 12,
    alignItems: 'center',
    gap: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionGroup: {
    marginTop: 16,
    gap: 8,
  },
  inputContainer: {
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    flex: 1,
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
    flex: 1,
    minWidth: 100,
  },
  infoContainer: {
    marginTop: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  uriText: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'right',
  },
  base64Text: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'right',
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
