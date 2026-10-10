import React, { useState } from 'react';
import { 
  Laptop, 
  Terminal, 
  Copy, 
  Check, 
  X, 
  Download, 
  ExternalLink,
  ShieldAlert,
  FolderGit2,
  Play
} from 'lucide-react';

interface InstallPcModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPcModal: React.FC<InstallPcModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Prerequisites',
      description: 'Make sure Node.js (version 18 or 20+) and Git are installed on your Windows, Mac, or Linux computer.',
      command: 'node -v && git --version',
    },
    {
      title: '2. Clone or Download Codebase',
      description: 'Open Terminal or PowerShell in your preferred folder and clone or download the repository files.',
      command: 'git clone <your-repository-url> reset-app\ncd reset-app',
    },
    {
      title: '3. Install Dependencies',
      description: 'Install all React, Vite, Express, and Gemini SDK packages via npm or bun.',
      command: 'npm install',
    },
    {
      title: '4. Setup Environment File',
      description: 'Create a .env file from the template and provide your Google Gemini API Key.',
      command: 'cp .env.example .env\n# Open .env and insert: GEMINI_API_KEY=your_key_here',
    },
    {
      title: '5. Launch Local Dev Server',
      description: 'Start the full-stack server running React SPA + Express backend proxy.',
      command: 'npm run dev',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100">
              <Laptop className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100 font-display">
                How to Run RE:SET on Your PC
              </h2>
              <p className="text-xs text-neutral-400">
                Full-stack local development & standalone desktop installation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option A: Quick PWA 1-Click Install */}
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
            <Download className="w-4 h-4" />
            <span>Fastest Option: Install as Desktop App (PWA)</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            In <strong>Google Chrome</strong>, <strong>Brave</strong>, or <strong>Microsoft Edge</strong>, click the <strong>Install App icon (⊕)</strong> right in your browser's URL address bar. This installs RE:SET directly to your Windows desktop or macOS Applications as a native window with full offline local storage support!
          </p>
        </div>

        {/* Option B: Local CLI Steps */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Terminal Setup Instructions</span>
          </div>

          {steps.map((s, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-200">{s.title}</span>
                <button
                  onClick={() => handleCopy(s.command, idx)}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-100 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded transition-colors cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-neutral-400">{s.description}</p>
              <pre className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                {s.command}
              </pre>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-500 gap-2 border-t border-neutral-800">
          <span>Dev port: http://localhost:3000</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-xl transition-colors cursor-pointer self-end sm:self-auto"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
