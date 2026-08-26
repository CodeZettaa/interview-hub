"use client";

import { QuestionCard } from "@/components/questions/question-card";
import type { InterviewQuestion } from "@/types/interview";

/** Thin client wrapper so server pages can render QuestionCard. */
export function QuestionCardClient({
  question,
  index,
  total,
  compact,
}: {
  question: InterviewQuestion;
  index?: number;
  total?: number;
  compact?: boolean;
}) {
  return (
    <QuestionCard
      question={question}
      index={index}
      total={total}
      compact={compact}
    />
  );
}
