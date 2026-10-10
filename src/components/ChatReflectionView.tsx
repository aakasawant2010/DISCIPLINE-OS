import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import { 
  Send, 
  Sparkles, 
  Trash2, 
  Download, 
  User, 
  Flame, 
  ShieldAlert, 
  Activity, 
  Moon, 
  AlertTriangle, 
  Copy, 
  Check, 
  ArrowRight,
  Eye,
  RefreshCw
} from 'lucide-react';

const STORAGE_KEY_CHAT = 'reset_app_chat_history';

export const ChatReflectionView: React.FC = () => {
  const { 
    profile, 
    todayReflection, 
    biometrics, 
    futureGoals, 
    patterns, 
    memories,
    tasks,
    mirror
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Selected Gemini model
  const [modelType, setModelType] = useState<string>('gemini-3.5-flash');

  // Filter today's tasks
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const failedTasks = todayTasks.filter((t) => t.status === 'failed');
  const completedTasks = todayTasks.filter((t) => t.status === 'completed');

  // Initial welcome message from the honest AI
  const getInitialWelcome = (): string => {
    let msg = `I am your honest daily mirror. No coddling, no rationalizations.\n\nToday's Metrics (${todayStr}):\n• Recovery: **${biometrics.recoveryPercentage}%**\n• Sleep: **${biometrics.sleepPercentage}%** (${biometrics.sleepHours || 7.5}h)\n• Commitments: **${completedTasks.length}/${todayTasks.length || 5} executed**`;
    
    if (failedTasks.length > 0) {
      msg += `\n\n🚨 **FAILURE DETECTED**: You failed **${failedTasks.map((t) => `"${t.title}"`).join(', ')}**. What lie did you tell yourself to justify backing down?`;
    } else {
      msg += `\n\nWhat choice did you make today that you know was a concession to comfort? Speak the truth without excuses.`;
    }
    return msg;
  };

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHAT);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'welcome-1',
        role: 'model',
        content: getInitialWelcome(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    try {
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(messages));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [messages]);

  // Handle Send Message
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const userContext = {
        name: profile.name,
        date: todayStr,
        mode: 'brutal', // Permanently unapologetic honest mode
        biometrics,
        tasks: todayTasks.map((t) => ({ title: t.title, status: t.status, failureReason: t.failureReason })),
        failedTasksCount: failedTasks.length,
        todayReflection: todayReflection?.answers ? {
          accomplishments: todayReflection.answers.accomplishments,
          avoided: todayReflection.answers.avoided,
          wastedTime: todayReflection.answers.wastedTime,
          dominantEmotion: todayReflection.answers.dominantEmotion,
          energyLevel: todayReflection.answers.energyLevel,
          verdictSummary: todayReflection.verdict?.summary,
        } : null,
        futureGoals: {
          oneYearGoal: futureGoals.oneYearGoal,
          careerGoal: futureGoals.careerGoal,
          fitnessGoal: futureGoals.fitnessGoal,
        },
        patterns: patterns.slice(0, 3).map((p) => p.pattern),
        memories: memories.slice(0, 5).map((m) => m.content),
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          mode: 'brutal',
          userContext,
          modelType,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || "Let's confront this directly: what lie are you telling yourself right now?";

      const botMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackReply = failedTasks.length > 0
        ? `You failed your commitment today on ${failedTasks.map((t) => t.title).join(' & ')}. You had ${biometrics.recoveryPercentage}% recovery, meaning this was not biological exhaustion—it was voluntary surrender. Why did you accept failure?`
        : `Looking at your day on ${todayStr}, what was the exact moment you traded long-term integrity for short-term comfort?`;

      const errorMsg: ChatMessage = {
        id: `model-err-${Date.now()}`,
        role: 'model',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (!confirm('Start a fresh reflection conversation?')) return;
    const initial: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'model',
      content: getInitialWelcome(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initial]);
    localStorage.removeItem(STORAGE_KEY_CHAT);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportTranscript = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.role === 'user' ? (profile.name || 'You') : 'Honest AI Mirror'}:\n${m.content}\n`)
      .join('\n---\n\n');

    const blob = new Blob([`# RE:SET Honest Reflection Transcript — ${todayStr}\n\n${transcript}`], {
      type: 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reset-reflection-transcript-${todayStr}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Quick reflective prompts tailored to today
  const quickStarters = [
    failedTasks.length > 0
      ? `Call me out: I failed my commitment to ${failedTasks[0]?.title}. Hold me accountable.`
      : 'Audit my day: Where did my actions betray my stated priorities?',
    `Given my ${biometrics.recoveryPercentage}% recovery and ${biometrics.sleepPercentage}% sleep, why did I feel friction?`,
    'Am I rationalizing avoidance as "tiredness" right now?',
    'What behavioral pattern from my past am I repeating today?',
    'Give me my 3 non-negotiables for tomorrow without leniency.',
  ];

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-neutral-100 font-display">
                The Mirror & Honest AI Coach
              </h1>
            </div>
            <p className="text-xs text-neutral-400">
              Direct reflection of your actions, biometrics (Recovery: {biometrics.recoveryPercentage}%), and commitments without sugarcoating.
            </p>
          </div>

          {/* Model selector & action controls */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Model Selector */}
            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1 text-xs font-mono">
              <span className="text-[10px] text-neutral-500 px-2 hidden md:inline">Model:</span>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="bg-transparent text-neutral-300 text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="gemini-3.5-flash" className="bg-neutral-900">Gemini 3.5 Flash</option>
                <option value="gemini-3.1-pro-preview" className="bg-neutral-900">Gemini 3.1 Pro</option>
                <option value="gemini-3.1-flash-lite" className="bg-neutral-900">Gemini Flash Lite</option>
              </select>
            </div>

            {/* Clear Chat */}
            <button
              type="button"
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Export Transcript */}
            <button
              type="button"
              onClick={handleExportTranscript}
              title="Export reflection as Markdown"
              className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Context Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-800/80 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/60 flex items-center justify-between">
            <span className="text-neutral-400">Recovery:</span>
            <span className={biometrics.recoveryPercentage >= 67 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {biometrics.recoveryPercentage}%
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/60 flex items-center justify-between">
            <span className="text-neutral-400">Sleep:</span>
            <span className="text-indigo-400 font-bold">{biometrics.sleepPercentage}%</span>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/60 flex items-center justify-between">
            <span className="text-neutral-400">Commitments:</span>
            <span className={failedTasks.length > 0 ? 'text-rose-400 font-bold' : 'text-neutral-200 font-bold'}>
              {failedTasks.length > 0 ? `${failedTasks.length} FAILED` : `${completedTasks.length}/${todayTasks.length} Done`}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/60 flex items-center justify-between">
            <span className="text-neutral-400">Daily Verdict:</span>
            <span className="text-neutral-200 truncate">{todayReflection ? 'Logged' : 'Pending'}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col min-h-[500px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[600px]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 space-y-2 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-neutral-100 text-neutral-950 font-medium'
                      : 'bg-neutral-950/90 border border-neutral-800 text-neutral-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  <div
                    className={`flex items-center justify-between text-[10px] font-mono pt-1 ${
                      isUser ? 'text-neutral-500' : 'text-neutral-500'
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded cursor-pointer ${
                        isUser ? 'hover:bg-neutral-200 text-neutral-700' : 'hover:bg-neutral-900 text-neutral-400'
                      }`}
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs font-mono text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Auditing choices & holding the mirror...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starters */}
        <div className="px-4 py-2 bg-neutral-950/60 border-t border-neutral-800/60 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 whitespace-nowrap">
            {quickStarters.map((starter, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(starter)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 border border-neutral-800 transition-colors cursor-pointer shrink-0"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800">
          <div className="relative flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reflect on today... What did you avoid? What excuses are you telling yourself? (Press Enter to send)"
              disabled={isLoading}
              className="flex-1 w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="p-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* THE MIRROR SPOTLIGHT (Who You Claim To Be vs Actions) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">
              The Mirror: Stated Identity vs Reality
            </h2>
          </div>
          <span className="text-xs text-neutral-400 font-mono">Gap Audit</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
            <span className="text-[11px] font-mono uppercase text-neutral-400 font-semibold">
              Who You Say You Want To Be
            </span>
            <p className="text-xs text-neutral-200 leading-relaxed font-medium">
              {mirror?.whoYouSayYouWantToBe || 'A relentlessly disciplined creator who executes regardless of cognitive discomfort or mood.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
            <span className="text-[11px] font-mono uppercase text-amber-400 font-semibold">
              Who Your Actions Say You Are
            </span>
            <p className="text-xs text-neutral-200 leading-relaxed font-medium">
              {mirror?.whoYourActionsSayYouAre || 'Someone who initiates with high intent, then bargains for comfort the moment friction escalates.'}
            </p>
          </div>
        </div>

        {/* Behavioral Pattern Callout */}
        {patterns.length > 0 && (
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Primary Blind Spot Pattern</span>
            </div>
            <div className="text-xs text-neutral-200 font-semibold">
              {patterns[0].pattern}
            </div>
            <div className="text-xs text-neutral-400">
              {patterns[0].evidence}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
