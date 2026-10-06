import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  Calendar, 
  RotateCw, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  Target,
  BarChart2
} from 'lucide-react';
import { DetectedPattern } from '../types';

export const InsightsView: React.FC = () => {
  const { 
    patterns, 
    addPattern, 
    deletePattern, 
    weeklyReview, 
    setWeeklyReview, 
    monthlyAudit, 
    setMonthlyAudit, 
    reflections,
    profile 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'patterns' | 'weekly' | 'monthly'>('patterns');
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState<boolean>(false);
  const [isGeneratingMonthly, setIsGeneratingMonthly] = useState<boolean>(false);
  const [showAddPatternModal, setShowAddPatternModal] = useState<boolean>(false);

  // New pattern form state
  const [newPattern, setNewPattern] = useState({
    pattern: '',
    evidence: '',
    frequency: 'Recurring',
    impact: 'Negative',
    suggestedIntervention: '',
  });

  const handleAddPatternSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPattern.pattern || !newPattern.evidence) return;
    const patternObj: DetectedPattern = {
      id: `pat-${Date.now()}`,
      pattern: newPattern.pattern,
      evidence: newPattern.evidence,
      frequency: newPattern.frequency,
      impact: newPattern.impact,
      suggestedIntervention: newPattern.suggestedIntervention,
      identifiedAt: new Date().toISOString().split('T')[0],
    };
    addPattern(patternObj);
    setShowAddPatternModal(false);
    setNewPattern({ pattern: '', evidence: '', frequency: 'Recurring', impact: 'Negative', suggestedIntervention: '' });
  };

  const handleGenerateWeekly = async () => {
    setIsGeneratingWeekly(true);
    try {
      const response = await fetch('/api/review/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflections, weekLabel: 'Week of ' + new Date().toLocaleDateString() }),
      });
      if (response.ok) {
        const review = await response.json();
        setWeeklyReview(review);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingWeekly(false);
    }
  };

  const handleGenerateMonthly = async () => {
    setIsGeneratingMonthly(true);
    try {
      const response = await fetch('/api/review/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflections, monthLabel: '30-Day Cycle Audit' }),
      });
      if (response.ok) {
        const audit = await response.json();
        setMonthlyAudit(audit);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingMonthly(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Sub navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 font-display">
            Insights & Audits
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Synthesized behavioral intelligence across days, weeks, and months.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          <button
            onClick={() => setActiveSubTab('patterns')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'patterns'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Patterns I've Noticed
          </button>
          <button
            onClick={() => setActiveSubTab('weekly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'weekly'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Weekly Review
          </button>
          <button
            onClick={() => setActiveSubTab('monthly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'monthly'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Monthly Personal Audit
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. PATTERNS I'VE NOTICED */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'patterns' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-neutral-100 font-display">
                PATTERNS I'VE NOTICED
              </h2>
              <p className="text-xs text-neutral-400">
                Recurring behaviors detected from cross-referencing your journal entries.
              </p>
            </div>
            <button
              onClick={() => setShowAddPatternModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg border border-neutral-700 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Observed Pattern</span>
            </button>
          </div>

          {patterns.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-neutral-900/30 border border-neutral-800 space-y-2">
              <p className="text-sm text-neutral-300">No patterns registered yet.</p>
              <p className="text-xs text-neutral-500">
                Log multiple daily reflections so the engine can verify behavioral trends.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-base font-bold text-neutral-100">
                        {item.pattern}
                      </div>
                      <button
                        onClick={() => deletePattern(item.id)}
                        className="text-neutral-600 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                        title="Delete pattern"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/80 p-3 rounded-xl border border-neutral-800/80">
                      <span className="font-semibold text-neutral-200">Evidence:</span> {item.evidence}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
                      <span>Freq: <strong className="text-neutral-300">{item.frequency}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Impact: <strong className="text-amber-400">{item.impact}</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 text-xs text-neutral-300">
                    <span className="font-bold text-emerald-400">Intervention:</span> {item.suggestedIntervention}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. WEEKLY REVIEW */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-neutral-100 font-display">
                YOUR WEEK IN REVIEW
              </h2>
              <p className="text-xs text-neutral-400">
                {weeklyReview?.dateRange || 'Weekly Synthesis'}
              </p>
            </div>
            <button
              onClick={handleGenerateWeekly}
              disabled={isGeneratingWeekly}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-white text-neutral-950 rounded-lg cursor-pointer transition-all disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isGeneratingWeekly ? 'animate-spin' : ''}`} />
              <span>{isGeneratingWeekly ? 'Analyzing Week...' : 'Regenerate Weekly Review'}</span>
            </button>
          </div>

          {weeklyReview ? (
            <div className="space-y-6">
              {/* Core metrics strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                  <div className="text-xs text-neutral-400 font-mono uppercase">Average Score</div>
                  <div className="text-3xl font-extrabold font-mono text-neutral-100 tabular-nums">
                    {weeklyReview.averageScore} <span className="text-sm font-normal text-neutral-500">/ 100</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                  <div className="text-xs text-emerald-400 font-mono uppercase">Best Day</div>
                  <div className="text-xs text-neutral-200 leading-snug font-medium">
                    {weeklyReview.bestDay}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                  <div className="text-xs text-rose-400 font-mono uppercase">Worst Day</div>
                  <div className="text-xs text-neutral-200 leading-snug font-medium">
                    {weeklyReview.worstDay}
                  </div>
                </div>
              </div>

              {/* Wins, mistakes, distractions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    Biggest Win of the Week
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                    {weeklyReview.biggestWin}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <div className="text-xs font-bold text-rose-400 uppercase tracking-wide">
                    Biggest Mistake
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                    {weeklyReview.biggestMistake}
                  </p>
                </div>
              </div>

              {/* Trends table */}
              <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                  Multi-Dimensional Weekly Trends
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <TrendItem label="Emotional" text={weeklyReview.trends.emotional} />
                  <TrendItem label="Fitness" text={weeklyReview.trends.fitness} />
                  <TrendItem label="Active Learning" text={weeklyReview.trends.learning} />
                  <TrendItem label="Sleep" text={weeklyReview.trends.sleep} />
                  <TrendItem label="Discipline" text={weeklyReview.trends.discipline} />
                  <TrendItem label="Top Distraction" text={weeklyReview.mostCommonDistraction} />
                </div>
              </div>

              {/* KEEP, STOP, START */}
              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
                  What Should You Do Differently Next Week?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Keep */}
                  <div className="space-y-2 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">KEEP</span>
                    <ul className="space-y-1.5 text-xs text-neutral-300">
                      {weeklyReview.keep.map((k, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 shrink-0">✓</span>
                          <span>{k}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Stop */}
                  <div className="space-y-2 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">STOP</span>
                    <ul className="space-y-1.5 text-xs text-neutral-300">
                      {weeklyReview.stop.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-400 shrink-0">✕</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Start */}
                  <div className="space-y-2 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">START</span>
                    <ul className="space-y-1.5 text-xs text-neutral-300">
                      {weeklyReview.start.map((st, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 shrink-0">→</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Next week's one big goal */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                    NEXT WEEK'S ONE BIG GOAL
                  </div>
                  <div className="text-sm font-semibold text-neutral-100">
                    {weeklyReview.oneBigGoal}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-2">
              <p className="text-sm text-neutral-300">No weekly review generated yet.</p>
              <button
                onClick={handleGenerateWeekly}
                className="px-4 py-2 bg-neutral-100 text-neutral-950 font-bold text-xs rounded-lg cursor-pointer"
              >
                Synthesize Week
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MONTHLY PERSONAL AUDIT */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-100 font-display">
                “30 DAYS. WHO DID YOU BECOME?”
              </h2>
              <p className="text-xs text-neutral-400">
                {monthlyAudit?.monthLabel || '30-Day Longitudinal Audit'}
              </p>
            </div>
            <button
              onClick={handleGenerateMonthly}
              disabled={isGeneratingMonthly}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-white text-neutral-950 rounded-lg cursor-pointer transition-all disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isGeneratingMonthly ? 'animate-spin' : ''}`} />
              <span>{isGeneratingMonthly ? 'Auditing 30 Days...' : 'Run 30-Day Audit'}</span>
            </button>
          </div>

          {monthlyAudit ? (
            <div className="space-y-6">
              {/* Comparative metric changes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricChangeCard label="Discipline" delta={monthlyAudit.comparison.disciplineChange} />
                <MetricChangeCard label="Fitness" delta={monthlyAudit.comparison.fitnessChange} />
                <MetricChangeCard label="Focus Throughput" delta={monthlyAudit.comparison.focusChange} />
                <MetricChangeCard label="Overall Growth" delta={monthlyAudit.comparison.overallChange} />
              </div>

              {/* 6 Audit Dimensions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AuditCard title="WHAT IMPROVED" items={monthlyAudit.whatImproved} color="text-emerald-400" />
                <AuditCard title="WHAT DECLINED" items={monthlyAudit.whatDeclined} color="text-rose-400" />
                <AuditCard title="WHAT REPEATED" items={monthlyAudit.whatRepeated} color="text-amber-400" />
                <AuditCard title="WHAT YOU'RE AVOIDING" items={monthlyAudit.whatYouAreAvoiding} color="text-purple-400" />
                <AuditCard title="WHAT TO DOUBLE DOWN ON" items={monthlyAudit.doubleDownOn} color="text-blue-400" />
                <AuditCard title="WHAT TO LET GO OF" items={monthlyAudit.letGoOf} color="text-neutral-400" />
              </div>

              {/* The 12-Month Projection Question */}
              <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                    LONGITUDINAL TRAJECTORY PROJECTION
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-100 font-display">
                    “If you continue exactly like this for the next 12 months, where will you end up?”
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 text-sm text-neutral-200 leading-relaxed font-medium">
                  "{monthlyAudit.twelveMonthProjection}"
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-2">
              <p className="text-sm text-neutral-300">No monthly audit generated yet.</p>
              <button
                onClick={handleGenerateMonthly}
                className="px-4 py-2 bg-neutral-100 text-neutral-950 font-bold text-xs rounded-lg cursor-pointer"
              >
                Synthesize 30-Day Audit
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Pattern Modal */}
      {showAddPatternModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-lg w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-100 font-display">
              Log Observed Behavioral Pattern
            </h3>
            <form onSubmit={handleAddPatternSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Pattern Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Energy Drop Phone Reflex"
                  value={newPattern.pattern}
                  onChange={(e) => setNewPattern({ ...newPattern, pattern: e.target.value })}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Evidence from logs</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. In 4 of the last 6 days, opened feeds at 2:30 PM after complex tickets."
                  value={newPattern.evidence}
                  onChange={(e) => setNewPattern({ ...newPattern, evidence: e.target.value })}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Frequency</label>
                  <input
                    type="text"
                    value={newPattern.frequency}
                    onChange={(e) => setNewPattern({ ...newPattern, frequency: e.target.value })}
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Impact</label>
                  <input
                    type="text"
                    value={newPattern.impact}
                    onChange={(e) => setNewPattern({ ...newPattern, impact: e.target.value })}
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Suggested Intervention</label>
                <input
                  type="text"
                  placeholder="e.g. Leave phone in another room between 1:30 and 4 PM."
                  value={newPattern.suggestedIntervention}
                  onChange={(e) => setNewPattern({ ...newPattern, suggestedIntervention: e.target.value })}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPatternModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-lg cursor-pointer"
                >
                  Save Pattern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TrendItem: React.FC<{ label: string; text: string }> = ({ label, text }) => (
  <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide">{label}</div>
    <div className="text-xs text-neutral-200 leading-snug">{text}</div>
  </div>
);

const MetricChangeCard: React.FC<{ label: string; delta: number }> = ({ label, delta }) => {
  const isPositive = delta >= 0;
  return (
    <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
      <div className="text-xs text-neutral-400">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold font-mono text-neutral-100 tabular-nums">
          {isPositive ? `+${delta}%` : `${delta}%`}
        </span>
        {isPositive ? (
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
        )}
      </div>
    </div>
  );
};

const AuditCard: React.FC<{ title: string; items: string[]; color: string }> = ({ title, items, color }) => (
  <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
    <div className={`text-xs font-bold uppercase tracking-wider ${color}`}>{title}</div>
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="text-xs text-neutral-300 leading-relaxed flex items-start gap-2">
          <span className="text-neutral-500 font-mono">·</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);
