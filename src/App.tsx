/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { ReflectFlow } from './components/ReflectFlow';
import { TheMirrorView } from './components/TheMirrorView';
import { InsightsView } from './components/InsightsView';
import { LifeAreasView } from './components/LifeAreasView';
import { FutureMeView } from './components/FutureMeView';
import { JournalSearchView } from './components/JournalSearchView';
import { SettingsView } from './components/SettingsView';
import { DailyProgressVideoView } from './components/DailyProgressVideoView';
import { ChatReflectionView } from './components/ChatReflectionView';
import { SwitchCompanyWarRoom } from './components/SwitchCompanyWarRoom';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  if (activeTab === 'chat') {
    return <ChatReflectionView />;
  }

  if (activeTab === 'switch') {
    return <SwitchCompanyWarRoom />;
  }

  return <HomeView />;
};


export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-neutral-800 selection:text-neutral-100">
        <Navigation />
        <div className="flex-1">
          <MainContent />
        </div>
        
        {/* Subtle, quiet footer */}
        <footer className="border-t border-neutral-900 py-6 px-4 text-center text-xs text-neutral-400 space-y-1">
          <div className="font-display font-bold tracking-wider text-neutral-400">
            RE:SET
          </div>
          <div>
            Know Yourself. Fix Yourself. Become Better.
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
