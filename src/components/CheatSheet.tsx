import { motion } from 'framer-motion'

const commands = [
  { cmd: 'ls', usage: 'ls [-l] [-la]', desc: 'List directory contents', example: 'ls -la' },
  { cmd: 'cd', usage: 'cd [path]', desc: 'Change directory', example: 'cd ~/documents' },
  { cmd: 'pwd', usage: 'pwd', desc: 'Print working directory', example: 'pwd' },
  { cmd: 'mkdir', usage: 'mkdir [name]', desc: 'Create a directory', example: 'mkdir projects' },
  { cmd: 'touch', usage: 'touch [name]', desc: 'Create an empty file', example: 'touch notes.txt' },
  { cmd: 'rm', usage: 'rm [-r] [name]', desc: 'Remove file or directory', example: 'rm -r oldfolder' },
  { cmd: 'cat', usage: 'cat [file]', desc: 'Display file content', example: 'cat readme.txt' },
  { cmd: 'echo', usage: 'echo [text]', desc: 'Display text', example: 'echo Hello World' },
  { cmd: 'cp', usage: 'cp [src] [dest]', desc: 'Copy a file', example: 'cp a.txt docs/' },
  { cmd: 'mv', usage: 'mv [src] [dest]', desc: 'Move or rename', example: 'mv old.txt new.txt' },
  { cmd: 'clear', usage: 'clear', desc: 'Clear the terminal', example: 'clear' },
  { cmd: 'whoami', usage: 'whoami', desc: 'Display current user', example: 'whoami' },
  { cmd: 'history', usage: 'history', desc: 'Show command history', example: 'history' },
  { cmd: 'help', usage: 'help', desc: 'List all commands', example: 'help' },
]

const shortcuts = [
  { key: 'Tab', desc: 'Autocomplete command or path' },
  { key: '↑ / ↓', desc: 'Navigate command history' },
  { key: 'Ctrl + L', desc: 'Clear the terminal' },
  { key: 'Enter', desc: 'Execute command' },
]

interface CheatSheetProps {
  onClose: () => void
}

export default function CheatSheet({ onClose }: CheatSheetProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-white font-semibold font-mono">cheat-sheet.txt</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Commands table */}
          <div>
            <h3 className="text-green-400 font-mono text-sm font-semibold mb-3">
              # Available Commands
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-800">
                    <th className="text-left py-2 pr-4">COMMAND</th>
                    <th className="text-left py-2 pr-4">USAGE</th>
                    <th className="text-left py-2 pr-4">DESCRIPTION</th>
                    <th className="text-left py-2">EXAMPLE</th>
                  </tr>
                </thead>
                <tbody>
                  {commands.map((c, i) => (
                    <tr
                      key={c.cmd}
                      className={`border-b border-gray-800/50 ${i % 2 === 0 ? 'bg-gray-800/20' : ''}`}
                    >
                      <td className="py-2 pr-4 text-green-400 font-semibold">{c.cmd}</td>
                      <td className="py-2 pr-4 text-yellow-300">{c.usage}</td>
                      <td className="py-2 pr-4 text-gray-400">{c.desc}</td>
                      <td className="py-2 text-blue-300">{c.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div>
            <h3 className="text-green-400 font-mono text-sm font-semibold mb-3">
              # Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {shortcuts.map(s => (
                <div
                  key={s.key}
                  className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2"
                >
                  <kbd className="bg-gray-700 text-yellow-300 text-xs px-2 py-1 rounded font-mono whitespace-nowrap">
                    {s.key}
                  </kbd>
                  <span className="text-gray-400 text-xs">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-green-950/20 border border-green-900 rounded-lg p-4">
            <h3 className="text-green-400 font-mono text-sm font-semibold mb-2">
              💡 Pro Tips
            </h3>
            <ul className="space-y-1 text-gray-400 text-xs font-mono">
              <li>• Use <span className="text-yellow-300">~</span> as a shortcut for <span className="text-yellow-300">/home/user</span></li>
              <li>• Use <span className="text-yellow-300">..</span> to go up one directory level</li>
              <li>• Use <span className="text-yellow-300">Tab</span> to autocomplete — saves time!</li>
              <li>• Use <span className="text-yellow-300">ls -la</span> to see all files including hidden ones</li>
              <li>• Complete missions in order — each one unlocks the next</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}