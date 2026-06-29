import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  color: string;
  size?: number;
  active?: boolean;
}

export function PulseRing({ color, size = 10 }: Props) {
  const dotSize = size;

  return (
    <View style={[styles.wrapper, { width: dotSize * 3, height: dotSize * 3 }]}>
      <View style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  dot: {},
});
