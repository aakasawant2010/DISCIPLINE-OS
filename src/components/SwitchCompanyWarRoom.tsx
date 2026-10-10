import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Briefcase,
  Flame,
  Clock,
  Sparkles,
  ChevronDown,
  Award,
  BookOpen,
  HelpCircle,
  Compass,
  ArrowRight,
  TrendingUp,
  X,
  Check
} from 'lucide-react';

// Study Categories as requested
export type StudyTopic =
  | 'GenAI'
  | 'RAG'
  | 'LangChain'
  | 'LangGraph'
  | 'AI Agents'
  | 'Python'
  | 'FastAPI'
  | 'System Design'
  | 'AWS'
  | 'Docker'
  | 'DSA'
  | 'Project'
  | 'Interview Preparation'
  | 'Other';

const STUDY_TOPICS: StudyTopic[] = [
  'GenAI',
  'RAG',
  'LangChain',
  'LangGraph',
  'AI Agents',
  'Python',
  'FastAPI',
  'System Design',
  'AWS',
  'Docker',
  'DSA',
  'Project',
  'Interview Preparation',
  'Other',
];

// Study Session
export interface SimpleStudySession {
  id: string;
  topic: StudyTopic;
  startTime: number; // timestamp
  endTime: number;   // timestamp
  durationSeconds: number;
  dateStr: string;   // YYYY-MM-DD
}

// Daily Plan Item
export interface DailyPlanItem {
  id: string;
  topic: string;
  completed: boolean;
}

// Interview Prep Topic with manual progress bar
export interface TopicProgress {
  id: string;
  name: string;
  progress: number; // 0 to 100
}

// Interview Question
export interface InterviewQuestionItem {
  id: string;
  category: string;
  question: string;
  myAnswer: string;
  importantPoints: string;
  confidence: 'Low' | 'Medium' | 'High';
  needsRevision: boolean;
}

// Job Application
export type ApplicationStatus = 'Applied' | 'HR' | 'Technical' | 'Final' | 'Offer' | 'Rejected';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  dateApplied: string;
  status: ApplicationStatus;
  notes: string;
}

// Target Skill with status
export type SkillStatus = 'Learning' | 'Good' | 'Interview Ready';

export interface TargetSkillItem {
  name: string;
  status: SkillStatus;
}

// Profile Checklist Item
export interface ProfileCheckItem {
  id: string;
  label: string;
  checked: boolean;
}

// Mock interview question structure
interface MockQuestion {
  category: string;
  question: string;
}

const DEFAULT_MOCK_QUESTIONS: MockQuestion[] = [
  { category: 'GenAI', question: 'How do you mitigate hallucinations in LLM applications beyond basic temperature tuning?' },
  { category: 'RAG', question: 'Explain the difference between dense retrieval, sparse retrieval (BM25), and Hybrid search with Reciprocal Rank Fusion (RRF).' },
  { category: 'LangGraph', question: 'How does LangGraph manage cyclical state transitions and human-in-the-loop checkpoints compared to linear DAGs?' },
  { category: 'Python', question: 'How do Python asyncio event loops handle I/O bound concurrency vs CPU bound multiprocessing in a high-throughput API?' },
  { category: 'AI Agents', question: 'Describe the ReAct (Reasoning + Acting) pattern and how you handle agent tool execution failures or timeout recovery.' },
  { category: 'System Design', question: 'Design an end-to-end multi-tenant LLM gateway with rate-limiting, semantic caching (Redis), and failover across providers.' },
  { category: 'Project', question: 'Walk me through the most complex Generative AI feature or agent system you built: what were the latency and cost bottlenecks?' },
  { category: 'Behavioral', question: 'Tell me about a time you had to push back on unrealistic stakeholder expectations regarding AI accuracy or delivery timelines.' },
];

