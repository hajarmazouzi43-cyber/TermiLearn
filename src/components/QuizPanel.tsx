import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QUIZ_QUESTIONS, getQuizResult } from '../lib/quiz'
import { jsPDF } from "jspdf"

// --- COMPOSANT GÉNÉRATEUR DE CERTIFICAT ---
interface CertificateProps {
  userName: string;
  score: number;
}

const CertificateGenerator = ({ userName, score }: CertificateProps) => {
  const generatePDF = () => {
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      
      doc.setLineWidth(2);
      doc.setDrawColor(16, 185, 129);
      doc.rect(10, 10, 277, 190); 
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.5);
      doc.rect(12, 12, 273, 186);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(40);
      doc.setTextColor(15, 23, 42);
      doc.text("CERTIFICATE OF COMPLETION", 148.5, 45, { align: "center" });

      doc.setFontSize(20);
      doc.setFont("helvetica", "normal");
      doc.text("This is to certify that", 148.5, 70, { align: "center" });

      doc.setFontSize(45);
      doc.setFont("times", "italic");
      doc.setTextColor(16, 185, 129);
      doc.text(userName || "Student", 148.5, 95, { align: "center" });

      doc.setFontSize(18);
      doc.setTextColor(71, 85, 105);
      doc.text("successfully completed the Linux Terminal Mastery Quiz", 148.5, 120, { align: "center" });
      doc.text(`Final Score: ${score}%`, 148.5, 135, { align: "center" });

      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.8);
      doc.line(40, 155, 55, 155); 
      doc.line(55, 155, 60, 170); 
      doc.line(60, 170, 47.5, 185); 
      doc.line(47.5, 185, 35, 170); 
      doc.line(35, 170, 40, 155); 
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("OFFICIAL", 47.5, 165, { align: "center" });
      doc.text("PASSED", 47.5, 172, { align: "center" });

      doc.setDrawColor(75, 0, 130); 
      doc.setLineWidth(1);
      doc.line(210, 170, 220, 150); 
      doc.line(220, 150, 215, 175); 
      doc.line(215, 175, 235, 160); 
      doc.line(235, 160, 225, 170); 
      doc.line(220, 165, 245, 165); 
      
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.2);
      doc.line(205, 178, 245, 178);
      doc.setFontSize(10);
      doc.text("Authorized Signature", 225, 183, { align: "center" });

      doc.save(`Certificate_${userName}.pdf`);
    } catch (e) { console.error(e); }
  };

  return (
    <button
      onClick={generatePDF}
      style={{
        padding: '12px 28px',
        borderRadius: '40px',
        border: 'none',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        fontWeight: 700,
        fontSize: '14px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(16,185,129,0.4)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)'
      }}
    >
      Download My Certificate (EN)
    </button>
  );
};

// --- COMPOSANT PRINCIPAL ---
export default function QuizPanel({ onClose }: { onClose?: () => void }) {
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [finished, setFinished] = useState(false)
  const [userName, setUserName] = useState('')

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
    
    if (isCorrect) {
      setScore(score + 1)
    }
    
    // Version sans callback – évite l'erreur TypeScript
    const newAnswers = [...answers, isCorrect]
    setAnswers(newAnswers)
  }
  
// Ajout auto 
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
        <div><div style={{ fontSize: 40, fontWeight: 900, color: '#3b82f6' }}>{Math.round((score / QUIZ_QUESTIONS.length) * 100)}%</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{ui.score}</div></div>
      </div>

      {Math.round((score / QUIZ_QUESTIONS.length) * 100) >= 50 && (
        <div style={{
          backgroundColor: '#f0fdf4',
          padding: '24px',
          borderRadius: '20px',
          border: '1px solid #d1fae5',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#065f46',
            letterSpacing: '0.3px'
          }}>
             Enter your name for the certificate
          </label>
          
          <input 
            type="text" 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Ex: MAZOUZI Hajar"
            style={{
              width: '280px',
              padding: '12px 18px',
              borderRadius: '40px',
              border: '2px solid #d1fae5',
              backgroundColor: 'white',
              fontSize: '14px',
              textAlign: 'center',
              fontWeight: 500,
              color: '#0f172a',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={e => {
              e.target.style.borderColor = '#10b981'
              e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'
            }}
            onBlur={e => {
              e.target.style.borderColor = '#d1fae5'
              e.target.style.boxShadow = 'none'
            }}
          />
          
          <CertificateGenerator userName={userName} score={Math.round((score / QUIZ_QUESTIONS.length) * 100)} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 28px',
            borderRadius: '40px',
            border: 'none',
            background: '#f1f5f9',
            color: '#10b981',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#e2e8f0'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#f1f5f9'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {ui.restart}
        </button>
        
        <button
          onClick={onClose}
          style={{
            padding: '12px 28px',
            borderRadius: '40px',
            border: '1.5px solid #e2e8f0',
            backgroundColor: 'white',
            color: '#64748b',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#fecaca'
            e.currentTarget.style.backgroundColor = '#fff5f5'
            e.currentTarget.style.color = '#ef4444'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#e2e8f0'
            e.currentTarget.style.backgroundColor = 'white'
            e.currentTarget.style.color = '#64748b'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
           {ui.close}
        </button>
      </div>
    </motion.div>
  )

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Question {current + 1} / {QUIZ_QUESTIONS.length}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>{lang.toUpperCase()}</button>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, backgroundColor: `${diffColor[question.difficulty]}15`, color: diffColor[question.difficulty] }}>{question.difficulty.toUpperCase()}</span>
          </div>
        </div>
        <div style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
          <motion.div 
            animate={{ width: `${((current + 1) / QUIZ_QUESTIONS.length) * 100}%` }} 
            style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} 
          />
        </div>
      </div>
      {/* barre de progression */}
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

          <motion.button 
            onClick={confirmed ? handleNext : handleConfirm} 
            disabled={selected === null}
            style={{
              width: '100%', padding: '13px', borderRadius: 12, border: 'none', fontWeight: 700, cursor: selected === null ? 'not-allowed' : 'pointer',
              background: confirmed ? 'linear-gradient(135deg, #10b981, #3b82f6)' : (selected !== null ? '#0f172a' : '#f1f5f9'),
              color: confirmed ? 'white' : (selected !== null ? '#10b981' : '#94a3b8')
            }}
          >
            {confirmed ? (current + 1 >= QUIZ_QUESTIONS.length ? ui.results : ui.next) : ui.validate}
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}