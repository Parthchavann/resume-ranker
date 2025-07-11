import React from "react";
import ProfessionalFooter from '../components/ProfessionalFooter';
import { motion } from "framer-motion";
import { ShieldCheck, Trophy, Handshake, Sparkles } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "GDPR Compliant" },
  { icon: Trophy, label: "Open Source" },
  { icon: Handshake, label: "AI Verified" },
];

const stats = [
  { label: "Precision", value: "95%+", description: "Matching Accuracy" },
  { label: "Analyzed", value: "10K+", description: "Resumes" },
  { label: "Support", value: "24/7", description: "AI Support" },
];

const ProfessionalFooter: React.FC = () => (
  <footer className="relative mt-20 p-8 bg-gradient-to-tr from-slate-100/80 via-indigo-50/80 to-purple-50/90 rounded-3xl shadow-2xl backdrop-blur-xl border border-gray-200/50">
    {/* Floating sparkle effect */}
    <motion.div
      className="absolute -top-4 left-4"
      animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Sparkles className="w-8 h-8 text-blue-400 opacity-50" />
    </motion.div>

    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="max-w-xl text-left">
        <motion.h2
          className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          AI-Driven Career Excellence — Unlock Your Next Opportunity
        </motion.h2>
        <motion.p
          className="mt-3 text-gray-700 text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Empowering job seekers and hiring teams with trusted, transparent AI-powered matching for better opportunities, faster. <br />
          <span className="font-semibold text-indigo-600">Built for Job Seekers and Hiring Teams.</span>
        </motion.p>
        <motion.div
          className="mt-5 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-purple-400 to-blue-500 text-white rounded-full shadow-lg">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-bold">Powered by Ollama &amp; FAISS</span>
            <motion.div
              className="ml-2"
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
          </div>
        </motion.div>
      </div>
      {/* Stats */}
      <div className="flex flex-col items-center gap-5">
        <div className="flex gap-6 mb-2">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.07 }}
              className="text-center bg-white/70 p-4 rounded-xl shadow-md border"
              transition={{ type: "spring", stiffness: 350 }}
            >
              <div className="text-xl font-bold text-indigo-700">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
              <div className="text-xs text-gray-400">{stat.description}</div>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-4">
          {badges.map((b, i) => (
            <motion.div
              key={b.label}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full border text-xs shadow"
              whileHover={{ scale: 1.08, backgroundColor: "#e0e7ff" }}
              transition={{ duration: 0.2 }}
              tabIndex={0}
              aria-label={b.label}
            >
              <b.icon className="w-4 h-4 text-indigo-500" />
              {b.label}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    <motion.div
      className="mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span>© {new Date().getFullYear()} Parth Chavan • All rights reserved.</span>
      <span>
        <a
          href="https://github.com/parthchavan"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-indigo-700 ml-2"
        >
          GitHub
        </a>
        {" | "}
        <a
          href="https://linkedin.com/in/parthchavan"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-indigo-700"
        >
          LinkedIn
        </a>
      </span>
    </motion.div>
  </footer>
);

export default ProfessionalFooter;
