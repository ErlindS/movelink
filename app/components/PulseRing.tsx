import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface Props {
  color: string;
  size?: number;
  active?: boolean;
}

export function PulseRing({ color, size = 10, active = false }: Props) {
  const scale1 = useSharedValue(1);
  const opacity1 = useSharedValue(0);
  const scale2 = useSharedValue(1);
  const opacity2 = useSharedValue(0);

  useEffect(() => {
    if (active) {
      scale1.value = withRepeat(
        withSequence(
          withTiming(2.8, { duration: 1200, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 0 })
        ),
        -1
      );
      opacity1.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 0 }),
          withTiming(0, { duration: 1200, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );
      // Second ring, offset by 600ms
      setTimeout(() => {
        scale2.value = withRepeat(
          withSequence(
            withTiming(2.8, { duration: 1200, easing: Easing.out(Easing.ease) }),
            withTiming(1, { duration: 0 })
          ),
          -1
        );
        opacity2.value = withRepeat(
          withSequence(
            withTiming(0.35, { duration: 0 }),
            withTiming(0, { duration: 1200, easing: Easing.out(Easing.ease) }),
            withTiming(0, { duration: 0 })
          ),
          -1
        );
      }, 600);
    } else {
      scale1.value = withTiming(1, { duration: 300 });
      opacity1.value = withTiming(0, { duration: 300 });
      scale2.value = withTiming(1, { duration: 300 });
      opacity2.value = withTiming(0, { duration: 300 });
    }
  }, [active]);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  const dotSize = size;

  return (
    <View style={[styles.wrapper, { width: dotSize * 3, height: dotSize * 3 }]}>
      <Animated.View
        style={[styles.ring, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color }, ring1Style]}
      />
      <Animated.View
        style={[styles.ring, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color }, ring2Style]}
      />
      <View style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
  dot: {},
});
