"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Copy, Share2 } from "lucide-react";
import { QuestionCard } from "@/components/questions/question-card";
import { useAppState } from "@/components/layout/app-state-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getQuestionsRepository } from "@/lib/repositories";
import { questionPath, technologyLabel } from "@/lib/utils";
import type { InterviewQuestion } from "@/types/interview";

export default function DailyChallengePage() {
  const { markCompleted, progress, hydrated } = useAppState();
  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getQuestionsRepository()
      .getQuestionOfTheDay()
      .then((q) => {
        if (!cancelled) {
          setQuestion(q);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function copyLink() {
    if (!question) return;
    const path = questionPath(
      question.technology,
      question.categorySlug,
      question.slug,
    );
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function share() {
    if (!question) return;
    const path = questionPath(
      question.technology,
      question.categorySlug,
      question.slug,
    );
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    if (navigator.share) {
      await navigator.share({
        title: "CodeZetta Daily Challenge",
        text: question.question,
        url,
      });
      return;
    }
    await copyLink();
  }

  if (loading || !hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
        Loading today’s challenge…
      </div>
    );
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No questions available for the daily challenge yet.
          </CardContent>
        </Card>
      </div>
    );
  }

  const entry = progress.entries[question.id];
  const done = !!entry?.completed;

  return (
    <div className="surface-grid">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent">
              <CalendarDays className="h-3.5 w-3.5" />
              Question of the Day
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Daily Challenge
            </h1>
            <p className="mt-2 text-muted-foreground">
              One focused question to keep your interview edge sharp.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="accent">
                {technologyLabel(question.technology)}
              </Badge>
              <Badge>{question.category}</Badge>
              {done && <Badge tone="success">Completed today</Badge>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void copyLink()}>
              {copied ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => void share()}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <QuestionCard question={question} />

        <div className="mt-6 flex flex-wrap gap-2">
          {!done ? (
            <Button onClick={() => markCompleted(question.id, "almost")}>
              Mark completed
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              <CheckCircle2 className="h-4 w-4" />
              Marked complete
            </Button>
          )}
          <Link href={questionPath(question.technology, question.categorySlug, question.slug)}>
            <Button variant="outline">Open shareable page</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
