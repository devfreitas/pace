import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback } from 'react';
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
import { ModernBackground } from './src/components/ModernBackground';
import { useTheme, Theme, theme, ThemeProvider } from './src/theme/colors';
import { Block } from './src/types';

type Screen = 'welcome' | 'setup' | 'palco' | 'notes_setup';

import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

export function App() {
  const theme = useTheme();

  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [presentationBlocks, setPresentationBlocks] = useState<Block[]>([]);
  
  // Track navigation history for the global back gesture
  const [history, setHistory] = useState<Screen[]>(['welcome']);

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
    setHistory(prev => {
      if (dir === 'forward') {
        return [...prev, screen];
      } else {
        const targetIndex = prev.lastIndexOf(screen);
        if (targetIndex !== -1) {
          return prev.slice(0, targetIndex + 1);
        }
        return prev.slice(0, -1);
      }
    });
  }, []);

  // Proper implementation of handleGlobalBack using latest history:
  const handleGlobalBackRef = React.useRef<() => void>(() => {});
  
  // We can just rely on the closure if we recreate the gesture, but using a Ref is safer for worklets
  React.useEffect(() => {
    handleGlobalBackRef.current = () => {
      if (history.length > 1) {
        const previousScreen = history[history.length - 2];
        navigateTo(previousScreen, 'back');
      }
    };
  }, [history, navigateTo]);

  const executeBack = useCallback(() => {
    handleGlobalBackRef.current();
  }, []);

  const edgePanGesture = Gesture.Pan()
    .activeOffsetX(20)
    .onStart((e) => {
      const startX = e.absoluteX - e.translationX;
      // If gesture started near the left edge and moved right
      if (startX < 40 && e.translationX > 0) {
        runOnJS(executeBack)();
      }
    });

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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <GestureDetector gesture={edgePanGesture}>
        <View style={{ flex: 1 }}>
          <StatusBar style={theme.isDark ? "light" : "dark"} animated={true} />
          <ModernBackground />
          <ScreenTransition
            activeScreen={currentScreen}
            direction={direction}
            screens={screens}
          />
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

export default function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

