import { useState } from 'react'
import { LESSONS } from '../lib/content'
import { PACK_KINDS, PACK_LEVELS, PACK_PAGES, SAMPLES, downloadUrl } from '../lib/packs'
import { BKASH_NUMBER, PACKS_CONTACTS, PACKS_PRICE, SUPPORT_URL, supportEnabled } from '../lib/support'
import { BkashDialog } from '../components/Support'
import { useT } from '../i18n/useT'

const KIND_KEY = { vocab: 'packs.kind.vocab', grammar: 'packs.kind.grammar', exams: 'packs.kind.exams' } as const
const KIND_DESC = { vocab: 'packs.kind.vocab.d', grammar: 'packs.kind.grammar.d', exams: 'packs.kind.exams.d' } as const

/** Printable study packs: two free samples to download, the list of full packs, and how to get them (through the support options set up in the environment). */
export function PacksScreen() {
  const { t, n } = useT()
  const [open, setOpen] = useState(false)
  const words = (lv: string) => LESSONS.filter((l) => l.level === lv).reduce((sum, l) => sum + l.words, 0)

  return (
    <>
      <div className="eyebrow bn">{t('packs.eyebrow')}</div>
      <h1 style={{ fontSize: 30, marginTop: 4 }}>{t('packs.title')}</h1>
      <p className="bn muted" style={{ margin: '6px 0 0' }}>{t('packs.sub')}</p>

      <section className="card packs-free" aria-labelledby="packs-free">
        <h2 id="packs-free" className="bn" style={{ fontSize: 20 }}>{t('packs.free.title')}</h2>
        <p className="bn muted" style={{ margin: '4px 0 10px', fontSize: 14 }}>{t('packs.free.sub')}</p>
        <div className="pack-list">
          {SAMPLES.map((s) => (
            <div className="pack-row" key={s.file}>
              <span className="pack-ico" aria-hidden="true">📄</span>
              <div className="grow">
                <b className="bn">{t(`packs.sample.${s.kind}`)}</b>
                <div className="muted bn" style={{ fontSize: 13 }}>{t('packs.pages', { n: s.pages })}</div>
              </div>
              <a className="btn sm bn" href={downloadUrl(s.file)} download>{t('packs.download')}</a>
            </div>
          ))}
        </div>
      </section>

      <h2 className="bn" style={{ fontSize: 20, margin: '22px 0 8px' }}>{t('packs.full.title')}</h2>
      {PACK_LEVELS.map((lv) => (
        <section className="card pack-level" key={lv}>
          <div className="row" style={{ marginBottom: 6 }}>
            <span className="tag">{lv}</span>
            <span className="muted bn" style={{ fontSize: 13 }}>{t('packs.words', { n: n(words(lv)) })}</span>
          </div>
          <div className="pack-list">
            {PACK_KINDS.map((k) => (
              <div className="pack-row" key={k}>
                <span className="pack-ico" aria-hidden="true">{k === 'vocab' ? '🔤' : k === 'grammar' ? '📐' : '📝'}</span>
                <div className="grow">
                  <b className="bn">{t(KIND_KEY[k])}</b>
                  <div className="muted bn" style={{ fontSize: 13 }}>{t(KIND_DESC[k])}</div>
                </div>
                <span className="muted bn" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{t('packs.pages', { n: n(PACK_PAGES[lv][k]) })}</span>
              </div>
            ))}
          </div>
        </section>
      ))}

      {supportEnabled ? (
        <section className="card save-card" aria-labelledby="packs-how" style={{ marginTop: 14 }}>
          <h2 id="packs-how" className="bn" style={{ fontSize: 20 }}>{t('packs.how.title')}</h2>
          {PACKS_PRICE && <div className="bn"><b>{t('packs.price', { p: PACKS_PRICE })}</b></div>}
          <ol className="steps bn">
            <li>{t('packs.how.1')}</li>
            <li>{t('packs.how.2')}</li>
            <li>{t('packs.how.3')}</li>
          </ol>
          <div className="save-acts">
            {BKASH_NUMBER && <button className="btn sm bn" onClick={() => setOpen(true)}>{t('support.bkash')}</button>}
            {SUPPORT_URL && <a className="btn sm ghost bn" href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">{t('support.coffee')}</a>}
            {PACKS_CONTACTS.map((c) => <a key={c.url} className="btn sm ghost bn" href={c.url} target="_blank" rel="noopener noreferrer">{c.name ?? t('packs.contact')}</a>)}
          </div>
        </section>
      ) : (
        <div className="card muted bn" style={{ marginTop: 14 }}>{t('packs.soon')}</div>
      )}
      {open && BKASH_NUMBER && <BkashDialog number={BKASH_NUMBER} onClose={() => setOpen(false)} />}
      <p className="foot bn">{t('packs.note')}</p>
    </>
  )
}
