import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowRight, 
  Flame, 
  Sparkles, 
  Moon, 
  Activity, 
  ShieldCheck, 
  Focus, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertTriangle,
  RotateCcw,
  Video,
  MessageSquare,
  Target,
  Briefcase,
  Code2,
  Play
} from 'lucide-react';
import { DynamicBiometricWave } from './DynamicBiometricWave';
import { DailyTasksAudit } from './DailyTasksAudit';
import { DailyProgressVideoSection } from './DailyProgressVideoSection';
import { ReflectFlow } from './ReflectFlow';

export const HomeView: React.FC = () => {
  const { 
    profile, 
    todayReflection, 
    streaks, 
    setActiveTab, 
    patterns, 
    biometrics, 
    getBiometricsForDate, 
    saveBiometricsForDate,
    tasks,
    getTasksForDate
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(biometrics?.date || todayStr);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [showReflectModal, setShowReflectModal] = useState<boolean>(false);

  // Switch Company 7-8h Study Metrics
  const [studyHoursToday, setStudyHoursToday] = useState<number>(4.5);
  const [targetStudyHours, setTargetStudyHours] = useState<number>(8.0);
  const [isSwitchTimerActive, setIsSwitchTimerActive] = useState<boolean>(false);

  useEffect(() => {
    const updateSwitchMetrics = () => {
      try {
        const savedGoal = localStorage.getItem('sc_daily_goal_hours');
        if (savedGoal) {
          setTargetStudyHours(Number(savedGoal));
        }

        const activeTimer = localStorage.getItem('sc_active_timer');
        let isRunning = false;
        let extraSec = 0;
        if (activeTimer) {
          const parsed = JSON.parse(activeTimer);
          if (parsed.status === 'running' && parsed.startTimestamp) {
            isRunning = true;
            extraSec = Math.floor((Date.now() - parsed.startTimestamp) / 1000) + (parsed.elapsedBeforePause || 0);
          } else if (parsed.status === 'paused') {
            extraSec = parsed.elapsedBeforePause || 0;
          }
        }
        setIsSwitchTimerActive(isRunning);

        const savedSessions = localStorage.getItem('sc_study_sessions');
        let totalSec = 0;
        if (savedSessions) {
          const sessions = JSON.parse(savedSessions);
          const todays = sessions.filter((s: any) => s.dateStr === todayStr);
          totalSec = todays.reduce((acc: number, s: any) => acc + (s.durationSeconds || 0), 0);
        } else {
          totalSec = 16500; // 4h 35m default demo
        }

        totalSec += extraSec;
        setStudyHoursToday(Number((totalSec / 3600).toFixed(1)));
      } catch {
        // fallback
      }
    };

    updateSwitchMetrics();
    const interval = setInterval(updateSwitchMetrics, 2000);
    return () => clearInterval(interval);
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
  }, [selectedDate, getBiometricsForDate]);

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

  const scores = todayReflection?.verdict?.scores;
  const overallScore = scores?.overall?.score ?? 82;
  const tomorrowPlan = todayReflection?.verdict?.tomorrowPlan;
  const recentPattern = patterns[0];

  // Tasks statistics for the selected date
  const dateTasks = getTasksForDate ? getTasksForDate(selectedDate) : tasks.filter((t) => t.date === selectedDate);
  const completedTasks = dateTasks.filter((t) => t.status === 'completed').length;
  const failedTasks = dateTasks.filter((t) => t.status === 'failed').length;
  const totalTasks = dateTasks.length;
  const executionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* 1. TOP SECTION: IMPORTANT METRICS FIRST & MANUAL ENTRY */}
      <div className="p-5 sm:p-7 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-5">
        {/* Date Selector Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                DAILY METRICS LOG
              </span>
              {justSaved && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-100 font-display">
              Physical State & Daily Audit
            </h1>
          </div>

          {/* Date Controls */}
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800 self-start sm:self-auto">
            <button
              onClick={() => shiftDate(-1)}
              title="Previous Day"
              className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
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
              <ChevronRight className="w-4 h-4" />
            </button>

            {selectedDate !== todayStr && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="px-2.5 py-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer border-l border-neutral-800"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* 2 Main Manual Entry Data Points: Sleep Percentage & Recovery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* A. Sleep Percentage Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-neutral-200 uppercase tracking-wide">
                  Sleep Percentage
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-mono font-extrabold text-indigo-400 tabular-nums">
                  {localSleepPercentage}%
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  ({localSleepHours}h)
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={localSleepPercentage}
                onChange={(e) => handleUpdate({ sleep: Number(e.target.value) })}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono">
                <span>0% Depleted</span>
                <span>70% Adequate</span>
                <span>85%+ Prime</span>
                <span>100%</span>
              </div>
            </div>

            {/* Steppers & Hours Duration */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleUpdate({ sleep: Math.max(0, localSleepPercentage - 5) })}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded text-xs font-mono cursor-pointer"
                >
                  -5%
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate({ sleep: Math.min(100, localSleepPercentage + 5) })}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded text-xs font-mono cursor-pointer"
                >
                  +5%
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-neutral-400">Duration:</span>
                <input
                  type="number"
                  min="0"
                  max="16"
                  step="0.1"
                  value={localSleepHours}
                  onChange={(e) => handleUpdate({ hours: Math.max(0, Number(e.target.value)) })}
                  className="w-16 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-center text-xs font-mono text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-neutral-500 font-mono">hrs</span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 pt-0.5">
              {localSleepPercentage >= 85
                ? 'High biological recovery. No cognitive excuse for slacking.'
                : localSleepPercentage >= 70
                ? 'Adequate foundation. Guard against afternoon friction.'
                : 'Sleep deficit detected. Discipline must override fatigue.'}
            </div>
          </div>

          {/* B. Recovery Score Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className={`w-4 h-4 ${localRecoveryPercentage >= 67 ? 'text-emerald-400' : localRecoveryPercentage >= 34 ? 'text-amber-400' : 'text-rose-400'}`} />
                <span className="text-xs font-bold text-neutral-200 uppercase tracking-wide">
                  Recovery Score
                </span>
              </div>
              <span className={`text-2xl font-mono font-extrabold tabular-nums ${localRecoveryPercentage >= 67 ? 'text-emerald-400' : localRecoveryPercentage >= 34 ? 'text-amber-400' : 'text-rose-400'}`}>
                {localRecoveryPercentage}%
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={localRecoveryPercentage}
                onChange={(e) => handleUpdate({ recovery: Number(e.target.value) })}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono">
                <span className="text-rose-400">0% Low</span>
                <span className="text-amber-400">34% Moderate</span>
                <span className="text-emerald-400">67%+ Peak</span>
                <span>100%</span>
              </div>
            </div>

            {/* Steppers & Manual Input */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleUpdate({ recovery: Math.max(0, localRecoveryPercentage - 5) })}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded text-xs font-mono cursor-pointer"
                >
                  -5%
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate({ recovery: Math.min(100, localRecoveryPercentage + 5) })}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded text-xs font-mono cursor-pointer"
                >
                  +5%
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-neutral-400">Manual:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={localRecoveryPercentage}
                  onChange={(e) => handleUpdate({ recovery: Math.min(100, Math.max(0, Number(e.target.value))) })}
                  className="w-16 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-center text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-neutral-500 font-mono">%</span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 pt-0.5">
              {localRecoveryPercentage >= 67
                ? 'High readiness. Full capacity to crush complex work.'
                : localRecoveryPercentage >= 34
                ? 'Moderate baseline. Maintain steady, unyielding momentum.'
                : 'Low readiness. Do not quit—simplify focus to essentials.'}
            </div>
          </div>
        </div>

        {/* DYNAMIC MOVING ELEMENT: Bio-Waveform Canvas */}
        <DynamicBiometricWave
          recoveryPercentage={localRecoveryPercentage}
          sleepPercentage={localSleepPercentage}
        />

        {/* Core Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
            <div className="text-[11px] text-neutral-400 font-mono">RECOVERY</div>
            <div className={`text-xl font-extrabold font-mono tabular-nums ${localRecoveryPercentage >= 67 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {localRecoveryPercentage}%
            </div>
            <div className="text-[10px] text-neutral-500">Readiness Score</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
            <div className="text-[11px] text-neutral-400 font-mono">SLEEP</div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-indigo-400">
              {localSleepPercentage}%
            </div>
            <div className="text-[10px] text-neutral-500">{localSleepHours} Hours Logged</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
            <div className="text-[11px] text-neutral-400 font-mono">EXECUTION</div>
            <div className={`text-xl font-extrabold font-mono tabular-nums ${failedTasks > 0 ? 'text-rose-400' : 'text-neutral-100'}`}>
              {executionRate}%
            </div>
            <div className="text-[10px] text-neutral-500">
              {failedTasks > 0 ? `${failedTasks} FAILED` : `${completedTasks}/${totalTasks} Tasks`}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
            <div className="text-[11px] text-neutral-400 font-mono">DISCIPLINE</div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-amber-400">
              {scores?.discipline?.score ?? 78}/100
            </div>
            <div className="text-[10px] text-neutral-500 truncate">Consistency rating</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
            <div className="text-[11px] text-neutral-400 font-mono">FOCUS</div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-blue-400">
              {scores?.focus?.score ?? 72}/100
            </div>
            <div className="text-[10px] text-neutral-500 truncate">Cognitive depth</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
            <div className="text-[11px] text-neutral-400 font-mono">TOTAL SCORE</div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-neutral-100">
              {overallScore}/100
            </div>
            <div className="text-[10px] text-neutral-500">Daily Composite</div>
          </div>
        </div>
      </div>

      {/* 2. SWITCH COMPANY WAR ROOM: 7-8H NON-STOP STUDY ENGINE */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4 relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-950/80 text-amber-300 border border-amber-800/80">
                SWITCH COMPANY SPRINT
              </span>
              {isSwitchTimerActive ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  STOPWATCH TICKING
                </span>
              ) : (
                <span className="text-[11px] font-mono text-neutral-400">
                  {studyHoursToday >= targetStudyHours ? '🔥 TARGET MET' : `${Number((targetStudyHours - studyHoursToday).toFixed(1))}h REMAINING`}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-neutral-100 font-display">
              Today's Study Goal: 7–8 Hours
            </h2>
            <p className="text-xs text-neutral-400">
              Target: Generative AI Engineer (17–20+ LPA) · Focused daily preparation
            </p>
          </div>

          <button
            onClick={() => setActiveTab('switch')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Open Switch Company</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Study Progress Bar */}
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-neutral-400">Today's Grinding Depth</span>
            <span className="font-mono font-bold text-neutral-100">
              {studyHoursToday} <span className="text-neutral-400 text-xs">/ {targetStudyHours}h Target</span>{' '}
              <span className="text-amber-400">({Math.min(100, Math.round((studyHoursToday / targetStudyHours) * 100))}%)</span>
            </span>
          </div>

          <div className="h-2.5 w-full bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-neutral-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                studyHoursToday >= targetStudyHours
                  ? 'bg-emerald-500'
                  : studyHoursToday >= 4
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.round((studyHoursToday / targetStudyHours) * 100))}%` }}
            ></div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-neutral-400 pt-0.5">
            <span className="text-neutral-300">
              {studyHoursToday < 3
                ? '⚠️ You are behind schedule. Candidates targeting your dream tier are already grinding.'
                : studyHoursToday < targetStudyHours
                ? '⚡ Momentum active. Push through the remaining hours non-stop.'
                : '🏆 Full 7-8h marathon logged. Elite consistency.'}
            </span>
            <span className="text-neutral-400 truncate">
              Target: Senior Software Engineer (Tier-1)
            </span>
          </div>
        </div>
      </div>

      {/* 3. DAILY NON-NEGOTIABLES & FAILURE AUDIT */}
      <DailyTasksAudit selectedDate={selectedDate} />


      {/* 3. DAILY PROGRESS VIDEO VAULT & RECORDER */}
      <DailyProgressVideoSection selectedDate={selectedDate} />

      {/* 4. TODAY'S UNFLINCHING VERDICT & EVENING AUDIT */}
      <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-5 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              HONEST BEHAVIORAL VERDICT
            </div>
            <h2 className="text-lg font-bold text-neutral-100 font-display">
              Who You Were Today
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReflectModal(true)}
              className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Full Reflection Audit</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs rounded-xl border border-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Confront in AI Chat</span>
            </button>
          </div>
        </div>

        {/* Verdict Statement */}
        <div className="p-4 sm:p-5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-medium">
            "{todayReflection?.verdict?.summary || 'You executed physically and built morning momentum, but capitulated to comfort when resistance appeared. The issue was not lack of capacity; it was voluntary surrender to cognitive friction.'}"
          </p>
        </div>

        {/* Win vs Miss */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1.5">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide font-mono">
              Legitimate Win
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {todayReflection?.verdict?.win || 'Maintained physical training standard and executed high-impact benchmarks.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1.5">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wide font-mono">
              Unacceptable Miss
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {failedTasks > 0
                ? `${failedTasks} non-negotiable commitment failed. Excuses cannot substitute for execution.`
                : todayReflection?.verdict?.miss || 'Allowed low-friction phone diversion when tests became tedious.'}
            </p>
          </div>
        </div>

        {/* Tomorrow's 3 Non-Negotiables */}
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Tomorrow's 3 Non-Negotiables
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">Execution Targets</span>
          </div>

          <div className="space-y-2">
            {(tomorrowPlan?.nonNegotiables || [
              'No phone inside the workspace between 9:00 AM and 1:00 PM.',
              'Complete high-resistance priority before opening email or feeds.',
              'Complete workout with zero compromises on volume.',
            ]).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-200">
                <span className="font-mono text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deep Reflection Modal (if user wants to run the complete 6-step questionnaire) */}
      {showReflectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h2 className="text-base font-bold text-neutral-100 font-display">
                Evening Reflection Protocol
              </h2>
              <button
                onClick={() => setShowReflectModal(false)}
                className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-900 border border-neutral-800 cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <ReflectFlow />
          </div>
        </div>
      )}
    </div>
  );
};
