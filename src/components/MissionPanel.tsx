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
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
        <span className="text-yellow-400 text-sm">🎯</span>
        <span className="text-white text-sm font-semibold">Missions</span>
        <span className="ml-auto text-xs text-gray-500 font-mono">
          {completedMissions.length}/{MISSIONS.length} completed
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 border-b border-gray-800">
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedMissions.length / MISSIONS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Mission list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {MISSIONS.map((mission) => {
          const { completed, locked } = getMissionProgress(mission.id, completedMissions)
          const isActive = activeMission === mission.id

          return (
            <div key={mission.id}>
              <button
                onClick={() => {
                  if (!locked) {
                    setActiveMission(isActive ? null : mission.id)
                    setHintLevel(0)
                    setFeedback('')
                  }
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm
                  ${completed
                    ? 'border-green-800 bg-green-950/30 text-green-400'
                    : locked
                    ? 'border-gray-800 bg-gray-800/30 text-gray-600 cursor-not-allowed'
                    : isActive
                    ? 'border-yellow-600 bg-yellow-950/20 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">
                    {completed ? '✅' : locked ? '🔒' : isActive ? '▶' : '○'}
                  </span>
                  <span className="font-mono font-medium">{mission.title}</span>
                </div>
              </button>

              {/* Expanded mission */}
              <AnimatePresence>
                {isActive && !locked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 p-3 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                      {/* Description */}
                      <p className="text-gray-300 text-xs leading-relaxed">
                        {mission.description}
                      </p>

                      {/* Hint */}
                      <AnimatePresence>
                        {hintLevel > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-yellow-950/30 border border-yellow-800 rounded px-3 py-2"
                          >
                            <p className="text-yellow-300 text-xs font-mono">
                              💡 {getHint(mission)}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Feedback */}
                      <AnimatePresence>
                        {feedback === 'success' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-950/30 border border-green-700 rounded px-3 py-2 text-center"
                          >
                            <p className="text-green-400 text-xs font-mono">
                              🎉 Mission complete! Well done!
                            </p>
                          </motion.div>
                        )}
                        {feedback === 'error' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-red-950/30 border border-red-800 rounded px-3 py-2"
                          >
                            <p className="text-red-400 text-xs font-mono">
                              ✗ Not yet — keep trying!
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {hintLevel < 3 && (
                          <button
                            onClick={() => setHintLevel(h => Math.min(h + 1, 3))}
                            className="flex-1 text-xs py-1.5 rounded border border-yellow-800 text-yellow-400 hover:bg-yellow-950/30 transition-colors font-mono"
                          >
                            💡 Hint ({3 - hintLevel} left)
                          </button>
                        )}
                        <button
                          onClick={() => handleCheck(mission.id)}
                          disabled={checking}
                          className="flex-1 text-xs py-1.5 rounded border border-green-700 text-green-400 hover:bg-green-950/30 transition-colors font-mono disabled:opacity-50"
                        >
                          {checking ? 'Checking...' : '✓ Check'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}