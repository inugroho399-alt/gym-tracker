"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 p-2 pl-4 pr-3 rounded-full shadow-2xl shadow-black/60">
      <span className="font-mono text-lg font-bold text-zinc-100 tracking-wider">
        {formatTime(time)}
      </span>
      <div className="w-px h-5 bg-zinc-800 mx-0.5"></div>
      <button
        onClick={toggleTimer}
        className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
          isRunning
            ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
            : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
        }`}
        title={isRunning ? "Jeda" : "Mulai"}
      >
        {isRunning ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>
      <button
        onClick={resetTimer}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        title="Reset"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}

