/**
 * @implements FA1.2, FA1.3, NF3
 */
import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { GlassCard } from '@/components/GlassCard';
import { PulseRing } from '@/components/PulseRing';
import { GradientButton } from '@/components/GradientButton';
import { Colors } from '@/constants/Colors';
import { ConnectionStatus, useBLEStore } from '@/store';

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
  return (
    <Text style={[styles.statusLabel, { color: STATUS_COLOR[status] }]}>
      {STATUS_LABEL[status]}
    </Text>
  );
}

function ScanningDots({ color }: { color: string }) {
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.dot, { backgroundColor: color, opacity: 0.5 + i * 0.2 }]} />
      ))}
    </View>
  );
}

export function SensorCard({ status, deviceName, onScan, onDisconnect }: Props) {
  const isConnected = status === 'connected';
  const isActive = status === 'scanning' || status === 'connecting';
  const color = STATUS_COLOR[status];
  
  const { isDemoMode, setDemoMode } = useBLEStore();

  return (
    <GlassCard active={isConnected}>
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <PulseRing color={color} size={9} active={isConnected} />

          <View style={styles.info}>
            <Text style={styles.deviceName}>{deviceName ?? (isDemoMode ? 'Simulierter Sensor' : 'XIAO nRF52840')}</Text>
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

        {!isConnected && !isActive && (
          <View style={styles.demoToggleRow}>
            <Text style={styles.demoLabel}>Demo-Modus (Sensor simulieren)</Text>
            <Switch
              value={isDemoMode}
              onValueChange={setDemoMode}
              trackColor={{ false: '#1C3530', true: Colors.primaryDim }}
              thumbColor={isDemoMode ? Colors.primary : '#4D8C7C'}
            />
          </View>
        )}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  cardContent: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  info: { flex: 1, gap: 3 },
  deviceName: { color: Colors.text, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  statusLabel: { fontSize: 12, fontWeight: '600' },
  btn: { flexShrink: 0 },
  dots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  demoToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,255,180,0.06)',
  },
  demoLabel: {
    color: Colors.textSub,
    fontSize: 12,
    fontWeight: '600',
  },
});
