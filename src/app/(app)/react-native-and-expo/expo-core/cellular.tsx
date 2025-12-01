import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';

import * as Cellular from 'expo-cellular';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

export default function CellularScreen() {
  const { theme } = useTheme();

  // Permissions
  const [permission, requestPermission] = Cellular.usePermissions();

  // Cellular data state
  const [carrierName, setCarrierName] = useState<string | null>(null);
  const [isoCountryCode, setIsoCountryCode] = useState<string | null>(null);
  const [mobileCountryCode, setMobileCountryCode] = useState<string | null>(
    null
  );
  const [mobileNetworkCode, setMobileNetworkCode] = useState<string | null>(
    null
  );
  const [allowsVoip, setAllowsVoip] = useState<boolean | null>(null);
  const [cellularGeneration, setCellularGeneration] =
    useState<Cellular.CellularGeneration | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permission?.granted) {
      loadCellularData();
    }
  }, [permission?.granted]);

  const loadCellularData = async () => {
    setLoading(true);
    try {
      const [carrier, isoCode, mcc, mnc, voip, generation] = await Promise.all([
        Cellular.getCarrierNameAsync(),
        Cellular.getIsoCountryCodeAsync(),
        Cellular.getMobileCountryCodeAsync(),
        Cellular.getMobileNetworkCodeAsync(),
        Cellular.allowsVoipAsync(),
        Cellular.getCellularGenerationAsync(),
      ]);

      setCarrierName(carrier);
      setIsoCountryCode(isoCode);
      setMobileCountryCode(mcc);
      setMobileNetworkCode(mnc);
      setAllowsVoip(voip);
      setCellularGeneration(generation);
    } catch (error) {
      console.error('Failed to load cellular data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadCellularData();
  };

  const getGenerationText = (
    generation: Cellular.CellularGeneration | null
  ) => {
    if (generation === null) return '알 수 없음';
    switch (generation) {
      case Cellular.CellularGeneration.UNKNOWN:
        return '알 수 없음';
      case Cellular.CellularGeneration.CELLULAR_2G:
        return '2G (CDMA, EDGE, GPRS, IDEN)';
      case Cellular.CellularGeneration.CELLULAR_3G:
        return '3G (EHRPD, EVDO, HSPA, HSUPA, HSDPA, HSPAP, UTMS)';
      case Cellular.CellularGeneration.CELLULAR_4G:
        return '4G (LTE)';
      case Cellular.CellularGeneration.CELLULAR_5G:
        return '5G (NR, NRNSA)';
      default:
        return '알 수 없음';
    }
  };

  const getGenerationColor = (
    generation: Cellular.CellularGeneration | null
  ) => {
    if (generation === null) return theme.textSecondary;
    switch (generation) {
      case Cellular.CellularGeneration.CELLULAR_5G:
        return theme.success;
      case Cellular.CellularGeneration.CELLULAR_4G:
        return theme.primary;
      case Cellular.CellularGeneration.CELLULAR_3G:
        return theme.warning;
      case Cellular.CellularGeneration.CELLULAR_2G:
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Cellular" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Cellular
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          셀룰러 서비스 제공자 정보 및 연결 상태
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
              Cellular API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 사용자의 셀룰러 서비스 제공자 정보 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 통신사 이름, 국가 코드, 네트워크 코드 조회
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 현재 셀룰러 네트워크 세대 확인 (2G/3G/4G/5G)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • VoIP 통화 지원 여부 확인
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • Android: READ_PHONE_STATE 권한 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • iOS: 권한 불필요
            </TextBox>
          </View>
        </View>

        {/* 권한 상태 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🔐 권한 상태
          </TextBox>

          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                권한 상태:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  permission?.granted
                    ? theme.success
                    : permission?.status === 'denied'
                      ? theme.error
                      : theme.textSecondary
                }
              >
                {permission?.granted
                  ? '✅ 허용됨'
                  : permission?.status === 'denied'
                    ? '❌ 거부됨'
                    : permission?.status === 'undetermined'
                      ? '확인 필요'
                      : '확인 중...'}
              </TextBox>
            </View>

            {Platform.OS === 'android' && !permission?.granted && (
              <CustomButton
                title="권한 요청"
                onPress={requestPermission}
                style={styles.button}
              />
            )}

            {Platform.OS === 'ios' && (
              <TextBox variant="body4" color={theme.textSecondary}>
                iOS에서는 권한이 필요하지 않습니다.
              </TextBox>
            )}
          </View>
        </View>

        {/* 셀룰러 정보 */}
        {permission?.granted && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <TextBox
              variant="title4"
              color={theme.text}
              style={styles.sectionTitle}
            >
              📡 셀룰러 정보
            </TextBox>

            <View style={styles.buttonRow}>
              <CustomButton
                title="정보 새로고침"
                onPress={refreshData}
                style={styles.button}
                disabled={loading}
              />
            </View>

            {loading && (
              <TextBox variant="body3" color={theme.textSecondary}>
                로딩 중...
              </TextBox>
            )}

            {/* 공기계/시뮬레이터 안내 */}
            {!carrierName &&
              !isoCountryCode &&
              !mobileCountryCode &&
              !mobileNetworkCode &&
              !loading && (
                <View
                  style={[
                    styles.warningContainer,
                    { backgroundColor: 'rgba(255, 193, 7, 0.1)' },
                  ]}
                >
                  <TextBox variant="body4" color={theme.warning}>
                    ⚠️ 공기계 또는 시뮬레이터에서는 SIM 카드가 없어 대부분의
                    정보가 null로 표시됩니다. 실제 기기에서 SIM 카드를 사용하면
                    정보가 표시됩니다.
                  </TextBox>
                </View>
              )}

            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  통신사 이름:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {carrierName || '알 수 없음'}
                </TextBox>
              </View>

              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  ISO 국가 코드:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {isoCountryCode || '알 수 없음'}
                </TextBox>
              </View>

              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  이동통신 국가 코드 (MCC):
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {mobileCountryCode || '알 수 없음'}
                </TextBox>
              </View>

              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  이동통신 네트워크 코드 (MNC):
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {mobileNetworkCode || '알 수 없음'}
                </TextBox>
              </View>

              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  VoIP 지원:
                </TextBox>
                <TextBox
                  variant="body3"
                  color={
                    allowsVoip === true
                      ? theme.success
                      : allowsVoip === false
                        ? theme.error
                        : theme.textSecondary
                  }
                >
                  {allowsVoip === true
                    ? '✅ 지원'
                    : allowsVoip === false
                      ? '❌ 미지원'
                      : '알 수 없음'}
                </TextBox>
              </View>

              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  셀룰러 세대:
                </TextBox>
                <TextBox
                  variant="body3"
                  color={getGenerationColor(cellularGeneration)}
                >
                  {getGenerationText(cellularGeneration)}
                </TextBox>
              </View>
            </View>
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
              {`// 1. 권한 확인 및 요청
import * as Cellular from 'expo-cellular';

const [permission, requestPermission] = Cellular.usePermissions();

if (!permission?.granted) {
  await requestPermission();
}

// 2. 통신사 정보 조회
const carrierName = await Cellular.getCarrierNameAsync();
// "T-Mobile" or "Verizon" or null

const isoCode = await Cellular.getIsoCountryCodeAsync();
// "us" or "au" or null

const mcc = await Cellular.getMobileCountryCodeAsync();
// "310" or null

const mnc = await Cellular.getMobileNetworkCodeAsync();
// "260" or null

// 3. VoIP 지원 여부 확인
const allowsVoip = await Cellular.allowsVoipAsync();
// true or false or null

// 4. 셀룰러 세대 확인
const generation = await Cellular.getCellularGenerationAsync();
// CellularGeneration.CELLULAR_4G
// CellularGeneration.CELLULAR_5G
// CellularGeneration.UNKNOWN

switch (generation) {
  case Cellular.CellularGeneration.CELLULAR_2G:
    console.log('2G 네트워크');
    break;
  case Cellular.CellularGeneration.CELLULAR_3G:
    console.log('3G 네트워크');
    break;
  case Cellular.CellularGeneration.CELLULAR_4G:
    console.log('4G 네트워크');
    break;
  case Cellular.CellularGeneration.CELLULAR_5G:
    console.log('5G 네트워크');
    break;
  default:
    console.log('알 수 없음');
}

// 5. 모든 정보 한번에 가져오기
const [
  carrier,
  isoCode,
  mcc,
  mnc,
  voip,
  generation,
] = await Promise.all([
  Cellular.getCarrierNameAsync(),
  Cellular.getIsoCountryCodeAsync(),
  Cellular.getMobileCountryCodeAsync(),
  Cellular.getMobileNetworkCodeAsync(),
  Cellular.allowsVoipAsync(),
  Cellular.getCellularGenerationAsync(),
]);`}
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
              • Android: READ_PHONE_STATE 권한 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: 권한 불필요 (시스템 정보만 조회)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • SIM 카드가 없거나 비행기 모드일 때 null 반환 가능
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: SIM_STATE_READY 상태일 때만 정보 제공
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 듀얼 SIM 기기에서는 활성 SIM 카드 정보만 반환
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 웹에서는 대부분 null 반환 (일부 정보만 navigator.connection
              사용)
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
  statusContainer: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
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
