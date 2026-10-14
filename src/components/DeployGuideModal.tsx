import React, { useState } from 'react';
import {
  X,
  Github,
  Server,
  Cloud,
  Check,
  Copy,
  Terminal,
  FolderTree,
  BookOpen,
} from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitSnippet = `# 1. Initialize git and add all LocalLink source files
git init
git add .
git commit -m "feat: complete LocalLink community bidding platform"

# 2. Add your GitHub remote repository and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/locallink.git
git push -u origin main`;

  const installSnippet = `# Install dependencies
npm install

# Start development server (runs full-stack Express + Vite on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start`;

  const envSnippet = `# Standard environment variables (already configured in project)
PORT=3000
NODE_ENV=production`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold uppercase tracking-tight font-heading text-white">
              GitHub Sync & Deployment Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
          {/* Overview */}
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
            <h3 className="font-bold text-amber-950 font-heading uppercase text-sm mb-1">
              LocalLink Production Architecture
            </h3>
            <p className="text-slate-600 leading-relaxed">
              LocalLink is architected as a high-performance full-stack web application with an
              Express REST API and Vite React client. All jobs, competitive bids, worker profiles,
              and status updates (Open, Worker Selected, Completed) are persisted to the backend
              database with transparent browser client fallback.
            </p>
          </div>

          {/* Section 1: Sync to GitHub */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-heading flex items-center gap-2">
                <Github className="w-4 h-4 text-slate-900" />
                1. Sync Code to GitHub
              </h3>
              <button
                onClick={() => copyToClipboard(gitSnippet, 1)}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
              >
                {copiedIndex === 1 ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy Commands
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
              {gitSnippet}
            </pre>
          </div>

          {/* Section 2: Local Run & Build */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-heading flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-900" />
                2. Run & Build Locally
              </h3>
              <button
                onClick={() => copyToClipboard(installSnippet, 2)}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
              >
                {copiedIndex === 2 ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy Commands
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
              {installSnippet}
            </pre>
          </div>

          {/* Section 3: One-Click Cloud Deployment */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-heading flex items-center gap-2 mb-2">
              <Cloud className="w-4 h-4 text-slate-900" />
              3. Deploy to Production Platforms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="font-bold text-slate-900 mb-1">Google Cloud Run</div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Connect GitHub repo, select Node.js buildpack or Dockerfile, set port 3000.
                  Instant serverless auto-scaling.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="font-bold text-slate-900 mb-1">Render / Railway</div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Web Service: Build command <code>npm run build</code>, Start command{' '}
                  <code>npm start</code>. Zero config required.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="font-bold text-slate-900 mb-1">Vercel / Netlify</div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Static SPA mode with Vite. Output directory: <code>dist</code>. API proxy or
                  serverless functions mapped to <code>/api</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: File Structure */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-heading flex items-center gap-2 mb-2">
              <FolderTree className="w-4 h-4 text-slate-900" />
              4. Codebase Organization
            </h3>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] space-y-1 text-slate-700">
              <div>
                ├── <strong>server.ts</strong> - Express REST API & Vite middleware entrypoint
              </div>
              <div>
                ├── <strong>src/App.tsx</strong> - Main application container & state controller
              </div>
              <div>
                ├── <strong>src/types/index.ts</strong> - TypeScript definitions for Jobs, Bids &
                Profiles
              </div>
              <div>
                ├── <strong>src/services/api.ts</strong> - API service with persistence & local
                cache
              </div>
              <div>
                ├── <strong>src/data/seedData.ts</strong> - Initial seed data with realistic jobs &
                trades
              </div>
              <div>
                ├── <strong>src/components/</strong>
              </div>
              <div>
                │ ├── <strong>Navbar.tsx</strong> - Role switcher & navigation
              </div>
              <div>
                │ ├── <strong>MarketplaceFeed.tsx</strong> - Browse jobs, categories & search
              </div>
              <div>
                │ ├── <strong>CustomerDashboard.tsx</strong> - Customer view & bid management
              </div>
              <div>
                │ ├── <strong>WorkerDashboard.tsx</strong> - Worker pro hub & contract tracker
              </div>
              <div>
                │ ├── <strong>PostJobModal.tsx</strong> - Form validation & new job publisher
              </div>
              <div>
                │ ├── <strong>BidModal.tsx</strong> - Worker proposal & price submitter
              </div>
              <div>
                │ ├── <strong>BidComparisonModal.tsx</strong> - Side-by-side proposal comparison &
                hire
              </div>
              <div>
                │ └── <strong>CompleteJobModal.tsx</strong> - Job completion & 5-star review rating
              </div>
              <div>
                └── <strong>data/database.json</strong> - Persistent file database storage
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs uppercase font-heading tracking-wider"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
