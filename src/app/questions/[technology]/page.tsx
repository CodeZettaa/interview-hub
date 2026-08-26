import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TOPIC_MAP, TOPICS } from "@/lib/constants";
import { getQuestionsRepository } from "@/lib/repositories";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  faqPageJsonLd,
  itemListJsonLd,
  technologyPageCopy,
} from "@/lib/seo";
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
  const count = questions.length || TOPIC_MAP[technology].targetCount;
  const copy = technologyPageCopy(technology, count);
  const name = technologyLabel(technology);

  return buildPageMetadata({
    title: copy.title,
    description: copy.description,
    path: `/questions/${technology}`,
    keywords: [
      `${name} interview questions`,
      `${name} interview questions and answers`,
      `${name} coding interview`,
      `${name} technical interview`,
    ],
  });
}

export default async function TechnologyQuestionsPage({ params }: Props) {
  const { technology } = await params;
  if (!isTechnology(technology)) notFound();

  const repo = getQuestionsRepository();
  const questions = await repo.getQuestions({ technologies: [technology] });
  const topic = TOPIC_MAP[technology];
  const categories = topic.categories;
  const name = technologyLabel(technology);
  const copy = technologyPageCopy(technology, questions.length || topic.targetCount);
  const path = `/questions/${technology}`;

  const byCategory = new Map<string, typeof questions>();
  for (const q of questions) {
    const list = byCategory.get(q.categorySlug) ?? [];
    list.push(q);
    byCategory.set(q.categorySlug, list);
  }

  const related = TOPICS.filter(
    (t) => t.id !== technology && (t.group === topic.group || t.track === topic.track),
  ).slice(0, 6);

  return (
    <div className="surface-grid">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Question Bank", path: "/questions" },
            { name: `${name} Interview Questions`, path },
          ]),
          itemListJsonLd(technology, questions, path),
          ...(questions.length > 0 ? [faqPageJsonLd(questions, 15)] : []),
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/questions" className="hover:text-accent">
            Question Bank
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{name}</span>
        </nav>

        <div
          className="mb-3 h-2 w-12 rounded-full"
          style={{ backgroundColor: topic.color }}
        />
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {copy.h1}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {copy.intro}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/practice/${technology}`}>
            <Button>Practice {name}</Button>
          </Link>
          <Link href="/questions">
            <Button variant="outline">Browse all technologies</Button>
          </Link>
        </div>

        <section className="mt-10" aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="font-display text-xl font-semibold">
            {name} interview topics
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Jump into a category — each bank is independent and interview-focused.
          </p>
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
                          {count} {name} question{count === 1 ? "" : "s"}
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
          <section className="mt-12 space-y-8" aria-labelledby="all-questions-heading">
            <h2 id="all-questions-heading" className="font-display text-xl font-semibold">
              All {name} interview questions
            </h2>
            {categories.map((cat) => {
              const list = byCategory.get(cat.slug) ?? [];
              if (list.length === 0) return null;
              return (
                <div key={cat.slug}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold">
                      {cat.name} interview questions
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

        {related.length > 0 && (
          <section className="mt-14" aria-labelledby="related-heading">
            <h2 id="related-heading" className="font-display text-xl font-semibold">
              Related interview question banks
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {related.map((t) => (
                <Link
                  key={t.id}
                  href={`/questions/${t.id}`}
                  className="rounded-xl border border-border bg-card px-3 py-2 text-sm transition hover:border-accent/40"
                >
                  {t.name} interview questions
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
