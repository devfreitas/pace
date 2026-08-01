import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { useTheme, Theme, theme } from '../theme/colors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Block = { id: string; text: string; color?: string; isList?: boolean };

const hexToRgba = (hex: string, opacity: number) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export function NotesSetupScreen({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([{ id: Date.now().toString(), text: '' }]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showColors, setShowColors] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const inputsRef = useRef<{ [key: string]: TextInput | null }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@notes_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.title !== undefined) setTitle(parsed.title);
          if (parsed.blocks && Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
            setBlocks(parsed.blocks);
          }
        }
      } catch (e) {
        console.error('Failed to load notes data', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('@notes_data', JSON.stringify({ title, blocks }));
      } catch (e) {
        console.error('Failed to save notes data', e);
      }
    };
    saveData();
  }, [title, blocks, isLoaded]);

  useEffect(() => {
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setActiveId(null);
      setShowColors(false);
    });
    return () => hideSubscription.remove();
  }, []);

  const handleTextChange = (id: string, newText: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;

    if (block.isList) {
      let updatedText = newText;
      const previousText = block.text;

      if (newText.length > previousText.length && newText.endsWith('\n')) {
        if (previousText.endsWith('• ')) {
          updatedText = previousText.slice(0, -2);
          setBlocks(prev => prev.map(b => b.id === id ? { ...b, text: updatedText, isList: false } : b));
          return;
        } else {
          updatedText = newText + '• ';
        }
      }

      setBlocks(prev => prev.map(b => b.id === id ? { ...b, text: updatedText } : b));
      return;
    }

    setBlocks(prev => prev.map(b => b.id === id ? { ...b, text: newText } : b));
  };

  const handleKeyPress = (id: string, key: string, currentText: string) => {
    if (key === 'Backspace' && currentText === '') {
      setBlocks(prev => {
        const index = prev.findIndex(b => b.id === id);
        if (index > 0) {
          const prevBlock = prev[index - 1];
          setTimeout(() => {
            inputsRef.current[prevBlock.id]?.focus();
          }, 10);
          return prev.filter(b => b.id !== id);
        }
        return prev;
      });
    }
  };

  const updateBlockColor = (color: string | undefined) => {
    if (!activeId) return;
    Haptics.selectionAsync();
    setBlocks(prev => prev.map(b => b.id === activeId ? { ...b, color } : b));
  };

  const addNewBlockToEnd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newId = Date.now().toString();
    setBlocks(prev => [...prev, { id: newId, text: '' }]);
    setTimeout(() => {
      inputsRef.current[newId]?.focus();
    }, 50);
  };

  const moveBlockUp = () => {
    if (!activeId) return;
    const index = blocks.findIndex(b => b.id === activeId);
    if (index > 0) {
      Haptics.selectionAsync();
      const newBlocks = [...blocks];
      const temp = newBlocks[index - 1];
      newBlocks[index - 1] = newBlocks[index];
      newBlocks[index] = temp;
      setBlocks(newBlocks);
    }
  };

  const moveBlockDown = () => {
    if (!activeId) return;
    const index = blocks.findIndex(b => b.id === activeId);
    if (index < blocks.length - 1) {
      Haptics.selectionAsync();
      const newBlocks = [...blocks];
      const temp = newBlocks[index + 1];
      newBlocks[index + 1] = newBlocks[index];
      newBlocks[index] = temp;
      setBlocks(newBlocks);
    }
  };

  const deleteBlock = () => {
    if (!activeId || blocks.length <= 1) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setBlocks(prev => prev.filter(b => b.id !== activeId));
    setActiveId(null);
  };

  const addBlockBelow = () => {
    if (!activeId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const index = blocks.findIndex(b => b.id === activeId);
    const newId = Date.now().toString();
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, { id: newId, text: '' });
    setBlocks(newBlocks);
    setTimeout(() => {
      inputsRef.current[newId]?.focus();
    }, 50);
  };

  const toggleList = () => {
    if (!activeId) return;
    Haptics.selectionAsync();
    setBlocks(prev => prev.map(b => {
      if (b.id === activeId) {
        const isTurningOn = !b.isList;
        let newText = b.text;
        if (isTurningOn) {
          if (newText.trim() === '') {
            newText = '• ';
          } else if (!newText.startsWith('• ')) {
            newText = '• ' + newText;
          }
        } else {
          if (newText.startsWith('• ')) {
            newText = newText.slice(2);
          }
        }
        return { ...b, isList: isTurningOn, text: newText };
      }
      return b;
    }));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Pressable onPress={() => { Haptics.selectionAsync(); onBack(); }} style={styles.homeBtnAbsolute}>
        <Feather name="arrow-left" size={28} color={theme.colors.textSecondary} />
      </Pressable>
      
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(600).delay(100).springify()}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="TÍTULO"
            placeholderTextColor={theme.colors.textMuted}
            textAlign="center"
          />
        </Animated.View>
        
        <View style={styles.blocksContainer}>
          {blocks.map((block, index) => {
            const isActive = activeId === block.id;
            const hasColor = !!block.color;
            const bgColor = isActive && hasColor ? hexToRgba(block.color!, 0.08) : 'transparent';
            return (
              <Animated.View 
                key={block.id}
                entering={FadeInDown.duration(400).delay(150 + index * 100).springify()}
                exiting={FadeOutUp.duration(300)}
                layout={LinearTransition.springify()}
                style={[
                  styles.blockWrapper, 
                  isActive && !hasColor && styles.blockWrapperActiveNeutral,
                  { backgroundColor: bgColor }
                ]}
              >
                {(hasColor || isActive) && (
                  <View 
                    style={[
                      styles.activeLine, 
                      { backgroundColor: block.color || theme.colors.border }
                    ]} 
                  />
                )}
                <TextInput
                  ref={el => { inputsRef.current[block.id] = el; }}
                  style={[styles.blockInput, isActive && styles.blockInputActive]}
                  value={block.text}
                  onChangeText={(val) => handleTextChange(block.id, val)}
                  onFocus={() => { setActiveId(block.id); setShowColors(false); }}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(block.id, nativeEvent.key, block.text)}
                  placeholder={blocks.length === 1 ? "Comece a escrever suas anotações..." : ""}
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  scrollEnabled={false}
                />
              </Animated.View>
            );
          })}
        </View>

        <Animated.View entering={FadeInDown.duration(400).delay(300).springify()}>
          <Pressable style={styles.addBtn} onPress={addNewBlockToEnd}>
            <Text style={styles.addBtnText}>+ Adicionar Novo Parágrafo</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {activeId && (
        <View style={styles.toolbar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll} keyboardShouldPersistTaps="handled">
            {!showColors ? (
              <View style={styles.toolsGroup}>
                <Pressable style={styles.toolBtn} onPress={moveBlockUp}>
                  <Feather name="arrow-up" size={18} color={theme.colors.textPrimary} />
                </Pressable>
                <Pressable style={styles.toolBtn} onPress={moveBlockDown}>
                  <Feather name="arrow-down" size={18} color={theme.colors.textPrimary} />
                </Pressable>
                {blocks.length > 1 && (
                  <Pressable style={styles.toolBtn} onPress={deleteBlock}>
                    <Feather name="trash-2" size={18} color={theme.colors.error} />
                  </Pressable>
                )}
                <Pressable style={styles.toolBtn} onPress={addBlockBelow}>
                  <Feather name="corner-down-right" size={18} color={theme.colors.textPrimary} />
                </Pressable>
                <Pressable 
                  style={[styles.toolBtn, blocks.find(b => b.id === activeId)?.isList && styles.toolBtnActive]} 
                  onPress={toggleList}
                >
                  <Feather name="list" size={18} color={blocks.find(b => b.id === activeId)?.isList ? theme.colors.background : theme.colors.textPrimary} />
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
                  onPress={() => updateBlockColor(undefined)}
                >
                  <Feather name="slash" size={16} color={theme.colors.textSecondary} />
                </Pressable>
                
                {Object.entries(theme.emotions).map(([name, colorHex]) => {
                  const isActiveColor = blocks.find(b => b.id === activeId)?.color === colorHex;
                  return (
                    <Pressable
                      key={name}
                      onPress={() => updateBlockColor(colorHex)}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: colorHex, shadowColor: colorHex },
                        isActiveColor && styles.colorSwatchSelected
                      ]}
                    />
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  homeBtnAbsolute: { position: 'absolute', top: 60, left: 24, zIndex: 10 },
  scrollContent: { paddingTop: 115, paddingHorizontal: 24, paddingBottom: 140, flexGrow: 1 },
  titleInput: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 40, color: theme.colors.textPrimary, marginBottom: 48, letterSpacing: 2 },
  blocksContainer: { gap: 16 },
  blockWrapper: { flexDirection: 'row', borderRadius: theme.geometry.radius, overflow: 'hidden', paddingVertical: 8, paddingHorizontal: 12, marginHorizontal: -12 },
  blockWrapperActiveNeutral: { backgroundColor: 'rgba(0,0,0, 0.02)' },
  activeLine: { width: 3, borderRadius: theme.geometry.radius, marginRight: 12, marginTop: 4, marginBottom: 4 },
  blockInput: { flex: 1, fontFamily: 'CormorantGaramond_400Regular', fontSize: 24, color: theme.colors.textSecondary, textAlignVertical: 'top', lineHeight: 36 },
  blockInputActive: { color: theme.colors.textPrimary },
  toolbar: { paddingVertical: 12, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  toolbarScroll: { paddingHorizontal: 24, gap: 16, alignItems: 'center' },
  toolsGroup: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  toolBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  toolBtnActive: { backgroundColor: theme.colors.textPrimary, borderColor: theme.colors.textPrimary },
  toolbarDivider: { width: 1, height: 24, backgroundColor: theme.colors.border, marginHorizontal: 4 },
  colorSwatch: { width: 32, height: 32, borderRadius: 16, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  colorSwatchSelected: { borderWidth: 2, borderColor: theme.colors.textPrimary },
  colorSwatchClear: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  addBtn: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.textSecondary, borderRadius: theme.geometry.radius, marginTop: 24 },
  addBtnText: { fontFamily: 'CormorantGaramond_500Medium', fontSize: 18, color: theme.colors.textSecondary, letterSpacing: 1 }
});
