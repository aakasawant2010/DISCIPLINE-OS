import React from 'react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';
import { 
  Flame, 
  Compass, 
  RotateCcw, 
  Sparkles, 
  BarChart3, 
  UserCheck, 
  BookOpen, 
  Settings as SettingsIcon,
  ShieldAlert,
  ArrowRight,
  Video,
  MessageSquare
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, profile, setMode, startFresh } = useApp();

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Dashboard', icon: <Compass className="w-4 h-4" /> },
    { id: 'reflect', label: 'Reflect', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'chat', label: 'AI Coach', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'video', label: 'Daily Video', icon: <Video className="w-4 h-4" /> },
    { id: 'mirror', label: 'The Mirror', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights & Reviews', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'life', label: 'My Life', icon: <Flame className="w-4 h-4" /> },
    { id: 'future', label: 'Future Me', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'history', label: 'Journal', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      {/* Demo Data Notice Banner */}
      {profile.isDemoData && (
        <div className="bg-amber-950/40 border-b border-amber-900/40 px-4 py-1.5 text-xs text-amber-200/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>DEMO DATA ACTIVE</strong> — Showing 14 days of realistic logs to test all analytics, pattern recognition, and The Mirror.
            </span>
          </div>
          <button
            onClick={startFresh}
            className="text-xs font-semibold text-amber-300 hover:text-amber-100 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Start Fresh (Clear Demo)
          </button>
        </div>
      )}

      {/* Main Top Bar Contract: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand single text element */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-baseline gap-2.5 text-left group cursor-pointer"
          >
            <span className="font-display font-extrabold text-xl tracking-wider text-neutral-100 group-hover:text-amber-400 transition-colors">
              RE:SET
            </span>
            <span className="hidden sm:inline text-xs tracking-widest text-neutral-300 font-medium">
              KNOW YOURSELF · FIX YOURSELF
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60'
                    : 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-900/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Brutal vs Normal Mode Toggle */}
          <div className="flex items-center p-0.5 bg-neutral-900 border border-neutral-800 rounded-lg">
            <button
              onClick={() => setMode('normal')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                profile.mode === 'normal'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setMode('brutal')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                profile.mode === 'brutal'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Brutal
            </button>
          </div>

          {/* Quick Action Button */}
          {activeTab !== 'reflect' && (
            <button
              onClick={() => setActiveTab('reflect')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-100 text-neutral-950 hover:bg-neutral-200 rounded-lg transition-colors shadow-sm whitespace-nowrap cursor-pointer"
            >
              <span>Reflect</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Horizontal Navigation Scroll */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-neutral-900 gap-1.5 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-neutral-800 text-neutral-100 border border-neutral-700/60'
                  : 'text-neutral-300 hover:text-neutral-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
