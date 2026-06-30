/**
 * @implements FA1.6, FA1.7
 */
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FadeSlide } from '@/components/FadeSlide';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { GlassCard } from '@/components/GlassCard';
import { Colors } from '@/constants/Colors';
import { useTrainingStore, TrainingSession } from '@/store';
import { SessionCard } from '@/components/session_card/SessionCard';
import { formatMovementLabel, getAnomalyColor, getAnomalyLabel } from './index';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function StatsDashboard({ sessions }: { sessions: TrainingSession[] }) {
  const totalSessions = sessions.length;
  const totalDuration = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalReadings = sessions.reduce((acc, s) => acc + s.readingCount, 0);
  const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

  return (
    <GlassCard style={styles.statsCard}>
      <Text style={styles.statsTitle}>Aktivitäts-Auswertung</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxVal}>{totalSessions}</Text>
          <Text style={styles.statBoxLabel}>Einheiten</Text>
        </View>
        <View style={styles.statBoxDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statBoxVal}>{formatDuration(totalDuration)}</Text>
          <Text style={styles.statBoxLabel}>Gesamtzeit</Text>
        </View>
        <View style={styles.statBoxDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statBoxVal}>{formatDuration(avgDuration)}</Text>
          <Text style={styles.statBoxLabel}>Ø Dauer</Text>
        </View>
      </View>
      <View style={styles.readingsSummary}>
        <Text style={styles.readingsText}>
          📊 Insgesamt <Text style={styles.readingsHighlight}>{totalReadings.toLocaleString()}</Text> Sensor-Messwerte analysiert
        </Text>
      </View>
    </GlassCard>
  );
}

interface SessionDetailModalProps {
  session: TrainingSession | null;
  visible: boolean;
  onClose: () => void;
}

function SessionDetailModal({ session, visible, onClose }: SessionDetailModalProps) {
  if (!session) return null;

  const stats = useMemo(() => {
    const infs = session.inferences || [];
    if (infs.length === 0) {
      return {
        avgAnomaly: null,
        exercisePercentages: [],
        tipsList: [],
      };
    }

    const totalAnomaly = infs.reduce((acc, i) => acc + i.anomaly, 0);
    const avgAnomaly = totalAnomaly / infs.length;

    const counts: Record<string, number> = {};
    infs.forEach((i) => {
      const name = formatMovementLabel(i.label);
      counts[name] = (counts[name] || 0) + 1;
    });

    const totalInferences = infs.length;
    const exercisePercentages = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / totalInferences) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const tipsMap: Record<string, number> = {};
    infs.forEach((i) => {
      if (i.tipp && i.tipp !== 'Bereit' && !i.tipp.includes('erkannt')) {
        tipsMap[i.tipp] = (tipsMap[i.tipp] || 0) + 1;
      }
    });
    const tipsList = Object.entries(tipsMap).map(([text, count]) => ({ text, count }));

    return {
      avgAnomaly,
      exercisePercentages,
      tipsList,
    };
  }, [session]);

  const dateStr = new Date(session.startedAt).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = new Date(session.startedAt).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <GlassCard style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Einheits-Details</Text>
              <Text style={styles.modalSub}>{dateStr} um {timeStr}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
            {/* Basic Stats Grid */}
            <View style={styles.modalStatsGrid}>
              <View style={styles.modalStatBox}>
                <Text style={styles.modalStatVal}>{formatDuration(session.durationSeconds)}</Text>
                <Text style={styles.modalStatLabel}>Dauer</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatBox}>
                <Text style={styles.modalStatVal}>{session.readingCount.toLocaleString()}</Text>
                <Text style={styles.modalStatLabel}>Messwerte</Text>
              </View>
            </View>

            {/* Quality Evaluation Section */}
            <Text style={styles.modalSectionTitle}>Bewegungs-Qualität</Text>
            <GlassCard style={styles.detailQualityCard}>
              <View style={styles.anomalyRow}>
                <Text style={styles.anomalyLabelText}>Ø Anomalie-Score:</Text>
                <Text style={[styles.anomalyValueText, { color: getAnomalyColor(stats.avgAnomaly) }]}>
                  {stats.avgAnomaly !== null ? stats.avgAnomaly.toFixed(3) : '—'}
                </Text>
              </View>
              
              {stats.avgAnomaly !== null && (
                <View style={styles.qualityBarBg}>
                  <View 
                    style={[
                      styles.qualityBarFill, 
                      { 
                        backgroundColor: getAnomalyColor(stats.avgAnomaly),
                        width: `${Math.min(100, Math.max(0, ((5 - stats.avgAnomaly) / 6) * 100))}%`
                      }
                    ]} 
                  />
                </View>
              )}
              
              <Text style={[styles.qualityDescription, { color: getAnomalyColor(stats.avgAnomaly) }]}>
                {getAnomalyLabel(stats.avgAnomaly)}
              </Text>
            </GlassCard>

            {/* Exercise breakdown percentage */}
            {stats.exercisePercentages.length > 0 && (
              <>
                <Text style={styles.modalSectionTitle}>Aktivitäts-Verteilung</Text>
                <GlassCard style={styles.breakdownCard}>
                  {stats.exercisePercentages.map((item, idx) => (
                    <View key={idx} style={styles.breakdownRow}>
                      <View style={styles.breakdownLabelGroup}>
                        <Text style={styles.breakdownName}>{item.name}</Text>
                        <Text style={styles.breakdownPercent}>{item.percentage}%</Text>
                      </View>
                      <View style={styles.breakdownBarBg}>
                        <View style={[styles.breakdownBarFill, { width: `${item.percentage}%` }]} />
                      </View>
                    </View>
                  ))}
                </GlassCard>
              </>
            )}

            {/* Tips summary */}
            {stats.tipsList.length > 0 && (
              <>
                <Text style={styles.modalSectionTitle}>Hinweise zur Ausführung</Text>
                <GlassCard style={styles.tipsCard}>
                  {stats.tipsList.map((tip, idx) => (
                    <View key={idx} style={styles.tipRow}>
                      <Text style={styles.tipText}>💡 {tip.text}</Text>
                      <Text style={styles.tipCount}>{tip.count}x</Text>
                    </View>
                  ))}
                </GlassCard>
              </>
            )}
          </ScrollView>

          {/* Close button at bottom */}
          <TouchableOpacity style={styles.footerCloseBtn} onPress={onClose}>
            <Text style={styles.footerCloseBtnText}>Schließen</Text>
          </TouchableOpacity>
        </GlassCard>
      </View>
    </Modal>
  );
}

