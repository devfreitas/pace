import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Vibration } from 'react-native';
import { useTheme, Theme, theme } from '../theme/colors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import Animated, {useSharedValue,useAnimatedStyle,withTiming,withRepeat,withSequence,Easing,runOnJS,interpolate,withDelay,} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Block } from '../types';
import { FinishedView } from '../components/FinishedView';

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
    scaleVal.value = 0.1;
    fadeVal.value = 0;
    pulseVal.value = 1;

    fadeVal.value = withTiming(1, { duration: 3000, easing: Easing.out(Easing.cubic) });
    scaleVal.value = withTiming(12, { duration: blockDurationSecs * 1000, easing: Easing.linear });

    pulseVal.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.96, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

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
            {!isWaitingForNext && (
              <Text style={styles.titleHintText}>
                Dê dois toques na tela para passar{'\n'}para o próximo
              </Text>
            )}
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

const getStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { flex: 1, zIndex: 10, paddingVertical: 60, paddingHorizontal: 24 },
  topContainer: { alignItems: 'center', marginBottom: 40 },
  currentBlockTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, color: theme.colors.textPrimary, textAlign: 'center', letterSpacing: 4, textTransform: 'uppercase' },
  titleHintText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: theme.colors.textPrimary, textAlign: 'center', opacity: 0.6, marginTop: 6, lineHeight: 16, fontStyle: 'italic' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  currentBlockText: { fontFamily: 'CormorantGaramond_500Medium', color: theme.colors.textPrimary, textAlign: 'center', textShadowColor: 'rgba(249,248,246,0.9)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16 },
  bottomContainer: { alignItems: 'center', marginTop: 40 },
  remainingTime: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 56, color: theme.colors.textSecondary, opacity: 0.5 },
  remainingTimeAlert: { color: theme.colors.error, opacity: 1 },
  waitingHint: { fontFamily: 'CormorantGaramond_500Medium', fontSize: 18, color: theme.colors.textPrimary, marginBottom: 16, opacity: 0.6, letterSpacing: 1 },
  });