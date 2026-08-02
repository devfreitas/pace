import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, Theme } from '../theme/colors';
import { sanitizeTimeInput, formatOnBlur } from '../utils/time';

interface BlockEditorProps {
  block: any;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: string, value: any) => void;
}

export function BlockEditor({ block, onClose, onDelete, onUpdate }: BlockEditorProps) {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  if (!block) return null;

  return (
    <View style={styles.container}>
      <View style={styles.fullEditHeader}>
        <Pressable onPress={onClose} style={styles.backBtn}>
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
              onChangeText={t => onUpdate(block.id, 'title', t)}
            />
          </View>
          <View style={{ width: 100, marginLeft: 16 }}>
            <Text style={styles.label}>Tempo</Text>
            <TextInput
              style={[styles.fullEditInput, { textAlign: 'center' }]}
              value={block.duration}
              onChangeText={t => onUpdate(block.id, 'duration', sanitizeTimeInput(t))}
              onBlur={() => onUpdate(block.id, 'duration', formatOnBlur(block.duration))}
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
              onPress={() => onUpdate(block.id, 'color', colorHex)}
              style={[styles.colorSwatch, { backgroundColor: colorHex as string, shadowColor: colorHex as string }, block.color === colorHex && styles.colorSwatchSelected]}
            />
          ))}
        </View>
        <Text style={[styles.label, { marginTop: 32 }]}>Roteiro / Texto da Tela</Text>
        <TextInput
          style={styles.fullEditTextArea}
          value={block.text || ''}
          onChangeText={t => onUpdate(block.id, 'text', t)}
          placeholder="Digite o que deseja lembrar nesta parte..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
        />
      </ScrollView>
      <View style={styles.fullEditFooter}>
        <Pressable style={styles.deleteBtnLarge} onPress={() => onDelete(block.id)}>
          <Text style={styles.deleteBtnLargeText}>Excluir Parte</Text>
        </Pressable>
        <Pressable style={styles.saveBtnLarge} onPress={onClose}>
          <Text style={styles.saveBtnLargeText}>Salvar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
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
