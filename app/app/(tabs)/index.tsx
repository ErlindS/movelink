import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useBLEStore, useTrainingStore } from '@/store';
import { useBLE } from '@/hooks/useBLE';
import { useWebSocket } from '@/hooks/useWebSocket';
import { SensorCard } from '@/components/SensorCard';
import { LiveChart } from '@/components/LiveChart';
import { AnimatedValue } from '@/components/AnimatedValue';
import { GradientButton } from '@/components/GradientButton';
import { FadeSlide } from '@/components/FadeSlide';
import { AnimatedLogo } from '@/components/AnimatedLogo';

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

export default function TrainingScreen() {
  const { status, deviceName, latestReading } = useBLEStore();
  const { isRecording, liveBuffer, startSession, stopSession } = useTrainingStore();
  const { startScan, disconnectDevice } = useBLE();
  useWebSocket();

  const isConnected = status === 'connected';

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

        {/* Sensor */}
        <FadeSlide delay={100}>
          <SensorCard status={status} deviceName={deviceName} onScan={startScan} onDisconnect={disconnectDevice} />
        </FadeSlide>

        {/* Live readings */}
        {isConnected && latestReading && (
          <FadeSlide delay={140}>
            <View style={styles.readingsBlock}>
              <Text style={styles.sectionLabel}>Accelerometer · m/s²</Text>
              <View style={styles.grid}>
                <AnimatedValue label="X" value={latestReading.accelX} unit="m/s²" color={Colors.accentX} />
                <AnimatedValue label="Y" value={latestReading.accelY} unit="m/s²" color={Colors.accentY} />
                <AnimatedValue label="Z" value={latestReading.accelZ} unit="m/s²" color={Colors.accentZ} />
              </View>
              <Text style={styles.sectionLabel}>Gyroskop · rad/s</Text>
              <View style={styles.grid}>
                <AnimatedValue label="X" value={latestReading.gyroX} unit="rad/s" color={Colors.accentX} />
                <AnimatedValue label="Y" value={latestReading.gyroY} unit="rad/s" color={Colors.accentY} />
                <AnimatedValue label="Z" value={latestReading.gyroZ} unit="rad/s" color={Colors.accentZ} />
              </View>
            </View>
          </FadeSlide>
        )}

        {isConnected && (
          <FadeSlide delay={180}>
            <LiveChart data={liveBuffer} />
          </FadeSlide>
        )}

        {isConnected && (
          <FadeSlide delay={220}>
            {isRecording ? (
              <GradientButton label="⬛  Training stoppen" variant="stop" onPress={stopSession} />
            ) : (
              <GradientButton label="▶  Training starten" variant="primary" onPress={startSession} />
            )}
          </FadeSlide>
        )}

        {/* Idle hint */}
        {!isConnected && status === 'idle' && (
          <FadeSlide delay={200}>
            <LinearGradient
              colors={['rgba(0,212,170,0.08)', 'transparent']}
              style={styles.idleCard}
            >
              <Text style={styles.idleIcon}>📡</Text>
              <Text style={styles.idleTitle}>Kein Sensor verbunden</Text>
              <Text style={styles.idleBody}>
                Schalte deinen XIAO nRF52840 ein und tippe auf "Verbinden".
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
});
