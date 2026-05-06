import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QUIZ_QUESTIONS, getQuizResult } from '../lib/quiz'

export default function QuizPanel({ onClose }: { onClose?: () => void }) {
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [finished, setFinished] = useState(false)

  const question = QUIZ_QUESTIONS[current]
  const result = getQuizResult(score, QUIZ_QUESTIONS.length, lang)
  const diffColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' }

  const ui = {
    fr: { correct: 'CORRECT', total: 'TOTAL', score: 'SCORE', restart: '🔄 Recommencer', close: '✕ Fermer', validate: '✓ Valider', next: 'Question suivante →', results: '🏆 Voir les résultats' },
    en: { correct: 'CORRECT', total: 'TOTAL', score: 'SCORE', restart: '🔄 Restart', close: '✕ Close', validate: '✓ Validate', next: 'Next Question →', results: '🏆 View Results' }
  }[lang]

  const handleConfirm = () => {
    if (selected === null) return
    const isCorrect = selected === question.correct
    setConfirmed(true)
    if (isCorrect) setScore(s => s + 1)
    setAnswers(prev => [...prev, isCorrect])
  }

  const handleNext = () => {
    if (current + 1 >= QUIZ_QUESTIONS.length) setFinished(true)
    else { setCurrent(c => c + 1); setSelected(null); setConfirmed(false) }
  }

  if (finished) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 12 }}>{result.badge}</div>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a' }}>{result.label}</h2>
      <p style={{ color: '#64748b', marginBottom: 24 }}>{result.message}</p>
      
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 16, padding: '16px 32px', marginBottom: 28 }}>
        <div><div style={{ fontSize: 40, fontWeight: 900, color: result.color }}>{score}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{ui.correct}</div></div>
        <div style={{ width: 1, height: 40, backgroundColor: '#e2e8f0' }} />
        <div><div style={{ fontSize: 40, fontWeight: 900 }}>{QUIZ_QUESTIONS.length}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{ui.total}</div></div>
        <div style={{ width: 1, height: 40, backgroundColor: '#e2e8f0' }} />
        <div><div style={{ fontSize: 40, fontWeight: 900, color: '#3b82f6' }}>{Math.round((score / QUIZ_QUESTIONS.length) * 100)}%</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{ui.score}</div></div>
      </div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
        {answers.map((c, i) => <div key={i} style={{ width: 32, height: 32, borderRadius: 8, border: `2px solid ${c ? '#10b981' : '#ef4444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: c ? '#f0fdf4' : '#fff5f5' }}>{c ? '✓' : '✗'}</div>)}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={() => window.location.reload()} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', backgroundColor: '#0f172a', color: '#10b981', fontWeight: 700, cursor: 'pointer' }}>{ui.restart}</button>
        {onClose && <button onClick={onClose} style={{ padding: '12px 28px', borderRadius: 12, border: '1.5px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>{ui.close}</button>}
      </div>
    </motion.div>
  )

  return (
    <div style={{ padding: 24 }}>
      {/* Barre de Progression */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Question {current + 1} / {QUIZ_QUESTIONS.length}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>{lang.toUpperCase()}</button>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, backgroundColor: `${diffColor[question.difficulty]}15`, color: diffColor[question.difficulty] }}>{question.difficulty.toUpperCase()}</span>
          </div>
        </div>
        <div style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${((current + 1) / QUIZ_QUESTIONS.length) * 100}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <div style={{ backgroundColor: '#f8fafc', borderRadius: 14, padding: '18px 20px', marginBottom: 20, border: '1.5px solid #f1f5f9' }}>
            <p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{question.question[lang]}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {question.options.map((opt, idx) => (
              <motion.button key={idx} onClick={() => !confirmed && setSelected(idx)} 
                style={{ 
                  padding: '13px 18px', borderRadius: 12, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, cursor: confirmed ? 'default' : 'pointer', fontWeight: 600,
                  border: `2px solid ${confirmed ? (idx === question.correct ? '#10b981' : (idx === selected ? '#ef4444' : '#e2e8f0')) : (selected === idx ? '#3b82f6' : '#e2e8f0')}`,
                  backgroundColor: confirmed ? (idx === question.correct ? '#f0fdf4' : (idx === selected ? '#fff5f5' : 'white')) : (selected === idx ? '#eff6ff' : 'white')
                }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, backgroundColor: (selected === idx || (confirmed && idx === question.correct)) ? 'inherit' : '#f1f5f9' }}>
                  {confirmed && idx === question.correct ? '✓' : (confirmed && idx === selected ? '✗' : String.fromCharCode(65 + idx))}
                </span>
                {opt[lang]}
              </motion.button>
            ))}
          </div>

          {confirmed && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ backgroundColor: selected === question.correct ? '#f0fdf4' : '#fff5f5', padding: '12px 16px', borderRadius: 12, marginBottom: 16, border: '1.5px solid #e2e8f0' }}>
              <p style={{ fontSize: 13, margin: 0 }}>{selected === question.correct ? '✅ ' : '❌ '}{question.explanation[lang]}</p>
            </motion.div>
          )}

          <motion.button onClick={confirmed ? handleNext : handleConfirm} disabled={selected === null}
            style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', fontWeight: 700, cursor: selected === null ? 'not-allowed' : 'pointer',
              background: confirmed ? 'linear-gradient(135deg, #10b981, #3b82f6)' : (selected !== null ? '#0f172a' : '#f1f5f9'),
              color: confirmed ? 'white' : (selected !== null ? '#10b981' : '#94a3b8')
            }}>
            {confirmed ? (current + 1 >= QUIZ_QUESTIONS.length ? ui.results : ui.next) : ui.validate}
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}