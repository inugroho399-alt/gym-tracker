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
      <aside aria-label="Timer Istirahat Minimized" className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-2xl transition-all text-xs font-medium backdrop-blur-xl ${
            isRunning
              ? "bg-ios-card/95 border-ios-green/50 text-ios-green shadow-ios-green/10"
              : "bg-ios-card/95 border-ios-border text-white hover:bg-ios-cardHover"
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span className="font-semibold tabular-nums">{formatTime(seconds)}</span>
          <ChevronUp className="w-3.5 h-3.5 text-ios-muted" />
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Timer Istirahat" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
      <div className="rounded-full border border-ios-border bg-ios-card/95 backdrop-blur-xl px-4 py-2.5 shadow-2xl shadow-black/60 flex items-center justify-between gap-3">
        {/* Left: Indicator & Time */}
        <div className="flex items-center gap-2.5 pl-1">
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isRunning ? "bg-ios-green animate-pulse" : "bg-ios-separator"
            }`}
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white tracking-tight tabular-nums leading-none">
              {formatTime(seconds)}
            </span>
            <span className="text-[10px] text-ios-muted font-medium mt-0.5">
              Istirahat
            </span>
          </div>
        </div>

        {/* Center: Quick Interval Adjusters */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => addTime(30)}
            className="px-2.5 py-1 rounded-full bg-ios-elevated hover:bg-ios-cardHover text-[11px] font-medium text-ios-muted hover:text-white border border-ios-border transition-colors"
            title="Tambah 30 detik"
          >
            +30s
          </button>
          <button
            type="button"
            onClick={() => addTime(60)}
            className="px-2.5 py-1 rounded-full bg-ios-elevated hover:bg-ios-cardHover text-[11px] font-medium text-ios-muted hover:text-white border border-ios-border transition-colors hidden xs:inline"
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
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
              isRunning
                ? "bg-ios-orange text-black hover:bg-ios-orange/90"
                : "bg-ios-green text-black hover:bg-ios-green/90"
            }`}
            title={isRunning ? "Jeda" : "Mulai"}
          >
            {isRunning ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-ios-elevated border border-ios-border text-ios-muted hover:text-white hover:bg-ios-cardHover transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-ios-muted hover:text-white transition-colors"
            title="Sembunyikan"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
