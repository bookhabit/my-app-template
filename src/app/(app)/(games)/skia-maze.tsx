import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  Canvas,
  Circle,
  Fill,
  Group,
  Paint,
  Path,
  Rect,
  Skia,
} from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Phase = 'idle' | 'playing' | 'cleared' | 'failed';

const W = 320;
const H = 420;
const CELL = 40;
const COLS = W / CELL; // 8
const ROWS = H / CELL; // 10
const BALL_R = 12;

// 간단한 미로 맵 (0=통로, 1=벽)
const MAZE: number[][] = [
  [1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,1],
  [1,0,1,0,0,0,1,1],
  [1,0,1,1,1,0,1,1],
  [1,0,0,0,1,0,0,1],
  [1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1],
];

const START = { x: CELL * 1 + CELL / 2, y: CELL * 1 + CELL / 2 };
const GOAL = { x: CELL * 6 + CELL / 2, y: CELL * 8 + CELL / 2 };

function buildMazePath(): string {
  let d = '';
  MAZE.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === 1) {
        d += `M ${c * CELL} ${r * CELL} h ${CELL} v ${CELL} h -${CELL} Z `;
      }
    });
  });
  return d;
}

const MAZE_PATH = buildMazePath();

export default function SkiaMaze() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('idle');
  const [ballPos, setBallPos] = useState(START);
  const [elapsed, setElapsed] = useState(0);
  const velRef = useRef({ vx: 0, vy: 0 });
  const posRef = useRef(START);
  const subRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    subRef.current?.remove();
    if (loopRef.current) clearInterval(loopRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => () => stop(), []);

  const isWall = (x: number, y: number): boolean => {
    const col = Math.floor(x / CELL);
    const row = Math.floor(y / CELL);
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return true;
    return MAZE[row]?.[col] === 1;
  };

  const start = () => {
    posRef.current = START;
    velRef.current = { vx: 0, vy: 0 };
    setBallPos(START);
    setElapsed(0);
    setPhase('playing');

    Accelerometer.setUpdateInterval(16);
    subRef.current = Accelerometer.addListener(({ x, y }) => {
      velRef.current.vx += -x * 0.8;
      velRef.current.vy += y * 0.8;
      velRef.current.vx *= 0.88;
      velRef.current.vy *= 0.88;
    });

    loopRef.current = setInterval(() => {
      const { vx, vy } = velRef.current;
      const cur = posRef.current;
      let nx = cur.x + vx;
      let ny = cur.y + vy;

      // 벽 충돌 처리
      if (isWall(nx, cur.y)) { nx = cur.x; velRef.current.vx = -vx * 0.5; }
      if (isWall(cur.x, ny)) { ny = cur.y; velRef.current.vy = -vy * 0.5; }
      if (isWall(nx, ny)) { nx = cur.x; ny = cur.y; velRef.current.vx = 0; velRef.current.vy = 0; }

      posRef.current = { x: nx, y: ny };
      setBallPos({ x: nx, y: ny });

      // 목표 도달 체크
      const dx = nx - GOAL.x;
      const dy = ny - GOAL.y;
      if (Math.sqrt(dx * dx + dy * dy) < BALL_R + 15) {
        stop();
        setPhase('cleared');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 16);

    let sec = 0;
    timerRef.current = setInterval(() => {
      sec += 1;
      setElapsed(sec);
    }, 1000);
  };

  const reset = () => {
    stop();
    setPhase('idle');
    setBallPos(START);
    setElapsed(0);
  };

  const mazePath = Skia.Path.MakeFromSVGString(MAZE_PATH) ?? Skia.Path.Make();
  const paint = Skia.Paint();
  paint.setColor(Skia.Color('#1C1C1E'));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎱 기울기 미로</Text>
        {phase === 'playing' && <Text style={styles.timer}>{elapsed}s</Text>}
        {phase !== 'playing' && <View style={{ width: 60 }} />}
      </View>

      <View style={styles.center}>
        {phase === 'idle' && (
          <>
            <Text style={styles.hint}>폰을 기울여 공을 출구까지 이동하세요!</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#AF52DE' }]} onPress={start}>
              <Text style={styles.btnText}>시작</Text>
            </TouchableOpacity>
          </>
        )}

        {(phase === 'playing' || phase === 'cleared') && (
          <Canvas style={{ width: W, height: H }}>
            {/* 배경 */}
            <Fill color="#0A0A0A" />
            {/* 미로 벽 */}
            <Path path={mazePath} color="#2C2C2E" />
            {/* 목표점 */}
            <Circle cx={GOAL.x} cy={GOAL.y} r={16} color="#34C759" opacity={0.7} />
            <Circle cx={GOAL.x} cy={GOAL.y} r={8} color="#34C759" />
            {/* 공 */}
            <Circle cx={ballPos.x} cy={ballPos.y} r={BALL_R} color="#AF52DE" />
            <Circle cx={ballPos.x - 3} cy={ballPos.y - 3} r={4} color="rgba(255,255,255,0.4)" />
          </Canvas>
        )}

        {phase === 'cleared' && (
          <View style={styles.overlay}>
            <Text style={styles.clearedText}>🏆 클리어!</Text>
            <Text style={styles.clearedTime}>{elapsed}초</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#AF52DE' }]} onPress={reset}>
              <Text style={styles.btnText}>다시 하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'idle' && (
          <View style={styles.legend}>
            <Text style={styles.legendItem}>🟣 공 (START)</Text>
            <Text style={styles.legendItem}>🟢 목표 (GOAL)</Text>
            <Text style={styles.legendItem}>⬛ 벽</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>@shopify/react-native-skia + expo-sensors Accelerometer</Text>
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
  timer: { color: '#AF52DE', fontSize: 16, fontWeight: '700', width: 60, textAlign: 'right' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  hint: { color: '#8E8E93', fontSize: 15, textAlign: 'center', paddingHorizontal: 32 },
  overlay: { position: 'absolute', alignItems: 'center', gap: 12, backgroundColor: 'rgba(0,0,0,0.8)', padding: 32, borderRadius: 20 },
  clearedText: { color: '#34C759', fontSize: 42, fontWeight: '900' },
  clearedTime: { color: '#FFF', fontSize: 28, fontWeight: '700' },
  legend: { flexDirection: 'row', gap: 16 },
  legendItem: { color: '#48484A', fontSize: 12 },
  btn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: 12, alignItems: 'center' },
  footerText: { color: '#3A3A3C', fontSize: 11 },
});
