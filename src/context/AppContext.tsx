import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DailyBiometrics,
  DailyReflection,
  DailyTask,
  DetectedPattern,
  FutureMeGoals,
  MemoryItem,
  MonthlyAudit,
  NavigationTab,
  ReflectionMode,
  StreakData,
  TheMirrorData,
  UserProfile,
  WeeklyReview,
} from '../types';
import {
  INITIAL_DAILY_BIOMETRICS,
  INITIAL_FUTURE_ME,
  INITIAL_MEMORIES,
  INITIAL_MONTHLY_AUDIT,
  INITIAL_PATTERNS,
  INITIAL_REFLECTIONS,
  INITIAL_THE_MIRROR,
  INITIAL_USER_PROFILE,
  INITIAL_WEEKLY_REVIEW,
} from '../data/demoData';

interface AppContextType {
  profile: UserProfile;
  reflections: DailyReflection[];
  patterns: DetectedPattern[];
  weeklyReview: WeeklyReview | null;
  monthlyAudit: MonthlyAudit | null;
  mirror: TheMirrorData | null;
  futureGoals: FutureMeGoals;
  memories: MemoryItem[];
  biometrics: DailyBiometrics;
  biometricsHistory: Record<string, DailyBiometrics>;
  getBiometricsForDate: (date: string) => DailyBiometrics;
  saveBiometricsForDate: (entry: DailyBiometrics) => void;
  updateBiometrics: (updates: Partial<DailyBiometrics>) => void;
  tasks: DailyTask[];
  addTask: (title: string, category?: DailyTask['category'], date?: string) => void;
  updateTaskStatus: (id: string, status: 'pending' | 'completed' | 'failed', failureReason?: string) => void;
  deleteTask: (id: string) => void;
  getTasksForDate: (date: string) => DailyTask[];
  activeTab: NavigationTab;
  streaks: StreakData;
  setActiveTab: (tab: NavigationTab) => void;
  setMode: (mode: ReflectionMode) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  saveReflection: (reflection: DailyReflection) => void;
  deleteReflection: (id: string) => void;
  setMirror: (mirror: TheMirrorData) => void;
  updateFutureGoals: (goals: Partial<FutureMeGoals>) => void;
  addMemory: (category: MemoryItem['category'], content: string) => void;
  deleteMemory: (id: string) => void;
  addPattern: (pattern: DetectedPattern) => void;
  deletePattern: (id: string) => void;
  setWeeklyReview: (review: WeeklyReview) => void;
  setMonthlyAudit: (audit: MonthlyAudit) => void;
  startFresh: () => void;
  resetToDemoData: () => void;
  exportData: () => void;
  todayReflection: DailyReflection | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'reset_app_profile',
  REFLECTIONS: 'reset_app_reflections',
  PATTERNS: 'reset_app_patterns',
  WEEKLY: 'reset_app_weekly',
  MONTHLY: 'reset_app_monthly',
  MIRROR: 'reset_app_mirror',
  FUTURE: 'reset_app_future',
  MEMORIES: 'reset_app_memories',
  BIOMETRICS: 'reset_app_biometrics',
  BIOMETRICS_HISTORY: 'reset_app_biometrics_history',
  TASKS: 'reset_app_daily_tasks',
};

