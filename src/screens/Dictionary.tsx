import { useEffect, useMemo, useState } from 'react'
import { loadDictionary, spoken, type DictEntry } from '../lib/content'
import { bn } from '../lib/format'
import { Icon } from '../components/Icon'
import { Say, Tr } from '../components/common'

const LIMIT = 150

export function DictionaryScreen() {
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
      <div className="eyebrow bn">ডিকশনারি</div>
      <h1 style={{ fontSize: 30, marginTop: 4 }}>জার্মান ⇄ বাংলা ⇄ English</h1>
      <label className="search">
        <Icon name="search" />
        <input type="search" placeholder="শব্দ লিখুন: Stadt, শহর, city…" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" aria-label="শব্দ খুঁজুন" />
      </label>
      {!all ? <div className="loading bn">লোড হচ্ছে…</div> : (
        <>
          <div className="muted bn" style={{ fontSize: 13, marginTop: 8 }}>{q ? `${list.length}টি ফল` : `মোট ${all.length}টি শব্দ`}</div>
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
            )) : <div className="card muted bn">„{q}“ পাওয়া যায়নি। নতুন লেসনের সাথে আরও শব্দ যোগ হবে।</div>}
            {list.length > LIMIT && <div className="muted bn" style={{ textAlign: 'center', fontSize: 14 }}>প্রথম {bn(LIMIT)}টি দেখানো হয়েছে — খুঁজে নিতে আরও লিখুন।</div>}
          </div>
        </>
      )}
    </>
  )
}

