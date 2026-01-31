import { atom } from 'jotai';

export const roundCountAtom = atom(12);
export const currentRoundAtom = atom(1);
export const workTimeAtom = atom(180); // 3 minutes in seconds
export const restTimeAtom = atom(60); // 1 minute in seconds
export const timeLeftAtom = atom(180);
export const isRunningAtom = atom(false);
export const phaseAtom = atom<'work' | 'rest'>('work');
export const totalTimeElapsedAtom = atom(0);
