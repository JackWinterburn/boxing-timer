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

  return (
    <div className="flex flex-col h-screen bg-[#0d1410] text-white font-sans selection:bg-[#54f085]/30 p-4 pb-8 safe-area-inset overflow-hidden">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between py-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors border-none bg-transparent">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[11px] font-black tracking-[0.4em] uppercase text-white/90">Boxing Timer</h1>
          <div className="w-10" />
        </header>

        {/* Round Info */}
        <div className="text-center mt-4 shrink-0">
          <h2 className="text-3xl font-black mb-1 tracking-tight">Round {currentRound}/{roundCount}</h2>
          <p className={cn(
            "text-[10px] font-black tracking-[0.2em] uppercase",
            phase === 'work' ? "text-[#54f085]" : "text-orange-400"
          )}>
            {phase === 'work' ? 'Work Phase' : 'Rest Phase'}
          </p>
        </div>

        {/* Main Timer Display */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-4 shrink">
          <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Background Circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="4"
              />
              {/* Progress Circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={circum}
                strokeDashoffset={circum - (progress / 100) * circum}
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-300",
                  phase === 'work' ? "text-[#54f085] drop-shadow-[0_0_10px_rgba(84,240,133,0.4)]" : "text-orange-400"
                )}
              />
            </svg>
            
            <div className="flex flex-col items-center justify-center z-10">
              <div className={cn(
                "text-9xl sm:text-[11rem] font-black tracking-[-0.05em] leading-none",
                phase === 'work' ? "text-[#54f085] [text-shadow:0_0_20px_rgba(84,240,133,0.5)]" : "text-orange-400"
              )}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Area */}
        <div className="mb-6 space-y-3 shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Round Progress</span>
            <span className="text-[10px] font-black text-[#54f085]">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                phase === 'work' ? "bg-[#54f085]" : "bg-orange-400"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8 shrink-0">
          <div className="bg-[#161e19] border border-[#1f2923] rounded-[20px] p-4 text-center flex flex-col justify-center items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Rest</span>
            <span className="text-xl font-black tabular-nums">{formatTime(restTime)}</span>
          </div>
          <div className="bg-[#161e19] border border-[#1f2923] rounded-[20px] p-4 text-center flex flex-col justify-center items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Total</span>
            <span className="text-xl font-black tabular-nums">{formatTime(totalTimeElapsed)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 mt-auto mb-6 shrink-0">
          <button 
            onClick={toggleTimer}
            className="w-full bg-[#54f085] hover:bg-[#54f085]/90 text-[#0d1410] font-black uppercase py-5 rounded-[20px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] border-none shadow-[0_4px_25px_rgba(84,240,133,0.25)]"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span className="text-[14px] tracking-[0.2em]">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current ml-1" />
                <span className="text-[14px] tracking-[0.2em]">Start</span>
              </>
            )}
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              disabled={!isRunning}
              onClick={() => setIsRunning(false)}
              className="flex items-center justify-center gap-2 py-4 bg-[#161e19] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] transition-colors border border-[#1f2923] text-white/90"
            >
              <Pause className="w-4 h-4 fill-current" />
              Pause
            </button>
            <button 
              onClick={resetTimer}
              className="flex items-center justify-center gap-2 py-4 bg-[#161e19] hover:bg-white/5 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] transition-colors border border-[#1f2923] text-white/90"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
