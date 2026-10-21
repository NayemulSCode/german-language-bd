import type { Lesson } from '../../schema/lesson'
import { NextButton, Say, Tr } from '../common'
import { useT } from '../../i18n/useT'

export function Words({ lesson, onNext }: { lesson: Lesson; onNext(): void }) {
  const { t } = useT()
  return (
    <section>
      <div className="eyebrow bn">{t('words.step')}</div>
      <h2 style={{ fontSize: 24, marginTop: 4 }}>{t('words.count', { n: lesson.words.length })}</h2>
      <div className="legend bn">
        <span><b className="art der">der</b> {t('words.m')}</span>
        <span><b className="art die">die</b> {t('words.f')}</span>
        <span><b className="art das">das</b> {t('words.n')}</span>
      </div>
      <div className="words">
        {lesson.words.map((w) => (
          <div className="word" key={w.id}>
            <Say text={(w.art ? w.art + ' ' : '') + w.de} />
            <div className="body">
              <div className="de" lang="de">
                {w.art && <span className={`art ${w.art}`}>{w.art} </span>}
                {w.de}
              </div>
              <div className="meta bn">
                {w.pos}
                {w.pl && <> · {t('words.plural')}: <span lang="de">{w.pl}</span></>}
              </div>
              <div className="mean"><Tr bn={w.bn} en={w.en} /></div>
            </div>
          </div>
        ))}
      </div>
      <p className="hint bn">{t('words.hint')}</p>
      <NextButton onClick={onNext}>{t('words.next')}</NextButton>
    </section>
  )
}
