import type {
  InterviewQuestion,
  QuestionFilters,
  TopicMeta,
} from "@/types/interview";

export interface QuestionsRepository {
  getQuestions(filters?: QuestionFilters): Promise<InterviewQuestion[]>;
  getQuestion(id: string): Promise<InterviewQuestion | null>;
  getQuestionBySlug(
    technology: string,
    categorySlug: string,
    slug: string,
  ): Promise<InterviewQuestion | null>;
  getTopics(): Promise<TopicMeta[]>;
  getCategories(technology: string): Promise<{ name: string; slug: string }[]>;
  getQuestionOfTheDay(date?: Date): Promise<InterviewQuestion | null>;
  countByTechnology(): Promise<Record<string, number>>;
}
