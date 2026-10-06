import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MemoryItem, 
  ReflectionMode 
} from '../types';
import { 
  ShieldCheck, 
  Trash2, 
  Plus, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Brain, 
  User, 
  Flame, 
  Check, 
  Lock, 
  Info
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    profile, 
    updateProfile, 
    memories, 
    addMemory, 
    deleteMemory, 
    exportData, 
    startFresh, 
    resetToDemoData
  } = useApp();

  const [nameInput, setNameInput] = useState<string>(profile.name || '');
  const [showAddMemModal, setShowAddMemModal] = useState<boolean>(false);
  const [newMemCategory, setNewMemCategory] = useState<MemoryItem['category']>('goal');
  const [newMemContent, setNewMemContent] = useState<string>('');
  const [savedName, setSavedName] = useState<boolean>(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: nameInput });
    setSavedName(true);
    setTimeout(() => setSavedName(false), 2000);
  };

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemContent.trim()) return;
    addMemory(newMemCategory, newMemContent.trim());
    setNewMemContent('');
    setShowAddMemModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-800 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 font-display">
          Settings & Memory Controls
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          Manage your AI memory ledger, reflection tone preferences, and privacy controls.
        </p>
      </div>

      {/* 1. PROFILE & TONE MODE */}
      <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-6">
        <h2 className="text-base font-bold text-neutral-100 font-display">
          Personal Profile & Default Tone
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Your Name / Call Sign</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs sm:text-sm text-neutral-100 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
              >
                {savedName ? 'Saved ✓' : 'Save'}
              </button>
            </div>
          </div>
        </form>

        <div className="pt-4 border-t border-neutral-800/80 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-200 uppercase tracking-wide">
              The "Brutal Honesty" Mode
            </label>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
              Choose the personality of the AI Reflection Engine. Neither mode insults or shames you. Brutal mode eliminates sugarcoating and confronts avoidance directly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div
              onClick={() => updateProfile({ mode: 'normal' })}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                profile.mode === 'normal'
                  ? 'bg-neutral-800/80 border-neutral-500 text-neutral-100 shadow-sm'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <span>NORMAL MODE</span>
                {profile.mode === 'normal' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs leading-relaxed">
                Supportive, thoughtful, constructive. Focuses on consistency and steady growth without abrasive confrontation.
              </p>
            </div>

            <div
              onClick={() => updateProfile({ mode: 'brutal' })}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                profile.mode === 'brutal'
                  ? 'bg-amber-950/30 border-amber-500/80 text-amber-100 shadow-sm'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <span className="text-amber-400">BRUTAL MODE</span>
                {profile.mode === 'brutal' && <Flame className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-xs leading-relaxed">
                Direct, uncomfortable, respectful truth. Piercing observation of excuses and avoidance patterns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LONG-TERM MEMORY ("WHAT DOES THE AI REMEMBER ABOUT ME?") */}
      <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-neutral-100 font-display">
                “What does the AI remember about me?”
              </h2>
            </div>
            <p className="text-xs text-neutral-400 max-w-xl">
              Non-sensitive contextual memories extracted from past reflections to power pattern analysis and The Mirror.
            </p>
          </div>

          <button
            onClick={() => setShowAddMemModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-semibold rounded-lg border border-neutral-700 cursor-pointer transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory</span>
          </button>
        </div>

        {memories.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-neutral-950 border border-neutral-800 space-y-1 text-xs text-neutral-400">
            No memories stored. Memories are automatically synthesized as you complete daily reflections.
          </div>
        ) : (
          <div className="space-y-2.5">
            {memories.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start justify-between gap-3 hover:border-neutral-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                      {m.category}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Logged {m.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 leading-relaxed">
                    {m.content}
                  </p>
                </div>

                <button
                  onClick={() => deleteMemory(m.id)}
                  className="text-neutral-600 hover:text-rose-400 p-1 transition-colors cursor-pointer shrink-0"
                  title="Delete memory item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. PRIVACY & DATA OWNERSHIP */}
      <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-5">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base font-bold text-neutral-100 font-display">
            Privacy & Sovereign Data Management
          </h2>
        </div>

        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 leading-relaxed space-y-2">
          <p>
            <strong>Local-First Guarantee:</strong> Your journal entries, behavioral reflections, and personal memories reside directly in your browser's persistent storage. No telemetry or unauthorized external databases are attached.
          </p>
          <p className="text-neutral-400 text-[11px]">
            When you trigger AI analysis, your prompt is evaluated confidentially on the server without permanent logging.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportData}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold text-xs rounded-xl border border-neutral-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All Data (JSON)</span>
          </button>

          <button
            onClick={startFresh}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 hover:text-white font-semibold text-xs rounded-xl border border-neutral-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Fresh (Clear Demo)</span>
          </button>

          <button
            onClick={resetToDemoData}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 font-semibold text-xs rounded-xl border border-neutral-800 transition-colors cursor-pointer"
          >
            <span>Restore Demo Dataset</span>
          </button>
        </div>
      </div>

      {/* Add Memory Modal */}
      {showAddMemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-100 font-display">
              Add Personal Memory Item
            </h3>
            <form onSubmit={handleAddMemorySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Category</label>
                <select
                  value={newMemCategory}
                  onChange={(e) => setNewMemCategory(e.target.value as MemoryItem['category'])}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
                >
                  <option value="goal">Goal</option>
                  <option value="project">Project</option>
                  <option value="habit">Habit</option>
                  <option value="preference">Preference</option>
                  <option value="commitment">Commitment</option>
                  <option value="challenge">Challenge / Weakness</option>
                  <option value="achievement">Achievement</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Memory Content</label>
                <textarea
                  required
                  rows={3}
                  value={newMemContent}
                  onChange={(e) => setNewMemContent(e.target.value)}
                  placeholder="e.g. Tendency to check notifications between 2 PM and 4 PM when encountering complex tasks..."
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-lg cursor-pointer"
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
