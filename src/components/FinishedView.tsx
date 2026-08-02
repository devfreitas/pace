import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, Theme } from '../theme/colors';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing, withDelay, interpolate } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const Particle = ({ index, total, progress }: { index: number, total: number, progress: Animated.SharedValue<number> }) => {
  const theme = useTheme();
  const random1 = Math.sin(index * 123.456) * 0.5 + 0.5;
  const random2 = Math.cos(index * 321.654) * 0.5 + 0.5;
  const random3 = Math.sin(index * 890.123) * 0.5 + 0.5;

  const angle = (index * 360) / total + (random1 * 30 - 15);
  const distance = 60 + random2 * 180;
  const size = 6 + random3 * 10;

  const theta = (angle * Math.PI) / 180;
  const targetX = Math.cos(theta) * distance;
  const targetY = Math.sin(theta) * distance;

  const colors = [theme.colors.accent, theme.emotions.story, theme.emotions.intro, theme.colors.textPrimary, theme.emotions.climax];
  const color = colors[index % colors.length];

  const style = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 0.7, 1], [1, 1, 0]),
      transform: [
        { translateX: interpolate(progress.value, [0, 1], [0, targetX]) },
        { translateY: interpolate(progress.value, [0, 1], [0, targetY]) },
        { scale: interpolate(progress.value, [0, 1], [0.5, 1]) },
      ]
    };
  });

  return (
    <Animated.View style={[{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
    }, style]} />
  );
};

export function FinishedView({ onEnd }: { onEnd: () => void }) {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const particlesProgress = useSharedValue(0);
  const orbScale = useSharedValue(0);
  const orbRotate = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    orbScale.value = withSequence(
      withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
      withDelay(100, withTiming(0, { duration: 300, easing: Easing.in(Easing.exp) }))
    );

    orbRotate.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) });

    particlesProgress.value = withDelay(800, withTiming(1, { duration: 1500, easing: Easing.out(Easing.exp) }));

    contentOpacity.value = withDelay(1400, withTiming(1, { duration: 800 }));
    contentTranslateY.value = withDelay(1400, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }]
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: orbScale.value },
      { rotate: `${interpolate(orbRotate.value, [0, 1], [-90, 0])}deg` }
    ]
  }));

  const NUM_PARTICLES = 40;

  return (
    <View style={[styles.container, styles.finishedContainer]}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      <Animated.View style={[{
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
      }, orbStyle]}>
        <Feather name="check" size={40} color={theme.colors.background} />
      </Animated.View>

      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', zIndex: 4 }]} pointerEvents="none">
        {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
          <Particle key={i} index={i} total={NUM_PARTICLES} progress={particlesProgress} />
        ))}
      </View>

      <Animated.View style={[{ alignItems: 'center', zIndex: 10 }, contentStyle]}>
        <Text style={styles.finishedTitle}>Apresentação Finalizada!</Text>
        <Text style={styles.finishedSubtitle}>Parabéns por concluir.</Text>
        <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]} onPress={onEnd}>
          <Text style={styles.backButtonText}>Voltar para Configurações</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  finishedContainer: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  finishedTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 40, color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 16 },
  finishedSubtitle: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 24, color: theme.colors.textSecondary, marginBottom: 48 },
  backButton: { backgroundColor: theme.colors.textPrimary, paddingVertical: 16, paddingHorizontal: 40, borderRadius: theme.geometry.radius },
  backButtonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  backButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 18, color: theme.colors.background, letterSpacing: 2, textTransform: 'uppercase' },
});
