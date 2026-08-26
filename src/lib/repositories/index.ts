import { TOPICS, TOPIC_MAP } from "@/lib/constants";
import {
  loadAllQuestions,
  loadQuestionsByTechnology,
} from "@/lib/questions/registry";
import type { QuestionsRepository } from "@/lib/repositories/questions-repository";
import type {
  InterviewQuestion,
  QuestionFilters,
  Technology,
  TopicMeta,
} from "@/types/interview";

function matchesFilters(
  question: InterviewQuestion,
  filters?: QuestionFilters,
): boolean {
  if (!filters) return true;

  if (filters.ids && !filters.ids.includes(question.id)) return false;

  if (filters.technologies?.length && !filters.technologies.includes(question.technology)) {
    return false;
  }

  if (filters.track) {
    const topic = TOPIC_MAP[question.technology];
    if (!topic) return false;
    if (filters.track === "frontend" && topic.track === "backend") return false;
    if (filters.track === "backend" && topic.track === "frontend") return false;
  }

  if (filters.category) {
    const value = filters.category.toLowerCase();
    if (
      question.category.toLowerCase() !== value &&
      question.categorySlug.toLowerCase() !== value
    ) {
      return false;
    }
  }

  if (filters.difficulty) {
    const list = Array.isArray(filters.difficulty)
      ? filters.difficulty
      : [filters.difficulty];
    if (!list.includes(question.difficulty)) return false;
  }

  if (filters.type) {
    const list = Array.isArray(filters.type) ? filters.type : [filters.type];
    if (!list.includes(question.type)) return false;
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    const haystack = [
      question.question,
      question.shortAnswer,
      question.detailedAnswer,
      question.category,
      ...question.tags,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  return true;
}

export class StaticQuestionsRepository implements QuestionsRepository {
  async getQuestions(filters?: QuestionFilters): Promise<InterviewQuestion[]> {
    return loadAllQuestions().filter((q) => matchesFilters(q, filters));
  }

  async getQuestion(id: string): Promise<InterviewQuestion | null> {
    return loadAllQuestions().find((q) => q.id === id) ?? null;
  }

  async getQuestionBySlug(
    technology: string,
    categorySlug: string,
    slug: string,
  ): Promise<InterviewQuestion | null> {
    return (
      loadAllQuestions().find(
        (q) =>
          q.technology === technology &&
          q.categorySlug === categorySlug &&
          q.slug === slug,
      ) ?? null
    );
  }

  async getTopics(): Promise<TopicMeta[]> {
    return TOPICS;
  }

  async getCategories(technology: string) {
    return TOPIC_MAP[technology as Technology]?.categories ?? [];
  }

  async getQuestionOfTheDay(date = new Date()): Promise<InterviewQuestion | null> {
    const questions = loadAllQuestions();
    if (questions.length === 0) return null;
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return questions[hash % questions.length] ?? null;
  }

  async countByTechnology(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const topic of TOPICS) {
      counts[topic.id] = loadQuestionsByTechnology(topic.id).length;
    }
    return counts;
  }
}

let repository: QuestionsRepository | null = null;

export function getQuestionsRepository(): QuestionsRepository {
  if (!repository) {
    repository = new StaticQuestionsRepository();
  }
  return repository;
}

/** Swap implementation later (e.g. ApiQuestionsRepository). */
export function setQuestionsRepository(next: QuestionsRepository) {
  repository = next;
}
