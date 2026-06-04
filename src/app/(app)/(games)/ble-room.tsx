import { useEffect, useRef, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// BLE는 네이티브 빌드에서만 동작
let BleManager: any = null;
try {
  const { BleManager: B } = require('react-native-ble-plx');
  BleManager = B;
} catch {}

type Phase = 'idle' | 'scanning' | 'done';
type Device = { id: string; name: string | null; rssi: number };

export default function BleRoom() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [devices, setDevices] = useState<Device[]>([]);
  const [isAvailable] = useState(() => BleManager !== null);
  const managerRef = useRef<any>(null);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isAvailable) {
      managerRef.current = new BleManager();
    }
    return () => {
      managerRef.current?.stopDeviceScan();
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      managerRef.current?.destroy();
    };
  }, []);

  const startScan = () => {
    if (!managerRef.current) return;
    setDevices([]);
    setPhase('scanning');

    managerRef.current.startDeviceScan(null, null, (error: any, device: any) => {
      if (error) { console.warn('BLE Scan error:', error); return; }
      if (!device) return;
      setDevices((prev) => {
        const exists = prev.find((d) => d.id === device.id);
        if (exists) {
          return prev.map((d) => d.id === device.id ? { ...d, rssi: device.rssi } : d);
        }
        Haptics.selectionAsync();
        return [...prev, { id: device.id, name: device.name, rssi: device.rssi ?? -100 }];
      });
    });

    scanTimerRef.current = setTimeout(() => {
      managerRef.current?.stopDeviceScan();
      setPhase('done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 8000);
  };

  const stopScan = () => {
    managerRef.current?.stopDeviceScan();
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    setPhase('done');
  };

  const getRssiLabel = (rssi: number) => {
    if (rssi > -60) return { label: '📶 강함', color: '#34C759' };
    if (rssi > -80) return { label: '📶 보통', color: '#FF9500' };
    return { label: '📶 약함', color: '#FF3B30' };
  };

  const sortedDevices = [...devices].sort((a, b) => b.rssi - a.rssi);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { stopScan(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📡 블루투스 스캐너</Text>
        <View style={{ width: 60 }} />
      </View>

      {!isAvailable ? (
        <View style={styles.unavail}>
          <Text style={styles.unavailEmoji}>⚠️</Text>
          <Text style={styles.unavailTitle}>네이티브 빌드 필요</Text>
          <Text style={styles.unavailDesc}>
            react-native-ble-plx는{'\n'}로컬 개발 빌드 (assembleDebug){'\n'}에서만 동작합니다
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>cd android && ./gradlew assembleDebug</Text>
          </View>
        </View>
      ) : (
        <View style={styles.body}>
          {/* 스캔 컨트롤 */}
          <View style={styles.controlRow}>
            {phase !== 'scanning' ? (
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#4ECDC4' }]} onPress={startScan}>
                <Text style={styles.btnText}>🔍 8초 스캔 시작</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#3A3A3C' }]} onPress={stopScan}>
                <Text style={styles.btnText}>⏹ 중지</Text>
              </TouchableOpacity>
            )}
            {phase === 'scanning' && (
              <View style={styles.scanIndicator}>
                <Text style={styles.scanText}>📡 스캔 중...</Text>
                <Text style={styles.scanCount}>{devices.length}개 발견</Text>
              </View>
            )}
          </View>

          {/* 디바이스 목록 */}
          {sortedDevices.length === 0 && phase === 'done' && (
            <Text style={styles.emptyText}>근처에 블루투스 기기가 없습니다</Text>
          )}

          <FlatList
            data={sortedDevices}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              const signal = getRssiLabel(item.rssi);
              return (
                <View style={styles.deviceCard}>
                  <View style={styles.deviceRank}>
                    <Text style={styles.rankNum}>{index + 1}</Text>
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{item.name ?? '알 수 없는 기기'}</Text>
                    <Text style={styles.deviceId} numberOfLines={1}>{item.id}</Text>
                  </View>
                  <View style={styles.deviceSignal}>
                    <Text style={[styles.signalLabel, { color: signal.color }]}>{signal.label}</Text>
                    <Text style={[styles.rssiText, { color: signal.color }]}>{item.rssi} dBm</Text>
                  </View>
                </View>
              );
            }}
            style={styles.list}
            contentContainerStyle={{ gap: 8, padding: 16 }}
          />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>react-native-ble-plx • BLE Central Mode • {Platform.OS}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { padding: 8, width: 60 },
  backText: { color: '#8E8E93', fontSize: 15 },
  title: { flex: 1, color: '#FFF', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  unavail: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  unavailEmoji: { fontSize: 60 },
  unavailTitle: { color: '#FF9500', fontSize: 22, fontWeight: '800' },
  unavailDesc: { color: '#8E8E93', fontSize: 15, textAlign: 'center', lineHeight: 24 },
  codeBox: { backgroundColor: '#1C1C1E', borderRadius: 10, padding: 14 },
  codeText: { color: '#4ECDC4', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  body: { flex: 1 },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  scanIndicator: { gap: 2 },
  scanText: { color: '#4ECDC4', fontSize: 14, fontWeight: '600' },
  scanCount: { color: '#8E8E93', fontSize: 12 },
  emptyText: { color: '#48484A', fontSize: 15, textAlign: 'center', marginTop: 40 },
  list: { flex: 1 },
  deviceCard: {
    backgroundColor: '#1C1C1E', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  deviceRank: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' },
  rankNum: { color: '#8E8E93', fontSize: 14, fontWeight: '700' },
  deviceInfo: { flex: 1, gap: 2 },
  deviceName: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  deviceId: { color: '#48484A', fontSize: 11 },
  deviceSignal: { alignItems: 'flex-end', gap: 2 },
  signalLabel: { fontSize: 12, fontWeight: '600' },
  rssiText: { fontSize: 12 },
  footer: { padding: 12, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 11 },
});
