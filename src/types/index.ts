export type Subject = {
  id: string;
  name: string;
  name_en: string;
  icon: string;
  color: string;
};

export type Problem = {
  id: string;
  subject_id: string;
  grade: 1 | 2 | 3;
  exam_term: string;
  category: string;
  passage: string | null;
  question: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  answer: "A" | "B" | "C" | "D";
  problem_format: "multiple_choice" | "short_answer";
  correct_text: string | null;
  accepted_answers: string[];
  explanation: string | null;
  difficulty: 1 | 2 | 3;
};

export type UserAnswer = {
  id: string;
  user_id: string;
  problem_id: string;
  is_correct: boolean;
  answered_at: string;
};

export type QuizResult = {
  problem: Problem;
  userAnswer: string;
  isCorrect: boolean;
};

export type SubjectStats = {
  subject_id: string;
  subject_name: string;
  total: number;
  correct: number;
  rate: number;
};
