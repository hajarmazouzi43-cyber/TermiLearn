import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QUIZ_QUESTIONS, getQuizResult } from '../lib/quiz'
import { jsPDF } from "jspdf"

// --- COMPOSANT GÉNÉRATEUR ---
interface CertificateProps {
  userName: string;
  score: number;
}

const CertificateGenerator = ({ userName, score }: CertificateProps) => {
  const generatePDF = () => {
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      
      // --- 1. DESIGN BORDURES ---
      doc.setLineWidth(2);
      doc.setDrawColor(16, 185, 129); // Vert
      doc.rect(10, 10, 277, 190); 
      doc.setDrawColor(15, 23, 42); // Sombre
      doc.setLineWidth(0.5);
      doc.rect(12, 12, 273, 186);

      // --- 2. TEXTES ---
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

      // --- 3. LE BADGE (Style Médaille) ---
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

      // --- 4. TA SIGNATURE (Violette & Graphique) ---
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
    <div style={{ marginTop: 24 }}>
      <button
        onClick={generatePDF}
        style={{ padding: '12px 28px', borderRadius: 12, border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
      >
         Download My Certificate (EN)
      </button>
    </div>
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
    if (isCorrect) setScore(s => s + 1)
    setAnswers(prev => [...prev, isCorrect])
  }

//  Barre s ajoute automatiquement

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
        <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px dashed #10b981', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '14px', fontWeight: 700, color: '#065f46' }}>Enter your name for the certificate:</label>
          <input 
            type="text" 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Ex: MAZOUZI Hajar"
            style={{ padding: '10px 15px', borderRadius: '8px', border: '2px solid #10b981', width: '80%', textAlign: 'center', fontSize: '16px' }}
          />
          <CertificateGenerator userName={userName} score={Math.round((score / QUIZ_QUESTIONS.length) * 100)} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={() => window.location.reload()} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', backgroundColor: '#0f172a', color: '#10b981', fontWeight: 700, cursor: 'pointer' }}>{ui.restart}</button>
        {onClose && <button onClick={onClose} style={{ padding: '12px 28px', borderRadius: 12, border: '1.5px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>{ui.close}</button>}
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

  {/* // --Barre de progression --- */}

          <motion.div animate={{ width: `${((current + 1) / QUIZ_QUESTIONS.length) * 100}%` }} 
          style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
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