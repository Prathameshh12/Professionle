export type Answer = "yes" | "no" | "sometimes" | "not_really" | "irrelevant";

export type ResolutionSource = "override" | "cache" | "llm" | "tag" | "guess";

export type Difficulty = "easy" | "medium" | "hard";

export interface Job {
  id: string;
  title: string;
  synonyms: string[];
  difficulty: Difficulty;
  tags: string[];
  profile_prose: string;
  hint_1: string;
  hint_2: string;
}

export interface JobSeed {
  title: string;
  synonyms: string[];
  difficulty: Difficulty;
  tags: string[];
  profile_prose: string;
  hint_1: string;
  hint_2: string;
  faq: { question: string; answer: Answer }[];
}

export interface GameSession {
  id: string;
  job_id: string;
  user_id: string | null;
  no_count: number;
  total_questions: number;
  hints_revealed: number[];
  status: "active" | "won" | "lost";
  created_at: string;
  ended_at: string | null;
}

export interface AskResult {
  answer: Answer | null; // null when the question was itself a winning guess
  no_count: number;
  total_questions: number;
  status: GameSession["status"];
  hint?: string;
  is_correct_guess?: boolean;
  wrong_guess?: boolean;
  revealed_title?: string; // present when status becomes lost/won
}

export interface QuestionLogEntry {
  id: string;
  session_id: string;
  question_text: string;
  resolved_answer: Answer;
  was_guess_attempt: boolean;
  source: ResolutionSource;
  created_at: string;
}
