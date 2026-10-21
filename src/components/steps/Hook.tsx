import type { Lesson } from '../../schema/lesson'
import { NextButton, Say, Tr } from '../common'
import { useT } from '../../i18n/useT'

export function Hook({ lesson, onNext }: { lesson: Lesson; onNext(): void }) {
  const h = lesson.hook
  const { t, ui } = useT()
  return (
    <section>
      <div className="hook">
        <Say text={h.de} label={t('hook.listen')} />
        <div className="eyebrow" style={{ color: 'inherit', opacity: 0.7 }}>{t('hook.today')}</div>
        <q style={{ marginTop: 8, paddingRight: 44 }}>{h.de}</q>
        <div className="who">— {h.who}</div>
        <div className="tr"><Tr bn={h.bn} en={h.en} /></div>
      </div>
      <div className="panel" style={{ marginTop: 14 }}>
        <h2 style={{ fontSize: 22 }}>{lesson.title.de}! {lesson.title[ui]}</h2>
        <ul className="goals bn">{lesson.goals.map((g) => <li key={g}>{g}</li>)}</ul>
        <p className="hint bn">{t('hook.time', { n: lesson.minutes })}</p>
      </div>
      <NextButton onClick={onNext}>{t('welcome.start')}</NextButton>
    </section>
  )
}
