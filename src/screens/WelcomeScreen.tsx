import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Alert } from 'react-native';
import { useTheme, Theme, theme, useThemeContext, ThemeMode } from '../theme/colors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {useSharedValue,useAnimatedStyle,withTiming,withDelay,Easing,withRepeat,withSequence,interpolate,} from 'react-native-reanimated';
const { width, height } = Dimensions.get('window');
import { StaggeredText } from '../components/StaggeredText';
import { SettingsDrawer } from '../components/SettingsDrawer';

interface WelcomeScreenProps {
  onNext: (mode: 'presentation' | 'notes') => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const { mode, setMode } = useThemeContext();
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const button1Anim = useSharedValue(0);
  const button2Anim = useSharedValue(0);
  const button3Anim = useSharedValue(0);

  const handleToggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (mode === 'auto') setMode('light');
    else if (mode === 'light') setMode('dark');
    else setMode('auto');
  };

  const getThemeIcon = () => {
    if (mode === 'light') return 'sun';
    if (mode === 'dark') return 'moon';
    return 'aperture';
  };

  const bgPulse = useSharedValue(1);
  const containerReveal = useSharedValue(0);

  useEffect(() => {
    const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
    const luxuriousReveal = Easing.bezier(0.16, 1, 0.3, 1);

    containerReveal.value = withTiming(1, { duration: 2000, easing: luxuriousReveal });

    button1Anim.value = withDelay(1200, withTiming(1, { duration: 1000, easing: easeOut }));
    button2Anim.value = withDelay(1400, withTiming(1, { duration: 1000, easing: easeOut }));
    button3Anim.value = withDelay(1600, withTiming(1, { duration: 1000, easing: easeOut }));
  }, []);

  const handlePress = (mode: 'presentation' | 'notes') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext(mode);
  };

  const [isSettingsVisible, setSettingsVisible] = React.useState(false);

  const handleOpenSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettingsVisible(true);
  };

  const confirmClearData = async () => {
    try {
      await AsyncStorage.multiRemove(['@setup_data', '@notes_data']);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  };

  const screenRevealStyle = useAnimatedStyle(() => ({
    opacity: containerReveal.value,
    transform: [{ scale: interpolate(containerReveal.value, [0, 1], [0.85, 1]) }],
  }));

  const button1Style = useAnimatedStyle(() => ({
    opacity: button1Anim.value,
    transform: [{ translateY: interpolate(button1Anim.value, [0, 1], [20, 0]) }]
  }));

  const button2Style = useAnimatedStyle(() => ({
    opacity: button2Anim.value,
    transform: [{ translateY: interpolate(button2Anim.value, [0, 1], [20, 0]) }]
  }));

  const button3Style = useAnimatedStyle(() => ({
    opacity: button3Anim.value,
    transform: [{ translateY: interpolate(button3Anim.value, [0, 1], [20, 0]) }]
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, screenRevealStyle]}>
        <View style={{ gap: -4 }}>
          <StaggeredText 
            text="O palco é seu." 
            delay={400}
            textStyle={[styles.titleLine, { color: theme.colors.textPrimary }]} 
          />
          <StaggeredText 
            text="Nós cuidamos" 
            delay={800}
            textStyle={[styles.titleLine, { color: theme.colors.textPrimary }]} 
          />
          <StaggeredText 
            text="do ritmo." 
            delay={1200}
            textStyle={[styles.titleLine, { color: theme.colors.textPrimary }]} 
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Animated.View style={button1Style}>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={() => handlePress('presentation')}
            >
              <Text style={styles.buttonText}>Criar Apresentação</Text>
            </Pressable>
          </Animated.View>
          <Animated.View style={button2Style}>
            <Pressable
              style={({ pressed }) => [styles.buttonOutline, pressed && styles.buttonPressed]}
              onPress={() => handlePress('notes')}
            >
              <Text style={styles.buttonOutlineText}>Anotações Livres</Text>
            </Pressable>
          </Animated.View>
          <Animated.View style={button3Style}>
            <Pressable style={styles.clearButton} onPress={handleOpenSettings}>
              <Text style={styles.clearButtonText}>Configurações</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>

      <SettingsDrawer 
        visible={isSettingsVisible} 
        onClose={() => setSettingsVisible(false)} 
        onConfirmClearData={confirmClearData}
        themeMode={mode}
        onToggleTheme={handleToggleTheme}
      />
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  headerArea: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 20,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  themeTogglePressed: {
    opacity: 0.6,
    transform: [{ scale: 0.9 }],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  overflowContainer: {
    overflow: 'hidden',
  },
  titleLine: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 56,
    lineHeight: 64,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  buttonContainer: {
    marginTop: 64,
    width: '100%',
    gap: 16,
  },
  button: {
    backgroundColor: theme.colors.textPrimary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: theme.geometry.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: theme.geometry.radius,
    borderWidth: 1,
    borderColor: theme.colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 18,
    color: theme.colors.background,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  buttonOutlineText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 18,
    color: theme.colors.textPrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  clearButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    opacity: 0.8,
    textTransform: 'uppercase',
  },
});