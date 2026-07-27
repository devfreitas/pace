import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Alert } from 'react-native';
import { useTheme, Theme, theme, useThemeContext, ThemeMode } from '../theme/colors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated';

  const { width, height } = Dimensions.get('window');

import { StaggeredText } from '../components/StaggeredText';

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
    return 'aperture'; // Poetic choice for 'auto'
  };

  const bgPulse = useSharedValue(1);
  const containerReveal = useSharedValue(0);

  useEffect(() => {
    const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
    const luxuriousReveal = Easing.bezier(0.16, 1, 0.3, 1);

    // Fade and scale the entire screen from the center over 2 seconds
    containerReveal.value = withTiming(1, { duration: 2000, easing: luxuriousReveal });

    button1Anim.value = withDelay(1200, withTiming(1, { duration: 1000, easing: easeOut }));
    button2Anim.value = withDelay(1400, withTiming(1, { duration: 1000, easing: easeOut }));
    button3Anim.value = withDelay(1600, withTiming(1, { duration: 1000, easing: easeOut }));

    bgPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 6000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const handlePress = (mode: 'presentation' | 'notes') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext(mode);
  };

  const [isAlertVisible, setAlertVisible] = React.useState(false);

  const handleClearData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAlertVisible(true);
  };

  const confirmClearData = async () => {
    try {
      await AsyncStorage.multiRemove(['@setup_data', '@notes_data']);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAlertVisible(false);
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  };

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bgPulse.value }],
    opacity: 0.15,
  }));

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
      <Animated.View style={[StyleSheet.absoluteFill, styles.bgContainer, bgStyle]}>
        <View style={styles.blob} />
      </Animated.View>

      <View style={styles.headerArea}>
        <Pressable 
          style={({ pressed }) => [styles.themeToggle, pressed && styles.themeTogglePressed]}
          onPress={handleToggleTheme}
        >
          <Feather name={getThemeIcon()} size={20} color={theme.colors.textPrimary} />
        </Pressable>
      </View>

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
            <Pressable style={styles.clearButton} onPress={handleClearData}>
              <Text style={styles.clearButtonText}>Limpar Dados</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>

      <AlertDrawer 
        visible={isAlertVisible} 
        onClose={() => setAlertVisible(false)} 
        onConfirm={confirmClearData} 
      />
    </View>
  );
}

function AlertDrawer({ visible, onClose, onConfirm }: { visible: boolean; onClose: () => void; onConfirm: () => void }) {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const overlayOpacity = useSharedValue(0);
  const drawerY = useSharedValue(height);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 300 });
      drawerY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 300 });
      drawerY.value = withTiming(height, { duration: 300, easing: Easing.in(Easing.cubic) });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drawerY.value }],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 23, 42, 0.4)' }, overlayStyle]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.drawerContainer, drawerStyle]}>
        <Text style={styles.drawerTitle}>Apagar tudo?</Text>
        <Text style={styles.drawerSubtitle}>Isso removerá todas as apresentações salvas e anotações. Esta ação não pode ser desfeita.</Text>
        <View style={styles.drawerActions}>
          <Pressable style={({ pressed }) => [styles.drawerButtonConfirm, pressed && styles.buttonPressed]} onPress={onConfirm}>
            <Text style={styles.drawerButtonConfirmText}>Apagar Definitivamente</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.drawerButtonCancel, pressed && styles.buttonPressed]} onPress={onClose}>
            <Text style={styles.drawerButtonCancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  bgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  blob: {
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: theme.colors.textSecondary,
    position: 'absolute',
    top: -width * 0.5,
    right: -width * 0.5,
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
  drawerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  drawerTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  drawerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  drawerActions: {
    gap: 12,
  },
  drawerButtonCancel: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: theme.geometry.radius,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
  },
  drawerButtonCancelText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: theme.colors.textPrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  drawerButtonConfirm: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: theme.geometry.radius,
    backgroundColor: theme.colors.error,
  },
  drawerButtonConfirmText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: theme.colors.background,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
