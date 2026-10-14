import { useEffect } from 'react'
import { useApp } from './state'
import { useRoute, type RouteName } from './router'
import { Icon, Logo, type IconName } from './components/Icon'
import { Toast } from './components/common'
import { streak } from './lib/stats'
import { bn } from './lib/format'
import { HomeScreen } from './screens/Home'
import { CourseScreen } from './screens/Course'
import { ReviewScreen } from './screens/Review'
import { DictionaryScreen } from './screens/Dictionary'
import { ProfileScreen } from './screens/Profile'
import { LessonScreen } from './screens/Lesson'
import { PlacementScreen } from './screens/Placement'
import { ExamScreen } from './screens/Exam'

const TABS: [Exclude<RouteName, 'lesson' | 'placement' | 'exam'>, string][] = [['home', 'হোম'], ['course', 'কোর্স'], ['review', 'রিভিউ'], ['dict', 'ডিকশনারি'], ['me', 'প্রোফাইল']]

export function App() {
  const route = useRoute()
  const { progress } = useApp()
  const inLesson = route.name === 'lesson' || route.name === 'placement' || route.name === 'exam'
  const days = streak(progress.activity)

  // lessons run full-screen: the CSS hides the top bar and tabs
  useEffect(() => {
    document.body.classList.toggle('in-lesson', inLesson)
  }, [inLesson])

  return (
    <>
      <header className="top">
        <div className="brand"><Logo />Sprachbrücke</div>
        <span className="pill num" title="টানা দিন">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z" fill="var(--accent)" /></svg>
          <span className="bn">{bn(days)} দিন</span>
        </span>
      </header>

      <nav className="tabs" aria-label="মূল মেনু">
        <div className="brand side-brand"><Logo />Sprachbrücke</div>
        {TABS.map(([k, label]) => (
          <a key={k} href={`#${k}`} aria-current={route.name === k ? 'page' : undefined}>
            <Icon name={k as IconName} /><span className="bn">{label}</span>
          </a>
        ))}
      </nav>

      <main>
        {route.name === 'home' && <HomeScreen />}
        {route.name === 'course' && <CourseScreen />}
        {route.name === 'review' && <ReviewScreen />}
        {route.name === 'dict' && <DictionaryScreen />}
        {route.name === 'me' && <ProfileScreen />}
        {route.name === 'lesson' && <LessonScreen id={route.param} />}
        {route.name === 'placement' && <PlacementScreen />}
        {route.name === 'exam' && <ExamScreen id={route.param || 'a1-mock-01'} />}
      </main>
      <Toast />
    </>
  )
}
