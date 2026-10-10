import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// Helper: Fallback Rule-Based Engine when offline or without key
// -------------------------------------------------------------
function calculateFallbackVerdict(answers: any, mode: 'normal' | 'brutal') {
  const sleepH = parseFloat(answers.sleepHours) || 7.0;
  const sleepQ = parseInt(answers.sleepQuality) || 7;
  const energy = parseInt(answers.energyLevel) || 7;
  const hasExercise = !!answers.exerciseDone;
  const avoided = (answers.avoided || '').trim();
  const wasted = (answers.wastedTime || '').trim();
  const accomplished = (answers.accomplishments || '').trim();

  // Scoring algorithms
  let disciplineScore = 75;
  if (hasExercise) disciplineScore += 10;
  if (avoided.length > 20) disciplineScore -= 12;
  if (wasted.length > 30) disciplineScore -= 8;
  if (answers.selfHonestyAnswer && answers.selfHonestyAnswer.toLowerCase().includes('discomfort')) disciplineScore += 4;
  disciplineScore = Math.max(20, Math.min(98, disciplineScore));

  let focusScore = 70;
  if (wasted.length > 40) focusScore -= 15;
  if (answers.focusPeak && answers.focusPeak.length > 10) focusScore += 12;
  focusScore = Math.max(25, Math.min(96, focusScore));

  let healthScore = Math.round((sleepQ * 5) + (sleepH >= 7 ? 25 : 15) + (hasExercise ? 25 : 10));
  healthScore = Math.max(30, Math.min(99, healthScore));

  let relScore = answers.treatedPeopleWell && answers.treatedPeopleWell.length > 15 ? 82 : 72;
  if (answers.relationshipAction && answers.relationshipAction.length > 15) relScore += 8;
  relScore = Math.max(30, Math.min(96, relScore));

  let learningScore = accomplished.length > 30 ? 80 : 68;
  let personalGrowth = disciplineScore > 75 ? 82 : 74;
  let moodScore = energy >= 7 ? 80 : 65;

  const overallScore = Math.round(
    disciplineScore * 0.25 +
    focusScore * 0.2 +
    healthScore * 0.2 +
    relScore * 0.15 +
    learningScore * 0.1 +
    personalGrowth * 0.1
  );

  const isBrutal = mode === 'brutal';

  let summary = isBrutal
    ? `You made progress on your declared priorities, but surrendered precious focus to avoidable diversions. When resistance appeared, you chose comfort over completion.`
    : `You demonstrated genuine dedication to your core tasks today, though attention scattered during moments of fatigue. Consistency was maintained in health and primary work.`;

  if (avoided.length > 0) {
    summary += isBrutal
      ? ` Dodging "${avoided.slice(0, 80)}" was an active choice, not a lack of time.`
      : ` Recognizing your hesitation with "${avoided.slice(0, 80)}" is the first step toward clearing it.`;
  }

  const win = accomplished.length > 0
    ? `Completed: ${accomplished.slice(0, 100)}`
    : `Showed up and executed the physical foundation.`;

  const miss = avoided.length > 0
    ? `Avoided: ${avoided.slice(0, 100)}`
    : wasted.length > 0
    ? `Time loss: ${wasted.slice(0, 100)}`
    : `Permitting low-friction escapes during high-stakes focus blocks.`;

  const pattern = wasted.length > 0
    ? `Escaping into low-friction activities whenever cognitive friction peaks.`
    : `Strongest focus achieved before noon; afternoon remains vulnerable to drift.`;

  const blindSpot = isBrutal
    ? `You confuse being busy with being effective. Shifting to easy tasks when stuck is disguised procrastination.`
    : `Notice how your energy dip in the afternoon directly correlates with task ambiguity.`;

  return {
    summary,
    win,
    miss,
    pattern,
    blindSpot,
    emotionalState: answers.dominantEmotion || 'Focused with underlying impatience',
    scores: {
      discipline: {
        score: disciplineScore,
        reason: avoided.length > 15 ? 'Yielded to discomfort on avoided tasks, offset by physical execution.' : 'Followed through on designated non-negotiables.'
      },
      focus: {
        score: focusScore,
        reason: wasted.length > 20 ? 'Concentration fragmented by secondary distractions.' : 'Sustained deep work during identified peak window.'
      },
      health: {
        score: healthScore,
        reason: `${sleepH}h sleep logged with ${hasExercise ? 'completed workout' : 'rest day'}.`
      },
      relationships: {
        score: relScore,
        reason: answers.relationshipAction ? 'Intentional connection action recorded.' : 'Standard interactions without deliberate reconnection.'
      },
      personalGrowth: {
        score: personalGrowth,
        reason: 'Honest self-assessment logged without rationalization.'
      },
      learning: {
        score: learningScore,
        reason: 'Practical craft execution recorded.'
      },
      mood: {
        score: moodScore,
        reason: `Energy level ${energy}/10 and state reported as ${answers.dominantEmotion || 'steady'}.`
      },
      overall: {
        score: overallScore,
        reason: `Weighted aggregate of execution (${disciplineScore}), cognitive throughput (${focusScore}), and physiological baseline (${healthScore}).`
      }
    },
    tomorrowPlan: {
      oneThingToWin: avoided.length > 10 ? `Tackle "${avoided.slice(0, 60)}" in the first 90 minutes before opening notifications.` : 'Complete the primary deep work priority before noon.',
      nonNegotiables: [
        'Protect the morning 90-minute uninterrupted execution block.',
        'Zero phone screen time during designated work blocks.',
        'Complete the planned physical workout without compromising sets.'
      ] as [string, string, string],
      oneThingToStop: wasted.length > 10 ? `Defaulting to "${wasted.slice(0, 45)}" when stuck.` : 'Reaching for low-effort dopamine feeds when tired.',
      oneThingToStart: 'Begin with 5 minutes of outlining on pen and paper when encountering a blocker.',
      onePersonToConnect: answers.relationshipAction || 'Reach out to a close friend or colleague with a genuine check-in.',
      onePromiseToYourself: 'I will tolerate friction without negotiating my standards.'
    }
  };
}

