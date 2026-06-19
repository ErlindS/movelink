import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FadeSlide } from '@/components/FadeSlide';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { Colors } from '@/constants/Colors';
import { useTrainingStore, TrainingSession } from '@/store';
import { SessionCard } from '@/components/SessionCard';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function HistoryScreen() {
  const { sessions, setSessions } = useTrainingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchSessions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/sessions`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: TrainingSession[] = await res.json();
      setSessions(data);
    } catch {
      setError('Backend nicht erreichbar.\nLäuft docker compose up?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSessions(); }, []);

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
              <Text style={styles.countLabel}>
                {sessions.length} {sessions.length === 1 ? 'Einheit' : 'Einheiten'}
              </Text>
            }
            renderItem={({ item, index }) => (
              <SessionCard session={item} index={index} onPress={() => {}} />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>
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
});
