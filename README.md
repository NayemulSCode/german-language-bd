# Sprachbrücke

A free, offline-capable German course (A1 → B1) for Bangla speakers, with Bangla and English support.
React + Vite + TypeScript PWA. Lessons are plain JSON; progress is stored on the device and can sync through Supabase.

Screens: **Home** (daily goal, continue, review count, exam countdown, word of the day), **Course** (level and unit map with
a lesson sheet), **Review** (spaced-repetition flashcards), **Dictionary** (search German, Bangla or English),
**Profile** (stats, themes incl. a warm night mode, goals, account). On phones the tabs sit at the bottom, on wide screens in a sidebar.

Placement: a 20-question test (2 per A1 unit, no feedback) recommends a starting unit; a separate 24-question A2 test (`#placement/a2`) does the same for A2 and opens all of A1, and a B1 test (`#placement/b1`) opens A1 and A2. Earlier units stay open to practise
without being marked passed or giving XP; Profile has an "unlock all lessons" switch for free browsing.

Review works like this: missed quiz words are due immediately; passing a lesson adds all its words, first review the next day.
Rating a card Again / Hard / Good / Easy sets the next interval (1 min, 10 min, 1 day, 4 days for new cards, growing for known ones).
The design has a study-group leaderboard; it needs a social backend and is not built yet.

## Languages

Two separate settings in Profile: **App language** (বাংলা / English) changes the menus, buttons, feedback, exams, badges and messages;
**Lesson translations** (বাংলা / English / both) chooses which meanings show next to German words. German is the language being taught, not an interface language.

Interface text lives in `src/i18n/bn.ts` (defines the keys) and `src/i18n/en.ts` (must have the same keys, so a missing translation is a compile error).
Use `const { t, n } = useT()` in components: `t('home.goalLeft', { n: 20 })` fills `{n}` and formats numbers for the language (Bangla digits in Bangla, 0-9 in English).
### English lesson text

Lessons are written in Bangla (`content/**`). English for the grammar cards, quiz questions, goals, word-class labels and dialogue notes lives next to it in `content-en/`:

```
content-en/common.json                          "Bangla phrase": "English", for text that repeats (quiz prompts, labels, days, months …)
content-en/a1/unit01/lesson01.json              "path.in.lesson": "English", for one lesson, e.g. "quiz.3.why"
```

When the app language is English, a lesson that has its own file is shown in English (overlay first, then `common.json`); a lesson without one stays entirely in Bangla, never half and half.
The word-order panels keep the Bangla sentence on purpose (the lesson compares it with German).
`npm run validate` checks every file (paths must exist, text must be English, options must stay distinct) and prints the coverage per level; `npm test` fails if an A1 file is incomplete.
**A1 and A2 are fully translated. B1 and the mock exams are still Bangla only.** To add a lesson, create its file in `content-en/` with the paths printed as missing by `npm run validate`.

## Run

```bash
npm install
npm run dev        # dev server
npm test           # content validator tests
npm run validate   # check every lesson in /content, regenerate src/generated/ (lesson index + dictionary)
npm run build      # validate + typecheck + production build (PWA)
npm run audio      # generate TTS clips for all lessons (needs Piper, see below)
```

## Layout

```
content/<level>/unitNN/lessonNN.json   lesson content (schema: src/schema/lesson.ts)
scripts/validate-content.ts            schema + cross-reference checks, writes the lesson index
src/lib/storage.ts                     Progress model, validation, local storage
src/lib/sync.ts, srs.ts, stats.ts      merge/sync, review scheduling, streaks and heatmap
src/screens/                           Home, Course, Review, Dictionary, Profile, Lesson
src/lib/audio.ts                       plays pre-generated clips from public/audio/manifest.json, falls back to the device voice
src/components/steps/                  the five lesson steps: hook, words, dialogue, grammar, quiz
```

## Login and sync (optional)

Without configuration the app is fully offline and keeps progress on the device. To let learners sign in
(Google or an email link) and keep progress across devices, connect a free [Supabase](https://supabase.com) project:

1. **Create a project** at supabase.com (free plan).
2. **Create the table:** open *SQL Editor*, paste `supabase/migrations/20260101000000_progress.sql` and run it.
3. **Email login:** *Authentication → Providers → Email* is on by default (magic link). Under *Authentication → URL Configuration* set
   *Site URL* to your deployed address and add it, plus `http://localhost:5173`, to *Redirect URLs*.
4. **Google login (optional):** create an OAuth client in Google Cloud Console (type *Web application*), add the
   callback URL shown in *Authentication → Providers → Google* as an authorised redirect URI, then paste the client ID and secret into that Supabase page.
5. **Connect the app:** copy `.env.example` to `.env.local` and fill in *Project URL* and the *anon public key*
   (*Project Settings → API*). Add the same two values as environment variables on your host.
6. **Keep the free project awake:** add repository secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY`; the *Keep Supabase awake* workflow then pings it twice a week.

How sync works: progress is stored locally first. When signed in, the app merges with the server copy
(steps are unioned, best scores and passes only go up, review words are unioned), so using two devices never loses
lessons. XP is recalculated from lessons rather than stored. Only the language and slow-audio settings are last-writer-wins.
Signing out keeps the progress on that device. Free-tier note: there are no automatic backups, so export the table occasionally.

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
- **Phase 1 (content done, audio pending):** audio pipeline built; all of A1 (Units 1–10, 40 lessons) written as drafts. Still to do: run the "Build audio" workflow, native-speaker review.
- **Phase 2 (login and sync built, needs your Supabase project):** Supabase auth (Google/email) and progress sync. Done: spaced-repetition review, placement test, A1, A2 and B1 mock exams (`exams/`, validated by `npm run validate`; add `a1-mock-02.json`, `b1-mock-02.json` etc. for more).
- **Phase 3–4:** A2 and B1 content, listening/reading/writing/speaking exercise types, leaderboard.
- **Later:** move the database to a self-hosted server once there is an audience (Postgres dump/restore; only the storage adapter changes).

This app is preparation, not a certificate. For the Chancenkarte or Ausbildung you need an official exam (Goethe, telc, ÖSD).
