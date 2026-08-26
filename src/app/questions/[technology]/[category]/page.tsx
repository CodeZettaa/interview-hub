import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  TOPIC_MAP,
  TOPICS,
} from "@/lib/constants";
import { getQuestionsRepository } from "@/lib/repositories";
import { questionPath, technologyLabel } from "@/lib/utils";
import type { Technology } from "@/types/interview";

type Props = {
  params: Promise<{ technology: string; category: string }>;
};

function isTechnology(value: string): value is Technology {
  return value in TOPIC_MAP;
}

export async function generateStaticParams() {
  return TOPICS.flatMap((topic) =>
    topic.categories.map((cat) => ({
      technology: topic.id,
      category: cat.slug,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { technology, category } = await params;
  if (!isTechnology(technology)) {
    return { title: "Category not found" };
  }
  const topic = TOPIC_MAP[technology];
  const cat = topic.categories.find((c) => c.slug === category);
  const name = technologyLabel(technology);
  const catName = cat?.name ?? category;
  return {
    title: `${catName} — ${name} Interview Questions | CodeZetta`,
    description: `Browse ${catName} ${name} interview questions with answers and explanations.`,
  };
}

export default async function CategoryQuestionsPage({ params }: Props) {
  const { technology, category } = await params;
  if (!isTechnology(technology)) notFound();

  const topic = TOPIC_MAP[technology];
  const catMeta = topic.categories.find((c) => c.slug === category);
  if (!catMeta) notFound();

  const repo = getQuestionsRepository();
  const questions = await repo.getQuestions({
    technologies: [technology],
    category,
  });

  return (
    <div className="surface-grid">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm text-muted-foreground">
          <Link href={`/questions/${technology}`} className="hover:text-accent">
            {technologyLabel(technology)}
          </Link>
          <span className="mx-2">/</span>
          {catMeta.name}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {catMeta.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {questions.length} {technologyLabel(technology)} question
          {questions.length === 1 ? "" : "s"} in this category.
        </p>
        <div className="mt-5">
          <Link href={`/questions/${technology}`}>
            <Button variant="outline">All {technologyLabel(technology)} categories</Button>
          </Link>
        </div>

        <div className="mt-8 space-y-2">
          {questions.map((q) => (
            <Link
              key={q.id}
              href={questionPath(q.technology, q.categorySlug, q.slug)}
              className="block"
            >
              <Card className="transition hover:border-accent/40">
                <CardContent className="space-y-3 p-5">
                  <p className="font-medium leading-snug">{q.question}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge>{DIFFICULTY_LABELS[q.difficulty]}</Badge>
                    <Badge>{QUESTION_TYPE_LABELS[q.type]}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {questions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No questions in this category yet.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
