import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, AccessibilityInfo } from 'react-native';
import Animated, {useSharedValue,useAnimatedStyle,withTiming,Easing,runOnJS,interpolate,} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EASE_OUT_QUINT = Easing.bezier(0.22, 1, 0.36, 1);

const ENTER_DURATION = 420;
const EXIT_DURATION = 320;

const SLIDE_DISTANCE = SCREEN_WIDTH * 0.15;

type ScreenKey = string;

interface ScreenTransitionProps {
  activeScreen: ScreenKey;
  direction: 'forward' | 'back';
  screens: Record<ScreenKey, React.ReactNode>;
}

export function ScreenTransition({ activeScreen, direction, screens }: ScreenTransitionProps) {
  const [displayedScreens, setDisplayedScreens] = useState<{
    current: ScreenKey;
    previous: ScreenKey | null;
    dir: 'forward' | 'back';
  }>({ current: activeScreen, previous: null, dir: 'forward' });

  const progress = useSharedValue(1); // 0 = showing previous, 1 = showing current
  const isTransitioning = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion
    );
    return () => subscription.remove();
  }, []);

  const onTransitionComplete = useCallback(() => {
    isTransitioning.current = false;
    setDisplayedScreens(prev => ({
      ...prev,
      previous: null,
    }));
  }, []);

  useEffect(() => {
    if (activeScreen === displayedScreens.current) return;

    isTransitioning.current = true;
    const previousScreen = displayedScreens.current;

    setDisplayedScreens({
      current: activeScreen,
      previous: previousScreen,
      dir: direction,
    });

    if (reducedMotion) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 10 }, (finished) => {
        if (finished) runOnJS(onTransitionComplete)();
      });
    } else {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: ENTER_DURATION,
        easing: EASE_OUT_QUINT,
      }, (finished) => {
        if (finished) runOnJS(onTransitionComplete)();
      });
    }
  }, [activeScreen]);

  const currentDir = displayedScreens.dir;

  const outgoingStyle = useAnimatedStyle(() => {
    if (displayedScreens.previous === null) {
      return { opacity: 0, transform: [{ translateX: 0 }] };
    }

    const slideDir = currentDir === 'forward' ? -1 : 1;
    const opacity = interpolate(progress.value, [0, 0.6], [1, 0], 'clamp');
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [0, slideDir * SLIDE_DISTANCE]
    );

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  const incomingStyle = useAnimatedStyle(() => {
    const slideDir = currentDir === 'forward' ? 1 : -1;
    const opacity = interpolate(progress.value, [0.15, 0.75], [0, 1], 'clamp');
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [slideDir * SLIDE_DISTANCE, 0]
    );

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.container}>
      {displayedScreens.previous !== null && screens[displayedScreens.previous] && (
        <Animated.View
          style={[styles.screen, outgoingStyle]}
          pointerEvents="none"
        >
          {screens[displayedScreens.previous]}
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.screen,
          displayedScreens.previous !== null ? incomingStyle : undefined,
        ]}
        pointerEvents={isTransitioning.current ? 'none' : 'auto'}
      >
        {screens[displayedScreens.current]}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
});