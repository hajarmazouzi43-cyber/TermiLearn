export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correct: number
  difficulty: 'easy' | 'medium' | 'hard'
  explanation: string
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // EASY (1-5)
  {
    id: 1,
    question: "Quelle commande affiche le contenu d'un répertoire ?",
    options: ["pwd", "ls", "cd", "cat"],
    correct: 1,
    difficulty: 'easy',
    explanation: "`ls` liste les fichiers et dossiers du répertoire courant."
  },
  {
    id: 2,
    question: "Quelle commande affiche le chemin du répertoire courant ?",
    options: ["ls", "cd", "pwd", "echo"],
    correct: 2,
    difficulty: 'easy',
    explanation: "`pwd` (Print Working Directory) affiche le chemin absolu du répertoire courant."
  },
  {
    id: 3,
    question: "Comment créer un fichier vide appelé 'notes.txt' ?",
    options: ["mkdir notes.txt", "touch notes.txt", "cat notes.txt", "echo notes.txt"],
    correct: 1,
    difficulty: 'easy',
    explanation: "`touch` crée un fichier vide ou met à jour la date d'un fichier existant."
  },
  {
    id: 4,
    question: "Quelle commande permet de lire le contenu d'un fichier ?",
    options: ["ls", "pwd", "mkdir", "cat"],
    correct: 3,
    difficulty: 'easy',
    explanation: "`cat` affiche le contenu d'un fichier dans le terminal."
  },
  {
    id: 5,
    question: "Comment créer un dossier appelé 'projects' ?",
    options: ["touch projects", "mkdir projects", "cd projects", "ls projects"],
    correct: 1,
    difficulty: 'easy',
    explanation: "`mkdir` (Make Directory) crée un nouveau répertoire."
  },
  // MEDIUM (6-10)
  {
    id: 6,
    question: "Quelle commande copie le fichier 'a.txt' dans le dossier 'docs/' ?",
    options: ["mv a.txt docs/", "cp a.txt docs/", "cat a.txt docs/", "ls a.txt docs/"],
    correct: 1,
    difficulty: 'medium',
    explanation: "`cp` copie un fichier vers une destination sans supprimer l'original."
  },
  {
    id: 7,
    question: "Comment supprimer un dossier et tout son contenu ?",
    options: ["rm folder", "rm -r folder", "delete folder", "rmdir -f folder"],
    correct: 1,
    difficulty: 'medium',
    explanation: "`rm -r` supprime récursivement un dossier et tout ce qu'il contient."
  },
  {
    id: 8,
    question: "Quelle commande renomme 'old.txt' en 'new.txt' ?",
    options: ["cp old.txt new.txt", "rename old.txt new.txt", "mv old.txt new.txt", "touch new.txt"],
    correct: 2,
    difficulty: 'medium',
    explanation: "`mv` déplace ou renomme un fichier selon la destination donnée."
  },
  {
    id: 9,
    question: "Que fait la commande `ls -la` ?",
    options: [
      "Liste seulement les dossiers",
      "Liste les fichiers avec détails et fichiers cachés",
      "Supprime les fichiers cachés",
      "Crée un fichier nommé -la"
    ],
    correct: 1,
    difficulty: 'medium',
    explanation: "`-l` affiche les détails, `-a` inclut les fichiers cachés (commençant par .)"
  },
  {
    id: 10,
    question: "Que représente `~` dans un chemin Linux ?",
    options: [
      "Le répertoire racine /",
      "Le répertoire courant",
      "Le répertoire home de l'utilisateur",
      "Le répertoire parent"
    ],
    correct: 2,
    difficulty: 'medium',
    explanation: "`~` est un raccourci pour `/home/username`, le répertoire personnel."
  },
  // HARD (11-15)
  {
    id: 11,
    question: "Comment naviguer vers le répertoire parent ?",
    options: ["cd /", "cd ~", "cd ..", "cd -"],
    correct: 2,
    difficulty: 'hard',
    explanation: "`..` représente le répertoire parent. `cd ..` remonte d'un niveau."
  },
  {
    id: 12,
    question: "Quelle commande affiche l'utilisateur connecté ?",
    options: ["id", "user", "whoami", "echo $user"],
    correct: 2,
    difficulty: 'hard',
    explanation: "`whoami` affiche le nom de l'utilisateur actuellement connecté."
  },
  {
    id: 13,
    question: "Comment afficher l'historique des commandes ?",
    options: ["log", "history", "past", "echo history"],
    correct: 1,
    difficulty: 'hard',
    explanation: "`history` affiche la liste des commandes précédemment exécutées."
  },
  {
    id: 14,
    question: "Que fait `echo Hello World` ?",
    options: [
      "Crée un fichier Hello World",
      "Cherche Hello World dans les fichiers",
      "Affiche 'Hello World' dans le terminal",
      "Supprime Hello World"
    ],
    correct: 2,
    difficulty: 'hard',
    explanation: "`echo` affiche le texte passé en argument dans la sortie standard."
  },
  {
    id: 15,
    question: "Quelle touche permet l'autocomplétion dans le terminal ?",
    options: ["Ctrl+C", "Enter", "Tab", "Espace"],
    correct: 2,
    difficulty: 'hard',
    explanation: "La touche `Tab` complète automatiquement les commandes et les chemins."
  },
]

export function getQuizResult(score: number, total: number) {
  const percent = (score / total) * 100
  if (percent >= 80) return { badge: '🥇', label: 'Expert', color: '#f59e0b', message: 'Excellent ! Tu maîtrises Linux !' }
  if (percent >= 60) return { badge: '🥈', label: 'Intermédiaire', color: '#94a3b8', message: 'Bien joué ! Continue à pratiquer.' }
  return { badge: '🥉', label: 'Débutant', color: '#cd7f32', message: 'Continue ! Relis le cours et réessaie.' }
}