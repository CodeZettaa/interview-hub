import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { QuestionCardClient } from "@/components/questions/question-card-client";
import { Button } from "@/components/ui/button";
import { TOPIC_MAP } from "@/lib/constants";
import { getQuestionsRepository } from "@/lib/repositories";
import { technologyLabel } from "@/lib/utils";
import type { Technology } from "@/types/interview";

type Props = {
  params: Promise<{ technology: string; category: string; slug: string }>;
};

function isTechnology(value: string): value is Technology {
  return value in TOPIC_MAP;
}

export async function generateStaticParams() {
  const repo = getQuestionsRepository();
  const questions = await repo.getQuestions();
  return questions.map((q) => ({
    technology: q.technology,
    category: q.categorySlug,
    slug: q.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { technology, category, slug } = await params;
  const repo = getQuestionsRepository();
  const question = await repo.getQuestionBySlug(technology, category, slug);
  if (!question) {
    return { title: "Question not found" };
  }
  const title =
    question.question.length > 70
      ? `${question.question.slice(0, 67)}…`
      : question.question;
  return {
    title: `${title} | CodeZetta`,
    description: question.shortAnswer.slice(0, 160),
  };
}

export default async function QuestionDetailPage({ params }: Props) {
  const { technology, category, slug } = await params;
  if (!isTechnology(technology)) notFound();

  const topic = TOPIC_MAP[technology];
  const catMeta = topic.categories.find((c) => c.slug === category);
  if (!catMeta) notFound();

  const repo = getQuestionsRepository();
  const question = await repo.getQuestionBySlug(technology, category, slug);
  if (!question) notFound();

  return (
    <div className="surface-grid">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-4 text-sm text-muted-foreground">
          <Link href={`/questions/${technology}`} className="hover:text-accent">
            {technologyLabel(technology)}
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/questions/${technology}/${category}`}
            className="hover:text-accent"
          >
            {catMeta.name}
          </Link>
        </p>

        <QuestionCardClient question={question} />

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/practice/${technology}`}>
            <Button>Practice more {technologyLabel(technology)}</Button>
          </Link>
          <Link href={`/questions/${technology}/${category}`}>
            <Button variant="outline">Back to {catMeta.name}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
