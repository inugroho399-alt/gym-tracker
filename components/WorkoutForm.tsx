"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Exercise, WorkoutEntry, WorkoutSet } from "@/types/workout";
import {
  getExercises,
  addExercise,
  addWorkoutEntry,
  getLastEntryForExercise,
} from "@/lib/storage";

// ─── Local helpers ────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function newSet(): WorkoutSet {
  return { id: `set-${Date.now()}-${Math.random()}`, reps: 0, weight: 0 };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SetRowProps {
  index: number;
  set: WorkoutSet;
  onChange: (id: string, field: "reps" | "weight", value: number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

function SetRow({ index, set, onChange, onRemove, canRemove }: SetRowProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Set number badge */}
      <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-700 text-xs font-semibold text-gray-300 shrink-0">
        {index + 1}
      </span>

      {/* Reps */}
      <div className="flex-1">
        <label className="sr-only">Reps set {index + 1}</label>
        <div className="relative">
          <input
            type="number"
            min={1}
            placeholder="0"
            value={set.reps === 0 ? "" : set.reps}
            onChange={(e) =>
              onChange(set.id, "reps", parseInt(e.target.value, 10) || 0)
            }
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
            reps
          </span>
        </div>
      </div>

      {/* Weight */}
      <div className="flex-1">
        <label className="sr-only">Weight set {index + 1}</label>
        <div className="relative">
          <input
            type="number"
            min={0}
            step={0.5}
            placeholder="0"
            value={set.weight === 0 ? "" : set.weight}
            onChange={(e) =>
              onChange(set.id, "weight", parseFloat(e.target.value) || 0)
            }
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
            kg
          </span>
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(set.id)}
        disabled={!canRemove}
        aria-label={`Hapus set ${index + 1}`}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Main form component ──────────────────────────────────────────────────────

const NEW_EXERCISE_VALUE = "__new__";

export default function WorkoutForm() {
  const router = useRouter();

  // Exercise state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [showNewExerciseInput, setShowNewExerciseInput] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");

  // Last-entry hint
  const [lastEntry, setLastEntry] = useState<WorkoutEntry | null>(null);

  // Form fields
  const [date, setDate] = useState(todayISO());
  const [sets, setSets] = useState<WorkoutSet[]>([newSet()]);
  const [note, setNote] = useState("");

  // UI state
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Load exercises on mount (client-only)
  useEffect(() => {
    setExercises(getExercises());
  }, []);

  // When selected exercise changes, look up the last entry
  useEffect(() => {
    if (!selectedExerciseId || selectedExerciseId === NEW_EXERCISE_VALUE) {
      setLastEntry(null);
      return;
    }
    setLastEntry(getLastEntryForExercise(selectedExerciseId));
  }, [selectedExerciseId]);

  // ── Dropdown change handler ────────────────────────────────────────────────
  function handleExerciseChange(value: string) {
    if (value === NEW_EXERCISE_VALUE) {
      setShowNewExerciseInput(true);
      setSelectedExerciseId("");
    } else {
      setShowNewExerciseInput(false);
      setNewExerciseName("");
      setSelectedExerciseId(value);
    }
  }

  // ── Confirm new exercise ───────────────────────────────────────────────────
  function handleConfirmNewExercise() {
    const name = newExerciseName.trim();
    if (!name) return;
    const created = addExercise(name);
    setExercises(getExercises()); // refresh list
    setSelectedExerciseId(created.id);
    setShowNewExerciseInput(false);
    setNewExerciseName("");
  }

  // ── Set management ─────────────────────────────────────────────────────────
  const handleSetChange = useCallback(
    (id: string, field: "reps" | "weight", value: number) => {
      setSets((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
    },
    []
  );

  const handleRemoveSet = useCallback((id: string) => {
    setSets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  function handleAddSet() {
    setSets((prev) => [...prev, newSet()]);
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate(): string[] {
    const errs: string[] = [];
    if (!selectedExerciseId) errs.push("Pilih atau tambahkan exercise terlebih dahulu.");
    if (!date) errs.push("Tanggal wajib diisi.");

    const validSets = sets.filter((s) => s.reps > 0 && s.weight > 0);
    if (validSets.length === 0)
      errs.push("Minimal 1 set harus memiliki reps dan weight yang valid (> 0).");

    return errs;
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setSaving(true);

    const validSets = sets.filter((s) => s.reps > 0 && s.weight > 0);

    const entry: WorkoutEntry = {
      id: `entry-${Date.now()}`,
      date: new Date(date).toISOString(),
      exerciseId: selectedExerciseId,
      sets: validSets,
      note: note.trim() || undefined,
    };

    addWorkoutEntry(entry);
    router.push("/");
  }

  // ── Last-entry hint renderer ───────────────────────────────────────────────
  function renderLastEntryHint() {
    if (!lastEntry || lastEntry.sets.length === 0) return null;

    const lastSet = lastEntry.sets[lastEntry.sets.length - 1];
    const dateLabel = new Date(lastEntry.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return (
      <p className="mt-1.5 text-xs text-indigo-400 flex items-center gap-1.5">
        <span>⏱</span>
        <span>
          Terakhir kali:{" "}
          <span className="font-semibold">
            {lastSet.reps}×{lastSet.weight}kg
          </span>{" "}
          pada {dateLabel}
        </span>
      </p>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <form
      id="workout-form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
    >
      {/* Error banner */}
      {errors.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 space-y-1"
        >
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-400 flex items-start gap-2">
              <span className="mt-0.5">⚠</span>
              <span>{err}</span>
            </p>
          ))}
        </div>
      )}

      {/* ── Exercise ── */}
      <section className="space-y-2">
        <label
          htmlFor="exercise-select"
          className="block text-sm font-medium text-gray-300"
        >
          Exercise
        </label>

        <select
          id="exercise-select"
          value={showNewExerciseInput ? NEW_EXERCISE_VALUE : selectedExerciseId}
          onChange={(e) => handleExerciseChange(e.target.value)}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="" disabled>
            — Pilih exercise —
          </option>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
          <option value={NEW_EXERCISE_VALUE}>＋ Tambah exercise baru…</option>
        </select>

        {/* Last-entry hint */}
        {renderLastEntryHint()}

        {/* New exercise input */}
        {showNewExerciseInput && (
          <div className="flex gap-2 mt-2">
            <input
              id="new-exercise-name"
              type="text"
              autoFocus
              placeholder="Nama exercise baru"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleConfirmNewExercise();
                }
              }}
              className="flex-1 rounded-lg bg-gray-800 border border-indigo-500 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              id="confirm-new-exercise"
              onClick={handleConfirmNewExercise}
              disabled={!newExerciseName.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              Tambah
            </button>
            <button
              type="button"
              id="cancel-new-exercise"
              onClick={() => {
                setShowNewExerciseInput(false);
                setNewExerciseName("");
              }}
              className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors"
            >
              Batal
            </button>
          </div>
        )}
      </section>

      {/* ── Date ── */}
      <section className="space-y-2">
        <label
          htmlFor="workout-date"
          className="block text-sm font-medium text-gray-300"
        >
          Tanggal
        </label>
        <input
          id="workout-date"
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [color-scheme:dark]"
        />
      </section>

      {/* ── Sets ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Sets</span>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="w-24 text-center">Reps</span>
            <span className="w-24 text-center">Weight</span>
            <span className="w-8" />
          </div>
        </div>

        <div className="space-y-2.5">
          {sets.map((set, index) => (
            <SetRow
              key={set.id}
              index={index}
              set={set}
              onChange={handleSetChange}
              onRemove={handleRemoveSet}
              canRemove={sets.length > 1}
            />
          ))}
        </div>

        <button
          type="button"
          id="add-set-button"
          onClick={handleAddSet}
          className="w-full py-2 rounded-lg border border-dashed border-gray-600 text-gray-400 text-sm hover:border-indigo-500 hover:text-indigo-400 transition-colors"
        >
          + Tambah Set
        </button>
      </section>

      {/* ── Notes ── */}
      <section className="space-y-2">
        <label
          htmlFor="workout-note"
          className="block text-sm font-medium text-gray-300"
        >
          Catatan{" "}
          <span className="text-gray-500 font-normal">(opsional)</span>
        </label>
        <textarea
          id="workout-note"
          rows={3}
          placeholder="Misal: grip lebih lebar, istirahat 90 detik..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </section>

      {/* ── Submit ── */}
      <button
        type="submit"
        id="save-workout-button"
        disabled={saving}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-base transition-all"
      >
        {saving ? "Menyimpan…" : "💾 Simpan Latihan"}
      </button>
    </form>
  );
}
