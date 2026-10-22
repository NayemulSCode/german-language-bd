import { useEffect, useState } from 'react'
import { BKASH_NUMBER, SUPPORT_URL, supportEnabled } from '../lib/support'
import { useT } from '../i18n/useT'

/** "Buy me a coffee" card. Renders nothing unless a support link or a bKash number is configured. */
export function SupportCard({ compact = false }: { compact?: boolean }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  if (!supportEnabled) return null
  return (
    <>
      <section className={`card support-card${compact ? ' compact' : ''}`} aria-labelledby={compact ? 'support-title-c' : 'support-title'}>
        <span className="save-emoji" aria-hidden="true">☕</span>
        <div className="grow">
          <div id={compact ? 'support-title-c' : 'support-title'} className="bn save-title">{t('support.title')}</div>
          <div className="bn muted" style={{ fontSize: 14 }}>{t('support.sub')}</div>
          <div className="save-acts">
            {SUPPORT_URL && <a className="btn sm bn" href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">{t('support.coffee')}</a>}
            {BKASH_NUMBER && <button className={`btn sm bn${SUPPORT_URL ? ' ghost' : ''}`} onClick={() => setOpen(true)}>{t('support.bkash')}</button>}
          </div>
        </div>
      </section>
      {open && BKASH_NUMBER && <BkashDialog number={BKASH_NUMBER} onClose={() => setOpen(false)} />}
    </>
  )
}

export function BkashDialog({ number, onClose }: { number: string; onClose(): void }) {
  const { t } = useT()
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(number.replace(/[\s-]/g, ''))
      setCopied(true)
    } catch { /* clipboard blocked: the number is on screen to copy by hand */ }
  }
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="bkash-title" onClick={(e) => e.stopPropagation()}>
        <span className="save-emoji" aria-hidden="true">☕</span>
        <h2 id="bkash-title" className="bn">{t('support.bkash.title')}</h2>
        <p className="bn muted" style={{ margin: 0 }}>{t('support.bkash.body')}</p>
        <div className="bkash-num num" aria-label={t('support.bkash.title')}>{number}</div>
        <button className="btn bn" onClick={() => void copy()}>{copied ? t('support.copied') : t('support.copy')}</button>
        <p className="hint bn">{t('support.thanks')}</p>
        <button className="link bn" onClick={onClose}>{t('common.closeLong')}</button>
      </div>
    </div>
  )
}
