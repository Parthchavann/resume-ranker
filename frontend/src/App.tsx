import React, { useState, useRef, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Progress } from "./components/ui/progress"; // Ensure this path is correct
import {
  Upload, FileText, XCircle, Trash2, Loader2, Download, MessageSquareText, Trophy,
  Sparkles, Crown, CheckCircle, Target, BarChart3, Brain, ArrowRight, Rocket,
  Sun, Moon, Monitor, ArrowUp, Zap, Star, Award, Eye, EyeOff, Heart, Users, Clock
} from 'lucide-react';

const queryClient = new QueryClient();
const BACKEND_URL = 'http://localhost:8000'; // Make sure your backend is running on this URL

interface ResumeFile {
  id: string;
  file: File;
  textPreview: string;
}

interface RankedResume {
  resume_id: string;
  filename: string;
  score: number;
  snippet: string;
  full_text: string;
  feedback?: string;
  showFeedback?: boolean;
}

type Theme = 'light' | 'dark' | 'system';

const ResumeRanker = () => {
  const [resumeFiles, setResumeFiles] = useState<ResumeFile[]>([]);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState<string>('');
  const [rankedResumes, setRankedResumes] = useState<RankedResume[]>([]);
  const [isRanking, setIsRanking] = useState(false);
  const [isUploadingResumes, setIsUploadingResumes] = useState(false);
  const [feedbackLoadingResumeId, setFeedbackLoadingResumeId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);

  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  // Dark mode functionality
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    let shouldBeDark = false;

    if (newTheme === 'dark') {
      shouldBeDark = true;
    } else if (newTheme === 'light') {
      shouldBeDark = false;
    } else {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      default:
        return Monitor;
    }
  };

  // Scroll to top functionality
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsScrollToTopVisible(true);
      } else {
        setIsScrollToTopVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Progress steps
  const progressSteps = [
    {
      id: 'jd',
      label: 'Upload JD',
      description: 'Upload your job description PDF to define the requirements',
      icon: FileText,
      completed: !!jobDescriptionFile,
      progress: jobDescriptionFile ? 100 : 0
    },
    {
      id: 'resumes',
      label: 'Upload Resumes',
      description: 'Add multiple resume files for comprehensive analysis',
      icon: Upload,
      completed: resumeFiles.length > 0,
      progress: resumeFiles.length > 0 ? Math.min(100, (resumeFiles.length / 5) * 100) : 0
    },
    {
      id: 'analysis',
      label: 'AI Analysis',
      description: 'Advanced semantic matching using state-of-the-art AI models',
      icon: Brain,
      completed: rankedResumes.length > 0,
      progress: isRanking ? 50 : (rankedResumes.length > 0 ? 100 : 0)
    },
    {
      id: 'results',
      label: 'Review Results',
      description: 'Explore rankings, insights, and actionable feedback',
      icon: Trophy,
      completed: rankedResumes.length > 0,
      progress: rankedResumes.length > 0 ? 100 : 0
    }
  ];

  const currentStep = progressSteps.findIndex(step => !step.completed);
  const overallProgress = Math.round((progressSteps.filter(s => s.completed).length / progressSteps.length) * 100);

  // File handling functions
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const isDuplicateFile = (newFile: File) => {
    return resumeFiles.some(
      (existingFile) =>
        existingFile.file.name === newFile.name && existingFile.file.size === newFile.size
    );
  };

  const handleResumeFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFilesToAdd: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/pdf') {
        toast.error(`File "${file.name}" is not a PDF. Only PDF files are allowed.`);
        continue;
      }
      if (isDuplicateFile(file)) {
        toast.warning(`Duplicate file skipped: "${file.name}"`);
        continue;
      }
      newFilesToAdd.push(file);
    }

    if (newFilesToAdd.length === 0) {
      if (resumeFileInputRef.current) resumeFileInputRef.current.value = '';
      return;
    }

    setIsUploadingResumes(true);
    let successfulUploads = 0;
    const uploadedResumeDetails: ResumeFile[] = [];

    for (const file of newFilesToAdd) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${BACKEND_URL}/upload_resume/`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to upload ${file.name}`);
        }

        const data = await response.json();
        uploadedResumeDetails.push({
          id: data.resume_id,
          file: file,
          textPreview: `Successfully uploaded: ${file.name}`
        });
        toast.success(`Resume "${file.name}" uploaded successfully!`);
        successfulUploads++;
      } catch (error: any) {
        toast.error(`Error uploading "${file.name}": ${error.message}`);
        console.error(`Error uploading ${file.name}:`, error);
      }
    }

    if (successfulUploads > 0) {
      setResumeFiles((prevFiles) => [...prevFiles, ...uploadedResumeDetails]);
    }
    setIsUploadingResumes(false);
    if (resumeFileInputRef.current) resumeFileInputRef.current.value = '';
  };

  const handleRemoveResume = (idToRemove: string) => {
    setResumeFiles((prevFiles) => prevFiles.filter((resume) => resume.id !== idToRemove));
    toast.info(`Resume removed.`);
  };

  const handleJobDescriptionFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed for the Job Description.');
      if (jdFileInputRef.current) jdFileInputRef.current.value = '';
      return;
    }
    setJobDescriptionFile(file);
    toast.success(`Job Description "${file.name}" selected.`);
  };

  const handleClearJobDescription = () => {
    setJobDescriptionFile(null);
    setJobDescriptionText('');
    if (jdFileInputRef.current) jdFileInputRef.current.value = '';
    toast.info('Job Description cleared.');
  };

  const handleRankResumes = async () => {
    if (!jobDescriptionFile) {
      toast.error('Please upload a Job Description PDF first.');
      return;
    }
    if (resumeFiles.length === 0) {
      toast.error('Please upload at least one Resume PDF first.');
      return;
    }

    setIsRanking(true);
    setRankedResumes([]);
    setJobDescriptionText('');

    const formData = new FormData();
    formData.append('jd_file', jobDescriptionFile);
    resumeFiles.forEach(resume => formData.append('resume_ids', resume.id)); // Send resume IDs

    try {
      const response = await fetch(`${BACKEND_URL}/rank_resumes/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to rank resumes.');
      }

      const data = await response.json();
      const rankedData = data.ranked_resumes.map((r: any) => ({ ...r, showFeedback: false }));
      setRankedResumes(rankedData);
      setJobDescriptionText(data.job_description_text);

      if (rankedData.length > 0 && rankedData[0].score < 0.2) {
        triggerConfetti();
      }

      toast.success('Resumes ranked successfully!');
    } catch (error: any) {
      toast.error(`Error ranking resumes: ${error.message}`);
      console.error('Error ranking resumes:', error);
    } finally {
      setIsRanking(false);
    }
  };

  const handleGetLLMFeedback = async (resume: RankedResume) => {
    if (feedbackLoadingResumeId === resume.resume_id) return;
    if (!jobDescriptionText) {
      toast.error("Job Description text is not available. Please rank resumes first.");
      return;
    }

    setFeedbackLoadingResumeId(resume.resume_id);

    try {
      const response = await fetch(`${BACKEND_URL}/llm_feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_text: resume.full_text,
          jd_text: jobDescriptionText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get LLM feedback.');
      }

      const data = await response.json();
      setRankedResumes((prev) =>
        prev.map((r) =>
          r.resume_id === resume.resume_id
            ? { ...r, feedback: data.feedback, showFeedback: true }
            : r
        )
      );
      toast.success('LLM feedback generated!');
    } catch (error: any) {
      toast.error(`Error getting LLM feedback: ${error.message}`);
      console.error('Error getting LLM feedback:', error);
    } finally {
      setFeedbackLoadingResumeId(null);
    }
  };

  const handleDownloadFeedback = (feedback: string, filename: string) => {
    const blob = new Blob([feedback], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback_${filename.replace('.pdf', '')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.info('Feedback downloaded!');
  };

  const toggleFeedbackVisibility = (resumeId: string) => {
    setRankedResumes((prev) =>
      prev.map((r) =>
        r.resume_id === resumeId ? { ...r, showFeedback: !r.showFeedback } : r
      )
    );
  };

  const getScoreColor = (score: number, index: number) => {
    if (index === 0) return 'from-emerald-400 to-green-500';
    if (score < 0.3) return 'from-emerald-400 to-teal-500';
    if (score < 0.6) return 'from-yellow-400 to-orange-500';
    return 'from-orange-400 to-red-500';
  };

  const ThemeIcon = getThemeIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 transition-colors duration-500">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/95 via-blue-50/90 to-indigo-100/95 dark:from-slate-950/95 dark:via-blue-950/90 dark:to-indigo-950/95 backdrop-blur-3xl transition-colors duration-500"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-pink-400/30 to-violet-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Dark Mode Toggle - Fixed Position Top Right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-6 right-6 z-50"
      >
        <motion.button
          onClick={toggleTheme}
          className="relative p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={`Current theme: ${theme}`}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ThemeIcon className="w-5 h-5" />
          </motion.div>

          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
            {['light', 'dark', 'system'].map((t, index) => (
              <motion.div
                key={t}
                className={`w-1 h-1 rounded-full transition-colors ${
                  theme === t ? 'bg-white' : 'bg-white/40'
                }`}
                animate={{
                  scale: theme === t ? 1.2 : 1,
                  opacity: theme === t ? 1 : 0.6
                }}
              />
            ))}
          </div>
        </motion.button>
      </motion.div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {isScrollToTopVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 ${
                ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 5]
              } rounded-full`}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
                scale: 0
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 p-4 sm:p-8 font-sans text-gray-800 dark:text-gray-200">
        <Toaster position="top-center" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 pt-8"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-8 py-3 rounded-full text-sm font-bold mb-6 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 cursor-default"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Crown className="w-5 h-5" />
            </motion.div>
            Ollama-Powered Resume Intelligence
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-6xl sm:text-8xl font-black mb-6 tracking-tight"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
          >
            <span className="bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 dark:from-slate-200 dark:via-blue-300 dark:to-indigo-200 bg-clip-text text-transparent drop-shadow-2xl">
              Resume Ranker
            </span>
            <motion.span
              className="text-4xl sm:text-5xl block mt-3 font-light bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Pro
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Discover which resumes best match your job description using{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
              advanced AI semantic analysis
            </span>
          </motion.p>

          <motion.div
            className="flex justify-center gap-8 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {[
              { icon: Target, label: "Precision", value: "95%" },
              { icon: Zap, label: "Speed", value: "<10s" },
              { icon: Brain, label: "AI-Powered", value: "Ollama" }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-2">
                  <stat.icon className="w-6 h-6 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{stat.value}</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          className="max-w-6xl mx-auto mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl p-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </motion.div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Smart Progress Tracker
                </h3>
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>

              <div className="max-w-md mx-auto">
                <Progress
                  value={overallProgress}
                  className="h-3 shadow-lg"
                />
                <motion.p
                  className="text-sm text-gray-600 dark:text-gray-400 mt-2"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {overallProgress === 100 ? '🎉 All steps completed!' : `${progressSteps.filter(s => s.completed).length} of ${progressSteps.length} steps completed`}
                </motion.p>
              </div>
            </motion.div>

            {/* Progress Steps */}
            <div className="relative">
              <div className="absolute top-8 left-8 right-8 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>

              <div className="relative flex justify-between items-start">
                {progressSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className="flex flex-col items-center flex-1 group"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <motion.div
                      className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                        step.completed
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 shadow-lg shadow-green-500/25'
                          : index === (currentStep >= 0 ? currentStep : progressSteps.length - 1)
                          ? 'bg-gradient-to-br from-blue-400 to-purple-500 border-blue-300 shadow-lg shadow-blue-500/25 animate-pulse'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                      }`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <AnimatePresence mode="wait">
                        {step.completed ? (
                          <motion.div
                            key="completed"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <CheckCircle className="w-8 h-8 text-white" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="icon"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={`${
                              index === (currentStep >= 0 ? currentStep : progressSteps.length - 1) ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            <step.icon className="w-6 h-6" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      className="mt-4 text-center max-w-[120px]"
                      animate={{
                        y: index === (currentStep >= 0 ? currentStep : progressSteps.length - 1) ? [0, -2, 0] : 0
                      }}
                      transition={{
                        duration: 2,
                        repeat: index === (currentStep >= 0 ? currentStep : progressSteps.length - 1) ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                    >
                      <h4 className={`text-sm font-semibold transition-colors ${
                        step.completed
                          ? 'text-green-600 dark:text-green-400'
                          : index === (currentStep >= 0 ? currentStep : progressSteps.length - 1)
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {step.label}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 leading-tight">
                        {step.description}
                      </p>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* File Upload Section */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Job Description Upload */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group"
          >
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-blue-200/50 dark:border-blue-700/50 p-8 rounded-3xl shadow-2xl hover:shadow-blue-200/50 dark:hover:shadow-blue-800/50 transition-all duration-500 hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-300">Job Description</h2>
                  <p className="text-blue-600/80 dark:text-blue-400/80 text-sm">Upload the target job posting</p>
                </div>
              </div>

              <label
                htmlFor="jd-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-2xl cursor-pointer bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/50 dark:to-indigo-950/50 hover:from-blue-100/50 hover:to-indigo-100/50 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all duration-300 group-hover:border-blue-400"
              >
                <div className="flex flex-col items-center justify-center py-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Upload className="w-10 h-10 text-blue-500 dark:text-blue-400 mb-3" />
                  </motion.div>
                  <p className="mb-2 text-lg font-semibold text-blue-700 dark:text-blue-300">
                    Drop your job description here
                  </p>
                  <p className="text-sm text-blue-500 dark:text-blue-400">PDF format • Max 5MB</p>
                </div>
                <input
                  id="jd-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleJobDescriptionFileChange}
                  ref={jdFileInputRef}
                />
              </label>

              <AnimatePresence>
                {jobDescriptionFile && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 p-4 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-900/80 dark:to-indigo-900/80 rounded-2xl flex items-center justify-between border border-blue-200/50 dark:border-blue-700/50 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-blue-800 dark:text-blue-200 truncate">{jobDescriptionFile.name}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClearJobDescription}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                      title="Clear Job Description"
                    >
                      <XCircle className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Resumes Upload */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group"
          >
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-purple-200/50 dark:border-purple-700/50 p-8 rounded-3xl shadow-2xl hover:shadow-purple-200/50 dark:hover:shadow-purple-800/50 transition-all duration-500 hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-300">Resume Collection</h2>
                  <p className="text-purple-600/80 dark:text-purple-400/80 text-sm">Upload multiple resume files</p>
                </div>
              </div>

              <label
                htmlFor="resume-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-2xl cursor-pointer bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/50 dark:to-pink-950/50 hover:from-purple-100/50 hover:to-pink-100/50 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 transition-all duration-300 group-hover:border-purple-400"
              >
                <div className="flex flex-col items-center justify-center py-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Upload className="w-10 h-10 text-purple-500 dark:text-purple-400 mb-3" />
                  </motion.div>
                  <p className="mb-2 text-lg font-semibold text-purple-700 dark:text-purple-300">
                    Drop resumes here (or click)
                  </p>
                  <p className="text-sm text-purple-500 dark:text-purple-400">PDF format • Multiple files</p>
                </div>
                <input
                  id="resume-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  multiple
                  onChange={handleResumeFileChange}
                  ref={resumeFileInputRef}
                />
              </label>

              <AnimatePresence>
                {resumeFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 space-y-3 max-h-64 overflow-y-auto pr-2"
                  >
                    {resumeFiles.map((resume) => (
                      <motion.div
                        key={resume.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="p-3 bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/80 dark:to-pink-900/80 rounded-2xl flex items-center justify-between border border-purple-200/50 dark:border-purple-700/50 shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-500 p-2 rounded-lg">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-purple-800 dark:text-purple-200 truncate">{resume.file.name}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveResume(resume.id)}
                          className="ml-2 text-purple-600 dark:text-purple-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                          title="Remove Resume"
                        >
                          <XCircle className="w-5 h-5" />
                        </motion.button>
                      </motion.div>
                    ))}
                    {isUploadingResumes && (
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-md animate-pulse">
                        <Loader2 className="w-5 h-5 mr-2 text-gray-500 animate-spin" />
                        <span className="text-gray-600 dark:text-gray-400">Uploading resumes...</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Rank Resumes Button */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-16"
        >
          <button
            onClick={handleRankResumes}
            disabled={!jobDescriptionFile || resumeFiles.length === 0 || isRanking || isUploadingResumes}
            className={`px-12 py-5 rounded-full text-xl font-bold transition-all duration-300 transform flex items-center justify-center gap-3 mx-auto
              ${
                (!jobDescriptionFile || resumeFiles.length === 0 || isRanking || isUploadingResumes)
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed shadow-inner'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-2xl hover:scale-105 hover:from-teal-600 hover:to-emerald-700 active:scale-95 active:shadow-lg'
              }`}
            whileHover={{ scale: (!jobDescriptionFile || resumeFiles.length === 0 || isRanking || isUploadingResumes) ? 1 : 1.05 }}
            whileTap={{ scale: (!jobDescriptionFile || resumeFiles.length === 0 || isRanking || isUploadingResumes) ? 1 : 0.95 }}
          >
            {isRanking ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Analyzing Resumes...
              </>
            ) : (
              <>
                <BarChart3 className="w-6 h-6" />
                Rank Resumes Now!
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
            {isRanking ? "This might take a moment based on the number of resumes." : "Click to get instant rankings based on your job description."}
          </p>
        </motion.div>

        {/* Ranked Resumes Display */}
        <AnimatePresence>
          {rankedResumes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                <Trophy className="inline-block w-9 h-9 mr-3 mb-1 text-yellow-500" />
                Top Candidates Ranked
                <Trophy className="inline-block w-9 h-9 ml-3 mb-1 text-yellow-500" />
              </h2>

              <div className="space-y-6">
                {rankedResumes.map((resume, index) => (
                  <motion.div
                    key={resume.resume_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <motion.div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg
                          bg-gradient-to-br ${getScoreColor(resume.score, index)}`}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: index * 0.15 }}
                      >
                        {index + 1}
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                          {resume.filename}
                          {index === 0 && <Award className="w-5 h-5 ml-2 text-yellow-500" />}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Score: <span className="font-semibold text-lg">{ (resume.score * 100).toFixed(2) }%</span>
                        </p>
                      </div>
                    </div>

                    <div className="w-full md:flex-1 md:ml-8">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Match Snippet:</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                        {resume.snippet || "No specific snippet available."}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                      <motion.button
                        onClick={() => handleGetLLMFeedback(resume)}
                        disabled={feedbackLoadingResumeId === resume.resume_id || !jobDescriptionText}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300
                          ${feedbackLoadingResumeId === resume.resume_id
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600 shadow-md hover:shadow-lg'
                          }`}
                        whileHover={{ scale: feedbackLoadingResumeId === resume.resume_id ? 1 : 1.05 }}
                        whileTap={{ scale: feedbackLoadingResumeId === resume.resume_id ? 1 : 0.95 }}
                      >
                        {feedbackLoadingResumeId === resume.resume_id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <MessageSquareText className="w-4 h-4" />
                            Get AI Feedback
                          </>
                        )}
                      </motion.button>
                      {resume.feedback && (
                        <motion.button
                          onClick={() => toggleFeedbackVisibility(resume.resume_id)}
                          className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:from-orange-500 hover:to-pink-600 shadow-md hover:shadow-lg transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {resume.showFeedback ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Hide Feedback
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              View Feedback
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Modals/Display Area */}
        <AnimatePresence>
          {rankedResumes.map((resume) => (
            resume.showFeedback && resume.feedback && (
              <motion.div
                key={`feedback-${resume.resume_id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative border border-gray-200 dark:border-gray-700"
                >
                  <button
                    onClick={() => toggleFeedbackVisibility(resume.resume_id)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <MessageSquareText className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
                    AI Feedback for {resume.filename}
                  </h3>
                  <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed overflow-auto">
                    {/* Render feedback with line breaks */}
                    {resume.feedback.split('\n').map((line, i) => (
                      <p key={i} className="mb-2">{line}</p>
                    ))}
                  </div>
                  <div className="flex justify-end mt-6">
                    <motion.button
                      onClick={() => handleDownloadFeedback(resume.feedback, resume.filename)}
                      className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-md hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="w-5 h-5" />
                      Download Feedback
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="text-center mt-20 pb-8 text-gray-600 dark:text-gray-400 text-sm"
        >
          <p>&copy; {new Date().getFullYear()} Resume Ranker Pro. All rights reserved.</p>
          <p className="mt-2 flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" /> by
            <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Parth Chahvan
            </a>
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ResumeRanker />
  </QueryClientProvider>
);

export default App;
