import { toast } from './toast'
import type { T } from '../i18n/core'
import { clipKey } from './speakable'

/**
 * Plays German audio. Pre-generated clips (public/audio/manifest.json, built from lesson text)
 * are used when present; otherwise falls back to the device's German voice.
 */

let manifest: Promise<Record<string, string>> | null = null
function loadManifest() {
  manifest ??= fetch(`${import.meta.env.BASE_URL}audio/manifest.json`)
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}))
  return manifest
}

let current: HTMLAudioElement | null = null
let warnedVoice = false

export async function speak(text: string, opts: { slow: boolean; t: T }): Promise<void> {
  current?.pause()
  const files = await loadManifest()
  const file = files[clipKey(text, opts.slow)]
  if (file) {
    const el = new Audio(`${import.meta.env.BASE_URL}audio/${file}`)
    current = el
    await new Promise<void>((resolve) => {
      el.onended = el.onerror = () => resolve()
      el.play().catch(() => resolve())
    })
    return
  }
  if (!('speechSynthesis' in window)) {
    toast(opts.t('audio.noSpeech'))
    return
  }
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'de-DE'
  u.rate = opts.slow ? 0.6 : 0.9
  const v = speechSynthesis.getVoices().find((x) => /^de(-|_|$)/i.test(x.lang))
  if (v) u.voice = v
  else if (!warnedVoice) {
    warnedVoice = true
    toast(opts.t('audio.noVoice'))
  }
  await new Promise<void>((resolve) => {
    u.onend = u.onerror = () => resolve()
    speechSynthesis.speak(u)
  })
}
