export interface WorkoutConfig {
  id: string;
  name: string;
  roundDuration: number; // in seconds
  restDuration: number; // in seconds
  totalRounds: number;
  soundEffects: boolean;
  vibration: boolean;
  visualFlash: boolean;
  preparationTime: number; // in seconds
  warningSignal: number; // seconds before end
}

export interface AppState {
  workouts: WorkoutConfig[];
  activeWorkoutId: string;
}

export const DEFAULT_WORKOUT: WorkoutConfig = {
  id: 'default',
  name: 'Default Workout',
  roundDuration: 180, // 3 minutes
  restDuration: 60, // 1 minute
  totalRounds: 12,
  soundEffects: true,
  vibration: true,
  visualFlash: false,
  preparationTime: 10,
  warningSignal: 30,
};
