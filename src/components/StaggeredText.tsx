import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

type StaggeredDigitProps = {
  digit: string;
  progress: Animated.SharedValue<number>;
  fontSize?: number;
  fontHeight?: number;
  textStyle?: StyleProp<TextStyle>;
};

const StaggeredDigit: React.FC<StaggeredDigitProps> = ({
  digit,
  progress,
  fontSize = 50,
  fontHeight = 55,
  textStyle,
}) => {
  const rStyle = useAnimatedStyle(() => {
    const rotateX = `${progress.value * 90}deg`;
    return {
      opacity: 1 - progress.value,
      transform: [
        { perspective: 1000 },
        { translateY: (-progress.value * fontHeight) / 2 },
        { rotateX },
      ],
    };
  });

  const rBottomDigitStyle = useAnimatedStyle(() => {
    const rotateX = interpolate(progress.value, [0, 1], [-90, 0]);
    const translateY = interpolate(progress.value, [0, 1], [fontHeight / 2, 0]);
    return {
      opacity: progress.value,
      transform: [
        { perspective: 1000 },
        { translateY },
        { rotateX: `${rotateX}deg` },
      ],
    };
  });

  return (
    <Animated.View style={styles.digitContainer}>
      <Animated.Text style={[styles.digit, { fontSize, lineHeight: fontHeight }, rStyle, textStyle]}>
        {digit}
      </Animated.Text>
      <Animated.Text
        style={[styles.digit, { position: 'absolute', fontSize, lineHeight: fontHeight }, rBottomDigitStyle, textStyle]}
      >
        {digit}
      </Animated.Text>
    </Animated.View>
  );
};

export type StaggeredTextProps = {
  text: string;
  delay?: number;
  fontSize?: number;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  continuousLoop?: boolean; 
};

export const StaggeredText = ({
  text,
  delay = 0,
  fontSize = 56,
  textStyle,
  containerStyle,
  continuousLoop = true,
}: StaggeredTextProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;
    
    timeout = setTimeout(() => {
      progress.value = 1;
      if (continuousLoop) {
        interval = setInterval(() => {
          progress.value = progress.value === 0 ? 1 : 0;
        }, 4000);
      }
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [continuousLoop, delay]);

  const chars = text.split('');
  
  return (
    <View style={[styles.container, containerStyle]}>
      {chars.map((char, index) => {
        const delayedProgress = useDerivedValue(() => {
          const delayMs = index * 40; // tighter stagger
          return withDelay(
            delayMs,
            withTiming(progress.value, {
              duration: 500,
              easing: Easing.bezier(0.455, 0.03, 0.515, 0.955),
            }),
          );
        }, []);

        // Treat spaces specially so they occupy width
        if (char === ' ') {
          return <View key={index} style={{ width: fontSize * 0.25 }} />;
        }

        return (
          <StaggeredDigit
            key={index}
            digit={char}
            progress={delayedProgress}
            fontSize={fontSize}
            fontHeight={fontSize + 8}
            textStyle={textStyle}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  digitContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  digit: {
    // color inherited from textStyle
  },
});
