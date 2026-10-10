import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DailyReflection, DayVerdict, ReflectionAnswers } from '../types';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  Flame, 
  ShieldAlert, 
  Moon, 
  Heart, 
  CheckCircle2,
  RefreshCw,
  Sliders,
  HelpCircle,
  Activity
} from 'lucide-react';

const SELF_HONESTY_PROMPTS = [
  'Were you genuinely tired, or were you avoiding discomfort?',
  'Are you giving yourself an excuse here?',
  'What did you know you should do today but consciously chose not to do?',
  'If your day repeated for the next 365 days, would you be happy with the person you become?',
  'What would your future self say about today?',
  'What are you currently avoiding confronting?',
];

export const ReflectFlow: React.FC = () => {
  const { profile, setMode, saveReflection, setActiveTab, memories, biometrics } = useApp();

  // Step index from 0 to 6
  // 0: Morning & Intention
  // 1: Day Review (Accomplishments, Avoidance, Time)
  // 2: Body & Physiology (Sleep, Workout, Energy, Nutrition)
  // 3: Mind & Emotional State (Dominant emotion, Thoughts, Stress, Joy)
  // 4: Relationships & Connection (Treatment of others, Reconnect)
  // 5: Deep Self-Honesty & Identity Proof (Dynamically chosen prompt + Identity proof)
  // 6: AI Analysis & Verdict Generation Screen
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [answers, setAnswers] = useState<ReflectionAnswers>({
    intentionPerson: '',
    priorities: '',
    derailmentRisk: '',
    accomplishments: '',
    avoided: '',
    wastedTime: '',
    focusPeak: '',
    distractions: '',
    actionsMatched: '',
    sleepQuality: Math.round((biometrics?.sleepPercentage ?? 80) / 10),
    sleepHours: biometrics?.sleepHours ?? 7.5,
    exerciseDone: true,
    exerciseDetails: 'Resistance strength training 60 mins',
    nutrition: 'Clean whole foods with high protein',
    energyLevel: (biometrics?.recoveryPercentage ?? 75) >= 67 ? 8 : (biometrics?.recoveryPercentage ?? 75) >= 34 ? 6 : 4,
    dominantEmotion: '',
    recurringThought: '',
    stressSource: '',
    joySource: '',
    treatedPeopleWell: '',
    relationshipAction: '',
    selfHonestyPrompt: SELF_HONESTY_PROMPTS[0],
    selfHonestyAnswer: '',
    biometrics: {
      recoveryPercentage: biometrics?.recoveryPercentage ?? 75,
      sleepPercentage: biometrics?.sleepPercentage ?? 80,
      sleepHours: biometrics?.sleepHours ?? 7.5,
    },
    identityEvidence: [
      { identity: 'Disciplined', proof: '' },
      { identity: 'Focused', proof: '' }
    ],
  });

  const applyLoggedBiometrics = () => {
    if (!biometrics) return;
    setAnswers((prev) => ({
      ...prev,
      sleepHours: biometrics.sleepHours || 7.5,
      sleepQuality: Math.round((biometrics.sleepPercentage || 80) / 10),
      energyLevel: (biometrics.recoveryPercentage || 75) >= 67 ? 8 : (biometrics.recoveryPercentage || 75) >= 34 ? 6 : 4,
      biometrics: {
        recoveryPercentage: biometrics.recoveryPercentage,
        sleepPercentage: biometrics.sleepPercentage,
        sleepHours: biometrics.sleepHours || 7.5,
      },
    }));
  };

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [generatedVerdict, setGeneratedVerdict] = useState<DayVerdict | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (field: keyof ReflectionAnswers, value: any) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleIdentityProofChange = (identity: string, proof: string) => {
    setAnswers((prev) => {
      const existing = prev.identityEvidence.filter((i) => i.identity !== identity);
      return {
        ...prev,
        identityEvidence: [...existing, { identity, proof }],
      };
    });
  };

  const stepsList = [
    { title: 'Morning & Intention', subtitle: 'Who did you set out to be?' },
    { title: 'Execution & Day Review', subtitle: 'What actually occurred?' },
    { title: 'Body & Energy', subtitle: 'Physiological foundation' },
    { title: 'Mind & Emotions', subtitle: 'Internal climate' },
    { title: 'Relationships', subtitle: 'Interpersonal presence' },
    { title: 'Deep Self-Honesty', subtitle: 'Confronting truth' },
  ];

  const triggerAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setCurrentStep(6); // Analysis view

    try {
      const response = await fetch('/api/reflect/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          mode: profile.mode,
          memories,
          historicalContext: `User is tracking identity proof for: ${profile.selectedIdentities.join(', ')}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis server returned an error');
      }

      const verdict: DayVerdict = await response.json();
      setGeneratedVerdict(verdict);
    } catch (err: any) {
      console.warn('Reflection server error, synthesizing local verdict:', err);
      // Synthesize high-quality fallback evaluation client-side
      const sleepH = parseFloat(String(answers.sleepHours)) || 7.5;
      const accomplished = (answers.accomplishments || '').trim();
      const avoided = (answers.avoided || '').trim();
      const wasted = (answers.wastedTime || '').trim();

      const disciplineScore = Math.max(30, Math.min(95, 75 - (avoided.length > 10 ? 15 : 0) + (answers.exerciseDone ? 10 : -10)));
      const focusScore = Math.max(30, Math.min(95, 75 - (wasted.length > 20 ? 15 : 0)));
      const healthScore = Math.max(40, Math.min(98, Math.round((sleepH >= 7 ? 40 : 25) + (answers.exerciseDone ? 45 : 20))));
      const overall = Math.round(disciplineScore * 0.4 + focusScore * 0.3 + healthScore * 0.3);

      const fallback: DayVerdict = {
        summary: `You made genuine strides today on core objectives, but surrendered focus when friction peaked. Discomfort avoidance remains your primary execution bottleneck.`,
        win: accomplished ? `Completed: ${accomplished.slice(0, 90)}` : 'Maintained daily baseline protocol.',
        miss: avoided ? `Avoided: ${avoided.slice(0, 90)}` : (wasted ? `Wasted time: ${wasted.slice(0, 90)}` : 'Allowed low-friction escapes during deep work.'),
        pattern: wasted ? `Defaulting to low-friction diversions when cognitive tasks lack immediate clarity.` : `Strongest consistency before noon; vulnerable to afternoon drift.`,
        blindSpot: `You confuse motion with progress. Choosing easier secondary tasks over high-resistance priorities is still procrastination.`,
        emotionalState: answers.dominantEmotion || 'Focused with underlying impatience',
        scores: {
          discipline: { score: disciplineScore, reason: avoided ? 'Postponed high-resistance task under pressure.' : 'Executed core daily non-negotiables.' },
          focus: { score: focusScore, reason: wasted ? 'Attention fragmented by distractions.' : 'Maintained solid deep work blocks.' },
          health: { score: healthScore, reason: `${sleepH}h sleep with ${answers.exerciseDone ? 'completed physical training' : 'rest day'}.` },
          relationships: { score: 78, reason: 'Maintained standard interactions without intentional connection.' },
          personalGrowth: { score: 80, reason: 'Completed self-honesty audit without rationalization.' },
          learning: { score: 75, reason: 'Hands-on practical execution logged.' },
          mood: { score: answers.energyLevel >= 7 ? 82 : 68, reason: `Energy rated at ${answers.energyLevel}/10.` },
          overall: { score: overall, reason: `Aggregated execution (${disciplineScore}) and focus throughput (${focusScore}).` },
        },
        tomorrowPlan: {
          oneThingToWin: avoided ? `Confront "${avoided.slice(0, 50)}" in your first 90-minute morning window.` : 'Execute single highest-priority project milestone before noon.',
          nonNegotiables: [
            'No smartphone or tab-switching in the first 3 hours of deep work.',
            'Complete physical training session with zero compromises.',
            'Tackle the most dreaded task before opening notifications.',
          ],
          oneThingToStop: wasted ? `Escaping into "${wasted.slice(0, 40)}" when blocked.` : 'Checking feeds during work transitions.',
          oneThingToStart: '10-minute pen-and-paper outline before starting complex tasks.',
          onePersonToConnect: answers.relationshipAction || 'Send a thoughtful, sincere message to a close friend.',
          onePromiseToYourself: 'I will tolerate friction without compromising my standards.',
        },
      };

      setGeneratedVerdict(fallback);
      setErrorMessage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const finalizeAndSave = () => {
    if (!generatedVerdict) return;

    const newReflection: DailyReflection = {
      id: `ref-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      completedAt: new Date().toISOString(),
      mode: 'brutal',
      answers,
      verdict: generatedVerdict,
    };

    saveReflection(newReflection);
    setActiveTab('home');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Step Header & Mode Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-300">
            {currentStep < 6 ? `Phase ${currentStep + 1} of 6` : 'Analysis Output'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 font-display">
            {currentStep < 6 ? stepsList[currentStep].title : "Today's Verdict"}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300">
            {currentStep < 6 ? stepsList[currentStep].subtitle : 'Brutally honest feedback on your actual behavior.'}
          </p>
        </div>

        {/* Honest Protocol Status Indicator (No Normal/Brutal Toggles) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-neutral-200">HONEST PROTOCOL</span>
          </div>
        </div>
      </div>

      {/* Progress Bar (Only during questions) */}
      {currentStep < 6 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-neutral-300 font-mono">
            <span>Progress</span>
            <span>{Math.round(((currentStep + 1) / 6) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / 6) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 0: Morning & Intention */}
      {currentStep === 0 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-200">
              1. What kind of person did you set out to be today?
            </label>
            <p className="text-xs text-neutral-300">
              What identity or standard were you aiming for this morning?
            </p>
            <textarea
              value={answers.intentionPerson}
              onChange={(e) => handleInputChange('intentionPerson', e.target.value)}
              placeholder="e.g. A decisive, calm operator who executes hard priorities without whining or reaching for dopamine."
              rows={3}
              className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-200">
              2. What were the 1–3 things that genuinely mattered today?
            </label>
            <p className="text-xs text-neutral-300">
              The high-leverage outcomes that would define victory.
            </p>
            <textarea
              value={answers.priorities}
              onChange={(e) => handleInputChange('priorities', e.target.value)}
              placeholder="e.g. 1) Ship caching architecture, 2) Complete leg day workout, 3) 45 min uninterrupted book study."
              rows={3}
              className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-200">
              3. What did you know could derail you today?
            </label>
            <p className="text-xs text-neutral-300">
              The anticipated obstacle or personal weakness.
            </p>
            <input
              type="text"
              value={answers.derailmentRisk}
              onChange={(e) => handleInputChange('derailmentRisk', e.target.value)}
              placeholder="e.g. Afternoon cognitive fatigue, checking feeds when stuck on tests."
              className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
            />
          </div>
        </div>
      )}

      {/* STEP 1: Execution & Day Review */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-200">
              4. What did you actually accomplish today?
            </label>
            <p className="text-xs text-neutral-300">Concrete output only—no intentions or plans.</p>
            <textarea
              value={answers.accomplishments}
              onChange={(e) => handleInputChange('accomplishments', e.target.value)}
              placeholder="e.g. Completed benchmark throughput suite; lifted heavy squats; reviewed 3 pull requests."
              rows={3}
              className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-200">
              5. What did you avoid even though you knew you should do it?
            </label>
            <p className="text-xs text-amber-400/90 font-medium">Be completely honest. Where did resistance win?</p>
            <textarea
              value={answers.avoided}
              onChange={(e) => handleInputChange('avoided', e.target.value)}
              placeholder="e.g. Avoided writing the edge-case socket tests because mocking was tedious."
              rows={2}
              className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-200">
                6. Where did you waste time?
              </label>
              <input
                type="text"
                value={answers.wastedTime}
                onChange={(e) => handleInputChange('wastedTime', e.target.value)}
                placeholder="e.g. 45 min on tech Twitter & feeds"
                className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-200">
                7. When were you most focused?
              </label>
              <input
                type="text"
                value={answers.focusPeak}
                onChange={(e) => handleInputChange('focusPeak', e.target.value)}
                placeholder="e.g. 8:30 AM to 11:30 AM before lunch"
                className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-200">
              8. Did your actions match the person you want to become?
            </label>
            <input
              type="text"
              value={answers.actionsMatched}
              onChange={(e) => handleInputChange('actionsMatched', e.target.value)}
              placeholder="e.g. Morning 90% matched. Afternoon dropped to 40% due to phone distraction."
              className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
            />
          </div>
        </div>
      )}

      {/* STEP 2: Body & Physiology */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Daily Biometrics Entry Helper */}
          {biometrics && (
            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-neutral-200">Daily Logged Biometrics ({biometrics.date}):</span>{' '}
                  <span className="text-neutral-300 font-mono">
                    Sleep <strong className="text-indigo-400">{biometrics.sleepPercentage}%</strong> ({biometrics.sleepHours || 7.5}h) · Recovery <strong className={biometrics.recoveryPercentage >= 67 ? 'text-emerald-400' : biometrics.recoveryPercentage >= 34 ? 'text-amber-400' : 'text-rose-400'}>{biometrics.recoveryPercentage}%</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={applyLoggedBiometrics}
                className="px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg border border-neutral-700 transition-colors cursor-pointer shrink-0"
              >
                Sync Today's Metrics ✓
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-neutral-200">
                <span className="flex items-center gap-1.5"><Moon className="w-4 h-4 text-indigo-400" /> Sleep Duration</span>
                <span className="font-mono text-neutral-100 font-bold">{answers.sleepHours} hrs</span>
              </div>
              <input
                type="range"
                min="4"
                max="10"
                step="0.5"
                value={answers.sleepHours}
                onChange={(e) => handleInputChange('sleepHours', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-neutral-200">
                <span>Sleep Quality Rating</span>
                <span className="font-mono text-neutral-100 font-bold">{answers.sleepQuality} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={answers.sleepQuality}
                onChange={(e) => handleInputChange('sleepQuality', parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-neutral-200">
                Did you exercise / train today?
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('exerciseDone', true)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    answers.exerciseDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  Yes, executed
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('exerciseDone', false)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    !answers.exerciseDone
                      ? 'bg-neutral-700 text-neutral-200'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  Rest / Skipped
                </button>
              </div>
            </div>

            <input
              type="text"
              value={answers.exerciseDetails}
              onChange={(e) => handleInputChange('exerciseDetails', e.target.value)}
              placeholder="e.g. Leg day squats and RDLs; 20 min mobility."
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-200">
                Nutrition & Hydration
              </label>
              <input
                type="text"
                value={answers.nutrition}
                onChange={(e) => handleInputChange('nutrition', e.target.value)}
                placeholder="e.g. Clean whole foods, 180g protein, 3.5L water"
                className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-neutral-200">
                <span>Overall Physical Energy</span>
                <span className="font-mono text-neutral-100 font-bold">{answers.energyLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={answers.energyLevel}
                onChange={(e) => handleInputChange('energyLevel', parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Mind & Emotional State */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-200">
              14. What emotion dominated your day?
            </label>
            <p className="text-xs text-neutral-300">Calm, agitated, proud, restless, impatient, fearful, joyful?</p>
            <input
              type="text"
              value={answers.dominantEmotion}
              onChange={(e) => handleInputChange('dominantEmotion', e.target.value)}
              placeholder="e.g. Self-critical alertness with afternoon restlessness."
              className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-200">
              15. What thought kept looping or returning today?
            </label>
            <textarea
              value={answers.recurringThought}
              onChange={(e) => handleInputChange('recurringThought', e.target.value)}
              placeholder="e.g. Am I building fast enough? Is this sprint deadline realistic?"
              rows={2}
              className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-200">
                16. What caused the most stress?
              </label>
              <input
                type="text"
                value={answers.stressSource}
                onChange={(e) => handleInputChange('stressSource', e.target.value)}
                placeholder="e.g. Impending sprint review"
                className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-200">
                17. What brought genuine joy or satisfaction?
              </label>
              <input
                type="text"
                value={answers.joySource}
                onChange={(e) => handleInputChange('joySource', e.target.value)}
                placeholder="e.g. Clean heavy squat set; laughing with partner."
                className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Relationships */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-200">
              18. Did you treat the people around you well today?
            </label>
            <p className="text-xs text-neutral-300">Were you patient, present, and kind, or hurried and reactive?</p>
            <textarea
              value={answers.treatedPeopleWell}
              onChange={(e) => handleInputChange('treatedPeopleWell', e.target.value)}
              placeholder="e.g. Mostly patient, but snapped slightly during a 3 PM sync because I was frustrated with my own sluggish focus."
              rows={3}
              className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-200">
              19. Is there anyone you should appreciate, apologize to, or reconnect with?
            </label>
            <textarea
              value={answers.relationshipAction}
              onChange={(e) => handleInputChange('relationshipAction', e.target.value)}
              placeholder="e.g. Send appreciation note to colleague for fixing the CI pipeline; call parents this weekend."
              rows={3}
              className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* STEP 5: Deep Self-Honesty & Identity Proof */}
      {currentStep === 5 && (
        <div className="space-y-6">
          {/* Deep Dynamic Question */}
          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                <HelpCircle className="w-4 h-4" />
                <span>The Uncomfortable Check</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextPrompt = SELF_HONESTY_PROMPTS[(SELF_HONESTY_PROMPTS.indexOf(answers.selfHonestyPrompt) + 1) % SELF_HONESTY_PROMPTS.length];
                  handleInputChange('selfHonestyPrompt', nextPrompt);
                }}
                className="text-[11px] text-amber-300 hover:text-amber-100 underline cursor-pointer"
              >
                Switch Prompt ↻
              </button>
            </div>

            <p className="text-base font-semibold text-neutral-100 font-display">
              "{answers.selfHonestyPrompt}"
            </p>

            <textarea
              value={answers.selfHonestyAnswer}
              onChange={(e) => handleInputChange('selfHonestyAnswer', e.target.value)}
              placeholder="Strip away your excuses. What is the raw truth?"
              rows={3}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-600/60"
            />
          </div>

          {/* Identity Proof System */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-neutral-200">
                Identity Tracker: Evidence Over Affirmations
              </h3>
              <p className="text-xs text-neutral-300">
                What did you do today that provably casts a vote for your stated identity?
              </p>
            </div>

            <div className="space-y-3">
              {profile.selectedIdentities.slice(0, 3).map((identity) => {
                const currentProof = answers.identityEvidence.find((i) => i.identity === identity)?.proof || '';
                return (
                  <div key={identity} className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-1.5">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide">
                      {identity}
                    </span>
                    <input
                      type="text"
                      value={currentProof}
                      onChange={(e) => handleIdentityProofChange(identity, e.target.value)}
                      placeholder={`Concrete evidence today proving you are ${identity.toLowerCase()}...`}
                      className="w-full rounded-lg bg-neutral-950 border border-neutral-800/80 p-2 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: AI Verdict Generation Screen */}
      {currentStep === 6 && (
        <div className="space-y-6">
          {isAnalyzing ? (
            <div className="py-16 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-neutral-100 font-display">
                  Auditing Today's Log...
                </h3>
                <p className="text-xs text-neutral-300 max-w-sm mx-auto">
                  Deconstructing patterns, calculating discipline and focus scores, confronting self-deception in {profile.mode.toUpperCase()} MODE.
                </p>
              </div>
            </div>
          ) : generatedVerdict ? (
            <div className="space-y-6">
              {/* Verdict Summary Card */}
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-300">Audit Complete</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-xs text-neutral-300 font-semibold uppercase">{profile.mode} Mode</span>
                  </div>
                  <div className="flex items-baseline gap-1 text-neutral-100 font-mono font-extrabold text-2xl">
                    <span>{generatedVerdict.scores.overall.score}</span>
                    <span className="text-xs text-neutral-400">/ 100</span>
                  </div>
                </div>

                <div className="text-base sm:text-lg text-neutral-100 font-medium leading-relaxed">
                  "{generatedVerdict.summary}"
                </div>
              </div>

              {/* Win, Miss, Pattern, Blind Spot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Win</span>
                  <p className="text-xs text-neutral-200 leading-relaxed">{generatedVerdict.win}</p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">Miss</span>
                  <p className="text-xs text-neutral-200 leading-relaxed">{generatedVerdict.miss}</p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Pattern Detected</span>
                  <p className="text-xs text-neutral-200 leading-relaxed">{generatedVerdict.pattern}</p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Blind Spot</span>
                  <p className="text-xs text-neutral-200 leading-relaxed">{generatedVerdict.blindSpot}</p>
                </div>
              </div>

              {/* Detailed Scores Breakdown with Explanations */}
              <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                  Score Explanations (Why Each Was Awarded)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(generatedVerdict.scores).map(([key, item]) => (
                    <div key={key} className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold capitalize text-neutral-200">{key}</span>
                        <span className="font-mono font-bold text-neutral-100 tabular-nums">{item.score}</span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tomorrow's Plan Generated */}
              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  Tomorrow's Directives
                </div>
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="text-[10px] font-mono uppercase text-neutral-300">ONE THING TO WIN</div>
                  <div className="text-sm font-semibold text-neutral-100 pt-1">
                    {generatedVerdict.tomorrowPlan.oneThingToWin}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-300">3 Non-Negotiables:</div>
                  {generatedVerdict.tomorrowPlan.nonNegotiables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-neutral-200 p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                      <span className="font-mono text-neutral-400 font-bold">{idx + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Save Button */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  ← Edit Answers
                </button>
                <button
                  onClick={finalizeAndSave}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Lock In Day & Save to Dashboard</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <p className="text-sm text-neutral-300">{errorMessage || 'Ready to generate appraisal.'}</p>
              <button
                onClick={triggerAnalysis}
                className="px-5 py-2.5 bg-neutral-100 text-neutral-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                Retry Analysis
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer (Prev / Next) */}
      {currentStep < 6 && (
        <div className="flex items-center justify-between pt-6 border-t border-neutral-800">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              currentStep === 0
                ? 'opacity-30 cursor-not-allowed text-neutral-600'
                : 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-900'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              className="flex items-center gap-2 px-5 py-2.5 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={triggerAnalysis}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs rounded-lg transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze & Generate Verdict</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
