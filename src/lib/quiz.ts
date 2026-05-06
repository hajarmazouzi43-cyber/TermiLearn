export interface QuizQuestion {
  id: number
  question: { fr: string, en: string }
  options: { fr: string, en: string }[]
  correct: number
  difficulty: 'easy' | 'medium' | 'hard'
  explanation: { fr: string, en: string }
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: { fr: "Quelle commande affiche le contenu d'un répertoire ?", en: "Which command lists directory contents?" },
    options: [
      { fr: "pwd", en: "pwd" }, { fr: "ls", en: "ls" }, { fr: "cd", en: "cd" }, { fr: "cat", en: "cat" }
    ],
    correct: 1,
    difficulty: 'easy',
    explanation: { fr: "`ls` liste les fichiers et dossiers du répertoire courant.", en: "`ls` lists files and folders in the current directory." }
  },
  {
    id: 2,
    question: { fr: "Quelle commande affiche le chemin du répertoire courant ?", en: "Which command shows the current directory path?" },
    options: [
      { fr: "ls", en: "ls" },
      { fr: "cd", en: "cd" },
      { fr: "pwd", en: "pwd" },
      { fr: "echo", en: "echo" }
    ],
    correct: 2,
    difficulty: 'easy',
    explanation: { fr: "`pwd` (Print Working Directory) affiche le chemin absolu.", en: "`pwd` (Print Working Directory) displays the absolute path." }
  },
  {
    id: 3,
    question: { fr: "Comment créer un fichier vide appelé 'notes.txt' ?", en: "How do you create an empty file named 'notes.txt'?" },
    options: [
      { fr: "mkdir notes.txt", en: "mkdir notes.txt" },
      { fr: "touch notes.txt", en: "touch notes.txt" },
      { fr: "cat notes.txt", en: "cat notes.txt" },
      { fr: "echo notes.txt", en: "echo notes.txt" }
    ],
    correct: 1,
    difficulty: 'easy',
    explanation: { fr: "`touch` crée un fichier vide ou met à jour l'horodatage.", en: "`touch` creates an empty file or updates the timestamp." }
  },
  {
    id: 4,
    question: { fr: "Quelle commande permet de lire le contenu d'un fichier ?", en: "Which command allows you to read a file's content?" },
    options: [
      { fr: "ls", en: "ls" },
      { fr: "pwd", en: "pwd" },
      { fr: "mkdir", en: "mkdir" },
      { fr: "cat", en: "cat" }
    ],
    correct: 3,
    difficulty: 'easy',
    explanation: { fr: "`cat` affiche le contenu d'un fichier dans le terminal.", en: "`cat` displays the content of a file in the terminal." }
  },
  {
    id: 5,
    question: { fr: "Comment créer un dossier appelé 'projects' ?", en: "How do you create a folder named 'projects'?" },
    options: [
      { fr: "touch projects", en: "touch projects" },
      { fr: "mkdir projects", en: "mkdir projects" },
      { fr: "cd projects", en: "cd projects" },
      { fr: "ls projects", en: "ls projects" }
    ],
    correct: 1,
    difficulty: 'easy',
    explanation: { fr: "`mkdir` (Make Directory) crée un nouveau répertoire.", en: "`mkdir` (Make Directory) creates a new directory." }
  },
  {
    id: 6,
    question: { fr: "Quelle commande copie 'a.txt' dans 'docs/' ?", en: "Which command copies 'a.txt' into 'docs/'?" },
    options: [
      { fr: "mv a.txt docs/", en: "mv a.txt docs/" },
      { fr: "cp a.txt docs/", en: "cp a.txt docs/" },
      { fr: "cat a.txt docs/", en: "cat a.txt docs/" },
      { fr: "ls a.txt docs/", en: "ls a.txt docs/" }
    ],
    correct: 1,
    difficulty: 'medium',
    explanation: { fr: "`cp` copie sans supprimer l'original.", en: "`cp` copies without removing the original file." }
  },
  {
    id: 7,
    question: { fr: "Comment supprimer un dossier et tout son contenu ?", en: "How do you delete a folder and all its content?" },
    options: [
      { fr: "rm folder", en: "rm folder" },
      { fr: "rm -r folder", en: "rm -r folder" },
      { fr: "delete folder", en: "delete folder" },
      { fr: "rmdir -f folder", en: "rmdir -f folder" }
    ],
    correct: 1,
    difficulty: 'medium',
    explanation: { fr: "`rm -r` supprime récursivement un dossier.", en: "`rm -r` recursively deletes a folder." }
  },
  {
    id: 8,
    question: { fr: "Quelle commande renomme 'old.txt' en 'new.txt' ?", en: "Which command renames 'old.txt' to 'new.txt'?" },
    options: [
      { fr: "cp old.txt new.txt", en: "cp old.txt new.txt" },
      { fr: "rename old.txt new.txt", en: "rename old.txt new.txt" },
      { fr: "mv old.txt new.txt", en: "mv old.txt new.txt" },
      { fr: "touch new.txt", en: "touch new.txt" }
    ],
    correct: 2,
    difficulty: 'medium',
    explanation: { fr: "`mv` déplace ou renomme un fichier.", en: "`mv` moves or renames a file." }
  },
  {
    id: 9,
    question: { fr: "Que fait la commande `ls -la` ?", en: "What does the `ls -la` command do?" },
    options: [
      { fr: "Liste seulement les dossiers", en: "Lists only folders" },
      { fr: "Liste tout avec détails et fichiers cachés", en: "Lists everything with details and hidden files" },
      { fr: "Supprime les fichiers cachés", en: "Deletes hidden files" },
      { fr: "Crée un fichier nommé -la", en: "Creates a file named -la" }
    ],
    correct: 1,
    difficulty: 'medium',
    explanation: { fr: "`-l` pour les détails, `-a` pour le 'all' (cachés inclus).", en: "`-l` for details, `-a` for 'all' (including hidden)." }
  },
  {
    id: 10,
    question: { fr: "Que représente `~` dans un chemin Linux ?", en: "What does `~` represent in a Linux path?" },
    options: [
      { fr: "Le répertoire racine /", en: "The root directory /" },
      { fr: "Le répertoire courant", en: "The current directory" },
      { fr: "Le répertoire home de l'utilisateur", en: "The user's home directory" },
      { fr: "Le répertoire parent", en: "The parent directory" }
    ],
    correct: 2,
    difficulty: 'medium',
    explanation: { fr: "`~` est un raccourci vers votre dossier personnel.", en: "`~` is a shortcut to your personal home folder." }
  },
  {
    id: 11,
    question: { fr: "Comment naviguer vers le répertoire parent ?", en: "How do you navigate to the parent directory?" },
    options: [
      { fr: "cd /", en: "cd /" },
      { fr: "cd ~", en: "cd ~" },
      { fr: "cd ..", en: "cd .." },
      { fr: "cd -", en: "cd -" }
    ],
    correct: 2,
    difficulty: 'hard',
    explanation: { fr: "`..` représente le niveau supérieur.", en: "`..` represents the level above." }
  },
  {
    id: 12,
    question: { fr: "Quelle commande affiche l'utilisateur connecté ?", en: "Which command displays the logged-in user?" },
    options: [
      { fr: "id", en: "id" },
      { fr: "user", en: "user" },
      { fr: "whoami", en: "whoami" },
      { fr: "echo $user", en: "echo $user" }
    ],
    correct: 2,
    difficulty: 'hard',
    explanation: { fr: "`whoami` affiche votre nom d'utilisateur.", en: "`whoami` shows your current username." }
  },
  {
    id: 13,
    question: { fr: "Comment afficher l'historique des commandes ?", en: "How do you display the command history?" },
    options: [
      { fr: "log", en: "log" },
      { fr: "history", en: "history" },
      { fr: "past", en: "past" },
      { fr: "echo history", en: "echo history" }
    ],
    correct: 1,
    difficulty: 'hard',
    explanation: { fr: "`history` liste les dernières commandes tapées.", en: "`history` lists the last commands typed." }
  },
  {
    id: 14,
    question: { fr: "Que fait `echo Hello World` ?", en: "What does `echo Hello World` do?" },
    options: [
      { fr: "Crée un fichier", en: "Creates a file" },
      { fr: "Cherche du texte", en: "Searches for text" },
      { fr: "Affiche le texte dans le terminal", en: "Displays text in the terminal" },
      { fr: "Supprime le texte", en: "Deletes the text" }
    ],
    correct: 2,
    difficulty: 'hard',
    explanation: { fr: "`echo` renvoie les arguments vers la sortie standard.", en: "`echo` repeats the arguments to the standard output." }
  },
  {
    id: 15,
    question: { fr: "Quelle touche permet l'autocomplétion ?", en: "Which key allows autocompletion?" },
    options: [
      { fr: "Ctrl+C", en: "Ctrl+C" }, { fr: "Enter", en: "Enter" }, { fr: "Tab", en: "Tab" }, { fr: "Espace", en: "Space" }
    ],
    correct: 2,
    difficulty: 'hard',
    explanation: { fr: "La touche `Tab` complète automatiquement les commandes.", en: "The `Tab` key completes commands automatically." }
  }
];

export function getQuizResult(score: number, total: number, lang: 'fr' | 'en') {
  const percent = (score / total) * 100;
  const content = {
    fr: {
      expert: { badge: '🥇', label: 'Expert', color: '#f59e0b', message: 'Excellent ! Tu maîtrises Linux !' },
      inter: { badge: '🥈', label: 'Intermédiaire', color: '#94a3b8', message: 'Bien joué ! Continue à pratiquer.' },
      beg: { badge: '🥉', label: 'Débutant', color: '#cd7f32', message: 'Continue ! Relis le cours et réessaie.' }
    },
    en: {
      expert: { badge: '🥇', label: 'Expert', color: '#f59e0b', message: 'Excellent! You master Linux!' },
      inter: { badge: '🥈', label: 'Intermediate', color: '#94a3b8', message: 'Well done! Keep practicing.' },
      beg: { badge: '🥉', label: 'Beginner', color: '#cd7f32', message: 'Keep going! Review the course.' }
    }
  };
  const res = content[lang];
  if (percent >= 80) return res.expert;
  if (percent >= 60) return res.inter;
  return res.beg;
}