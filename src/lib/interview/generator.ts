import { difficultyRank, pickBalanced, shuffle } from "@/lib/utils";
import type {
  Difficulty,
  InterviewQuestion,
  QuestionType,
  Technology,
} from "@/types/interview";

export interface GenerateInterviewOptions {
  technologies: Technology[];
  count: number;
  experienceLevel?: Difficulty | null;
  preferBalancedDifficulty?: boolean;
}

const TYPE_PRIORITY: QuestionType[] = [
  "concept",
  "comparison",
  "scenario",
  "debugging",
  "architecture",
  "coding",
  "output",
  "best-practice",
];

function nearbyDifficulties(level?: Difficulty | null): Difficulty[] {
  if (!level) return ["fresh", "junior", "mid", "senior", "lead"];
  const all: Difficulty[] = ["fresh", "junior", "mid", "senior", "lead"];
  const center = difficultyRank(level);
  return [...all].sort(
    (a, b) => Math.abs(difficultyRank(a) - center) - Math.abs(difficultyRank(b) - center),
  );
}

/**
 * Balanced interview generator — spreads across technologies, categories,
 * difficulties, and question types instead of pure random selection.
 */
export function generateBalancedInterview(
  pool: InterviewQuestion[],
  options: GenerateInterviewOptions,
): InterviewQuestion[] {
  const filtered = pool.filter((q) =>
    options.technologies.includes(q.technology),
  );
  if (filtered.length === 0) return [];

  const count = Math.min(options.count, filtered.length);
  const byTech = options.technologies.map((tech) =>
    shuffle(filtered.filter((q) => q.technology === tech)),
  );

  // First pass: technology balance
  let selected = pickBalanced(byTech, count);

  // If underfilled (uneven banks), fill from remaining
  if (selected.length < count) {
    const selectedIds = new Set(selected.map((q) => q.id));
    const remaining = shuffle(filtered.filter((q) => !selectedIds.has(q.id)));
    selected = [...selected, ...remaining.slice(0, count - selected.length)];
  }

  // Rebalance categories where possible
  selected = diversifyByKey(selected, filtered, (q) => q.categorySlug, count);

  // Prefer difficulty near experience level
  const difficultyOrder = nearbyDifficulties(options.experienceLevel);
  selected = diversifyByKey(
    selected,
    filtered,
    (q) => q.difficulty,
    count,
    difficultyOrder,
  );

  // Diversify types
  selected = diversifyByKey(
    selected,
    filtered,
    (q) => q.type,
    count,
    TYPE_PRIORITY,
  );

  return selected.slice(0, count);
}

function diversifyByKey(
  current: InterviewQuestion[],
  pool: InterviewQuestion[],
  keyFn: (q: InterviewQuestion) => string,
  count: number,
  preferredOrder?: string[],
): InterviewQuestion[] {
  const selectedIds = new Set(current.map((q) => q.id));
  const usedKeys = new Set(current.map(keyFn));
  const result = [...current];

  const candidates = shuffle(
    pool.filter((q) => !selectedIds.has(q.id)),
  ).sort((a, b) => {
    if (!preferredOrder) return 0;
    return (
      preferredOrder.indexOf(keyFn(a)) - preferredOrder.indexOf(keyFn(b))
    );
  });

  for (const candidate of candidates) {
    if (result.length >= count) break;
    const key = keyFn(candidate);
    if (usedKeys.has(key) && usedKeys.size < count / 2) continue;
    // Replace a duplicate-key item when possible
    const dupIndex = result.findIndex(
      (q, idx, arr) =>
        arr.findIndex((x) => keyFn(x) === keyFn(q)) !== idx &&
        keyFn(q) === keyFn(arr.find((x) => keyFn(x) === keyFn(q))!),
    );
    if (dupIndex >= 0 && !usedKeys.has(key)) {
      selectedIds.delete(result[dupIndex].id);
      result[dupIndex] = candidate;
      selectedIds.add(candidate.id);
      usedKeys.add(key);
    }
  }

  return result;
}
