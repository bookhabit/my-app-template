import { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Platform,
  TextInput,
  Linking,
} from 'react-native';

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { useTheme } from '@/context/ThemeProvider';

import TextBox from '@/components/common/TextBox';
import { CustomButton } from '@/components/common/button';
import CustomHeader from '@/components/layout/CustomHeader';

// Background Location Task 정의
const BACKGROUND_LOCATION_TASK = 'background-location-task';
const GEOFENCING_TASK = 'geofencing-task';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }
  if (data) {
    const { locations } = data as any;
    console.log('Background locations:', locations);
  }
});

TaskManager.defineTask(GEOFENCING_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Geofencing error:', error);
    return;
  }
  if (data) {
    const { eventType, region } = data as any;
    console.log('Geofencing event:', eventType, region);
  }
});

export default function LocationScreen() {
  const { theme } = useTheme();

  // Permissions
  const [foregroundPermission, requestForegroundPermission] =
    Location.useForegroundPermissions();
  const [backgroundPermission, requestBackgroundPermission] =
    Location.useBackgroundPermissions();

  // State
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [lastKnownLocation, setLastKnownLocation] =
    useState<Location.LocationObject | null>(null);
  const [watchingLocation, setWatchingLocation] =
    useState<Location.LocationObject | null>(null);
  const [heading, setHeading] = useState<Location.LocationHeadingObject | null>(
    null
  );
  const [geocodedAddress, setGeocodedAddress] = useState<string>('');
  const [reverseGeocodedLocation, setReverseGeocodedLocation] = useState<
    Location.LocationGeocodedLocation[]
  >([]);
  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null);
  const [headingSubscription, setHeadingSubscription] =
    useState<Location.LocationSubscription | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [isWatchingHeading, setIsWatchingHeading] = useState(false);
  const [hasServicesEnabled, setHasServicesEnabled] = useState<boolean | null>(
    null
  );
  const [providerStatus, setProviderStatus] =
    useState<Location.LocationProviderStatus | null>(null);
  const [isBackgroundLocationActive, setIsBackgroundLocationActive] =
    useState(false);
  const [isGeofencingActive, setIsGeofencingActive] = useState(false);

  // Options
  const [accuracy, setAccuracy] = useState<Location.Accuracy>(
    Location.Accuracy.Balanced
  );
  const [distanceInterval, setDistanceInterval] = useState('');
  const [timeInterval, setTimeInterval] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [requiredAccuracy, setRequiredAccuracy] = useState('');

  // Geocoding
  const [geocodeInput, setGeocodeInput] = useState('서울시청');
  const [reverseLatitude, setReverseLatitude] = useState('37.5665');
  const [reverseLongitude, setReverseLongitude] = useState('126.9780');

  // Geofencing
  const [geofenceLatitude, setGeofenceLatitude] = useState('37.5665');
  const [geofenceLongitude, setGeofenceLongitude] = useState('126.9780');
  const [geofenceRadius, setGeofenceRadius] = useState('100');
  const [geofenceIdentifier, setGeofenceIdentifier] = useState('');

  useEffect(() => {
    checkServicesEnabled();
    checkProviderStatus();
    checkBackgroundLocationStatus();
    checkGeofencingStatus();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (headingSubscription) {
        headingSubscription.remove();
      }
    };
  }, []);

  const checkServicesEnabled = async () => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      setHasServicesEnabled(enabled);
    } catch (error: any) {
      Alert.alert('오류', `서비스 확인 실패: ${error.message || error}`);
    }
  };

  const checkProviderStatus = async () => {
    try {
      const status = await Location.getProviderStatusAsync();
      setProviderStatus(status);
    } catch (error: any) {
      Alert.alert(
        '오류',
        `프로바이더 상태 확인 실패: ${error.message || error}`
      );
    }
  };

  const checkBackgroundLocationStatus = async () => {
    try {
      const isActive = await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK
      );
      setIsBackgroundLocationActive(isActive);
    } catch (error: any) {
      console.error('Background location status check failed:', error);
    }
  };

  const checkGeofencingStatus = async () => {
    try {
      const isActive =
        await Location.hasStartedGeofencingAsync(GEOFENCING_TASK);
      setIsGeofencingActive(isActive);
    } catch (error: any) {
      console.error('Geofencing status check failed:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      if (!foregroundPermission?.granted) {
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
        return;
      }

      const options: Location.LocationOptions = {};
      if (accuracy) options.accuracy = accuracy;
      if (distanceInterval)
        options.distanceInterval = parseFloat(distanceInterval);
      if (timeInterval) options.timeInterval = parseFloat(timeInterval);
      if (Platform.OS === 'android') {
        options.mayShowUserSettingsDialog = true;
      }

      const location = await Location.getCurrentPositionAsync(options);
      setCurrentLocation(location);
      Alert.alert('성공', '현재 위치를 가져왔습니다.');
    } catch (error: any) {
      Alert.alert('오류', `위치 가져오기 실패: ${error.message || error}`);
    }
  };

  const getLastKnownLocation = async () => {
    try {
      if (!foregroundPermission?.granted) {
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
        return;
      }

      const options: Location.LocationLastKnownOptions = {};
      if (maxAge) options.maxAge = parseFloat(maxAge);
      if (requiredAccuracy)
        options.requiredAccuracy = parseFloat(requiredAccuracy);

      const location = await Location.getLastKnownPositionAsync(options);
      if (location) {
        setLastKnownLocation(location);
        Alert.alert('성공', '마지막 알려진 위치를 가져왔습니다.');
      } else {
        Alert.alert('알림', '마지막 알려진 위치를 사용할 수 없습니다.');
        setLastKnownLocation(null);
      }
    } catch (error: any) {
      Alert.alert('오류', `위치 가져오기 실패: ${error.message || error}`);
    }
  };

  const startWatchingLocation = async () => {
    try {
      if (!foregroundPermission?.granted) {
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
        return;
      }

      const options: Location.LocationOptions = {};
      if (accuracy) options.accuracy = accuracy;
      if (distanceInterval)
        options.distanceInterval = parseFloat(distanceInterval);
      if (timeInterval) options.timeInterval = parseFloat(timeInterval);
      if (Platform.OS === 'android') {
        options.mayShowUserSettingsDialog = true;
      }

      const subscription = await Location.watchPositionAsync(
        options,
        (location) => {
          setWatchingLocation(location);
        },
        (error) => {
          Alert.alert('오류', `위치 업데이트 실패: ${error}`);
        }
      );

      setLocationSubscription(subscription);
      setIsWatching(true);
      Alert.alert('성공', '위치 감시를 시작했습니다.');
    } catch (error: any) {
      Alert.alert('오류', `위치 감시 시작 실패: ${error.message || error}`);
    }
  };

  const stopWatchingLocation = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
      setIsWatching(false);
      setWatchingLocation(null);
      Alert.alert('성공', '위치 감시를 중지했습니다.');
    }
  };

  const startWatchingHeading = async () => {
    try {
      if (!foregroundPermission?.granted) {
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
        return;
      }

      const subscription = await Location.watchHeadingAsync(
        (heading) => {
          setHeading(heading);
        },
        (error) => {
          Alert.alert('오류', `나침반 업데이트 실패: ${error}`);
        }
      );

      setHeadingSubscription(subscription);
      setIsWatchingHeading(true);
      Alert.alert('성공', '나침반 감시를 시작했습니다.');
    } catch (error: any) {
      Alert.alert('오류', `나침반 감시 시작 실패: ${error.message || error}`);
    }
  };

  const stopWatchingHeading = () => {
    if (headingSubscription) {
      headingSubscription.remove();
      setHeadingSubscription(null);
      setIsWatchingHeading(false);
      setHeading(null);
      Alert.alert('성공', '나침반 감시를 중지했습니다.');
    }
  };

  const getHeading = async () => {
    try {
      if (!foregroundPermission?.granted) {
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
        return;
      }

      const headingData = await Location.getHeadingAsync();
      setHeading(headingData);
      Alert.alert('성공', '나침반 정보를 가져왔습니다.');
    } catch (error: any) {
      Alert.alert('오류', `나침반 가져오기 실패: ${error.message || error}`);
    }
  };

  const geocodeAddress = async () => {
    try {
      if (!foregroundPermission?.granted) {
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
        return;
      }

      if (!geocodeInput.trim()) {
        Alert.alert('오류', '주소를 입력해주세요.');
        return;
      }

      const results = await Location.geocodeAsync(geocodeInput);
      setReverseGeocodedLocation(results);
      if (results.length > 0) {
        Alert.alert('성공', `${results.length}개의 위치를 찾았습니다.`);
      } else {
        Alert.alert('알림', '주소를 찾을 수 없습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', `지오코딩 실패: ${error.message || error}`);
    }
  };

  const reverseGeocodeLocation = async () => {
    try {
      if (!foregroundPermission?.granted) {
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
        return;
      }

      const lat = parseFloat(reverseLatitude);
      const lon = parseFloat(reverseLongitude);

      if (isNaN(lat) || isNaN(lon)) {
        Alert.alert('오류', '유효한 좌표를 입력해주세요.');
        return;
      }

      const results = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });

      if (results.length > 0) {
        const address = results[0];
        const addressParts = [
          address.country,
          address.region,
          address.city,
          address.district,
          address.street,
          address.streetNumber,
        ]
          .filter(Boolean)
          .join(' ');
        setGeocodedAddress(addressParts || '알 수 없음');
        Alert.alert('성공', '주소를 찾았습니다.');
      } else {
        Alert.alert('알림', '주소를 찾을 수 없습니다.');
        setGeocodedAddress('');
      }
    } catch (error: any) {
      Alert.alert('오류', `역지오코딩 실패: ${error.message || error}`);
    }
  };

  const startBackgroundLocation = async () => {
    try {
      if (!backgroundPermission?.granted) {
        Alert.alert('권한 필요', '백그라운드 위치 권한이 필요합니다.');
        return;
      }

      const options: Location.LocationTaskOptions = {
        accuracy: accuracy,
        distanceInterval: distanceInterval
          ? parseFloat(distanceInterval)
          : undefined,
        timeInterval: timeInterval ? parseFloat(timeInterval) : undefined,
        activityType: Location.ActivityType.Other,
        foregroundService: {
          notificationTitle: '위치 추적 중',
          notificationBody: '앱이 백그라운드에서 위치를 추적하고 있습니다.',
          notificationColor: '#FF0000',
        },
      };

      await Location.startLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK,
        options
      );
      setIsBackgroundLocationActive(true);
      Alert.alert('성공', '백그라운드 위치 업데이트를 시작했습니다.');
    } catch (error: any) {
      Alert.alert(
        '오류',
        `백그라운드 위치 시작 실패: ${error.message || error}`
      );
    }
  };

  const stopBackgroundLocation = async () => {
    try {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      setIsBackgroundLocationActive(false);
      Alert.alert('성공', '백그라운드 위치 업데이트를 중지했습니다.');
    } catch (error: any) {
      Alert.alert(
        '오류',
        `백그라운드 위치 중지 실패: ${error.message || error}`
      );
    }
  };

  const startGeofencing = async () => {
    try {
      if (!backgroundPermission?.granted) {
        Alert.alert('권한 필요', '백그라운드 위치 권한이 필요합니다.');
        return;
      }

      const lat = parseFloat(geofenceLatitude);
      const lon = parseFloat(geofenceLongitude);
      const radius = parseFloat(geofenceRadius);

      if (isNaN(lat) || isNaN(lon) || isNaN(radius)) {
        Alert.alert('오류', '유효한 좌표와 반경을 입력해주세요.');
        return;
      }

      const region: Location.LocationRegion = {
        latitude: lat,
        longitude: lon,
        radius: radius,
        identifier: geofenceIdentifier || undefined,
        notifyOnEnter: true,
        notifyOnExit: true,
      };

      await Location.startGeofencingAsync(GEOFENCING_TASK, [region]);
      setIsGeofencingActive(true);
      Alert.alert('성공', '지오펜싱을 시작했습니다.');
    } catch (error: any) {
      Alert.alert('오류', `지오펜싱 시작 실패: ${error.message || error}`);
    }
  };

  const stopGeofencing = async () => {
    try {
      await Location.stopGeofencingAsync(GEOFENCING_TASK);
      setIsGeofencingActive(false);
      Alert.alert('성공', '지오펜싱을 중지했습니다.');
    } catch (error: any) {
      Alert.alert('오류', `지오펜싱 중지 실패: ${error.message || error}`);
    }
  };

  const enableNetworkProvider = async () => {
    try {
      await Location.enableNetworkProviderAsync();
      Alert.alert('성공', '네트워크 프로바이더를 활성화했습니다.');
      await checkProviderStatus();
    } catch (error: any) {
      Alert.alert(
        '오류',
        `네트워크 프로바이더 활성화 실패: ${error.message || error}`
      );
    }
  };

  const formatCoordinate = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(6);
  };

  const getAccuracyText = (acc: Location.Accuracy): string => {
    switch (acc) {
      case Location.Accuracy.Lowest:
        return 'Lowest (약 3km)';
      case Location.Accuracy.Low:
        return 'Low (약 1km)';
      case Location.Accuracy.Balanced:
        return 'Balanced (약 100m)';
      case Location.Accuracy.High:
        return 'High (약 10m)';
      case Location.Accuracy.Highest:
        return 'Highest (최고 정확도)';
      case Location.Accuracy.BestForNavigation:
        return 'BestForNavigation (내비게이션용)';
      default:
        return `Unknown (${acc})`;
    }
  };

  const getHeadingAccuracyText = (accuracy: number): string => {
    switch (accuracy) {
      case 3:
        return '높음 (< 20°)';
      case 2:
        return '중간 (< 35°)';
      case 1:
        return '낮음 (< 50°)';
      case 0:
        return '없음 (> 50°)';
      default:
        return `Unknown (${accuracy})`;
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[{ paddingBottom: 20 }]}
    >
      <CustomHeader title="Location" showBackButton />
      <View style={styles.content}>
        <TextBox variant="title2" color={theme.text} style={styles.heading}>
          Location
        </TextBox>
        <TextBox
          variant="body3"
          color={theme.textSecondary}
          style={styles.subtitle}
        >
          위치 정보 및 지오코딩
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
              Location API
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 현재 위치 가져오기 (일회성)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 위치 업데이트 구독 (포그라운드)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 백그라운드 위치 추적
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 지오펜싱 (영역 진입/이탈 감지)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 나침반/방향 정보
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 지오코딩 (주소 → 좌표)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.conceptText}
            >
              • 역지오코딩 (좌표 → 주소)
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

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                포그라운드 권한:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  foregroundPermission?.granted
                    ? theme.success
                    : foregroundPermission?.status === 'denied'
                      ? theme.error
                      : theme.warning
                }
              >
                {foregroundPermission?.granted
                  ? '✅ 허용됨'
                  : foregroundPermission?.status === 'denied'
                    ? '❌ 거부됨'
                    : foregroundPermission?.status === 'undetermined'
                      ? '⏳ 미결정'
                      : '확인 중...'}
              </TextBox>
            </View>

            {foregroundPermission?.ios && (
              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  iOS Scope:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {foregroundPermission.ios.scope === 'always'
                    ? 'Always'
                    : foregroundPermission.ios.scope === 'whenInUse'
                      ? 'When In Use'
                      : 'None'}
                </TextBox>
              </View>
            )}

            {foregroundPermission?.android && (
              <View style={styles.infoRow}>
                <TextBox variant="body3" color={theme.textSecondary}>
                  Android Accuracy:
                </TextBox>
                <TextBox variant="body3" color={theme.text}>
                  {foregroundPermission.android.accuracy === 'fine'
                    ? 'Fine'
                    : foregroundPermission.android.accuracy === 'coarse'
                      ? 'Coarse'
                      : 'None'}
                </TextBox>
              </View>
            )}

            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                백그라운드 권한:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  backgroundPermission?.granted
                    ? theme.success
                    : backgroundPermission?.status === 'denied'
                      ? theme.error
                      : theme.warning
                }
              >
                {backgroundPermission?.granted
                  ? '✅ 허용됨'
                  : backgroundPermission?.status === 'denied'
                    ? '❌ 거부됨'
                    : backgroundPermission?.status === 'undetermined'
                      ? '⏳ 미결정'
                      : '확인 중...'}
              </TextBox>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="포그라운드 권한 요청"
              onPress={requestForegroundPermission}
              style={styles.button}
            />
            <CustomButton
              title="백그라운드 권한 요청"
              onPress={requestBackgroundPermission}
              variant="ghost"
              style={styles.button}
            />
          </View>

          {(!foregroundPermission?.canAskAgain ||
            !backgroundPermission?.canAskAgain) && (
            <CustomButton
              title="앱 설정 열기"
              onPress={openSettings}
              variant="ghost"
              style={styles.button}
            />
          )}
        </View>

        {/* 서비스 상태 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📊 서비스 상태
          </TextBox>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <TextBox variant="body3" color={theme.textSecondary}>
                위치 서비스 활성화:
              </TextBox>
              <TextBox
                variant="body3"
                color={
                  hasServicesEnabled === null
                    ? theme.textSecondary
                    : hasServicesEnabled
                      ? theme.success
                      : theme.error
                }
              >
                {hasServicesEnabled === null
                  ? '확인 중...'
                  : hasServicesEnabled
                    ? '✅ 활성화'
                    : '❌ 비활성화'}
              </TextBox>
            </View>

            {providerStatus && (
              <>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    백그라운드 모드:
                  </TextBox>
                  <TextBox
                    variant="body3"
                    color={
                      providerStatus.backgroundModeEnabled
                        ? theme.success
                        : theme.text
                    }
                  >
                    {providerStatus.backgroundModeEnabled
                      ? '✅ 활성화'
                      : '❌ 비활성화'}
                  </TextBox>
                </View>

                {providerStatus.gpsAvailable !== undefined && (
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      GPS 사용 가능:
                    </TextBox>
                    <TextBox
                      variant="body3"
                      color={
                        providerStatus.gpsAvailable
                          ? theme.success
                          : theme.error
                      }
                    >
                      {providerStatus.gpsAvailable
                        ? '✅ 사용 가능'
                        : '❌ 사용 불가'}
                    </TextBox>
                  </View>
                )}

                {providerStatus.networkAvailable !== undefined && (
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      네트워크 사용 가능:
                    </TextBox>
                    <TextBox
                      variant="body3"
                      color={
                        providerStatus.networkAvailable
                          ? theme.success
                          : theme.error
                      }
                    >
                      {providerStatus.networkAvailable
                        ? '✅ 사용 가능'
                        : '❌ 사용 불가'}
                    </TextBox>
                  </View>
                )}

                {providerStatus.passiveAvailable !== undefined && (
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      Passive 사용 가능:
                    </TextBox>
                    <TextBox
                      variant="body3"
                      color={
                        providerStatus.passiveAvailable
                          ? theme.success
                          : theme.error
                      }
                    >
                      {providerStatus.passiveAvailable
                        ? '✅ 사용 가능'
                        : '❌ 사용 불가'}
                    </TextBox>
                  </View>
                )}
              </>
            )}
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="서비스 확인"
              onPress={checkServicesEnabled}
              variant="ghost"
              style={styles.button}
            />
            <CustomButton
              title="프로바이더 확인"
              onPress={checkProviderStatus}
              variant="ghost"
              style={styles.button}
            />
          </View>

          {Platform.OS === 'android' && (
            <CustomButton
              title="네트워크 프로바이더 활성화"
              onPress={enableNetworkProvider}
              variant="ghost"
              style={styles.button}
            />
          )}
        </View>

        {/* 정확도 설정 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            ⚙️ 정확도 설정
          </TextBox>

          <View style={styles.accuracyButtons}>
            <CustomButton
              title="Lowest"
              onPress={() => setAccuracy(Location.Accuracy.Lowest)}
              variant={
                accuracy === Location.Accuracy.Lowest ? 'primary' : 'ghost'
              }
              style={styles.accuracyButton}
            />
            <CustomButton
              title="Low"
              onPress={() => setAccuracy(Location.Accuracy.Low)}
              variant={accuracy === Location.Accuracy.Low ? 'primary' : 'ghost'}
              style={styles.accuracyButton}
            />
            <CustomButton
              title="Balanced"
              onPress={() => setAccuracy(Location.Accuracy.Balanced)}
              variant={
                accuracy === Location.Accuracy.Balanced ? 'primary' : 'ghost'
              }
              style={styles.accuracyButton}
            />
            <CustomButton
              title="High"
              onPress={() => setAccuracy(Location.Accuracy.High)}
              variant={
                accuracy === Location.Accuracy.High ? 'primary' : 'ghost'
              }
              style={styles.accuracyButton}
            />
            <CustomButton
              title="Highest"
              onPress={() => setAccuracy(Location.Accuracy.Highest)}
              variant={
                accuracy === Location.Accuracy.Highest ? 'primary' : 'ghost'
              }
              style={styles.accuracyButton}
            />
            <CustomButton
              title="Navigation"
              onPress={() => setAccuracy(Location.Accuracy.BestForNavigation)}
              variant={
                accuracy === Location.Accuracy.BestForNavigation
                  ? 'primary'
                  : 'ghost'
              }
              style={styles.accuracyButton}
            />
          </View>

          <TextBox variant="body4" color={theme.textSecondary}>
            현재: {getAccuracyText(accuracy)}
          </TextBox>

          <View style={styles.inputGroup}>
            <TextBox variant="body3" color={theme.text}>
              거리 간격 (m):
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={distanceInterval}
              onChangeText={setDistanceInterval}
              placeholder="100"
              keyboardType="numeric"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          {Platform.OS === 'ios' && (
            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text}>
                시간 간격 (ms):
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={timeInterval}
                onChangeText={setTimeInterval}
                placeholder="1000"
                keyboardType="numeric"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          )}
        </View>

        {/* 현재 위치 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            📍 현재 위치
          </TextBox>

          {currentLocation && (
            <View
              style={[
                styles.locationCard,
                { backgroundColor: theme.background },
              ]}
            >
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    위도:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {formatCoordinate(currentLocation.coords.latitude)}
                  </TextBox>
                </View>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    경도:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {formatCoordinate(currentLocation.coords.longitude)}
                  </TextBox>
                </View>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    정확도:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {formatCoordinate(currentLocation.coords.accuracy)}m
                  </TextBox>
                </View>
                {currentLocation.coords.altitude !== null && (
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      고도:
                    </TextBox>
                    <TextBox variant="body3" color={theme.text}>
                      {formatCoordinate(currentLocation.coords.altitude)}m
                    </TextBox>
                  </View>
                )}
                {currentLocation.coords.speed !== null && (
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      속도:
                    </TextBox>
                    <TextBox variant="body3" color={theme.text}>
                      {formatCoordinate(currentLocation.coords.speed)}m/s
                    </TextBox>
                  </View>
                )}
                {currentLocation.coords.heading !== null && (
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      방향:
                    </TextBox>
                    <TextBox variant="body3" color={theme.text}>
                      {formatCoordinate(currentLocation.coords.heading)}°
                    </TextBox>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    타임스탬프:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {new Date(currentLocation.timestamp).toLocaleString(
                      'ko-KR'
                    )}
                  </TextBox>
                </View>
                {currentLocation.mocked !== undefined && (
                  <View style={styles.infoRow}>
                    <TextBox variant="body3" color={theme.textSecondary}>
                      모의 위치:
                    </TextBox>
                    <TextBox
                      variant="body3"
                      color={
                        currentLocation.mocked ? theme.warning : theme.text
                      }
                    >
                      {currentLocation.mocked ? '✅ 모의 위치' : '❌ 실제 위치'}
                    </TextBox>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.buttonRow}>
            <CustomButton
              title="현재 위치 가져오기"
              onPress={getCurrentLocation}
              style={styles.button}
              disabled={!foregroundPermission?.granted}
            />
            <CustomButton
              title="마지막 알려진 위치"
              onPress={getLastKnownLocation}
              variant="ghost"
              style={styles.button}
              disabled={!foregroundPermission?.granted}
            />
          </View>

          {lastKnownLocation && (
            <View
              style={[
                styles.locationCard,
                { backgroundColor: theme.background },
              ]}
            >
              <TextBox variant="body2" color={theme.text}>
                마지막 알려진 위치:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                {formatCoordinate(lastKnownLocation.coords.latitude)},{' '}
                {formatCoordinate(lastKnownLocation.coords.longitude)}
              </TextBox>
            </View>
          )}

          <View style={styles.inputGroup}>
            <TextBox variant="body3" color={theme.text}>
              최대 나이 (ms):
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={maxAge}
              onChangeText={setMaxAge}
              placeholder="60000"
              keyboardType="numeric"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextBox variant="body3" color={theme.text}>
              필수 정확도 (m):
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={requiredAccuracy}
              onChangeText={setRequiredAccuracy}
              placeholder="100"
              keyboardType="numeric"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
        </View>

        {/* 위치 감시 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            👁️ 위치 감시 (포그라운드)
          </TextBox>

          <View style={styles.infoRow}>
            <TextBox variant="body3" color={theme.textSecondary}>
              감시 상태:
            </TextBox>
            <TextBox
              variant="body3"
              color={isWatching ? theme.success : theme.text}
            >
              {isWatching ? '✅ 감시 중' : '❌ 중지됨'}
            </TextBox>
          </View>

          {watchingLocation && (
            <View
              style={[
                styles.locationCard,
                { backgroundColor: theme.background },
              ]}
            >
              <TextBox variant="body2" color={theme.text}>
                실시간 위치:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                {formatCoordinate(watchingLocation.coords.latitude)},{' '}
                {formatCoordinate(watchingLocation.coords.longitude)}
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                정확도: {formatCoordinate(watchingLocation.coords.accuracy)}m
              </TextBox>
            </View>
          )}

          <View style={styles.buttonRow}>
            <CustomButton
              title={isWatching ? '감시 중지' : '감시 시작'}
              onPress={
                isWatching ? stopWatchingLocation : startWatchingLocation
              }
              style={styles.button}
              disabled={!foregroundPermission?.granted}
            />
          </View>
        </View>

        {/* 나침반 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🧭 나침반
          </TextBox>

          {heading && (
            <View
              style={[
                styles.locationCard,
                { backgroundColor: theme.background },
              ]}
            >
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    자북:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {formatCoordinate(heading.trueHeading)}°
                  </TextBox>
                </View>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    자석 북:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {formatCoordinate(heading.magHeading)}°
                  </TextBox>
                </View>
                <View style={styles.infoRow}>
                  <TextBox variant="body3" color={theme.textSecondary}>
                    정확도:
                  </TextBox>
                  <TextBox variant="body3" color={theme.text}>
                    {getHeadingAccuracyText(heading.accuracy)}
                  </TextBox>
                </View>
              </View>
            </View>
          )}

          <View style={styles.buttonRow}>
            <CustomButton
              title="나침반 정보 가져오기"
              onPress={getHeading}
              style={styles.button}
              disabled={!foregroundPermission?.granted}
            />
            <CustomButton
              title={isWatchingHeading ? '감시 중지' : '감시 시작'}
              onPress={
                isWatchingHeading ? stopWatchingHeading : startWatchingHeading
              }
              variant="ghost"
              style={styles.button}
              disabled={!foregroundPermission?.granted}
            />
          </View>
        </View>

        {/* 지오코딩 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🗺️ 지오코딩
          </TextBox>

          <View style={styles.inputGroup}>
            <TextBox variant="body3" color={theme.text}>
              주소:
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={geocodeInput}
              onChangeText={setGeocodeInput}
              placeholder="서울시청"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <CustomButton
            title="주소 → 좌표 변환"
            onPress={geocodeAddress}
            style={styles.button}
            disabled={!foregroundPermission?.granted}
          />

          {reverseGeocodedLocation.length > 0 && (
            <View style={styles.geocodeResults}>
              {reverseGeocodedLocation.map((loc, index) => (
                <View
                  key={index}
                  style={[
                    styles.locationCard,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <TextBox variant="body2" color={theme.text}>
                    결과 #{index + 1}
                  </TextBox>
                  <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                      <TextBox variant="body3" color={theme.textSecondary}>
                        위도:
                      </TextBox>
                      <TextBox variant="body3" color={theme.text}>
                        {formatCoordinate(loc.latitude)}
                      </TextBox>
                    </View>
                    <View style={styles.infoRow}>
                      <TextBox variant="body3" color={theme.textSecondary}>
                        경도:
                      </TextBox>
                      <TextBox variant="body3" color={theme.text}>
                        {formatCoordinate(loc.longitude)}
                      </TextBox>
                    </View>
                    {loc.accuracy && (
                      <View style={styles.infoRow}>
                        <TextBox variant="body3" color={theme.textSecondary}>
                          정확도:
                        </TextBox>
                        <TextBox variant="body3" color={theme.text}>
                          {formatCoordinate(loc.accuracy)}m
                        </TextBox>
                      </View>
                    )}
                    {loc.altitude && (
                      <View style={styles.infoRow}>
                        <TextBox variant="body3" color={theme.textSecondary}>
                          고도:
                        </TextBox>
                        <TextBox variant="body3" color={theme.text}>
                          {formatCoordinate(loc.altitude)}m
                        </TextBox>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 역지오코딩 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🗺️ 역지오코딩
          </TextBox>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text}>
                위도:
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={reverseLatitude}
                onChangeText={setReverseLatitude}
                placeholder="37.5665"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            <View style={styles.inputGroup}>
              <TextBox variant="body3" color={theme.text}>
                경도:
              </TextBox>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={reverseLongitude}
                onChangeText={setReverseLongitude}
                placeholder="126.9780"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>

          <CustomButton
            title="좌표 → 주소 변환"
            onPress={reverseGeocodeLocation}
            style={styles.button}
            disabled={!foregroundPermission?.granted}
          />

          {geocodedAddress && (
            <View
              style={[
                styles.locationCard,
                { backgroundColor: theme.background },
              ]}
            >
              <TextBox variant="body2" color={theme.text}>
                주소:
              </TextBox>
              <TextBox variant="body4" color={theme.textSecondary}>
                {geocodedAddress}
              </TextBox>
            </View>
          )}
        </View>

        {/* 백그라운드 위치 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🔄 백그라운드 위치 추적
          </TextBox>

          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            백그라운드 위치 추적은 개발 빌드에서만 사용 가능합니다. Expo
            Go에서는 지원되지 않습니다.
          </TextBox>

          <View style={styles.infoRow}>
            <TextBox variant="body3" color={theme.textSecondary}>
              상태:
            </TextBox>
            <TextBox
              variant="body3"
              color={isBackgroundLocationActive ? theme.success : theme.text}
            >
              {isBackgroundLocationActive ? '✅ 활성화' : '❌ 비활성화'}
            </TextBox>
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="시작"
              onPress={startBackgroundLocation}
              style={styles.button}
              disabled={!backgroundPermission?.granted}
            />
            <CustomButton
              title="중지"
              onPress={stopBackgroundLocation}
              variant="ghost"
              style={styles.button}
              disabled={!isBackgroundLocationActive}
            />
          </View>

          <CustomButton
            title="상태 확인"
            onPress={checkBackgroundLocationStatus}
            variant="ghost"
            style={styles.button}
          />
        </View>

        {/* 지오펜싱 */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TextBox
            variant="title4"
            color={theme.text}
            style={styles.sectionTitle}
          >
            🎯 지오펜싱
          </TextBox>

          <TextBox
            variant="body4"
            color={theme.textSecondary}
            style={styles.description}
          >
            지오펜싱은 개발 빌드에서만 사용 가능합니다. 최대 100개의 영역을
            모니터링할 수 있습니다.
          </TextBox>

          <View style={styles.infoRow}>
            <TextBox variant="body3" color={theme.textSecondary}>
              상태:
            </TextBox>
            <TextBox
              variant="body3"
              color={isGeofencingActive ? theme.success : theme.text}
            >
              {isGeofencingActive ? '✅ 활성화' : '❌ 비활성화'}
            </TextBox>
          </View>

          <View style={styles.inputGroup}>
            <TextBox variant="body3" color={theme.text}>
              위도:
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={geofenceLatitude}
              onChangeText={setGeofenceLatitude}
              placeholder="37.5665"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextBox variant="body3" color={theme.text}>
              경도:
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={geofenceLongitude}
              onChangeText={setGeofenceLongitude}
              placeholder="126.9780"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextBox variant="body3" color={theme.text}>
              반경 (m):
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={geofenceRadius}
              onChangeText={setGeofenceRadius}
              placeholder="100"
              keyboardType="numeric"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextBox variant="body3" color={theme.text}>
              식별자 (선택사항):
            </TextBox>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={geofenceIdentifier}
              onChangeText={setGeofenceIdentifier}
              placeholder="my-region"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="시작"
              onPress={startGeofencing}
              style={styles.button}
              disabled={!backgroundPermission?.granted}
            />
            <CustomButton
              title="중지"
              onPress={stopGeofencing}
              variant="ghost"
              style={styles.button}
              disabled={!isGeofencingActive}
            />
          </View>

          <CustomButton
            title="상태 확인"
            onPress={checkGeofencingStatus}
            variant="ghost"
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
              {`// 1. 기본 사용 (현재 위치)
import * as Location from 'expo-location';

const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  Alert.alert('권한 필요', '위치 권한이 필요합니다.');
  return;
}

const location = await Location.getCurrentPositionAsync({});
console.log('위도:', location.coords.latitude);
console.log('경도:', location.coords.longitude);

// 2. 정확도 설정
const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.High,
});

// 3. 마지막 알려진 위치
const location = await Location.getLastKnownPositionAsync({
  maxAge: 60000, // 1분 이내
  requiredAccuracy: 100, // 100m 이내
});

// 4. 위치 감시 (포그라운드)
const subscription = await Location.watchPositionAsync(
  { accuracy: Location.Accuracy.Balanced },
  (location) => {
    console.log('새 위치:', location.coords);
  }
);

// 나중에 구독 해제
subscription.remove();

// 5. 나침반
const subscription = await Location.watchHeadingAsync(
  (heading) => {
    console.log('자북:', heading.trueHeading);
    console.log('자석 북:', heading.magHeading);
    console.log('정확도:', heading.accuracy);
  }
);

// 6. 나침반 정보 가져오기
const heading = await Location.getHeadingAsync();
console.log('방향:', heading.trueHeading);

// 7. 지오코딩 (주소 → 좌표)
const results = await Location.geocodeAsync('서울시청');
results.forEach(loc => {
  console.log('위도:', loc.latitude);
  console.log('경도:', loc.longitude);
});

// 8. 역지오코딩 (좌표 → 주소)
const results = await Location.reverseGeocodeAsync({
  latitude: 37.5665,
  longitude: 126.9780,
});

if (results.length > 0) {
  const address = results[0];
  console.log('국가:', address.country);
  console.log('지역:', address.region);
  console.log('도시:', address.city);
  console.log('주소:', address.formattedAddress);
}

// 9. 백그라운드 위치 추적
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_LOCATION_TASK = 'background-location';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
  if (error) {
    console.error('오류:', error);
    return;
  }
  if (data) {
    const { locations } = data as any;
    console.log('백그라운드 위치:', locations);
  }
});

// 백그라운드 권한 요청
const { status } = await Location.requestBackgroundPermissionsAsync();
if (status === 'granted') {
  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    foregroundService: {
      notificationTitle: '위치 추적 중',
      notificationBody: '앱이 위치를 추적하고 있습니다.',
      notificationColor: '#FF0000',
    },
  });
}

// 중지
await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);

// 10. 지오펜싱
import { GeofencingEventType } from 'expo-location';

const GEOFENCING_TASK = 'geofencing';

TaskManager.defineTask(GEOFENCING_TASK, ({ data, error }) => {
  if (error) {
    console.error('오류:', error);
    return;
  }
  if (data) {
    const { eventType, region } = data as any;
    if (eventType === GeofencingEventType.Enter) {
      console.log('영역 진입:', region);
    } else if (eventType === GeofencingEventType.Exit) {
      console.log('영역 이탈:', region);
    }
  }
});

const region: Location.LocationRegion = {
  latitude: 37.5665,
  longitude: 126.9780,
  radius: 100, // 100m
  identifier: 'my-region',
  notifyOnEnter: true,
  notifyOnExit: true,
};

await Location.startGeofencingAsync(GEOFENCING_TASK, [region]);

// 중지
await Location.stopGeofencingAsync(GEOFENCING_TASK);

// 11. 서비스 상태 확인
const enabled = await Location.hasServicesEnabledAsync();
const status = await Location.getProviderStatusAsync();

console.log('위치 서비스:', enabled);
console.log('GPS 사용 가능:', status.gpsAvailable);
console.log('네트워크 사용 가능:', status.networkAvailable);

// 12. Android: 네트워크 프로바이더 활성화
await Location.enableNetworkProviderAsync();

// 13. Hook 사용
import { useForegroundPermissions, useBackgroundPermissions } from 'expo-location';

function MyComponent() {
  const [foregroundStatus, requestForeground] = useForegroundPermissions();
  const [backgroundStatus, requestBackground] = useBackgroundPermissions();
  
  // 권한 상태 자동 업데이트
}

// 14. 여러 정확도 옵션
Location.Accuracy.Lowest // 약 3km
Location.Accuracy.Low // 약 1km
Location.Accuracy.Balanced // 약 100m
Location.Accuracy.High // 약 10m
Location.Accuracy.Highest // 최고 정확도
Location.Accuracy.BestForNavigation // 내비게이션용

// 15. ActivityType (백그라운드)
Location.ActivityType.Other // 기본
Location.ActivityType.AutomotiveNavigation // 자동차 내비게이션
Location.ActivityType.Fitness // 피트니스
Location.ActivityType.OtherNavigation // 기타 내비게이션
Location.ActivityType.Airborne // 항공 (지원되지 않을 수 있음)`}
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
              • 백그라운드 위치 및 지오펜싱은 개발 빌드 필요 (Expo Go 미지원)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: 백그라운드 권한은 포그라운드 권한 후 요청
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android 11+: 백그라운드 권한은 설정에서 수동 허용 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 지오코딩은 리소스 소모가 큼 (과도한 요청 주의)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 지오펜싱: 최대 100개 영역, 동시 모니터링 20개 제한
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 백그라운드 위치: 앱 종료 시 중지, 재시작 시 재개
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • 배터리 소모에 주의 (높은 정확도 사용 시)
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • iOS: trueHeading은 위치 권한 필요
            </TextBox>
            <TextBox
              variant="body4"
              color={theme.text}
              style={styles.warningItem}
            >
              • Android: mayShowUserSettingsDialog로 설정 다이얼로그 표시
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
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  accuracyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accuracyButton: {
    flex: 1,
    minWidth: '30%',
  },
  inputGroup: {
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
  locationCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 12,
  },
  geocodeResults: {
    marginTop: 12,
    gap: 12,
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
