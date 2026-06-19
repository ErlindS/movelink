import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

interface Props {
  label: string;
  value: number;
  unit: string;
  color: string;
}

export function AnimatedValue({ label, value, unit, color }: Props) {
  const scale = useSharedValue(1);
  const prevRef = useRef(value);

  useEffect(() => {
    if (Math.abs(value - prevRef.current) > 0.002) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 70 }),
        withTiming(1, { duration: 100 })
      );
      prevRef.current = value;
    }
  }, [value]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.labelRow]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
      <Animated.View style={animStyle}>
        <Text style={styles.value}>{value >= 0 ? ' ' : ''}{value.toFixed(3)}</Text>
      </Animated.View>
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 4,
    minWidth: '30%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  unit: {
    color: Colors.textSub,
    fontSize: 10,
    fontWeight: '500',
  },
});
