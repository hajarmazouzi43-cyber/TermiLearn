import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
}

interface AICopilotProps {
  onClose: () => void
  currentCwd: string
}


const SYSTEM_PROMPT = `You are LinuxBot, a helpful Linux terminal assistant inside TermiLearn — an educational web app that teaches Linux commands. 

Your role:
- Help users understand Linux commands (ls, cd, pwd, mkdir, touch, rm, cat, echo, cp, mv, clear, whoami, history, help)
- Explain what commands do and how to use them
- Suggest the right command for a task
- Explain error messages
- Give practical examples
- Be encouraging and educational

Rules:
- Keep answers concise and clear (max 4-5 lines)
- Always include a practical example when explaining a command
- Use code formatting for commands: \`command\`
- Be friendly and encouraging for beginners
- If asked about something not related to Linux/terminal, politely redirect to Linux topics
- The user is a student learning Linux for the first time`

const suggestions = [
  'How do I list all files?',
  'What does rm -r do?',
  'How to create a folder?',
  'Explain the cd command',
  'How to read a file?',
  'What is pwd used for?',
]

export default function AICopilot({ onClose, currentCwd }: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: `Hi! I'm **LinuxBot** 🤖 — your Linux learning assistant!\n\nI can help you understand commands, suggest what to type, or explain any error you see in the terminal.\n\nWhat would you like to learn?`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

const sendMessage = async (text: string) => {
  if (!text.trim() || loading) return

  const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() }
  setMessages(prev => [...prev, userMsg])
  setInput('')
  setLoading(true)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'TermiLearn'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Current directory: ${currentCwd}\n\nQuestion: ${text.trim()}`
          }
        ],
        max_tokens: 300,
      })
    })

    const data = await response.json()
    console.log('OpenRouter response:', data) 
    const reply = data.choices?.[0]?.message?.content || data.error?.message 
  || JSON.stringify(data)

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: reply
    }])

  } catch (error:any) {
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: `❌ Error: ${error.message|| "An unknown error occurred"}`
    }])
  } finally {
    setLoading(false)
  }
}

  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(`[^`]+`)/g)
      return (
        <span key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={j} style={{
                  backgroundColor: '#0f172a', color: '#10b981',
                  padding: '1px 6px', borderRadius: 4,
                  fontFamily: 'monospace', fontSize: 12
                }}>
                  {part.slice(1, -1)}
                </code>
              )
            }
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>
            }
            return <span key={j}>{part}</span>
          })}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{
        width: 360, height: '100%',
        backgroundColor: 'white',
        borderLeft: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 2px 8px rgba(99,102,241,0.3)'
          }}>🤖</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>LinuxBot</div>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>● Online</div>
          </div>
        </div>
        <button onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18, padding: '4px 8px', borderRadius: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(msg => (
          <motion.div key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, marginRight: 8, flexShrink: 0, marginTop: 2
              }}>🤖</div>
            )}
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              backgroundColor: msg.role === 'user' ? '#6366f1' : '#f8fafc',
              color: msg.role === 'user' ? 'white' : '#1e293b',
              fontSize: 13, lineHeight: 1.6,
              border: msg.role === 'assistant' ? '1px solid #f1f5f9' : 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              {renderText(msg.text)}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
            }}>🤖</div>
            <div style={{
              padding: '10px 16px', backgroundColor: '#f8fafc',
              borderRadius: '14px 14px 14px 4px', border: '1px solid #f1f5f9',
              display: 'flex', gap: 4, alignItems: 'center'
            }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#94a3b8' }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              style={{
                padding: '5px 10px', borderRadius: 20,
                border: '1.5px solid #e2e8f0', backgroundColor: 'white',
                color: '#64748b', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex', gap: 8, alignItems: 'center'
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
          placeholder="Ask about any Linux command..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 12,
            border: '1.5px solid #e2e8f0', fontSize: 13,
            outline: 'none', backgroundColor: '#f8fafc',
            fontFamily: 'inherit'
          }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          style={{
            width: 38, height: 38, borderRadius: 10, border: 'none',
            background: input.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9',
            color: input.trim() && !loading ? 'white' : '#94a3b8',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}
        >➤</button>
      </div>
    </motion.div>
  )
}