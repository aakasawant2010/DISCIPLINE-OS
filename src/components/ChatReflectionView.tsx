import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import { 
  Send, 
  Sparkles, 
  RotateCcw, 
  Trash2, 
  Download, 
  Bot, 
  User, 
  Flame, 
  Moon, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Zap, 
  Brain,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

const STORAGE_KEY_CHAT = 'reset_app_chat_history';

export const ChatReflectionView: React.FC = () => {
  const { 
    profile, 
    setMode, 
    todayReflection, 
    biometrics, 
    futureGoals, 
    patterns, 
    memories 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Selected Gemini model
  const [modelType, setModelType] = useState<string>('gemini-3.5-flash');

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHAT);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Initial welcome message from AI
    return [
      {
        id: 'welcome-1',
        role: 'model',
        content: `Good evening, ${profile.name || 'Seeker'}. I am your RE:SET reflection partner.\n\nI have reviewed your data for today (${todayStr}):\n• Recovery: **${biometrics.recoveryPercentage}%**\n• Sleep: **${biometrics.sleepPercentage}%** (${biometrics.sleepHours || 7.5}h)\n• Today's Status: **${todayReflection ? 'Reflection Logged' : 'Pending Check-in'}**\n\nWhat happened today that you know you shouldn't have done—or what did you avoid even though you knew it mattered?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom
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
        mode: profile.mode,
        biometrics,
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
          mode: profile.mode,
          userContext,
          modelType,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || "Let's pause: what choice did you make today that you wish you hadn't?";

      const botMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `model-err-${Date.now()}`,
        role: 'model',
        content: `I hit a brief connectivity blip. Regardless, let's keep the focus on you: What is the single choice today that cast a vote for the person you want to become?`,
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
      content: `Fresh slate, ${profile.name || 'Friend'}.\n\nTell me what's on your mind right now. How was your discipline and attention today?`,
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
      .map((m) => `[${m.timestamp}] ${m.role === 'user' ? (profile.name || 'You') : 'RE:SET Coach'}:\n${m.content}\n`)
      .join('\n---\n\n');

    const blob = new Blob([`# RE:SET Daily Reflection Transcript — ${todayStr}\n\n${transcript}`], {
      type: 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reset-chat-reflection-${todayStr}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Quick prompt starters
  const quickStarters = [
    'Audit my day: Where did my actions betray my stated priorities?',
    `Given my ${biometrics.recoveryPercentage}% recovery, why was my focus fragmented today?`,
    'Am I giving myself an excuse about my afternoon productivity?',
    'Help me formulate my 3 non-negotiables for tomorrow.',
    'What behavioral pattern in my history am I repeating right now?',
  ];

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-400">
                <Brain className="w-4 h-4" />
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-neutral-100 font-display">
                Daily Reflection Coach
              </h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                profile.mode === 'brutal'
                  ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}>
                {profile.mode === 'brutal' ? 'Brutal Honesty' : 'Normal'}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Interactive multi-turn reflection grounded in your recovery ({biometrics.recoveryPercentage}%), daily logs, and long-term goals.
            </p>
          </div>

          {/* Model selector & controls */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Model Selector */}
            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1 text-xs font-mono">
              <span className="text-[10px] text-neutral-500 px-2 hidden md:inline">Model:</span>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="bg-transparent text-neutral-300 text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="gemini-3.5-flash" className="bg-neutral-900">Gemini 3.5 Flash (General)</option>
                <option value="gemini-3.1-flash-lite" className="bg-neutral-900">Gemini 3.1 Flash Lite (Fast)</option>
                <option value="gemini-3.1-pro-preview" className="bg-neutral-900">Gemini 3.1 Pro (Deep Reasoning)</option>
                <option value="gemini-3.8-flash" className="bg-neutral-900">Gemini 3.8 Flash</option>
              </select>
            </div>

            {/* Brutal / Normal Toggle */}
            <div className="flex items-center p-0.5 bg-neutral-950 border border-neutral-800 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('normal')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                  profile.mode === 'normal'
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setMode('brutal')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  profile.mode === 'brutal'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Brutal
              </button>
            </div>

            {/* Clear Chat */}
            <button
              type="button"
              onClick={handleClearChat}
              title="Clear conversation and start fresh"
              className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Export Transcript */}
            <button
              type="button"
              onClick={handleExportTranscript}
              title="Export reflection transcript as Markdown"
              className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Context Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-neutral-400 border-t border-neutral-800/80">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Recovery: <strong className={biometrics.recoveryPercentage >= 67 ? 'text-emerald-400' : 'text-amber-400'}>{biometrics.recoveryPercentage}%</strong></span>
          </div>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          <div className="flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sleep: <strong className="text-indigo-400">{biometrics.sleepPercentage}%</strong></span>
          </div>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          <div className="flex items-center gap-1.5">
            {todayReflection ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Today's Audit Synced
              </span>
            ) : (
              <span className="text-amber-400">
                Today's Log Pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chat Thread Box */}
      <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-col h-[560px] overflow-hidden">
        {/* Scrollable messages container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  isUser
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
                    : 'bg-neutral-950 border-neutral-800 text-amber-400'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1 max-w-[85%] sm:max-w-[78%]">
                  <div className="flex items-center justify-between gap-2 px-1 text-[11px] font-mono text-neutral-500">
                    <span>{isUser ? (profile.name || 'You') : 'RE:SET Reflection Engine'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap relative group border ${
                    isUser
                      ? 'bg-neutral-800 text-neutral-100 border-neutral-700 rounded-tr-sm shadow-md'
                      : 'bg-neutral-950/80 text-neutral-200 border-neutral-800/90 rounded-tl-sm'
                  }`}>
                    {msg.content}

                    {/* Copy action button */}
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="absolute bottom-2 right-2 p-1 rounded-md bg-neutral-900/80 text-neutral-500 hover:text-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Thinking / Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-xl mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-2 font-mono">Analyzing your daily votes...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Starters Bar */}
        <div className="px-4 py-2 bg-neutral-950/60 border-t border-neutral-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[11px] text-neutral-500 shrink-0 font-mono">Prompts:</span>
          {quickStarters.map((starter, i) => (
            <button
              key={i}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(starter)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 border border-neutral-800/80 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {starter}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                rows={2}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What happened today? Where was the resistance? (Press Enter to send, Shift+Enter for newline)"
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 p-3 pr-10 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className={`p-3 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                inputMessage.trim() && !isLoading
                  ? 'bg-neutral-100 hover:bg-white text-neutral-950 shadow-md'
                  : 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-800'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
