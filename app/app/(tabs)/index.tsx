/**
 * @implements FA1.1, FA1.4, FA1.5
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, Platform, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useBLEStore, useTrainingStore, EXERCISE_TARGETS, ExerciseType, IMUReading } from '@/store';
import { useBLE } from '@/hooks/useBLE';
import { useWebSocket } from '@/hooks/useWebSocket';
import { SensorCard } from '@/components/SensorCard';
import { LiveChart } from '@/components/LiveChart';
import { AnimatedValue } from '@/components/AnimatedValue';
import { GradientButton } from '@/components/GradientButton';
import { FadeSlide } from '@/components/FadeSlide';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { GlassCard } from '@/components/GlassCard';
import { ExerciseDemo } from '@/components/ExerciseDemo';
import { ProgressRing } from '@/components/ProgressRing';

function RecBadge() {
  const opacity = useSharedValue(1);
  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1
    );
  }, []);
  const dotStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.recBadge}>
      <Animated.View style={[styles.recDot, dotStyle]} />
      <Text style={styles.recLabel}>REC</Text>
    </View>
  );
}

function formatMovementLabel(label: string | null): string {
  if (!label) return 'Bereit';
  const lowerLabel = label.toLowerCase();
  if (lowerLabel === 'idle') return 'Bereit';
  
  if (lowerLabel === 'curl_sauber' || lowerLabel === 'curl') return 'Bizeps-Curl';
  if (lowerLabel === 'lateralraises' || lowerLabel === 'lateralraise') return 'Seitheben';
  if (lowerLabel === 'shoulderpress' || lowerLabel === 'shoulder_press') return 'Schulterdruecken';
  if (lowerLabel === 'fehler_rotation') return 'Bizeps-Curl (Handgelenk-Rotation)';
  if (lowerLabel === 'fehler_ellbogen') return 'Bizeps-Curl (Ellbogen instabil)';
  
  if (lowerLabel.includes('lateral_raise') || lowerLabel.includes('lateral_rise')) {
    return lowerLabel.includes('sauber') ? 'Seitheben' : 'Seitheben (Ausfuehrungsfehler)';
  }
  if (lowerLabel.includes('tricep')) {
    return lowerLabel.includes('sauber') ? 'Trizeps-Druecken' : 'Trizeps-Druecken (Ausfuehrungsfehler)';
  }
  if (lowerLabel.includes('shoulder_press') || lowerLabel.includes('press')) {
    return lowerLabel.includes('sauber') ? 'Schulterdruecken' : 'Schulterdruecken (Ausfuehrungsfehler)';
  }
  
  return label
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function TrainingScreen() {
  const { status: bleStatus, deviceName, latestReading, inferenceLabel, inferenceConfidence, inferenceAnomaly, inferenceTipp } = useBLEStore();
  const { 
    status: trainingStatus,
    exercise,
    exerciseState,
    repCount,
    currentAngle,
    countdown,
    isRecording,
    liveBuffer,
    startTraining,
    stopTraining,
    resetTraining,
    setCountdown,
    startSession
  } = useTrainingStore();
  
  const { startScan, disconnectDevice } = useBLE();
  useWebSocket();

  const [selectedEx, setSelectedEx] = useState<ExerciseType>('squat');

  const isConnected = bleStatus === 'connected';

  // Rolling buffer for live chart - updates in real-time when new reading is received
  const IDLE_BUFFER_SIZE = 80;
  const [idleChartData, setIdleChartData] = useState<IMUReading[]>([]);

  useEffect(() => {
    if (!isConnected || !latestReading) {
      if (idleChartData.length > 0) setIdleChartData([]);
      return;
    }
    setIdleChartData((prev) => {
      // Prevents adding the exact same reading (e.g. if state updates multiple times)
      if (prev.length > 0 && prev[prev.length - 1].timestamp === latestReading.timestamp) {
        return prev;
      }
      return prev.length >= IDLE_BUFFER_SIZE
        ? [...prev.slice(1), latestReading]
        : [...prev, latestReading];
    });
  }, [latestReading, isConnected]);

  // Countdown controller
  useEffect(() => {
    if (trainingStatus !== 'preparing') return;
    
    setCountdown(3);
    const timer = setInterval(() => {
      const currentVal = useTrainingStore.getState().countdown;
      const nextVal = currentVal - 1;
      
      if (nextVal <= 0) {
        clearInterval(timer);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
        startSession();
      } else {
        setCountdown(nextVal);
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [trainingStatus]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <FadeSlide delay={50}>
          <View style={styles.headerRow}>
            <AnimatedLogo />
            {isRecording && <RecBadge />}
          </View>
          <Text style={styles.pageTitle}>Training</Text>
        </FadeSlide>

        {/* 1. BLE Connection Status (Always visible at top when not actively training) */}
        {trainingStatus === 'idle' && (
          <FadeSlide delay={100}>
            <SensorCard status={bleStatus} deviceName={deviceName} onScan={startScan} onDisconnect={disconnectDevice} />
          </FadeSlide>
        )}

        {/* 2. PREPARING STATE: Demonstration and Countdown */}
        {isConnected && trainingStatus === 'preparing' && (
          <View style={styles.preparingContainer}>
            <FadeSlide delay={100}>
              <ExerciseDemo 
                exercise={exercise} 
                label={exercise === 'squat' ? 'Kniebeugen Vorführung' : 'Bizeps-Curls Vorführung'} 
              />
            </FadeSlide>

            <FadeSlide delay={150}>
              <GlassCard style={styles.countdownCard}>
                <Text style={styles.countdownTitle}>Bereite dich vor...</Text>
                <View style={styles.countdownCircle}>
                  <Text style={styles.countdownNumber}>{countdown}</Text>
                </View>
                <Text style={styles.countdownSub}>Nimm deine Ausgangsposition ein!</Text>
              </GlassCard>
            </FadeSlide>

            <FadeSlide delay={200}>
              <GradientButton label="Abbrechen" variant="ghost" onPress={resetTraining} />
            </FadeSlide>
          </View>
        )}

        {/* 3. RECORDING STATE: Realtime Tracking, Angle Ring and Reps */}
        {isConnected && trainingStatus === 'recording' && (
          <View style={styles.trackingContainer}>
            <FadeSlide delay={100}>
              <View style={styles.trackingHeader}>
                <Text style={styles.trackingTitle}>
                  {exercise === 'squat' ? 'Kniebeugen' : 'Bizeps-Curls'}
                </Text>
                <Text style={styles.trackingSub}>Ausführung läuft...</Text>
              </View>
            </FadeSlide>

            <FadeSlide delay={150}>
              <ProgressRing 
                angle={currentAngle} 
                targetAngle={EXERCISE_TARGETS[exercise]} 
                repCount={repCount} 
                exerciseState={exerciseState} 
              />
            </FadeSlide>

            {/* Optional Collapsible Diagnostic Raw Data */}
            <FadeSlide delay={200}>
              <LiveChart data={liveBuffer} />
            </FadeSlide>

            {/* Real-time numerical grids */}
            {latestReading && (
              <FadeSlide delay={250}>
                <View style={styles.readingsBlock}>
                  <Text style={styles.sectionLabel}>Accelerometer · m/s²</Text>
                  <View style={styles.grid}>
                    <AnimatedValue label="X" value={latestReading.accelX} unit="m/s²" color={Colors.accentX} />
                    <AnimatedValue label="Y" value={latestReading.accelY} unit="m/s²" color={Colors.accentY} />
                    <AnimatedValue label="Z" value={latestReading.accelZ} unit="m/s²" color={Colors.accentZ} />
                  </View>
                </View>
              </FadeSlide>
            )}

            <FadeSlide delay={300}>
              <GradientButton label="Training beenden" variant="stop" onPress={stopTraining} />
            </FadeSlide>
          </View>
        )}

        {/* 4. IDLE STATE: Exercise Selection & Start Trigger */}
        {isConnected && trainingStatus === 'idle' && (
          <View style={styles.idleActiveContainer}>
            {/* Live Sensordaten (immer sichtbar wenn verbunden) */}
            {latestReading && (
              <FadeSlide delay={100}>
                <Text style={styles.sectionLabel}>Live Sensordaten</Text>
                <GlassCard style={styles.sensorLiveCard}>
                  <Text style={styles.sensorGroupTitle}>Beschleunigung (m/s²)</Text>
                  <View style={styles.grid}>
                    <AnimatedValue label="X" value={latestReading.accelX} unit="m/s²" color={Colors.accentX} />
                    <AnimatedValue label="Y" value={latestReading.accelY} unit="m/s²" color={Colors.accentY} />
                    <AnimatedValue label="Z" value={latestReading.accelZ} unit="m/s²" color={Colors.accentZ} />
                  </View>
                  <Text style={[styles.sensorGroupTitle, { marginTop: 12 }]}>Gyroskop (rad/s)</Text>
                  <View style={styles.grid}>
                    <AnimatedValue label="X" value={latestReading.gyroX} unit="rad/s" color={Colors.accentX} />
                    <AnimatedValue label="Y" value={latestReading.gyroY} unit="rad/s" color={Colors.accentY} />
                    <AnimatedValue label="Z" value={latestReading.gyroZ} unit="rad/s" color={Colors.accentZ} />
                  </View>
                </GlassCard>
              </FadeSlide>
            )}

            {/* Live Chart (rollendes Diagramm im Idle-Zustand) */}
            <FadeSlide delay={110}>
              <LiveChart data={idleChartData} />
            </FadeSlide>

            {!latestReading && (
              <FadeSlide delay={100}>
                <GlassCard style={styles.sensorLiveCard}>
                  <Text style={styles.sensorWaiting}>Warte auf Sensordaten...</Text>
                </GlassCard>
              </FadeSlide>
            )}

            {/* Live KI-Erkennung vom Sensor-Chip */}
            <FadeSlide delay={120}>
              <Text style={styles.sectionLabel}>Live KI-Klassifizierung</Text>
              <GlassCard style={styles.kiCard}>
                <View style={styles.kiHeader}>
                  <View style={styles.kiTitleGroup}>
                    <Text style={styles.kiTitle}>Erkannte Bewegung</Text>
                    <Text style={styles.kiLabel}>
                      {formatMovementLabel(inferenceLabel)}
                    </Text>
                  </View>
                  <View style={[
                    styles.qualityBadge,
                    {
                      backgroundColor: !inferenceLabel || inferenceLabel.toLowerCase() === 'idle'
                        ? 'rgba(77,140,124,0.1)'
                        : ['curl', 'lateralraise', 'lateralraises', 'shoulderpress'].includes(inferenceLabel.toLowerCase()) || inferenceLabel.toLowerCase().includes('sauber')
                          ? 'rgba(0,212,170,0.1)'
                          : 'rgba(248,113,113,0.1)'
                    }
                  ]}>
                    <Text style={[
                      styles.qualityText,
                      {
                        color: !inferenceLabel || inferenceLabel.toLowerCase() === 'idle'
                          ? Colors.textSub
                          : ['curl', 'lateralraise', 'lateralraises', 'shoulderpress'].includes(inferenceLabel.toLowerCase()) || inferenceLabel.toLowerCase().includes('sauber')
                            ? Colors.connected
                            : Colors.error
                      }
                    ]}>
                      {!inferenceLabel || inferenceLabel.toLowerCase() === 'idle'
                        ? 'Bereit'
                        : ['curl', 'lateralraise', 'lateralraises', 'shoulderpress'].includes(inferenceLabel.toLowerCase()) || inferenceLabel.toLowerCase().includes('sauber')
                          ? 'Aktiv'
                          : 'Korrektur noetig'}
                    </Text>
                  </View>
                </View>

                {inferenceTipp ? (
                  <View style={styles.kiFeedbackRow}>
                    <Text style={styles.kiTippLabel}>Tipp:</Text>
                    <Text style={styles.kiTippText}>{inferenceTipp}</Text>
                  </View>
                ) : null}

                {inferenceConfidence !== null && inferenceConfidence > 0 ? (
                  <View style={styles.kiConfidenceRow}>
                    <Text style={styles.kiConfidenceText}>
                      Konfidenz: {(inferenceConfidence * 100).toFixed(0)}%
                    </Text>
                  </View>
                ) : null}

                {inferenceAnomaly !== null ? (
                  <View style={styles.kiConfidenceRow}>
                    <Text style={styles.kiConfidenceText}>
                      Anomalie-Score: {inferenceAnomaly.toFixed(3)}
                    </Text>
                  </View>
                ) : null}
              </GlassCard>
            </FadeSlide>
          </View>
        )}

        {/* 5. NO SENSOR CONNECTED HINT */}
        {!isConnected && bleStatus === 'idle' && (
          <FadeSlide delay={200}>
            <LinearGradient
              colors={['rgba(0,212,170,0.08)', 'transparent']}
              style={styles.idleCard}
            >
              <Text style={styles.idleTitle}>Kein Sensor verbunden</Text>
              <Text style={styles.idleBody}>
                Schalte deinen XIAO nRF52840 ein und tippe oben auf "Verbinden".
              </Text>
            </LinearGradient>
          </FadeSlide>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 14, paddingBottom: 40 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  pageTitle: { color: Colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },

  recBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryDim, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.primaryGlow,
  },
  recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  recLabel: { color: Colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },

  readingsBlock: { gap: 10 },
  sectionLabel: { color: Colors.textSub, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  grid: { flexDirection: 'row', gap: 8 },

  idleCard: {
    borderRadius: 20, padding: 32, alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: Colors.border, marginTop: 16,
  },
  idleIcon: { fontSize: 40, marginBottom: 4 },
  idleTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  idleBody: { color: Colors.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 260 },

  // Preparing State
  preparingContainer: { gap: 16 },
  countdownCard: { padding: 24, alignItems: 'center', gap: 14 },
  countdownTitle: { color: Colors.textSub, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  countdownCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.surfaceActive,
    borderWidth: 2, borderColor: Colors.primaryGlow,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowRadius: 10, shadowOpacity: 0.1,
  },
  countdownNumber: { color: Colors.primaryLight, fontSize: 38, fontWeight: '900' },
  countdownSub: { color: Colors.text, fontSize: 14, fontWeight: '600', textAlign: 'center' },

  // Recording Tracking State
  trackingContainer: { gap: 16 },
  trackingHeader: { alignItems: 'center', marginBottom: 4 },
  trackingTitle: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  trackingSub: { color: Colors.textSub, fontSize: 12, fontWeight: '500' },

  // Idle Selection State
  idleActiveContainer: { gap: 16 },
  sensorLiveCard: {
    padding: 16,
    gap: 10,
  },
  sensorGroupTitle: {
    color: Colors.textSub,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  sensorWaiting: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center' as const,
    paddingVertical: 16,
  },
  exerciseSelector: { flexDirection: 'row' as const, gap: 12 },
  exerciseCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 6,
  },
  exerciseCardActive: {
    backgroundColor: Colors.surfaceActive,
    borderColor: Colors.primaryGlow,
    shadowColor: Colors.primary,
    shadowRadius: 12,
    shadowOpacity: 0.08,
  },
  exerciseLabel: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  exerciseDesc: { color: Colors.textSub, fontSize: 11, fontWeight: '500' },
  kiCard: {
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    marginBottom: 8,
  },
  kiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kiTitleGroup: {
    flex: 1,
    gap: 4,
  },
  kiTitle: {
    color: Colors.textSub,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kiLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  qualityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kiFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,255,180,0.06)',
  },
  kiTippLabel: {
    color: Colors.textSub,
    fontSize: 13,
    fontWeight: '600',
  },
  kiTippText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  kiConfidenceRow: {
    alignItems: 'flex-end',
  },
  kiConfidenceText: {
    color: Colors.textSub,
    fontSize: 11,
    fontWeight: '500',
  },
});
