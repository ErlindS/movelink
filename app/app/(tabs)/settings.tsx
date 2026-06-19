import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FadeSlide } from '@/components/FadeSlide';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { Colors } from '@/constants/Colors';
import { useBLEStore } from '@/store';
import { useBLE } from '@/hooks/useBLE';
import { SensorCard } from '@/components/SensorCard';
import { GlassCard } from '@/components/GlassCard';
import { BLE_SERVICE_UUID, BLE_IMU_CHARACTERISTIC_UUID, BLE_MAX_RECONNECT_ATTEMPTS } from '@/constants/BLE';

export default function SettingsScreen() {
  const { status, deviceName, deviceId } = useBLEStore();
  const { startScan, disconnectDevice } = useBLE();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <FadeSlide delay={0}>
          <View style={styles.headerRow}>
            <AnimatedLogo />
          </View>
          <Text style={styles.pageTitle}>Gerät</Text>
        </FadeSlide>

        <FadeSlide delay={60}>
          <Text style={styles.sectionLabel}>Sensor-Verbindung</Text>
          <SensorCard status={status} deviceName={deviceName} onScan={startScan} onDisconnect={disconnectDevice} />
        </FadeSlide>

        {deviceId && (
          <FadeSlide delay={120}>
            <Text style={styles.sectionLabel}>Verbundenes Gerät</Text>
            <GlassCard style={styles.noPad}>
              <InfoRow label="Name" value={deviceName ?? '—'} />
              <InfoRow label="Geräte-ID" value={deviceId} mono last />
            </GlassCard>
          </FadeSlide>
        )}

        <FadeSlide delay={180}>
          <Text style={styles.sectionLabel}>BLE Konfiguration</Text>
          <GlassCard style={styles.noPad}>
            <InfoRow label="Service UUID" value={BLE_SERVICE_UUID} mono />
            <InfoRow label="Characteristic" value={BLE_IMU_CHARACTERISTIC_UUID} mono />
            <InfoRow label="Max. Reconnects" value={String(BLE_MAX_RECONNECT_ATTEMPTS)} last />
          </GlassCard>
        </FadeSlide>

        <FadeSlide delay={240}>
          <Text style={styles.sectionLabel}>Über MoveLink</Text>
          <LinearGradient
            colors={['rgba(0,212,170,0.07)', 'rgba(0,212,170,0.02)']}
            style={styles.aboutCard}
          >
            <View style={styles.aboutHeader}>
              <Text style={styles.aboutTitle}>MoveLink</Text>
              <Text style={styles.aboutBadge}>v1.0.0</Text>
            </View>
            <Text style={styles.aboutSub}>Software-Architekturen Labor · HKA SS 2026</Text>
            <View style={styles.teamGrid}>
              <TeamMember ap="AP1" name="Devin Uyan" role="Frontend" />
              <TeamMember ap="AP2" name="Luca Schöneberg" role="Backend" />
              <TeamMember ap="AP3" name="Erlind Sejdiu" role="Embedded" />
            </View>
          </LinearGradient>
        </FadeSlide>

      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, mono, last }: { label: string; value: string; mono?: boolean; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.mono]} numberOfLines={1} ellipsizeMode="middle">
        {value}
      </Text>
    </View>
  );
}

function TeamMember({ ap, name, role }: { ap: string; name: string; role: string }) {
  return (
    <View style={styles.member}>
      <Text style={styles.apBadge}>{ap}</Text>
      <View>
        <Text style={styles.memberName}>{name}</Text>
        <Text style={styles.memberRole}>{role}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 20, gap: 10, paddingBottom: 40 },

  headerRow: { marginBottom: 10 },
  pageTitle: { color: Colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },

  sectionLabel: {
    color: Colors.textSub, fontSize: 10, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 8,
  },
  noPad: { padding: 0, gap: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  rowValue: { color: Colors.textSub, fontSize: 12, flex: 1, textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 10 },

  aboutCard: {
    borderRadius: 20, padding: 20, gap: 4,
    borderWidth: 1, borderColor: Colors.primaryDim,
  },
  aboutHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  aboutTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  aboutBadge: {
    color: Colors.primary, fontSize: 11, fontWeight: '700',
    backgroundColor: Colors.primaryDim, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  aboutSub: { color: Colors.textSub, fontSize: 12, marginBottom: 16 },
  teamGrid: { gap: 10 },
  member: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  apBadge: {
    color: Colors.primary, fontSize: 10, fontWeight: '800',
    backgroundColor: Colors.primaryDim, paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 6, letterSpacing: 0.5, minWidth: 36, textAlign: 'center',
  },
  memberName: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  memberRole: { color: Colors.textSub, fontSize: 11 },
});
