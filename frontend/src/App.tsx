// src/App.tsx

import React, { useState, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, XCircle, Trash2, Loader2, Download, MessageSquareText, Trophy } from 'lucide-react';

// Backend URL (ensure this matches your FastAPI server's address)
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

function App() {
  const [resumeFiles, setResumeFiles] = useState<ResumeFile[]>([]);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState<string>('');
  const [rankedResumes, setRankedResumes] = useState<RankedResume[]>([]);
  const [isRanking, setIsRanking] = useState(false);
  const [isUploadingResumes, setIsUploadingResumes] = useState(false);
  const [feedbackLoadingResumeId, setFeedbackLoadingResumeId] = useState<string | null>(null);

  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

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
      setRankedResumes(data.ranked_resumes.map((r: any) => ({ ...r, showFeedback: false })));
      setJobDescriptionText(data.job_description_text);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-fuchsia-100 p-4 sm:p-8 font-inter text-gray-800">
      <Toaster position="top-center" />
      {/* HEADER */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl sm:text-5xl font-extrabold text-center mb-12 drop-shadow-lg bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent"
      >
        <Trophy className="inline-block w-10 h-10 text-yellow-400 mr-2" /> Semantic Resume Ranker
      </motion.h1>

      {/* FILE UPLOAD AREA */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* JD UPLOAD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white bg-opacity-80 backdrop-blur-md border border-blue-200 p-6 rounded-3xl shadow-2xl hover:shadow-blue-200 transition-shadow"
        >
          <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center">
            <FileText className="mr-2" /> Job Description
          </h2>
          <label
            htmlFor="jd-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors duration-300"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-blue-500 mb-2" />
              <p className="mb-2 text-sm text-blue-600">
                <span className="font-semibold">Click to upload JD</span> or drag and drop
              </p>
              <p className="text-xs text-blue-500">PDF (MAX. 5MB)</p>
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 bg-blue-100 rounded-md flex items-center justify-between text-blue-800 shadow-sm"
              >
                <span className="truncate">{jobDescriptionFile.name}</span>
                <button
                  onClick={handleClearJobDescription}
                  className="ml-2 text-blue-600 hover:text-red-600 transition-colors"
                  title="Clear Job Description"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* RESUMES UPLOAD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white bg-opacity-80 backdrop-blur-md border border-purple-200 p-6 rounded-3xl shadow-2xl hover:shadow-purple-200 transition-shadow"
        >
          <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
            <FileText className="mr-2" /> Resumes
          </h2>
          <label
            htmlFor="resume-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-400 rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors duration-300"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-purple-500 mb-2" />
              <p className="mb-2 text-sm text-purple-600">
                <span className="font-semibold">Click to upload resumes</span> or drag and drop
              </p>
              <p className="text-xs text-purple-500">PDF (multiple files supported)</p>
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
            <div className="mt-4 flex items-center justify-center text-purple-600">
              <Loader2 className="animate-spin mr-2" /> Uploading resumes...
            </div>
          )}

          {resumeFiles.length > 0 && (
            <div className="mt-4 max-h-60 overflow-y-auto pr-2">
              <AnimatePresence mode="popLayout">
                {resumeFiles.map((resume) => (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
                    className="flex items-center justify-between p-3 bg-purple-100 rounded-md mb-2 shadow-sm text-purple-800"
                  >
                    <span className="truncate">{resume.file.name}</span>
                    <button
                      onClick={() => handleRemoveResume(resume.id)}
                      className="ml-2 text-purple-600 hover:text-red-600 transition-colors"
                      title="Remove Resume"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* RANK BUTTON */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleRankResumes}
        disabled={!jobDescriptionFile || resumeFiles.length === 0 || isRanking || isUploadingResumes}
        className="w-full max-w-md mx-auto bg-gradient-to-r from-fuchsia-500 via-blue-500 to-cyan-500 text-white py-4 px-8 rounded-2xl text-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Rank Resumes"
      >
        {isRanking ? (
          <>
            <Loader2 className="animate-spin mr-2" /> Ranking Resumes...
          </>
        ) : (
          <>
            <MessageSquareText className="mr-2" /> Rank Resumes
          </>
        )}
      </motion.button>

      {/* RANKED RESULTS */}
      <AnimatePresence>
        {rankedResumes.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="max-w-5xl mx-auto mt-12"
          >
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Ranked Resumes</h2>
            <div className="space-y-8">
              {rankedResumes.map((resume, index) => (
                <motion.div
                  key={resume.resume_id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}
                  className={`relative p-8 rounded-3xl shadow-xl border-2 ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-100/60 via-purple-100/60 to-white border-yellow-300 ring-2 ring-yellow-400'
                      : 'bg-white/80 border-gray-200'
                  }`}
                >
                  {index === 0 && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-yellow-600 font-semibold">
                      <Trophy className="w-6 h-6" /> Top Ranked!
                    </span>
                  )}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold mb-1 text-blue-800">{index + 1}. {resume.filename}</h3>
                      <p className="text-gray-700 text-sm mb-3 line-clamp-3"><span className="font-medium">Snippet:</span> {resume.snippet || "No snippet available."}</p>
                    </div>
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white text-lg font-bold shadow-lg">
                      Score: {Number(resume.score).toFixed(2)}%
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {/* LLM Feedback button */}
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleGetLLMFeedback(resume)}
                      disabled={feedbackLoadingResumeId === resume.resume_id}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {feedbackLoadingResumeId === resume.resume_id ? (
                        <Loader2 className="animate-spin mr-2" size={18} />
                      ) : (
                        <MessageSquareText className="mr-2" size={18} />
                      )}
                      {feedbackLoadingResumeId === resume.resume_id ? 'Generating...' : 'Get LLM Feedback'}
                    </motion.button>
                    {/* Show/Hide and Download buttons */}
                    {resume.feedback && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => toggleFeedbackVisibility(resume.resume_id)}
                          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200"
                        >
                          <FileText className="mr-2" size={18} />
                          {resume.showFeedback ? 'Hide Feedback' : 'Show Feedback'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleDownloadFeedback(resume.feedback!, resume.filename)}
                          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-200"
                        >
                          <Download className="mr-2" size={18} /> Download Feedback
                        </motion.button>
                      </>
                    )}
                  </div>
                  {/* Feedback Animated Collapse */}
                  <AnimatePresence>
                    {resume.showFeedback && resume.feedback && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mt-5 p-4 bg-white/70 border border-gray-200 rounded-xl text-gray-700 whitespace-pre-wrap shadow-inner"
                      >
                        <h4 className="font-semibold text-gray-800 mb-2">LLM Feedback:</h4>
                        {resume.feedback}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          // Empty state
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-xl mx-auto mt-24 text-center bg-white/60 backdrop-blur-md rounded-3xl shadow-lg p-10"
          >
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No resumes ranked yet</h3>
            <p className="text-gray-500">Upload a job description and some resumes, then click "Rank Resumes" to see results here.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
