import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withSpring,
} from 'react-native-reanimated';
import { GlassCard } from '@/components/GlassCard';
import { PulseRing } from '@/components/PulseRing';
import { GradientButton } from '@/components/GradientButton';
import { Colors } from '@/constants/Colors';
import { ConnectionStatus } from '@/store';

interface Props {
  status: ConnectionStatus;
  deviceName: string | null;
  onScan: () => void;
  onDisconnect: () => void;
}

const STATUS_COLOR: Record<ConnectionStatus, string> = {
  idle: Colors.textMuted,
  scanning: Colors.warning,
  connecting: Colors.warning,
  connected: Colors.connected,
  disconnected: Colors.textSub,
  error: Colors.error,
};

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  idle: 'Kein Sensor',
  scanning: 'Suche läuft...',
  connecting: 'Verbinde...',
  connected: 'Verbunden',
  disconnected: 'Getrennt',
  error: 'Fehler',
};

function StatusLabel({ status }: { status: ConnectionStatus }) {
  const opacity = useSharedValue(0);
  const x = useSharedValue(-6);

  useEffect(() => {
    opacity.value = withTiming(0, { duration: 0 });
    x.value = -6;
    const t = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 220 });
      x.value = withSpring(0, { damping: 20, stiffness: 300 });
    }, 10);
    return () => clearTimeout(t);
  }, [status]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }],
  }));

  return (
    <Animated.Text style={[styles.statusLabel, { color: STATUS_COLOR[status] }, style]}>
      {STATUS_LABEL[status]}
    </Animated.Text>
  );
}

function ScanningDots({ color }: { color: string }) {
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((i) => (
        <BounceDot key={i} color={color} delay={i * 180} />
      ))}
    </View>
  );
}

function BounceDot({ color, delay }: { color: string; delay: number }) {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    const t = setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.2, { duration: 500 })
        ),
        -1
      );
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />
  );
}

export function SensorCard({ status, deviceName, onScan, onDisconnect }: Props) {
  const isConnected = status === 'connected';
  const isActive = status === 'scanning' || status === 'connecting';
  const color = STATUS_COLOR[status];

  return (
    <GlassCard active={isConnected}>
      <View style={styles.row}>
        <PulseRing color={color} size={9} active={isConnected} />

        <View style={styles.info}>
          <Text style={styles.deviceName}>{deviceName ?? 'XIAO nRF52840'}</Text>
          <StatusLabel status={status} />
        </View>

        {isConnected && (
          <GradientButton label="Trennen" variant="ghost" onPress={onDisconnect} style={styles.btn} />
        )}
        {!isConnected && !isActive && (
          <GradientButton label="Verbinden" variant="primary" onPress={onScan} style={styles.btn} />
        )}
        {isActive && <ScanningDots color={color} />}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  info: { flex: 1, gap: 3 },
  deviceName: { color: Colors.text, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  statusLabel: { fontSize: 12, fontWeight: '600' },
  btn: { flexShrink: 0 },
  dots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
});
