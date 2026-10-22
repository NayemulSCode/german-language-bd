import { useEffect, useMemo, useState } from 'react'
import { loadDictionary, spoken, type DictEntry } from '../lib/content'
import { useT } from '../i18n/useT'
import { Icon } from '../components/Icon'
import { LangSeg, Say, Tr } from '../components/common'

const LIMIT = 150

export function DictionaryScreen() {
  const { t } = useT()
  const [all, setAll] = useState<DictEntry[] | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    loadDictionary().then((d) => {
      // the same word can appear in several lessons: list it once
      const seen = new Set<string>()
      setAll(d.filter((e) => !seen.has(`${e.art}|${e.de}`) && !!seen.add(`${e.art}|${e.de}`)))
    })
  }, [])

  const list = useMemo(() => {
    if (!all) return []
    const s = q.trim().toLowerCase()
    return s ? all.filter((e) => [e.de, e.art ?? '', e.bn, e.en].some((x) => x.toLowerCase().includes(s))) : all
  }, [all, q])

  return (
    <>
      <div className="eyebrow bn">{t('tab.dict')}</div>
      <h1 style={{ fontSize: 30, marginTop: 4 }}>{t('dict.title')}</h1>
      <label className="search">
        <Icon name="search" />
        <input type="search" placeholder={t('dict.placeholder')} value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" aria-label={t('dict.search')} />
      </label>
      <div className="dict-lang">
        <span className="muted bn" style={{ fontSize: 13 }}>{t('dict.meanings')}</span>
        <LangSeg />
      </div>
      {!all ? <div className="loading bn">{t('common.loading')}</div> : (
        <>
          <div className="muted bn" style={{ fontSize: 13, marginTop: 8 }}>{q ? t('dict.results', { n: list.length }) : t('dict.total', { n: all.length })}</div>
          <div className="entries">
            {list.length ? list.slice(0, LIMIT).map((e) => (
              <div className="entry" key={e.k}>
                <Say text={spoken(e)} />
                <div className="grow">
                  <div className="de">{e.art && <span className={`art ${e.art}`}>{e.art} </span>}{e.de}</div>
                  <div className="m"><Tr bn={e.bn} en={e.en} /></div>
                </div>
                <span className="tag">{e.lv}</span>
              </div>
            )) : <div className="card muted bn">{t('dict.none', { q })}</div>}
            {list.length > LIMIT && <div className="muted bn" style={{ textAlign: 'center', fontSize: 14 }}>{t('dict.limit', { n: LIMIT })}</div>}
          </div>
        </>
      )}
    </>
  )
}

