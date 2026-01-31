import { atom } from 'jotai';
import { getActiveWorkout, getAppState } from './storage';
import { WorkoutConfig, AppState } from './types';

const initialWorkout = getActiveWorkout();
const initialState = getAppState();

export const appStateAtom = atom<AppState>(initialState);
export const activeWorkoutAtom = atom<WorkoutConfig>(initialWorkout);

export const roundCountAtom = atom((get) => get(activeWorkoutAtom).totalRounds);
export const currentRoundAtom = atom(1);
export const workTimeAtom = atom((get) => get(activeWorkoutAtom).roundDuration);
export const restTimeAtom = atom((get) => get(activeWorkoutAtom).restDuration);
export const prepTimeAtom = atom((get) => get(activeWorkoutAtom).preparationTime);
export const timeLeftAtom = atom(initialWorkout.preparationTime > 0 ? initialWorkout.preparationTime : initialWorkout.roundDuration);
export const isRunningAtom = atom(false);
export const phaseAtom = atom<'prep' | 'work' | 'rest'>(initialWorkout.preparationTime > 0 ? 'prep' : 'work');
export const totalTimeElapsedAtom = atom(0);

export type Page = 'timer' | 'settings' | 'workouts';
export const currentPageAtom = atom<Page>('timer');

export const editingWorkoutIdAtom = atom<string | null>(null);
