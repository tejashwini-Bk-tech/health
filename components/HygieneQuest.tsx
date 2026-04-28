"use client"

import { useState } from "react"
import { hygieneModules } from "@/lib/hygiene-data"
import { useLanguage } from "@/hooks/use-language"

export default function HygieneQuest() {
  const [completed, setCompleted] = useState<boolean[]>(Array(hygieneModules.length).fill(false))
  const [hoveredBtn, setHoveredBtn] = useState<number | null>(null)
  const { t } = useLanguage()
  const hq = (t as any).hygieneQuest || {}

  const labels = [hq.mod1Label, hq.mod2Label, hq.mod3Label, hq.mod4Label]
  const titles = [hq.mod1Title, hq.mod2Title, hq.mod3Title, hq.mod4Title]
  const texts = [hq.mod1Text, hq.mod2Text, hq.mod3Text, hq.mod4Text]
  const trackers = [hq.tracker0, hq.tracker1, hq.tracker2, hq.tracker3, hq.tracker4]

  const markDone = (idx: number) => {
    if (completed[idx]) return
    setCompleted((prev) => { const next = [...prev]; next[idx] = true; return next })
  }

  const completedCount = completed.filter(Boolean).length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700&display=swap');
        .hq-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
        .hq-wrap { font-family: 'Nunito', sans-serif; max-width: 640px; margin: 0 auto; padding: 2rem 1rem; background: transparent; }
        .hq-title { font-family: 'Fredoka One', cursive; font-size: 28px; color: #2C2C2A; text-align: center; margin-bottom: 4px; letter-spacing: 0.5px; }
        .hq-sub { text-align: center; font-size: 14px; color: #5F5E5A; margin-bottom: 1.75rem; }
        .hq-card { background: #FFFFFF; border-radius: 20px; border: 2px solid #E8E2D0; overflow: hidden; margin-bottom: 1.5rem; transition: transform 0.2s, box-shadow 0.2s, opacity 0.3s; }
        .hq-card:not(.hq-done):hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .hq-card.hq-active { border-color: #97C459; }
        .hq-card.hq-done { opacity: 0.65; pointer-events: none; }
        .hq-scene { width: 100%; height: 200px; overflow: hidden; display: block; }
        .hq-body { padding: 1.25rem 1.5rem 1.25rem; }
        .hq-label { font-family: 'Fredoka One', cursive; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px; }
        .hq-card-title { font-family: 'Fredoka One', cursive; font-size: 20px; color: #2C2C2A; margin-bottom: 0.5rem; }
        .hq-card-text { font-size: 14px; color: #5F5E5A; line-height: 1.75; margin-bottom: 1.1rem; }
        .hq-done-btn { display: inline-flex; align-items: center; gap: 8px; color: #fff; font-family: 'Fredoka One', cursive; font-size: 16px; border: none; border-radius: 12px; padding: 10px 24px; cursor: pointer; transition: transform 0.15s, background 0.15s; letter-spacing: 0.5px; }
        .hq-done-btn:active { transform: scale(0.97); }
        .hq-badge { display: inline-flex; align-items: center; gap: 6px; background: #EAF3DE; color: #3B6D11; font-family: 'Fredoka One', cursive; font-size: 14px; border-radius: 10px; padding: 8px 18px; border: 1.5px solid #97C459; }
        .hq-tracker { background: #FFFFFF; border-radius: 20px; border: 2px solid #E8E2D0; padding: 1.5rem; text-align: center; }
        .hq-tracker-title { font-family: 'Fredoka One', cursive; font-size: 15px; color: #5F5E5A; margin-bottom: 1rem; letter-spacing: 0.3px; }
        .hq-tracker-row { display: flex; align-items: center; justify-content: center; }
        .hq-circle { width: 32px; height: 32px; border-radius: 50%; border: 2.5px solid #E8E2D0; background: #fff; display: flex; align-items: center; justify-content: center; transition: border-color 0.4s, background 0.4s, box-shadow 0.4s; flex-shrink: 0; }
        .hq-circle.hq-lit { border-color: #97C459; background: #EAF3DE; box-shadow: 0 0 0 5px #C0DD9744; }
        .hq-dash { width: 32px; height: 3px; border-radius: 2px; background: #E8E2D0; margin: 0 3px; transition: background 0.4s, box-shadow 0.4s; flex-shrink: 0; }
        .hq-dash.hq-lit { background: #97C459; box-shadow: 0 0 6px #97C45988; }
        .hq-tracker-msg { margin-top: 1rem; font-family: 'Fredoka One', cursive; font-size: 15px; color: #5F5E5A; min-height: 24px; transition: color 0.3s; }
        .hq-tracker-msg.hq-complete { color: #3B6D11; }
        .hq-check { width: 16px; height: 16px; }
      `}</style>

      <div className="hq-wrap">
        <h1 className="hq-title">{hq.pageTitle || "Hygiene Quest"}</h1>
        <p className="hq-sub">{hq.pageSub || "Complete each module to protect yourself and your community"}</p>

        {hygieneModules.map((mod, idx) => (
          <div key={mod.id}
            className={`hq-card${completed[idx] ? " hq-done" : idx === completed.indexOf(false) ? " hq-active" : ""}`}>
            <div className="hq-scene">{mod.scene}</div>
            <div className="hq-body">
              <p className="hq-label" style={{ color: mod.labelColor }}>{labels[idx] || mod.label}</p>
              <p className="hq-card-title">{titles[idx] || mod.title}</p>
              <p className="hq-card-text">{texts[idx] || mod.text}</p>

              {completed[idx] ? (
                <div className="hq-badge">
                  <svg className="hq-check" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {hq.completed || "Completed!"}
                </div>
              ) : (
                <button className="hq-done-btn"
                  style={{ background: hoveredBtn === idx ? mod.btnHover : mod.btnColor }}
                  onMouseEnter={() => setHoveredBtn(idx)}
                  onMouseLeave={() => setHoveredBtn(null)}
                  onClick={() => markDone(idx)}>
                  <svg className="hq-check" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {hq.done || "Done"}
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="hq-tracker">
          <p className="hq-tracker-title">{hq.yourProgress || "Your progress"}</p>
          <div className="hq-tracker-row">
            {hygieneModules.map((_, idx) => (
              <div key={`t-${idx}`} style={{ display: "contents" }}>
                <div className={`hq-circle${completed[idx] ? " hq-lit" : ""}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={completed[idx] ? "#3B6D11" : "#E8E2D0"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                {idx < hygieneModules.length - 1 && <div className={`hq-dash${completed[idx] ? " hq-lit" : ""}`}/>}
              </div>
            ))}
          </div>
          <p className={`hq-tracker-msg${completedCount === hygieneModules.length ? " hq-complete" : ""}`}>
            {trackers[completedCount] || ""}
          </p>
        </div>
      </div>
    </>
  )
}
