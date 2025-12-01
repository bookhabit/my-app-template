import { useState } from 'react';
import { ScrollView, StyleSheet, View, Image } from 'react-native';

import { Asset, useAssets } from 'expo-asset';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function AssetScreen() {
  const { theme } = useTheme();
  const [downloadedAsset, setDownloadedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useAssets 훅 예제 - 여러 이미지 로드
  const [assets, assetsError] = useAssets([
    require('@/assets/images/icon.png'),
    require('@/assets/images/example_img.jpg'),
  ]);

  const downloadAsset = async () => {
    try {
      setLoading(true);
      setError(null);

      // Asset.fromModule을 사용하여 에셋 생성
      const asset = Asset.fromModule(require('@/assets/images/icon.png'));

      // 에셋 다운로드
      const downloaded = await asset.downloadAsync();

      setDownloadedAsset(downloaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : '다운로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const loadMultipleAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      // 여러 에셋을 한 번에 로드
      const loadedAssets = await Asset.loadAsync([
        require('@/assets/images/icon.png'),
        require('@/assets/images/example_img.jpg'),
      ]);

      console.log('로드된 에셋:', loadedAssets);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const clearDownloaded = () => {
    setDownloadedAsset(null);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Expo Asset" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Expo Asset
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          애셋(이미지, 폰트, 사운드 등) 다운로드 및 관리
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
              Asset (애셋)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 앱 실행 시 필요한 파일 (이미지, 폰트, 사운드 등)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • React Native의 require()로 참조 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 원격 서버에서 다운로드하여 로컬에 저장 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 개발 중: 로컬 파일, 배포 후: Expo 서버에서 제공
            </TextBox>
          </View>

          <View style={styles.conceptContainer}>
            <TextBox
              variant="body2"
              color={theme.primary}
              style={styles.conceptTitle}
            >
              주요 메서드
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `Asset.fromModule()`: require()로 에셋 생성
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `downloadAsync()`: 에셋을 로컬 캐시에 다운로드
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `loadAsync()`: 여러 에셋을 한 번에 로드
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • `useAssets()`: React 훅으로 에셋 로드
            </TextBox>
          </View>
        </View>

        {/* useAssets 훅 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            1. useAssets 훅 예제
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            React 훅을 사용하여 여러 에셋을 로드합니다.
          </TextBox>

          {assetsError && (
            <View style={[styles.errorContainer, { borderColor: theme.error }]}>
              <TextBox variant="body3" color={theme.error}>
                오류: {assetsError.message}
              </TextBox>
            </View>
          )}

          {assets && (
            <View style={styles.assetsContainer}>
              {assets.map((asset, index) => (
                <View
                  key={index}
                  style={[
                    styles.assetCard,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: asset.localUri || asset.uri }}
                    style={styles.assetImage}
                    resizeMode="contain"
                  />
                  <View style={styles.assetInfo}>
                    <TextBox variant="body3" color={theme.text}>
                      이름: {asset.name}
                    </TextBox>
                    <TextBox variant="body4" color={theme.textSecondary}>
                      타입: {asset.type}
                    </TextBox>
                    {asset.width && asset.height && (
                      <TextBox variant="body4" color={theme.textSecondary}>
                        크기: {asset.width} × {asset.height}
                      </TextBox>
                    )}
                    <TextBox variant="body4" color={theme.textSecondary}>
                      다운로드: {asset.downloaded ? '✅' : '❌'}
                    </TextBox>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* downloadAsync 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            2. downloadAsync 예제
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            에셋을 로컬 캐시에 다운로드합니다.
          </TextBox>

          <CustomButton
            title={loading ? '다운로드 중...' : '에셋 다운로드'}
            onPress={downloadAsset}
            disabled={loading}
            style={styles.button}
          />

          {downloadedAsset && (
            <View
              style={[styles.resultContainer, { borderColor: theme.success }]}
            >
              <TextBox
                variant="body2"
                color={theme.success}
                style={styles.resultTitle}
              >
                ✅ 다운로드 완료
              </TextBox>

              <View style={styles.assetMetadata}>
                <View style={styles.metadataRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    이름:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {downloadedAsset.name}
                  </TextBox>
                </View>

                <View style={styles.metadataRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    타입:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {downloadedAsset.type}
                  </TextBox>
                </View>

                {downloadedAsset.width && downloadedAsset.height && (
                  <View style={styles.metadataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      크기:
                    </TextBox>
                    <TextBox variant="body3" color={theme.text}>
                      {downloadedAsset.width} × {downloadedAsset.height}
                    </TextBox>
                  </View>
                )}

                {downloadedAsset.hash && (
                  <View style={styles.metadataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      해시:
                    </TextBox>
                    <TextBox
                      variant="body4"
                      color={theme.text}
                      style={styles.hashText}
                    >
                      {downloadedAsset.hash}
                    </TextBox>
                  </View>
                )}

                <View style={styles.metadataRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    원격 URI:
                  </TextBox>
                  <TextBox
                    variant="body4"
                    color={theme.text}
                    style={styles.uriText}
                  >
                    {downloadedAsset.uri}
                  </TextBox>
                </View>

                {downloadedAsset.localUri && (
                  <View style={styles.metadataRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      로컬 URI:
                    </TextBox>
                    <TextBox
                      variant="body4"
                      color={theme.text}
                      style={styles.uriText}
                    >
                      {downloadedAsset.localUri}
                    </TextBox>
                  </View>
                )}

                <View style={styles.metadataRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    다운로드됨:
                  </TextBox>
                  <TextBox variant="body3" color={theme.success}>
                    {downloadedAsset.downloaded ? '✅ 예' : '❌ 아니오'}
                  </TextBox>
                </View>
              </View>

              {downloadedAsset.localUri && (
                <View style={styles.imagePreview}>
                  <Image
                    source={{ uri: downloadedAsset.localUri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                </View>
              )}

              <CustomButton
                title="초기화"
                onPress={clearDownloaded}
                variant="ghost"
                style={styles.clearButton}
              />
            </View>
          )}

          {error && (
            <View style={[styles.errorContainer, { borderColor: theme.error }]}>
              <TextBox variant="body3" color={theme.error}>
                ❌ 오류: {error}
              </TextBox>
            </View>
          )}
        </View>

        {/* loadAsync 예제 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            3. loadAsync 예제
          </TextBox>
          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            여러 에셋을 한 번에 로드합니다.
          </TextBox>

          <CustomButton
            title={loading ? '로드 중...' : '여러 에셋 로드'}
            onPress={loadMultipleAssets}
            disabled={loading}
            style={styles.button}
          />

          {error && (
            <View style={[styles.errorContainer, { borderColor: theme.error }]}>
              <TextBox variant="body3" color={theme.error}>
                ❌ 오류: {error}
              </TextBox>
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
              {`// 1. useAssets 훅 사용
import { useAssets } from 'expo-asset';

const [assets, error] = useAssets([
  require('./assets/image1.png'),
  require('./assets/image2.png'),
]);

if (assets) {
  return <Image source={assets[0]} />;
}

// 2. Asset.fromModule() 사용
import { Asset } from 'expo-asset';

const asset = Asset.fromModule(require('./assets/image.png'));
const downloaded = await asset.downloadAsync();

console.log(downloaded.localUri); // 로컬 파일 경로
console.log(downloaded.uri);      // 원격 URI
console.log(downloaded.name);     // 파일 이름
console.log(downloaded.type);     // 파일 확장자
console.log(downloaded.width);    // 이미지 너비
console.log(downloaded.height);   // 이미지 높이
console.log(downloaded.hash);     // MD5 해시

// 3. loadAsync()로 여러 에셋 로드
import { Asset } from 'expo-asset';

const assets = await Asset.loadAsync([
  require('./assets/image1.png'),
  require('./assets/image2.png'),
]);

assets.forEach(asset => {
  console.log(asset.localUri);
});

// 4. 네트워크 URL에서 에셋 로드
import { Asset } from 'expo-asset';

const asset = Asset.fromURI('https://example.com/image.png');
const downloaded = await asset.downloadAsync();`}
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
              • 다운로드된 파일은 캐시 디렉토리에 저장됨
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • OS가 필요시 캐시를 자동으로 삭제할 수 있음
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 영구 저장이 필요하면 expo-file-system 사용 권장
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 배포 후에는 Expo 서버에서 에셋 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 개발 중에는 로컬 파일에서 직접 제공
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
  assetsContainer: {
    gap: 12,
    marginTop: 12,
  },
  assetCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  assetImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  assetInfo: {
    flex: 1,
    gap: 4,
  },
  resultContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  resultTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  assetMetadata: {
    gap: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  hashText: {
    fontFamily: 'monospace',
    fontSize: 10,
    flex: 1,
    textAlign: 'right',
  },
  uriText: {
    fontFamily: 'monospace',
    fontSize: 10,
    flex: 1,
    textAlign: 'right',
  },
  imagePreview: {
    marginTop: 12,
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  clearButton: {
    marginTop: 8,
  },
  errorContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
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
