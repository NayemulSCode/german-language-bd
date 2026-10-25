import overrides from '../../content/pron-bn.json'

/**
 * Approximate Bangla pronunciation of German text, e.g. "Wie schreibt man das?" → "ভি শ্রাইপ্ট মান দাস?".
 * German spelling is regular enough that rules get most words right; words they get wrong go in
 * content/pron-bn.json as { "<lower-case word>": "<Bangla>" }.
 */

type Unit = { c: string } | { v: string; k: string } // consonant, or vowel (independent form + vowel sign)

const V: Record<string, [string, string]> = {
  a: ['আ', 'া'], e: ['এ', 'ে'], i: ['ই', 'ি'], o: ['ও', 'ো'], u: ['উ', 'ু'],
  ä: ['এ', 'ে'], ö: ['ও', 'ো'], ü: ['উ', 'ু'], y: ['উ', 'ু'],
  ei: ['আই', 'াই'], ai: ['আই', 'াই'], ey: ['আই', 'াই'], ay: ['আই', 'াই'],
  au: ['আউ', 'াউ'], eu: ['অয়', 'য়'], äu: ['অয়', 'য়'], ie: ['ই', 'ি'],
}
// a vowel straight after another (not a diphthong) is joined with য়, as Bangla writes it: Theater → টেয়াটার
const GLIDE: Record<string, string> = { আ: 'য়া', এ: 'য়ে', ই: 'য়ি', ও: 'য়ো', উ: 'য়ু' }
const isVowel = (ch: string | undefined) => !!ch && 'aeiouäöüy'.includes(ch)
const DEVOICE: Record<string, string> = { b: 'প', d: 'ট', g: 'ক' }

