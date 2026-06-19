import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

interface BlobProps {
  color: string;
  size: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  duration: number;
}

function Blob({ color, size, x, y, dx, dy, duration }: BlobProps) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  useEffect(() => {
    tx.value = withRepeat(
      withTiming(dx, { duration, easing: Easing.inOut(Easing.quad) }),
      -1, true
    );
    ty.value = withRepeat(
      withTiming(dy, { duration: Math.round(duration * 1.4), easing: Easing.inOut(Easing.quad) }),
      -1, true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.blob,
        style,
        {
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: color,
          left: x - size / 2,
          top: y - size / 2,
          // CSS filter only applies on web; silently ignored on native
          // @ts-ignore
          filter: 'blur(90px)',
        },
      ]}
    />
  );
}

export function AuroraBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Blob color="rgba(0,212,170,0.16)" size={340} x={W * 0.15} y={H * 0.18} dx={80}  dy={-60} duration={9000} />
      <Blob color="rgba(0,255,160,0.10)" size={280} x={W * 0.80} y={H * 0.42} dx={-70} dy={55}  duration={11500} />
      <Blob color="rgba(56,189,148,0.12)" size={210} x={W * 0.50} y={H * 0.72} dx={55}  dy={-45} duration={8200} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute' },
});
