import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const DarkModeToggle: React.FC = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      className="rounded-full p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg transition-all"
      onClick={() => setDark((v) => !v)}
      aria-label="Toggle dark mode"
    >
      {dark ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-700" />
      )}
    </button>
  );
};
