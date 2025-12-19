import { NativeModules, Platform } from "react-native";

// 안전하게 모듈 가져오기 - NativeModules가 undefined일 수 있으므로 안전하게 접근
const getAOSPedometerModule = () => {
  try {
    if (!NativeModules) {
      console.warn("⚠️ NativeModules가 아직 초기화되지 않았습니다.");
      return null;
    }
    return NativeModules.AOSPedometerModule || null;
  } catch (error) {
    console.error("❌ AOSPedometerModule 접근 중 오류:", error);
    return null;
  }
};

/**
 * Foreground Service 관련 유틸리티 함수들
 * Android에서만 동작하며, 알림센터에 걸음수를 표시하고 실시간 업데이트
 */
export class ForegroundServiceUtils {
  /**
   * Foreground Service 시작
   */
  static async startService(): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.log("📱 Foreground Service는 Android에서만 지원됩니다.");
      return false;
    }

    try {
      const AOSPedometerModule = getAOSPedometerModule();
      if (!AOSPedometerModule) {
        console.error("❌ AOSPedometerModule을 찾을 수 없습니다.");
        return false;
      }
      const result = await AOSPedometerModule.startStepCounterService();
      console.log("🚀 Foreground Service 시작:", result);
      return result.success;
    } catch (error: any) {
      console.error("❌ Foreground Service 시작 실패:", error);
      return false;
    }
  }

  /**
   * Foreground Service 중지
   */
  static async stopService(): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.log("📱 Foreground Service는 Android에서만 지원됩니다.");
      return false;
    }

    try {
      const AOSPedometerModule = getAOSPedometerModule();
      if (!AOSPedometerModule) {
        console.error("❌ AOSPedometerModule을 찾을 수 없습니다.");
        return false;
      }
      const result = await AOSPedometerModule.stopStepCounterService();
      console.log("🛑 Foreground Service 중지:", result);
      return result.success;
    } catch (error: any) {
      console.error("❌ Foreground Service 중지 실패:", error);
      return false;
    }
  }

  /**
   * 서비스 상태 확인
   */
  static async getServiceStatus(): Promise<{
    success: boolean;
    totalSteps: number;
    todaySteps: number;
    liveSteps: number;
    isServiceRunning: boolean;
    serviceName: string;
  } | null> {
    if (Platform.OS !== "android") {
      console.log("📱 서비스 상태 확인은 Android에서만 지원됩니다.");
      return null;
    }

    try {
      const AOSPedometerModule = getAOSPedometerModule();
      if (!AOSPedometerModule) {
        console.error("❌ AOSPedometerModule을 찾을 수 없습니다.");
        return null;
      }
      const result = await AOSPedometerModule.getServiceStatus();
      console.log("📊 서비스 상태:", result);
      return result;
    } catch (error: any) {
      console.error("❌ 서비스 상태 확인 실패:", error);
      return null;
    }
  }
}

export default ForegroundServiceUtils;
