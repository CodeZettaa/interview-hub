"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QuestionCard } from "@/components/questions/question-card";
import { useAppState } from "@/components/layout/app-state-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { getQuestionsRepository } from "@/lib/repositories";
import { questionPath, technologyLabel } from "@/lib/utils";
import type { InterviewQuestion } from "@/types/interview";

export default function ReviewPage() {
  const { progress, hydrated } = useAppState();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"list" | "practice">("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const weak = useMemo(() => {
    const reviewFirst = questions.filter(
      (q) => progress.entries[q.id]?.assessment === "review",
    );
    const almost = questions.filter(
      (q) => progress.entries[q.id]?.assessment === "almost",
    );
    // Prefer "review", then "almost" as secondary weak set
    const ids = new Set(reviewFirst.map((q) => q.id));
    return [...reviewFirst, ...almost.filter((q) => !ids.has(q.id))];
  }, [questions, progress.entries]);

  if (!hydrated || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
        Loading review queue…
      </div>
    );
  }

  if (weak.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <h1 className="font-display text-2xl font-semibold">Review Mode</h1>
            <p className="text-muted-foreground">
              No weak questions yet. Mark answers as “Need to Review” or
              “Almost” during practice to build this list.
            </p>
            <Link href="/practice">
              <Button>Start Practice</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "practice") {
    const current = weak[index]!;
    const progressPct = ((index + 1) / weak.length) * 100;
    return (
      <div className="surface-grid">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold">
                Review practice
              </h1>
              <p className="text-sm text-muted-foreground">
                Question {index + 1} of {weak.length}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setMode("list")}>
              Back to list
            </Button>
          </div>
          <ProgressBar value={progressPct} className="mb-6" />
          <QuestionCard
            key={current.id}
            question={current}
            index={index + 1}
            total={weak.length}
          />
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              disabled={index >= weak.length - 1}
              onClick={() => setIndex((i) => Math.min(weak.length - 1, i + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const reviewOnly = weak.filter(
    (q) => progress.entries[q.id]?.assessment === "review",
  );

  return (
    <div className="surface-grid">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Review Mode
            </h1>
            <p className="mt-2 text-muted-foreground">
              {reviewOnly.length} marked “Need to Review”, plus almost-there
              questions — practice weak spots first.
            </p>
          </div>
          <Button
            onClick={() => {
              setIndex(0);
              setMode("practice");
            }}
          >
            Practice weak questions
          </Button>
        </div>

        <div className="space-y-2">
          {weak.map((q) => {
            const assessment = progress.entries[q.id]?.assessment;
            return (
              <Link
                key={q.id}
                href={questionPath(q.technology, q.categorySlug, q.slug)}
                className="block"
              >
                <Card className="transition hover:border-accent/40">
                  <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium leading-snug">{q.question}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {technologyLabel(q.technology)} · {q.category}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize">
                      {assessment}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
