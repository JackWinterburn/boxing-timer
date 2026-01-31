import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { ChevronLeft, ChevronRight, Clock, Coffee, Volume2, Smartphone, Zap, Timer, Bell } from 'lucide-react';
import { currentPageAtom, activeWorkoutAtom, appStateAtom, timeLeftAtom, currentRoundAtom, phaseAtom, totalTimeElapsedAtom, isRunningAtom } from '../atoms';
import { WorkoutConfig, DEFAULT_WORKOUT } from '../types';
import { saveWorkout, generateId, saveAppState, setActiveWorkout } from '../storage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ScrollPickerProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  padZero?: boolean;
}

function ScrollPicker({ value, min, max, onChange, padZero = true }: ScrollPickerProps) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const currentIndex = values.indexOf(value);
  
  const prevValue = currentIndex > 0 ? values[currentIndex - 1] : null;
  const nextValue = currentIndex < values.length - 1 ? values[currentIndex + 1] : null;
  
  const format = (v: number | null) => {
    if (v === null) return '';
    return padZero ? v.toString().padStart(2, '0') : v.toString();
  };

  const handleUp = () => {
    if (currentIndex > 0) {
      onChange(values[currentIndex - 1]);
    }
  };

  const handleDown = () => {
    if (currentIndex < values.length - 1) {
      onChange(values[currentIndex + 1]);
    }
  };

  return (
    <div className="flex flex-col items-center w-20">
      <button 
        onClick={handleUp}
        className="text-white/30 text-lg font-medium h-8 bg-transparent border-none"
      >
        {format(prevValue)}
      </button>
      <div className="bg-[#1a3a2a] rounded-lg px-4 py-2 my-1">
        <span className="text-[#54f085] text-2xl font-black">{format(value)}</span>
      </div>
      <button 
        onClick={handleDown}
        className="text-white/30 text-lg font-medium h-8 bg-transparent border-none"
      >
        {format(nextValue)}
      </button>
    </div>
  );
}

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
}

