# Deutsch für Bangla-Sprecher

A free, offline-capable German course (A1 → B1) for Bangla speakers, with Bangla and English support.
React + Vite + TypeScript PWA. Lessons are plain JSON; progress is stored locally (a Supabase sync layer comes later).

## Run

```bash
npm install
npm run dev        # dev server
npm test           # content validator tests
npm run validate   # check every lesson in /content, regenerate src/generated/lessons-index.json
npm run build      # validate + typecheck + production build (PWA)
```

## Layout

```
content/<level>/unitNN/lessonNN.json   lesson content (schema: src/schema/lesson.ts)
scripts/validate-content.ts            schema + cross-reference checks, writes the lesson index
src/lib/storage.ts                     ProgressStore interface (localStorage now, Supabase later)
src/lib/audio.ts                       plays pre-generated clips from public/audio/manifest.json, falls back to the device voice
src/components/steps/                  the five lesson steps: hook, words, dialogue, grammar, quiz
```

## Adding a lesson

1. Copy `content/a1/unit01/lesson01.json` to `content/<level>/unitNN/lessonNN.json` and edit it. The `id` must be `<level>-uNN-lNN`.
2. `npm run validate`. It catches bad dialogue alignment indexes, unknown word ids in the quiz, and mismatched order tiles.
3. Keep `"status": "draft"` until a fluent speaker has checked the German and the Bangla, then set `"reviewed"`.

## Roadmap

- **Phase 0 (done):** React/Vite app, lesson JSON schema + validator, Lesson 1 converted, PWA.
- **Phase 1:** build-time TTS audio (normal + slow) into `public/audio`, then A1 units 1–10.
- **Phase 2:** Supabase auth (Google/email), progress sync, spaced-repetition review, placement test, A1 mock exam.
- **Phase 3–4:** A2 and B1 content, listening/reading/writing/speaking exercise types, leaderboard.
- **Later:** move the database to a self-hosted server once there is an audience (Postgres dump/restore; only the storage adapter changes).

This app is preparation, not a certificate. For the Chancenkarte or Ausbildung you need an official exam (Goethe, telc, ÖSD).
