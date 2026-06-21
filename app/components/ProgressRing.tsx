/**
 * @implements FA6, FA9
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  withSpring,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { GlassCard } from '@/components/GlassCard';
import { ExerciseState } from '@/store';

interface Props {
  angle: number;
  targetAngle: number;
  repCount: number;
  exerciseState: ExerciseState;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 220;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ angle, targetAngle, repCount, exerciseState }: Props) {
  const isPeak = exerciseState === 'peak';
  
  // Calculate raw progress (capped at 1.0)
  const rawProgress = Math.min(1.0, Math.max(0, angle / targetAngle));
  
  // Create an animated derived value for smooth transitions
  const animatedProgress = useDerivedValue(() => {
    return withSpring(rawProgress, { damping: 15, stiffness: 120 });
  });

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - animatedProgress.value);
    return {
      strokeDashoffset,
    };
  });

  // Pulse effect when the user completes a repetition
  const repScale = useDerivedValue(() => {
    return withSpring(1.0, { damping: 10, stiffness: 100 });
  });

  const animatedRepStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: isPeak ? withSequence(withTiming(1.15, { duration: 100 }), withSpring(1.0)) : 1.0 }],
    };
  });

  return (
    <GlassCard style={styles.card}>
      <View style={styles.container}>
        <Svg width={SIZE} height={SIZE} style={styles.svg}>
          <Defs>
            <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={isPeak ? Colors.primaryLight : Colors.accentX} />
              <Stop offset="100%" stopColor={isPeak ? Colors.primary : Colors.primary} />
            </LinearGradient>
          </Defs>

          {/* Background circle track */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="rgba(0,255,180,0.03)"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />

          {/* Active progress track */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="url(#ringGrad)"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            animatedProps={animatedCircleProps}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`} // Rotate to start from top
          />
        </Svg>

        {/* Content inside the ring */}
        <View style={styles.innerContent}>
          <Text style={[styles.angleText, isPeak && styles.angleTextPeak]}>
            {angle}°
          </Text>
          <Text style={styles.angleLabel}>
            Ziel: {targetAngle}°
          </Text>

          <Animated.View style={[styles.repBox, animatedRepStyle]}>
            <Text style={[styles.repValue, isPeak && styles.repValuePeak]}>
              {repCount}
            </Text>
            <Text style={styles.repLabel}>Wdh.</Text>
          </Animated.View>
        </View>
      </View>

      {/* State indicator banner */}
      <View style={[styles.badge, isPeak && styles.badgeActive]}>
        <Text style={[styles.badgeText, isPeak && styles.badgeTextActive]}>
          {exerciseState === 'start' && 'BEREIT'}
          {exerciseState === 'moving' && 'BEWEGUNG...'}
          {exerciseState === 'peak' && '🔥 ZIEL ERREICHT!'}
          {exerciseState === 'returning' && 'ZURÜCKFÜHREN'}
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 24, alignItems: 'center', gap: 20 },
  container: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute' },
  innerContent: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  
  angleText: {
    color: Colors.text,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  angleTextPeak: {
    color: Colors.primaryLight,
    textShadowColor: Colors.primaryGlow,
    textShadowRadius: 15,
  },
  angleLabel: {
    color: Colors.textSub,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  
  repBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,255,180,0.06)',
  },
  repValue: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  repValuePeak: {
    color: Colors.primaryLight,
  },
  repLabel: {
    color: Colors.textSub,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  badgeActive: {
    backgroundColor: Colors.primaryDim,
    borderColor: Colors.primaryGlow,
  },
  badgeText: {
    color: Colors.textSub,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  badgeTextActive: {
    color: Colors.primaryLight,
  },
});
