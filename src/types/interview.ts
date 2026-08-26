export type Technology =
  | "html"
  | "css"
  | "javascript"
  | "typescript"
  | "scss"
  | "angular"
  | "react"
  | "nextjs"
  | "vue"
  | "nodejs"
  | "nestjs";

export type Difficulty = "fresh" | "junior" | "mid" | "senior" | "lead";

export type QuestionType =
  | "concept"
  | "coding"
  | "scenario"
  | "architecture"
  | "debugging"
  | "comparison"
  | "output"
  | "best-practice";

export type CareerPath = "frontend" | "backend" | "fullstack";

export type InterviewMode = "practice" | "mock";

export type QuestionCount = 10 | 20 | 30 | 50 | "full" | "random-mix";

export type SelfAssessment = "easy" | "almost" | "review";

export interface InterviewQuestion {
  id: string;
  technology: Technology;
  category: string;
  categorySlug: string;
  slug: string;
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
  example?: string;
  interviewTip?: string;
  commonMistake?: string;
  difficulty: Difficulty;
  type: QuestionType;
  tags: string[];
}

export interface TopicMeta {
  id: Technology;
  name: string;
  track: "frontend" | "backend" | "both";
  group: "fundamentals" | "frameworks" | "backend";
  description: string;
  targetCount: number;
  categories: { name: string; slug: string }[];
  color: string;
}

export interface QuestionFilters {
  track?: "frontend" | "backend";
  technologies?: Technology[];
  category?: string;
  difficulty?: Difficulty | Difficulty[];
  type?: QuestionType | QuestionType[];
  search?: string;
  ids?: string[];
  completed?: boolean;
  bookmarked?: boolean;
}

export interface UserPreferences {
  careerPath: CareerPath | null;
  technologies: Technology[];
  experienceLevel: Difficulty | null;
  preferredMode: InterviewMode | null;
  questionCount: QuestionCount | null;
  onboardingComplete: boolean;
  theme: "light" | "dark" | "system";
}

export interface QuestionProgressEntry {
  questionId: string;
  viewed: boolean;
  completed: boolean;
  assessment?: SelfAssessment;
  lastSeenAt: string;
  timesSeen: number;
}

export interface ProgressState {
  entries: Record<string, QuestionProgressEntry>;
  updatedAt: string;
}

export interface BookmarkState {
  ids: string[];
  updatedAt: string;
}

export interface MockSessionConfig {
  technologies: Technology[];
  difficulty: Difficulty | "balanced";
  count: number;
  timerSecondsPerQuestion: number;
}

export interface MockSessionResult {
  questionIds: string[];
  assessments: Record<string, SelfAssessment>;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
}

export interface TopicProgressSummary {
  technology: Technology;
  total: number;
  completed: number;
  viewed: number;
  mastery: number;
  easy: number;
  almost: number;
  review: number;
}