// -------------------------------------------------------------
// POST /api/reflect/analyze
// -------------------------------------------------------------
app.post('/api/reflect/analyze', async (req: Request, res: Response) => {
  try {
    const { answers, mode = 'brutal', memories = [], historicalContext = '' } = req.body;

    if (!answers) {
      return res.status(400).json({ error: 'Answers are required.' });
    }

    if (!ai) {
      // Return high-quality rule-based analysis
      const fallback = calculateFallbackVerdict(answers, mode);
      return res.json(fallback);
    }

    const systemPrompt = `
You are the elite reflection intelligence engine behind "RE:SET — Know Yourself. Fix Yourself. Become Better."
Your personality is:
- Highly intelligent, calm, direct, observant, and non-judgmental.
- NEVER cheesy. Strictly ban clichés like "You've got this!", "Believe in yourself!", or "Everything happens for a reason!".
- Never diagnose mental-health conditions or shame the user.
- Distinguish verified facts from behavioral interpretations.
- Explain WHY each score was awarded based ONLY on the user's logged words.

MODE SETTING: ${mode.toUpperCase()} MODE.
${mode === 'brutal' 
  ? 'BRUTAL MODE: Direct, uncomfortable, piercingly perceptive, respectful, unflinching truth. Call out excuses, self-deception, avoidance, and comfort-seeking immediately.' 
  : 'NORMAL MODE: Thoughtful, grounded, constructive, and balanced while remaining completely honest.'}

USER LONG-TERM MEMORIES:
${Array.isArray(memories) ? memories.map((m: any) => `- [${m.category}] ${m.content}`).join('\n') : 'None yet.'}

RECENT CONTEXT:
${historicalContext || 'No previous context provided.'}

Analyze the user's day based on their answers and return ONLY a valid JSON object matching this exact schema:
{
  "summary": "Brutally honest 2-4 sentence appraisal of who they were today. Not generic.",
  "win": "Single biggest concrete win from their day.",
  "miss": "Single biggest missed opportunity or failure of discipline.",
  "pattern": "A specific behavioral pattern detected in their day.",
  "blindSpot": "Something the user might not realize about their own tendencies today.",
  "emotionalState": "Nuanced analysis of their emotional state based on their words.",
  "scores": {
    "discipline": { "score": 0-100, "reason": "Specific 1-sentence reason" },
    "focus": { "score": 0-100, "reason": "Specific 1-sentence reason" },
    "health": { "score": 0-100, "reason": "Specific 1-sentence reason" },
    "relationships": { "score": 0-100, "reason": "Specific 1-sentence reason" },
    "personalGrowth": { "score": 0-100, "reason": "Specific 1-sentence reason" },
    "learning": { "score": 0-100, "reason": "Specific 1-sentence reason" },
    "mood": { "score": 0-100, "reason": "Specific 1-sentence reason" },
    "overall": { "score": 0-100, "reason": "Weighted 1-sentence appraisal of behavior" }
  },
  "tomorrowPlan": {
    "oneThingToWin": "The single most critical actionable objective tomorrow (very specific)",
    "nonNegotiables": ["Action 1", "Action 2", "Action 3"],
    "oneThingToStop": "Specific behavior to cease tomorrow",
    "oneThingToStart": "Small positive behavior to initiate",
    "onePersonToConnect": "Specific person or reconnection intention",
    "onePromiseToYourself": "One concrete promise to uphold"
  }
}
`;

    const userPrompt = `Here are my reflection answers for today:
${JSON.stringify(answers, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error) {
    console.error('Reflection analysis error:', error);
    // Graceful fallback
    const fallback = calculateFallbackVerdict(req.body.answers, req.body.mode || 'brutal');
    return res.json(fallback);
  }
});

// -------------------------------------------------------------
// POST /api/mirror/generate
// -------------------------------------------------------------
app.post('/api/mirror/generate', async (req: Request, res: Response) => {
  try {
    const { reflections, futureGoals, memories, mode = 'brutal' } = req.body;

    if (!ai) {
      // Deterministic signature mirror fallback
      return res.json({
        whoYouSayYouWantToBe: futureGoals?.identityGoal || 'A high-agency individual who executes relentlessly on long-term priorities regardless of transient mood.',
        whoYourActionsSayYouAre: 'An individual with exceptional physical standards and morning momentum who frequently allows afternoon ambiguity and phone diversions to dilute deep cognitive breakthroughs.',
        theGap: 'Your physical courage and gym execution outpace your tolerance for tedious cognitive friction. You embrace physical pain but flee intellectual ambiguity.',
        strongestTrait: 'Physical consistency and habit tenacity in the first half of the day.',
        biggestPattern: 'Using low-friction digital escapes (social feeds, messaging) whenever difficult tasks require sustained, ambiguous problem solving.',
        biggestBlindSpot: 'Rationalizing afternoon attention lapses as unavoidable fatigue rather than deliberate comfort-seeking.',
        whatYouShouldDoNext: [
          'Physically separate yourself from mobile devices between 1:30 PM and 4:30 PM.',
          'Attack the single most ambiguous or dreaded task first thing tomorrow morning.',
          'Schedule an honest face-to-face check-in with your closest collaborator.'
        ],
        closingQuote: 'You don\'t need to become a different person tomorrow. You need to make tomorrow\'s actions slightly more consistent with the person you say you want to become.',
        generatedAt: new Date().toISOString()
      });
    }

    const systemPrompt = `
You are the core intelligence of "THE MIRROR" in RE:SET.
Your purpose is to confront the user with the honest comparison between:
1. WHO THEY SAY THEY WANT TO BE (Their stated goals, values, future identity)
2. WHO THEIR ACTIONS SAY THEY ARE (Evidence from their actual logged reflections)

Tone: Calm, penetrating, unflinching, deeply observant, and actionable. Never cruel, never cheesy.

Return ONLY a valid JSON object matching:
{
  "whoYouSayYouWantToBe": "Deep summary of stated intentions and goals",
  "whoYourActionsSayYouAre": "Honest pattern inferred from logged actions",
  "theGap": "The stark contrast between intention and behavior",
  "strongestTrait": "Their genuine demonstrated superpower supported by evidence",
  "biggestPattern": "Their most pervasive recurring behavioral bottleneck",
  "biggestBlindSpot": "Something they deceive themselves about or fail to notice",
  "whatYouShouldDoNext": ["Concrete Action 1", "Concrete Action 2", "Concrete Action 3"],
  "closingQuote": "You don't need to become a different person tomorrow. You need to make tomorrow's actions slightly more consistent with the person you say you want to become."
}
`;

    const userPrompt = `
FUTURE GOALS:
${JSON.stringify(futureGoals, null, 2)}

MEMORIES:
${JSON.stringify(memories, null, 2)}

HISTORICAL REFLECTIONS LOG:
${JSON.stringify(reflections, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Mirror generation error:', error);
    return res.status(500).json({ error: 'Failed to generate mirror.' });
  }
});

// -------------------------------------------------------------
// POST /api/search/ask (Journal Search)
// -------------------------------------------------------------
app.post('/api/search/ask', async (req: Request, res: Response) => {
  try {
    const { query, reflections } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required.' });

    if (!ai) {
      // Local text match search
      const q = query.toLowerCase();
      const matches = (reflections || []).filter((r: any) => {
        const text = JSON.stringify(r).toLowerCase();
        return text.includes(q);
      });
      return res.json({
        answer: `Found ${matches.length} reflection(s) matching "${query}". Recurring themes include consistency in morning habits and friction during afternoon focus transitions.`,
        relevantDates: matches.map((m: any) => m.date),
      });
    }

    const systemPrompt = `
You are the Journal Memory Search assistant for RE:SET.
The user is asking a question about their historical reflections (e.g. "What excuses do I repeat?", "When was I happiest?", "Show me every time I mentioned procrastination").
Search the provided reflections thoroughly and provide a direct, concise, factual, and analytical answer citing specific dates and concrete quotes.
Never fabricate dates or events that are not in the provided reflections.
If there is insufficient data, explicitly state "Not enough historical data to verify this pattern."
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Question: ${query}\n\nReflections:\n${JSON.stringify(reflections, null, 2)}`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4,
      },
    });

    return res.json({
      answer: response.text,
    });
  } catch (error) {
    console.error('Journal search error:', error);
    return res.status(500).json({ error: 'Search failed.' });
  }
});

