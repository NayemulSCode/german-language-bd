import { BN } from './bn'
import { EN } from './en'
import type { Ui } from '../lib/storage'

export type { Ui }
/** Interface language: menus, buttons, feedback, profile, exams, badges. (Lesson translations are a separate setting, `lang`.) */
export const UIS: Ui[] = ['bn', 'en']
export type Key = keyof typeof BN
export type Params = Record<string, string | number>
export type T = (key: Key, params?: Params) => string

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'

/** Numbers show in Bangla digits in the Bangla interface and Western digits in English. */
export const fmtNum = (ui: Ui, v: string | number): string => (ui === 'bn' ? String(v).replace(/\d/g, (d) => BN_DIGITS[+d]) : String(v))

/**
 * Looks up a string and fills `{name}` placeholders. Numeric params are formatted for the language;
 * string params are inserted as they are (so already-formatted text is not changed twice).
 */
export function makeT(ui: Ui): T {
  const dict: Record<string, string> = ui === 'en' ? EN : BN
  return (key, params) =>
    (dict[key] ?? BN[key]).replace(/\{(\w+)\}/g, (_, k: string) => {
      const v = params?.[k]
      return v === undefined ? `{${k}}` : typeof v === 'number' ? fmtNum(ui, v) : v
    })
}

export const dateLocale = (ui: Ui) => (ui === 'bn' ? 'bn-BD' : 'en-GB')
