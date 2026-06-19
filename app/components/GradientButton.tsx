import React from 'react';
import { Pressable, Text, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'stop' | 'ghost';
  style?: ViewStyle;
  disabled?: boolean;
}

export function GradientButton({ label, onPress, variant = 'primary', style, disabled = false }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 18, stiffness: 300 });
  }

  async function handlePress() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }

  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [{ opacity: pressed && disabled ? 0.5 : 1 }]}
      >
        {variant === 'primary' && (
          <LinearGradient
            colors={['#FF4422', Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.base}
          >
            <Text style={styles.labelPrimary}>{label}</Text>
          </LinearGradient>
        )}
        {variant === 'stop' && (
          <View style={[styles.base, styles.stop]}>
            <View style={styles.stopGlow} />
            <Text style={styles.labelStop}>{label}</Text>
          </View>
        )}
        {variant === 'ghost' && (
          <View style={[styles.base, styles.ghost]}>
            <Text style={styles.labelGhost}>{label}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stop: {
    backgroundColor: Colors.surfaceBright,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  stopGlow: {
    position: 'absolute',
    inset: 0,
    backgroundColor: Colors.primaryDim,
  },
  ghost: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  labelPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  labelStop: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  labelGhost: {
    color: Colors.textSub,
    fontSize: 15,
    fontWeight: '600',
  },
});
