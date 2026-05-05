import { useState, useRef, useEffect,type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { useShellStore } from '../store/shellStore'
import { parseCommand, executeLS, executeCD, executePWD, executeMKDIR, executeTOUCH, executeRM, executeCAT, executeECHO, executeCP, executeMV, executeCLEAR, executeWHOAMI, executeHISTORY, executeHELP } from '../lib/commands'
import { saveCommandHistory } from '../lib/filesystem'

interface TerminalProps {
  userId: string
}

export default function Terminal({ userId }: TerminalProps) {
  const [input, setInput] = useState('')
  const [tabSuggestions, setTabSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const {
    output, cwd, history, historyIndex,
    filesystem, setFilesystem, setCwd,
    addOutput, clearOutput, addToHistory,
    setHistoryIndex
  } = useShellStore()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [output])

  const getPrompt = () => {
    const displayCwd = cwd.replace('/home/user', '~')
    return `user@termilearnhost:${displayCwd}$`
  }

  const handleCommand = async (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    addOutput({ text: `${getPrompt()} ${trimmed}`, type: 'input' })
    addToHistory(trimmed)
    await saveCommandHistory(userId, trimmed)

    const { cmd, args } = parseCommand(trimmed)

    const ctx = {
      filesystem, cwd, userId,
      setFilesystem, setCwd, addOutput, clearOutput
    }

    switch (cmd) {
      case 'ls': await executeLS(args, ctx); break
      case 'cd': await executeCD(args, ctx); break
      case 'pwd': await executePWD(ctx); break
      case 'mkdir': await executeMKDIR(args, ctx); break
      case 'touch': await executeTOUCH(args, ctx); break
      case 'rm': await executeRM(args, ctx); break
      case 'cat': await executeCAT(args, ctx); break
      case 'echo': await executeECHO(args, ctx); break
      case 'cp': await executeCP(args, ctx); break
      case 'mv': await executeMV(args, ctx); break
      case 'clear': await executeCLEAR(ctx); break
      case 'whoami': await executeWHOAMI(ctx); break
      case 'history': await executeHISTORY(history, ctx); break
      case 'help': await executeHELP(ctx); break
      default:
        addOutput({ text: `bash: ${cmd}: command not found — type "help" for available commands`, type: 'error' })
    }
  }

  const handleTabCompletion = () => {
    const tokens = input.split(' ')
    const last = tokens[tokens.length - 1]
    const isFirstToken = tokens.length === 1

    if (isFirstToken) {
      const commands = ['ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cat', 'echo', 'cp', 'mv', 'clear', 'whoami', 'history', 'help']
      const matches = commands.filter(c => c.startsWith(last))
      if (matches.length === 1) {
        setInput(matches[0] + ' ')
        setTabSuggestions([])
      } else if (matches.length > 1) {
        setTabSuggestions(matches)
      }
    } else {
      // Path completion
      const partial = last.startsWith('/') ? last : cwd + '/' + last
      const dir = partial.substring(0, partial.lastIndexOf('/')) || '/'
      const prefix = partial.split('/').pop() || ''
      const matches = filesystem
        .filter(n => n.parent_path === dir && n.name.startsWith(prefix))
        .map(n => n.type === 'directory' ? n.name + '/' : n.name)

      if (matches.length === 1) {
        tokens[tokens.length - 1] = matches[0]
        setInput(tokens.join(' '))
        setTabSuggestions([])
      } else if (matches.length > 1) {
        setTabSuggestions(matches)
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    setTabSuggestions([])

    if (e.key === 'Enter') {
      handleCommand(input)
      setInput('')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      handleTabCompletion()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = Math.min(historyIndex + 1, history.length - 1)
      setHistoryIndex(newIndex)
      setInput(history[newIndex] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = Math.max(historyIndex - 1, -1)
      setHistoryIndex(newIndex)
      setInput(newIndex === -1 ? '' : history[newIndex])
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      clearOutput()
    }
  }

  const renderLine = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Color directories in blue, errors in red
      const parts = line.split(/(\x1b\[blue\].*?\x1b\[\/blue\])/g)
      return (
        <span key={i} className="block">
          {parts.map((part, j) => {
            if (part.startsWith('\x1b[blue]')) {
              const name = part.replace(/\x1b\[blue\]|\x1b\[\/blue\]/g, '')
              return <span key={j} className="text-blue-400 font-semibold">{name}</span>
            }
            return <span key={j}>{part}</span>
          })}
          {i < lines.length - 1 && ''}
        </span>
      )
    })
  }

  return (
  <div
    className="terminal-window flex flex-col h-full"
    onClick={() => inputRef.current?.focus()}
  >
    {/* Header */}
    <div className="terminal-header gap-2">
      <div className="terminal-dot bg-red-500 cursor-pointer hover:brightness-110" />
      <div className="terminal-dot bg-yellow-500 cursor-pointer hover:brightness-110" />
      <div className="terminal-dot bg-green-500 cursor-pointer hover:brightness-110" />
      <span className="ml-3 text-slate-400 text-xs font-mono">
        user@termilearnhost — {cwd.replace('/home/user', '~')}
      </span>
    </div>

    {/* Output */}
    <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-0.5 bg-[#030712]">
      {output.map((line) => (
        <motion.div
          key={line.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className={
            line.type === 'input'   ? 'text-green-400' :
            line.type === 'error'   ? 'text-red-400'   :
            line.type === 'success' ? 'text-green-300' :
            'text-slate-300'
          }
        >
          {renderLine(line.text)}
        </motion.div>
      ))}

      {/* Tab suggestions */}
      {tabSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-3 p-2 my-2 bg-white/5 rounded border border-white/10 text-yellow-400 text-xs font-mono">
          {tabSuggestions.map((s, i) => (
            <span key={i} className="opacity-80 hover:opacity-100">{s}</span>
          ))}
        </div>
      )}

      {/* Input line */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-green-400 whitespace-nowrap">{getPrompt()}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-slate-100 outline-none font-mono text-sm caret-green-400"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      <div ref={bottomRef} />
    </div>
  </div>
)
}