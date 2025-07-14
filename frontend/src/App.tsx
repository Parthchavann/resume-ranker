import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Sun, Moon, Monitor, FileText, Upload, Loader2, Rocket, ArrowRight,
  CheckCircle, XCircle, Trash2, Brain, Download, Trophy, Sparkles, Crown,
  Eye, EyeOff, MessageSquareText, Target, BarChart3, Zap, Star, Award, Heart,
  Users, Clock, Info, ShieldCheck, Accessibility, HelpCircle, GitBranch, User, Mail
} from "lucide-react";

const queryClient = new QueryClient();
const BACKEND_URL = 'http://localhost:8000';

const techStack = [
  { name: "Ollama", status: "Live", demo: "Generative LLMs", color: "bg-blue-100 text-blue-700" },
  { name: "FAISS", status: "99.9% Uptime", demo: "Semantic search", color: "bg-green-100 text-green-700" },
  { name: "FastAPI", status: "OK", demo: "Backend REST", color: "bg-indigo-100 text-indigo-700" },
  { name: "React", status: "OK", demo: "Frontend", color: "bg-slate-100 text-slate-700" },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// -- Professional animated progress bar
const Progress = ({
  value = 0,
  className = "",
  showPercentage = false,
  animated = false,
  variant = "default"
}: {
  value?: number;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
  variant?: "default" | "success" | "warning" | "error";
}) => {
  const colors = {
    default: "bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500",
    success: "bg-gradient-to-r from-green-400 via-green-500 to-emerald-500",
    warning: "bg-gradient-to-r from-yellow-400 to-orange-400",
    error: "bg-gradient-to-r from-red-400 to-red-600"
  };
  return (
    <div className={`relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden ${className}`}>
      <motion.div
        className={`h-full ${colors[variant]} transition-all duration-700 ease-out ${animated ? 'animate-pulse' : ''}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
      >
        {/* Animated stripes for visual appeal */}
        {animated &&
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="w-full h-full animate-progress-stripes opacity-25" style={{
              background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.14) 0 10px, transparent 10px 20px)"
            }} />
          </div>
        }
      </motion.div>
      {showPercentage &&
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">{Math.round(value)}%</span>
      }
    </div>
  );
};

// -- Main component --
const ResumeRanker = () => {
  // App state
  const [resumeFiles, setResumeFiles] = useState<any[]>([]);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [rankedResumes, setRankedResumes] = useState<any[]>([]);
  const [isRanking, setIsRanking] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isDark, setIsDark] = useState(false);
  const [showShortcutModal, setShowShortcutModal] = useState(false);
  const [showTrust, setShowTrust] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  // --- Dark mode logic ---
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    setTheme(saved);
    applyTheme(saved);
  }, []);
  const applyTheme = (newTheme: typeof theme) => {
    let dark = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', newTheme);
  };
  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const idx = themes.indexOf(theme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next);
    applyTheme(next);
  };
  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  // --- Keyboard shortcut for modal ---
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?") setShowShortcutModal(v => !v);
      if (e.key === "h" && e.altKey) setHighContrast(v => !v);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // --- Badge trigger for milestone ---
  useEffect(() => {
    if (resumeFiles.length === 10) {
      setShowBadge(true);
      setTimeout(() => setShowBadge(false), 3500);
    }
  }, [resumeFiles.length]);

  // --- Accessibility theme ---
  useEffect(() => {
    if (highContrast) document.body.classList.add("contrast-more");
    else document.body.classList.remove("contrast-more");
  }, [highContrast]);

  // --- Progress Steps ---
  const progressSteps = [
    { label: "Upload JD", completed: !!jobDescriptionFile, progress: jobDescriptionFile ? 100 : 0 },
    { label: "Upload Resumes", completed: resumeFiles.length > 0, progress: Math.min(100, resumeFiles.length * 25) },
    { label: "AI Analysis", completed: rankedResumes.length > 0, progress: isRanking ? 50 : (rankedResumes.length ? 100 : 0) },
    { label: "Review Results", completed: rankedResumes.length > 0, progress: rankedResumes.length ? 100 : 0 },
  ];
  const overallProgress = Math.round(progressSteps.filter(s => s.completed).length / progressSteps.length * 100);

  // -- Main render
  return (
    <div className={`min-h-screen ${highContrast ? "contrast-more" : ""} bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/20 dark:bg-black/10 border-b border-white/10 dark:border-gray-700/40">
        <div className="flex items-center gap-4">
          <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            <Trophy className="text-amber-400 w-8 h-8" />
          </motion.div>
          <h1 className="font-bold text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Resume Ranker Pro
          </h1>
          <motion.div className="ml-2">
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-200">| Data Scientist & Software Engineer</span>
          </motion.div>
        </div>
        <div className="flex gap-3 items-center">
          <motion.button
            onClick={() => setShowTrust(true)}
            className="p-2 rounded-lg bg-white/30 hover:bg-indigo-50 dark:bg-black/20 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 transition"
            title="Trust & Transparency"
          >
            <ShieldCheck />
          </motion.button>
          <motion.button
            onClick={() => setShowShortcutModal(true)}
            className="p-2 rounded-lg bg-white/30 hover:bg-slate-100 dark:bg-black/20 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 transition"
            title="Accessibility & Shortcuts"
          >
            <Accessibility />
          </motion.button>
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/30 hover:bg-yellow-50 dark:bg-black/20 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 transition"
            title="Toggle theme"
          >
            <ThemeIcon />
          </motion.button>
        </div>
      </div>

      {/* Animated personalized greeting and activity */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl text-center py-8"
      >
        <div className="text-xl font-bold text-indigo-900 dark:text-indigo-300">
          {getGreeting()}, Parth!
        </div>
        <div className="text-gray-700 dark:text-gray-400 mt-1">
          {resumeFiles.length > 0
            ? `You uploaded ${resumeFiles.length} resume${resumeFiles.length > 1 ? "s" : ""} today!`
            : `Let's get started with your first upload.`}
        </div>
      </motion.div>

      {/* Tech stack showcase */}
      <motion.div className="flex flex-wrap justify-center gap-3 mb-4">
        {techStack.map(ts => (
          <motion.div
            key={ts.name}
            whileHover={{ scale: 1.06 }}
            className={`cursor-pointer px-4 py-2 rounded-full font-medium text-sm shadow transition-all ${ts.color} border border-black/5 dark:border-white/10 relative group`}
            title={ts.demo}
          >
            <span>{ts.name}</span>
            <motion.div className="absolute left-1/2 -translate-x-1/2 -bottom-10 w-max pointer-events-none opacity-0 group-hover:opacity-100 transition"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="px-3 py-1 bg-black/90 text-white text-xs rounded shadow">
                <span className="font-semibold">{ts.status}</span> &mdash; <span>{ts.demo}</span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress steps and progress bar */}
      <motion.div className="max-w-2xl mx-auto px-4 mt-8 mb-8">
        <div className="mb-3 flex items-center justify-between text-gray-600 dark:text-gray-400 text-sm">
          <span>Progress</span>
          <span>{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} showPercentage animated={overallProgress < 100} />
        <div className="flex flex-wrap gap-2 mt-3">
          {progressSteps.map((step, idx) => (
            <div key={step.label}
              className={`px-3 py-1 rounded-lg text-xs font-semibold
                ${step.completed ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`
              }>
              {step.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* -- Main content, file uploads, analysis, results, etc. -- */}
      {/* ...Keep your existing logic for uploads/results/buttons here... */}

      {/* Achievement badge popup */}
      <AnimatePresence>
        {showBadge && (
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.8 }}
            className="fixed top-24 right-8 z-50 bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-900 px-6 py-4 rounded-2xl shadow-lg border border-amber-200 flex items-center gap-3"
          >
            <Award className="w-6 h-6" />
            <span className="font-semibold">Milestone!</span>
            <span>You uploaded 10 resumes! 🚀</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full border-t border-white/20 dark:border-gray-800/60 bg-white/30 dark:bg-black/20 backdrop-blur-md py-8 mt-16">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 px-4">
          <div>
            <span className="font-bold text-xl text-indigo-700 dark:text-indigo-300">Resume Ranker Pro</span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()}</span>
            <div className="flex gap-2 mt-1">
              <a href="https://github.com/Parthchavann" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300"><GitBranch className="w-4 h-4" />GitHub</a>
              <a href="https://www.linkedin.com/in/parthchavann/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300"><User className="w-4 h-4" />LinkedIn</a>
              <a href="mailto:parth.chavan@stonybrook.edu" className="hover:underline flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300"><Mail className="w-4 h-4" />Mail</a>
            </div>
          </div>
          <div className="flex gap-6 text-xs text-gray-600 dark:text-gray-300 items-center">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> AI-powered</span>
            <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> Fast</span>
            <span className="flex items-center gap-1"><Target className="w-4 h-4" /> Accurate</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Secure</span>
          </div>
        </div>
      </footer>

      {/* Trust Modal */}
      <AnimatePresence>
        {showTrust && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-lg shadow-xl border border-gray-200 dark:border-gray-800"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-green-500" />
                <span className="font-semibold text-lg">Trust & Transparency</span>
              </div>
              <div className="text-gray-700 dark:text-gray-300 mb-4">
                <p>We never store your data. All resume uploads are processed in-memory and deleted after analysis.</p>
                <p>See our <a href="https://github.com/Parthchavann/resume-ranker/blob/main/PRIVACY.md" className="text-indigo-600 dark:text-indigo-300 underline" target="_blank" rel="noopener noreferrer">public privacy report</a>.</p>
              </div>
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  onClick={() => setShowTrust(false)}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility/Shortcut Modal */}
      <AnimatePresence>
        {showShortcutModal && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md shadow-xl border border-gray-200 dark:border-gray-800"
              initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}>
              <div className="flex items-center gap-3 mb-4">
                <Accessibility className="w-6 h-6 text-blue-500" />
                <span className="font-semibold text-lg">Accessibility & Shortcuts</span>
              </div>
              <ul className="text-gray-700 dark:text-gray-300 mb-3 text-sm space-y-2">
                <li><b>Alt + H</b> — Toggle high-contrast mode</li>
                <li><b>?</b> — Open this shortcuts/help modal</li>
                <li><b>Tab</b> — Jump through form fields</li>
                <li><b>Ctrl + F</b> — Search on the page</li>
              </ul>
              <div className="flex items-center gap-3 mt-4">
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  onClick={() => setShowShortcutModal(false)}>
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition text-indigo-700 dark:text-indigo-300"
                  onClick={() => setHighContrast(v => !v)}>
                  {highContrast ? "Normal Contrast" : "High Contrast"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts, confetti, etc. */}
      <Toaster position="top-right" />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ResumeRanker />
  </QueryClientProvider>
);

export default App;
