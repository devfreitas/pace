import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Alert } from 'react-native';
import { theme } from '../theme/colors';
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
  const button1Anim = useSharedValue(0);
  const button2Anim = useSharedValue(0);
  const bgPulse = useSharedValue(1);

  useEffect(() => {
    const easeOut = Easing.bezier(0.22, 1, 0.36, 1);

    button1Anim.value = withTiming(1, { duration: 800, easing: easeOut });
    button2Anim.value = withDelay(150, withTiming(1, { duration: 800, easing: easeOut }));

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

  const handleClearData = () => {
    Alert.alert(
      'Apagar tudo?',
      'Isso removerá todas as apresentações salvas. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['@setup_data', '@notes_data']);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Limpeza Concluída', 'Todos os dados foram apagados com sucesso.');
            } catch (e) {
              console.error('Failed to clear data', e);
            }
          }
        }
      ]
    );
  };

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bgPulse.value }],
    opacity: 0.15,
  }));

  const button1Style = useAnimatedStyle(() => ({
    opacity: button1Anim.value,
    transform: [{ translateY: interpolate(button1Anim.value, [0, 1], [20, 0]) }]
  }));

  const button2Style = useAnimatedStyle(() => ({
    opacity: button2Anim.value,
    transform: [{ translateY: interpolate(button2Anim.value, [0, 1], [20, 0]) }]
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.bgContainer, bgStyle]}>
        <View style={styles.blob} />
      </Animated.View>

      <View style={styles.content}>
        <View style={{ gap: -4 }}>
          <StaggeredText 
            text="O palco é seu." 
            delay={200}
            textStyle={[styles.titleLine, { color: theme.colors.textPrimary }]} 
          />
          <StaggeredText 
            text="Nós cuidamos" 
            delay={600}
            textStyle={[styles.titleLine, { color: theme.colors.textPrimary }]} 
          />
          <StaggeredText 
            text="do ritmo." 
            delay={1000}
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
        </View>
      </View>

      <Pressable style={styles.clearButton} onPress={handleClearData}>
        <Text style={styles.clearButtonText}>Limpar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    paddingHorizontal: 32,
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
    position: 'absolute',
    bottom: 32,
    right: 24,
    padding: 12,
    zIndex: 1,
  },
  clearButtonText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 14,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    opacity: 0.4,
  },
});
