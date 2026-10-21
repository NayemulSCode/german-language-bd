import { useMemo } from 'react'
import { useApp } from '../state'
import { dateLocale, fmtNum, makeT, type T, type Ui } from './core'

export interface I18n {
  t: T
  /** a number in the interface language's digits */
  n(v: number | string): string
  ui: Ui
  locale: string
}

export function useT(): I18n {
  const ui = useApp().progress.ui
  return useMemo(() => ({ t: makeT(ui), n: (v) => fmtNum(ui, v), ui, locale: dateLocale(ui) }), [ui])
}
