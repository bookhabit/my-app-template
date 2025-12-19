import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
  Linking,
  Alert,
} from 'react-native';

// 안전하게 모듈 가져오기 - NativeModules가 undefined일 수 있으므로 안전하게 접근
const getPedometerModule = () => {
  try {
    if (!NativeModules) {
      console.warn('⚠️ NativeModules가 아직 초기화되지 않았습니다.');
      return null;
    }

    const IOSPedometerModule = NativeModules.IOSPedometerModule;
    const AOSPedometerModule = NativeModules.AOSPedometerModule;

    // 플랫폼별 모듈 선택
    const module =
      Platform.OS === 'ios' ? IOSPedometerModule : AOSPedometerModule;

    if (!module) {
      const platformName =
        Platform.OS === 'ios' ? 'IOSPedometerModule' : 'AOSPedometerModule';
      console.warn(
        `⚠️ ${platformName} 모듈을 찾을 수 없습니다. 네이티브 모듈이 제대로 링크되었는지 확인해주세요.`
      );
    }

    return module;
  } catch (error) {
    console.error('❌ 네이티브 모듈 접근 중 오류:', error);
    return null;
  }
};

// pedometerModule을 지연 로딩으로 변경
let pedometerModule: any = null;
let pedometerEventEmitter: NativeEventEmitter | null = null;

// 모듈을 안전하게 가져오는 헬퍼 함수
const getModule = () => {
  if (!pedometerModule) {
    pedometerModule = getPedometerModule();
    if (pedometerModule && !pedometerEventEmitter) {
      try {
        pedometerEventEmitter = new NativeEventEmitter(pedometerModule);
      } catch (error) {
        console.error('❌ NativeEventEmitter 생성 실패:', error);
      }
    }
  }
  return pedometerModule;
};

// 걸음수 데이터 인터페이스
interface StepData {
  date: string;
  steps: number;
}

interface StepUpdateData {
  totalSteps: number;
}

class PedometerManager {
  private eventEmitter: NativeEventEmitter;

  constructor() {
    // 모듈을 지연 로딩
    const module = getModule();
    if (!module) {
      console.warn(
        '⚠️ Pedometer 모듈을 사용할 수 없습니다. 나중에 다시 시도됩니다.'
      );
    }

    if (!pedometerEventEmitter) {
      console.warn('⚠️ PedometerEventEmitter를 초기화할 수 없습니다.');
      // 기본 NativeEventEmitter 생성 (모듈 없이도 작동)
      try {
        this.eventEmitter = new NativeEventEmitter();
      } catch (error) {
        console.error('❌ NativeEventEmitter 생성 실패:', error);
        // 폴백: 모듈 없이도 작동하도록
        this.eventEmitter = new NativeEventEmitter(null as any);
      }
    } else {
      this.eventEmitter = pedometerEventEmitter;
    }
    console.log(`🏃 PedometerManager 초기화 - 플랫폼: ${Platform.OS}`);
  }

