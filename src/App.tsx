import { useEffect } from 'react'
import { Celebration } from './components/Celebration'
import { WelcomeScreen } from './screens/Welcome'
import { isNewLearner, welcomeSkipped } from './lib/welcome'
import { useApp } from './state'
import { LoginChip, SideAccount } from './components/Account'
import { go, useRoute, type RouteName } from './router'
import { Icon, Logo, type IconName } from './components/Icon'
import { Toast } from './components/common'
import { streak } from './lib/stats'
import { useT } from './i18n/useT'
import type { Key } from './i18n/core'
import { HomeScreen } from './screens/Home'
import { CourseScreen } from './screens/Course'
import { ReviewScreen } from './screens/Review'
import { DictionaryScreen } from './screens/Dictionary'
import { ProfileScreen } from './screens/Profile'
import { LessonScreen } from './screens/Lesson'
import { PlacementScreen } from './screens/Placement'
import { ExamScreen } from './screens/Exam'

const TABS: [Exclude<RouteName, 'lesson' | 'placement' | 'exam' | 'welcome'>, Key][] = [['home', 'tab.home'], ['course', 'tab.course'], ['review', 'tab.review'], ['dict', 'tab.dict'], ['me', 'tab.me']]

export function App() {
  const route = useRoute()
  const { progress } = useApp()
  const { t } = useT()
  const inLesson = route.name === 'lesson' || route.name === 'placement' || route.name === 'exam' || route.name === 'welcome'
  const days = streak(progress.activity)

  // lessons run full-screen: the CSS hides the top bar and tabs
  useEffect(() => {
    document.body.classList.toggle('in-lesson', inLesson)
  }, [inLesson])

  // a brand-new visitor opening the bare URL lands on the 60-second welcome lesson (once; skipping it remembers the choice)
  useEffect(() => {
    if (!location.hash && isNewLearner(progress) && !welcomeSkipped()) go('#welcome')
    // only on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <header className="top">
        <div className="brand"><Logo />GLBD</div>
        <LoginChip />
        <span className="pill num" title={t('app.streakTitle')}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z" fill="var(--accent)" /></svg>
          <span className="bn">{t('app.days', { n: days })}</span>
        </span>
      </header>

      <nav className="tabs" aria-label={t('app.menu')}>
        <div className="brand side-brand"><Logo />GLBD</div>
        {TABS.map(([k, label]) => (
          <a key={k} href={`#${k}`} aria-current={route.name === k ? 'page' : undefined}>
            <Icon name={k as IconName} /><span className="bn">{t(label)}</span>
          </a>
        ))}
        <SideAccount />
      </nav>

      <main>
        {route.name === 'home' && <HomeScreen />}
        {route.name === 'course' && <CourseScreen />}
        {route.name === 'review' && <ReviewScreen />}
        {route.name === 'dict' && <DictionaryScreen />}
        {route.name === 'me' && <ProfileScreen />}
        {route.name === 'lesson' && <LessonScreen id={route.param} />}
        {route.name === 'placement' && <PlacementScreen level={route.param === 'b1' ? 'B1' : route.param === 'a2' ? 'A2' : 'A1'} />}
        {route.name === 'welcome' && <WelcomeScreen />}
        {route.name === 'exam' && <ExamScreen id={route.param || 'a1-mock-01'} />}
      </main>
      <Toast />
      <Celebration />
    </>
  )
}
