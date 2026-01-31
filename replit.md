# Boxing Timer App

## Overview
A mobile-first boxing timer application built with React, Vite, TypeScript, Jotai, and Chakra UI v3.

## Project Structure
- `src/` - React source code
  - `App.tsx` - Main application component with routing and timer logic
  - `atoms.ts` - Jotai state atoms (timer state, phases, navigation)
  - `types.ts` - TypeScript type definitions for WorkoutConfig
  - `storage.ts` - localStorage utilities for workout persistence
  - `theme.ts` - Chakra UI v3 theme configuration
  - `main.tsx` - Application entry point with ChakraProvider
  - `components/` - React components
    - `Settings.tsx` - Workout settings/editor page
    - `WorkoutSelector.tsx` - Saved workouts menu with edit/delete

## Tech Stack
- React 18
- Jotai (State Management)
- Chakra UI v3 (Component Library & Styling)
- @emotion/react (CSS-in-JS)
- react-icons (Icons)
- Vite 5 (Build System)

## Development
The dev server runs on port 5000 with:
```bash
npm run dev
```

## Build
```bash
npm run build
```

## Features
- **Prep Phase**: Optional countdown before workout begins (0-30 seconds)
- **Work/Rest Phases**: Automatic transitions with color-coded display
- **Round Tracking**: Configurable 1-24 rounds
- **Multiple Workout Configs**: Create, edit, switch between saved workouts
- **Persistent Storage**: All workouts saved to localStorage
- **Default Workout**: 12 rounds, 3min work, 1min rest, 10s prep
- **Mobile-Optimized**: Max-width container, large touch targets
- **Neon Green/Dark Aesthetic**: Phase-specific colors (yellow prep, green work, orange rest)

## Timer Phases
1. **Prep (Yellow)**: "Get Ready" countdown before first round
2. **Work (Green)**: Active training phase
3. **Rest (Orange)**: Recovery between rounds

## Workout Configuration Options
- Workout name
- Prep time (0, 5, 10, 15, 30 seconds)
- Round duration (1-5 minutes)
- Rest duration (30s - 2min)
- Total rounds (1-24)
- Sound effects, vibration, visual flash toggles
- Warning signal timing

## Theme Colors (Chakra UI v3)
- Background: #0d1410
- Card: #161e19
- Border: #1f2923
- Green (Work): #54f085
- Yellow (Prep): #facc15
- Orange (Rest): #fb923c
