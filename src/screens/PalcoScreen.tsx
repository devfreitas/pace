import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Vibration } from 'react-native';
import { useTheme, Theme, theme } from '../theme/colors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
  interpolate,
  withDelay,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Block } from '../types';

const { width, height } = Dimensions.get('window');

interface PalcoScreenProps {
  blocks: Block[];
  onEnd: () => void;
}

const parseTimeToSeconds = (timeStr: string) => {
  const [min, sec] = timeStr.split(':').map(Number);
  return (min * 60) + (sec || 0);
};

const formatSecondsToTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getDynamicFontSize = (text?: string) => {
  if (!text) return 40;
  const length = text.length;
  if (length < 30) return 64;
  if (length < 80) return 48;
  if (length < 160) return 32;
  if (length < 300) return 26;
  return 20;
};


export function PalcoScreen({ blocks, onEnd }: PalcoScreenProps) {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  useKeepAwake();

  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [elapsedForPart, setElapsedForPart] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isWaitingForNext, setIsWaitingForNext] = useState(false);

  const currentBlock = blocks[currentBlockIndex];
  const blockDurationSecs = currentBlock ? parseTimeToSeconds(currentBlock.duration) : 0;
  const remainingTime = Math.max(0, blockDurationSecs - elapsedForPart);

  const scaleVal = useSharedValue(0.1);
  const fadeVal = useSharedValue(0);
  const pulseVal = useSharedValue(1);
  const rotationVal = useSharedValue(0);
  const contentFadeVal = useSharedValue(1);
  const contentTranslateVal = useSharedValue(0);

  useEffect(() => {
    if (!currentBlock || isFinished) return;
    
    // Reset values for new block
    scaleVal.value = 0.1;
    fadeVal.value = 0;
    pulseVal.value = 1;

    // Start background scale and fade
    fadeVal.value = withTiming(1, { duration: 3000, easing: Easing.out(Easing.cubic) });
    scaleVal.value = withTiming(12, { duration: blockDurationSecs * 1000, easing: Easing.linear });

    // Start pulse loop
    pulseVal.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.96, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // infinite
      true // reverse
    );

    // Organic slow rotation
    rotationVal.value = 0;
    rotationVal.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1,
      false
    );
  }, [currentBlockIndex, isFinished]);

  useEffect(() => {
    if (isFinished || isWaitingForNext) return;
    const interval = setInterval(() => {
      setElapsedForPart(prev => {
        const next = prev + 1;
        if (next >= blockDurationSecs) {
          clearInterval(interval);
          handleTimeUp();
          return blockDurationSecs;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, isWaitingForNext, blockDurationSecs]);

  const handleTimeUp = () => {
    setIsWaitingForNext(true);
    Vibration.vibrate([0, 500, 1000], true);
  };

  const advanceToNextBlock = () => {
    Vibration.cancel();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (currentBlockIndex < blocks.length - 1) {
      contentFadeVal.value = withTiming(0, { duration: 250 });
      contentTranslateVal.value = withTiming(-20, { duration: 250, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(setCurrentBlockIndex)(currentBlockIndex + 1);
          runOnJS(setElapsedForPart)(0);
          runOnJS(setIsWaitingForNext)(false);
          
          contentTranslateVal.value = 20;
          contentFadeVal.value = withTiming(1, { duration: 400 });
          contentTranslateVal.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
        }
      });
    } else {
      contentFadeVal.value = withTiming(0, { duration: 400 }, (finished) => {
        if (finished) runOnJS(setIsFinished)(true);
      });
    }
  };

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (!isFinished) {
        runOnJS(advanceToNextBlock)();
      }
    });

  useEffect(() => {
    return () => {
      Vibration.cancel();
    };
  }, []);

  const bgStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleVal.value }, 
      { scale: pulseVal.value },
      { rotate: `${rotationVal.value}deg` }
    ],
    opacity: fadeVal.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentFadeVal.value,
    transform: [{ translateY: contentTranslateVal.value }],
  }));

  if (isFinished) {
    return <FinishedView onEnd={onEnd} />;
  }

  return (
    <GestureDetector gesture={doubleTap}>
      <Animated.View style={styles.container}>
        <StatusBar style={theme.isDark ? "light" : "dark"} animated={true} />
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          <Animated.View style={[bgStyle, { alignItems: 'center', justifyContent: 'center' }]}>
            <View style={{ width: width * 0.2, height: width * 0.2, borderRadius: width * 0.1, backgroundColor: currentBlock?.color || theme.colors.textPrimary, opacity: 0.12 }} />
            <View style={{ position: 'absolute', width: width * 0.6, height: width * 0.6, borderRadius: width * 0.3, backgroundColor: currentBlock?.color || theme.colors.textPrimary, opacity: 0.08 }} />
            <View style={{ position: 'absolute', width: width * 1.4, height: width * 1.4, borderRadius: width * 0.7, backgroundColor: currentBlock?.color || theme.colors.textPrimary, opacity: 0.04 }} />
          </Animated.View>
        </View>
        <Animated.View style={[styles.content, contentStyle]}>
          <View style={styles.topContainer}>
            <Text style={styles.currentBlockTitle}>{currentBlock?.title || ''}</Text>
          </View>
          <View style={styles.centerContainer}>
            {currentBlock?.text ? (
              <Text style={[styles.currentBlockText, { fontSize: getDynamicFontSize(currentBlock.text), lineHeight: getDynamicFontSize(currentBlock.text) * 1.3 }]}>{currentBlock.text}</Text>
            ) : (
              <Text style={[styles.currentBlockText, { opacity: 0.3 }]}> (Sem texto)</Text>
            )}
          </View>
          <View style={styles.bottomContainer}>
            {isWaitingForNext && <Text style={styles.waitingHint}>Dê dois toques na tela para avançar</Text>}
            <Text style={[styles.remainingTime, isWaitingForNext && styles.remainingTimeAlert]}>{formatSecondsToTime(remainingTime)}</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

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

function FinishedView({ onEnd }: { onEnd: () => void }) {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const particlesProgress = useSharedValue(0);
  const orbScale = useSharedValue(0);
  const orbRotate = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    // Orb appears and collapses
    orbScale.value = withSequence(
      withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
      withDelay(100, withTiming(0, { duration: 300, easing: Easing.in(Easing.exp) }))
    );

    // Orb spins in as it appears
    orbRotate.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) });

    // Particles explode right as the orb collapses (at 800ms)
    particlesProgress.value = withDelay(800, withTiming(1, { duration: 1500, easing: Easing.out(Easing.exp) }));

    // Text reveals after explosion
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
      
      {/* Orb */}
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
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, zIndex: 10, paddingVertical: 60, paddingHorizontal: 24 },
  topContainer: { alignItems: 'center', marginBottom: 40 },
  currentBlockTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, color: theme.colors.textPrimary, textAlign: 'center', letterSpacing: 4, textTransform: 'uppercase' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  currentBlockText: { fontFamily: 'CormorantGaramond_500Medium', color: theme.colors.textPrimary, textAlign: 'center', textShadowColor: 'rgba(249,248,246,0.9)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16 },
  bottomContainer: { alignItems: 'center', marginTop: 40 },
  remainingTime: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 56, color: theme.colors.textSecondary, opacity: 0.5 },
  remainingTimeAlert: { color: theme.colors.error, opacity: 1 },
  waitingHint: { fontFamily: 'CormorantGaramond_500Medium', fontSize: 18, color: theme.colors.textPrimary, marginBottom: 16, opacity: 0.6, letterSpacing: 1 },
  finishedContainer: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  finishedTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 40, color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 16 },
  finishedSubtitle: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 24, color: theme.colors.textSecondary, marginBottom: 48 },
  backButton: { backgroundColor: theme.colors.textPrimary, paddingVertical: 16, paddingHorizontal: 40, borderRadius: theme.geometry.radius },
  backButtonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  backButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 18, color: theme.colors.background, letterSpacing: 2, textTransform: 'uppercase' },
});
