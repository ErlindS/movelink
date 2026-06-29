import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import { Colors } from '@/constants/Colors';

export function AnimatedLogo() {
  const router = useRouter();

  return (
    <Pressable style={styles.root} onPress={() => router.navigate('/')}>
      <View style={styles.badgeWrap}>
        <View style={styles.badge}>
          <Text style={styles.monogram}>ML</Text>
        </View>
        <View style={[StyleSheet.absoluteFill]}>
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
        </View>
      </View>

      <View>
        <Text style={[styles.wordmark, { color: Colors.text }]}>MOVELINK</Text>
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
