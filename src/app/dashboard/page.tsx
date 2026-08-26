"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  CalendarDays,
  ClipboardList,
  Layers,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import { TopicCard } from "@/components/dashboard/topic-card";
import { useAppState } from "@/components/layout/app-state-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { DIFFICULTY_LABELS, TOPIC_MAP } from "@/lib/constants";
import { getQuestionsRepository } from "@/lib/repositories";
import { summarizeTopicProgress } from "@/lib/storage/progress-storage";
import { formatPercent, technologyLabel } from "@/lib/utils";
import type { InterviewQuestion } from "@/types/interview";

const QUICK_ACTIONS = [
  {
    href: "/generate",
    label: "Generate Interview",
    description: "Build a balanced set for your stack",
    icon: Wand2,
  },
  {
    href: "/mock",
    label: "Mock Interview",
    description: "Timed session with hidden answers",
    icon: Target,
  },
  {
    href: "/questions",
    label: "Question Bank",
    description: "Browse and filter every question",
    icon: ClipboardList,
  },
  {
    href: "/challenge",
    label: "Daily Challenge",
    description: "One question. Every day.",
    icon: CalendarDays,
  },
  {
    href: "/review",
    label: "Review Mode",
    description: "Revisit weak assessments first",
    icon: Bookmark,
  },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const { preferences, progress, hydrated } = useAppState();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!preferences.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }
    let cancelled = false;
    getQuestionsRepository()
      .getQuestions()
      .then((all) => {
        if (!cancelled) {
          setQuestions(all);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, preferences.onboardingComplete, router]);

  const selectedTechs = preferences.technologies;

  const topicSummaries = useMemo(
    () =>
      selectedTechs.map((tech) =>
        summarizeTopicProgress(tech, questions, progress),
      ),
    [selectedTechs, questions, progress],
  );

  const overall = useMemo(() => {
    const relevant = questions.filter((q) =>
      selectedTechs.includes(q.technology),
    );
    let completed = 0;
    let viewed = 0;
    let easy = 0;
    let almost = 0;
    let review = 0;
    for (const q of relevant) {
      const entry = progress.entries[q.id];
      if (entry?.viewed) viewed += 1;
      if (entry?.completed) completed += 1;
      if (entry?.assessment === "easy") easy += 1;
      if (entry?.assessment === "almost") almost += 1;
      if (entry?.assessment === "review") review += 1;
    }
    const assessed = easy + almost + review;
    const mastery =
      assessed === 0
        ? 0
        : Math.round(((easy * 1 + almost * 0.55 + review * 0.15) / assessed) * 100);
    return {
      total: relevant.length,
      completed,
      viewed,
      mastery,
      easy,
      almost,
      review,
    };
  }, [questions, progress, selectedTechs]);

  if (!hydrated || (!preferences.onboardingComplete && hydrated)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">
        Preparing your dashboard…
      </div>
    );
  }

  return (
    <div className="surface-grid">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Dashboard
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready for your next interview?
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Keep momentum with focused practice across your selected stack.
              JavaScript ships with 100 questions; other topics show 0 until
              their banks are added.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {preferences.careerPath && (
                <Badge tone="accent" className="capitalize">
                  {preferences.careerPath}
                </Badge>
              )}
              {preferences.experienceLevel && (
                <Badge>
                  {DIFFICULTY_LABELS[preferences.experienceLevel]}
                </Badge>
              )}
              {selectedTechs.map((tech) => (
                <Badge key={tech}>{technologyLabel(tech)}</Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/practice">
              <Button>Start Practice</Button>
            </Link>
            <Link href="/onboarding">
              <Button variant="outline">Edit Preferences</Button>
            </Link>
          </div>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Questions in stack", value: overall.total },
            { label: "Completed", value: `${overall.completed}` },
            { label: "Viewed", value: overall.viewed },
            { label: "Mastery", value: formatPercent(overall.mastery) },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 font-display text-2xl font-semibold text-accent">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-10 border-accent/20 bg-gradient-to-br from-accent-soft/50 to-card">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  Overall progress
                </h2>
                <p className="text-sm text-muted-foreground">
                  Easy {overall.easy} · Almost {overall.almost} · Review{" "}
                  {overall.review}
                </p>
              </div>
              <span className="font-display text-xl font-semibold">
                {formatPercent(overall.mastery)}
              </span>
            </div>
            <ProgressBar value={overall.mastery} />
          </CardContent>
        </Card>

        <section className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent" />
            <h2 className="font-display text-xl font-semibold">Quick actions</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="h-full transition hover:-translate-y-0.5 hover:border-accent/40">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <p className="font-medium">{action.label}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="font-display text-xl font-semibold">Your topics</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Progress across the technologies you chose in onboarding.
            </p>
          </div>
          {loading ? (
            <p className="text-muted-foreground">Loading topics…</p>
          ) : selectedTechs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No technologies selected.{" "}
                <Link href="/onboarding" className="text-accent underline">
                  Update your preferences
                </Link>
                .
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topicSummaries.map((summary) => (
                <TopicCard key={summary.technology} summary={summary} />
              ))}
            </div>
          )}
          {selectedTechs.some((t) => TOPIC_MAP[t] && !questions.some((q) => q.technology === t)) && (
            <p className="mt-4 text-sm text-muted-foreground">
              Topics with empty banks still appear here so you can track upcoming
              coverage as question sets are added.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
