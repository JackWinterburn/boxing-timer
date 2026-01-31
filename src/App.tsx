import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { Play, Pause, RotateCcw, ChevronDown } from "lucide-react";
import {
  currentRoundAtom,
  timeLeftAtom,
  isRunningAtom,
  phaseAtom,
  totalTimeElapsedAtom,
  currentPageAtom,
  activeWorkoutAtom,
} from "./atoms";
import Settings from "./components/Settings";
import WorkoutSelector from "./components/WorkoutSelector";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

function TimerPage() {
  const [activeWorkout] = useAtom(activeWorkoutAtom);
  const [currentRound, setCurrentRound] = useAtom(currentRoundAtom);
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const [isRunning, setIsRunning] = useAtom(isRunningAtom);
  const [phase, setPhase] = useAtom(phaseAtom);
  const [totalTimeElapsed, setTotalTimeElapsed] = useAtom(totalTimeElapsedAtom);
  const [, setCurrentPage] = useAtom(currentPageAtom);

  const timerRef = useRef<number | null>(null);

  const workTime = activeWorkout.roundDuration;
  const restTime = activeWorkout.restDuration;
  const roundCount = activeWorkout.totalRounds;

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTotalTimeElapsed((prev) => prev + 1);
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === "work") {
              setPhase("rest");
              return restTime;
            } else {
              if (currentRound < roundCount) {
                setCurrentRound((prev) => prev + 1);
                setPhase("work");
                return workTime;
              } else {
                setIsRunning(false);
                return 0;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    isRunning,
    phase,
    currentRound,
    roundCount,
    workTime,
    restTime,
    setTimeLeft,
    setPhase,
    setCurrentRound,
    setIsRunning,
    setTotalTimeElapsed,
  ]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentRound(1);
    setPhase("work");
    setTimeLeft(workTime);
    setTotalTimeElapsed(0);
  };

  const progress =
    phase === "work"
      ? (1 - timeLeft / workTime) * 100
      : (1 - timeLeft / restTime) * 100;

  return (
    <div
      className="flex flex-col h-screen bg-[#0d1410] text-white font-sans selection:bg-[#54f085]/30 safe-area-inset overflow-hidden"
      style={{ maxWidth: "480px", margin: "0 auto" }}
    >
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 pt-2 pb-24 overflow-hidden border-x border-white/5">
        {/* Header */}
        <header className="flex items-center justify-center py-4 relative">
          <h1 className="text-[11px] font-black tracking-[0.4em] uppercase text-white/90">
            Boxing Timer
          </h1>
        </header>

        {/* Round Info */}
        <div className="text-center mt-4 shrink-0">
          <h2 className="text-3xl font-black mb-1 tracking-tight">
            Round {currentRound}/{roundCount}
          </h2>
          <p
            className={cn(
              "text-[10px] font-black tracking-[0.2em] uppercase mb-2",
              phase === "work" ? "text-[#54f085]" : "text-orange-400",
            )}
          >
            {phase === "work" ? "Work Phase" : "Rest Phase"}
          </p>
          <button
            onClick={() => setCurrentPage("workouts")}
            className="inline-flex items-center gap-1 text-[10px] font-medium tracking-[0.1em] uppercase px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/70"
          >
            {activeWorkout.name}
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Main Timer Display */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-4 shrink">
          <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 200 200"
            >
              {/* Background Circle */}
              <circle
                cx="100"
                cy="100"
                r="95"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="2"
              />
              {/* Progress Circle */}
              <circle
                cx="100"
                cy="100"
                r="95"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 95}
                strokeDashoffset={
                  2 * Math.PI * 95 - (progress / 100) * (2 * Math.PI * 95)
                }
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-300",
                  phase === "work"
                    ? "text-[#54f085] drop-shadow-[0_0_10px_rgba(84,240,133,0.4)]"
                    : "text-orange-400",
                )}
              />
            </svg>

            <div className="flex flex-col items-center justify-center z-10 w-full">
              <div
                className={cn(
                  "text-[9rem] sm:text-[16rem] font-black tracking-[-0.08em] leading-none text-center w-full",
                  phase === "work"
                    ? "text-[#54f085] [text-shadow:0_0_40px_rgba(84,240,133,0.7)]"
                    : "text-orange-400",
                )}
              >
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 shrink-0">
          <div className="bg-[#161e19] border border-[#1f2923] rounded-2xl p-6 text-center flex flex-col justify-center items-center shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
              Rest
            </span>
            <span className="text-3xl font-black tabular-nums">
              {formatTime(restTime)}
            </span>
          </div>
          <div className="bg-[#161e19] border border-[#1f2923] rounded-2xl p-6 text-center flex flex-col justify-center items-center shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
              Total
            </span>
            <span className="text-3xl font-black tabular-nums">
              {formatTime(totalTimeElapsed)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 shrink-0 mb-24">
          <button
            onClick={toggleTimer}
            className="w-full bg-[#54f085] hover:bg-[#54f085]/90 text-[#0d1410] font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] border-none shadow-[0_10px_30px_rgba(84,240,133,0.3)]"
          >
            {isRunning ? (
              <>
                <div className="flex gap-1">
                  <div className="w-2 h-6 bg-current rounded-sm"></div>
                  <div className="w-2 h-6 bg-current rounded-sm"></div>
                </div>
                <span className="text-xl tracking-[0.2em]">PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current ml-1" />
                <span className="text-xl tracking-[0.2em]">START</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentPage("settings")}
              className="flex items-center justify-center gap-3 py-5 bg-transparent hover:bg-white/5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] transition-colors border-2 border-[#1f2923] text-white"
            >
              <div className="flex gap-1">
                <div className="w-1.5 h-5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-5 bg-current rounded-sm"></div>
              </div>
              SETTINGS
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center justify-center gap-3 py-5 bg-transparent hover:bg-white/5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] transition-colors border-2 border-[#1f2923] text-white"
            >
              RESET
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage] = useAtom(currentPageAtom);

  switch (currentPage) {
    case "settings":
      return <Settings />;
    case "workouts":
      return <WorkoutSelector />;
    default:
      return <TimerPage />;
  }
}
