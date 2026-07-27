import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Easing, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { useTheme, Theme, theme } from '../theme/colors';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Utils
const parseTimeToSeconds = (timeStr: string) => {
  if (!timeStr) return 0;

  if (!timeStr.includes(':')) {
    const num = parseInt(timeStr, 10);
    if (isNaN(num)) return 0;
    const str = num.toString();
    if (str.length <= 2) {
      return parseInt(str, 10);
    } else {
      const secStr = str.slice(-2);
      const minStr = str.slice(0, -2);
      const m = parseInt(minStr, 10);
      const s = parseInt(secStr, 10);
      return (isNaN(m) ? 0 : m * 60) + (isNaN(s) ? 0 : s);
    }
  }

  const parts = timeStr.split(':');
  const min = parseInt(parts[0] || '0', 10);
  const sec = parts.length > 1 ? parseInt(parts[1] || '0', 10) : 0;
  return (isNaN(min) ? 0 : min * 60) + (isNaN(sec) ? 0 : sec);
};

const formatSecondsToTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const sanitizeTimeInput = (text: string) => {
  let cleaned = text.replace(/[^\d:]/g, '');
  const parts = cleaned.split(':');
  if (parts.length > 2) {
    cleaned = parts[0] + ':' + parts.slice(1).join('').slice(0, 2);
  } else if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + ':' + parts[1].slice(0, 2);
  }
  return cleaned;
};

const formatOnBlur = (text: string) => {
  const secs = parseTimeToSeconds(text);
  return formatSecondsToTime(secs);
};

const initialBlocks = [
  { id: '1', title: 'Introdução', duration: '2:00', color: theme.emotions.intro, text: '' },
  { id: '2', title: 'Relato Pessoal', duration: '5:00', color: theme.emotions.story, text: '' },
  { id: '3', title: 'Conclusão', duration: '3:00', color: theme.emotions.climax, text: '' },
];

