# Gym Progress Tracker

A personal workout tracking app built with Next.js 15 (App Router), TypeScript, and Tailwind CSS.

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
gym-tracker/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout with Header
│   ├── page.tsx          # Home / dashboard page
│   └── globals.css       # Global styles (Tailwind import)
├── components/           # Reusable UI components
│   └── Header.tsx        # Sticky navigation header
├── lib/                  # Helper functions & business logic
│   └── storage.ts        # Type-safe localStorage utilities
├── types/                # TypeScript type definitions
│   └── index.ts          # Shared types (WorkoutSession, Exercise, etc.)
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Storage**: localStorage (via `lib/storage.ts`)
