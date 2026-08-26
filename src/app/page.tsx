import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Code2,
  Layers,
  Server,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { BRAND, TOPICS } from "@/lib/constants";
import { absoluteUrl, buildPageMetadata, SITE_URL } from "@/lib/seo";

const stats = [
  { label: "Interview Questions", value: "1100+" },
  { label: "Technologies", value: "11" },
  { label: "Experience Levels", value: "5" },
];

export const metadata: Metadata = buildPageMetadata({
  title: `${BRAND.product} — ${BRAND.tagline}`,
  description: BRAND.subtitle,
  path: "/",
  keywords: [
    "tech interview prep",
    "software engineer interview questions",
    "frontend interview prep",
    "backend interview prep",
  ],
});

export default function HomePage() {
  const fundamentals = TOPICS.filter((t) => t.group === "fundamentals");
  const frameworks = TOPICS.filter((t) => t.group === "frameworks");
  const backend = TOPICS.filter((t) => t.group === "backend");

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${BRAND.name} ${BRAND.product}`,
    url: SITE_URL,
    description: BRAND.subtitle,
    publisher: {
      "@type": "Organization",
      name: BRAND.name,
      url: SITE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/questions")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="surface-grid">
      <JsonLd data={websiteLd} />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-pulse-soft" />
        <div className="pointer-events-none absolute -right-16 top-40 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <p className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            by {BRAND.name}
          </p>
          <h1 className="animate-fade-up font-display max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl sm:leading-[1.05]">
            {BRAND.tagline}
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl"
            style={{ animationDelay: "80ms" }}
          >
            Frontend. Backend. Frameworks. Real Interview Questions.
          </p>
          <p
            className="animate-fade-up mt-3 max-w-2xl text-base text-muted-foreground"
            style={{ animationDelay: "120ms" }}
          >
            {BRAND.subtitle}
          </p>

          <div
            className="animate-fade-up mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "160ms" }}
          >
            <Link href="/onboarding">
              <Button size="lg">
                Start Preparing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/questions">
              <Button size="lg" variant="outline">
                Explore Questions
              </Button>
            </Link>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card/80">
                <CardContent className="p-5">
                  <p className="font-display text-3xl font-semibold text-accent">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Interview questions by technology
          </h2>
          <p className="mt-2 text-muted-foreground">
            Independent question banks for every technology — built for searches
            like &ldquo;React interview questions&rdquo; and &ldquo;Node.js
            interview questions and answers.&rdquo;
          </p>
        </div>

        <TechGroup
          title="Frontend Fundamentals"
          icon={<Code2 className="h-4 w-4" />}
          topics={fundamentals}
        />
        <TechGroup
          title="Frontend Frameworks"
          icon={<Layers className="h-4 w-4" />}
          topics={frameworks}
          className="mt-8"
        />
        <TechGroup
          title="Backend"
          icon={<Server className="h-4 w-4" />}
          topics={backend}
          className="mt-8"
        />
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6">
          {[
            {
              icon: Target,
              title: "Personalized prep",
              body: "Path, technologies, and experience level shape every practice session.",
            },
            {
              icon: Sparkles,
              title: "Interview-quality answers",
              body: "Short answers, deep explanations, examples, tips, and common mistakes.",
            },
            {
              icon: Layers,
              title: "Progress that compounds",
              body: "Mastery scoring, bookmarks, review mode, and balanced mock interviews.",
            },
          ].map((item) => (
            <div key={item.title}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Card className="overflow-hidden border-accent/30 bg-gradient-to-br from-accent-soft/80 to-card">
          <CardContent className="flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                Ready for your next interview?
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Start with a guided setup, then practice with real interview
                scenarios across 1,100+ questions.
              </p>
            </div>
            <Link href="/onboarding">
              <Button size="lg">
                Start Preparing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function TechGroup({
  title,
  icon,
  topics,
  className,
}: {
  title: string;
  icon: ReactNode;
  topics: typeof TOPICS;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {topics.map((topic) => (
          <Link key={topic.id} href={`/questions/${topic.id}`}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:border-accent/40">
              <CardContent className="p-4">
                <div
                  className="mb-3 h-1.5 w-8 rounded-full"
                  style={{ backgroundColor: topic.color }}
                />
                <p className="font-medium">{topic.name} interview questions</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {topic.targetCount} questions &amp; answers
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
