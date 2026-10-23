import { useState } from 'react'
import type { Lesson } from '../schema/lesson'
import { useApp } from '../state'
import { Icon } from './Icon'
import { Prefs } from './common'
import { useT } from '../i18n/useT'
import type { Key } from '../i18n/core'
import { Hook } from './steps/Hook'
import { Words } from './steps/Words'
import { Dialog } from './steps/Dialog'
import { Grammar } from './steps/Grammar'
import { Quiz } from './steps/Quiz'

const STEPS: Key[] = ['lesson.step.hook', 'lesson.step.words', 'lesson.step.dialog', 'lesson.step.grammar', 'lesson.step.quiz']

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const { progress, lessonProgress, completeStep, finishQuiz } = useApp()
  const { t, n } = useT()
  const [step, setStep] = useState(0)
  const [quizRun, setQuizRun] = useState(0) // bumping this remounts Quiz to restart it
  const done = lessonProgress(lesson.id).done

  const go = (i: number) => {
    setStep(i)
    window.scrollTo({ top: 0 })
  }
  const next = () => {
    completeStep(lesson.id, step)
    go(Math.min(step + 1, STEPS.length - 1))
  }

  return (
    <div className="wrap">
      <header className="lbar">
        <div className="lbar-top">
          <a className="lclose" href="#course" aria-label={t('lesson.close')}><Icon name="close" /></a>
          <span className="lvl">{lesson.level}</span>
          <span className="lbar-title">{lesson.unit === 0 ? t('lesson.barTitle0', { l: lesson.lesson }) : t('lesson.barTitle', { u: lesson.unit, l: lesson.lesson })} — {lesson.title.de}</span>
          <span className="xp">{n(progress.xp)} XP</span>
        </div>
        <nav className="steps" aria-label={t('lesson.steps')}>
          {STEPS.map((s, i) => (
            <button key={s} className={`step${i === step ? ' on' : ''}${done.includes(i) ? ' done' : ''}`} aria-current={i === step ? 'step' : undefined} onClick={() => go(i)}>
              <i /><span className="bn">{t(s)}</span>
            </button>
          ))}
        </nav>
      </header>
      <Prefs />
      <main>
        {step === 0 && <Hook lesson={lesson} onNext={next} />}
        {step === 1 && <Words lesson={lesson} onNext={next} />}
        {step === 2 && <Dialog lesson={lesson} onNext={next} />}
        {step === 3 && <Grammar lesson={lesson} onNext={() => { completeStep(lesson.id, 3); setQuizRun((n) => n + 1); go(4) }} />}
        {step === 4 && <Quiz key={quizRun} lesson={lesson} onFinish={(r) => finishQuiz(lesson.id, { ...r, wordIds: lesson.words.map((w) => w.id) })} onRestart={() => setQuizRun((n) => n + 1)} />}
      </main>
    </div>
  )
}
