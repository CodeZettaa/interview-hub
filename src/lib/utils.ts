import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Difficulty, SelfAssessment, Technology } from "@/types/interview";
import { TOPIC_MAP } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function technologyLabel(tech: Technology): string {
  return TOPIC_MAP[tech]?.name ?? tech;
}

export function questionPath(
  technology: Technology,
  categorySlug: string,
  slug: string,
): string {
  return `/questions/${technology}/${categorySlug}/${slug}`;
}

export function assessmentScore(assessment: SelfAssessment): number {
  switch (assessment) {
    case "easy":
      return 1;
    case "almost":
      return 0.55;
    case "review":
      return 0.15;
  }
}

export function masteryFromAssessments(
  assessments: Array<SelfAssessment | undefined>,
): number {
  if (assessments.length === 0) return 0;
  const scored = assessments.filter(Boolean) as SelfAssessment[];
  if (scored.length === 0) return 0;
  const total = scored.reduce((sum, a) => sum + assessmentScore(a), 0);
  return Math.round((total / scored.length) * 100);
}

export function difficultyRank(d: Difficulty): number {
  return { fresh: 1, junior: 2, mid: 3, senior: 4, lead: 5 }[d];
}

export function formatPercent(value: number): string {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickBalanced<T>(
  groups: T[][],
  count: number,
): T[] {
  const queues = groups.map((g) => [...g]);
  const result: T[] = [];
  let index = 0;
  while (result.length < count) {
    const available = queues.filter((q) => q.length > 0);
    if (available.length === 0) break;
    const queue = queues[index % queues.length];
    index += 1;
    if (!queue || queue.length === 0) continue;
    result.push(queue.shift() as T);
  }
  return result;
}