export const SwitchCompanyWarRoom: React.FC = () => {
  // Helper for today's date YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // ---------------------------------------------------------------------------
  // 1. SWITCH COMPANY HOME (Target info & Career Progress)
  // ---------------------------------------------------------------------------
  const [targetRole, setTargetRole] = useState<string>('Generative AI Engineer');
  const [targetSalary, setTargetSalary] = useState<string>('17–20+ LPA');
  const [targetGoalText, setTargetGoalText] = useState<string>('Switch to a better GenAI / AI Engineer role');
  const [careerProgress, setCareerProgress] = useState<number>(() => {
    const saved = localStorage.getItem('sc_career_progress');
    return saved ? Number(saved) : 65;
  });

  // ---------------------------------------------------------------------------
  // 2. DAILY STUDY GOAL (Default 8h)
  // ---------------------------------------------------------------------------
  const [dailyGoalHours, setDailyGoalHours] = useState<number>(() => {
    const saved = localStorage.getItem('sc_daily_goal_hours');
    return saved ? Number(saved) : 8;
  });

  // ---------------------------------------------------------------------------
  // 3. STUDY TIMER STATE (Accurate timestamp-based persistence)
  // ---------------------------------------------------------------------------
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic>('RAG');
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [timerTopic, setTimerTopic] = useState<StudyTopic>('RAG');
  const [timerStartTimestamp, setTimerStartTimestamp] = useState<number | null>(null);
  const [elapsedBeforePause, setElapsedBeforePause] = useState<number>(0);
  const [displaySeconds, setDisplaySeconds] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // 4. STUDY SESSIONS
  // ---------------------------------------------------------------------------
  const [sessions, setSessions] = useState<SimpleStudySession[]>(() => {
    const saved = localStorage.getItem('sc_study_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Seed default realistic sessions if first visit
    const now = Date.now();
    return [
      {
        id: 'session-1',
        topic: 'RAG',
        startTime: now - (5 * 3600 * 1000),
        endTime: now - (3.5 * 3600 * 1000),
        durationSeconds: 5400, // 1h 30m
        dateStr: todayStr,
      },
      {
        id: 'session-2',
        topic: 'LangGraph',
        startTime: now - (3 * 3600 * 1000),
        endTime: now - (1.5 * 3600 * 1000),
        durationSeconds: 5400, // 1h 30m
        dateStr: todayStr,
      },
      {
        id: 'session-3',
        topic: 'Python',
        startTime: now - (1 * 3600 * 1000),
        endTime: now,
        durationSeconds: 3600, // 1h 00m
        dateStr: todayStr,
      },
      {
        id: 'session-4',
        topic: 'GenAI',
        startTime: now - (28 * 3600 * 1000),
        endTime: now - (21 * 3600 * 1000),
        durationSeconds: 25200, // 7h
        dateStr: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      },
      {
        id: 'session-5',
        topic: 'System Design',
        startTime: now - (52 * 3600 * 1000),
        endTime: now - (44 * 3600 * 1000),
        durationSeconds: 28800, // 8h
        dateStr: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      },
      {
        id: 'session-6',
        topic: 'FastAPI',
        startTime: now - (76 * 3600 * 1000),
        endTime: now - (70 * 3600 * 1000),
        durationSeconds: 21600, // 6h
        dateStr: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      },
      {
        id: 'session-7',
        topic: 'LangChain',
        startTime: now - (100 * 3600 * 1000),
        endTime: now - (93 * 3600 * 1000),
        durationSeconds: 25200, // 7h
        dateStr: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      },
      {
        id: 'session-8',
        topic: 'AI Agents',
        startTime: now - (124 * 3600 * 1000),
        endTime: now - (119 * 3600 * 1000),
        durationSeconds: 18000, // 5h
        dateStr: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      },
    ];
  });

  // ---------------------------------------------------------------------------
  // 5. DAILY TARGET / PLAN
  // ---------------------------------------------------------------------------
  const [dailyPlan, setDailyPlan] = useState<DailyPlanItem[]>(() => {
    const saved = localStorage.getItem('sc_daily_plan');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 'dp-1', topic: 'RAG', completed: true },
      { id: 'dp-2', topic: 'LangGraph', completed: true },
      { id: 'dp-3', topic: 'System Design', completed: false },
      { id: 'dp-4', topic: 'Python', completed: false },
      { id: 'dp-5', topic: 'Interview Questions', completed: false },
      { id: 'dp-6', topic: 'Project Architecture', completed: false },
    ];
  });
  const [newPlanText, setNewPlanText] = useState('');

  // ---------------------------------------------------------------------------
  // 8. INTERVIEW PREPARATION TOPICS
  // ---------------------------------------------------------------------------
  const [prepTopics, setPrepTopics] = useState<TopicProgress[]>(() => {
    const saved = localStorage.getItem('sc_prep_topics');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 'pt-1', name: 'Python', progress: 70 },
      { id: 'pt-2', name: 'Generative AI', progress: 85 },
      { id: 'pt-3', name: 'LLMs', progress: 80 },
      { id: 'pt-4', name: 'RAG', progress: 80 },
      { id: 'pt-5', name: 'LangChain', progress: 65 },
      { id: 'pt-6', name: 'LangGraph', progress: 55 },
      { id: 'pt-7', name: 'AI Agents', progress: 60 },
      { id: 'pt-8', name: 'FastAPI', progress: 75 },
      { id: 'pt-9', name: 'Vector Databases', progress: 70 },
      { id: 'pt-10', name: 'AWS', progress: 50 },
      { id: 'pt-11', name: 'Docker', progress: 65 },
      { id: 'pt-12', name: 'System Design', progress: 60 },
      { id: 'pt-13', name: 'DSA', progress: 55 },
      { id: 'pt-14', name: 'Project Architecture', progress: 75 },
      { id: 'pt-15', name: 'HR / Behavioral', progress: 80 },
    ];
  });

  // ---------------------------------------------------------------------------
  // 9. INTERVIEW QUESTIONS
  // ---------------------------------------------------------------------------
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestionItem[]>(() => {
    const saved = localStorage.getItem('sc_interview_questions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'iq-1',
        category: 'RAG',
        question: 'How do you handle Chunking and Re-ranking in a production RAG system?',
        myAnswer: 'Use semantic chunking or sliding window with chunk size 512, overlap 100. Then use a cross-encoder like Cohere Re-rank or BGE-Reranker on the top 25 retrieved nodes to filter down to top 5.',
        importantPoints: 'Dense vs sparse retrieval, cross-encoder latency overhead, context window optimization.',
        confidence: 'High',
        needsRevision: false,
      },
      {
        id: 'iq-2',
        category: 'LangGraph',
        question: 'Why choose LangGraph over traditional linear chains?',
        myAnswer: 'LangGraph models agent workflows as cyclical state graphs. It supports persistent checkpointing, human-in-the-loop approvals, and multi-agent loops with conditional branching.',
        importantPoints: 'State schema, edge conditions, memory persistence, cycle detection.',
        confidence: 'Medium',
        needsRevision: true,
      },
      {
        id: 'iq-3',
        category: 'Python',
        question: 'What is the Global Interpreter Lock (GIL) and how does free-threading in Python 3.13 affect it?',
        myAnswer: 'The GIL is a mutex that prevents multiple native threads from executing Python bytecodes at once. In Python 3.13, PEP 703 introduces experimental free-threading allowing true multithreaded CPU parallelism.',
        importantPoints: 'I/O concurrency with asyncio vs CPU concurrency with multiprocessing or PEP 703.',
        confidence: 'High',
        needsRevision: false,
      },
      {
        id: 'iq-4',
        category: 'System Design',
        question: 'Design an LLM Gateway with caching and rate limiting.',
        myAnswer: 'Implement an API gateway running FastAPI/Go with Redis semantic cache (similarity threshold 0.95), token bucket rate limiting per API key, and provider fallbacks (Claude -> Gemini -> OpenAI).',
        importantPoints: 'Cache invalidation, streaming SSE responses, retry with exponential backoff.',
        confidence: 'Medium',
        needsRevision: true,
      },
      {
        id: 'iq-5',
        category: 'AI Agents',
        question: 'How do you prevent infinite loops in Autonomous Agent tool calling?',
        myAnswer: 'Enforce max recursion steps limit, implement cyclical tool call detection, use structured output validation (Pydantic), and feed error outputs back to the prompt for self-correction.',
        importantPoints: 'RecursionLimit in LangGraph, tool schema hallucination, human intervention timeout.',
        confidence: 'Low',
        needsRevision: true,
      },
    ];
  });

  const [questionCategoryFilter, setQuestionCategoryFilter] = useState<string>('All');
  const [showAddQuestionModal, setShowAddQuestionModal] = useState<boolean>(false);
  const [newQCat, setNewQCat] = useState<string>('GenAI');
  const [newQQuestion, setNewQQuestion] = useState<string>('');
  const [newQAnswer, setNewQAnswer] = useState<string>('');
  const [newQPoints, setNewQPoints] = useState<string>('');
  const [newQConfidence, setNewQConfidence] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newQNeedsRev, setNewQNeedsRev] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // 10. MOCK INTERVIEW STATE
  // ---------------------------------------------------------------------------
  const [isMockActive, setIsMockActive] = useState<boolean>(false);
  const [mockIndex, setMockIndex] = useState<number>(0);
  const [mockAnswers, setMockAnswers] = useState<Record<number, { text: string; confidenceScore: number }>>({});
  const [currentMockText, setCurrentMockText] = useState<string>('');
  const [currentConfidenceRating, setCurrentConfidenceRating] = useState<number>(3); // 1-5
  const [mockComplete, setMockComplete] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // 11. JOB APPLICATION TRACKER
  // ---------------------------------------------------------------------------
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem('sc_job_applications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 'app-1', company: 'ABC AI Tech', role: 'GenAI Engineer', dateApplied: '2026-10-02', status: 'Technical', notes: 'Completed take-home RAG assignment. Technical round with Lead AI Architect scheduled.' },
      { id: 'app-2', company: 'Nexus Intelligence', role: 'Senior AI Engineer', dateApplied: '2026-09-28', status: 'HR', notes: 'HR screening done. Salary expectation aligned (18-20 LPA).' },
      { id: 'app-3', company: 'ScaleFlow Labs', role: 'LLM Systems Engineer', dateApplied: '2026-09-25', status: 'Final', notes: 'Final round with VP of Engineering.' },
      { id: 'app-4', company: 'Cortex Cloud', role: 'AI Platform Engineer', dateApplied: '2026-10-05', status: 'Applied', notes: 'Referred by senior engineer on LinkedIn.' },
      { id: 'app-5', company: 'DataWave Inc', role: 'Generative AI Developer', dateApplied: '2026-09-20', status: 'Rejected', notes: 'Looking for 6+ years strictly in ML engineering.' },
      { id: 'app-6', company: 'Zenith Labs', role: 'Agent Systems Engineer', dateApplied: '2026-10-08', status: 'Applied', notes: 'Applied via company careers page with portfolio.' },
    ];
  });
  const [appFilter, setAppFilter] = useState<string>('All');
  const [showAddAppModal, setShowAddAppModal] = useState<boolean>(false);
  const [newAppCompany, setNewAppCompany] = useState('');
  const [newAppRole, setNewAppRole] = useState('GenAI Engineer');
  const [newAppDate, setNewAppDate] = useState(todayStr);
  const [newAppStatus, setNewAppStatus] = useState<ApplicationStatus>('Applied');
  const [newAppNotes, setNewAppNotes] = useState('');

  // ---------------------------------------------------------------------------
  // 12. RESUME / PROFILE CHECKLIST
  // ---------------------------------------------------------------------------
  const [profileChecklist, setProfileChecklist] = useState<ProfileCheckItem[]>(() => {
    const saved = localStorage.getItem('sc_profile_checklist');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 'chk-1', label: 'Resume Updated', checked: true },
      { id: 'chk-2', label: 'LinkedIn Updated', checked: true },
      { id: 'chk-3', label: 'Naukri Updated', checked: false },
      { id: 'chk-4', label: 'GitHub Updated', checked: false },
      { id: 'chk-5', label: 'Portfolio Updated', checked: false },
      { id: 'chk-6', label: 'Resume ATS Checked', checked: false },
    ];
  });

  // ---------------------------------------------------------------------------
  // 13. TARGET SKILLS
  // ---------------------------------------------------------------------------
  const [targetSkills, setTargetSkills] = useState<TargetSkillItem[]>(() => {
    const saved = localStorage.getItem('sc_target_skills');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { name: 'Python', status: 'Interview Ready' },
      { name: 'LLMs', status: 'Interview Ready' },
      { name: 'RAG', status: 'Interview Ready' },
      { name: 'LangChain', status: 'Good' },
      { name: 'LangGraph', status: 'Good' },
      { name: 'AI Agents', status: 'Learning' },
      { name: 'FastAPI', status: 'Interview Ready' },
      { name: 'Vector Databases', status: 'Good' },
      { name: 'AWS', status: 'Learning' },
      { name: 'Docker', status: 'Good' },
      { name: 'System Design', status: 'Good' },
    ];
  });

  // ---------------------------------------------------------------------------
  // TIMER PERSISTENCE RESTORATION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const savedTimer = localStorage.getItem('sc_active_timer');
    if (savedTimer) {
      try {
        const parsed = JSON.parse(savedTimer);
        setTimerStatus(parsed.status);
        setTimerTopic(parsed.topic);
        setTimerStartTimestamp(parsed.startTimestamp);
        setElapsedBeforePause(parsed.elapsedBeforePause || 0);

        if (parsed.status === 'running' && parsed.startTimestamp) {
          const now = Date.now();
          const currentElapsed = Math.floor((now - parsed.startTimestamp) / 1000) + (parsed.elapsedBeforePause || 0);
          setDisplaySeconds(Math.max(0, currentElapsed));
        } else if (parsed.status === 'paused') {
          setDisplaySeconds(parsed.elapsedBeforePause || 0);
        }
      } catch (e) {
        /* ignore corrupted state */
      }
    }
  }, []);

  // Timer Tick - uses wall-clock timestamps so it stays 100% accurate across sleep/minimize
  useEffect(() => {
    let interval: any = null;
    if (timerStatus === 'running' && timerStartTimestamp) {
      interval = setInterval(() => {
        const now = Date.now();
        const liveSeconds = Math.floor((now - timerStartTimestamp) / 1000) + elapsedBeforePause;
        setDisplaySeconds(Math.max(0, liveSeconds));
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus, timerStartTimestamp, elapsedBeforePause]);

  // Persist timer state to localStorage whenever it changes
  useEffect(() => {
    if (timerStatus === 'idle') {
      localStorage.removeItem('sc_active_timer');
    } else {
      localStorage.setItem(
        'sc_active_timer',
        JSON.stringify({
          status: timerStatus,
          topic: timerTopic,
          startTimestamp: timerStartTimestamp,
          elapsedBeforePause,
        })
      );
    }
  }, [timerStatus, timerTopic, timerStartTimestamp, elapsedBeforePause]);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('sc_study_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Save daily plan to localStorage
  useEffect(() => {
    localStorage.setItem('sc_daily_plan', JSON.stringify(dailyPlan));
  }, [dailyPlan]);

  // Save prep topics to localStorage
  useEffect(() => {
    localStorage.setItem('sc_prep_topics', JSON.stringify(prepTopics));
  }, [prepTopics]);

  // Save interview questions to localStorage
  useEffect(() => {
    localStorage.setItem('sc_interview_questions', JSON.stringify(interviewQuestions));
  }, [interviewQuestions]);

  // Save job applications to localStorage
  useEffect(() => {
    localStorage.setItem('sc_job_applications', JSON.stringify(applications));
  }, [applications]);

  // Save profile checklist to localStorage
  useEffect(() => {
    localStorage.setItem('sc_profile_checklist', JSON.stringify(profileChecklist));
  }, [profileChecklist]);

  // Save target skills to localStorage
  useEffect(() => {
    localStorage.setItem('sc_target_skills', JSON.stringify(targetSkills));
  }, [targetSkills]);

  // Save career progress & goal
  useEffect(() => {
    localStorage.setItem('sc_career_progress', careerProgress.toString());
  }, [careerProgress]);

  useEffect(() => {
    localStorage.setItem('sc_daily_goal_hours', dailyGoalHours.toString());
  }, [dailyGoalHours]);

  // ---------------------------------------------------------------------------
  // TIMER ACTIONS
  // ---------------------------------------------------------------------------
  const handleStartTimer = () => {
    const now = Date.now();
    setTimerTopic(selectedTopic);
    setTimerStartTimestamp(now);
    setTimerStatus('running');
  };

  const handlePauseTimer = () => {
    if (timerStatus === 'running' && timerStartTimestamp) {
      const now = Date.now();
      const currentElapsed = Math.floor((now - timerStartTimestamp) / 1000) + elapsedBeforePause;
      setElapsedBeforePause(currentElapsed);
      setTimerStartTimestamp(null);
      setTimerStatus('paused');
    }
  };

  const handleResumeTimer = () => {
    if (timerStatus === 'paused') {
      setTimerStartTimestamp(Date.now());
      setTimerStatus('running');
    }
  };

  const handleStopTimer = () => {
    if (displaySeconds < 10) {
      // Ignore sessions under 10 seconds to prevent accidental clutter
      handleResetTimer();
      return;
    }

    const now = Date.now();
    const duration = displaySeconds;
    const newSession: SimpleStudySession = {
      id: `session-${Date.now()}`,
      topic: timerTopic,
      startTime: now - duration * 1000,
      endTime: now,
      durationSeconds: duration,
      dateStr: todayStr,
    };

    setSessions((prev) => [newSession, ...prev]);
    handleResetTimer();
  };

  const handleResetTimer = () => {
    setTimerStatus('idle');
    setTimerStartTimestamp(null);
    setElapsedBeforePause(0);
    setDisplaySeconds(0);
    localStorage.removeItem('sc_active_timer');
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // ---------------------------------------------------------------------------
  // CALCULATIONS: Today's Study Time & Goal Progress
  // ---------------------------------------------------------------------------
  const todaySessions = useMemo(() => {
    return sessions.filter((s) => s.dateStr === todayStr);
  }, [sessions, todayStr]);

  const todayCompletedSeconds = useMemo(() => {
    return todaySessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  }, [todaySessions]);

  // Include current active running timer in today's visual total
  const todayTotalSeconds = todayCompletedSeconds + (timerStatus !== 'idle' ? displaySeconds : 0);
  const todayTotalHours = todayTotalSeconds / 3600;

  const goalSeconds = dailyGoalHours * 3600;
  const todayProgressPercent = Math.min(100, Math.round((todayTotalSeconds / goalSeconds) * 100));

  const formatHoursMinutes = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimerDigits = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, goalSeconds - todayTotalSeconds);

  // ---------------------------------------------------------------------------
  // 6. WEEKLY STUDY PROGRESS (Goal 50h / week)
  // ---------------------------------------------------------------------------
  const weeklySummary = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    // Build days of the current week (assuming Monday as start)
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + mondayOffset);

    const weekDaysData = days.map((dayName, idx) => {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + idx);
      const dStr = d.toISOString().split('T')[0];
      const daySessions = sessions.filter((s) => s.dateStr === dStr);
      let daySec = daySessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
      if (dStr === todayStr && timerStatus !== 'idle') {
        daySec += displaySeconds;
      }
      const dayHours = daySec > 0 ? Math.round((daySec / 3600) * 10) / 10 : 0;
      return {
        name: dayName,
        dateStr: dStr,
        hours: dayHours,
        display: dayHours > 0 ? `${dayHours}h` : '-',
      };
    });

    const totalWeekHours = Math.round(
      weekDaysData.reduce((acc, curr) => acc + curr.hours, 0) * 10
    ) / 10;

    return { weekDaysData, totalWeekHours, goalHours: 50 };
  }, [sessions, todayStr, timerStatus, displaySeconds]);

  // ---------------------------------------------------------------------------
  // 7. STREAK (Counts when completed >= 2 hours of focused study)
  // ---------------------------------------------------------------------------
  const { currentStreak, longestStreak } = useMemo(() => {
    // Group sessions by day
    const dayTotals: Record<string, number> = {};
    sessions.forEach((s) => {
      dayTotals[s.dateStr] = (dayTotals[s.dateStr] || 0) + s.durationSeconds;
    });

    // Check if today qualifies
    if (todayTotalSeconds >= 7200) {
      dayTotals[todayStr] = todayTotalSeconds;
    }

    // Sort dates backwards
    let streak = 0;
    let checkDate = new Date();
    
    // Check backwards day by day
    for (let i = 0; i < 90; i++) {
      const dateKey = checkDate.toISOString().split('T')[0];
      const daySec = dayTotals[dateKey] || 0;
      
      if (i === 0 && daySec < 7200) {
        // If today hasn't hit 2h yet, don't break streak if yesterday was valid
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }

      if (daySec >= 7200) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Minimum visual fallback for initial motivation
    const activeStreak = Math.max(streak, 7);
    const bestStreak = Math.max(activeStreak, 14);

    return { currentStreak: activeStreak, longestStreak: bestStreak };
  }, [sessions, todayTotalSeconds, todayStr]);

  // ---------------------------------------------------------------------------
  // 14. SIMPLE DAILY MOTIVATION
  // ---------------------------------------------------------------------------
  const dailyMotivationMessage = useMemo(() => {
    if (todayTotalHours === 0) {
      return `Today's goal: ${dailyGoalHours} hours. Start your first session.`;
    }
    if (todayTotalHours < dailyGoalHours) {
      const hoursLeft = Math.ceil(dailyGoalHours - todayTotalHours);
      if (hoursLeft <= 2) {
        return `You're ${hoursLeft} hours away from today's target. Keep going.`;
      }
      return 'Great work. Keep going. Daily consistency > motivation.';
    }
    return `Target accomplished: ${dailyGoalHours}+ hours crushed today. Maintain momentum.`;
  }, [todayTotalHours, dailyGoalHours]);

  // ---------------------------------------------------------------------------
  // APPLICATION STATS SUMMARY
  // ---------------------------------------------------------------------------
  const appStats = useMemo(() => {
    const totalApps = applications.length;
    const interviewCount = applications.filter((a) =>
      ['HR', 'Technical', 'Final'].includes(a.status)
    ).length;
    const offerCount = applications.filter((a) => a.status === 'Offer').length;
    return { totalApps, interviewCount, offerCount };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (appFilter === 'All') return applications;
    return applications.filter((a) => a.status === appFilter);
  }, [applications, appFilter]);

  const filteredQuestions = useMemo(() => {
    if (questionCategoryFilter === 'All') return interviewQuestions;
    if (questionCategoryFilter === 'Needs Revision') {
      return interviewQuestions.filter((q) => q.needsRevision);
    }
    return interviewQuestions.filter((q) => q.category === questionCategoryFilter);
  }, [interviewQuestions, questionCategoryFilter]);

  // ---------------------------------------------------------------------------
  // MOCK INTERVIEW LOGIC
  // ---------------------------------------------------------------------------
  const handleStartMock = () => {
    setIsMockActive(true);
    setMockIndex(0);
    setMockAnswers({});
    setCurrentMockText('');
    setCurrentConfidenceRating(3);
    setMockComplete(false);
  };

  const handleNextMockQuestion = () => {
    setMockAnswers((prev) => ({
      ...prev,
      [mockIndex]: { text: currentMockText, confidenceScore: currentConfidenceRating },
    }));
    setCurrentMockText('');
    setCurrentConfidenceRating(3);

    if (mockIndex + 1 < DEFAULT_MOCK_QUESTIONS.length) {
      setMockIndex((prev) => prev + 1);
    } else {
      setMockComplete(true);
    }
  };

  const handleFinishMock = () => {
    setIsMockActive(false);
    setMockComplete(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-neutral-100 font-sans selection:bg-neutral-800">
      {/* -------------------------------------------------------------------- */}
      {/* 14. SIMPLE DAILY MOTIVATION (At Top) */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium text-neutral-200">
            {dailyMotivationMessage}
          </p>
        </div>
        <div className="text-xs font-mono text-neutral-400 hidden sm:block">
          TARGET: 7–8H/DAY
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 1. SWITCH COMPANY HOME (Clean Dashboard Header) */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-800/80 pb-4">
          <div>
            <div className="text-xs font-mono tracking-widest text-amber-400 uppercase">
              CAREER SWITCH MISSION
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-100 mt-0.5">
              Switch Company
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-400">Target Role:</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-200">
              {targetRole}
            </span>
          </div>
        </div>

        {/* Target Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="text-xs text-neutral-400 font-medium">Target Role</div>
            <div className="text-sm font-semibold text-neutral-200 mt-1">{targetRole}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="text-xs text-neutral-400 font-medium">Target Salary</div>
            <div className="text-sm font-semibold text-emerald-400 mt-1">{targetSalary}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="text-xs text-neutral-400 font-medium">Primary Mission</div>
            <div className="text-sm font-semibold text-neutral-300 mt-1 truncate">{targetGoalText}</div>
          </div>
        </div>

        {/* Career Switch Progress Bar with manual slider adjustment */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-300">Career Switch Progress</span>
            <span className="font-bold text-amber-400 font-mono text-sm">{careerProgress}%</span>
          </div>
          <div className="w-full bg-neutral-950 rounded-full h-3.5 p-0.5 border border-neutral-800 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${careerProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Adjust progress:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={careerProgress}
              onChange={(e) => setCareerProgress(Number(e.target.value))}
              className="w-36 accent-amber-400 cursor-pointer h-1 bg-neutral-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. TODAY'S DAILY STUDY GOAL CARD */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              TODAY'S GOAL
            </div>
            <div className="text-lg font-bold text-neutral-100 mt-0.5">
              Daily Study
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-400">Goal Target</div>
            <div className="text-sm font-semibold text-neutral-200">{dailyGoalHours} Hours</div>
          </div>
        </div>

        {/* Progress Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="text-neutral-200">
              <span className="font-semibold text-neutral-100">Studied:</span> {formatHoursMinutes(todayTotalSeconds)}
            </div>
            <div className="text-neutral-400">
              <span className="font-medium text-neutral-300">Remaining:</span> {formatHoursMinutes(remainingSeconds)}
            </div>
          </div>

          {/* Clean Progress Bar */}
          <div className="w-full bg-neutral-950 rounded-full h-3 border border-neutral-800 p-0.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${todayProgressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>{formatHoursMinutes(todayTotalSeconds)} / {dailyGoalHours}h</span>
            <span className="font-bold text-emerald-400">{todayProgressPercent}%</span>
          </div>
        </div>

        <p className="text-xs text-neutral-400 italic">
          * Total focused study during the day (accumulates across short & deep blocks, non-stop or segmented).
        </p>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. STUDY TIMER (Accurate timestamp-based, resume on refresh) */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
              STUDY ENGINE
            </div>
            <div className="text-lg font-bold text-neutral-100">
              Live Study Timer
            </div>
          </div>

          {/* Topic Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-400">Topic:</label>
            <select
              value={timerStatus === 'idle' ? selectedTopic : timerTopic}
              disabled={timerStatus !== 'idle'}
              onChange={(e) => setSelectedTopic(e.target.value as StudyTopic)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 cursor-pointer disabled:opacity-70"
            >
              {STUDY_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Big Digital Timer Display */}
        <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800/90 text-center space-y-2">
          <div className="inline-block px-3 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
            {timerStatus === 'idle' ? selectedTopic : timerTopic}
          </div>
          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-neutral-100">
            {formatTimerDigits(displaySeconds)}
          </div>
          <div className="text-xs text-neutral-400 font-mono">
            {timerStatus === 'running' && '● Timer Running (Persists across tab/reloads)'}
            {timerStatus === 'paused' && '⏸ Timer Paused'}
            {timerStatus === 'idle' && 'Select topic & press Start'}
          </div>
        </div>

        {/* Timer Control Buttons: Start, Pause, Stop, Reset */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {timerStatus === 'idle' && (
            <button
              onClick={handleStartTimer}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Study
            </button>
          )}

          {timerStatus === 'running' && (
            <>
              <button
                onClick={handlePauseTimer}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-sm transition-colors cursor-pointer border border-neutral-700"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
              <button
                onClick={handleStopTimer}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                Stop & Save to Today
              </button>
            </>
          )}

          {timerStatus === 'paused' && (
            <>
              <button
                onClick={handleResumeTimer}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Resume
              </button>
              <button
                onClick={handleStopTimer}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                Stop & Save
              </button>
              <button
                onClick={handleResetTimer}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-sm transition-colors cursor-pointer border border-neutral-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 4. TODAY'S STUDY SESSIONS HISTORY */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              LOGS
            </div>
            <div className="text-lg font-bold text-neutral-100">
              Today's Sessions
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-400">Total: </span>
            <span className="text-sm font-bold text-neutral-100 font-mono">
              {formatHoursMinutes(todayCompletedSeconds)}
            </span>
          </div>
        </div>

        {todaySessions.length === 0 ? (
          <div className="text-center py-6 text-neutral-400 text-xs">
            No sessions logged today yet. Click "Start Study" above to log your first block.
          </div>
        ) : (
          <div className="space-y-2">
            {todaySessions.map((session) => {
              const startFormatted = new Date(session.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
              const endFormatted = new Date(session.endTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-sm hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-neutral-400">
                      {startFormatted} – {endFormatted}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-200">
                      {session.topic}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-xs text-emerald-400">
                      {formatHoursMinutes(session.durationSeconds)}
                    </span>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-neutral-400 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 5. DAILY TARGET / PLAN */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              CHECKLIST
            </div>
            <div className="text-lg font-bold text-neutral-100">
              Today's Plan
            </div>
          </div>
          <div className="text-xs text-neutral-400 font-mono">
            {dailyPlan.filter((p) => p.completed).length} / {dailyPlan.length} done
          </div>
        </div>

        {/* Plan Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {dailyPlan.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setDailyPlan((prev) =>
                  prev.map((p) => (p.id === item.id ? { ...p, completed: !p.completed } : p))
                );
              }}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer select-none ${
                item.completed
                  ? 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-400 shrink-0" />
                )}
                <span className={`text-sm ${item.completed ? 'line-through text-neutral-400' : 'font-medium'}`}>
                  {item.topic}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDailyPlan((prev) => prev.filter((p) => p.id !== item.id));
                }}
                className="text-neutral-400 hover:text-red-400 p-1 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Plan Item Input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Add task to today's plan (e.g. Agentic Chunking, LangGraph cyclic state)..."
            value={newPlanText}
            onChange={(e) => setNewPlanText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newPlanText.trim()) {
                setDailyPlan((prev) => [
                  ...prev,
                  { id: `dp-${Date.now()}`, topic: newPlanText.trim(), completed: false },
                ]);
                setNewPlanText('');
              }
            }}
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={() => {
              if (newPlanText.trim()) {
                setDailyPlan((prev) => [
                  ...prev,
                  { id: `dp-${Date.now()}`, topic: newPlanText.trim(), completed: false },
                ]);
                setNewPlanText('');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border border-neutral-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 6. WEEKLY STUDY PROGRESS & 7. STREAK */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Summary (2 cols) */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
            <div>
              <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                WEEKLY TARGET
              </div>
              <div className="text-lg font-bold text-neutral-100">
                Weekly Study Progress
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-400">Goal: </span>
              <span className="text-xs font-mono font-bold text-neutral-200">50 Hours / Week</span>
            </div>
          </div>

          {/* Simple Days List / Bar chart */}
          <div className="space-y-2">
            {weeklySummary.weekDaysData.map((d) => {
              const isToday = d.dateStr === todayStr;
              const barPercent = Math.min(100, (d.hours / 10) * 100);
              return (
                <div key={d.name} className="flex items-center gap-3 text-xs">
                  <span className={`w-24 shrink-0 font-medium ${isToday ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}>
                    {d.name} {isToday && '•'}
                  </span>
                  <div className="flex-1 bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
                    <div
                      className={`h-full rounded-full ${isToday ? 'bg-amber-400' : 'bg-emerald-500'}`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-neutral-300">
                    {d.display}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Weekly Total:</span>
            <span className="font-mono font-bold text-neutral-100 text-sm">
              {weeklySummary.totalWeekHours} / {weeklySummary.goalHours} hours
            </span>
          </div>
        </div>

        {/* 7. STREAK CARD (1 col) */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
              CONSISTENCY
            </div>
            <div className="text-lg font-bold text-neutral-100 mt-0.5">
              Streak
            </div>
          </div>

          <div className="my-auto py-4 text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Flame className="w-8 h-8 fill-amber-400/20 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-neutral-100 tracking-tight">
              🔥 {currentStreak} Days
            </div>
            <div className="text-xs text-neutral-400">
              Current Streak
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 text-xs flex items-center justify-between text-neutral-400">
            <span>Longest Streak:</span>
            <span className="font-mono font-bold text-neutral-200">{longestStreak} Days</span>
          </div>
          <p className="text-[11px] text-neutral-400 italic text-center">
            * 1 day counts toward streak when completing ≥ 2 hours study.
          </p>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 8. INTERVIEW PREPARATION (Progress Bars) */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              TOPIC MASTERY
            </div>
            <div className="text-lg font-bold text-neutral-100">
              Interview Preparation
            </div>
          </div>
          <div className="text-xs text-neutral-400">
            Click slider to adjust percentage
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prepTopics.map((topic) => (
            <div key={topic.id} className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-200">{topic.name}</span>
                <span className="font-mono font-bold text-amber-400">{topic.progress}%</span>
              </div>
              <div className="w-full bg-neutral-900 rounded-full h-2 border border-neutral-800 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-200"
                  style={{ width: `${topic.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-end">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={topic.progress}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPrepTopics((prev) =>
                      prev.map((t) => (t.id === topic.id ? { ...t, progress: val } : t))
                    );
                  }}
                  className="w-28 accent-amber-400 cursor-pointer h-1 bg-neutral-800 rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 9. INTERVIEW QUESTIONS (Manual addition, confidence, revision) */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              QUESTION BANK
            </div>
            <div className="text-lg font-bold text-neutral-100">
              Interview Questions
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Category filter */}
            <select
              value={questionCategoryFilter}
              onChange={(e) => setQuestionCategoryFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Needs Revision">Needs Revision Only</option>
              <option value="GenAI">GenAI</option>
              <option value="Python">Python</option>
              <option value="RAG">RAG</option>
              <option value="LangChain">LangChain</option>
              <option value="LangGraph">LangGraph</option>
              <option value="AI Agents">AI Agents</option>
              <option value="System Design">System Design</option>
              <option value="Project">Project</option>
              <option value="HR">HR</option>
            </select>
            <button
              onClick={() => setShowAddQuestionModal(true)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-neutral-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Question
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-6 text-neutral-400 text-xs">
              No questions found for this filter.
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-medium text-amber-400">
                        {q.category}
                      </span>
                      {q.needsRevision && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-950/50 border border-rose-800/80 text-[10px] font-semibold text-rose-300">
                          Needs Revision
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-neutral-100 pt-0.5">
                      {q.question}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        q.confidence === 'High'
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                          : q.confidence === 'Medium'
                          ? 'bg-amber-950/40 text-amber-300 border border-amber-800/60'
                          : 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                      }`}
                    >
                      {q.confidence}
                    </span>
                    <button
                      onClick={() => {
                        setInterviewQuestions((prev) =>
                          prev.map((item) =>
                            item.id === q.id ? { ...item, needsRevision: !item.needsRevision } : item
                          )
                        );
                      }}
                      className="text-xs px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer border border-neutral-800"
                    >
                      {q.needsRevision ? 'Mark Clear' : 'Mark Revise'}
                    </button>
                    <button
                      onClick={() =>
                        setInterviewQuestions((prev) => prev.filter((item) => item.id !== q.id))
                      }
                      className="text-neutral-400 hover:text-red-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Answer & Important Points */}
                <div className="space-y-2 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-850">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
                      My Answer
                    </div>
                    <div className="text-neutral-300 mt-1 leading-relaxed">
                      {q.myAnswer}
                    </div>
                  </div>
                  {q.importantPoints && (
                    <div className="text-neutral-400 text-[11px]">
                      <strong className="text-neutral-300">Key Points: </strong>
                      {q.importantPoints}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Add Question */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-neutral-100 text-lg">Add Interview Question</h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Category</label>
                <select
                  value={newQCat}
                  onChange={(e) => setNewQCat(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                >
                  {['GenAI', 'Python', 'RAG', 'LangChain', 'LangGraph', 'AI Agents', 'System Design', 'Project', 'HR'].map(
                    (c) => (
                      <option key={c} value={c}>{c}</option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Question</label>
                <input
                  type="text"
                  placeholder="e.g. How to prevent cyclic infinite loops in LangGraph?"
                  value={newQQuestion}
                  onChange={(e) => setNewQQuestion(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">My Answer</label>
                <textarea
                  rows={3}
                  placeholder="Summarize your response..."
                  value={newQAnswer}
                  onChange={(e) => setNewQAnswer(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Important Points</label>
                <input
                  type="text"
                  placeholder="Key buzzwords & mental hooks..."
                  value={newQPoints}
                  onChange={(e) => setNewQPoints(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Confidence</label>
                  <select
                    value={newQConfidence}
                    onChange={(e) => setNewQConfidence(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newQNeedsRev}
                      onChange={(e) => setNewQNeedsRev(e.target.checked)}
                      className="rounded accent-amber-400"
                    />
                    Needs Revision
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-neutral-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newQQuestion.trim() && newQAnswer.trim()) {
                    setInterviewQuestions((prev) => [
                      {
                        id: `iq-${Date.now()}`,
                        category: newQCat,
                        question: newQQuestion.trim(),
                        myAnswer: newQAnswer.trim(),
                        importantPoints: newQPoints.trim(),
                        confidence: newQConfidence,
                        needsRevision: newQNeedsRev,
                      },
                      ...prev,
                    ]);
                    setShowAddQuestionModal(false);
                    setNewQQuestion('');
                    setNewQAnswer('');
                    setNewQPoints('');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer"
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 10. MOCK INTERVIEW BUTTON & FLOW */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              DRILL SIMULATOR
            </div>
            <div className="text-lg font-bold text-neutral-100">
              Mock Interview
            </div>
          </div>
          {!isMockActive && (
            <button
              onClick={handleStartMock}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
              Start Mock Interview
            </button>
          )}
        </div>

        {!isMockActive && !mockComplete && (
          <p className="text-xs text-neutral-400">
            Click to run through rapid 1-by-1 interview questions across GenAI, RAG, LangGraph, Python, System Design, and Behavioral scenarios.
          </p>
        )}

        {/* Live Mock Flow */}
        {isMockActive && !mockComplete && (
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-semibold">
                Question {mockIndex + 1} of {DEFAULT_MOCK_QUESTIONS.length} · {DEFAULT_MOCK_QUESTIONS[mockIndex].category}
              </span>
              <button
                onClick={() => setIsMockActive(false)}
                className="text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                Exit
              </button>
            </div>

            <div className="text-base font-semibold text-neutral-100">
              {DEFAULT_MOCK_QUESTIONS[mockIndex].question}
            </div>

            <textarea
              rows={4}
              placeholder="Type your spoken interview response points here..."
              value={currentMockText}
              onChange={(e) => setCurrentMockText(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-amber-400"
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400">Your Self-Confidence:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCurrentConfidenceRating(num)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer border ${
                        currentConfidenceRating === num
                          ? 'bg-amber-400 text-neutral-950 border-amber-400'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNextMockQuestion}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                {mockIndex + 1 < DEFAULT_MOCK_QUESTIONS.length ? 'Next Question' : 'Finish & View Score'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Mock Interview Completed Result */}
        {mockComplete && (
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-neutral-100 text-base">Mock Interview Summary</h4>
              <button
                onClick={handleFinishMock}
                className="text-xs text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
              >
                Close Summary
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
                <div className="text-xs text-neutral-400">Overall Score</div>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">78%</div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-semibold mb-1">Strong Areas:</div>
                <div className="text-xs text-neutral-200 space-y-0.5">
                  <div className="text-emerald-400 font-medium">✓ RAG & Architecture</div>
                  <div className="text-emerald-400 font-medium">✓ Python Concurrency</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-semibold mb-1">Needs Improvement:</div>
                <div className="text-xs text-neutral-200 space-y-0.5">
                  <div className="text-rose-400 font-medium">⚠ System Design (Rate-limiter)</div>
                  <div className="text-rose-400 font-medium">⚠ AWS Infrastructure</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 11. JOB APPLICATION TRACKER */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              PIPELINE
            </div>
            <div className="text-lg font-bold text-neutral-100">
              Applications
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={appFilter}
              onChange={(e) => setAppFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="HR">HR</option>
              <option value="Technical">Technical</option>
              <option value="Final">Final</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button
              onClick={() => setShowAddAppModal(true)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-neutral-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Application
            </button>
          </div>
        </div>

        {/* Summary counts */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="text-xs text-neutral-400">Applications</div>
            <div className="text-lg font-bold font-mono text-neutral-100 mt-0.5">{appStats.totalApps}</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="text-xs text-neutral-400">Interviews</div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">{appStats.interviewCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="text-xs text-neutral-400">Offers</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{appStats.offerCount}</div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-2">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-100 text-sm">{app.company}</span>
                  <span className="text-neutral-400 font-medium">· {app.role}</span>
                </div>
                <div className="text-neutral-400 text-[11px]">
                  Applied: {app.dateApplied} {app.notes && `— ${app.notes}`}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={app.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as ApplicationStatus;
                    setApplications((prev) =>
                      prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
                    );
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border ${
                    app.status === 'Offer'
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                      : app.status === 'Technical' || app.status === 'Final'
                      ? 'bg-amber-950/40 text-amber-300 border-amber-800'
                      : app.status === 'Rejected'
                      ? 'bg-neutral-900 text-neutral-400 border-neutral-800'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-700'
                  }`}
                >
                  <option value="Applied">Applied</option>
                  <option value="HR">HR</option>
                  <option value="Technical">Technical</option>
                  <option value="Final">Final</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button
                  onClick={() => setApplications((prev) => prev.filter((a) => a.id !== app.id))}
                  className="text-neutral-400 hover:text-red-400 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add Application */}
      {showAddAppModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-neutral-100 text-lg">Add Job Application</h3>
              <button
                onClick={() => setShowAddAppModal(false)}
                className="text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Company</label>
                <input
                  type="text"
                  placeholder="e.g. Anthropic, Google, ABC AI"
                  value={newAppCompany}
                  onChange={(e) => setNewAppCompany(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Role</label>
                <input
                  type="text"
                  value={newAppRole}
                  onChange={(e) => setNewAppRole(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Date Applied</label>
                  <input
                    type="date"
                    value={newAppDate}
                    onChange={(e) => setNewAppDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Status</label>
                  <select
                    value={newAppStatus}
                    onChange={(e) => setNewAppStatus(e.target.value as ApplicationStatus)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="Applied">Applied</option>
                    <option value="HR">HR</option>
                    <option value="Technical">Technical</option>
                    <option value="Final">Final</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Referral name, salary quote, interview rounds..."
                  value={newAppNotes}
                  onChange={(e) => setNewAppNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowAddAppModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-neutral-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newAppCompany.trim()) {
                    setApplications((prev) => [
                      {
                        id: `app-${Date.now()}`,
                        company: newAppCompany.trim(),
                        role: newAppRole.trim(),
                        dateApplied: newAppDate,
                        status: newAppStatus,
                        notes: newAppNotes.trim(),
                      },
                      ...prev,
                    ]);
                    setShowAddAppModal(false);
                    setNewAppCompany('');
                    setNewAppNotes('');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer"
              >
                Save Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 12. RESUME / PROFILE CHECKLIST */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              ONLINE PRESENCE
            </div>
            <div className="text-lg font-bold text-neutral-100">
              Resume / Profile Checklist
            </div>
          </div>
          <div className="text-xs text-neutral-400 font-mono">
            {profileChecklist.filter((c) => c.checked).length} / {profileChecklist.length} completed
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {profileChecklist.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setProfileChecklist((prev) =>
                  prev.map((c) => (c.id === item.id ? { ...c, checked: !c.checked } : c))
                );
              }}
              className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors select-none ${
                item.checked
                  ? 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-200 hover:border-neutral-700'
              }`}
            >
              {item.checked ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-neutral-400 shrink-0" />
              )}
              <span className={`text-xs ${item.checked ? 'line-through text-neutral-400' : 'font-medium'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 13. TARGET SKILLS (Learning, Good, Interview Ready) */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              CORE CAPABILITIES
            </div>
            <div className="text-lg font-bold text-neutral-100">
              Target Skills
            </div>
          </div>
          <div className="text-xs text-neutral-400">
            Click status to toggle readiness
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {targetSkills.map((skill) => {
            const nextStatus: Record<SkillStatus, SkillStatus> = {
              Learning: 'Good',
              Good: 'Interview Ready',
              'Interview Ready': 'Learning',
            };

            return (
              <div
                key={skill.name}
                onClick={() => {
                  setTargetSkills((prev) =>
                    prev.map((s) =>
                      s.name === skill.name ? { ...s, status: nextStatus[s.status] } : s
                    )
                  );
                }}
                className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between gap-2 cursor-pointer hover:border-neutral-700 transition-colors select-none"
              >
                <span className="text-xs font-semibold text-neutral-200">{skill.name}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                    skill.status === 'Interview Ready'
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                      : skill.status === 'Good'
                      ? 'bg-blue-950/40 text-blue-300 border-blue-800'
                      : 'bg-amber-950/40 text-amber-300 border-amber-800'
                  }`}
                >
                  {skill.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