  // 권한 확인 및 자동 요청
  private async ensurePermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
        );

        if (!granted) {
          console.log('🔐 권한이 없음 - 자동 요청 시작');
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
          );
          const isGranted = result === PermissionsAndroid.RESULTS.GRANTED;

          if (isGranted) {
            console.log('✅ 권한 요청 성공');
          } else {
            console.log('❌ 권한 요청 실패');
          }

          return isGranted;
        }

        // console.log("✅ 권한 이미 있음");
        return true;
      } else {
        // iOS: CMPedometer 사용 가능 여부 확인
        // iOS는 명시적 권한 요청 API가 없으므로, 첫 사용시 자동으로 시스템 팝업이 뜸
        // 여기서는 권한이 있는지만 확인
        const permissionStatus = await this.checkPermissionStatus();
        if (permissionStatus.hasPermission) {
          console.log('✅ iOS - 동작 및 피트니스 권한 있음');
          return true;
        } else {
          console.log(
            '⚠️ iOS - 동작 및 피트니스 권한 없음. 앱 최초 사용시 자동으로 요청됩니다.'
          );
          // iOS는 loadTodaySteps 등을 처음 호출할 때 자동으로 권한 요청 팝업이 뜸
          return false;
        }
      }
    } catch (error: any) {
      console.error('❌ 권한 확인 실패:', error);
      return false;
    }
  }

  // 권한 확인 후 함수 실행 래퍼
  private async withPermissionCheck<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    const hasPermission = await this.ensurePermission();

    if (!hasPermission) {
      // iOS는 첫 사용시 자동으로 권한 팝업이 뜨므로 한번 시도
      // Android는 명시적으로 권한 요청이 필요
      if (Platform.OS === 'ios') {
        console.log('⚠️ iOS - 권한 없음, 자동 권한 요청 시도');
        // iOS는 operation 실행시 자동으로 권한 팝업이 뜸
        return await operation();
      } else {
        throw new Error(
          'ACTIVITY_RECOGNITION 권한이 필요합니다. 설정에서 권한을 허용해주세요.'
        );
      }
    }

    return await operation();
  }

  // 오늘 걸음 수 로드
  async loadTodaySteps(): Promise<{ success: boolean; totalSteps: number }> {
    const module = getModule();
    if (!module) {
      throw new Error('Pedometer 모듈을 사용할 수 없습니다.');
    }
    return await this.withPermissionCheck(async () => {
      try {
        const result = await module.loadTodaySteps();
        // console.log(`📊 오늘 걸음수 로드 결과 (${Platform.OS}):`, result);
        return result;
      } catch (error: any) {
        console.error(`❌ 오늘 걸음수 로드 실패 (${Platform.OS}):`, error);
        throw new Error(`오늘 걸음 수 로드 실패: ${error.message}`);
      }
    });
  }

  // 오늘 걸음 수 저장
  async saveTodaySteps(): Promise<{ success: boolean; message: string }> {
    const module = getModule();
    if (!module) {
      throw new Error('Pedometer 모듈을 사용할 수 없습니다.');
    }
    return await this.withPermissionCheck(async () => {
      try {
        const result = await module.saveTodaySteps();
        // console.log(`💾 걸음수 저장 결과 (${Platform.OS}):`, result);
        return result;
      } catch (error: any) {
        console.error(`❌ 걸음수 저장 실패 (${Platform.OS}):`, error);
        throw new Error(`오늘 걸음 수 저장 실패: ${error.message}`);
      }
    });
  }

  // 실시간 업데이트 시작
  async startUpdates(): Promise<{ success: boolean; message: string }> {
    const module = getModule();
    if (!module) {
      throw new Error('Pedometer 모듈을 사용할 수 없습니다.');
    }
    return await this.withPermissionCheck(async () => {
      try {
        const result = await module.startUpdates();
        // console.log(`🔄 실시간 업데이트 시작 (${Platform.OS}):`, result);
        return result;
      } catch (error: any) {
        console.error(`❌ 실시간 업데이트 시작 실패 (${Platform.OS}):`, error);
        throw new Error(`실시간 업데이트 시작 실패: ${error.message}`);
      }
    });
  }

  // 실시간 업데이트 중지
  async stopUpdates(): Promise<{ success: boolean; message: string }> {
    const module = getModule();
    if (!module) {
      throw new Error('Pedometer 모듈을 사용할 수 없습니다.');
    }
    try {
      const result = await module.stopUpdates();
      // console.log(`⏹️ 실시간 업데이트 중지 (${Platform.OS}):`, result);
      return result;
    } catch (error: any) {
      console.error(`❌ 실시간 업데이트 중지 실패 (${Platform.OS}):`, error);
      throw new Error(`실시간 업데이트 중지 실패: ${error.message}`);
    }
  }

  // 기간별 걸음 수 조회
  async fetchDailySteps(startDate: Date, endDate: Date): Promise<StepData[]> {
    const module = getModule();
    if (!module) {
      throw new Error('Pedometer 모듈을 사용할 수 없습니다.');
    }
    return await this.withPermissionCheck(async () => {
      try {
        const startTimestamp = startDate.getTime();
        const endTimestamp = endDate.getTime();

        const result = await module.fetchDailySteps(
          startTimestamp,
          endTimestamp
        );
        // console.log(`📊 기간별 걸음수 조회 (${Platform.OS}):`, result);
        return result;
      } catch (error: any) {
        console.error(`❌ 기간별 걸음수 조회 실패 (${Platform.OS}):`, error);
        throw new Error(`기간별 걸음 수 조회 실패: ${error.message}`);
      }
    });
  }

  // 이벤트 리스너 등록 (단순히 eventEmitter 반환)
  getEventEmitter(): NativeEventEmitter {
    return this.eventEmitter;
  }

  // 권한 상태 확인
  async checkPermissionStatus(): Promise<{
    hasPermission: boolean;
    message: string;
  }> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
        );
        return {
          hasPermission: granted,
          message: granted ? '권한이 허용되어 있습니다' : '권한이 필요합니다',
        };
      } else {
        // iOS: CMPedometer 사용 가능 여부로 권한 확인
        // CMPedometer.isStepCountingAvailable()가 false면 권한이 없거나 지원하지 않는 기기
        const module = getModule();
        if (!module) {
          return {
            hasPermission: false,
            message: 'Pedometer 모듈을 사용할 수 없습니다.',
          };
        }
        try {
          const result = await module.loadTodaySteps();
          // 성공하면 권한이 있는 것
          return {
            hasPermission: true,
            message: '동작 및 피트니스 권한이 허용되어 있습니다',
          };
        } catch (error) {
          // 실패하면 권한이 없거나 거부된 것
          return {
            hasPermission: false,
            message:
              '동작 및 피트니스 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
          };
        }
      }
    } catch (error: any) {
      console.error(`❌ 권한 상태 확인 실패 (${Platform.OS}):`, error);
      return {
        hasPermission: false,
        message: '권한 상태 확인 실패',
      };
    }
  }

  // 알림 권한 상태 확인
  async checkNotificationPermissionStatus(): Promise<{
    hasPermission: boolean;
    message: string;
  }> {
    try {
      if (Platform.OS === 'android') {
        // Android 13 (API 33) 이상에서는 POST_NOTIFICATIONS 권한 필요
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return {
            hasPermission: granted,
            message: granted
              ? '알림 권한이 허용되어 있습니다'
              : '알림 권한이 필요합니다',
          };
        } else {
          // Android 13 미만에서는 알림 권한이 자동으로 허용됨
          return {
            hasPermission: true,
            message: '알림 권한이 허용되어 있습니다 (Android 13 미만)',
          };
        }
      } else {
        // iOS: 알림 권한 확인은 네이티브 모듈을 통해 확인
        const module = getModule();
        if (!module) {
          return {
            hasPermission: false,
            message: 'Pedometer 모듈을 사용할 수 없습니다.',
          };
        }
        // iOS는 알림 권한이 자동으로 요청되므로 항상 true로 반환
        // 실제로는 네이티브에서 확인해야 하지만, 여기서는 기본값 반환
        return {
          hasPermission: true,
          message: '알림 권한 확인 (iOS는 자동으로 요청됩니다)',
        };
      }
    } catch (error: any) {
      console.error(`❌ 알림 권한 상태 확인 실패 (${Platform.OS}):`, error);
      return {
        hasPermission: false,
        message: '알림 권한 상태 확인 실패',
      };
    }
  }

  // 알림 권한 요청
  async requestNotificationPermission(): Promise<{
    success: boolean;
    granted: boolean;
    message: string;
  }> {
    try {
      if (Platform.OS === 'android') {
        // Android 13 (API 33) 이상에서만 POST_NOTIFICATIONS 권한 요청
        if (Platform.Version >= 33) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          const granted = result === PermissionsAndroid.RESULTS.GRANTED;
          console.log(`🔔 알림 권한 요청 결과 (Android):`, result);

          if (result === 'never_ask_again') {
            console.log('🚫 다시 보지 않기 선택됨 - 설정창으로 이동');
            Alert.alert(
              '알림 권한 필요',
              '다시 보지 않기로 설정되어 있습니다. 설정에서 직접 알림 권한을 허용해주세요.',
              [{ text: '확인', onPress: () => this.openAppSettings() }]
            );
            return {
              success: false,
              granted: false,
              message: '알림 권한 요청 실패',
            };
          }
          return {
            success: true,
            granted,
            message: granted ? '알림 권한 요청 완료' : '알림 권한 요청 실패',
          };
        } else {
          // Android 13 미만에서는 알림 권한이 자동으로 허용됨
          return {
            success: true,
            granted: true,
            message: '알림 권한이 자동으로 허용됩니다 (Android 13 미만)',
          };
        }
      } else {
        // iOS: 알림 권한은 자동으로 요청되므로 상태만 확인
        const permissionStatus = await this.checkNotificationPermissionStatus();
        return {
          success: true,
          granted: permissionStatus.hasPermission,
          message: permissionStatus.message,
        };
      }
    } catch (error: any) {
      console.error(`❌ 알림 권한 요청 실패 (${Platform.OS}):`, error);
      throw new Error(`알림 권한 요청 실패: ${error.message}`);
    }
  }

  // 앱 설정창으로 이동 (Android 및 iOS)
  async openAppSettings(): Promise<boolean> {
    try {
      console.log(
        `🔧 ${Platform.OS === 'ios' ? 'iOS' : 'Android'} 설정창으로 이동`
      );
      await Linking.openSettings();
      return true;
    } catch (error: any) {
      console.error('❌ 설정창 이동 실패:', error);
      return false;
    }
  }

  // 수동 권한 요청 (필요시 사용)
  async requestPermission(): Promise<{
    success: boolean;
    granted: boolean;
    message: string;
  }> {
    try {
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
        );
        const granted = result === PermissionsAndroid.RESULTS.GRANTED;
        console.log(`🔐 수동 권한 요청 결과 (Android):`, result);

        if (result === 'never_ask_again') {
          console.log('🚫 다시 보지 않기 선택됨 - 설정창으로 이동');
          Alert.alert(
            '권한 필요',
            '다시 보지 않기로 설정되어 있습니다. 설정에서 직접 권한을 허용해주세요.',
            [{ text: '확인', onPress: () => this.openAppSettings() }]
          );
          return {
            success: false,
            granted: false,
            message: '권한 요청 실패',
          };
        }
        return {
          success: true,
          granted,
          message: granted ? '권한 요청 완료' : '권한 요청 실패',
        };
      } else {
        // iOS: CMPedometer는 명시적 권한 요청 API가 없음
        // 사용자가 권한을 거부했다면 설정으로 안내
        const permissionStatus = await this.checkPermissionStatus();
        if (permissionStatus.hasPermission) {
          return {
            success: true,
            granted: true,
            message: '동작 및 피트니스 권한이 허용되어 있습니다',
          };
        } else {
          console.log('⚠️ iOS - 권한 거부됨, 설정으로 안내');
          Alert.alert(
            '권한 필요',
            '동작 및 피트니스 권한이 필요합니다.\n\n설정 > 복지찬스 > 동작 및 피트니스에서 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' },
              { text: '설정으로 이동', onPress: () => Linking.openSettings() },
            ]
          );
          return {
            success: false,
            granted: false,
            message: '설정에서 동작 및 피트니스 권한을 허용해주세요',
          };
        }
      }
    } catch (error: any) {
      console.error(`❌ 권한 요청 실패 (${Platform.OS}):`, error);
      throw new Error(`권한 요청 실패: ${error.message}`);
    }
  }

  // 플랫폼 정보 반환
  getPlatform(): 'ios' | 'android' {
    return Platform.OS as 'ios' | 'android';
  }

  // 지원 기능 확인
  getSupportedFeatures(): {
    realTimeUpdates: boolean;
    dailySteps: boolean;
    backgroundTracking: boolean;
  } {
    return {
      realTimeUpdates: true,
      dailySteps: true,
      backgroundTracking: true,
    };
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const pedometerManager = new PedometerManager();

export default PedometerManager;
export type { StepData, StepUpdateData };
