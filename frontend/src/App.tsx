import React, { useState, useRef, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Upload, FileText, XCircle, Trash2, Loader2, Download, MessageSquareText, Trophy, 
  Sparkles, Crown, CheckCircle, Target, BarChart3, Brain, ArrowRight, Rocket, 
  Sun, Moon, Monitor, ArrowUp, Zap, Star, Award, Eye, EyeOff, Heart, Users, Clock
} from 'lucide-react';

const queryClient = new QueryClient();
const BACKEND_URL = 'http://localhost:8000';

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

// Simple Progress Component
const Progress = ({ value = 0, className = "", showPercentage = false, variant = "default", animated = false }: {
  value?: number;
  className?: string;
  showPercentage?: boolean;
  variant?: "default" | "success" | "warning" | "error";
  animated?: boolean;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const colors = {
    default: "bg-blue-500",
    success: "bg-green-500", 
    warning: "bg-yellow-500",
    error: "bg-red-500"
  };

  return (
    <div className={`relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden ${className}`}>
      <div 
        className={`h-full transition-all duration-1000 ease-out ${colors[variant]} ${animated ? 'animate-pulse' : ''}`}
        style={{ width: `${displayValue}%` }}
      />
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-md">
            {Math.round(displayValue)}%
          </span>
        </div>
      )}
    </div>
  );
};

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

  {/* Progress Steps */}
           <div className="relative">
  <div
    className="absolute top-8 left-8 right-8 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full"
  >
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
              ? "bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 shadow-lg shadow-green-500/25"
              : index === (currentStep >= 0 ? currentStep : progressSteps.length - 1)
              ? "bg-gradient-to-br from-blue-400 to-purple-500 border-blue-300 shadow-lg shadow-blue-500/25 animate-pulse"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
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
                  index === (currentStep >= 0 ? currentStep : progressSteps.length - 1)
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400"
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
            y:
              index === (currentStep >= 0 ? currentStep : progressSteps.length - 1)
                ? [0, -2, 0]
                : 0,
          }}
          transition={{
            duration: 2,
            repeat:
              index === (currentStep >= 0 ? currentStep : progressSteps.length - 1)
                ? Infinity
                : 0,
            ease: "easeInOut",
          }}
        >
          <h4
            className={`text-sm font-semibold transition-colors ${
              step.completed
                ? "text-green-600 dark:text-green-400"
                : index === (currentStep >= 0 ? currentStep : progressSteps.length - 1)
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
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
            {['light', 'dark', 'system'].map((t, i) => (
              <div
                key={t}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  theme === t ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center py-16 px-4"
        >
          <motion.div 
            className="inline-flex items-center gap-3 mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <Trophy className="w-12 h-12 text-amber-400" />
              <div className="absolute -inset-1 bg-amber-400/20 rounded-full blur animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Resume Ranker
            </h1>
            <div className="relative">
              <Sparkles className="w-12 h-12 text-pink-400" />
              <div className="absolute -inset-1 bg-pink-400/20 rounded-full blur animate-pulse"></div>
            </div>
          </motion.div>
          
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Harness the power of AI to rank resumes with precision and uncover the perfect candidates for your team. 
            Experience intelligent matching that goes beyond keywords.
          </motion.p>

          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{overallProgress}%</span>
              </div>
              <Progress 
                value={overallProgress} 
                variant="default"
                animated={overallProgress > 0 && overallProgress < 100}
                className="h-3"
              />
            </div>
          </motion.div>
        </motion.div>

         

        {/* Progress Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-6xl mx-auto px-4 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {progressSteps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = index === currentStep;
              const isCompleted = step.completed;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className={`relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500/10 border-green-500/30 dark:bg-green-900/20' 
                      : isActive
                        ? 'bg-blue-500/10 border-blue-500/30 dark:bg-blue-900/20'
                        : 'bg-white/10 border-white/20 dark:bg-gray-800/50 dark:border-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      isCompleted 
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                        : isActive
                          ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-500/20 text-gray-500 dark:text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <IconComponent className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{step.label}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Step {index + 1}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{step.description}</p>
                  
                  <Progress 
                    value={step.progress} 
                    variant={isCompleted ? "success" : "default"}
                    className="h-2"
                  />
                  
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2"
                    >
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* File Upload Section */}
        <div className="max-w-6xl mx-auto px-4 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Job Description Upload */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Job Description</h2>
                  <p className="text-gray-600 dark:text-gray-400">Upload the role requirements</p>
                </div>
              </div>

              <div className="space-y-4">
                {!jobDescriptionFile ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <input
                      type="file"
                      ref={jdFileInputRef}
                      onChange={handleJobDescriptionFileChange}
                      accept=".pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-8 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-2xl text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-300 bg-blue-50/50 dark:bg-blue-900/20">
                      <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Click to upload Job Description
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        PDF files only, up to 10MB
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-green-50/50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{jobDescriptionFile.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {(jobDescriptionFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleClearJobDescription}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                      >
                        <XCircle className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Resume Upload */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Resumes</h2>
                  <p className="text-gray-600 dark:text-gray-400">Upload candidate files</p>
                </div>
              </div>

              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <input
                    type="file"
                    ref={resumeFileInputRef}
                    onChange={handleResumeFileChange}
                    accept=".pdf"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploadingResumes}
                  />
                  <div className="p-8 border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-2xl text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors duration-300 bg-purple-50/50 dark:bg-purple-900/20">
                    {isUploadingResumes ? (
                      <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
                    ) : (
                      <Upload className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    )}
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isUploadingResumes ? 'Uploading...' : 'Click to upload Resumes'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      PDF files only, multiple files supported
                    </p>
                  </div>
                </motion.div>

                {resumeFiles.length > 0 && (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    <AnimatePresence>
                      {resumeFiles.map((resume) => (
                        <motion.div
                          key={resume.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{resume.file.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {(resume.file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveResume(resume.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Score Clarification */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-2 border-gradient-to-r from-blue-300/50 via-purple-300/50 to-pink-300/50 dark:from-blue-600/50 dark:via-purple-600/50 dark:to-pink-600/50 rounded-3xl px-8 py-8 shadow-2xl max-w-5xl mx-auto mb-16"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/30 dark:from-gray-900/50 dark:via-transparent dark:to-gray-900/30"></div>
          
          <div className="relative">
            <motion.div 
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                How Scoring Works
              </h3>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </motion.div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <motion.div 
                className="bg-gradient-to-br from-emerald-50/80 to-green-100/80 dark:from-emerald-900/20 dark:to-green-900/20 p-6 rounded-2xl border border-green-200/50 dark:border-green-700/50 shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">Lower Score = Better Match!</span>
                </div>
                <p className="text-emerald-600 dark:text-emerald-400 leading-relaxed">
                  Your resume closely aligns with job requirements. This means you're a strong candidate for the position.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-red-50/80 to-orange-100/80 dark:from-red-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-red-200/50 dark:border-red-700/50 shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-bold text-red-700 dark:text-red-300">Higher Score = Less Relevant</span>
                </div>
                <p className="text-red-600 dark:text-red-400 leading-relaxed">
                  Your resume needs more alignment with the job description. Consider highlighting relevant skills.
                </p>
              </motion.div>
            </div>
            
            <motion.div 
              className="bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <span>🧠 AI-Powered Analysis</span>
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Our advanced AI calculates semantic similarity between your resume and the job description. 
                    Scores might seem small, but focus on <strong>relative ranking</strong> - the lowest score wins! 
                    Think of it like golf scoring: lower is better. 📊
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Rank Button */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mb-12"
        >
          <motion.button
            onClick={handleRankResumes}
            disabled={!jobDescriptionFile || resumeFiles.length === 0 || isRanking}
            className={`relative px-12 py-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
              !jobDescriptionFile || resumeFiles.length === 0 || isRanking
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white hover:shadow-2xl hover:shadow-indigo-500/25 dark:hover:shadow-blue-500/25'
            }`}
            whileHover={!isRanking && jobDescriptionFile && resumeFiles.length > 0 ? { scale: 1.05 } : {}}
            whileTap={!isRanking && jobDescriptionFile && resumeFiles.length > 0 ? { scale: 0.95 } : {}}
          >
            <div className="flex items-center gap-3">
              {isRanking ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing Resumes...
                </>
              ) : (
                <>
                  <Rocket className="w-6 h-6" />
                  Start AI Analysis
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </div>
            
            {!isRanking && jobDescriptionFile && resumeFiles.length > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 dark:from-blue-500/20 dark:to-purple-500/20 rounded-2xl blur-xl -z-10"></div>
            )}
          </motion.button>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {rankedResumes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto px-4 mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-3 mb-4">
                  <Trophy className="w-10 h-10 text-amber-500" />
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    Ranking Results
                  </h2>
                  <Crown className="w-10 h-10 text-amber-500" />
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  AI-powered analysis complete! Here are your top candidates ranked by relevance.
                </p>
              </motion.div>

              <div className="grid gap-8">
                {rankedResumes.map((resume, index) => (
                  <motion.div
                    key={resume.resume_id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative p-8 rounded-3xl backdrop-blur-xl border transition-all duration-300 ${
                      index === 0
                        ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-300/30 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700/30'
                        : 'bg-white/10 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50'
                    }`}
                  >
                    {index === 0 && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="absolute -top-4 -left-4"
                      >
                        <div className="bg-amber-500 text-white rounded-full p-3 shadow-lg">
                          <Crown className="w-6 h-6" />
                        </div>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Resume Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                              index === 0 
                                ? 'bg-amber-500/20' 
                                : index < 3 
                                  ? 'bg-green-500/20' 
                                  : 'bg-blue-500/20'
                            }`}>
                              <div className="text-2xl font-bold">
                                {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📄'}
                              </div>
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                                {resume.filename}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Rank #{index + 1}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Match Score: {(100 - resume.score * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                            Key Highlights
                          </h4>
                          <div className="p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {resume.snippet}
                            </p>
                          </div>
                        </div>

                        {/* Feedback Section */}
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <motion.button
                              onClick={() => handleGetLLMFeedback(resume)}
                              disabled={feedbackLoadingResumeId === resume.resume_id}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 rounded-xl transition-colors duration-200 font-medium"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {feedbackLoadingResumeId === resume.resume_id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Brain className="w-4 h-4" />
                              )}
                              {feedbackLoadingResumeId === resume.resume_id ? 'Generating...' : 'AI Feedback'}
                            </motion.button>

                            {resume.feedback && (
                              <>
                                <motion.button
                                  onClick={() => toggleFeedbackVisibility(resume.resume_id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-600 dark:text-gray-400 rounded-xl transition-colors duration-200 font-medium"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {resume.showFeedback ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  {resume.showFeedback ? 'Hide' : 'Show'}
                                </motion.button>

                                <motion.button
                                  onClick={() => handleDownloadFeedback(resume.feedback!, resume.filename)}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 rounded-xl transition-colors duration-200 font-medium"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </motion.button>
                              </>
                            )}
                          </div>

                          <AnimatePresence>
                            {resume.feedback && resume.showFeedback && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
                              >
                                <div className="flex items-center gap-2 mb-4">
                                  <MessageSquareText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  <h5 className="font-semibold text-blue-800 dark:text-blue-300">AI Feedback</h5>
                                </div>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {resume.feedback}
                                  </pre>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Score Visualization */}
                      <div className="lg:col-span-1">
                        <div className="bg-gray-50/50 dark:bg-gray-700/30 rounded-2xl p-6">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
                            Match Analysis
                          </h4>
                          
                          <div className="relative w-32 h-32 mx-auto mb-6">
                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray={`${100 - resume.score * 100}, 100`}
                                className={`text-gradient ${getScoreColor(resume.score, index)}`}
                              />
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="100, 100"
                                className="text-gray-200 dark:text-gray-700"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                  {(100 - resume.score * 100).toFixed(0)}%
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Match</div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Relevance</span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.ceil((100 - resume.score * 100) / 20)
                                        ? 'text-amber-400 fill-current'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-center gap-2 text-sm">
                                {index === 0 && (
                                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-medium">
                                    Top Match
                                  </span>
                                )}
                                {index > 0 && index < 3 && (
                                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                                    Strong Match
                                  </span>
                                )}
                                {index >= 3 && (
                                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                                    Good Match
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="relative z-10 mt-auto bg-white/5 dark:bg-gray-900/50 backdrop-blur-xl border-t border-white/10 dark:border-gray-700/50"
        >
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-amber-400" />
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Resume Ranker
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Leverage cutting-edge AI technology to revolutionize your hiring process. 
                  Identify top talent faster with intelligent resume analysis and ranking.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">AI-Powered</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Zap className="w-5 h-5" />
                    <span className="text-sm font-medium">Lightning Fast</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <Target className="w-5 h-5" />
                    <span className="text-sm font-medium">Precision Matching</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Features</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">AI Analysis</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Smart Ranking</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <MessageSquareText className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Detailed Feedback</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Download className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Export Results</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Stats</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Resumes Analyzed</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {resumeFiles.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Rankings Complete</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {rankedResumes.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Feedback Generated</span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {rankedResumes.filter(r => r.feedback).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 dark:border-gray-700/50 mt-8 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    © 2024 Resume Ranker. Built with AI precision.
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>Made for recruiters</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Trusted by teams</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span>Save hours daily</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.footer>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {isScrollToTopVisible && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 z-50 p-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors duration-200"
            >
              <ArrowUp className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Confetti Effect */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-gradient-to-br from-yellow-400 to-red-500 rounded"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -20,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  y: window.innerHeight + 20,
                  rotate: 360,
                  transition: {
                    duration: Math.random() * 2 + 2,
                    ease: "easeOut"
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ResumeRanker />
    </QueryClientProvider>
  );
};

export default App;
