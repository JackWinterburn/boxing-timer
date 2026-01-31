import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { ChevronLeft, Clock, Coffee, Volume2, Smartphone, Zap, Timer, Bell } from 'lucide-react';
import { currentPageAtom, activeWorkoutAtom, appStateAtom, timeLeftAtom, currentRoundAtom, phaseAtom, totalTimeElapsedAtom, isRunningAtom } from '../atoms';
import { WorkoutConfig, DEFAULT_WORKOUT } from '../types';
import { saveWorkout, generateId, saveAppState, setActiveWorkout } from '../storage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function Settings() {
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [activeWorkout, setActiveWorkout_] = useAtom(activeWorkoutAtom);
  const [appState, setAppState] = useAtom(appStateAtom);
  const [, setTimeLeft] = useAtom(timeLeftAtom);
  const [, setCurrentRound] = useAtom(currentRoundAtom);
  const [, setPhase] = useAtom(phaseAtom);
  const [, setTotalTimeElapsed] = useAtom(totalTimeElapsedAtom);
  const [, setIsRunning] = useAtom(isRunningAtom);
  
  const [workout, setWorkout] = useState<WorkoutConfig>({ ...activeWorkout });

  useEffect(() => {
    if (activeWorkout.id === 'new') {
      setWorkout({
        ...DEFAULT_WORKOUT,
        id: generateId(),
        name: '',
      });
    } else {
      setWorkout({ ...activeWorkout });
    }
  }, [activeWorkout]);

  const handleSave = () => {
    const workoutToSave = {
      ...workout,
      name: workout.name || 'Unnamed Workout',
    };
    
    saveWorkout(workoutToSave);
    setActiveWorkout(workoutToSave.id);
    
    const updatedState = {
      ...appState,
      workouts: appState.workouts.some(w => w.id === workoutToSave.id)
        ? appState.workouts.map(w => w.id === workoutToSave.id ? workoutToSave : w)
        : [...appState.workouts, workoutToSave],
      activeWorkoutId: workoutToSave.id,
    };
    setAppState(updatedState);
    saveAppState(updatedState);
    
    setActiveWorkout_(workoutToSave);
    setTimeLeft(workoutToSave.roundDuration);
    setCurrentRound(1);
    setPhase('work');
    setTotalTimeElapsed(0);
    setIsRunning(false);
    
    setCurrentPage('timer');
  };

  const handleBack = () => {
    setCurrentPage('timer');
  };

  const updateWorkout = (updates: Partial<WorkoutConfig>) => {
    setWorkout(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1410] text-white font-sans p-4 pb-8 overflow-y-auto">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Header */}
        <header className="flex items-center gap-4 py-4 mb-6">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-white/5 rounded-full transition-colors border-none bg-transparent"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-black tracking-[0.2em] uppercase text-white/90">Custom Workout Settings</h1>
        </header>

        {/* Workout Name */}
        <div className="mb-8">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#54f085] block mb-3">
            Workout Name
          </label>
          <input
            type="text"
            value={workout.name}
            onChange={(e) => updateWorkout({ name: e.target.value })}
            placeholder="e.g., Morning Sparring"
            className="w-full bg-transparent border-b border-white/20 py-3 text-lg font-medium placeholder:text-white/30 focus:outline-none focus:border-[#54f085] transition-colors"
          />
        </div>

        {/* Workout Parameters */}
        <div className="mb-8">
          <h2 className="text-base font-black mb-6">Workout Parameters</h2>
          
          {/* Round Duration */}
          <div className="flex items-center justify-between py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#54f085]/10 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#54f085]" />
              </div>
              <div>
                <p className="font-bold text-sm">Round Duration</p>
                <p className="text-[10px] text-white/40">Standard training length</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const mins = Math.floor(workout.roundDuration / 60);
                const newMins = mins === 5 ? 1 : mins + 1;
                updateWorkout({ roundDuration: newMins * 60 });
              }}
              className="text-[#54f085] font-bold text-lg bg-transparent border-none"
            >
              {formatDuration(workout.roundDuration)}
            </button>
          </div>

          {/* Rest Duration */}
          <div className="flex items-center justify-between py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#54f085]/10 rounded-lg flex items-center justify-center">
                <Coffee className="w-4 h-4 text-[#54f085]" />
              </div>
              <div>
                <p className="font-bold text-sm">Rest Duration</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const secs = workout.restDuration;
                const newSecs = secs >= 120 ? 30 : secs + 30;
                updateWorkout({ restDuration: newSecs });
              }}
              className="text-[#54f085] font-bold text-lg bg-transparent border-none"
            >
              {formatDuration(workout.restDuration)}
            </button>
          </div>

          {/* Total Rounds */}
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Total Rounds</p>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#54f085]">Pro Setting</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black">{workout.totalRounds}</span>
              <span className="text-sm text-white/40">rounds</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={workout.totalRounds}
              onChange={(e) => updateWorkout({ totalRounds: parseInt(e.target.value) })}
              className="w-full mt-4 accent-[#54f085]"
            />
            <div className="flex justify-between text-[10px] text-white/30 mt-2">
              <span>1</span>
              <span>6</span>
              <span>12</span>
              <span>18</span>
              <span>24</span>
            </div>
          </div>
        </div>

        {/* Notifications & Feedback */}
        <div className="mb-8">
          <h2 className="text-base font-black mb-6">Notifications & Feedback</h2>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-white/60" />
                <span className="font-medium">Sound Effects</span>
              </div>
              <button
                onClick={() => updateWorkout({ soundEffects: !workout.soundEffects })}
                className={cn(
                  "w-12 h-7 rounded-full transition-colors border-none relative",
                  workout.soundEffects ? "bg-[#54f085]" : "bg-white/20"
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full absolute top-1 transition-all",
                  workout.soundEffects ? "right-1" : "left-1"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-white/60" />
                <span className="font-medium">Vibration</span>
              </div>
              <button
                onClick={() => updateWorkout({ vibration: !workout.vibration })}
                className={cn(
                  "w-12 h-7 rounded-full transition-colors border-none relative",
                  workout.vibration ? "bg-[#54f085]" : "bg-white/20"
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full absolute top-1 transition-all",
                  workout.vibration ? "right-1" : "left-1"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-white/60" />
                <span className="font-medium">Visual Flash</span>
              </div>
              <button
                onClick={() => updateWorkout({ visualFlash: !workout.visualFlash })}
                className={cn(
                  "w-12 h-7 rounded-full transition-colors border-none relative",
                  workout.visualFlash ? "bg-[#54f085]" : "bg-white/20"
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full absolute top-1 transition-all",
                  workout.visualFlash ? "right-1" : "left-1"
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced */}
        <div className="mb-8">
          <h2 className="text-base font-black mb-6">Advanced</h2>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Timer className="w-5 h-5 text-white/60" />
                <span className="font-medium">Preparation Time</span>
              </div>
              <button
                onClick={() => {
                  const times = [5, 10, 15, 30];
                  const currentIndex = times.indexOf(workout.preparationTime);
                  const nextIndex = (currentIndex + 1) % times.length;
                  updateWorkout({ preparationTime: times[nextIndex] });
                }}
                className="text-white/60 font-medium bg-transparent border-none"
              >
                {workout.preparationTime}s
              </button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-white/60" />
                <span className="font-medium">Warning Signal</span>
              </div>
              <button
                onClick={() => {
                  const times = [10, 30, 60];
                  const currentIndex = times.indexOf(workout.warningSignal);
                  const nextIndex = (currentIndex + 1) % times.length;
                  updateWorkout({ warningSignal: times[nextIndex] });
                }}
                className="text-white/60 font-medium bg-transparent border-none"
              >
                {workout.warningSignal}s before end
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          className="w-full bg-[#54f085] hover:bg-[#54f085]/90 text-[#0d1410] font-black uppercase py-5 rounded-[20px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] border-none shadow-[0_4px_25px_rgba(84,240,133,0.25)] mt-auto mb-4"
        >
          <span className="text-[14px] tracking-[0.2em]">Start Workout</span>
        </button>
      </div>
    </div>
  );
}
