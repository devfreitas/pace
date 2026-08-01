import { useMemo } from 'react';
import { parseTimeToSeconds } from '../utils/time';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';

export function usePresentationSetup() {
  const {
    blocks,
    targetTotalTime,
    generalTheme,
    setTargetTotalTime,
    setGeneralTheme,
    updateBlock,
    deleteBlock: storeDeleteBlock,
    addNewBlock: storeAddNewBlock,
  } = useStore();

  const targetTotalSeconds = useMemo(() => parseTimeToSeconds(targetTotalTime), [targetTotalTime]);

  const totalSeconds = useMemo(() => {
    return blocks.reduce((acc, b) => acc + parseTimeToSeconds(b.duration), 0);
  }, [blocks]);

  const isOvertime = totalSeconds > targetTotalSeconds;

  const deleteBlock = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    storeDeleteBlock(id);
  };

  const addNewBlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    return storeAddNewBlock();
  };

  return {
    blocks,
    targetTotalTime,
    setTargetTotalTime,
    generalTheme,
    setGeneralTheme,
    totalSeconds,
    isOvertime,
    updateBlock,
    deleteBlock,
    addNewBlock,
  };
}
