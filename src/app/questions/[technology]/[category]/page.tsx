import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
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
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  faqPageJsonLd,
} from "@/lib/seo";
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
  const repo = getQuestionsRepository();
  const questions = await repo.getQuestions({
    technologies: [technology],
    category,
  });
  const count = questions.length;

  return buildPageMetadata({
    title: `${catName} ${name} Interview Questions${count ? ` (${count})` : ""}`,
    description: `Browse ${count || ""} ${catName.toLowerCase()} ${name} interview questions and answers. Practice concepts, scenarios, and debugging prompts for real tech interviews.`.replace(
      /\s+/g,
      " ",
    ),
    path: `/questions/${technology}/${category}`,
    keywords: [
      `${name} ${catName} interview questions`,
      `${catName} interview questions`,
      `${name} interview questions and answers`,
    ],
  });
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
  const name = technologyLabel(technology);
  const path = `/questions/${technology}/${category}`;

  const otherCats = topic.categories.filter((c) => c.slug !== category).slice(0, 8);

  return (
    <div className="surface-grid">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Question Bank", path: "/questions" },
            { name: `${name} Interview Questions`, path: `/questions/${technology}` },
            { name: catMeta.name, path },
          ]),
          ...(questions.length > 0 ? [faqPageJsonLd(questions, 20)] : []),
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href={`/questions/${technology}`} className="hover:text-accent">
            {name}
          </Link>
          <span className="mx-2">/</span>
          {catMeta.name}
        </nav>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {catMeta.name} {name} Interview Questions
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {questions.length} curated {catMeta.name.toLowerCase()} interview
          questions for {name} — with short answers, detailed explanations, and
          interview tips. Ideal for Fresh through Tech Lead prep.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/questions/${technology}`}>
            <Button variant="outline">All {name} categories</Button>
          </Link>
          <Link href={`/practice/${technology}`}>
            <Button>Practice {name}</Button>
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

        {otherCats.length > 0 && (
          <section className="mt-12" aria-labelledby="other-cats">
            <h2 id="other-cats" className="font-display text-lg font-semibold">
              Other {name} interview topics
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {otherCats.map((c) => (
                <Link
                  key={c.slug}
                  href={`/questions/${technology}/${c.slug}`}
                  className="rounded-xl border border-border bg-card px-3 py-2 text-sm hover:border-accent/40"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
