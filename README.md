# CodeZetta Interview Hub

Production-ready interview preparation platform for Frontend and Backend developers.

**Master Your Next Tech Interview.**

1,100+ carefully organized Frontend & Backend interview questions — from fundamentals to Tech Lead.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- localStorage-backed progress, bookmarks, and preferences (swappable for a future API)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run validate:questions` | Validate question banks |

## Architecture

```text
src/
  app/                  # Routes (landing, onboarding, dashboard, SEO question pages)
  components/           # UI, layout, question/dashboard components
  features/             # Feature modules (extensible)
  data/questions/       # Per-technology JSON question banks
  lib/
    repositories/       # QuestionsRepository (Static now, API later)
    storage/            # Progress, bookmarks, preferences
    interview/          # Balanced interview generator + session helpers
    questions/          # Registry/loader
  types/                # Shared domain types
scripts/
  validate-questions.ts
```

UI never imports JSON files directly — use `getQuestionsRepository()`.

## Content status

| Technology | Questions |
|------------|----------:|
| HTML | 100 |
| CSS | 100 |
| JavaScript | 100 |
| TypeScript | 100 |
| SCSS | 100 |
| Angular | 100 |
| React | 100 |
| Next.js | 100 |
| Vue.js | 100 |
| Node.js | 100 |
| NestJS | 100 |
| **Total** | **1100** |

Edit content under `src/data/questions/<technology>/` and keep `src/lib/questions/registry.ts` in sync.

## Key routes

- `/` — Landing
- `/onboarding` — Path → technologies → level → mode
- `/dashboard` — Personalized prep hub
- `/questions` — Filterable question bank
- `/questions/javascript/...` — SEO + shareable question URLs
- `/practice` / `/practice/[technology]` — Practice mode
- `/mock` — Timed mock interview
- `/generate` — Balanced interview generator
- `/review` — Weak-question review
- `/saved` — Bookmarks
- `/challenge` — Question of the Day

## Brand

**CodeZetta** · Interview Hub
