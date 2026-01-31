import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { ChevronLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { 
  currentRoundAtom, 
  roundCountAtom, 
  timeLeftAtom, 
  isRunningAtom, 
  phaseAtom, 
  workTimeAtom, 
  restTimeAtom,
  totalTimeElapsedAtom 
} from './atoms';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function App() {
  const [currentRound, setCurrentRound] = useAtom(currentRoundAtom);
  const [roundCount] = useAtom(roundCountAtom);
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const [isRunning, setIsRunning] = useAtom(isRunningAtom);
  const [phase, setPhase] = useAtom(phaseAtom);
  const [workTime] = useAtom(workTimeAtom);
  const [restTime] = useAtom(restTimeAtom);
  const [totalTimeElapsed, setTotalTimeElapsed] = useAtom(totalTimeElapsedAtom);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTotalTimeElapsed(prev => prev + 1);
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === 'work') {
              setPhase('rest');
              return restTime;
            } else {
              if (currentRound < roundCount) {
                setCurrentRound(prev => prev + 1);
                setPhase('work');
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
  }, [isRunning, phase, currentRound, roundCount, workTime, restTime, setTimeLeft, setPhase, setCurrentRound, setIsRunning, setTotalTimeElapsed]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setCurrentRound(1);
    setPhase('work');
    setTimeLeft(workTime);
    setTotalTimeElapsed(0);
  };

  const progress = phase === 'work' 
    ? (1 - timeLeft / workTime) * 100 
    : (1 - timeLeft / restTime) * 100;

  const circum = 2 * Math.PI * 90;
  const strokeDashoffset = circum - (progress / 100) * circum;

  return (
    <div className="flex flex-col min-h-screen bg-boxing-dark text-white font-sans selection:bg-boxing-green/30 w-full max-w-[450px] mx-auto overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 mb-4">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold tracking-[0.2em] uppercase m-0">Boxing Timer</h1>
        <div className="w-10" />
      </header>

      {/* Round Info */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-1">Round {currentRound}/{roundCount}</h2>
        <p className={cn(
          "text-xs font-bold tracking-widest uppercase",
          phase === 'work' ? "text-boxing-green" : "text-orange-400"
        )}>
          {phase === 'work' ? 'Work Phase' : 'Rest Phase'}
        </p>
      </div>

      {/* Main Timer Display */}
      <div className="relative flex justify-center items-center mb-12">
        <svg className="w-64 h-64 -rotate-90">
          {/* Background Circle */}
          <circle
            cx="128"
            cy="128"
            r="90"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="4"
          />
          {/* Progress Circle */}
          <circle
            cx="128"
            cy="128"
            r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circum}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-300",
              phase === 'work' ? "text-boxing-green drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" : "text-orange-400"
            )}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <div className={cn(
            "text-7xl font-black tracking-tighter mb-1",
            phase === 'work' ? "text-boxing-green drop-shadow-[0_0_25px_rgba(74,222,128,0.7)]" : "text-orange-400"
          )}>
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <span>Minutes</span>
            <span>Seconds</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Round Progress</span>
          <span className="text-[10px] font-bold text-boxing-green">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-300 rounded-full",
              phase === 'work' ? "bg-boxing-green" : "bg-orange-400"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 px-4 mb-10">
        <div className="bg-boxing-card/50 border border-white/5 rounded-2xl p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Rest</span>
          <span className="text-xl font-bold">{formatTime(restTime)}</span>
        </div>
        <div className="bg-boxing-card/50 border border-white/5 rounded-2xl p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Total</span>
          <span className="text-xl font-bold">{formatTime(totalTimeElapsed)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 mt-auto space-y-4 pb-8">
        <button 
          onClick={toggleTimer}
          className="w-full bg-boxing-green hover:bg-boxing-green/90 text-boxing-dark font-black uppercase py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] border-none"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current ml-1" />
              <span>Start</span>
            </>
          )}
        </button>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            disabled={!isRunning}
            onClick={() => setIsRunning(false)}
            className="flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold uppercase text-xs transition-colors border-none text-white"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
          <button 
            onClick={resetTimer}
            className="flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold uppercase text-xs transition-colors border-none text-white"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
