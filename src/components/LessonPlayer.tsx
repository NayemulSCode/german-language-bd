import { useState } from 'react'
import type { Lesson } from '../schema/lesson'
import { useApp } from '../state'
import { Icon } from './Icon'
import { Prefs } from './common'
import { Hook } from './steps/Hook'
import { Words } from './steps/Words'
import { Dialog } from './steps/Dialog'
import { Grammar } from './steps/Grammar'
import { Quiz } from './steps/Quiz'

const STEPS = ['হুক', 'শব্দ', 'সংলাপ', 'গ্রামার', 'কুইজ']

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const { progress, lessonProgress, completeStep, finishQuiz } = useApp()
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
          <a className="lclose" href="#course" aria-label="লেসন বন্ধ করে কোর্সে ফিরুন"><Icon name="close" /></a>
          <span className="lvl">{lesson.level}</span>
          <span className="lbar-title">ইউনিট {lesson.unit} · লেসন {lesson.lesson} — {lesson.title.de}</span>
          <span className="xp">{progress.xp} XP</span>
        </div>
        <nav className="steps" aria-label="লেসনের ধাপ">
          {STEPS.map((s, i) => (
            <button key={s} className={`step${i === step ? ' on' : ''}${done.includes(i) ? ' done' : ''}`} aria-current={i === step ? 'step' : undefined} onClick={() => go(i)}>
              <i /><span className="bn">{s}</span>
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
