import { useAtom } from 'jotai';
import { ChevronLeft, Plus, Trash2, Check } from 'lucide-react';
import { currentPageAtom, activeWorkoutAtom, appStateAtom, timeLeftAtom, currentRoundAtom, phaseAtom, totalTimeElapsedAtom, isRunningAtom } from '../atoms';
import { deleteWorkout, setActiveWorkout, saveAppState, getAppState } from '../storage';
import { WorkoutConfig } from '../types';
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

export default function WorkoutSelector() {
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [activeWorkout, setActiveWorkout_] = useAtom(activeWorkoutAtom);
  const [appState, setAppState_] = useAtom(appStateAtom);
  const [, setTimeLeft] = useAtom(timeLeftAtom);
  const [, setCurrentRound] = useAtom(currentRoundAtom);
  const [, setPhase] = useAtom(phaseAtom);
  const [, setTotalTimeElapsed] = useAtom(totalTimeElapsedAtom);
  const [, setIsRunning] = useAtom(isRunningAtom);

  const handleBack = () => {
    setCurrentPage('timer');
  };

  const handleSelectWorkout = (workout: WorkoutConfig) => {
    setActiveWorkout(workout.id);
    setActiveWorkout_(workout);
    
    const updatedState = { ...appState, activeWorkoutId: workout.id };
    setAppState_(updatedState);
    saveAppState(updatedState);
    
    setTimeLeft(workout.roundDuration);
    setCurrentRound(1);
    setPhase('work');
    setTotalTimeElapsed(0);
    setIsRunning(false);
    
    setCurrentPage('timer');
  };

  const handleDeleteWorkout = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === 'default') return;
    
    deleteWorkout(id);
    const newState = getAppState();
    setAppState_(newState);
    
    if (activeWorkout.id === id) {
      const defaultWorkout = newState.workouts.find(w => w.id === 'default') || newState.workouts[0];
      setActiveWorkout_(defaultWorkout);
      setTimeLeft(defaultWorkout.roundDuration);
    }
  };

  const handleCreateNew = () => {
    setActiveWorkout_({ ...activeWorkout, id: 'new' } as WorkoutConfig);
    setCurrentPage('settings');
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1410] text-white font-sans overflow-y-auto">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 pb-8 shadow-2xl">
        {/* Header */}
        <header className="flex items-center gap-4 py-4 mb-6">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-white/5 rounded-full transition-colors border-none bg-transparent"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-black tracking-[0.2em] uppercase text-white/90">Select Workout</h1>
        </header>

        {/* Workout List */}
        <div className="space-y-3 flex-1">
          {appState.workouts.map((workout) => (
            <button
              key={workout.id}
              onClick={() => handleSelectWorkout(workout)}
              className={cn(
                "w-full p-5 rounded-[20px] text-left transition-all border",
                activeWorkout.id === workout.id 
                  ? "bg-[#54f085]/10 border-[#54f085]" 
                  : "bg-[#161e19] border-[#1f2923] hover:border-white/20"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-black text-base">{workout.name}</h3>
                    {activeWorkout.id === workout.id && (
                      <Check className="w-4 h-4 text-[#54f085]" />
                    )}
                  </div>
                  <p className="text-sm text-white/50">
                    {workout.totalRounds} rounds • {formatDuration(workout.roundDuration)} work • {formatDuration(workout.restDuration)} rest
                  </p>
                </div>
                {workout.id !== 'default' && (
                  <button
                    onClick={(e) => handleDeleteWorkout(workout.id, e)}
                    className="p-2 hover:bg-red-500/20 rounded-full transition-colors border-none bg-transparent ml-2"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Create New Button */}
        <button 
          onClick={handleCreateNew}
          className="w-full bg-[#161e19] hover:bg-white/5 text-white font-black uppercase py-5 rounded-[20px] flex items-center justify-center gap-2 transition-all border border-[#1f2923] mt-6 mb-4"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[14px] tracking-[0.2em]">Create New Workout</span>
        </button>
      </div>
    </div>
  );
}
