import type { Lesson } from '../../schema/lesson'
import { NextButton, Say, Tr } from '../common'

export function Words({ lesson, onNext }: { lesson: Lesson; onNext(): void }) {
  return (
    <section>
      <div className="eyebrow bn">ধাপ ২ · নতুন শব্দ</div>
      <h2 style={{ fontSize: 24, marginTop: 4 }}>{lesson.words.length}টি শব্দ</h2>
      <div className="legend bn">
        <span><b className="art der">der</b> পুংলিঙ্গ</span>
        <span><b className="art die">die</b> স্ত্রীলিঙ্গ</span>
        <span><b className="art das">das</b> ক্লীবলিঙ্গ</span>
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
                {w.pl && <> · বহুবচন: <span lang="de">{w.pl}</span></>}
              </div>
              <div className="mean"><Tr bn={w.bn} en={w.en} /></div>
            </div>
          </div>
        ))}
      </div>
      <p className="hint bn">জার্মানে প্রতিটি বিশেষ্য বড় হাতের অক্ষরে শুরু হয়, আর আর্টিকেলসহ মুখস্থ করতে হয়।</p>
      <NextButton onClick={onNext}>সংলাপে যাই</NextButton>
    </section>
  )
}
