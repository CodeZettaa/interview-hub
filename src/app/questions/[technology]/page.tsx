import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TOPIC_MAP, TOPICS } from "@/lib/constants";
import { getQuestionsRepository } from "@/lib/repositories";
import { questionPath, technologyLabel } from "@/lib/utils";
import type { Technology } from "@/types/interview";

type Props = {
  params: Promise<{ technology: string }>;
};

function isTechnology(value: string): value is Technology {
  return value in TOPIC_MAP;
}

export async function generateStaticParams() {
  return TOPICS.map((t) => ({ technology: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { technology } = await params;
  if (!isTechnology(technology)) {
    return { title: "Technology not found" };
  }
  const repo = getQuestionsRepository();
  const questions = await repo.getQuestions({ technologies: [technology] });
  const name = technologyLabel(technology);
  const count = questions.length || TOPIC_MAP[technology].targetCount;
  return {
    title: `${count} ${name} Interview Questions & Answers | CodeZetta`,
    description: `Practice ${name} interview questions with short answers, detailed explanations, and interview tips.`,
  };
}

export default async function TechnologyQuestionsPage({ params }: Props) {
  const { technology } = await params;
  if (!isTechnology(technology)) notFound();

  const repo = getQuestionsRepository();
  const questions = await repo.getQuestions({ technologies: [technology] });
  const topic = TOPIC_MAP[technology];
  const categories = topic.categories;

  const byCategory = new Map<string, typeof questions>();
  for (const q of questions) {
    const list = byCategory.get(q.categorySlug) ?? [];
    list.push(q);
    byCategory.set(q.categorySlug, list);
  }

  return (
    <div className="surface-grid">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div
          className="mb-3 h-2 w-12 rounded-full"
          style={{ backgroundColor: topic.color }}
        />
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {technologyLabel(technology)} Interview Questions
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {topic.description} {questions.length} questions available
          {questions.length === 0
            ? " — bank coming soon."
            : "."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/practice/${technology}`}>
            <Button>Practice {technologyLabel(technology)}</Button>
          </Link>
          <Link href="/questions">
            <Button variant="outline">Back to Question Bank</Button>
          </Link>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Categories</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const count = byCategory.get(cat.slug)?.length ?? 0;
              return (
                <Link
                  key={cat.slug}
                  href={`/questions/${technology}/${cat.slug}`}
                >
                  <Card className="h-full transition hover:-translate-y-0.5 hover:border-accent/40">
                    <CardContent className="flex items-center justify-between gap-3 p-5">
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {count} question{count === 1 ? "" : "s"}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {questions.length > 0 && (
          <section className="mt-12 space-y-8">
            <h2 className="font-display text-xl font-semibold">All questions</h2>
            {categories.map((cat) => {
              const list = byCategory.get(cat.slug) ?? [];
              if (list.length === 0) return null;
              return (
                <div key={cat.slug}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold">
                      {cat.name}
                    </h3>
                    <Link
                      href={`/questions/${technology}/${cat.slug}`}
                      className="text-sm text-accent hover:underline"
                    >
                      View category
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {list.map((q) => (
                      <Link
                        key={q.id}
                        href={questionPath(
                          q.technology,
                          q.categorySlug,
                          q.slug,
                        )}
                        className="block"
                      >
                        <Card className="transition hover:border-accent/40">
                          <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-medium leading-snug">
                              {q.question}
                            </p>
                            <Badge className="shrink-0">{q.difficulty}</Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
