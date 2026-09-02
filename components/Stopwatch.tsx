"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Play, Pause, Square } from "lucide-react";

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 p-2 pl-4 pr-3 rounded-full shadow-2xl shadow-black/50">
      <span className="font-mono text-xl font-bold text-zinc-100 tracking-wider">
        {formatTime(time)}
      </span>
      <div className="w-px h-6 bg-zinc-700 mx-1"></div>
      <button
        onClick={toggleTimer}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
          isRunning
            ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
        }`}
      >
        {isRunning ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </button>
      <button
        onClick={resetTimer}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
      >
        <Square className="w-4 h-4 fill-current" />
      </button>
    </div>,
    document.body
  );
}

