import { WorkoutConfig, AppState, DEFAULT_WORKOUT } from './types';

const STORAGE_KEY = 'boxing-timer-state';

export function getAppState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AppState;
      if (parsed.workouts && Array.isArray(parsed.workouts)) {
        const hasDefault = parsed.workouts.some(w => w.id === 'default');
        if (!hasDefault) {
          parsed.workouts.unshift(DEFAULT_WORKOUT);
        }
        
        const activeExists = parsed.workouts.some(w => w.id === parsed.activeWorkoutId);
        if (!activeExists) {
          parsed.activeWorkoutId = 'default';
        }
        
        if (parsed.workouts.length > 0) {
          saveAppState(parsed);
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error('Failed to load app state:', e);
  }
  
  const defaultState: AppState = {
    workouts: [DEFAULT_WORKOUT],
    activeWorkoutId: 'default',
  };
  saveAppState(defaultState);
  return defaultState;
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save app state:', e);
  }
}

export function getActiveWorkout(): WorkoutConfig {
  const state = getAppState();
  const workout = state.workouts.find(w => w.id === state.activeWorkoutId);
  return workout || state.workouts[0] || DEFAULT_WORKOUT;
}

export function saveWorkout(workout: WorkoutConfig): void {
  const state = getAppState();
  const existingIndex = state.workouts.findIndex(w => w.id === workout.id);
  
  if (existingIndex >= 0) {
    state.workouts[existingIndex] = workout;
  } else {
    state.workouts.push(workout);
  }
  
  saveAppState(state);
}

export function deleteWorkout(id: string): void {
  if (id === 'default') return;
  
  const state = getAppState();
  state.workouts = state.workouts.filter(w => w.id !== id);
  
  if (state.activeWorkoutId === id) {
    state.activeWorkoutId = 'default';
  }
  
  saveAppState(state);
}

export function setActiveWorkout(id: string): void {
  const state = getAppState();
  state.activeWorkoutId = id;
  saveAppState(state);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
