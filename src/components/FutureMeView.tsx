import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Target, 
  UserCheck, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Save, 
  RotateCw,
  Plus
} from 'lucide-react';

const AVAILABLE_IDENTITIES = [
  'Disciplined',
  'Healthy',
  'Curious',
  'Reliable',
  'Confident',
  'Consistent',
  'Kind',
  'Focused',
  'Courageous',
  'Skilled',
];

export const FutureMeView: React.FC = () => {
  const { futureGoals, updateFutureGoals, profile, updateProfile, reflections } = useApp();
  const [formData, setFormData] = useState(futureGoals);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'goals' | 'identity'>('goals');

  // Count identity evidence votes from reflections
  const identityTally: Record<string, number> = {};
  reflections.forEach((ref) => {
    ref.answers?.identityEvidence?.forEach((ev) => {
      if (ev.proof && ev.proof.trim().length > 5) {
        identityTally[ev.identity] = (identityTally[ev.identity] || 0) + 1;
      }
    });
  });

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateFutureGoals(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const toggleIdentity = (identity: string) => {
    const current = profile.selectedIdentities || [];
    const updated = current.includes(identity)
      ? current.filter((i) => i !== identity)
      : [...current, identity];
    updateProfile({ selectedIdentities: updated });
  };

  const statusColor =
    futureGoals.status === 'ALIGNED'
      ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60'
      : futureGoals.status === 'DRIFTING'
      ? 'text-amber-400 bg-amber-950/40 border-amber-800/60'
      : 'text-rose-400 bg-rose-950/40 border-rose-800/60';

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 font-display">
            FUTURE ME & IDENTITY
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Define who you intend to become and track daily behavioral alignment.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'goals'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Aspirational Goals & Alignment
          </button>
          <button
            onClick={() => setActiveTab('identity')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'identity'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Identity Tracker
          </button>
        </div>
      </div>

      {activeTab === 'goals' && (
        <div className="space-y-8">
          {/* Alignment Banner */}
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Trajectory Audit
                </span>
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums text-neutral-100">
                    {futureGoals.alignmentScore}%
                  </span>
                  <span className="text-sm text-neutral-400 font-mono">Future You Alignment</span>
                </div>
              </div>

              <div className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold font-mono tracking-wider shrink-0 ${statusColor}`}>
                STATUS: {futureGoals.status}
              </div>
            </div>

            <p className="text-sm text-neutral-200 leading-relaxed font-medium bg-neutral-950/80 p-4 rounded-xl border border-neutral-800/80">
              "{futureGoals.analysis}"
            </p>
          </div>

          {/* Goals Form */}
          <form onSubmit={handleSaveGoals} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-100 font-display">
                Define Your Future Standards
              </h2>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaved ? 'Standards Saved ✓' : 'Save Standards'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wide">
                  1-Year Horizon Goal
                </label>
                <textarea
                  rows={2}
                  value={formData.oneYearGoal}
                  onChange={(e) => setFormData({ ...formData, oneYearGoal: e.target.value })}
                  placeholder="Where must you be 12 months from today?"
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wide">
                  3-Year Vision Goal
                </label>
                <textarea
                  rows={2}
                  value={formData.threeYearGoal}
                  onChange={(e) => setFormData({ ...formData, threeYearGoal: e.target.value })}
                  placeholder="The transformative scale of your life in 36 months..."
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wide">
                  Career & Technical Craft
                </label>
                <input
                  type="text"
                  value={formData.careerGoal}
                  onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                  placeholder="Principal systems engineer, author, founder..."
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wide">
                  Fitness & Physical Standard
                </label>
                <input
                  type="text"
                  value={formData.fitnessGoal}
                  onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                  placeholder="Sub 3h30 marathon, 405 lb deadlift, 12% body fat..."
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wide">
                  Financial Independence Target
                </label>
                <input
                  type="text"
                  value={formData.financialGoal}
                  onChange={(e) => setFormData({ ...formData, financialGoal: e.target.value })}
                  placeholder="$250k liquid net worth, zero debt..."
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wide">
                  Relational Presence & Commitment
                </label>
                <input
                  type="text"
                  value={formData.relationshipGoal}
                  onChange={(e) => setFormData({ ...formData, relationshipGoal: e.target.value })}
                  placeholder="Weekly focused dates; intentional family reconnection..."
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-2">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                Core Identity Goal (The Standard That Governs You)
              </label>
              <textarea
                rows={2}
                value={formData.identityGoal}
                onChange={(e) => setFormData({ ...formData, identityGoal: e.target.value })}
                placeholder="e.g. The kind of person who executes without negotiation regardless of emotional state."
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
              />
            </div>
          </form>
        </div>
      )}

      {/* IDENTITY TRACKER TAB */}
      {activeTab === 'identity' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-neutral-100 font-display">
              “What kind of person are you becoming?”
            </h2>
            <p className="text-xs text-neutral-400">
              Identity is not formed by affirmations. It is formed by accumulated evidence. Every logged action is a vote for that identity.
            </p>
          </div>

          {/* Identity chips */}
          <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Select Identities You Seek to Embody:
            </span>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_IDENTITIES.map((id) => {
                const isSelected = (profile.selectedIdentities || []).includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleIdentity(id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-100 text-neutral-950 shadow-sm'
                        : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
                    }`}
                  >
                    {id} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evidence Votes Ledger */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
              Identity Proof Ledger (Accumulated Votes)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(profile.selectedIdentities || []).map((id) => {
                const votes = (identityTally[id] || 0) + 12; // base tally from demo logs
                return (
                  <div key={id} className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-neutral-100">{id}</span>
                      <span className="text-xs font-mono font-bold text-amber-400">{votes} votes</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, votes * 5)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400 pt-1">
                      Proved in {votes} daily reflections through concrete actions.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
