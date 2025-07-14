import React, { useState, useRef, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '../components/ui/progress';
import {
  Upload, FileText, XCircle, Trash2, Loader2, Download, MessageSquareText, Trophy, Info,
  Sparkles, Zap, Star, Crown, Award, ChevronDown, Eye, EyeOff, Rocket, CheckCircle, Target, BarChart3, Brain,
  ArrowRight, HelpCircle, Share2, Moon, Sun, Heart, Wand2, TrendingUp, Users, Clock, ArrowUp, Monitor,
  Linkedin, Twitter, Github, Mail, Globe, Coffee, Code, Palette, Lightbulb, Cpu, Database, Shield, Smartphone
} from 'lucide-react';

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

interface ProgressStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  progress?: number;
}

interface EnhancedProgressProps {
  steps: ProgressStep[];
  currentStep?: number;
  showDetails?: boolean;
}

type Theme = 'light' | 'dark' | 'system';

// Dark Mode Toggle Component
function DarkModeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

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

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      default:
        return Monitor;
    }
  };

  const Icon = getIcon();

  return (
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
        <Icon className="w-5 h-5" />
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
  );
}

// Enhanced Progress Component
function EnhancedProgress({ steps, currentStep = 0, showDetails = false }: EnhancedProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState<number[]>([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const newProgress = steps.map((step, index) => {
        if (step.completed) return 100;
        if (index === currentStep) return step.progress || 50;
        if (index < currentStep) return 100;
        return 0;
      });
      setAnimatedProgress(newProgress);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [steps, currentStep]);

  const overallProgress = Math.round(
    (steps.filter(s => s.completed).length / steps.length) * 100
  );

  return (
    <div className="w-full">
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
            className="h-4 shadow-lg"
          />
          <motion.p 
            className="text-sm text-gray-600 dark:text-gray-400 mt-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {overallProgress === 100 ? '🎉 All steps completed!' : `${steps.filter(s => s.completed).length} of ${steps.length} steps completed`}
          </motion.p>
        </div>
      </motion.div>

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
          {steps.map((step, index) => (
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
                    : index === currentStep
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
                        index === currentStep ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <step.icon className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {index === currentStep && !step.completed && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-blue-400"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.4, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              <motion.div
                className="mt-4 text-center max-w-[120px]"
                animate={{
                  y: index === currentStep ? [0, -2, 0] : 0
                }}
                transition={{
                  duration: 2,
                  repeat: index === currentStep ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                <h4 className={`text-sm font-semibold transition-colors ${
                  step.completed 
                    ? 'text-green-600 dark:text-green-400' 
                    : index === currentStep 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {step.label}
                </h4>
                
                {showDetails && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 leading-tight">
                    {step.description}
                  </p>
                )}

                {(index === currentStep || step.completed) && animatedProgress[index] !== undefined && (
                  <motion.div
                    className="mt-2 w-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Progress
                      value={animatedProgress[index]}
                      className="h-2 shadow-sm"
                    />
                  </motion.div>
                )}
              </motion.div>

              <AnimatePresence>
                {step.completed && (
                  <motion.div
                    className="absolute -top-2 -right-2"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showDetails && currentStep < steps.length && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="mt-8 p-6 bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-xl rounded-2xl border border-blue-200/50 dark:border-blue-700/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Current Step: {steps[currentStep]?.label}
              </h4>
            </div>
            <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
              {steps[currentStep]?.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Scroll to Top Button Component
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
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

  return (
    <AnimatePresence>
      {isVisible && (
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
  );
}

// Professional Footer Component
function ProfessionalFooter() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
  ];

  const socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { name: 'GitHub', icon: Github, href: '#', color: 'hover:text-gray-900 dark:hover:text-white' },
  ];

  const features = [
    { icon: Brain, text: 'AI-Powered Analysis' },
    { icon: Zap, text: 'Lightning Fast' },
    { icon: Shield, text: 'Secure & Private' },
    { icon: Smartphone, text: 'Mobile Friendly' },
  ];

  return (
    <footer className="relative mt-32 bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Resume Ranker Pro
                </h3>
                <p className="text-gray-400 text-sm">AI-Powered Resume Intelligence</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Transform your hiring process with advanced AI semantic analysis. 
              Discover the perfect candidates faster and more accurately than ever before.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2 text-sm text-gray-300"
                >
                  <feature.icon className="w-4 h-4 text-blue-400" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                    whileHover={{ x: 5 }}
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-6 text-white">Connect</h4>
            <div className="flex flex-col gap-4 mb-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className={`text-gray-300 ${social.color} transition-colors duration-200 flex items-center gap-3 group`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-5 h-5" />
                  <span className="group-hover:underline">{social.name}</span>
                </motion.a>
              ))}
            </div>
            
            <motion.a
              href="mailto:contact@resumeranker.pro"
              className="text-gray-300 hover:text-green-400 transition-colors duration-200 flex items-center gap-2 group"
              whileHover={{ scale: 1.05 }}
            >
              <Mail className="w-4 h-4" />
              <span className="group-hover:underline">Get in Touch</span>
            </motion.a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <p>&copy; {currentYear} Resume Ranker Pro. All rights reserved.</p>
            <span className="hidden md:block">•</span>
            <p className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500" fill="currentColor" /> and <Coffee className="w-4 h-4 text-amber-500" />
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <motion.a
              href="#privacy"
              className="hover:text-white transition-colors duration-200"
              whileHover={{ y: -2 }}
            >
              Privacy Policy
            </motion.a>
            <motion.a
              href="#terms"
              className="hover:text-white transition-colors duration-200"
              whileHover={{ y: -2 }}
            >
              Terms of Service
            </motion.a>
          </div>
        </motion.div>
      </div>
      
      <ScrollToTopButton />
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
    </footer>
  );
}

const Index = () => {
  const [resumeFiles, setResumeFiles] = useState<ResumeFile[]>([]);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState<string>('');
  const [rankedResumes, setRankedResumes] = useState<RankedResume[]>([]);
  const [isRanking, setIsRanking] = useState(false);
  const [isUploadingResumes, setIsUploadingResumes] = useState(false);
  const [feedbackLoadingResumeId, setFeedbackLoadingResumeId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  // Trigger confetti for top scores
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Helper to check for duplicate files by name and size
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
      
      // Trigger confetti for excellent scores
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

  // Enhanced Progress Steps
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

  // Confetti Component for Celebrations
  function ConfettiOverlay() {
    if (!showConfetti) return null;
    
    return (
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
    );
  }

  // Score Progress Bar Component
  function ScoreProgressBar({ score, index }: { score: number, index: number }) {
    const normalizedScore = Math.max(0, Math.min(100, (1 - score) * 100)); // Invert score for progress
    const getProgressColor = () => {
      if (index === 0) return 'from-emerald-400 to-green-500';
      if (normalizedScore > 80) return 'from-emerald-400 to-green-500';
      if (normalizedScore > 60) return 'from-yellow-400 to-orange-500';
      return 'from-orange-400 to-red-500';
    };

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Match Score</span>
          <span className={`text-sm font-bold ${
            index === 0 ? 'text-green-600 dark:text-green-400' : normalizedScore > 80 ? 'text-green-600 dark:text-green-400' : 
            normalizedScore > 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {normalizedScore.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
          <motion.div
            className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full shadow-lg relative overflow-hidden`}
            initial={{ width: 0 }}
            animate={{ width: `${normalizedScore}%` }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  // Enhanced Score Clarification Component
  function ScoreClarification() {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 transition-colors duration-500">
      {/* Enhanced Background with Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/95 via-blue-50/90 to-indigo-100/95 dark:from-slate-950/95 dark:via-blue-950/90 dark:to-indigo-950/95 backdrop-blur-3xl transition-colors duration-500"></div>
        
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-pink-400/30 to-violet-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        <div className="absolute top-20 right-1/4 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-2xl animate-pulse delay-3000"></div>
        
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
      </div>

      {/* Dark Mode Toggle - Fixed Position Top Right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-6 right-6 z-50"
      >
        <DarkModeToggle />
      </motion.div>

      <div className="relative z-10 p-4 sm:p-8 font-sans text-gray-800 dark:text-gray-200">
        <Toaster position="top-center" />
        <ConfettiOverlay />
        
        {/* Enhanced Header */}
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

        {/* Enhanced Progress Stepper */}
        <motion.div 
          className="max-w-6xl mx-auto mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl p-8">
            <EnhancedProgress 
              steps={progressSteps} 
              currentStep={currentStep >= 0 ? currentStep : progressSteps.length - 1}
              showDetails={true}
            />
          </div>
        </motion.div>

        {/* File Upload Section */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
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
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Upload className="w-10 h-10 text-purple-500 dark:text-purple-400 mb-3" />
                  </motion.div>
                  <p className="mb-2 text-lg font-semibold text-purple-700 dark:text-purple-300">
                    Drop resume files here
                  </p>
                  <p className="text-sm text-purple-500 dark:text-purple-400">Multiple PDFs supported</p>
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

              {isUploadingResumes && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex items-center justify-center text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/50 rounded-2xl p-4"
                >
                  <Loader2 className="animate-spin mr-3 w-5 h-5" />
                  <span className="font-medium">Processing resumes...</span>
                </motion.div>
              )}

              {resumeFiles.length > 0 && (
                <div className="mt-6 max-h-64 overflow-y-auto pr-2 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">{resumeFiles.length} Resume{resumeFiles.length > 1 ? 's' : ''} Ready</span>
                  </div>
                  <AnimatePresence mode="popLayout">
                    {resumeFiles.map((resume, index) => (
                      <motion.div
                        key={resume.id}
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        layout
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-100/60 to-pink-100/60 dark:from-purple-900/60 dark:to-pink-900/60 rounded-xl border border-purple-200/50 dark:border-purple-700/50 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 flex-1">
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
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Score Clarification */}
        <ScoreClarification />

        {/* Rank Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRankResumes}
            disabled={!jobDescriptionFile || resumeFiles.length === 0 || isRanking || isUploadingResumes}
            className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-6 px-12 rounded-3xl text-xl font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[280px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              {isRanking ? (
                <>
                  <Loader2 className="animate-spin w-6 h-6" />
                  <span>Analyzing Resumes...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-6 h-6" />
                  <span>Start AI Analysis</span>
                </>
              )}
            </div>
          </motion.button>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {rankedResumes.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-6xl mx-auto"
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-full font-semibold mb-4 shadow-lg"
                >
                  <Trophy className="w-5 h-5" />
                  Analysis Complete
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Ranked Results</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Resumes ordered by relevance to your job description</p>
              </div>
              
              <div className="space-y-8">
                {rankedResumes.map((resume, index) => (
                  <motion.div
                    key={resume.resume_id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative p-8 rounded-3xl shadow-2xl border-2 transition-all duration-300 hover:scale-[1.01] ${
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-50/80 via-amber-50/80 to-orange-50/80 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20 border-amber-300/50 dark:border-amber-600/50 ring-4 ring-amber-400/30'
                        : index === 1
                        ? 'bg-gradient-to-br from-slate-50/80 via-gray-50/80 to-slate-100/80 dark:from-slate-800/80 dark:via-gray-800/80 dark:to-slate-900/80 border-slate-300/50 dark:border-slate-600/50 ring-2 ring-slate-400/20'
                        : index === 2
                        ? 'bg-gradient-to-br from-orange-50/80 via-amber-50/80 to-yellow-50/80 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 border-orange-300/50 dark:border-orange-600/50 ring-2 ring-orange-400/20'
                        : 'bg-white/80 dark:bg-gray-900/80 border-gray-200/50 dark:border-gray-700/50'
                    }`}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                      className={`absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                          : index === 1
                          ? 'bg-gradient-to-br from-slate-400 to-gray-500'
                          : index === 2
                          ? 'bg-gradient-to-br from-orange-400 to-amber-500'
                          : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                      }`}
                    >
                      {index + 1}
                    </motion.div>

                    {index === 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="absolute top-4 right-4 flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-full font-bold shadow-lg"
                      >
                        <Crown className="w-5 h-5" />
                        <span>Best Match</span>
                      </motion.div>
                    )}

                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-3">
                          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          {resume.filename}
                        </h3>
                        <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">Key Match:</span> {resume.snippet || "No preview available."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="min-w-[200px]">
                        <ScoreProgressBar score={resume.score} index={index} />
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`mt-4 px-6 py-3 rounded-2xl shadow-lg font-bold text-white text-center ${
                            index === 0
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}
                        >
                          <div className="text-sm opacity-90">Raw Score</div>
                          <div className="text-xl">{Number(resume.score).toFixed(3)}</div>
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleGetLLMFeedback(resume)}
                        disabled={feedbackLoadingResumeId === resume.resume_id}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        {feedbackLoadingResumeId === resume.resume_id ? (
                          <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                          <MessageSquareText className="w-5 h-5" />
                        )}
                        {feedbackLoadingResumeId === resume.resume_id ? 'Generating...' : 'Get AI Feedback'}
                      </motion.button>

                      {resume.feedback && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleFeedbackVisibility(resume.resume_id)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-700 text-white rounded-xl shadow-lg hover:shadow-slate-500/25 transition-all duration-200 font-semibold"
                          >
                            {resume.showFeedback ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            {resume.showFeedback ? 'Hide' : 'Show'} Feedback
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownloadFeedback(resume.feedback!, resume.filename)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-teal-500/25 transition-all duration-200 font-semibold"
                          >
                            <Download className="w-5 h-5" />
                            Download
                          </motion.button>
                        </>
                      )}
                    </div>

                    <AnimatePresence>
                      {resume.showFeedback && resume.feedback && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -20 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -20 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="mt-8 p-6 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-inner"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">AI-Generated Feedback</h4>
                          </div>
                          <div className="prose prose-gray dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed font-sans text-sm lg:text-base">
                              {resume.feedback}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-xl p-12 border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Ready to Analyze</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                Upload your job description and resume files, then click "Start AI Analysis" to see intelligent rankings and insights.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Professional Footer */}
        <ProfessionalFooter />
      </div>
    </div>
  );
};

export default Index;