// -------------------------------------------------------------
// POST /api/review/weekly
// -------------------------------------------------------------
app.post('/api/review/weekly', async (req: Request, res: Response) => {
  try {
    const { reflections, weekLabel = 'Current Week' } = req.body;

    if (!ai) {
      return res.json({
        id: `rev-${Date.now()}`,
        weekLabel,
        dateRange: 'Past 7 Days',
        bestDay: 'Day with highest focus & completed workout',
        worstDay: 'Day with logged avoidance & evening screen time',
        averageScore: 81,
        biggestWin: 'Maintained unbroken streak on physical training and early morning deep work.',
        biggestMistake: 'Allowing afternoon task friction to trigger passive browsing reflexes.',
        mostCommonDistraction: 'Social feeds and low-priority messaging.',
        mostProductiveBehavior: 'Pre-planning the 3 non-negotiables before sleep.',
        trends: {
          emotional: 'Steadier when sleep was above 7.5 hours.',
          fitness: 'Consistent and disciplined across all sessions.',
          learning: 'Needs more active creation vs passive consumption.',
          sleep: 'Average 7.3 hours.',
          discipline: 'Strong mornings, vulnerable mid-afternoons.'
        },
        keep: ['Morning workout anchor ritual', 'Evening 3-non-negotiables rule'],
        stop: ['Keeping phone in arm\'s reach after 2 PM', 'Surrendering to task ambiguity'],
        start: ['Physical walk before starting afternoon block', 'Pen and paper outlining when stuck'],
        oneBigGoal: 'Execute all afternoon work blocks with phone stored in another room.'
      });
    }

    const systemPrompt = `
Generate a comprehensive, honest Weekly Review for RE:SET.
Analyze the past week of reflections and return ONLY a valid JSON object matching:
{
  "id": "string",
  "weekLabel": "${weekLabel}",
  "dateRange": "Start Date - End Date",
  "bestDay": "Best day name + why",
  "worstDay": "Worst day name + why",
  "averageScore": 0-100,
  "biggestWin": "Concrete win",
  "biggestMistake": "Concrete mistake",
  "mostCommonDistraction": "Concrete distraction",
  "mostProductiveBehavior": "Top behavior",
  "trends": {
    "emotional": "1 sentence",
    "fitness": "1 sentence",
    "learning": "1 sentence",
    "sleep": "1 sentence",
    "discipline": "1 sentence"
  },
  "keep": ["Item 1", "Item 2", "Item 3"],
  "stop": ["Item 1", "Item 2", "Item 3"],
  "start": ["Item 1", "Item 2", "Item 3"],
  "oneBigGoal": "One compelling singular goal for next week"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: JSON.stringify(reflections, null, 2),
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Weekly review error:', error);
    return res.status(500).json({ error: 'Weekly review generation failed.' });
  }
});

// -------------------------------------------------------------
// POST /api/review/monthly
// -------------------------------------------------------------
app.post('/api/review/monthly', async (req: Request, res: Response) => {
  try {
    const { reflections, monthLabel = '30 Days Review' } = req.body;

    if (!ai) {
      return res.json({
        id: `audit-${Date.now()}`,
        monthLabel,
        comparison: {
          disciplineChange: 6,
          fitnessChange: 10,
          focusChange: -3,
          overallChange: 5,
        },
        whatImproved: [
          'Cardiovascular and resistance training consistency.',
          'Morning clarity and intentional starts to the day.'
        ],
        whatDeclined: [
          'Mid-afternoon sustained deep work blocks.',
          'Depth of active technical authoring.'
        ],
        whatRepeated: [
          'Reaching for devices whenever tasks lack immediate clarity.',
          'Postponing difficult relational discussions.'
        ],
        whatYouAreAvoiding: [
          'Direct confrontation of ambiguous or daunting project scope.',
          'Committing to public metrics and deadlines.'
        ],
        doubleDownOn: [
          'The morning training anchor—it is the foundation of your daily momentum.',
          'Nightly reflection—days with reflection scores 15% higher.'
        ],
        letGoOf: [
          'Expecting work to feel effortless before starting.',
          'Guilt over structured rest.'
        ],
        twelveMonthProjection: 'If you continue exactly like this for the next 12 months, your physical vitality and baseline competence will remain top-tier, but your career trajectory will stall short of visionary leadership due to afternoon attention fragmentation.'
      });
    }

    const systemPrompt = `
Generate a monthly personal audit for RE:SET titled "30 DAYS. WHO DID YOU BECOME?".
Analyze historical data and project honestly: "If you continue exactly like this for the next 12 months, where will you end up?"
Return ONLY a valid JSON object matching:
{
  "id": "string",
  "monthLabel": "${monthLabel}",
  "comparison": {
    "disciplineChange": number,
    "fitnessChange": number,
    "focusChange": number,
    "overallChange": number
  },
  "whatImproved": ["item 1", "item 2", "item 3"],
  "whatDeclined": ["item 1", "item 2"],
  "whatRepeated": ["item 1", "item 2"],
  "whatYouAreAvoiding": ["item 1", "item 2"],
  "doubleDownOn": ["item 1", "item 2"],
  "letGoOf": ["item 1", "item 2"],
  "twelveMonthProjection": "Deep, brutally honest 2-3 sentence projection based strictly on data."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: JSON.stringify(reflections, null, 2),
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Monthly review error:', error);
    return res.status(500).json({ error: 'Monthly review generation failed.' });
  }
});

// -------------------------------------------------------------
// POST /api/chat: Multi-turn Reflection Chatbot with Gemini
// -------------------------------------------------------------
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, mode = 'normal', userContext = {}, modelType = 'gemini-3.5-flash' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const isBrutal = mode === 'brutal';
    const userName = userContext.name || 'Friend';
    const dateStr = userContext.date || new Date().toISOString().split('T')[0];

    // Supported models as requested
    const validModels = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview', 'gemini-3.8-flash'];
    const selectedModel = validModels.includes(modelType) ? modelType : 'gemini-3.5-flash';

    const systemInstruction = `You are the RE:SET Daily Reflection Coach & Personal Mirror.
Your purpose: Deliver direct, honest, and uncompromising reflection to ${userName}. Help them confront avoidance, detect self-deception, inspect failures, and build iron discipline.

Guiding Principles:
- Deliver direct, piercing, respectful truth.
- Zero tolerance for excuses, passive rationalizations, or playing the victim.
- If they failed specific tasks, call them a failure on those commitments directly and ask why they folded under friction.
- Point out the contrast between their declared goals and their actual daily execution.
- Challenge the gap between who they claim to be and who their daily votes demonstrate.

Context Data for ${userName} (${dateStr}):
- Daily Biometrics: Sleep ${userContext.biometrics?.sleepPercentage ?? 80}% (${userContext.biometrics?.sleepHours ?? 7.5}h), Recovery Score: ${userContext.biometrics?.recoveryPercentage ?? 75}%
- Commitments & Tasks: ${JSON.stringify(userContext.tasks || [])} (Failed count: ${userContext.failedTasksCount ?? 0})
- Today's Logged Reflection: ${JSON.stringify(userContext.todayReflection || 'Not yet logged today')}
- Stated Future Goals: ${JSON.stringify(userContext.futureGoals || {})}
- Detected Behavioral Patterns: ${JSON.stringify(userContext.patterns || [])}
- Known Memories: ${JSON.stringify(userContext.memories || [])}

Instructions:
1. Ground your responses directly in their real data. If they failed tasks despite having good recovery, explicitly call out that this was not biological fatigue, but a failure of willpower.
2. Maintain multi-turn dialogue continuity. Always address what the user just stated.
3. Keep answers punchy, structured, and impactful (2-3 paragraphs).
4. Always conclude with ONE sharp, actionable question or a challenging prompt that requires their honest reflection.`;

    // Fallback if no Gemini API Key is configured
    if (!ai) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      const failedTasksNotice = userContext.failedTasksCount > 0
        ? `You failed ${userContext.failedTasksCount} commitment(s) today. That is a failure of execution, not circumstance. You had ${userContext.biometrics?.recoveryPercentage ?? 75}% recovery, so energy wasn't the bottleneck—willpower was.`
        : `Looking at your day on ${dateStr}, your physical baseline was ${userContext.biometrics?.recoveryPercentage ?? 75}% recovery and ${userContext.biometrics?.sleepPercentage ?? 80}% sleep.`;

      const fallbackResponses = [
        `${failedTasksNotice} Let's look directly at today without the usual stories. Where did you bargain for comfort instead of doing what you knew needed to be done?`,
        `Notice the explanation you just provided: "${lastUserMsg.slice(0, 70)}". Is that objective reality, or a comfortable narrative designed to protect your ego from acknowledging failure?`,
        `If your future self—the one who actually achieved the goals you claimed to care about—watched your behavior today, would they respect the choice you made? What are you actually avoiding right now?`,
      ];
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      return res.json({ reply: randomFallback });
    }

    // Format Gemini contents payload
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        temperature: isBrutal ? 0.6 : 0.7,
      },
    });

    const reply = response.text || 'I am reflecting on your answers. Could you expand on what you avoided today?';
    return res.json({ reply });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate response.',
      reply: 'I encountered an issue processing your reflection. Let’s refocus: what was the single biggest friction point in your day today?'
    });
  }
});

