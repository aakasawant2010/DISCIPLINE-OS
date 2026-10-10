import React, { useEffect, useRef } from 'react';

interface DynamicBiometricWaveProps {
  recoveryPercentage: number;
  sleepPercentage: number;
}

export const DynamicBiometricWave: React.FC<DynamicBiometricWaveProps> = ({
  recoveryPercentage,
  sleepPercentage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    // Determine color scheme and pulsation based on recovery
    const isHigh = recoveryPercentage >= 67;
    const isMedium = recoveryPercentage >= 34 && recoveryPercentage < 67;

    const strokeColor = isHigh
      ? 'rgba(52, 211, 153, 0.75)' // Emerald
      : isMedium
      ? 'rgba(251, 191, 36, 0.75)' // Amber
      : 'rgba(244, 63, 94, 0.75)'; // Rose/Red

    const glowColor = isHigh
      ? 'rgba(16, 185, 129, 0.25)'
      : isMedium
      ? 'rgba(245, 158, 11, 0.25)'
      : 'rgba(225, 29, 72, 0.25)';

    // Dynamic particles
    const particles = Array.from({ length: 24 }).map(() => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 100),
      radius: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4 + 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    const render = () => {
      step += isHigh ? 0.035 : isMedium ? 0.025 : 0.018;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle particles drifting
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;
        if (p.y > height) p.y = 0;
        if (p.y < 0) p.y = height;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.6})`;
        ctx.fill();
      });

      // Draw undulating sine wave
      const amplitude = Math.max(12, (recoveryPercentage / 100) * 26);
      const frequency = (sleepPercentage / 100) * 0.012 + 0.008;

      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = glowColor;

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = strokeColor;

      const midY = height / 2;

      for (let x = 0; x <= width; x += 3) {
        // Compound sine harmonics
        const y =
          midY +
          Math.sin(x * frequency + step) * amplitude +
          Math.sin(x * 0.03 - step * 1.5) * (amplitude * 0.35);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Subtle heartbeat pulse spike
      const pulseX = ((step * 60) % (width + 100)) - 50;
      if (pulseX > 0 && pulseX < width) {
        ctx.beginPath();
        ctx.arc(pulseX, midY + Math.sin(pulseX * frequency + step) * amplitude, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 16;
        ctx.shadowColor = strokeColor;
        ctx.fill();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [recoveryPercentage, sleepPercentage]);

  return (
    <div className="relative w-full h-16 sm:h-20 overflow-hidden rounded-xl bg-neutral-950/80 border border-neutral-800/80">
      <canvas
        ref={canvasRef}
        width={900}
        height={80}
        className="w-full h-full block"
      />
      <div className="absolute top-2 left-3 flex items-center gap-2 pointer-events-none text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>DYNAMIC BIO-RHYTHM STREAM</span>
      </div>
      <div className="absolute top-2 right-3 pointer-events-none text-[10px] font-mono text-neutral-400 tabular-nums">
        RECOVERY: {recoveryPercentage}% · SLEEP: {sleepPercentage}%
      </div>
    </div>
  );
};