export default function HistoryScreen() {
  const { sessions, setSessions } = useTrainingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);

  async function fetchSessions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/sessions`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: TrainingSession[] = await res.json();
      setSessions(data);
      // Sync local cache
      await AsyncStorage.setItem('movelink_sessions', JSON.stringify(data));
    } catch {
      // Offline fallback: try reading from AsyncStorage
      try {
        const localData = await AsyncStorage.getItem('movelink_sessions');
        if (localData) {
          const parsed = JSON.parse(localData);
          setSessions(parsed);
        } else {
          setError('Backend nicht erreichbar.\nLäuft docker compose up?');
        }
      } catch {
        setError('Backend nicht erreichbar.\nLäuft docker compose up?');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Immediately load from cache for instant response, then fetch latest from backend
    const loadCache = async () => {
      try {
        const localData = await AsyncStorage.getItem('movelink_sessions');
        if (localData) {
          const parsed = JSON.parse(localData);
          setSessions(parsed);
        }
      } catch {}
    };
    loadCache().then(() => {
      fetchSessions();
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Fixed header — always visible */}
      <View style={styles.header}>
        <FadeSlide delay={0}>
          <AnimatedLogo />
          <Text style={styles.pageTitle}>Verlauf</Text>
        </FadeSlide>
      </View>

      {/* Content area fills remaining space */}
      <View style={styles.body}>
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Lade Einheiten…</Text>
          </View>
        )}

        {!loading && error && (
          <FadeSlide from={{ opacity: 0, scale: 0.96, translateY: 0 }} style={styles.center as any}>
            <View style={styles.errorCard}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchSessions}>
                <Text style={styles.retryText}>Erneut versuchen</Text>
              </TouchableOpacity>
            </View>
          </FadeSlide>
        )}

        {!loading && !error && sessions.length === 0 && (
          <FadeSlide style={styles.center as any}>
            <LinearGradient colors={['rgba(0,212,170,0.06)', 'transparent']} style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={styles.emptyTitle}>Noch keine Einheiten</Text>
              <Text style={styles.emptyBody}>Verbinde deinen Sensor und starte ein Training.</Text>
            </LinearGradient>
          </FadeSlide>
        )}

        {!loading && !error && sessions.length > 0 && (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                <StatsDashboard sessions={sessions} />
                <Text style={styles.countLabel}>
                  {sessions.length} {sessions.length === 1 ? 'Einheit' : 'Einheiten'}
                </Text>
              </>
            }
            renderItem={({ item, index }) => (
              <SessionCard session={item} index={index} onPress={() => setSelectedSession(item)} />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>

      <SessionDetailModal
        session={selectedSession}
        visible={selectedSession !== null}
        onClose={() => setSelectedSession(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  pageTitle: { color: Colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginTop: 10, marginBottom: 4 },
  body: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { color: Colors.textSub, fontSize: 13, marginTop: 12 },

  errorCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 28,
    alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)', maxWidth: 300,
  },
  errorIcon: { fontSize: 32 },
  errorText: { color: Colors.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10, marginTop: 4 },
  retryText: { color: Colors.bg, fontSize: 13, fontWeight: '700' },

  emptyCard: {
    borderRadius: 20, padding: 36, alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  emptyBody: { color: Colors.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 240 },

  list: { paddingHorizontal: 20, paddingBottom: 40 },
  countLabel: { color: Colors.textSub, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  statsCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  statsTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statBoxVal: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  statBoxLabel: {
    color: Colors.textSub,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statBoxDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  readingsSummary: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    alignItems: 'center',
  },
  readingsText: {
    color: Colors.textSub,
    fontSize: 11,
    fontWeight: '500',
  },
  readingsHighlight: {
    color: Colors.text,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '90%',
    padding: 24,
    gap: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modalSub: {
    color: Colors.textSub,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceActive,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeBtnText: {
    color: Colors.textSub,
    fontSize: 14,
    fontWeight: '600',
  },
  modalScroll: {
    gap: 18,
    paddingBottom: 24,
  },
  modalStatsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalStatBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  modalStatVal: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  modalStatLabel: {
    color: Colors.textSub,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    alignSelf: 'center',
  },
  modalSectionTitle: {
    color: Colors.textSub,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
  },
  detailQualityCard: {
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
  },
  anomalyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  anomalyLabelText: {
    color: Colors.textSub,
    fontSize: 12,
    fontWeight: '600',
  },
  anomalyValueText: {
    fontSize: 18,
    fontWeight: '800',
  },
  qualityBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  qualityBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  qualityDescription: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  breakdownCard: {
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
  },
  breakdownRow: {
    gap: 6,
  },
  breakdownLabelGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  breakdownPercent: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  breakdownBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  tipsCard: {
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
  },
  tipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  tipCount: {
    color: Colors.textSub,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: Colors.surfaceActive,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footerCloseBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerCloseBtnText: {
    color: Colors.bg,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
