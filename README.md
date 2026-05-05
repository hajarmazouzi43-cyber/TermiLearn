# TermiLearn 🖥️
### Learn Linux in your browser — no installation needed

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)
![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify)

---
## 👩‍💻 Author

**Hajar Mazouzi**  
ENSA Berrechid — Technologies Web 2025-2026  
Pr. Ilhame Ait Lbachir  
GitHub: [@hajarmazouzi43-cyber](https://github.com/hajarmazouzi43-cyber)

---
## 📖 About

**TermiLearn** is an interactive web application that allows students to learn and practice Linux commands directly in their browser, without installing any software. Built for ENSA Berrechid students as part of the Web Technologies module.

**Live Demo:** [termilearn.netlify.app](https://termilearn.netlify.app)

---

## ✨ Features

- 🖥️ **Virtual Terminal** — fully interactive Linux terminal in the browser
- 📚 **Command Course** — 14 essential Linux commands with detailed explanations
- 🎯 **5 Guided Missions** — progressive challenges to validate your skills
- 🔐 **Authentication** — email/password login with user profiles (Supabase)
- 💾 **Persistent Filesystem** — virtual file system saved in Supabase database
- ⌨️ **Tab Autocompletion** — complete commands and paths with Tab key
- 🕐 **Command History** — navigate history with ↑↓ arrow keys
- 🎨 **Syntax Highlighting** — colored output (directories in blue, errors in red)
- 💡 **Progressive Hints** — 3-level hint system for each mission
- 📋 **Cheat Sheet** — quick reference for all available commands
- 🤖 AI Copilot — LinuxBot powered by AI to answer Linux questions in real-time

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI Framework |
| TypeScript | 5.4 | Type safety |
| Vite | 6 | Build tool |
| Supabase | Latest | Auth + PostgreSQL database |
| Zustand | Latest | Global state management |
| Framer Motion | Latest | Animations |
| Tailwind CSS | 4 | Styling |
| Vitest | Latest | Unit testing |
| OpenRouter | Latest | AI API (LinuxBot)

---

## 🗄️ Database Schema

```sql
-- User profiles
profiles (id, first_name, created_at)

-- Virtual filesystem per user  
filesystem (id, user_id, name, type, content, parent_path, full_path, created_at)

-- Mission progress tracking
missions_progress (id, user_id, mission_id, completed, score, completed_at)

-- Command history
command_history (id, user_id, command, executed_at)
```

---

## ⌨️ Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `ls` | List directory contents | `ls -la` |
| `cd` | Change directory | `cd ~/documents` |
| `pwd` | Print working directory | `pwd` |
| `mkdir` | Create a directory | `mkdir projects` |
| `touch` | Create an empty file | `touch notes.txt` |
| `rm` | Remove file or directory | `rm -r folder` |
| `cat` | Display file content | `cat readme.txt` |
| `echo` | Display text | `echo Hello World` |
| `cp` | Copy a file | `cp a.txt docs/` |
| `mv` | Move or rename | `mv old.txt new.txt` |
| `clear` | Clear the terminal | `clear` |
| `whoami` | Display current user | `whoami` |
| `history` | Show command history | `history` |
| `help` | List all commands | `help` |

---

## 🎯 Missions

| Mission | Description | Skill Tested |
|---------|-------------|-------------|
| Mission 1 | Navigate to /home/user/documents | `cd`, `pwd` |
| Mission 2 | Create a directory and a file inside it | `mkdir`, `touch` |
| Mission 3 | Find and read the mystery file | `ls`, `cat` |
| Mission 4 | Copy a file to another directory | `cp` |
| Mission 5 | Delete a directory recursively | `rm -r` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Supabase account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/hajarmazouzi43-cyber/TermiLearn.git
cd TermiLearnApp

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Fill in your Supabase credentials
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Run locally

```bash
npm run dev
```

### Run tests

```bash
npm run test
npm run test -- --coverage
```

### Build for production

```bash
npm run build
```

---

## 📁 Project Structure
