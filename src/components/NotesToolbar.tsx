import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, Theme } from '../theme/colors';
import * as Haptics from 'expo-haptics';

interface NotesToolbarProps {
  activeId: string | null;
  blocksLength: number;
  isList: boolean;
  activeColor: string | undefined;
  showColors: boolean;
  setShowColors: (show: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onAddBelow: () => void;
  onToggleList: () => void;
  onUpdateColor: (color: string | undefined) => void;
}

export function NotesToolbar({
  activeId,
  blocksLength,
  isList,
  activeColor,
  showColors,
  setShowColors,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAddBelow,
  onToggleList,
  onUpdateColor,
}: NotesToolbarProps) {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  if (!activeId) return null;

  return (
    <View style={styles.toolbar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll} keyboardShouldPersistTaps="handled">
        {!showColors ? (
          <View style={styles.toolsGroup}>
            <Pressable style={styles.toolBtn} onPress={onMoveUp}>
              <Feather name="arrow-up" size={18} color={theme.colors.textPrimary} />
            </Pressable>
            <Pressable style={styles.toolBtn} onPress={onMoveDown}>
              <Feather name="arrow-down" size={18} color={theme.colors.textPrimary} />
            </Pressable>
            {blocksLength > 1 && (
              <Pressable style={styles.toolBtn} onPress={onDelete}>
                <Feather name="trash-2" size={18} color={theme.colors.error} />
              </Pressable>
            )}
            <Pressable style={styles.toolBtn} onPress={onAddBelow}>
              <Feather name="corner-down-right" size={18} color={theme.colors.textPrimary} />
            </Pressable>
            <Pressable 
              style={[styles.toolBtn, isList && styles.toolBtnActive]} 
              onPress={onToggleList}
            >
              <Feather name="list" size={18} color={isList ? theme.colors.background : theme.colors.textPrimary} />
            </Pressable>

            <View style={styles.toolbarDivider} />
            
            <Pressable style={styles.toolBtn} onPress={() => { Haptics.selectionAsync(); setShowColors(true); }}>
              <Feather name="aperture" size={18} color={theme.colors.textPrimary} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.toolsGroup}>
            <Pressable style={styles.toolBtn} onPress={() => { Haptics.selectionAsync(); setShowColors(false); }}>
              <Feather name="chevron-left" size={18} color={theme.colors.textPrimary} />
            </Pressable>
            <View style={styles.toolbarDivider} />
            <Pressable 
              style={styles.colorSwatchClear}
              onPress={() => onUpdateColor(undefined)}
            >
              <Feather name="slash" size={16} color={theme.colors.textSecondary} />
            </Pressable>
            
            {Object.entries(theme.emotions).map(([name, colorHex]) => {
              const isActiveColor = activeColor === colorHex;
              return (
                <Pressable
                  key={name}
                  onPress={() => onUpdateColor(colorHex)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: colorHex as string, shadowColor: colorHex as string },
                    isActiveColor && styles.colorSwatchSelected
                  ]}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  toolbar: { paddingVertical: 12, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  toolbarScroll: { paddingHorizontal: 24, gap: 16, alignItems: 'center' },
  toolsGroup: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  toolBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  toolBtnActive: { backgroundColor: theme.colors.textPrimary, borderColor: theme.colors.textPrimary },
  toolbarDivider: { width: 1, height: 24, backgroundColor: theme.colors.border, marginHorizontal: 4 },
  colorSwatch: { width: 32, height: 32, borderRadius: 16, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  colorSwatchSelected: { borderWidth: 2, borderColor: theme.colors.textPrimary },
  colorSwatchClear: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
});
