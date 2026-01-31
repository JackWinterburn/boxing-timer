# Boxing Timer App

## Overview
A mobile-first boxing timer application built with React, Vite, TypeScript, and Jotai.

## Project Structure
- `src/` - React source code
  - `App.tsx` - Main application component with routing
  - `atoms.ts` - Jotai state atoms
  - `types.ts` - TypeScript type definitions
  - `storage.ts` - localStorage utilities for workout persistence
  - `main.tsx` - Application entry point
  - `index.css` - Tailwind CSS styles
  - `components/` - React components
    - `Settings.tsx` - Workout settings page
    - `WorkoutSelector.tsx` - Saved workouts menu
- `index.html` - HTML entry point

## Tech Stack
- React 18
- Jotai (State Management)
- Tailwind CSS (Styling)
- Lucide React (Icons)
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
- Work and Rest phases with automatic transitions
- Round tracking and total time tracking
- Saved workout configurations (persisted in localStorage)
- Custom workout settings page
- Default workout: 12 rounds, 3min work, 1min rest
- Mobile-optimized layout
- Neon green/dark aesthetic
