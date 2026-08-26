import type { QuestionCount } from "@/types/interview";

export const SESSION_QUESTIONS_KEY = "cz_session_questions";

export function resolveQuestionCount(
  count: QuestionCount | null | undefined,
  poolSize: number,
): number {
  if (poolSize <= 0) return 0;
  if (count === "full") return poolSize;
  if (count === "random-mix") {
    const options = [10, 20, 30, 50].filter((n) => n <= poolSize);
    if (options.length === 0) return poolSize;
    return options[Math.floor(Math.random() * options.length)]!;
  }
  if (typeof count === "number") return Math.min(count, poolSize);
  return Math.min(20, poolSize);
}

export function storeSessionQuestions(ids: string[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_QUESTIONS_KEY, JSON.stringify(ids));
}

export function loadSessionQuestions(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_QUESTIONS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === "string")) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSessionQuestions() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_QUESTIONS_KEY);
}

export function consumeSessionQuestions(): string[] | null {
  const ids = loadSessionQuestions();
  if (ids) clearSessionQuestions();
  return ids;
}
