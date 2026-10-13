import { useEffect, useState } from 'react'
import type { Lesson } from './schema/lesson'
import { loadLesson } from './lib/content'
import { Home } from './components/Home'
import { LessonPlayer } from './components/LessonPlayer'
import { Toast } from './components/common'

export function App() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!openId) return
    let live = true
    loadLesson(openId).then((l) => live && setLesson(l), () => live && setError(true))
    return () => { live = false }
  }, [openId])

  const exit = () => { setOpenId(null); setLesson(null); setError(false); window.scrollTo({ top: 0 }) }

  return (
    <>
      {!openId && <Home onOpen={setOpenId} />}
      {openId && !lesson && (
        <div className="wrap loading bn">
          {error ? <>লেসন লোড হয়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন। <button className="btn ghost bn" onClick={exit}>ফিরে যান</button></> : 'লোড হচ্ছে…'}
        </div>
      )}
      {openId && lesson && <LessonPlayer key={lesson.id} lesson={lesson} onExit={exit} />}
      <Toast />
    </>
  )
}
