import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QUIZ_QUESTIONS, getQuizResult } from '../lib/quiz'

interface QuizPanelProps {
  onClose?: () => void
}

export default function QuizPanel({ onClose }: QuizPanelProps) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [finished, setFinished] = useState(false)

  const question = QUIZ_QUESTIONS[current]
  const result = getQuizResult(score, QUIZ_QUESTIONS.length)

  const diffColor = {
    easy: '#10b981',
    medium: '#f59e0b',
    hard: '#ef4444'
  }

  const handleSelect = (idx: number) => {
    if (confirmed) return
    setSelected(idx)
  }

  const handleConfirm = () => {
    if (selected === null) return
    const correct = selected === question.correct
    setConfirmed(true)
    if (correct) setScore(s => s + 1)
    setAnswers(prev => [...prev, correct])
  }

  const handleNext = () => {
    if (current + 1 >= QUIZ_QUESTIONS.length) {
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setConfirmed(false)
    }
  }

  const handleRestart = () => {
    setCurrent(0)
    setSelected(null)
    setConfirmed(false)
    setScore(0)
    setAnswers([])
    setFinished(false)
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ padding: 32, textAlign: 'center' }}
      >
        {/* Badge */}
        <div style={{ fontSize: 72, marginBottom: 12 }}>{result.badge}</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
          {result.label}
        </h2>
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 24 }}>{result.message}</p>

        {/* Score */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 16, padding: '16px 32px', marginBottom: 28 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: result.color }}>{score}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>CORRECT</div>
          </div>
          <div style={{ width: 1, height: 40, backgroundColor: '#e2e8f0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#0f172a' }}>{QUIZ_QUESTIONS.length}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>TOTAL</div>
          </div>
          <div style={{ width: 1, height: 40, backgroundColor: '#e2e8f0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#3b82f6' }}>
              {Math.round((score / QUIZ_QUESTIONS.length) * 100)}%
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>SCORE</div>
          </div>
        </div>

        {/* Answer recap */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
          {answers.map((correct, i) => (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: 8,
              backgroundColor: correct ? '#f0fdf4' : '#fff5f5',
              border: `2px solid ${correct ? '#10b981' : '#ef4444'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14
            }}>
              {correct ? '✓' : '✗'}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <motion.button
            whileHover={{ y: -2 }}
            onClick={handleRestart}
            style={{ padding: '12px 28px', borderRadius: 12, border: 'none', backgroundColor: '#0f172a', color: '#10b981', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'monospace' }}
          >🔄 Recommencer</motion.button>
          {onClose && (
            <motion.button
              whileHover={{ y: -2 }}
              onClick={onClose}
              style={{ padding: '12px 28px', borderRadius: 12, border: '1.5px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >✕ Fermer</motion.button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
            Question {current + 1} / {QUIZ_QUESTIONS.length}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, backgroundColor: `${diffColor[question.difficulty]}15`, color: diffColor[question.difficulty], border: `1px solid ${diffColor[question.difficulty]}30`, textTransform: 'uppercase' }}>
              {question.difficulty}
            </span>
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>✓ {score}</span>
          </div>
        </div>
        <div style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${((current + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)', borderRadius: 10 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ backgroundColor: '#f8fafc', borderRadius: 14, padding: '18px 20px', marginBottom: 20, border: '1.5px solid #f1f5f9' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.5, margin: 0 }}>
              {question.question}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {question.options.map((opt, idx) => {
              let bg = 'white'
              let border = '#e2e8f0'
              let color = '#0f172a'

              if (confirmed) {
                if (idx === question.correct) { bg = '#f0fdf4'; border = '#10b981'; color = '#065f46' }
                else if (idx === selected && selected !== question.correct) { bg = '#fff5f5'; border = '#ef4444'; color = '#991b1b' }
              } else if (selected === idx) {
                bg = '#eff6ff'; border = '#3b82f6'; color = '#1e40af'
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!confirmed ? { x: 4 } : {}}
                  onClick={() => handleSelect(idx)}
                  style={{
                    padding: '13px 18px', borderRadius: 12,
                    border: `2px solid ${border}`,
                    backgroundColor: bg, color,
                    fontWeight: 600, fontSize: 14,
                    cursor: confirmed ? 'default' : 'pointer',
                    textAlign: 'left', display: 'flex',
                    alignItems: 'center', gap: 12,
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    backgroundColor: selected === idx || (confirmed && idx === question.correct) ? border : '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: selected === idx || (confirmed && idx === question.correct) ? 'white' : '#94a3b8',
                    flexShrink: 0, transition: 'all 0.2s'
                  }}>
                    {confirmed && idx === question.correct ? '✓' : confirmed && idx === selected && selected !== question.correct ? '✗' : String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </motion.button>
              )
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {confirmed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  backgroundColor: selected === question.correct ? '#f0fdf4' : '#fff5f5',
                  border: `1.5px solid ${selected === question.correct ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: 12, padding: '12px 16px', marginBottom: 16
                }}
              >
                <p style={{ fontSize: 13, color: selected === question.correct ? '#065f46' : '#991b1b', margin: 0, lineHeight: 1.5 }}>
                  {selected === question.correct ? '✅ ' : '❌ '}{question.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!confirmed ? (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirm}
                disabled={selected === null}
                style={{
                  flex: 1, padding: '13px', borderRadius: 12, border: 'none',
                  backgroundColor: selected !== null ? '#0f172a' : '#f1f5f9',
                  color: selected !== null ? '#10b981' : '#94a3b8',
                  fontWeight: 700, fontSize: 14, cursor: selected !== null ? 'pointer' : 'not-allowed',
                  fontFamily: 'monospace', transition: 'all 0.2s'
                }}
              >
                ✓ Valider
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                style={{
                  flex: 1, padding: '13px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                  color: 'white', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                {current + 1 >= QUIZ_QUESTIONS.length ? '🏆 Voir les résultats' : 'Question suivante →'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}