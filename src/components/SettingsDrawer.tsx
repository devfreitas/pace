import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useTheme, Theme } from '../theme/colors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

const { height } = Dimensions.get('window');

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
  onConfirmClearData: () => void;
  themeMode: string;
  onToggleTheme: () => void;
}

export function SettingsDrawer({
  visible,
  onClose,
  onConfirmClearData,
  themeMode,
  onToggleTheme,
}: SettingsDrawerProps) {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const overlayOpacity = useSharedValue(0);
  const drawerY = useSharedValue(height);

  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 300 });
      drawerY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 300 });
      drawerY.value = withTiming(height, { duration: 300, easing: Easing.in(Easing.cubic) });
      setConfirmingDelete(false); // Reset confirmation state when closing
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drawerY.value }],
  }));

  const handleClearDataPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConfirmingDelete(true);
  };

  const getThemeIcon = () => {
    if (themeMode === 'light') return 'sun';
    if (themeMode === 'dark') return 'moon';
    return 'aperture';
  };

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }, overlayStyle]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.drawerContainer, drawerStyle]}>
        <Text style={styles.drawerTitle}>Configurações</Text>

        <View style={styles.settingsList}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Aparência</Text>
              <Text style={styles.settingDescription}>Alterar o tema do aplicativo</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.themeToggle, pressed && styles.themeTogglePressed]}
              onPress={onToggleTheme}
            >
              <Feather name={getThemeIcon()} size={20} color={theme.colors.textPrimary} />
            </Pressable>
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0, flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Apagar Dados</Text>
                <Text style={styles.settingDescription}>Remover todas as apresentações</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.clearDataBtn, pressed && styles.buttonPressed, confirmingDelete && { opacity: 0.5 }]}
                onPress={handleClearDataPress}
                disabled={confirmingDelete}
              >
                <Feather name="trash-2" size={20} color={theme.colors.error} />
              </Pressable>
            </View>

            {confirmingDelete && (
              <View style={styles.confirmDeleteContainer}>
                <Text style={styles.confirmDeleteText}>Tem certeza? Essa ação não pode ser desfeita.</Text>
                <View style={styles.confirmDeleteActions}>
                  <Pressable
                    style={({ pressed }) => [styles.cancelDeleteBtn, pressed && styles.buttonPressed]}
                    onPress={() => setConfirmingDelete(false)}
                  >
                    <Text style={styles.cancelDeleteBtnText}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.confirmDeleteBtn, pressed && styles.buttonPressed]}
                    onPress={() => {
                      onConfirmClearData();
                      onClose();
                    }}
                  >
                    <Text style={styles.confirmDeleteBtnText}>Sim, apagar</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>

        <Pressable style={({ pressed }) => [styles.drawerButtonCancel, pressed && styles.buttonPressed, { marginTop: 32 }]} onPress={onClose}>
          <Text style={styles.drawerButtonCancelText}>Fechar</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  drawerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
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
  settingsList: {
    marginTop: 16,
    gap: 0,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  settingLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: theme.colors.textSecondary,
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
  clearDataBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.isDark ? 'rgba(255,59,48,0.1)' : 'rgba(255,59,48,0.05)',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  confirmDeleteContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: theme.isDark ? 'rgba(255,59,48,0.05)' : 'rgba(255,59,48,0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,59,48,0.15)' : 'rgba(255,59,48,0.1)',
  },
  confirmDeleteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: theme.colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmDeleteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: theme.geometry.radius,
    backgroundColor: theme.colors.error,
  },
  confirmDeleteBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: theme.colors.background,
  },
  cancelDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: theme.geometry.radius,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
  },
  cancelDeleteBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: theme.colors.textPrimary,
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
});
