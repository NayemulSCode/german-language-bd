import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Lesson } from '../src/schema/lesson.ts'
import { clipKey, speakableTexts } from '../src/lib/speakable.ts'

/**
 * Generates audio clips for every speakable string in /content with the Piper TTS engine.
 * Incremental: clips already listed in public/audio/manifest.json are kept.
 *
 *   PIPER_MODEL=de_DE-thorsten-medium.onnx npm run audio          # generate missing clips
 *   npm run audio -- --dry                                         # only list what is missing
 *
 * Env: PIPER_MODEL (required unless --dry), PIPER_CMD (default "piper"; e.g. "python3 -m piper").
 * Pronunciation fixes go in content/pronunciation.json as { "<text as shown>": "<text to synthesize>" }.
 */

const ROOT = new URL('../', import.meta.url).pathname
const OUT = join(ROOT, 'public/audio')
const SLOW_SCALE = '1.5' // piper length-scale: >1 is slower
const dry = process.argv.includes('--dry')

function* jsonFiles(dir: string): Generator<string> {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* jsonFiles(p)
    else if (name.endsWith('.json') && name !== 'pronunciation.json') yield p
  }
}

const texts = new Set<string>()
for (const f of jsonFiles(join(ROOT, 'content'))) for (const t of speakableTexts(Lesson.parse(JSON.parse(readFileSync(f, 'utf8'))))) texts.add(t)

const pronPath = join(ROOT, 'content/pronunciation.json')
const pron: Record<string, string> = existsSync(pronPath) ? JSON.parse(readFileSync(pronPath, 'utf8')) : {}

const manifestPath = join(OUT, 'manifest.json')
const manifest: Record<string, string> = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {}

const jobs = [...texts].flatMap((text) => [false, true].map((slow) => ({ text, slow, key: clipKey(text, slow) })))
const fileFor = (key: string) => createHash('sha1').update(key).digest('hex').slice(0, 16) + '.mp3'
const missing = jobs.filter((j) => !manifest[j.key] || !existsSync(join(OUT, manifest[j.key])))

console.log(`${texts.size} texts → ${jobs.length} clips, ${missing.length} to generate`)
if (dry || missing.length === 0) process.exit(0)

const model = process.env.PIPER_MODEL
if (!model) {
  console.error('Set PIPER_MODEL to a Piper voice .onnx file (e.g. de_DE-thorsten-medium.onnx)')
  process.exit(1)
}
const [piperBin, ...piperArgs] = (process.env.PIPER_CMD ?? 'piper').split(' ')
mkdirSync(OUT, { recursive: true })
const tmpWav = join(OUT, '.tmp.wav')

for (const [i, j] of missing.entries()) {
  const spoken = pron[j.text] ?? j.text
  const tts = spawnSync(piperBin, [...piperArgs, '-m', model, '--length-scale', j.slow ? SLOW_SCALE : '1.0', '-f', tmpWav], { input: spoken, encoding: 'utf8' })
  if (tts.status !== 0) throw new Error(`piper failed for "${j.text}": ${tts.stderr}`)
  const file = fileFor(j.key)
  // mono 32 kbps MP3: plays on every phone (older iOS Safari has no Ogg/Opus), ~4 KB per short clip
  const enc = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmpWav, '-ac', '1', '-ar', '22050', '-c:a', 'libmp3lame', '-b:a', '32k', join(OUT, file)], { encoding: 'utf8' })
  if (enc.status !== 0) throw new Error(`ffmpeg failed for "${j.text}": ${enc.stderr}`)
  manifest[j.key] = file
  if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${missing.length}`)
}
rmSync(tmpWav, { force: true })

// drop manifest entries for text that no longer exists in any lesson
const live = new Set(jobs.map((j) => j.key))
for (const k of Object.keys(manifest)) if (!live.has(k)) delete manifest[k]
writeFileSync(manifestPath, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 1) + '\n')
console.log(`✓ wrote ${Object.keys(manifest).length} clips to public/audio`)
