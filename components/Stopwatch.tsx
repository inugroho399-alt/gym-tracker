"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const addTime = (secs: number) => {
    setSeconds((prev) => prev + secs);
  };

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <aside aria-label="Timer Istirahat" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-full border border-neutral-800 bg-neutral-950/95 backdrop-blur-md px-4 py-2 shadow-xl flex items-center gap-3">
        <span className="text-sm font-semibold text-white tabular-nums tracking-tight">
          {formatTime(seconds)}
        </span>

        <span className="text-neutral-700">|</span>

        <button
          type="button"
          onClick={() => addTime(30)}
          className="text-xs text-neutral-400 hover:text-white transition-colors"
        >
          +30s
        </button>

        <button
          type="button"
          onClick={toggleTimer}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
            isRunning 
              ? "bg-neutral-800 text-white hover:bg-neutral-700" 
              : "bg-white text-black hover:bg-neutral-200"
          }`}
          title={isRunning ? "Jeda" : "Mulai"}
        >
          {isRunning ? (
            <Pause className="w-3 h-3 fill-current" />
          ) : (
            <Play className="w-3 h-3 fill-current ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
}
