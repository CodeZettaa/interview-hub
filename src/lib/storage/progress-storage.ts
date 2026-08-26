import type {
  ProgressState,
  QuestionProgressEntry,
  SelfAssessment,
  Technology,
  TopicProgressSummary,
} from "@/types/interview";
import type { InterviewQuestion } from "@/types/interview";
import { masteryFromAssessments } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/constants";

const EMPTY_PROGRESS: ProgressState = {
  entries: {},
  updatedAt: new Date(0).toISOString(),
};

export interface ProgressRepository {
  get(): ProgressState;
  set(state: ProgressState): void;
  markViewed(questionId: string): ProgressState;
  markCompleted(questionId: string, assessment: SelfAssessment): ProgressState;
  reset(): void;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function touchEntry(
  entries: Record<string, QuestionProgressEntry>,
  questionId: string,
): QuestionProgressEntry {
  const existing = entries[questionId];
  if (existing) return existing;
  return {
    questionId,
    viewed: false,
    completed: false,
    lastSeenAt: new Date().toISOString(),
    timesSeen: 0,
  };
}

export class LocalProgressRepository implements ProgressRepository {
  get(): ProgressState {
    return readJson(STORAGE_KEYS.progress, EMPTY_PROGRESS);
  }

  set(state: ProgressState): void {
    writeJson(STORAGE_KEYS.progress, {
      ...state,
      updatedAt: new Date().toISOString(),
    });
  }

  markViewed(questionId: string): ProgressState {
    const current = this.get();
    const entry = touchEntry(current.entries, questionId);
    current.entries[questionId] = {
      ...entry,
      viewed: true,
      timesSeen: entry.timesSeen + 1,
      lastSeenAt: new Date().toISOString(),
    };
    this.set(current);
    return current;
  }

  markCompleted(questionId: string, assessment: SelfAssessment): ProgressState {
    const current = this.get();
    const entry = touchEntry(current.entries, questionId);
    current.entries[questionId] = {
      ...entry,
      viewed: true,
      completed: true,
      assessment,
      lastSeenAt: new Date().toISOString(),
      timesSeen: Math.max(1, entry.timesSeen),
    };
    this.set(current);
    return current;
  }

  reset(): void {
    this.set(EMPTY_PROGRESS);
  }
}

export function summarizeTopicProgress(
  technology: Technology,
  questions: InterviewQuestion[],
  progress: ProgressState,
): TopicProgressSummary {
  const techQuestions = questions.filter((q) => q.technology === technology);
  let completed = 0;
  let viewed = 0;
  let easy = 0;
  let almost = 0;
  let review = 0;
  const assessments: Array<SelfAssessment | undefined> = [];

  for (const q of techQuestions) {
    const entry = progress.entries[q.id];
    if (entry?.viewed) viewed += 1;
    if (entry?.completed) completed += 1;
    if (entry?.assessment === "easy") easy += 1;
    if (entry?.assessment === "almost") almost += 1;
    if (entry?.assessment === "review") review += 1;
    assessments.push(entry?.assessment);
  }

  return {
    technology,
    total: techQuestions.length,
    completed,
    viewed,
    mastery: masteryFromAssessments(assessments.filter(Boolean)),
    easy,
    almost,
    review,
  };
}

let progressRepo: ProgressRepository | null = null;

export function getProgressRepository(): ProgressRepository {
  if (!progressRepo) progressRepo = new LocalProgressRepository();
  return progressRepo;
}