function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "w-12 h-7 rounded-full transition-colors border-none relative",
        enabled ? "bg-[#54f085]" : "bg-white/20"
      )}
    >
      <div className={cn(
        "w-5 h-5 bg-white rounded-full absolute top-1 transition-all",
        enabled ? "right-1" : "left-1"
      )} />
    </button>
  );
}

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
  const [showRoundPicker, setShowRoundPicker] = useState(false);
  const [showRestPicker, setShowRestPicker] = useState(false);

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

  const roundMinutes = Math.floor(workout.roundDuration / 60);
  const roundSeconds = workout.roundDuration % 60;
  const restMinutes = Math.floor(workout.restDuration / 60);
  const restSeconds = workout.restDuration % 60;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sliderMarks = [1, 6, 12, 18, 24];

  return (
    <div className="flex flex-col h-screen bg-[#0d1410] text-white font-sans overflow-y-auto">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 pb-8">
        {/* Header */}
        <header className="flex items-center gap-3 py-4 sticky top-0 bg-[#0d1410] z-10">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-white/5 rounded-full transition-colors border-none bg-transparent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold">Custom Workout Settings</h1>
        </header>

        {/* Workout Name */}
        <div className="mt-4 mb-6">
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#54f085] block mb-2">
            Workout Name
          </label>
          <input
            type="text"
            value={workout.name}
            onChange={(e) => updateWorkout({ name: e.target.value })}
            placeholder="e.g., Morning Sparring"
            className="w-full bg-transparent border-none py-2 text-lg text-white/50 placeholder:text-white/30 focus:outline-none focus:text-white"
          />
        </div>

        {/* Workout Parameters */}
        <div className="mb-6">
          <h2 className="text-base font-bold mb-4">Workout Parameters</h2>
          
          {/* Round Duration */}
          <div className="mb-4">
            <button 
              onClick={() => setShowRoundPicker(!showRoundPicker)}
              className="w-full flex items-center justify-between py-3 bg-transparent border-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1a3a2a] rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#54f085]" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Round Duration</p>
                  <p className="text-[10px] text-white/40">Standard training length</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#54f085] font-bold">{formatTime(workout.roundDuration)}</span>
                <ChevronRight className={cn("w-4 h-4 text-white/40 transition-transform", showRoundPicker && "rotate-90")} />
              </div>
            </button>
            
            {showRoundPicker && (
              <div className="flex items-center justify-center gap-2 py-4 bg-[#0f1a14] rounded-xl mt-2">
                <ScrollPicker 
                  value={roundMinutes} 
                  min={0} 
                  max={10} 
                  onChange={(v) => updateWorkout({ roundDuration: v * 60 + roundSeconds })}
                />
                <span className="text-2xl font-bold text-white/50">:</span>
                <ScrollPicker 
                  value={roundSeconds} 
                  min={0} 
                  max={59} 
                  onChange={(v) => updateWorkout({ roundDuration: roundMinutes * 60 + v })}
                />
              </div>
            )}
          </div>

          {/* Rest Duration */}
          <div className="mb-6">
            <button 
              onClick={() => setShowRestPicker(!showRestPicker)}
              className="w-full flex items-center justify-between py-3 bg-transparent border-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1a3a2a] rounded-lg flex items-center justify-center">
                  <Coffee className="w-4 h-4 text-[#54f085]" />
                </div>
                <p className="font-medium text-sm">Rest Duration</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#54f085] font-bold">{formatTime(workout.restDuration)}</span>
                <ChevronRight className={cn("w-4 h-4 text-white/40 transition-transform", showRestPicker && "rotate-90")} />
              </div>
            </button>
            
            {showRestPicker && (
              <div className="flex items-center justify-center gap-2 py-4 bg-[#0f1a14] rounded-xl mt-2">
                <ScrollPicker 
                  value={restMinutes} 
                  min={0} 
                  max={10} 
                  onChange={(v) => updateWorkout({ restDuration: v * 60 + restSeconds })}
                />
                <span className="text-2xl font-bold text-white/50">:</span>
                <ScrollPicker 
                  value={restSeconds} 
                  min={0} 
                  max={59} 
                  onChange={(v) => updateWorkout({ restDuration: restMinutes * 60 + v })}
                />
              </div>
            )}
          </div>

          {/* Total Rounds */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Total Rounds</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#54f085]">Pro Setting</span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-black">{workout.totalRounds}</span>
              <span className="text-sm text-white/40">rounds</span>
            </div>
            
            {/* Custom Slider */}
            <div className="relative pt-2 pb-6">
              <input
                type="range"
                min="1"
                max="24"
                value={workout.totalRounds}
                onChange={(e) => updateWorkout({ totalRounds: parseInt(e.target.value) })}
                className="w-full h-1 bg-[#1a3a2a] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#54f085] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(84,240,133,0.5)]"
                style={{
                  background: `linear-gradient(to right, #54f085 0%, #54f085 ${((workout.totalRounds - 1) / 23) * 100}%, #1a3a2a ${((workout.totalRounds - 1) / 23) * 100}%, #1a3a2a 100%)`
                }}
              />
              <div className="flex justify-between mt-3">
                {sliderMarks.map((mark) => (
                  <span key={mark} className="text-[10px] text-white/30">{mark}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Feedback */}
        <div className="mb-6">
          <h2 className="text-base font-bold mb-4">Notifications & Feedback</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-white/50" />
                <span className="font-medium text-sm">Sound Effects</span>
              </div>
              <ToggleSwitch 
                enabled={workout.soundEffects} 
                onChange={() => updateWorkout({ soundEffects: !workout.soundEffects })} 
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-white/50" />
                <span className="font-medium text-sm">Vibration</span>
              </div>
              <ToggleSwitch 
                enabled={workout.vibration} 
                onChange={() => updateWorkout({ vibration: !workout.vibration })} 
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-white/50" />
                <span className="font-medium text-sm">Visual Flash</span>
              </div>
              <ToggleSwitch 
                enabled={workout.visualFlash} 
                onChange={() => updateWorkout({ visualFlash: !workout.visualFlash })} 
              />
            </div>
          </div>
        </div>

        {/* Advanced */}
        <div className="mb-8">
          <h2 className="text-base font-bold mb-4">Advanced</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Timer className="w-5 h-5 text-white/50" />
                <span className="font-medium text-sm">Preparation Time</span>
              </div>
              <button
                onClick={() => {
                  const times = [5, 10, 15, 30];
                  const currentIndex = times.indexOf(workout.preparationTime);
                  const nextIndex = (currentIndex + 1) % times.length;
                  updateWorkout({ preparationTime: times[nextIndex] });
                }}
                className="text-white/70 font-medium bg-transparent border-none"
              >
                {workout.preparationTime}s
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-white/50" />
                <span className="font-medium text-sm">Warning Signal</span>
              </div>
              <button
                onClick={() => {
                  const times = [10, 30, 60];
                  const currentIndex = times.indexOf(workout.warningSignal);
                  const nextIndex = (currentIndex + 1) % times.length;
                  updateWorkout({ warningSignal: times[nextIndex] });
                }}
                className="text-white/70 font-medium bg-transparent border-none"
              >
                {workout.warningSignal}s before end
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-auto sticky bottom-0 bg-[#0d1410] py-4">
          <button 
            onClick={handleSave}
            className="w-full bg-[#54f085] hover:bg-[#54f085]/90 text-[#0d1410] font-black uppercase py-4 rounded-2xl flex items-center justify-center transition-all active:scale-[0.98] border-none shadow-[0_4px_25px_rgba(84,240,133,0.25)]"
          >
            <span className="text-sm tracking-[0.15em]">Start Workout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