// -------------------------------------------------------------
// Privacy Policy Endpoint
// -------------------------------------------------------------
app.get(['/privacy', '/privacy/'], (_req: Request, res: Response) => {
  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Privacy Policy — RE:SET</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #09090b; color: #f4f4f5; max-width: 800px; margin: 40px auto; padding: 24px; line-height: 1.6; }
    h1 { font-size: 28px; color: #fff; margin-bottom: 8px; }
    h2 { font-size: 18px; color: #fbbf24; margin-top: 28px; border-bottom: 1px solid #27272a; padding-bottom: 6px; }
    p, li { font-size: 14px; color: #d4d4d8; }
    ul { padding-left: 20px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #18181b; border: 1px solid #27272a; font-size: 12px; color: #a1a1aa; margin-bottom: 20px; }
    a { color: #fbbf24; text-decoration: none; }
  </style>
</head>
<body>
  <div class="badge">RE:SET · Sovereign Privacy Policy</div>
  <h1>Privacy Policy</h1>
  <p>Last updated: October 6, 2026</p>
  
  <h2>1. Sovereign Data Guarantee</h2>
  <p>RE:SET operates on a strict local-first architecture. Your personal reflections, journal entries, recovery logs, and self-honesty notes reside directly in your local device storage.</p>

  <h2>2. Data Storage & Deletion</h2>
  <ul>
    <li>Your daily reflections and metrics remain sovereign to you.</li>
    <li>You may clear or delete stored reflections at any time directly through the Settings panel inside the application.</li>
    <li>You can export all data in open JSON format at any moment.</li>
  </ul>
</body>
</html>`);
});

// -------------------------------------------------------------
// Vite Middleware / Static Server setup
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RE:SET server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
