import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';
import { 
  Activity, 
  Sparkles, 
  Laptop, 
  ShieldAlert, 
  Clock,
  Terminal,
  Target
} from 'lucide-react';
import { InstallPcModal } from './InstallPcModal';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, profile, startFresh } = useApp();
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live ticking dynamic clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Primary Navigation Tabs
  const navTabs: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Daily Protocol', icon: <Activity className="w-4 h-4 text-emerald-400" /> },
    { id: 'switch', label: 'Switch Company', icon: <Target className="w-4 h-4 text-amber-400" /> },
    { id: 'chat', label: 'The Mirror & AI', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
        {/* Demo Data Notice Banner */}
        {profile.isDemoData && (
          <div className="bg-amber-950/40 border-b border-amber-900/40 px-4 py-1.5 text-xs text-amber-200/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>DEMO DATA ACTIVE</strong> — 14 days of realistic logs to test all metrics, pattern recognition, and failure auditing.
              </span>
            </div>
            <button
              onClick={startFresh}
              className="text-xs font-semibold text-amber-300 hover:text-amber-100 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Start Fresh
            </button>
          </div>
        )}

        {/* Main Header Container: 3 Clean Zones */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand & Dynamic Moving Pulse */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-baseline gap-2.5 text-left group cursor-pointer"
            >
              <span className="font-display font-extrabold text-xl tracking-wider text-neutral-100 group-hover:text-amber-400 transition-colors">
                RE:SET
              </span>
              <span className="hidden sm:inline text-xs tracking-widest text-neutral-400 font-mono">
                HONEST PROTOCOL
              </span>
            </button>

            {/* Dynamic moving status indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono text-neutral-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="text-neutral-300 tabular-nums">{currentTime}</span>
            </div>
          </div>

          {/* Zone 2: Navigation Tabs (Minimalist Segmented Control) */}
          <nav className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto max-w-full">
            {navTabs.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/80'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: PC Install Action (Clean, No Mode Toggles) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstallModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-neutral-100 bg-neutral-900 hover:bg-neutral-800/90 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
              title="Install this application on your personal PC"
            >
              <Laptop className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Install on PC</span>
            </button>
          </div>
        </div>
      </header>

      {/* PC Setup Guide Modal */}
      <InstallPcModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </>
  );
};
