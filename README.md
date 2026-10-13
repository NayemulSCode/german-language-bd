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
npm run audio      # generate TTS clips for all lessons (needs Piper, see below)
```

## Layout

```
content/<level>/unitNN/lessonNN.json   lesson content (schema: src/schema/lesson.ts)
scripts/validate-content.ts            schema + cross-reference checks, writes the lesson index
src/lib/storage.ts                     ProgressStore interface (localStorage now, Supabase later)
src/lib/audio.ts                       plays pre-generated clips from public/audio/manifest.json, falls back to the device voice
src/components/steps/                  the five lesson steps: hook, words, dialogue, grammar, quiz
```

## Audio

`npm run audio` finds every string the app can speak (`src/lib/speakable.ts`), synthesizes normal and slow clips with
[Piper](https://github.com/OHF-Voice/piper1-gpl) (German "Thorsten" voice, CC0) and writes `public/audio/*.mp3` plus a manifest.
Clips already in the manifest are kept, so reruns only do new text. Until clips exist the app uses the device's German voice.

- **On GitHub:** Actions → "Build audio" → Run workflow. It generates the clips and commits them to the branch.
- **Locally:** `pip install piper-tts`, download `de_DE-thorsten-medium.onnx` (+ `.json`) from the
  [piper-voices](https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/thorsten/medium) repo, then
  `PIPER_CMD="python3 -m piper" PIPER_MODEL=de_DE-thorsten-medium.onnx npm run audio` (needs `ffmpeg`).
- A word that sounds wrong? Add `"<text as shown>": "<respelling>"` to `content/pronunciation.json` and rerun.

## Adding a lesson

1. Copy `content/a1/unit01/lesson01.json` to `content/<level>/unitNN/lessonNN.json` and edit it. The `id` must be `<level>-uNN-lNN`.
2. `npm run validate`. It catches bad dialogue alignment indexes, unknown word ids in the quiz, and mismatched order tiles.
3. Keep `"status": "draft"` until a fluent speaker has checked the German and the Bangla, then set `"reviewed"`.

## Roadmap

- **Phase 0 (done):** React/Vite app, lesson JSON schema + validator, Lesson 1 converted, PWA.
- **Phase 1 (content done, audio pending):** audio pipeline built; A1 Unit 1 Lesson 1 and Units 2–10 written as drafts (37 lessons). Still to do: A1 Unit 1 Lessons 2–4 (greetings, formal/informal, countries), run the "Build audio" workflow, native-speaker review.
- **Phase 2:** Supabase auth (Google/email), progress sync, spaced-repetition review, placement test, A1 mock exam.
- **Phase 3–4:** A2 and B1 content, listening/reading/writing/speaking exercise types, leaderboard.
- **Later:** move the database to a self-hosted server once there is an audience (Postgres dump/restore; only the storage adapter changes).

This app is preparation, not a certificate. For the Chancenkarte or Ausbildung you need an official exam (Goethe, telc, ÖSD).
