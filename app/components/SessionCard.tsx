import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FadeSlide } from '@/components/FadeSlide';
import { Colors } from '@/constants/Colors';
import { TrainingSession } from '@/store';

interface Props {
  session: TrainingSession;
  onPress: () => void;
  index?: number;
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function SessionCard({ session, onPress, index = 0 }: Props) {
  return (
    <FadeSlide delay={index * 60}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.accent} />
        <View style={styles.body}>
          <View style={styles.dateRow}>
            <Text style={styles.date}>{formatDate(session.startedAt)}</Text>
            <Text style={styles.time}>{formatTime(session.startedAt)}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatDuration(session.durationSeconds)}</Text>
              <Text style={styles.statLabel}>Dauer</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{session.readingCount.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Messwerte</Text>
            </View>
          </View>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </FadeSlide>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    gap: 14,
    paddingRight: 16,
    paddingVertical: 14,
  },
  accent: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: Colors.primary,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  body: { flex: 1, gap: 8 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  time: { color: Colors.textSub, fontSize: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stat: { gap: 1 },
  statValue: { color: Colors.primary, fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { color: Colors.textSub, fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  divider: { width: 1, height: 28, backgroundColor: Colors.border },
  arrow: { color: Colors.textMuted, fontSize: 22, fontWeight: '300' },
});
