import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, interpolateColor,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import { Colors } from '@/constants/Colors';

export function AnimatedLogo() {
  const router = useRouter();
  const rotate = useSharedValue(0);
  const breathe = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.linear }), -1);
    breathe.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }), -1, true);
    shimmer.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value * 360}deg` }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * 0.06 }],
    shadowOpacity: 0.15 + breathe.value * 0.35,
    shadowRadius: 6 + breathe.value * 12,
  }));

  const wordStyle = useAnimatedStyle(() => ({
    color: interpolateColor(shimmer.value, [0, 1], [Colors.text, Colors.primary]),
  }));

  return (
    <Pressable style={styles.root} onPress={() => router.navigate('/')}>
      <View style={styles.badgeWrap}>
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.monogram}>ML</Text>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, ringStyle]}>
          <Svg width={46} height={46}>
            <Defs>
              <SvgGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={Colors.primaryLight} stopOpacity="1" />
                <Stop offset="0.5" stopColor={Colors.primary} stopOpacity="0.7" />
                <Stop offset="1" stopColor={Colors.primary} stopOpacity="0" />
              </SvgGradient>
            </Defs>
            <Circle cx={23} cy={23} r={21} fill="none" stroke="url(#rg)" strokeWidth={1.5} />
          </Svg>
        </Animated.View>
      </View>

      <View>
        <Animated.Text style={[styles.wordmark, wordStyle]}>MOVELINK</Animated.Text>
        <Text style={styles.tagline}>Motion Analytics</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badgeWrap: { width: 46, height: 46 },
  badge: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.surfaceActive,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderBright,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  monogram: { color: Colors.primary, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  wordmark: { fontSize: 16, fontWeight: '800', letterSpacing: 2.5 },
  tagline: { color: Colors.textSub, fontSize: 9, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 1 },
});
