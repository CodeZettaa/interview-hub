import type { Metadata } from "next";
import Link from "next/link";
import { QuestionBankClient } from "@/components/questions/question-bank-client";
import { JsonLd } from "@/components/seo/json-ld";
import { TOPICS } from "@/lib/constants";
import { getQuestionsRepository } from "@/lib/repositories";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "1,100+ Frontend & Backend Interview Questions & Answers",
  description:
    "Browse 1,100+ carefully organized interview questions and answers for JavaScript, TypeScript, React, Angular, Next.js, Vue, Node.js, NestJS, HTML, CSS, and SCSS — from Fresh to Tech Lead.",
  path: "/questions",
  keywords: [
    "interview questions and answers",
    "frontend interview questions",
    "backend interview questions",
    "full stack interview questions",
    "programming interview questions",
  ],
});

export default async function QuestionBankPage() {
  const repo = getQuestionsRepository();
  const counts = await repo.countByTechnology();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Interview Question Bank",
    description:
      "Curated frontend and backend interview questions with detailed answers.",
    url: absoluteUrl("/questions"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: TOPICS.length,
      itemListElement: TOPICS.map((topic, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${topic.name} Interview Questions`,
        url: absoluteUrl(`/questions/${topic.id}`),
      })),
    },
  };

  return (
    <div className="surface-grid">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Question Bank", path: "/questions" },
          ]),
          itemList,
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Question Bank</span>
        </nav>

        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Interview Questions & Answers
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
          Search {total.toLocaleString()}+ curated frontend and backend interview
          questions with short answers, detailed explanations, examples, and
          interview tips. Filter by technology, difficulty, and topic — or jump
          into a dedicated bank below.
        </p>

        <section className="mt-8" aria-labelledby="tech-banks-heading">
          <h2
            id="tech-banks-heading"
            className="font-display text-lg font-semibold"
          >
            Browse by technology
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((topic) => (
              <li key={topic.id}>
                <Link
                  href={`/questions/${topic.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm transition hover:border-accent/40"
                >
                  <span className="font-medium">
                    {topic.name} interview questions
                  </span>
                  <span className="text-muted-foreground">
                    {counts[topic.id] ?? 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12" aria-labelledby="filter-heading">
          <h2
            id="filter-heading"
            className="mb-4 font-display text-lg font-semibold"
          >
            Filter the full question bank
          </h2>
          <QuestionBankClient />
        </section>
      </div>
    </div>
  );
}