export function SetupScreen({ onStart, onBack }: { onStart: (blocks: any[]) => void; onBack: () => void }) {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetTotalTime, setTargetTotalTime] = useState('10:00');
  const [generalTheme, setGeneralTheme] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@setup_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.blocks && Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
            setBlocks(parsed.blocks);
          }
          if (parsed.targetTotalTime) setTargetTotalTime(parsed.targetTotalTime);
          if (parsed.generalTheme !== undefined) setGeneralTheme(parsed.generalTheme);
        }
      } catch (e) {
        console.error('Failed to load setup data', e);
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
        await AsyncStorage.setItem('@setup_data', JSON.stringify({ blocks, targetTotalTime, generalTheme }));
      } catch (e) {
        console.error('Failed to save setup data', e);
      }
    };
    saveData();
  }, [blocks, targetTotalTime, generalTheme, isLoaded]);

  const targetTotalSeconds = useMemo(() => parseTimeToSeconds(targetTotalTime), [targetTotalTime]);

  const totalSeconds = useMemo(() => {
    return blocks.reduce((acc, b) => acc + parseTimeToSeconds(b.duration), 0);
  }, [blocks]);

  const isOvertime = totalSeconds > targetTotalSeconds;

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onStart(blocks);
  };

  const updateBlock = (id: string, key: string, value: string) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, [key]: value } : b)));
  };

  const deleteBlock = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setBlocks(prev => prev.filter(b => b.id !== id));
    setEditingId(null);
  };

  const addNewBlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newId = Date.now().toString();
    setBlocks(prev => [
      ...prev,
      { id: newId, title: 'Nova Parte', duration: '1:00', color: theme.emotions.neutral || '#888', text: '' },
    ]);
    setEditingId(newId);
  };

  if (editingId) {
    const block = blocks.find(b => b.id === editingId);
    if (!block) {
      setEditingId(null);
      return null;
    }
    return (
      <View style={styles.container}>
        <View style={styles.fullEditHeader}>
          <Pressable onPress={() => setEditingId(null)} style={styles.backBtn}>
            <Feather name="arrow-left" size={28} color={theme.colors.textSecondary} />
          </Pressable>
          <Text style={styles.fullEditTitle}>Editar Parte</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={styles.fullEditScroll} keyboardShouldPersistTaps="handled">
          {/* Title & Time */}
          <View style={styles.fullEditRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.fullEditInput}
                value={block.title}
                onChangeText={t => updateBlock(block.id, 'title', t)}
              />
            </View>
            <View style={{ width: 100, marginLeft: 16 }}>
              <Text style={styles.label}>Tempo</Text>
              <TextInput
                style={[styles.fullEditInput, { textAlign: 'center' }]}
                value={block.duration}
                onChangeText={t => updateBlock(block.id, 'duration', sanitizeTimeInput(t))}
                onBlur={() => updateBlock(block.id, 'duration', formatOnBlur(block.duration))}
                keyboardType="numbers-and-punctuation"
                selectTextOnFocus
              />
            </View>
          </View>
          {/* Color Palette */}
          <Text style={[styles.label, { marginTop: 24 }]}>Cor Destaque</Text>
          <View style={styles.colorPaletteRow}>
            {Object.entries(theme.emotions).map(([name, colorHex]) => (
              <Pressable
                key={name}
                onPress={() => updateBlock(block.id, 'color', colorHex)}
                style={[styles.colorSwatch, { backgroundColor: colorHex, shadowColor: colorHex }, block.color === colorHex && styles.colorSwatchSelected]}
              />
            ))}
          </View>
          {/* Text */}
          <Text style={[styles.label, { marginTop: 32 }]}>Roteiro / Texto da Tela</Text>
          <TextInput
            style={styles.fullEditTextArea}
            value={block.text || ''}
            onChangeText={t => updateBlock(block.id, 'text', t)}
            placeholder="Digite o que deseja lembrar nesta parte..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />
        </ScrollView>
        <View style={styles.fullEditFooter}>
          <Pressable style={styles.deleteBtnLarge} onPress={() => deleteBlock(block.id)}>
            <Text style={styles.deleteBtnLargeText}>Excluir Parte</Text>
          </Pressable>
          <Pressable style={styles.saveBtnLarge} onPress={() => setEditingId(null)}>
            <Text style={styles.saveBtnLargeText}>Salvar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.homeBtnAbsolute}>
        <Feather name="arrow-left" size={28} color={theme.colors.textSecondary} />
      </Pressable>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Animated.View style={styles.header} entering={FadeInDown.duration(600).delay(100).springify()}>
          <TextInput
            style={styles.generalThemeInput}
            value={generalTheme}
            onChangeText={setGeneralTheme}
            placeholder="TEMA GERAL"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.headerLabel}>Tempo Total</Text>
          <View style={styles.timeRow}>
            <TextInput
              style={styles.timeInputTotal}
              value={targetTotalTime}
              onChangeText={t => setTargetTotalTime(sanitizeTimeInput(t))}
              onBlur={() => setTargetTotalTime(formatOnBlur(targetTotalTime))}
              keyboardType="numbers-and-punctuation"
              selectTextOnFocus
            />
            <Text style={[styles.timeSum, isOvertime && styles.timeSumOvertime]}>
              ({formatSecondsToTime(totalSeconds)})
            </Text>
          </View>
        </Animated.View>
        {/* List */}
        <View style={styles.listContainer}>
          {blocks.map((block, index) => (
            <Animated.View 
              key={block.id} 
              entering={FadeInDown.duration(400).delay(200 + index * 100).springify()} 
              exiting={FadeOutUp.duration(300)} 
              layout={LinearTransition.springify()}
            >
              <Pressable style={styles.blockCard} onPress={() => { Haptics.selectionAsync(); setEditingId(block.id); }}>
                <View style={styles.blockRowSummary}>
                  <View style={[styles.dot, { backgroundColor: block.color, shadowColor: block.color }]} />
                  <Text style={styles.blockTitleSummary} numberOfLines={1}>{block.title}</Text>
                  <Text style={styles.blockTimeSummary}>{block.duration}</Text>
                  <Pressable style={styles.summaryDeleteBtn} onPress={() => deleteBlock(block.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.summaryDeleteBtnText}>✕</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Animated.View>
          ))}
          <Animated.View entering={FadeInDown.duration(400).delay(200 + blocks.length * 100).springify()}>
            <Pressable style={styles.addBtn} onPress={addNewBlock}>
              <Text style={styles.addBtnText}>+ Adicionar Parte</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
      {/* Bottom Action */}
      <View style={styles.footer}>
        <Pressable style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]} onPress={handleStart}>
          <Text style={styles.startButtonText}>Iniciar Apresentação</Text>
        </Pressable>
      </View>
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  homeBtnAbsolute: { position: 'absolute', top: 60, left: 24, zIndex: 10 },
  scrollContent: { paddingTop: 115, paddingHorizontal: 24, paddingBottom: 140 },
  header: { alignItems: 'center', marginBottom: 40 },
  generalThemeInput: { fontFamily: 'CormorantGaramond_500Medium', fontSize: 16, color: theme.colors.textSecondary, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 32, textAlign: 'center', minWidth: 200 },
  headerLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: theme.colors.textSecondary, marginBottom: 4, letterSpacing: 1 },
  timeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  timeInputTotal: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 48, color: theme.colors.textPrimary, borderBottomWidth: 1, borderBottomColor: theme.colors.border, minWidth: 120, textAlign: 'center', paddingVertical: 4 },
  timeSum: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 20, color: theme.colors.textSecondary },
  timeSumOvertime: { color: theme.colors.error },
  listContainer: { gap: 16 },
  blockCard: { backgroundColor: theme.colors.surface, borderRadius: theme.geometry.radius, padding: 16, borderWidth: 1, borderColor: theme.colors.border },
  blockRowSummary: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, elevation: 2, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 4 },
  blockTitleSummary: { flex: 1, fontFamily: 'CormorantGaramond_500Medium', fontSize: 22, color: theme.colors.textPrimary, letterSpacing: 0.5 },
  blockTimeSummary: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 20, color: theme.colors.textSecondary },
  summaryDeleteBtn: { padding: 4 },
  summaryDeleteBtnText: { fontFamily: 'CormorantGaramond_500Medium', fontSize: 18, color: theme.colors.textSecondary, opacity: 0.6 },
  addBtn: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.textSecondary, borderRadius: theme.geometry.radius, marginTop: 16 },
  addBtnText: { fontFamily: 'CormorantGaramond_500Medium', fontSize: 18, color: theme.colors.textSecondary, letterSpacing: 1 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 40, backgroundColor: theme.colors.background, borderTopWidth: 1, borderTopColor: theme.colors.border, alignItems: 'center' },
  startButton: { backgroundColor: theme.colors.textPrimary, paddingVertical: 20, width: '100%', alignItems: 'center', borderRadius: theme.geometry.radius },
  startButtonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  startButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, color: theme.colors.background, letterSpacing: 2, textTransform: 'uppercase' },
  // Full edit styles
  fullEditHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 80 },
  fullEditTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, color: theme.colors.textPrimary, letterSpacing: 1, textTransform: 'uppercase' },
  fullEditScroll: { padding: 24, paddingBottom: 120 },
  fullEditRow: { flexDirection: 'row', alignItems: 'flex-end' },
  label: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  fullEditInput: { fontFamily: 'CormorantGaramond_500Medium', fontSize: 28, color: theme.colors.textPrimary, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingVertical: 8 },
  fullEditTextArea: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 22, color: theme.colors.textPrimary, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.geometry.radius, padding: 20, minHeight: 200, textAlignVertical: 'top' },
  colorPaletteRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  colorSwatchSelected: { borderWidth: 2, borderColor: theme.colors.textPrimary },
  fullEditFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 24, paddingBottom: 40, backgroundColor: theme.colors.background, gap: 16 },
  deleteBtnLarge: { flex: 1, paddingVertical: 18, alignItems: 'center', borderRadius: theme.geometry.radius, borderWidth: 1, borderColor: theme.colors.border },
  deleteBtnLargeText: { fontFamily: 'CormorantGaramond_500Medium', fontSize: 18, color: theme.colors.error, opacity: 0.7 },
  saveBtnLarge: { flex: 2, backgroundColor: theme.colors.textPrimary, paddingVertical: 18, alignItems: 'center', borderRadius: theme.geometry.radius },
  saveBtnLargeText: { fontFamily: 'CormorantGaramond_500Medium', fontSize: 18, color: theme.colors.background, letterSpacing: 1 },
});
