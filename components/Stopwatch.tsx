"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, ChevronDown, ChevronUp, Timer } from "lucide-react";

export default function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
    if (!isRunning && typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator) {
      try {
        navigator.vibrate(30);
      } catch {}
    }
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

  if (isMinimized) {
    return (
      <aside aria-label="Rest timer minimized" className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-2xl transition-all font-mono text-xs font-bold ${
            isRunning
              ? "bg-carbon-900 border-volt-500/60 text-volt-400 animate-pulse"
              : "bg-carbon-900 border-carbon-700 text-slate-300 hover:border-slate-500"
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>{formatTime(seconds)}</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Rest timer" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
      <div className="rounded-xl border border-carbon-700/80 bg-carbon-900/95 backdrop-blur-xl p-3 shadow-2xl shadow-black/80 flex items-center justify-between gap-3">
        {/* Left: Indicator & Time */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                isRunning ? "bg-volt-400 animate-ping" : "bg-carbon-600"
              }`}
            />
            <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider tabular-nums">
              {formatTime(seconds)}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold hidden sm:inline">
            REST
          </span>
        </div>

        {/* Center: Quick Interval Adjusters */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => addTime(30)}
            className="px-2 py-1 rounded bg-carbon-800 hover:bg-carbon-750 text-[11px] font-mono font-bold text-slate-300 hover:text-white border border-carbon-700 transition-colors"
            title="Tambah 30 detik"
          >
            +30s
          </button>
          <button
            type="button"
            onClick={() => addTime(60)}
            className="px-2 py-1 rounded bg-carbon-800 hover:bg-carbon-750 text-[11px] font-mono font-bold text-slate-300 hover:text-white border border-carbon-700 transition-colors hidden xs:inline"
            title="Tambah 60 detik"
          >
            +1m
          </button>
        </div>

        {/* Right: Controls & Minimize */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTimer}
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold transition-all ${
              isRunning
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
                : "bg-volt-500 text-carbon-950 hover:bg-volt-400"
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
            type="button"
            onClick={resetTimer}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-carbon-800 border border-carbon-700 text-slate-400 hover:text-white hover:bg-carbon-750 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 rounded flex items-center justify-center text-carbon-500 hover:text-slate-300 transition-colors ml-0.5"
            title="Sembunyikan ke pojok"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