const getDefaultTasksForDate = (date: string): DailyTask[] => [
  {
    id: `task-1-${date}`,
    title: '3-Hour Deep Work Block (Zero Distractions / Phone Locked)',
    category: 'deep-work',
    status: 'completed',
    date,
  },
  {
    id: `task-2-${date}`,
    title: 'Heavy Training Session / 5km Run (Zero Excuses)',
    category: 'fitness',
    status: 'failed',
    failureReason: 'Surrendered to mental friction and skipped workout.',
    date,
  },
  {
    id: `task-3-${date}`,
    title: 'Strict Clean Nutrition & Zero Added Sugar',
    category: 'health',
    status: 'completed',
    date,
  },
  {
    id: `task-4-${date}`,
    title: 'Read 30 Mins High-Density Text (Handwritten Notes)',
    category: 'learning',
    status: 'pending',
    date,
  },
  {
    id: `task-5-${date}`,
    title: 'Daily Progress Video Recorded & Evening Audit',
    category: 'discipline',
    status: 'pending',
    date,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  const [reflections, setReflections] = useState<DailyReflection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
      return saved ? JSON.parse(saved) : INITIAL_REFLECTIONS;
    } catch {
      return INITIAL_REFLECTIONS;
    }
  });

  const [patterns, setPatterns] = useState<DetectedPattern[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PATTERNS);
      return saved ? JSON.parse(saved) : INITIAL_PATTERNS;
    } catch {
      return INITIAL_PATTERNS;
    }
  });

  const [weeklyReview, setWeeklyReviewState] = useState<WeeklyReview | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEEKLY);
      return saved ? JSON.parse(saved) : INITIAL_WEEKLY_REVIEW;
    } catch {
      return INITIAL_WEEKLY_REVIEW;
    }
  });

  const [monthlyAudit, setMonthlyAuditState] = useState<MonthlyAudit | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MONTHLY);
      return saved ? JSON.parse(saved) : INITIAL_MONTHLY_AUDIT;
    } catch {
      return INITIAL_MONTHLY_AUDIT;
    }
  });

  const [mirror, setMirrorState] = useState<TheMirrorData | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MIRROR);
      return saved ? JSON.parse(saved) : INITIAL_THE_MIRROR;
    } catch {
      return INITIAL_THE_MIRROR;
    }
  });

  const [futureGoals, setFutureGoalsState] = useState<FutureMeGoals>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FUTURE);
      return saved ? JSON.parse(saved) : INITIAL_FUTURE_ME;
    } catch {
      return INITIAL_FUTURE_ME;
    }
  });

  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
    } catch {
      return INITIAL_MEMORIES;
    }
  });

  const [biometrics, setBiometricsState] = useState<DailyBiometrics>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BIOMETRICS);
      return saved ? JSON.parse(saved) : INITIAL_DAILY_BIOMETRICS;
    } catch {
      return INITIAL_DAILY_BIOMETRICS;
    }
  });

  const [biometricsHistory, setBiometricsHistory] = useState<Record<string, DailyBiometrics>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BIOMETRICS_HISTORY);
      if (saved) return JSON.parse(saved);
      return {
        [INITIAL_DAILY_BIOMETRICS.date]: INITIAL_DAILY_BIOMETRICS,
        '2026-10-05': { date: '2026-10-05', recoveryPercentage: 79, sleepPercentage: 88, sleepHours: 7.4 },
        '2026-10-04': { date: '2026-10-04', recoveryPercentage: 91, sleepPercentage: 94, sleepHours: 8.2 },
        '2026-10-03': { date: '2026-10-03', recoveryPercentage: 64, sleepPercentage: 74, sleepHours: 6.5 },
      };
    } catch {
      return { [INITIAL_DAILY_BIOMETRICS.date]: INITIAL_DAILY_BIOMETRICS };
    }
  });

  const [tasks, setTasksState] = useState<DailyTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (saved) return JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      return getDefaultTasksForDate(today);
    } catch {
      const today = new Date().toISOString().split('T')[0];
      return getDefaultTasksForDate(today);
    }
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
      localStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(patterns));
      localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify(weeklyReview));
      localStorage.setItem(STORAGE_KEYS.MONTHLY, JSON.stringify(monthlyAudit));
      localStorage.setItem(STORAGE_KEYS.MIRROR, JSON.stringify(mirror));
      localStorage.setItem(STORAGE_KEYS.FUTURE, JSON.stringify(futureGoals));
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
      localStorage.setItem(STORAGE_KEYS.BIOMETRICS, JSON.stringify(biometrics));
      localStorage.setItem(STORAGE_KEYS.BIOMETRICS_HISTORY, JSON.stringify(biometricsHistory));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [profile, reflections, patterns, weeklyReview, monthlyAudit, mirror, futureGoals, memories, biometrics, biometricsHistory, tasks]);

  const addTask = (title: string, category: DailyTask['category'] = 'custom', date?: string) => {
    const taskDate = date || new Date().toISOString().split('T')[0];
    const newTask: DailyTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      category,
      status: 'pending',
      date: taskDate,
    };
    setTasksState((prev) => [newTask, ...prev]);
  };

  const updateTaskStatus = (id: string, status: 'pending' | 'completed' | 'failed', failureReason?: string) => {
    setTasksState((prev) => {
      const exists = prev.some((t) => t.id === id);
      if (exists) {
        return prev.map((t) => (t.id === id ? { ...t, status, failureReason: failureReason || t.failureReason } : t));
      }
      // If task was from default virtual set for a date
      const dateMatch = id.match(/task-\d+-(.+)$/);
      if (dateMatch) {
        const date = dateMatch[1];
        const defaults = getDefaultTasksForDate(date);
        const updated = defaults.map((t) =>
          t.id === id ? { ...t, status, failureReason: failureReason || t.failureReason } : t
        );
        return [...updated, ...prev];
      }
      return prev;
    });
  };

  const deleteTask = (id: string) => {
    setTasksState((prev) => {
      const exists = prev.some((t) => t.id === id);
      if (exists) {
        return prev.filter((t) => t.id !== id);
      }
      const dateMatch = id.match(/task-\d+-(.+)$/);
      if (dateMatch) {
        const date = dateMatch[1];
        const defaults = getDefaultTasksForDate(date).filter((t) => t.id !== id);
        return [...defaults, ...prev];
      }
      return prev;
    });
  };

  const getTasksForDate = (date: string): DailyTask[] => {
    const matching = tasks.filter((t) => t.date === date);
    if (matching.length > 0) return matching;
    return getDefaultTasksForDate(date);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfileState((prev) => ({ ...prev, ...updates }));
  };

  const setMode = (mode: ReflectionMode) => {
    setProfileState((prev) => ({ ...prev, mode }));
  };

  const getBiometricsForDate = (date: string): DailyBiometrics => {
    if (biometricsHistory[date]) return biometricsHistory[date];
    const match = reflections.find((r) => r.date === date);
    if (match?.answers?.biometrics) {
      return {
        date,
        recoveryPercentage: match.answers.biometrics.recoveryPercentage ?? 75,
        sleepPercentage: match.answers.biometrics.sleepPercentage ?? 80,
        sleepHours: match.answers.biometrics.sleepHours ?? 7.5,
      };
    }
    return {
      date,
      recoveryPercentage: 75,
      sleepPercentage: 80,
      sleepHours: 7.5,
    };
  };

  const saveBiometricsForDate = (entry: DailyBiometrics) => {
    setBiometricsHistory((prev) => ({
      ...prev,
      [entry.date]: entry,
    }));
    setBiometricsState((prev) => (prev.date === entry.date ? entry : prev));
  };

  const updateBiometrics = (updates: Partial<DailyBiometrics>) => {
    setBiometricsState((prev) => {
      const merged = { ...prev, ...updates };
      setBiometricsHistory((hist) => ({
        ...hist,
        [merged.date]: merged,
      }));
      return merged;
    });
  };

  const saveReflection = (reflection: DailyReflection) => {
    setReflections((prev) => {
      const filtered = prev.filter((r) => r.id !== reflection.id && r.date !== reflection.date);
      return [reflection, ...filtered];
    });

    if (reflection.verdict?.win && reflection.verdict.win.length > 15) {
      const newMem: MemoryItem = {
        id: `mem-${Date.now()}`,
        category: 'achievement',
        content: `Win on ${reflection.date}: ${reflection.verdict.win}`,
        createdAt: reflection.date,
      };
      setMemories((prev) => [newMem, ...prev.slice(0, 25)]);
    }

    if (reflection.answers?.avoided && reflection.answers.avoided.length > 20) {
      const chalMem: MemoryItem = {
        id: `mem-chal-${Date.now()}`,
        category: 'challenge',
        content: `Identified avoidance on ${reflection.date}: ${reflection.answers.avoided}`,
        createdAt: reflection.date,
      };
      setMemories((prev) => [chalMem, ...prev.slice(0, 25)]);
    }
  };

  const deleteReflection = (id: string) => {
    setReflections((prev) => prev.filter((r) => r.id !== id));
  };

  const setMirror = (data: TheMirrorData) => {
    setMirrorState(data);
  };

  const updateFutureGoals = (goals: Partial<FutureMeGoals>) => {
    setFutureGoalsState((prev) => ({ ...prev, ...goals }));
  };

  const addMemory = (category: MemoryItem['category'], content: string) => {
    const item: MemoryItem = {
      id: `mem-${Date.now()}`,
      category,
      content,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMemories((prev) => [item, ...prev]);
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const addPattern = (pattern: DetectedPattern) => {
    setPatterns((prev) => [pattern, ...prev]);
  };

  const deletePattern = (id: string) => {
    setPatterns((prev) => prev.filter((p) => p.id !== id));
  };

  const setWeeklyReview = (review: WeeklyReview) => {
    setWeeklyReviewState(review);
  };

  const setMonthlyAudit = (audit: MonthlyAudit) => {
    setMonthlyAuditState(audit);
  };

  const startFresh = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setProfileState({
      name: profile.name || 'You',
      mode: 'brutal',
      selectedIdentities: ['Disciplined', 'Consistent', 'Focused'],
      isDemoData: false,
    });
    setReflections([]);
    setPatterns([]);
    setWeeklyReviewState(null);
    setMonthlyAuditState(null);
    setMirrorState(null);
    setFutureGoalsState({
      oneYearGoal: '',
      threeYearGoal: '',
      careerGoal: '',
      fitnessGoal: '',
      financialGoal: '',
      relationshipGoal: '',
      identityGoal: '',
      alignmentScore: 50,
      status: 'DRIFTING',
      analysis: 'Define your future targets to calculate alignment against daily actions.',
    });
    setMemories([]);
    setBiometricsState({
      date: todayStr,
      recoveryPercentage: 75,
      sleepPercentage: 80,
      sleepHours: 7.0,
    });
    localStorage.clear();
  };

  const resetToDemoData = () => {
    setProfileState(INITIAL_USER_PROFILE);
    setReflections(INITIAL_REFLECTIONS);
    setPatterns(INITIAL_PATTERNS);
    setWeeklyReviewState(INITIAL_WEEKLY_REVIEW);
    setMonthlyAuditState(INITIAL_MONTHLY_AUDIT);
    setMirrorState(INITIAL_THE_MIRROR);
    setFutureGoalsState(INITIAL_FUTURE_ME);
    setMemories(INITIAL_MEMORIES);
    setBiometricsState(INITIAL_DAILY_BIOMETRICS);
  };

  const exportData = () => {
    const payload = {
      profile,
      reflections,
      patterns,
      weeklyReview,
      monthlyAudit,
      mirror,
      futureGoals,
      memories,
      biometrics,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reset-growth-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate streaks
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReflection = reflections.find((r) => r.date === todayStr) || reflections[0] || null;

  const streaks: StreakData = {
    reflectionStreak: Math.max(1, reflections.length > 0 ? reflections.length + 11 : 0),
    workoutStreak: reflections.filter((r) => r.answers?.exerciseDone).length + 8,
    learningStreak: reflections.filter((r) => (r.verdict?.scores?.learning?.score || 0) >= 75).length + 4,
    sleepConsistencyStreak: reflections.filter((r) => (r.answers?.sleepHours || 0) >= 7).length + 5,
    noSocialMediaStreak: 2,
    deepWorkStreak: reflections.filter((r) => (r.verdict?.scores?.focus?.score || 0) >= 75).length + 3,
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        reflections,
        patterns,
        weeklyReview,
        monthlyAudit,
        mirror,
        futureGoals,
        memories,
        biometrics,
        biometricsHistory,
        getBiometricsForDate,
        saveBiometricsForDate,
        updateBiometrics,
        tasks,
        addTask,
        updateTaskStatus,
        deleteTask,
        getTasksForDate,
        activeTab,
        streaks,
        setActiveTab,
        setMode,
        updateProfile,
        saveReflection,
        deleteReflection,
        setMirror,
        updateFutureGoals,
        addMemory,
        deleteMemory,
        addPattern,
        deletePattern,
        setWeeklyReview,
        setMonthlyAudit,
        startFresh,
        resetToDemoData,
        exportData,
        todayReflection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
