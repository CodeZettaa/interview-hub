import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { QuestionActions } from "@/components/questions/question-actions";
import { QuestionArticle } from "@/components/questions/question-article";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { TOPIC_MAP } from "@/lib/constants";
import { getQuestionsRepository } from "@/lib/repositories";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  qaPageJsonLd,
  truncate,
} from "@/lib/seo";
import { questionPath, technologyLabel } from "@/lib/utils";
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
  const name = technologyLabel(question.technology);
  const path = questionPath(
    question.technology,
    question.categorySlug,
    question.slug,
  );
  const qTitle = truncate(question.question, 70);

  return buildPageMetadata({
    title: `${qTitle} | ${name} Interview Question`,
    description: truncate(
      `${question.shortAnswer} — ${name} interview question with detailed answer.`,
      160,
    ),
    path,
    keywords: [
      `${name} interview question`,
      question.category,
      ...question.tags,
      `${name} interview questions and answers`,
    ],
    type: "article",
  });
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

  const path = questionPath(
    question.technology,
    question.categorySlug,
    question.slug,
  );
  const name = technologyLabel(technology);

  const related = await repo.getQuestions({
    technologies: [technology],
    category,
  });
  const siblings = related.filter((q) => q.id !== question.id).slice(0, 5);

  return (
    <div className="surface-grid">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Question Bank", path: "/questions" },
            { name: `${name} Interview Questions`, path: `/questions/${technology}` },
            {
              name: catMeta.name,
              path: `/questions/${technology}/${category}`,
            },
            { name: truncate(question.question, 48), path },
          ]),
          qaPageJsonLd(question, path),
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href={`/questions/${technology}`} className="hover:text-accent">
            {name}
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/questions/${technology}/${category}`}
            className="hover:text-accent"
          >
            {catMeta.name}
          </Link>
        </nav>

        <QuestionArticle question={question} />
        <QuestionActions question={question} />

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/practice/${technology}`}>
            <Button>Practice more {name}</Button>
          </Link>
          <Link href={`/questions/${technology}/${category}`}>
            <Button variant="outline">More {catMeta.name} questions</Button>
          </Link>
        </div>

        {siblings.length > 0 && (
          <section className="mt-10" aria-labelledby="related-q-heading">
            <h2
              id="related-q-heading"
              className="font-display text-lg font-semibold"
            >
              More {catMeta.name} {name} interview questions
            </h2>
            <ul className="mt-3 space-y-2">
              {siblings.map((q) => (
                <li key={q.id}>
                  <Link
                    href={questionPath(q.technology, q.categorySlug, q.slug)}
                    className="text-sm text-accent hover:underline"
                  >
                    {q.question}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
