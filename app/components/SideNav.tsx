import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, interpolate,
} from 'react-native-reanimated';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';

const PANEL_WIDTH = 256;

const NAV_ITEMS = [
  { href: '/',         label: 'Training', icon: '▶' },
  { href: '/history',  label: 'Verlauf',  icon: '≡' },
  { href: '/settings', label: 'Gerät',    icon: '◎' },
] as const;

export function SideNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const open = useSharedValue(0);
  const [isOpen, setIsOpen] = useState(false);
  const targetRef = useRef(0);

  const toggle = useCallback(() => {
    const next = targetRef.current === 0 ? 1 : 0;
    targetRef.current = next;
    open.value = withSpring(next, { damping: 26, stiffness: 240 });
    setIsOpen(next === 1);
  }, []);

  const close = useCallback(() => {
    targetRef.current = 0;
    open.value = withSpring(0, { damping: 26, stiffness: 240 });
    setIsOpen(false);
  }, []);

  const navigate = (href: string) => {
    close();
    setTimeout(() => router.navigate(href as any), 180);
  };

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(open.value, [0, 1], [-(PANEL_WIDTH + 24), 0]) }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(open.value, [0, 1], [0, 0.7]),
  }));

  const bar1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(open.value, [0, 1], [0, 7]) },
      { rotate: `${interpolate(open.value, [0, 1], [0, 45])}deg` },
    ],
  }));
  const bar2Style = useAnimatedStyle(() => ({
    opacity: interpolate(open.value, [0, 1], [1, 0]),
  }));
  const bar3Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(open.value, [0, 1], [0, -7]) },
      { rotate: `${interpolate(open.value, [0, 1], [0, -45])}deg` },
    ],
  }));

  const isActive = (href: string) =>
    pathname === href || (href === '/' && (pathname === '/' || pathname === ''));

  return (
    <>
      {/* Backdrop — only rendered when open to avoid swallowing touches */}
      {isOpen && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        </Animated.View>
      )}

      {/* Slide-in panel */}
      <Animated.View style={[styles.panel, panelStyle]}>
        <BlurView intensity={24} tint="dark" style={styles.blur}>
          <View style={[styles.panelContent, { paddingTop: insets.top + 32 }]}>
            <Text style={styles.brand}>MOVELINK</Text>
            <Text style={styles.brandSub}>Navigation</Text>

            <View style={styles.navList}>
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Pressable
                    key={item.href}
                    onPress={() => navigate(item.href)}
                    style={({ pressed }) => [
                      styles.navItem,
                      active && styles.navItemActive,
                      pressed && styles.navItemPressed,
                    ]}
                  >
                    {active && <View style={styles.activePill} />}
                    <Text style={[styles.navIcon, active && styles.navIconActive]}>
                      {item.icon}
                    </Text>
                    <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </BlurView>
      </Animated.View>

      {/* Hamburger / close button */}
      <Pressable
        onPress={toggle}
        style={[styles.burger, { top: insets.top + 14 }]}
      >
        <View style={styles.bars}>
          <Animated.View style={[styles.bar, bar1Style]} />
          <Animated.View style={[styles.bar, bar2Style]} />
          <Animated.View style={[styles.bar, bar3Style]} />
        </View>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#07100E',
    zIndex: 90,
  },
  panel: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: PANEL_WIDTH,
    zIndex: 100,
    shadowColor: Colors.primary,
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  blur: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: Colors.borderBright,
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  brand: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
  },
  brandSub: {
    color: Colors.textSub,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
    marginBottom: 40,
  },
  navList: { gap: 4 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
    position: 'relative',
  },
  navItemActive: { backgroundColor: Colors.surfaceActive },
  navItemPressed: { backgroundColor: Colors.surface },
  activePill: {
    position: 'absolute',
    left: 0, top: 10, bottom: 10,
    width: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  navIcon: { fontSize: 18, color: Colors.textSub, width: 22, textAlign: 'center' },
  navIconActive: { color: Colors.primary },
  navLabel: { color: Colors.textSub, fontSize: 15, fontWeight: '600' },
  navLabelActive: { color: Colors.text, fontWeight: '700' },

  burger: {
    position: 'absolute',
    right: 18,
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 110,
  },
  bars: { gap: 5, alignItems: 'center' },
  bar: { width: 18, height: 1.5, borderRadius: 1, backgroundColor: Colors.text },
});
