import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../theme/colors';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export function ModernBackground() {
  const theme = useTheme();
  
  const o1x = useSharedValue(-60);
  const o1y = useSharedValue(-60);
  const o2x = useSharedValue(60);
  const o2y = useSharedValue(60);
  const o3x = useSharedValue(0);
  const o3y = useSharedValue(0);

  useEffect(() => {
    o1x.value = withRepeat(withTiming(60, { duration: 15000, easing: Easing.inOut(Easing.sin) }), -1, true);
    o1y.value = withRepeat(withTiming(60, { duration: 12000, easing: Easing.inOut(Easing.sin) }), -1, true);

    o2x.value = withRepeat(withTiming(-60, { duration: 18000, easing: Easing.inOut(Easing.sin) }), -1, true);
    o2y.value = withRepeat(withTiming(-60, { duration: 14000, easing: Easing.inOut(Easing.sin) }), -1, true);

    o3x.value = withRepeat(withTiming(40, { duration: 20000, easing: Easing.inOut(Easing.sin) }), -1, true);
    o3y.value = withRepeat(withTiming(-40, { duration: 17000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const style1 = useAnimatedStyle(() => ({ transform: [{ translateX: o1x.value }, { translateY: o1y.value }, { scaleY: 1.2 }, { rotate: '30deg' }] }));
  const style2 = useAnimatedStyle(() => ({ transform: [{ translateX: o2x.value }, { translateY: o2y.value }] }));
  const style3 = useAnimatedStyle(() => ({ transform: [{ translateX: o3x.value }, { translateY: o3y.value }] }));

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[{
        position: 'absolute',
        width: width * 1.4,
        height: width * 1.4,
        borderRadius: width * 0.7,
        backgroundColor: theme.colors.textSecondary,
        top: -width * 0.3,
        left: -width * 0.4,
        opacity: theme.isDark ? 0.25 : 0.15,
      }, style1]} />
      
      <Animated.View style={[{
        position: 'absolute',
        width: width * 1.6,
        height: width * 1.6,
        borderRadius: width * 0.8,
        backgroundColor: theme.colors.textMuted,
        bottom: -width * 0.5,
        right: -width * 0.3,
        opacity: theme.isDark ? 0.2 : 0.12,
      }, style2]} />

      <Animated.View style={[{
        position: 'absolute',
        width: width * 0.9,
        height: width * 0.9,
        borderRadius: width * 0.45,
        backgroundColor: theme.colors.textPrimary,
        top: height * 0.3,
        right: width * 0.1,
        opacity: theme.isDark ? 0.15 : 0.08,
      }, style3]} />

      <BlurView 
        intensity={theme.isDark ? 100 : 80} 
        tint={theme.isDark ? "dark" : "light"} 
        style={StyleSheet.absoluteFill} 
      />
    </View>
  );
}
