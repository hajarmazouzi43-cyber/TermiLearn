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
      className="fixed inset-0 bg-slate-200/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Learning Poster Style Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="relative bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-lg border-8 border-white"
      >
        {/* Top Accent Bar */}
        <div className="h-4 w-full bg-sky-300" />

        <div className="overflow-y-auto px-12 py-10 flex flex-col items-center">
          
          {/* Pedagogical Title */}
          <h2 className="text-slate-700 font-bold text-4xl mb-2 tracking-tight text-center font-sans">
            MY FIRST TERMINAL
          </h2>
          <p className="text-sky-500 font-bold uppercase text-xs tracking-[0.2em] mb-10">Linux Survival Guide</p>

          {/* Commands Grid - Learning Colors */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-6 w-full mb-12">
            {commands.map((c, i) => {
              const colors = ['bg-sky-100 text-sky-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-rose-100 text-rose-600'];
              const currentColor = colors[i % colors.length];
              
              return (
                <div key={c.cmd} className="flex flex-col group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${currentColor} flex items-center justify-center font-bold text-lg font-serif shadow-sm`}>
                      {c.cmd.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-800 font-mono font-black text-lg underline decoration-sky-200 decoration-4 underline-offset-2">
                      {c.cmd}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-semibold mt-2 leading-tight">
                    {c.desc}
                  </p>
                  <code className="text-slate-400 text-[10px] mt-1 font-mono italic">
                    Example: {c.example}
                  </code>
                </div>
              );
            })}
          </div>

          {/* Shortcuts Sticky Note Style */}
          <div className="w-full bg-yellow-50/50 border-2 border-dashed border-yellow-200 p-6 rounded-2xl">
            <h3 className="text-yellow-700 font-bold text-sm uppercase tracking-widest mb-4 text-center">
              Magic Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {shortcuts.map(s => (
                <div key={s.key} className="flex flex-col items-center">
                  <span className="bg-white px-2 py-1 rounded shadow-sm text-slate-700 font-mono text-sm font-bold border border-yellow-100 mb-1">
                    {s.key}
                  </span>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Label */}
        <div className="h-10 w-full bg-slate-50 border-t border-slate-100 flex items-center justify-between px-6">
             <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
               ENSA Berrechid • Computer Engineering
             </span>
             <span className="text-sky-400 text-[10px] font-black uppercase">
               Hajar Mazouzi
             </span>
        </div>

        {/* Close Button Style "Eraser" */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white w-8 h-8 rounded-full transition-all flex items-center justify-center font-bold"
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  )
}