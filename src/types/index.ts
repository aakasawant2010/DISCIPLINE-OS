export type ReflectionMode = 'normal' | 'brutal';

export interface ScoreExplanation {
  score: number;
  reason: string;
}

export interface DayScores {
  discipline: ScoreExplanation;
  focus: ScoreExplanation;
  health: ScoreExplanation;
  relationships: ScoreExplanation;
  personalGrowth: ScoreExplanation;
  learning: ScoreExplanation;
  mood: ScoreExplanation;
  overall: ScoreExplanation;
}

export interface TomorrowPlan {
  oneThingToWin: string;
  nonNegotiables: [string, string, string];
  oneThingToStop: string;
  oneThingToStart: string;
  onePersonToConnect: string;
  onePromiseToYourself: string;
}

export interface DayVerdict {
  summary: string;
  win: string;
  miss: string;
  pattern: string;
  blindSpot: string;
  emotionalState: string;
  scores: DayScores;
  tomorrowPlan: TomorrowPlan;
}

export interface ReflectionAnswers {
  // Morning / Intention
  intentionPerson: string;
  priorities: string;
  derailmentRisk: string;
  
  // Day Review
  accomplishments: string;
  avoided: string;
  wastedTime: string;
  focusPeak: string;
  distractions: string;
  actionsMatched: string;
  
  // Body
  sleepQuality: number; // 1-10
  sleepHours: number;
  exerciseDone: boolean;
  exerciseDetails: string;
  nutrition: string;
  energyLevel: number; // 1-10
  
  // Mind
  dominantEmotion: string;
  recurringThought: string;
  stressSource: string;
  joySource: string;
  
  // Relationships
  treatedPeopleWell: string;
  relationshipAction: string;
  
  // Self-Honesty
  selfHonestyPrompt: string;
  selfHonestyAnswer: string;
  
  // Daily Biometrics (Manual entry for recovery & sleep percentage)
  biometrics?: {
    recoveryPercentage?: number;
    sleepPercentage?: number;
    sleepHours?: number;
  };
  
  // Identity evidence
  identityEvidence: { identity: string; proof: string }[];
}

export interface DailyBiometrics {
  date: string;
  recoveryPercentage: number; // 0-100%
  sleepPercentage: number;    // 0-100%
  sleepHours?: number;
}

export interface DailyReflection {
  id: string;
  date: string; // YYYY-MM-DD
  completedAt: string;
  mode: ReflectionMode;
  answers: ReflectionAnswers;
  verdict: DayVerdict;
}

export interface DetectedPattern {
  id: string;
  pattern: string;
  evidence: string;
  frequency: string;
  impact: string;
  suggestedIntervention: string;
  identifiedAt: string;
}

export interface WeeklyReview {
  id: string;
  weekLabel: string;
  dateRange: string;
  bestDay: string;
  worstDay: string;
  averageScore: number;
  biggestWin: string;
  biggestMistake: string;
  mostCommonDistraction: string;
  mostProductiveBehavior: string;
  trends: {
    emotional: string;
    fitness: string;
    learning: string;
    sleep: string;
    discipline: string;
  };
  keep: string[];
  stop: string[];
  start: string[];
  oneBigGoal: string;
}

export interface MonthlyAudit {
  id: string;
  monthLabel: string;
  comparison: {
    disciplineChange: number;
    fitnessChange: number;
    focusChange: number;
    overallChange: number;
  };
  whatImproved: string[];
  whatDeclined: string[];
  whatRepeated: string[];
  whatYouAreAvoiding: string[];
  doubleDownOn: string[];
  letGoOf: string[];
  twelveMonthProjection: string;
}

export interface TheMirrorData {
  whoYouSayYouWantToBe: string;
  whoYourActionsSayYouAre: string;
  theGap: string;
  strongestTrait: string;
  biggestPattern: string;
  biggestBlindSpot: string;
  whatYouShouldDoNext: [string, string, string];
  closingQuote: string;
  generatedAt: string;
}

export interface FutureMeGoals {
  oneYearGoal: string;
  threeYearGoal: string;
  careerGoal: string;
  fitnessGoal: string;
  financialGoal: string;
  relationshipGoal: string;
  identityGoal: string;
  alignmentScore: number;
  status: 'ALIGNED' | 'DRIFTING' | 'AT RISK';
  analysis: string;
}

export interface MemoryItem {
  id: string;
  category: 'goal' | 'project' | 'habit' | 'preference' | 'commitment' | 'challenge' | 'achievement';
  content: string;
  createdAt: string;
}

export interface StreakData {
  reflectionStreak: number;
  workoutStreak: number;
  learningStreak: number;
  sleepConsistencyStreak: number;
  noSocialMediaStreak: number;
  deepWorkStreak: number;
}

export interface UserProfile {
  name: string;
  mode: ReflectionMode;
  selectedIdentities: string[];
  isDemoData: boolean;
}

export interface DailyProgressVideo {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  notes?: string;
  durationSeconds: number;
  videoUrl: string;
  blob?: Blob;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export type NavigationTab = 
  | 'home' 
  | 'reflect' 
  | 'chat'
  | 'video'
  | 'mirror' 
  | 'insights' 
  | 'life' 
  | 'future' 
  | 'history' 
  | 'settings';
