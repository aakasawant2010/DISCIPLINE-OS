import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowRight, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Dumbbell, 
  Moon, 
  Brain, 
  Users, 
  TrendingUp, 
  PhoneOff, 
  Focus, 
  Zap, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Heart,
  BatteryCharging,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Video,
  MessageSquare
} from 'lucide-react';
import { getVideoByDateFromVault, StoredVideoRecord } from '../utils/videoStorage';

export const HomeView: React.FC = () => {
  const { 
    profile, 
    todayReflection, 
    streaks, 
    setActiveTab, 
    patterns, 
    biometrics, 
    getBiometricsForDate, 
    saveBiometricsForDate 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(biometrics?.date || todayStr);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [todayVideo, setTodayVideo] = useState<StoredVideoRecord | null>(null);

  useEffect(() => {
    getVideoByDateFromVault(todayStr).then((vid) => setTodayVideo(vid));
  }, [todayStr]);

  // Active biometrics for the selected date
  const activeBiometrics = getBiometricsForDate ? getBiometricsForDate(selectedDate) : biometrics;
  const [localSleepPercentage, setLocalSleepPercentage] = useState<number>(activeBiometrics?.sleepPercentage ?? 80);
  const [localRecoveryPercentage, setLocalRecoveryPercentage] = useState<number>(activeBiometrics?.recoveryPercentage ?? 75);
  const [localSleepHours, setLocalSleepHours] = useState<number>(activeBiometrics?.sleepHours ?? 7.5);

  // Sync inputs when selected date changes
  useEffect(() => {
    if (getBiometricsForDate) {
      const entry = getBiometricsForDate(selectedDate);
      setLocalSleepPercentage(entry.sleepPercentage);
      setLocalRecoveryPercentage(entry.recoveryPercentage);
      setLocalSleepHours(entry.sleepHours ?? 7.5);
    }
  }, [selectedDate]);

  const handleUpdate = (updates: { sleep?: number; recovery?: number; hours?: number }) => {
    const sleep = updates.sleep !== undefined ? updates.sleep : localSleepPercentage;
    const recovery = updates.recovery !== undefined ? updates.recovery : localRecoveryPercentage;
    const hours = updates.hours !== undefined ? updates.hours : localSleepHours;

    if (updates.sleep !== undefined) setLocalSleepPercentage(sleep);
    if (updates.recovery !== undefined) setLocalRecoveryPercentage(recovery);
    if (updates.hours !== undefined) setLocalSleepHours(hours);

    saveBiometricsForDate({
      date: selectedDate,
      sleepPercentage: Math.min(100, Math.max(0, sleep)),
      recoveryPercentage: Math.min(100, Math.max(0, recovery)),
      sleepHours: hours,
    });

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const shiftDate = (deltaDays: number) => {
    const cur = new Date(selectedDate + 'T12:00:00');
    cur.setDate(cur.getDate() + deltaDays);
    const newDateStr = cur.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
  };

  // Dynamic greeting based on current local hour
  const currentHour = new Date().getHours();
  let greetingTime = 'evening';
  if (currentHour >= 5 && currentHour < 12) {
    greetingTime = 'morning';
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingTime = 'afternoon';
  }

  const scores = todayReflection?.verdict?.scores;
  const overallScore = scores?.overall?.score ?? 82;
  const tomorrowPlan = todayReflection?.verdict?.tomorrowPlan;
  const recentPattern = patterns[0];

  // Strongest and weakest areas calculation
  const scoreEntries = scores ? [
    { name: 'Discipline', score: scores.discipline.score },
    { name: 'Focus', score: scores.focus.score },
    { name: 'Health', score: scores.health.score },
    { name: 'Learning', score: scores.learning.score },
    { name: 'Relationships', score: scores.relationships.score },
    { name: 'Mood', score: scores.mood.score },
  ].sort((a, b) => b.score - a.score) : [];

  const strongestArea = scoreEntries.length > 0 ? scoreEntries[0].name.toLowerCase() : 'health';
  const weakestArea = scoreEntries.length > 0 ? scoreEntries[scoreEntries.length - 1].name.toLowerCase() : 'focus';

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Greeting & Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900/60 border border-neutral-800 p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-neutral-300 uppercase">
            <span>Daily Audit</span>
            <span aria-hidden="true">·</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            <span aria-hidden="true">·</span>
            <span className={profile.mode === 'brutal' ? 'text-amber-400 font-bold' : 'text-neutral-300 font-medium'}>
              {profile.mode === 'brutal' ? 'Brutal Honesty Mode' : 'Normal Mode'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-100 font-display">
            Good {greetingTime}, {profile.name || 'Seeker'}.<br />
            <span className="text-neutral-400 font-normal">Let’s see who you were today.</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
            Every choice you made today cast a vote for the person you are becoming. No rationalizations, no vanity metrics—only clean, actionable awareness.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveTab('reflect')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-neutral-200/10 cursor-pointer group"
            >
              <span>START TODAY'S REFLECTION</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setActiveTab('mirror')}
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 hover:text-white font-medium text-sm rounded-xl border border-neutral-700/60 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Show Me The Mirror</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 hover:text-white font-medium text-sm rounded-xl border border-neutral-700/60 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>AI Reflection Coach</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* MANUAL ENTRY DATA POINT: SLEEP PERCENTAGE, RECOVERY WITH DATE */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-indigo-400 shrink-0">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-neutral-100 tracking-wide uppercase font-mono">
                  Daily Biometrics & Readiness Log
                </h2>
                {justSaved && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full transition-opacity">
                    <Check className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                Manual entry for physiological state to cross-audit recovery against cognitive willpower.
              </p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => shiftDate(-1)}
              title="Previous Day"
              className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-mono font-medium text-neutral-200 focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => shiftDate(1)}
              title="Next Day"
              className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {selectedDate !== todayStr && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="px-2 py-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer border-l border-neutral-800"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* 2 Main Manual Entry Data Points: Sleep Percentage & Recovery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Sleep Percentage */}
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-neutral-200">Sleep Percentage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-mono font-extrabold text-indigo-400 tabular-nums">
                  {localSleepPercentage}%
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  ({localSleepHours}h)
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1.5">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={localSleepPercentage}
                onChange={(e) => handleUpdate({ sleep: Number(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono">
                <span>0% Poor</span>
                <span>70% Adequate</span>
                <span>85%+ Optimal</span>
                <span>100%</span>
              </div>
            </div>

            {/* Steppers & Hours */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleUpdate({ sleep: Math.max(0, localSleepPercentage - 5) })}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded text-[11px] font-mono cursor-pointer"
                >
                  -5%
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate({ sleep: Math.min(100, localSleepPercentage + 5) })}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded text-[11px] font-mono cursor-pointer"
                >
                  +5%
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400">Duration:</span>
                <input
                  type="number"
                  min="0"
                  max="16"
                  step="0.1"
                  value={localSleepHours}
                  onChange={(e) => handleUpdate({ hours: Math.max(0, Number(e.target.value)) })}
                  className="w-14 px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-center text-xs font-mono text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-neutral-500">hrs</span>
              </div>
            </div>

            {/* Status Quality Tag */}
            <div className="pt-1 flex items-center gap-1.5 text-[11px]">
              <span className={`inline-block w-2 h-2 rounded-full ${localSleepPercentage >= 85 ? 'bg-emerald-400' : localSleepPercentage >= 70 ? 'bg-indigo-400' : 'bg-rose-400'}`} />
              <span className="text-neutral-400">
                {localSleepPercentage >= 85
                  ? 'Optimal restoration — High neural recovery'
                  : localSleepPercentage >= 70
                  ? 'Adequate sleep — Moderate recovery baseline'
                  : 'Sleep deficit — Guard against mid-day willpower failure'}
              </span>
            </div>
          </div>

          {/* 2. Recovery Score */}
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className={`w-4 h-4 ${localRecoveryPercentage >= 67 ? 'text-emerald-400' : localRecoveryPercentage >= 34 ? 'text-amber-400' : 'text-rose-400'}`} />
                <span className="text-xs font-bold text-neutral-200">Recovery Score</span>
              </div>
              <span className={`text-xl font-mono font-extrabold tabular-nums ${localRecoveryPercentage >= 67 ? 'text-emerald-400' : localRecoveryPercentage >= 34 ? 'text-amber-400' : 'text-rose-400'}`}>
                {localRecoveryPercentage}%
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-1.5">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={localRecoveryPercentage}
                onChange={(e) => handleUpdate({ recovery: Number(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono">
                <span className="text-rose-400">0% Low</span>
                <span className="text-amber-400">34% Moderate</span>
                <span className="text-emerald-400">67%+ Prime</span>
                <span>100%</span>
              </div>
            </div>

            {/* Steppers & Quick Adjust */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleUpdate({ recovery: Math.max(0, localRecoveryPercentage - 5) })}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded text-[11px] font-mono cursor-pointer"
                >
                  -5%
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate({ recovery: Math.min(100, localRecoveryPercentage + 5) })}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded text-[11px] font-mono cursor-pointer"
                >
                  +5%
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400">Manual input:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={localRecoveryPercentage}
                  onChange={(e) => handleUpdate({ recovery: Math.min(100, Math.max(0, Number(e.target.value))) })}
                  className="w-14 px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-center text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-neutral-500">%</span>
              </div>
            </div>

            {/* Status Quality Tag */}
            <div className="pt-1 flex items-center gap-1.5 text-[11px]">
              <span className={`inline-block w-2 h-2 rounded-full ${localRecoveryPercentage >= 67 ? 'bg-emerald-400' : localRecoveryPercentage >= 34 ? 'bg-amber-400' : 'bg-rose-400'}`} />
              <span className="text-neutral-400">
                {localRecoveryPercentage >= 67
                  ? 'Prime Readiness (Green) — High physical & mental capacity'
                  : localRecoveryPercentage >= 34
                  ? 'Moderate Capacity (Yellow) — Maintain steady, unhurried discipline'
                  : 'Restorative State (Red) — Prioritize energy boundaries & active rest'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Context Footer */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-300">
              Entry for {selectedDate}:
            </span>
            <span>
              Sleep: <strong className="text-indigo-400">{localSleepPercentage}%</strong> · Recovery: <strong className={localRecoveryPercentage >= 67 ? 'text-emerald-400' : localRecoveryPercentage >= 34 ? 'text-amber-400' : 'text-rose-400'}>{localRecoveryPercentage}%</strong>
            </span>
          </div>

          <div className="text-[11px] text-neutral-500 italic">
            Changes auto-save instantly and sync directly into today's reflection verdicts.
          </div>
        </div>
      </div>

      {/* 2. Today's Reflection Status & Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-1">
          <div className="text-xs text-neutral-300 font-medium flex items-center justify-between">
            <span>Status</span>
            {todayReflection ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
          <div className="text-sm font-semibold text-neutral-200">
            {todayReflection ? 'Logged' : 'Pending Tonight'}
          </div>
          <div className="text-[11px] text-neutral-300">
            {todayReflection ? `${todayReflection.mode} mode` : 'Takes ~3 minutes'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-1">
          <div className="text-xs text-neutral-300 font-medium flex items-center justify-between">
            <span>Discipline</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-100">
            {scores?.discipline?.score ?? 78}/100
          </div>
          <div className="text-[11px] text-neutral-300 truncate">
            {scores?.discipline?.reason ?? 'Execution consistency'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-1">
          <div className="text-xs text-neutral-300 font-medium flex items-center justify-between">
            <span>Focus</span>
            <Focus className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-100">
            {scores?.focus?.score ?? 72}/100
          </div>
          <div className="text-[11px] text-neutral-300 truncate">
            {scores?.focus?.reason ?? 'Cognitive throughput'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-1">
          <div className="text-xs text-neutral-300 font-medium flex items-center justify-between">
            <span>Energy & Body</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-100">
            {todayReflection?.answers?.energyLevel ? `${todayReflection.answers.energyLevel}/10` : '7/10'}
          </div>
          <div className="text-[11px] text-neutral-300 truncate">
            {todayReflection?.answers?.exerciseDone ? 'Workout completed' : 'Rest day'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-1">
          <div className="text-xs text-neutral-300 font-medium flex items-center justify-between">
            <span>Sleep</span>
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-100">
            {todayReflection?.answers?.sleepHours ? `${todayReflection.answers.sleepHours}h` : '7.5h'}
          </div>
          <div className="text-[11px] text-neutral-300 truncate">
            Quality: {todayReflection?.answers?.sleepQuality ? `${todayReflection.answers.sleepQuality}/10` : '8/10'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-1">
          <div className="text-xs text-neutral-300 font-medium flex items-center justify-between">
            <span>Relationships</span>
            <Users className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-100">
            {scores?.relationships?.score ?? 76}/100
          </div>
          <div className="text-[11px] text-neutral-300 truncate">
            {scores?.relationships?.reason ?? 'Connection logged'}
          </div>
        </div>
      </div>

      {/* Daily Progress Video Check-in Banner */}
      <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
            <Video className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-100 font-display">
                Daily Progress Video
              </span>
              {todayVideo ? (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Recorded for Today
                </span>
              ) : (
                <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/80 px-2 py-0.5 rounded-full">
                  Pending Check-in
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-300 max-w-xl">
              {todayVideo 
                ? `"${todayVideo.title}" (${Math.floor(todayVideo.durationSeconds / 60)}m ${todayVideo.durationSeconds % 60}s) logged in your video vault. Watch back or record another entry.`
                : 'Capture a 60–120 second video check-in. Face yourself unedited, speak what worked, what you avoided, and what tomorrow demands.'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('video')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-xl transition-colors shadow-md cursor-pointer whitespace-nowrap"
          >
            <Video className="w-3.5 h-3.5 text-neutral-950" />
            <span>{todayVideo ? 'Watch / Manage Videos →' : 'Record Today’s Video →'}</span>
          </button>
        </div>
      </div>

      {/* 3. Daily Score Hero Card & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-300">Daily Assessment</span>
              <span className="text-xs text-neutral-300">Composite Index</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-6xl sm:text-7xl font-extrabold font-mono tabular-nums text-neutral-100 tracking-tight">
                {overallScore}
              </span>
              <span className="text-xl text-neutral-300 font-mono">/ 100</span>
            </div>

            <div className="space-y-1 pt-2">
              <div className="text-sm font-semibold text-neutral-200">
                TODAY'S BEHAVIOR SCORE
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Your strongest area today was <strong className="text-neutral-200 capitalize">{strongestArea}</strong>. Your weakest area was <strong className="text-neutral-200 capitalize">{weakestArea}</strong>.
              </p>
              <p className="text-[11px] text-neutral-400 italic pt-1">
                This score represents behavior executed today, not your worth as a human being.
              </p>
            </div>
          </div>

          {/* Sub-scores bars */}
          <div className="mt-8 space-y-3 pt-6 border-t border-neutral-800/80">
            {scores && (
              <>
                <ScoreBar label="Discipline" score={scores.discipline.score} color="bg-amber-500" />
                <ScoreBar label="Focus" score={scores.focus.score} color="bg-blue-500" />
                <ScoreBar label="Health & Body" score={scores.health.score} color="bg-emerald-500" />
                <ScoreBar label="Active Learning" score={scores.learning.score} color="bg-purple-500" />
                <ScoreBar label="Relationships" score={scores.relationships.score} color="bg-rose-500" />
                <ScoreBar label="Mood & Baseline" score={scores.mood.score} color="bg-indigo-500" />
              </>
            )}
          </div>
        </div>

        {/* Today's Verdict & Analysis */}
        <div className="lg:col-span-7 rounded-2xl bg-neutral-900/50 border border-neutral-800 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-300">Analysis Engine</span>
                <span aria-hidden="true">·</span>
                <span className="text-xs text-neutral-300">
                  {todayReflection?.date ? `Logged for ${todayReflection.date}` : 'Latest Assessment'}
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-200">
                TODAY'S VERDICT
              </span>
            </div>

            <p className="text-base sm:text-lg text-neutral-200 leading-relaxed font-medium">
              "{todayReflection?.verdict?.summary || 'You executed physically and built high-velocity morning momentum, then capitulated to discomfort the moment your task became ambiguous. The problem was not fatigue; it was low tolerance for cognitive friction.'}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1.5">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  Biggest Win
                </div>
                <div className="text-xs text-neutral-300 leading-relaxed">
                  {todayReflection?.verdict?.win || 'Maintained physical training standard and executed high-impact benchmarks.'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1.5">
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wide">
                  Biggest Miss
                </div>
                <div className="text-xs text-neutral-300 leading-relaxed">
                  {todayReflection?.verdict?.miss || 'Permitted low-friction phone diversion when tests became tedious.'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1.5">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  Pattern Identified
                </div>
                <div className="text-xs text-neutral-300 leading-relaxed">
                  {todayReflection?.verdict?.pattern || 'Phone escape reflex triggered precisely when code difficulty spikes.'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1.5">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                  Blind Spot
                </div>
                <div className="text-xs text-neutral-300 leading-relaxed">
                  {todayReflection?.verdict?.blindSpot || 'Rationalizing afternoon attention lapses as exhaustion rather than discomfort avoidance.'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-300">
            <span>Emotional State: <strong className="text-neutral-300">{todayReflection?.verdict?.emotionalState || 'Focused with underlying impatience'}</strong></span>
            <button
              onClick={() => setActiveTab('history')}
              className="text-neutral-300 hover:text-neutral-100 underline underline-offset-2 transition-colors cursor-pointer"
            >
              View Full History →
            </button>
          </div>
        </div>
      </div>

      {/* 4. Streaks Discipline Matrix */}
      <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
              Active Behavioral Streaks
            </h2>
          </div>
          <span className="text-xs text-neutral-300">Self-awareness over gamification</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StreakCard label="Reflection" count={streaks.reflectionStreak} unit="days" icon={<Flame className="w-3.5 h-3.5 text-amber-500" />} />
          <StreakCard label="Workout" count={streaks.workoutStreak} unit="days" icon={<Dumbbell className="w-3.5 h-3.5 text-emerald-500" />} />
          <StreakCard label="Deep Work" count={streaks.deepWorkStreak} unit="days" icon={<Focus className="w-3.5 h-3.5 text-blue-500" />} />
          <StreakCard label="Sleep > 7h" count={streaks.sleepConsistencyStreak} unit="days" icon={<Moon className="w-3.5 h-3.5 text-indigo-500" />} />
          <StreakCard label="Learning" count={streaks.learningStreak} unit="days" icon={<Brain className="w-3.5 h-3.5 text-purple-500" />} />
          <StreakCard label="Distraction Free" count={streaks.noSocialMediaStreak} unit="days" icon={<PhoneOff className="w-3.5 h-3.5 text-rose-500" />} />
        </div>
      </div>

      {/* 5. Tomorrow's Non-Negotiables & Pattern Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tomorrow's Plan */}
        <div className="lg:col-span-7 rounded-2xl bg-neutral-900/50 border border-neutral-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
                Tomorrow's Battle Plan
              </h2>
            </div>
            <span className="text-xs text-neutral-300">Actionable execution</span>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <div className="text-[11px] font-mono uppercase text-amber-400 tracking-wider font-semibold">
              ONE THING TO WIN
            </div>
            <div className="text-sm font-semibold text-neutral-100">
              {tomorrowPlan?.oneThingToWin || 'Write the complete socket edge-case test suite before opening any browser tab.'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono uppercase text-neutral-300 tracking-wider">
              3 Non-Negotiables
            </div>
            <div className="space-y-2">
              {(tomorrowPlan?.nonNegotiables || [
                'No phone inside the office room between 1:30 PM and 4:30 PM.',
                'Complete 45 minutes of Distributed Consensus reading with handwritten notes.',
                'Cook dinner with partner with zero phone checks.',
              ]).map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/70 text-xs text-neutral-200">
                  <span className="font-mono text-neutral-400 shrink-0 font-bold">{idx + 1}.</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/60 space-y-1">
              <span className="text-rose-400 font-semibold uppercase text-[10px] tracking-wider">Stop</span>
              <p className="text-neutral-300">{tomorrowPlan?.oneThingToStop || 'Reaching for phone when compiler throws errors.'}</p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/60 space-y-1">
              <span className="text-emerald-400 font-semibold uppercase text-[10px] tracking-wider">Start</span>
              <p className="text-neutral-300">{tomorrowPlan?.oneThingToStart || 'Take 3 deep breaths and write the smallest test first.'}</p>
            </div>
          </div>
        </div>

        {/* Behavioral Pattern Spotlight */}
        <div className="lg:col-span-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
                  Detected Pattern Spotlight
                </h2>
              </div>
              <span className="text-xs text-neutral-300">Recurrence</span>
            </div>

            {recentPattern ? (
              <div className="space-y-3 p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/90">
                <div className="text-sm font-bold text-neutral-100">
                  {recentPattern.pattern}
                </div>
                <div className="text-xs text-neutral-300 leading-relaxed">
                  <span className="text-neutral-400 font-medium">Evidence:</span> {recentPattern.evidence}
                </div>
                <div className="pt-2 border-t border-neutral-800/80 text-xs text-neutral-300">
                  <span className="text-amber-400 font-semibold">Intervention:</span> {recentPattern.suggestedIntervention}
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-300">Log 3 or more daily reflections to trigger automatic pattern detection.</p>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('insights')}
              className="text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              View All Patterns & Weekly Review →
            </button>
            <button
              onClick={() => setActiveTab('life')}
              className="text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              Life Area Scores →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ScoreBarProps {
  label: string;
  score: number;
  color: string;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ label, score, color }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-neutral-300">{label}</span>
        <span className="font-mono tabular-nums text-neutral-200 font-medium">{score}</span>
      </div>
      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
};

interface StreakCardProps {
  label: string;
  count: number;
  unit: string;
  icon: React.ReactNode;
}

const StreakCard: React.FC<StreakCardProps> = ({ label, count, unit, icon }) => {
  return (
    <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-base font-extrabold font-mono tabular-nums text-neutral-100">
          {count} <span className="text-[11px] font-normal text-neutral-400">{unit}</span>
        </div>
        <div className="text-[11px] text-neutral-300 truncate">
          {label}
        </div>
      </div>
    </div>
  );
};
