import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { ChevronLeft, Clock, Coffee, Volume2, Smartphone, Zap, Bell, Hourglass } from 'lucide-react';
import { currentPageAtom, activeWorkoutAtom, appStateAtom, timeLeftAtom, currentRoundAtom, phaseAtom, totalTimeElapsedAtom, isRunningAtom, editingWorkoutIdAtom } from '../atoms';
import { WorkoutConfig, DEFAULT_WORKOUT } from '../types';
import { saveWorkout, generateId, setActiveWorkout, getAppState } from '../storage';

export default function Settings() {
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [activeWorkout, setActiveWorkout_] = useAtom(activeWorkoutAtom);
  const [appState, setAppState] = useAtom(appStateAtom);
  const [, setTimeLeft] = useAtom(timeLeftAtom);
  const [, setCurrentRound] = useAtom(currentRoundAtom);
  const [, setPhase] = useAtom(phaseAtom);
  const [, setTotalTimeElapsed] = useAtom(totalTimeElapsedAtom);
  const [, setIsRunning] = useAtom(isRunningAtom);
  const [editingWorkoutId, setEditingWorkoutId] = useAtom(editingWorkoutIdAtom);
  
  const [workout, setWorkout] = useState<WorkoutConfig>({ ...activeWorkout });
  const [isNewWorkout, setIsNewWorkout] = useState(false);

  useEffect(() => {
    if (editingWorkoutId === 'new') {
      setIsNewWorkout(true);
      setWorkout({
        ...DEFAULT_WORKOUT,
        id: generateId(),
        name: '',
      });
    } else if (editingWorkoutId) {
      const existingWorkout = appState.workouts.find(w => w.id === editingWorkoutId);
      if (existingWorkout) {
        setWorkout({ ...existingWorkout });
        setIsNewWorkout(false);
      }
    } else {
      setWorkout({ ...activeWorkout });
      setIsNewWorkout(false);
    }
  }, [editingWorkoutId, activeWorkout, appState.workouts]);

  const handleSave = () => {
    const workoutToSave = {
      ...workout,
      name: workout.name || 'Unnamed Workout',
    };
    
    saveWorkout(workoutToSave);
    setActiveWorkout(workoutToSave.id);
    
    const freshState = getAppState();
    setAppState(freshState);
    
    setActiveWorkout_(workoutToSave);
    
    if (workoutToSave.preparationTime > 0) {
      setPhase('prep');
      setTimeLeft(workoutToSave.preparationTime);
    } else {
      setPhase('work');
      setTimeLeft(workoutToSave.roundDuration);
    }
    setCurrentRound(1);
    setTotalTimeElapsed(0);
    setIsRunning(false);
    
    setEditingWorkoutId(null);
    setCurrentPage('timer');
  };

  const handleBack = () => {
    setEditingWorkoutId(null);
    setCurrentPage('timer');
  };

  const updateWorkout = (updates: Partial<WorkoutConfig>) => {
    setWorkout(prev => ({ ...prev, ...updates }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const cycleRoundDuration = () => {
    const options = [60, 90, 120, 180, 240, 300];
    const currentIndex = options.indexOf(workout.roundDuration);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % options.length;
    updateWorkout({ roundDuration: options[nextIndex] });
  };

  const cycleRestDuration = () => {
    const options = [30, 45, 60, 90, 120];
    const currentIndex = options.indexOf(workout.restDuration);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % options.length;
    updateWorkout({ restDuration: options[nextIndex] });
  };

  const cyclePrepTime = () => {
    const options = [0, 5, 10, 15, 30];
    const currentIndex = options.indexOf(workout.preparationTime);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % options.length;
    updateWorkout({ preparationTime: options[nextIndex] });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1410] text-white font-sans">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 pb-6 shadow-2xl">
        {/* Header */}
        <header className="flex items-center gap-3 py-5 sticky top-0 bg-[#0d1410] z-10">
          <button 
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors border-none bg-transparent"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-base font-bold">
            {isNewWorkout ? 'New Workout' : 'Edit Workout'}
          </h1>
        </header>

        {/* Workout Name */}
        <div className="mb-8">
          <label className="text-xs font-bold uppercase tracking-wider text-[#54f085] block mb-3">
            Workout Name
          </label>
          <input
            type="text"
            value={workout.name}
            onChange={(e) => updateWorkout({ name: e.target.value })}
            placeholder="e.g., Morning Sparring"
            className="w-full bg-transparent border-b border-white/20 py-3 text-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#54f085] transition-colors"
          />
        </div>

        {/* Workout Parameters */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-5">Workout Parameters</h2>
          
          {/* Prep Time */}
          <button 
            onClick={cyclePrepTime}
            className="w-full flex items-center justify-between py-4 border-b border-white/10 bg-transparent border-x-0 border-t-0"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-400/15 rounded-xl flex items-center justify-center">
                <Hourglass className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-base">Prep Time</p>
                <p className="text-xs text-white/50 mt-0.5">Countdown before start</p>
              </div>
            </div>
            <span className="text-yellow-400 font-bold text-lg">
              {workout.preparationTime === 0 ? 'Off' : `${workout.preparationTime}s`}
            </span>
          </button>

          {/* Round Duration */}
          <button 
            onClick={cycleRoundDuration}
            className="w-full flex items-center justify-between py-4 border-b border-white/10 bg-transparent border-x-0 border-t-0"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#54f085]/15 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#54f085]" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-base">Round Duration</p>
                <p className="text-xs text-white/50 mt-0.5">Standard training length</p>
              </div>
            </div>
            <span className="text-[#54f085] font-bold text-lg">{formatTime(workout.roundDuration)}</span>
          </button>

          {/* Rest Duration */}
          <button 
            onClick={cycleRestDuration}
            className="w-full flex items-center justify-between py-4 border-b border-white/10 bg-transparent border-x-0 border-t-0"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-400/15 rounded-xl flex items-center justify-center">
                <Coffee className="w-5 h-5 text-orange-400" />
              </div>
              <p className="font-semibold text-base">Rest Duration</p>
            </div>
            <span className="text-orange-400 font-bold text-lg">{formatTime(workout.restDuration)}</span>
          </button>

          {/* Total Rounds */}
          <div className="pt-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">Total Rounds</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#54f085]">Pro Setting</span>
            </div>
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-4xl font-black">{workout.totalRounds}</span>
              <span className="text-base text-white/50">rounds</span>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="1"
                max="24"
                value={workout.totalRounds}
                onChange={(e) => updateWorkout({ totalRounds: parseInt(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #54f085 0%, #54f085 ${((workout.totalRounds - 1) / 23) * 100}%, #1a3a2a ${((workout.totalRounds - 1) / 23) * 100}%, #1a3a2a 100%)`
                }}
              />
              <div className="flex justify-between mt-3 px-1">
                {[1, 6, 12, 18, 24].map((mark) => (
                  <span key={mark} className="text-xs text-white/40 font-medium">{mark}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Feedback */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-5">Notifications & Feedback</h2>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <Volume2 className="w-5 h-5 text-white/60" />
                <span className="font-medium">Sound Effects</span>
              </div>
              <button
                onClick={() => updateWorkout({ soundEffects: !workout.soundEffects })}
                className="w-14 h-8 rounded-full transition-all duration-200 border-none relative flex items-center px-1"
                style={{ backgroundColor: workout.soundEffects ? '#54f085' : 'rgba(255,255,255,0.15)' }}
              >
                <div 
                  className="w-6 h-6 bg-white rounded-full shadow-md transition-all duration-200"
                  style={{ transform: workout.soundEffects ? 'translateX(24px)' : 'translateX(0)' }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <Smartphone className="w-5 h-5 text-white/60" />
                <span className="font-medium">Vibration</span>
              </div>
              <button
                onClick={() => updateWorkout({ vibration: !workout.vibration })}
                className="w-14 h-8 rounded-full transition-all duration-200 border-none relative flex items-center px-1"
                style={{ backgroundColor: workout.vibration ? '#54f085' : 'rgba(255,255,255,0.15)' }}
              >
                <div 
                  className="w-6 h-6 bg-white rounded-full shadow-md transition-all duration-200"
                  style={{ transform: workout.vibration ? 'translateX(24px)' : 'translateX(0)' }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <Zap className="w-5 h-5 text-white/60" />
                <span className="font-medium">Visual Flash</span>
              </div>
              <button
                onClick={() => updateWorkout({ visualFlash: !workout.visualFlash })}
                className="w-14 h-8 rounded-full transition-all duration-200 border-none relative flex items-center px-1"
                style={{ backgroundColor: workout.visualFlash ? '#54f085' : 'rgba(255,255,255,0.15)' }}
              >
                <div 
                  className="w-6 h-6 bg-white rounded-full shadow-md transition-all duration-200"
                  style={{ transform: workout.visualFlash ? 'translateX(24px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-5">Advanced</h2>
          
          <div className="space-y-1">
            <button
              onClick={() => {
                const times = [10, 30, 60];
                const currentIndex = times.indexOf(workout.warningSignal);
                const nextIndex = (currentIndex + 1) % times.length;
                updateWorkout({ warningSignal: times[nextIndex] });
              }}
              className="w-full flex items-center justify-between py-3 bg-transparent border-none"
            >
              <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 text-white/60" />
                <span className="font-medium">Warning Signal</span>
              </div>
              <span className="text-white/70 font-medium">{workout.warningSignal}s before end</span>
            </button>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-4" />

        {/* Save Button */}
        <button 
          onClick={handleSave}
          className="w-full bg-[#54f085] hover:bg-[#4de079] text-[#0d1410] font-black uppercase py-4 rounded-2xl flex items-center justify-center transition-all active:scale-[0.98] border-none shadow-[0_4px_20px_rgba(84,240,133,0.3)] text-sm tracking-widest"
        >
          {isNewWorkout ? 'Create Workout' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
