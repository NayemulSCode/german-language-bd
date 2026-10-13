import { useEffect, useState } from 'react'
import type { Lesson } from '../schema/lesson'
import { loadLesson } from '../lib/content'
import { LessonPlayer } from '../components/LessonPlayer'

/** Loads one lesson by id and runs it full-screen (the shell hides its chrome while a lesson is open). */
export function LessonScreen({ id }: { id: string }) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let live = true
    setLesson(null)
    setError(false)
    loadLesson(id).then((l) => live && setLesson(l), () => live && setError(true))
    return () => { live = false }
  }, [id])

  if (error) {
    return (
      <div className="lx"><div className="wrap loading bn">
        লেসন লোড হয়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন। <a className="btn ghost bn" href="#course">কোর্সে ফিরুন</a>
      </div></div>
    )
  }
  if (!lesson) return <div className="lx"><div className="wrap loading bn">লোড হচ্ছে…</div></div>
  return <div className="lx"><LessonPlayer key={lesson.id} lesson={lesson} /></div>
}
