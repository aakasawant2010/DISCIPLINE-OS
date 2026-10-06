import React, { useState } from 'react';
import { LIFE_AREAS_CONFIG } from '../data/demoData';
import { TrendingUp, TrendingDown, Flame, Activity, Zap, CheckCircle2 } from 'lucide-react';

export const LifeAreasView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'7' | '30' | '90'>('30');

  // Multipliers based on timeframe
  const getHistoricalPoints = (base: number, seed: number) => {
    const pointsCount = timeframe === '7' ? 7 : timeframe === '30' ? 14 : 20;
    const points: number[] = [];
    for (let i = 0; i < pointsCount; i++) {
      const variation = Math.sin((i + seed) * 0.8) * 6 + ((i / pointsCount) * 4);
      points.push(Math.round(Math.min(99, Math.max(40, base - 5 + variation))));
    }
    return points;
  };

  const improving = LIFE_AREAS_CONFIG.filter((a) => a.trend.startsWith('+'));
  const declining = LIFE_AREAS_CONFIG.filter((a) => a.trend.startsWith('-'));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 font-display">
            MY LIFE
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Long-term behavioral index tracking across 12 human dimensions.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          <button
            onClick={() => setTimeframe('7')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              timeframe === '7'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            7-Day Trend
          </button>
          <button
            onClick={() => setTimeframe('30')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              timeframe === '30'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            30-Day Trend
          </button>
          <button
            onClick={() => setTimeframe('90')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              timeframe === '90'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            90-Day Trend
          </button>
        </div>
      </div>

      {/* AI Trajectory Synthesis summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide">
            <TrendingUp className="w-4 h-4" />
            <span>Improving Areas ({improving.length})</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Your physical baseline (<strong className="text-neutral-100">Fitness +8%, Health +4%</strong>) and mental discipline (<strong className="text-neutral-100">Discipline +5%</strong>) are steadily compounding due to uninterrupted morning training anchors.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wide">
            <TrendingDown className="w-4 h-4" />
            <span>Declining Areas ({declining.length})</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            <strong className="text-neutral-100">Active Learning (-6%)</strong> and <strong className="text-neutral-100">Play & Renewal (-8%)</strong> show vulnerability. You are trading restorative play for passive scrolling and mistaking tutorial watching for active learning.
          </p>
        </div>
      </div>

      {/* 12 Life Dimension Cards with SVG Sparkline Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LIFE_AREAS_CONFIG.map((area, idx) => {
          const points = getHistoricalPoints(area.baseline, idx);
          const isUp = area.trend.startsWith('+');
          const minVal = Math.min(...points) - 5;
          const maxVal = Math.max(...points) + 5;
          const range = maxVal - minVal || 1;

          // SVG polyline points coordinates
          const svgPoints = points
            .map((p, i) => {
              const x = (i / (points.length - 1)) * 140;
              const y = 35 - ((p - minVal) / range) * 30;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ');

          return (
            <div
              key={area.id}
              className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-4 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-200 font-display">
                    {area.name}
                  </h3>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-2xl font-extrabold font-mono text-neutral-100 tabular-nums">
                      {area.baseline}
                    </span>
                    <span className="text-xs font-mono text-neutral-500">/ 100</span>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    isUp ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{area.trend}</span>
                </div>
              </div>

              {/* Sparkline chart */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>{timeframe}d Trend</span>
                  <span>Latest: {points[points.length - 1]}</span>
                </div>
                <div className="h-10 w-full bg-neutral-950/80 rounded-lg p-1 border border-neutral-800/80 flex items-center">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 140 35">
                    <polyline
                      fill="none"
                      stroke={area.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={svgPoints}
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
