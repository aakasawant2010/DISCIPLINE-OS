import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TheMirrorData } from '../types';
import { 
  Sparkles, 
  RotateCw, 
  ShieldAlert, 
  Target, 
  Eye, 
  Split, 
  Trophy, 
  Repeat, 
  Compass, 
  ArrowRight,
  Flame
} from 'lucide-react';

export const TheMirrorView: React.FC = () => {
  const { mirror, setMirror, reflections, futureGoals, memories, profile } = useApp();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generateMirror = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/mirror/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reflections,
          futureGoals,
          memories,
          mode: profile.mode,
        }),
      });

      if (!response.ok) {
        throw new Error('Mirror endpoint error');
      }

      const data: TheMirrorData = await response.json();
      setMirror(data);
    } catch (e: any) {
      console.error('Mirror error:', e);
      setErrorMsg('Failed to update mirror with current data. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title & Introduction */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono uppercase tracking-wider text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Signature Reality Check</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-100 font-display tracking-tight">
          THE MIRROR
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
          The unvarnished confrontation between the person you declare you want to become and who your logged daily actions prove you actually are.
        </p>

        <div className="pt-2">
          <button
            onClick={generateMirror}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-neutral-200/10 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Scanning Patterns & Generating Mirror...</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>SHOW ME THE MIRROR</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs text-center">
          {errorMsg}
        </div>
      )}

      {mirror ? (
        <div className="space-y-6">
          {/* 1. The Contrast: Stated vs Actual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stated identity */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
                <Target className="w-4 h-4 text-blue-400" />
                <span>WHO YOU SAY YOU WANT TO BE</span>
              </div>
              <p className="text-sm sm:text-base text-neutral-100 font-medium leading-relaxed">
                "{mirror.whoYouSayYouWantToBe}"
              </p>
            </div>

            {/* Inferred behavior */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>WHO YOUR ACTIONS SAY YOU ARE</span>
              </div>
              <p className="text-sm sm:text-base text-neutral-100 font-medium leading-relaxed">
                "{mirror.whoYourActionsSayYouAre}"
              </p>
            </div>
          </div>

          {/* 2. The Gap (Core Insight) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/90 border border-amber-900/40 relative overflow-hidden space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              <Split className="w-4 h-4" />
              <span>THE GAP</span>
            </div>
            <p className="text-base sm:text-lg text-neutral-100 font-medium leading-relaxed">
              "{mirror.theGap}"
            </p>
          </div>

          {/* 3. Strongest Trait, Biggest Pattern, Blind Spot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                <Trophy className="w-4 h-4" />
                <span>YOUR STRONGEST TRAIT</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                {mirror.strongestTrait}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                <Repeat className="w-4 h-4" />
                <span>YOUR BIGGEST PATTERN</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                {mirror.biggestPattern}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                <Eye className="w-4 h-4" />
                <span>YOUR BIGGEST BLIND SPOT</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                {mirror.biggestBlindSpot}
              </p>
            </div>
          </div>

          {/* 4. What You Should Do Next */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>WHAT YOU SHOULD DO NEXT</span>
              </div>
              <span className="text-xs text-neutral-500 font-mono">3 Concrete Directives</span>
            </div>

            <div className="space-y-2.5">
              {mirror.whatYouShouldDoNext.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs sm:text-sm text-neutral-200">
                  <span className="font-mono text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Signature Closing Motto */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 text-center space-y-3">
            <p className="text-base sm:text-lg text-neutral-200 font-serif italic max-w-2xl mx-auto leading-relaxed">
              "{mirror.closingQuote}"
            </p>
            <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest">
              Last mirror reflection generated {new Date(mirror.generatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/30 border border-neutral-800 space-y-3">
          <p className="text-sm text-neutral-400">
            Click "SHOW ME THE MIRROR" to synthesize your historical reflections against your stated identity goals.
          </p>
        </div>
      )}
    </div>
  );
};
