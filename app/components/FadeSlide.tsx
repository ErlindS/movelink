import React from 'react';
import { View, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  delay?: number;
  from?: { opacity?: number; translateY?: number; scale?: number };
  style?: ViewStyle | ViewStyle[];
}

export function FadeSlide({ children, style }: Props) {
  return (
    <View style={style}>
      {children}
    </View>
  );
}
