import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback, useRef } from 'react';
import { View } from 'react-native';
import { 
  useFonts, 
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold 
} from '@expo-google-fonts/cormorant-garamond';
import { Inter_300Light, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { PalcoScreen } from './src/screens/PalcoScreen';
import { NotesSetupScreen } from './src/screens/NotesSetupScreen';
import { ScreenTransition } from './src/components/ScreenTransition';
import { theme } from './src/theme/colors';
import { Block } from './src/types';

type Screen = 'welcome' | 'setup' | 'palco' | 'notes_setup';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [presentationBlocks, setPresentationBlocks] = useState<Block[]>([]);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
  });

  const navigateTo = useCallback((screen: Screen, dir: 'forward' | 'back') => {
    setDirection(dir);
    setCurrentScreen(screen);
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  const handleStartPresentation = (blocks: Block[]) => {
    setPresentationBlocks(blocks);
    navigateTo('palco', 'forward');
  };

  const screens: Record<Screen, React.ReactNode> = {
    welcome: (
      <WelcomeScreen onNext={(mode) => {
        if (mode === 'presentation') {
          navigateTo('setup', 'forward');
        } else {
          navigateTo('notes_setup', 'forward');
        }
      }} />
    ),
    setup: (
      <SetupScreen 
        onStart={handleStartPresentation} 
        onBack={() => navigateTo('welcome', 'back')} 
      />
    ),
    palco: (
      <PalcoScreen 
        blocks={presentationBlocks} 
        onEnd={() => navigateTo('setup', 'back')} 
      />
    ),
    notes_setup: (
      <NotesSetupScreen onBack={() => navigateTo('welcome', 'back')} />
    ),
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" animated={true} />
      <ScreenTransition
        activeScreen={currentScreen}
        direction={direction}
        screens={screens}
      />
    </GestureHandlerRootView>
  );
}

