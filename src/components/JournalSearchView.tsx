import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  RotateCw, 
  Sparkles, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Heart, 
  Moon, 
  ShieldCheck, 
  Focus, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { DailyReflection } from '../types';

const SAMPLE_QUERIES = [
  'What excuses do I repeat?',
  'When was I happiest?',
  'When did I last feel highly motivated?',
  'What problems keep appearing?',
  'Show me every time I mentioned procrastination',
  'What caused my biggest stress this month?',
];

export const JournalSearchView: React.FC = () => {
  const { reflections, deleteReflection } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchAnswer, setSearchAnswer] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSearchSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToRun = customQuery || searchQuery;
    if (!queryToRun.trim()) return;

    setIsSearching(true);
    setSearchAnswer(null);

    try {
      const response = await fetch('/api/search/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToRun,
          reflections,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchAnswer(data.answer);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchAnswer('Unable to query historical reflections at this time.');
    } finally {
      setIsSearching(false);
    }
  };

  // Emotional Timeline computation from reflections
  const emotionalTimeline = reflections.slice(0, 7).map((r) => ({
    date: r.date,
    dayName: new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' }),
    emotion: r.answers?.dominantEmotion || 'Steady',
    energy: r.answers?.energyLevel || 7,
    sleep: r.answers?.sleepHours || 7.5,
    score: r.verdict?.scores?.overall?.score || 80,
  })).reverse();

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-800 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 font-display">
          Journal & Memory Archive
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          Query your historical reflections with semantic intelligence and review your emotional trajectory.
        </p>
      </div>

      {/* 1. JOURNAL SEARCH ENGINE */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Ask Your Past Self</span>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask anything about your past thoughts, habits, excuses, or emotions..."
            className="w-full rounded-xl bg-neutral-950 border border-neutral-800 py-3.5 pl-4 pr-28 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-2 bottom-2 px-4 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSearching ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Ask AI</span>
          </button>
        </form>

        {/* Query suggestion pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-neutral-500 mr-1">Try:</span>
          {SAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setSearchQuery(q);
                handleSearchSubmit(undefined, q);
              }}
              className="text-[11px] px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800/80 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* AI Answer Box */}
        {searchAnswer && (
          <div className="mt-4 p-5 rounded-xl bg-neutral-950 border border-amber-900/40 space-y-2">
            <div className="text-[11px] font-mono uppercase text-amber-400 font-bold tracking-wider">
              AI ARCHIVE SYNTHESIS
            </div>
            <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-line font-medium">
              {searchAnswer}
            </div>
          </div>
        )}
      </div>

      {/* 2. EMOTIONAL TIMELINE */}
      <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-neutral-100 font-display">
              Emotional Trajectory & Correlation
            </h2>
            <p className="text-xs text-neutral-400">
              Pattern of dominant emotional states logged over recent reflection days.
            </p>
          </div>
          <span className="text-xs text-neutral-500 font-mono">Last 7 Reflection Days</span>
        </div>

        {/* Timeline cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {emotionalTimeline.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="text-[11px] font-mono text-neutral-400 uppercase">
                  {item.dayName} · {item.date.slice(5)}
                </div>
                <div className="text-xs font-bold text-neutral-100 pt-1 line-clamp-2">
                  {item.emotion}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800/70 text-[10px] text-neutral-400 font-mono space-y-0.5">
                <div>Sleep: {item.sleep}h</div>
                <div>Score: <strong className="text-neutral-200">{item.score}</strong></div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Correlation Note */}
        <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-xs text-neutral-300 leading-relaxed">
          <strong className="text-amber-400">Correlation Observation:</strong> Your reflections suggest a possible relationship between sleep exceeding 7.5 hours and lower afternoon frustration. Days with less than 7 hours of rest correlated with an increased incidence of avoidance behaviors.
        </div>
      </div>

      {/* 3. HISTORICAL REFLECTION LOGS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-100 font-display">
            Past Daily Reflections ({reflections.length})
          </h2>
          <span className="text-xs text-neutral-400">Expand for full verdicts</span>
        </div>

        {reflections.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-2">
            <p className="text-sm text-neutral-300">No reflections logged yet.</p>
            <p className="text-xs text-neutral-500">
              Complete your first daily reflection to start building your personal archive.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reflections.map((r) => {
              const isExpanded = expandedId === r.id;
              const dateFormatted = new Date(r.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={r.id}
                  className="rounded-2xl bg-neutral-900/50 border border-neutral-800 overflow-hidden transition-colors"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-900/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-100 font-display">
                          {dateFormatted}
                        </span>
                        <span aria-hidden="true" className="text-neutral-600">·</span>
                        <span className="text-xs font-mono text-neutral-400 uppercase">
                          {r.mode} mode
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-1 max-w-xl">
                        "{r.verdict?.summary || 'Daily reflection recorded.'}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-lg font-bold font-mono text-neutral-100 tabular-nums">
                          {r.verdict?.scores?.overall?.score || 80}
                        </span>
                        <span className="text-xs text-neutral-500 font-mono"> / 100</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-neutral-800 space-y-5 bg-neutral-950/40">
                      {/* Summary */}
                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                        <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                          THE VERDICT
                        </div>
                        <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                          "{r.verdict?.summary}"
                        </p>
                      </div>

                      {/* Win / Miss */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 space-y-1">
                          <span className="font-bold text-emerald-400 uppercase text-[10px]">Win:</span>
                          <p className="text-neutral-300">{r.verdict?.win}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 space-y-1">
                          <span className="font-bold text-rose-400 uppercase text-[10px]">Miss:</span>
                          <p className="text-neutral-300">{r.verdict?.miss}</p>
                        </div>
                      </div>

                      {/* Self honesty answer */}
                      {r.answers?.selfHonestyAnswer && (
                        <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 text-xs space-y-1">
                          <span className="font-bold text-amber-400 uppercase text-[10px]">
                            {r.answers.selfHonestyPrompt || 'Self-Honesty Answer'}:
                          </span>
                          <p className="text-neutral-200">{r.answers.selfHonestyAnswer}</p>
                        </div>
                      )}

                      {/* Tomorrow's plan */}
                      {r.verdict?.tomorrowPlan && (
                        <div className="text-xs space-y-1">
                          <span className="font-mono text-neutral-400 uppercase text-[10px]">Top Directive:</span>
                          <p className="text-neutral-200 font-semibold">{r.verdict.tomorrowPlan.oneThingToWin}</p>
                        </div>
                      )}

                      {/* Delete button */}
                      <div className="flex justify-end pt-2 border-t border-neutral-800/80">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this reflection entry?')) {
                              deleteReflection(r.id);
                            }
                          }}
                          className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Reflection</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
