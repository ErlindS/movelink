/**
 * @implements FA1.4
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { GlassCard } from '@/components/GlassCard';
import { ExerciseType } from '@/store';

interface Props {
  exercise: ExerciseType;
  label?: string;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ExerciseDemo({ exercise, label }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }), // In der Beugung verharren
        withTiming(0, { duration: 1500 })  // Zurück zur Ausgangslage
      ),
      -1,
      true
    );
  }, [exercise]);

  // SQUAT COORDINATES INTERPOLATION
  const squatKneeProps = useAnimatedProps(() => ({
    x2: 130 + 25 * progress.value,
    y2: 150 + 10 * progress.value,
  }));

  const squatThighProps = useAnimatedProps(() => {
    const kx = 130 + 25 * progress.value;
    const ky = 150 + 10 * progress.value;
    return {
      x1: kx,
      y1: ky,
      x2: 130 - 35 * progress.value,
      y2: 95 + 50 * progress.value,
    };
  });

  const squatTorsoProps = useAnimatedProps(() => {
    const hx = 130 - 35 * progress.value;
    const hy = 95 + 50 * progress.value;
    return {
      x1: hx,
      y1: hy,
      x2: 130 - 15 * progress.value,
      y2: 35 + 55 * progress.value,
    };
  });

  const squatHeadProps = useAnimatedProps(() => ({
    cx: 130 - 15 * progress.value,
    cy: 17 + 55 * progress.value,
  }));

  // CURL COORDINATES INTERPOLATION (Elbow fixed, forearm rotates)
  const curlForearmProps = useAnimatedProps(() => {
    const rad = (270 - 150 * progress.value) * (Math.PI / 180);
    return {
      x2: 120 + 50 * Math.cos(rad),
      y2: 125 + 50 * Math.sin(rad),
    };
  });

  const curlWristProps = useAnimatedProps(() => {
    const rad = (270 - 150 * progress.value) * (Math.PI / 180);
    return {
      cx: 120 + 50 * Math.cos(rad),
      cy: 125 + 50 * Math.sin(rad),
    };
  });

  return (
    <GlassCard style={styles.card}>
      <Text style={styles.title}>{label || 'Ausführung demonstrieren'}</Text>
      
      <View style={styles.container}>
        <Svg width="250" height="230" viewBox="0 0 250 230">
          {/* Ground indicator */}
          <Line x1="40" y1="210" x2="210" y2="210" stroke={Colors.textMuted} strokeWidth={2} strokeDasharray="4 4" />

          {exercise === 'squat' ? (
            <G>
              {/* FIXED FEET / ANKLE */}
              <Line x1="100" y1="210" x2="130" y2="210" stroke={Colors.primary} strokeWidth={6} strokeLinecap="round" />
              <Circle cx="130" cy="210" r="5" fill={Colors.primary} />

              {/* CALF (Ankle to Knee) */}
              <AnimatedLine
                x1={130}
                y1={210}
                stroke={Colors.primary}
                strokeWidth={5}
                strokeLinecap="round"
                animatedProps={squatKneeProps}
              />
              
              {/* KNEE JOINT */}
              <AnimatedCircle
                r="4"
                fill={Colors.primaryLight}
                animatedProps={useAnimatedProps(() => ({
                  cx: 130 + 25 * progress.value,
                  cy: 150 + 10 * progress.value,
                }))}
              />

              {/* THIGH (Knee to Hip) */}
              <AnimatedLine
                stroke={Colors.primary}
                strokeWidth={5}
                strokeLinecap="round"
                animatedProps={squatThighProps}
              />

              {/* HIP JOINT */}
              <AnimatedCircle
                r="4"
                fill={Colors.primaryLight}
                animatedProps={useAnimatedProps(() => ({
                  cx: 130 - 35 * progress.value,
                  cy: 95 + 50 * progress.value,
                }))}
              />

              {/* TORSO (Hip to Shoulder) */}
              <AnimatedLine
                stroke={Colors.primary}
                strokeWidth={5}
                strokeLinecap="round"
                animatedProps={squatTorsoProps}
              />

              {/* SHOULDER JOINT */}
              <AnimatedCircle
                r="4"
                fill={Colors.primaryLight}
                animatedProps={useAnimatedProps(() => ({
                  cx: 130 - 15 * progress.value,
                  cy: 35 + 55 * progress.value,
                }))}
              />

              {/* HEAD */}
              <AnimatedCircle
                r="12"
                fill="transparent"
                stroke={Colors.primary}
                strokeWidth={3}
                animatedProps={squatHeadProps}
              />
            </G>
          ) : (
            <G>
              {/* TORSO (Fixed upright body) */}
              <Line x1="120" y1="35" x2="120" y2="125" stroke={Colors.textMuted} strokeWidth={4} strokeLinecap="round" />
              <Circle cx="120" cy="22" r="10" fill="transparent" stroke={Colors.textMuted} strokeWidth={2.5} />
              
              {/* UPPER ARM (Shoulder fixed to Elbow) */}
              <Line x1="120" y1="70" x2="120" y2="125" stroke={Colors.primary} strokeWidth={5} strokeLinecap="round" />
              <Circle cx="120" cy="70" r="4" fill={Colors.primaryLight} />
              <Circle cx="120" cy="125" r="4" fill={Colors.primaryLight} />

              {/* FOREARM (Elbow to Wrist) */}
              <AnimatedLine
                x1={120}
                y1={125}
                stroke={Colors.primary}
                strokeWidth={5}
                strokeLinecap="round"
                animatedProps={curlForearmProps}
              />
              
              {/* WRIST */}
              <AnimatedCircle
                r="5"
                fill={Colors.primaryLight}
                animatedProps={curlWristProps}
              />
            </G>
          )}
        </Svg>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, alignItems: 'center', gap: 12 },
  title: { color: Colors.text, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  container: { height: 230, width: '100%', alignItems: 'center', justifyContent: 'center' },
});
