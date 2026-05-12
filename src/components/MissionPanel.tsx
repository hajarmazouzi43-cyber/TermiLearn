import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MISSIONS, getMissionProgress } from '../lib/missions'
import { useShellStore } from '../store/shellStore'
import { supabase } from '../lib/supabase'

interface MissionPanelProps {
  userId: string
  completedMissions: number[]
  onMissionComplete: (missionId: number) => void
}

export default function MissionPanel({ userId, completedMissions, onMissionComplete }: MissionPanelProps) {
  const [activeMission, setActiveMission] = useState<number | null>(null)
  const [hintLevel, setHintLevel] = useState(0)
  const [checking, setChecking] = useState(false)
  const [feedback, setFeedback] = useState('')
  const { filesystem, cwd } = useShellStore()

  const handleCheck = async (missionId: number) => {
    setChecking(true)
    setFeedback('')
    const mission = MISSIONS.find(m => m.id === missionId)
    if (!mission) return

    const success = mission.validate(filesystem, cwd)

    if (success) {
      setFeedback('success')
      onMissionComplete(missionId)
      await supabase.from('missions_progress').upsert({
        user_id: userId,
        mission_id: missionId,
        completed: true,
        score: 100 - hintLevel * 25,
        completed_at: new Date().toISOString()
      })
      setTimeout(() => {
        setActiveMission(null)
        setHintLevel(0)
        setFeedback('')
      }, 2000)
    } else {
      setFeedback('error')
    }
    setChecking(false)
  }

  const getHint = (mission: typeof MISSIONS[0]) => {
    if (hintLevel === 0) return null
    if (hintLevel === 1) return mission.hint1
    if (hintLevel === 2) return mission.hint2
    return mission.hint3
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 24,
      boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
      border: '1px solid #eef2f6',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #eef2f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fafcff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
         
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0a2540' }}>Missions</h2>
            <p style={{ fontSize: 13, margin: '4px 0 0', color: '#5c6f87' }}>Validate your Linux skills</p>
          </div>
        </div>
        <div style={{
          backgroundColor: '#eef2ff',
          padding: '6px 14px',
          borderRadius: 40,
          fontSize: 13,
          fontWeight: 600,
          color: '#2563eb'
        }}>
          {completedMissions.length}/{MISSIONS.length} complétées
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '8px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ height: 6, backgroundColor: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', backgroundColor: '#22c55e', borderRadius: 10 }}
            initial={{ width: 0 }}
            animate={{ width: `${(completedMissions.length / MISSIONS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Mission list */}
      <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MISSIONS.map((mission) => {
          const { completed, locked } = getMissionProgress(mission.id, completedMissions)
          const isActive = activeMission === mission.id

          return (
            <div key={mission.id}>
              <div
                onClick={() => {
                  if (!locked) {
                    setActiveMission(isActive ? null : mission.id)
                    setHintLevel(0)
                    setFeedback('')
                  }
                }}
                style={{
                  padding: '16px 18px',
                  borderRadius: 20,
                  backgroundColor: completed
                    ? '#f0fdf4'
                    : locked
                    ? '#f8fafc'
                    : isActive
                    ? '#eff6ff'
                    : '#ffffff',
                  border: locked
                    ? '1px solid #e9eef3'
                    : isActive
                    ? '2px solid #3b82f6'
                    : '1px solid #eef2f6',
                  cursor: locked ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: locked ? 0.6 : 1,
                  boxShadow: isActive ? '0 4px 12px rgba(59,130,246,0.08)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: completed
                      ? '#22c55e'
                      : locked
                      ? '#e2e8f0'
                      : isActive
                      ? '#3b82f6'
                      : '#f1f5f9',
                    color: completed || isActive ? 'white' : '#94a3b8',
                    fontWeight: 600,
                    fontSize: 14
                  }}>
                    {completed ? '✓' : locked ? '🔒' : isActive ? '▶' : `${mission.id}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: 15,
                      color: completed ? '#15803d' : locked ? '#94a3b8' : '#0f172a',
                      marginBottom: 4
                    }}>
                      {mission.title}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>
                      {mission.description}
                    </div>
                  </div>
                </div>

                {/* Expanded mission */}
                <AnimatePresence>
                  {isActive && !locked && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                        {/* Hint */}
                        <AnimatePresence>
                          {hintLevel > 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              style={{
                                backgroundColor: '#fffbeb',
                                padding: '10px 14px',
                                borderRadius: 14,
                                border: '1px solid #fde68a',
                                marginBottom: 12,
                                fontSize: 13,
                                color: '#b45309'
                              }}
                            >
                              💡 {getHint(mission)}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Feedback */}
                        <AnimatePresence>
                          {feedback === 'success' && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              style={{
                                backgroundColor: '#f0fdf4',
                                padding: '10px 14px',
                                borderRadius: 14,
                                border: '1px solid #bbf7d0',
                                marginBottom: 12,
                                fontSize: 13,
                                color: '#15803d',
                                textAlign: 'center',
                                fontWeight: 500
                              }}
                            >
                              🎉 Mission validée !
                            </motion.div>
                          )}
                          {feedback === 'error' && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              style={{
                                backgroundColor: '#fef2f2',
                                padding: '10px 14px',
                                borderRadius: 14,
                                border: '1px solid #fecaca',
                                marginBottom: 12,
                                fontSize: 13,
                                color: '#b91c1c',
                                textAlign: 'center'
                              }}
                            >
                              ✗ Pas encore – réessaie !
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 10 }}>
                          {hintLevel < 3 && (
                            <button
                              onClick={() => setHintLevel(h => Math.min(h + 1, 3))}
                              style={{
                                flex: 1,
                                padding: '10px 0',
                                borderRadius: 40,
                                border: '1px solid #fcd34d',
                                backgroundColor: '#fffbeb',
                                color: '#d97706',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                              }}
                            >
                              💡 Indice ({3 - hintLevel} restant)
                            </button>
                          )}
                          <button
                            onClick={() => handleCheck(mission.id)}
                            disabled={checking}
                            style={{
                              flex: 1,
                              padding: '10px 0',
                              borderRadius: 40,
                              border: 'none',
                              backgroundColor: checking ? '#cbd5e1' : '#3b82f6',
                              color: 'white',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: checking ? 'not-allowed' : 'pointer',
                              fontFamily: 'inherit'
                            }}
                          >
                            {checking ? 'Vérification...' : '✓ Vérifier'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}