function units(w: string): Unit[] {
  const out: Unit[] = []
  let i = 0
  const at = (s: string) => w.startsWith(s, i)
  while (i < w.length) {
    const ch = w[i]
    const prev = w[i - 1]
    if (w.slice(i) === 'ig' && i > 0) { out.push({ v: 'ই', k: 'ি' }, { c: 'শ' }); break } // zwanzig → …ৎসিশ
    // vowels: longest match first; a doubled vowel or a vowel + h is just long
    const two = w.slice(i, i + 2)
    if (V[two]) {
      out.push({ v: V[two][0], k: V[two][1] })
      i += 2
      if (w[i] === 'h') i++
      continue
    }
    if (isVowel(ch)) {
      // -er at the end of a longer word is "আর": Vater → ফাটার (but der, er, wer stay "এর")
      if (ch === 'e' && w.slice(i) === 'er' && [...w.slice(0, i)].some(isVowel)) {
        out.push({ v: 'আ', k: 'া' }, { c: 'র' })
        break
      }
      out.push({ v: V[ch][0], k: V[ch][1] })
      i++
      if (w[i] === ch && ch !== 'e') i++ // aa, oo
      else if (w[i] === 'h' && i < w.length - 1) i++ // silent after a vowel: Jahr, Uhr, zehn, gehen
      continue
    }
    if (at('tsch') && (i === 0 || isVowel(prev))) { out.push({ c: 'চ' }); i += 4; continue }
    if (at('sch')) { out.push({ c: 'শ' }); i += 3; continue }
    if (at('chs')) { out.push({ c: 'ক' }, { c: 'স' }); i += 3; continue }
    if (at('ch')) {
      // after a, o, u, au it is the throat sound (acht → আখ্ট), elsewhere the soft one (ich → ইশ)
      out.push({ c: 'aou'.includes(prev ?? '') ? 'খ' : 'শ' })
      i += 2
      continue
    }
    if (i === 0 && (at('sp') || at('st'))) { out.push({ c: 'শ' }); i += 1; continue }
    if (at('tion')) { out.push({ c: 'ৎস' }, { v: 'ই', k: 'ি' }, { v: 'ও', k: 'ো' }, { c: 'ন' }); i += 4; continue }
    if (at('ck')) { out.push({ c: 'ক' }); i += 2; continue }
    if (at('ph')) { out.push({ c: 'ফ' }); i += 2; continue }
    if (at('pf')) { out.push({ c: 'প' }, { c: 'ফ' }); i += 2; continue }
    if (at('th')) { out.push({ c: 'ট' }); i += 2; continue }
    if (at('qu')) { out.push({ c: 'ক' }, { c: 'ভ' }); i += 2; continue }
    if (at('tz')) { out.push({ c: 'ৎস' }); i += 2; continue }
    if (at('nk')) { out.push({ c: 'ঙ' }, { c: 'ক' }); i += 2; continue }
    if (at('ng')) { out.push(isVowel(w[i + 2]) ? { c: 'ঙ' } : { c: 'ং' }); i += 2; continue }
    // a doubled consonant sounds single
    if (ch === w[i + 1] && !isVowel(ch)) { i++; continue }
    switch (ch) {
      case 'b': case 'd': case 'g':
        // at the end of a word or before another consonant they lose their voice: Tag → টাক, schreibt → শ্রাইপ্ট
        out.push({ c: !isVowel(w[i + 1]) && w[i + 1] !== 'r' && w[i + 1] !== 'l' ? DEVOICE[ch] : { b: 'ব', d: 'দ', g: 'গ' }[ch] })
        break
      case 's': out.push({ c: isVowel(w[i + 1]) && (i === 0 || isVowel(prev) || 'lnmr'.includes(prev)) ? 'জ' : 'স' }); break
      case 'ß': out.push({ c: 'স' }); break
      case 'z': out.push({ c: 'ৎস' }); break
      case 'w': out.push({ c: 'ভ' }); break
      case 'v': out.push({ c: 'ফ' }); break
      case 'f': out.push({ c: 'ফ' }); break
      case 'j': out.push({ c: 'য়' }); break
      case 'x': out.push({ c: 'ক' }, { c: 'স' }); break
      case 'c': out.push({ c: 'ক' }); break
      case 'k': out.push({ c: 'ক' }); break
      case 'p': out.push({ c: 'প' }); break
      case 't': out.push({ c: 'ট' }); break
      case 'h': out.push({ c: 'হ' }); break
      case 'l': out.push({ c: 'ল' }); break
      case 'm': out.push({ c: 'ম' }); break
      case 'n': out.push({ c: 'ন' }); break
      case 'r': out.push({ c: 'র' }); break
      default: out.push({ c: ch })
    }
    i++
  }
  return out
}

function render(us: Unit[]): string {
  let s = ''
  us.forEach((u, i) => {
    const prev = us[i - 1]
    const next = us[i + 1]
    if ('v' in u) {
      if (prev && 'c' in prev && prev.c !== 'ং') s += u.k
      else if (prev && 'v' in prev) s += GLIDE[u.v] ?? u.v
      else s += u.v
    } else if (u.c === 'য়' && (!prev || 'c' in prev)) {
      s += 'ইয়' // j at the start: ja → ইয়া
    } else {
      s += u.c
      // consonants meeting each other are joined, as in শ্রাইপ্ট; ং takes no hasanta
      if (next && 'c' in next && u.c !== 'ং') s += '্'
    }
  })
  return s
}

const OVERRIDES = overrides as Record<string, string>

/** Bangla pronunciation of one German word (letters only). */
export function bnWord(word: string): string {
  const w = word.toLowerCase()
  return OVERRIDES[w] ?? render(units(w))
}

/** Bangla pronunciation of German text: words are converted, digits and punctuation kept (a sentence's full stop becomes "।", the dot of a date like "15. Mai" stays). */
export function bnPron(text: string): string {
  return text
    .replace(/[A-Za-zÄÖÜäöüß]+/g, (m) => bnWord(m))
    .replace(/(?<!\d)\.(?=\s|$)/g, '।')
}
