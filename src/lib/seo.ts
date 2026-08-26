import type { Metadata } from "next";
import { BRAND, TOPIC_MAP } from "@/lib/constants";
import type { InterviewQuestion, Technology } from "@/types/interview";
import { technologyLabel } from "@/lib/utils";

/** Canonical production site URL — prefers explicit env, then Vercel host. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  "https://codezetta-interview-hub.vercel.app";

export const DEFAULT_KEYWORDS = [
  "interview questions",
  "frontend interview questions",
  "backend interview questions",
  "JavaScript interview questions",
  "TypeScript interview questions",
  "React interview questions",
  "Angular interview questions",
  "Next.js interview questions",
  "Node.js interview questions",
  "NestJS interview questions",
  "coding interview prep",
  "tech interview answers",
  "CodeZetta",
] as const;

export function absoluteUrl(path = "/"): string {
  if (!path.startsWith("/")) return `${SITE_URL}/${path}`;
  return `${SITE_URL}${path}`;
}

export function stripMarkdownLight(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, max: number): string {
  const clean = stripMarkdownLight(text);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  const fullKeywords = [...new Set([...keywords, ...DEFAULT_KEYWORDS])];

  return {
    title,
    description,
    keywords: fullKeywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: `${BRAND.name} ${BRAND.product}`,
      type,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function technologyPageCopy(technology: Technology, count: number) {
  const name = technologyLabel(technology);
  const topic = TOPIC_MAP[technology];
  return {
    h1: `${name} Interview Questions & Answers`,
    intro: `Prepare for ${name} technical interviews with ${count} curated questions and answers — from fundamentals to Tech Lead. ${topic.description} Each question includes a short interview answer, detailed explanation, examples, tips, and common mistakes.`,
    title: `${count} ${name} Interview Questions & Answers`,
    description: `Practice ${count} ${name} interview questions and answers for Fresh, Junior, Mid, Senior, and Tech Lead roles. Real scenarios covering ${topic.categories
      .slice(0, 5)
      .map((c) => c.name)
      .join(", ")}, and more.`,
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqPageJsonLd(
  questions: InterviewQuestion[],
  limit = 20,
): Record<string, unknown> {
  const slice = questions.slice(0, limit);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: slice.map((q) => ({
      "@type": "Question",
      name: stripMarkdownLight(q.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: stripMarkdownLight(
          `${q.shortAnswer} ${q.detailedAnswer}`.slice(0, 5000),
        ),
      },
    })),
  };
}

export function qaPageJsonLd(
  question: InterviewQuestion,
  path: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: stripMarkdownLight(question.question),
      text: stripMarkdownLight(question.question),
      answerCount: 1,
      dateCreated: "2026-01-01",
      author: {
        "@type": "Organization",
        name: BRAND.name,
      },
      acceptedAnswer: {
        "@type": "Answer",
        text: stripMarkdownLight(
          `${question.shortAnswer}\n\n${question.detailedAnswer}`,
        ),
        dateCreated: "2026-01-01",
        url: absoluteUrl(path),
        author: {
          "@type": "Organization",
          name: BRAND.name,
        },
        upvoteCount: 1,
      },
    },
  };
}

export function itemListJsonLd(
  technology: Technology,
  questions: InterviewQuestion[],
  path: string,
): Record<string, unknown> {
  const name = technologyLabel(technology);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${name} Interview Questions`,
    description: technologyPageCopy(technology, questions.length).description,
    url: absoluteUrl(path),
    numberOfItems: questions.length,
    itemListElement: questions.slice(0, 50).map((q, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(
        `/questions/${q.technology}/${q.categorySlug}/${q.slug}`,
      ),
      name: stripMarkdownLight(q.question),
    })),
  };
}
