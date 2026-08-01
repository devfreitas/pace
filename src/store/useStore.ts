import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/colors';
import { Block } from '../types';

interface StoreState {
  blocks: Block[];
  targetTotalTime: string;
  generalTheme: string;
  setTargetTotalTime: (time: string) => void;
  setGeneralTheme: (theme: string) => void;
  updateBlock: (id: string, key: string, value: string) => void;
  deleteBlock: (id: string) => void;
  addNewBlock: () => string;
  setBlocks: (blocks: Block[]) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

const initialBlocks: Block[] = [
  { id: '1', title: 'Introdução', duration: '2:00', color: theme.emotions.intro, text: '' },
  { id: '2', title: 'Relato Pessoal', duration: '5:00', color: theme.emotions.story, text: '' },
  { id: '3', title: 'Conclusão', duration: '3:00', color: theme.emotions.climax, text: '' },
];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      blocks: initialBlocks,
      targetTotalTime: '10:00',
      generalTheme: '',
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setTargetTotalTime: (time) => set({ targetTotalTime: time }),
      setGeneralTheme: (theme) => set({ generalTheme: theme }),
      setBlocks: (blocks) => set({ blocks }),
      updateBlock: (id, key, value) => set((state) => ({
        blocks: state.blocks.map(b => (b.id === id ? { ...b, [key]: value } : b))
      })),
      deleteBlock: (id) => set((state) => ({
        blocks: state.blocks.filter(b => b.id !== id)
      })),
      addNewBlock: () => {
        const newId = Date.now().toString();
        set((state) => ({
          blocks: [
            ...state.blocks,
            { id: newId, title: 'Nova Parte', duration: '1:00', color: theme.emotions.neutral || '#888', text: '' },
          ]
        }));
        return newId;
      },
    }),
    {
      name: '@setup_data',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
