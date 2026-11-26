import React from 'react';
import { useGameStore } from './stores/game-store.js';
import { LoginScreen } from './screens/LoginScreen.js';
import { CommandCenterScreen } from './screens/CommandCenterScreen.js';
import { MissionsScreen } from './screens/MissionsScreen.js';
import { BaseScreen } from './screens/BaseScreen.js';
import { FleetScreen } from './screens/FleetScreen.js';

export function App() {
  const { currentScreen } = useGameStore();

  switch (currentScreen) {
    case 'login':
      return <LoginScreen />;
    case 'command_center':
      return <CommandCenterScreen />;
    case 'missions':
      return <MissionsScreen />;
    case 'base':
      return <BaseScreen />;
    case 'fleet':
      return <FleetScreen />;
    default:
      return <CommandCenterScreen />;
  }
}

