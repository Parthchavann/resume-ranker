import React from "react";
import { motion } from "framer-motion";

interface Step {
  label: string;
  description?: string;
  icon: React.ElementType;
  completed: boolean;
  progress?: number;
}
interface Props {
  steps: Step[];
  currentStep: number;
  showDetails?: boolean;
}
export const EnhancedProgress: React.FC<Props> = ({
  steps,
  currentStep,
  showDetails,
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = idx === currentStep;
        return (
          <React.Fragment key={step.label}>
            <motion.div
              className={`flex flex-col items-center gap-1 ${
                isActive ? "font-bold text-blue-700" : "text-gray-400"
              }`}
              animate={isActive ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.6, repeat: isActive ? Infinity : 0 }}
            >
              <div
                className={`rounded-full p-2 border-2 ${
                  step.completed
                    ? "bg-gradient-to-br from-blue-500 to-green-400 text-white border-green-300 shadow"
                    : "bg-white border-gray-200"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm">{step.label}</span>
            </motion.div>
            {idx < steps.length - 1 && (
              <motion.div
                className={`h-1 w-12 md:w-24 rounded-xl transition-colors duration-200 ${
                  step.completed ? "bg-green-400" : "bg-gray-200"
                }`}
                animate={{
                  background:
                    idx < currentStep
                      ? "linear-gradient(to right, #34d399, #2563eb)"
                      : undefined,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
    {showDetails && (
      <div className="flex justify-between mt-2">
        {steps.map((step, i) => (
          <div className="w-32" key={i}>
            <span className="block text-xs font-semibold text-gray-500">
              {step.description}
            </span>
            {typeof step.progress === "number" && (
              <div className="relative mt-1 h-1 w-full rounded-full bg-gray-200">
                <motion.div
                  className="absolute top-0 left-0 h-1 rounded-full bg-gradient-to-r from-blue-400 to-green-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${step.progress}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);
