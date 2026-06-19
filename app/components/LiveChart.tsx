import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Polyline, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { FadeSlide } from '@/components/FadeSlide';
import { GlassCard } from '@/components/GlassCard';
import { Colors } from '@/constants/Colors';
import { IMUReading } from '@/store';

type Mode = 'accel' | 'gyro';

interface Props {
  data: IMUReading[];
}

const PAD = { l: 38, r: 10, t: 12, b: 20 };
const HEIGHT = 170;

const MODES: { key: Mode; label: string }[] = [
  { key: 'accel', label: 'Accelerometer' },
  { key: 'gyro', label: 'Gyroskop' },
];

const SERIES = {
  accel: [
    { field: 'accelX' as keyof IMUReading, color: Colors.accentX, label: 'X' },
    { field: 'accelY' as keyof IMUReading, color: Colors.accentY, label: 'Y' },
    { field: 'accelZ' as keyof IMUReading, color: Colors.accentZ, label: 'Z' },
  ],
  gyro: [
    { field: 'gyroX' as keyof IMUReading, color: Colors.accentX, label: 'X' },
    { field: 'gyroY' as keyof IMUReading, color: Colors.accentY, label: 'Y' },
    { field: 'gyroZ' as keyof IMUReading, color: Colors.accentZ, label: 'Z' },
  ],
};

function buildPaths(data: IMUReading[], fields: (keyof IMUReading)[], chartW: number, chartH: number) {
  if (data.length < 2) return [];
  const allVals = fields.flatMap((f) => data.map((r) => r[f] as number));
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;
  const xStep = chartW / (data.length - 1);
  const toY = (v: number) => chartH - ((v - min) / range) * chartH;

  return fields.map((field) => {
    const pts = data.map((r, i) => ({ x: i * xStep, y: toY(r[field] as number) }));
    const lineStr = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const first = pts[0];
    const last = pts[pts.length - 1];
    const areaStr = `M ${first.x.toFixed(1)},${chartH} L ${lineStr.split(' ').join(' L ')} L ${last.x.toFixed(1)},${chartH} Z`;
    return { line: lineStr, area: areaStr };
  });
}

function offsetPoints(str: string, dx: number, dy: number): string {
  return str.split(' ').map((token) => {
    if (['M', 'L', 'Z'].includes(token)) return token;
    const [x, y] = token.split(',').map(Number);
    return `${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`;
  }).join(' ');
}

export function LiveChart({ data }: Props) {
  const [mode, setMode] = useState<Mode>('accel');
  const [modeKey, setModeKey] = useState(0);
  const screenW = Dimensions.get('window').width;
  const chartW = screenW - 32 - PAD.l - PAD.r;
  const chartH = HEIGHT - PAD.t - PAD.b;

  const series = SERIES[mode];
  const paths = useMemo(
    () => buildPaths(data, series.map((s) => s.field), chartW, chartH),
    [data, mode, chartW, chartH]
  );

  const hasData = data.length >= 2;
  const allVals = hasData ? series.flatMap((s) => data.map((r) => r[s.field] as number)) : [0, 1];
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);

  function switchMode(m: Mode) {
    setMode(m);
    setModeKey((k) => k + 1);
  }

  return (
    <GlassCard style={styles.card}>
      <View style={styles.toggle}>
        {MODES.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => switchMode(key)}
            style={[styles.toggleBtn, mode === key && styles.toggleBtnActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, mode === key && styles.toggleTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!hasData ? (
        <View style={[styles.empty, { height: HEIGHT }]}>
          <Text style={styles.emptyText}>Warte auf Sensordaten…</Text>
        </View>
      ) : (
        <FadeSlide key={modeKey} from={{ opacity: 0, translateY: 0 }} delay={0}>
          <Svg width={screenW - 32} height={HEIGHT}>
            <Defs>
              {series.map((s, i) => (
                <LinearGradient key={i} id={`g${i}_${mode}`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
                  <Stop offset="100%" stopColor={s.color} stopOpacity="0" />
                </LinearGradient>
              ))}
            </Defs>

            <SvgText x={PAD.l - 4} y={PAD.t + 8} fill={Colors.textSub} fontSize="9" textAnchor="end">
              {maxVal.toFixed(1)}
            </SvgText>
            <SvgText x={PAD.l - 4} y={PAD.t + chartH} fill={Colors.textSub} fontSize="9" textAnchor="end">
              {minVal.toFixed(1)}
            </SvgText>

            <Line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + chartH} stroke={Colors.border} strokeWidth={1} />
            <Line x1={PAD.l} y1={PAD.t + chartH} x2={PAD.l + chartW} y2={PAD.t + chartH} stroke={Colors.border} strokeWidth={1} />
            <Line x1={PAD.l} y1={PAD.t + chartH / 2} x2={PAD.l + chartW} y2={PAD.t + chartH / 2} stroke={Colors.border} strokeWidth={1} strokeDasharray="3,4" />

            {paths.map((p, i) => (
              <React.Fragment key={i}>
                <Path d={offsetPoints(p.area, PAD.l, PAD.t)} fill={`url(#g${i}_${mode})`} />
                <Polyline
                  points={p.line.split(' ').map((pt) => {
                    const [x, y] = pt.split(',').map(Number);
                    return `${(x + PAD.l).toFixed(1)},${(y + PAD.t).toFixed(1)}`;
                  }).join(' ')}
                  fill="none"
                  stroke={series[i].color}
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </React.Fragment>
            ))}
          </Svg>
        </FadeSlide>
      )}

      <View style={styles.legend}>
        {series.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, gap: 8 },
  toggle: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 3, gap: 3 },
  toggleBtn: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: Colors.surfaceBright },
  toggleText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
  toggleTextActive: { color: Colors.text },
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 13 },
  legend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { color: Colors.textSub, fontSize: 11, fontWeight: '500' },
});
