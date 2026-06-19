import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  bright?: boolean;
  active?: boolean;
}

export function GlassCard({ children, style, bright = false, active = false }: Props) {
  return (
    <View
      style={[
        styles.card,
        bright && styles.bright,
        active && styles.active,
        style,
      ]}
    >
      {/* Top inner highlight — simulates glass refraction */}
      <View style={styles.highlight} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    padding: 18,
  },
  bright: {
    backgroundColor: Colors.surfaceBright,
    borderColor: Colors.borderBright,
  },
  active: {
    backgroundColor: Colors.surfaceActive,
    borderColor: Colors.primaryDim,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});
