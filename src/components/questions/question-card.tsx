"use client";

import { useEffect, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Copy,
  Link2,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppState } from "@/components/layout/app-state-provider";
import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
} from "@/lib/constants";
import { questionPath, technologyLabel } from "@/lib/utils";
import type { InterviewQuestion, SelfAssessment } from "@/types/interview";

interface QuestionCardProps {
  question: InterviewQuestion;
  index?: number;
  total?: number;
  autoMarkViewed?: boolean;
  compact?: boolean;
}

export function QuestionCard({
  question,
  index,
  total,
  autoMarkViewed = true,
  compact = false,
}: QuestionCardProps) {
  const {
    markViewed,
    markCompleted,
    toggleBookmark,
    isBookmarked,
    progress,
  } = useAppState();
  const [showAnswer, setShowAnswer] = useState(false);
  const [copied, setCopied] = useState(false);
  const entry = progress.entries[question.id];
  const bookmarked = isBookmarked(question.id);

  useEffect(() => {
    if (autoMarkViewed) markViewed(question.id);
  }, [autoMarkViewed, markViewed, question.id]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${questionPath(question.technology, question.categorySlug, question.slug)}`
      : questionPath(question.technology, question.categorySlug, question.slug);

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function assess(value: SelfAssessment) {
    markCompleted(question.id, value);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {typeof index === "number" && typeof total === "number" && (
              <Badge>Question {index} / {total}</Badge>
            )}
            <Badge tone="accent">{technologyLabel(question.technology)}</Badge>
            <Badge>{DIFFICULTY_LABELS[question.difficulty]}</Badge>
            <Badge>{QUESTION_TYPE_LABELS[question.type]}</Badge>
            <Badge tone="default">{question.category}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleBookmark(question.id)}
              aria-label="Bookmark"
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-accent" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
          </div>
        </div>
        <h2 className="font-display text-xl font-semibold leading-snug sm:text-2xl">
          {question.question}
        </h2>
      </CardHeader>

      <CardContent className="space-y-5">
        {!showAnswer ? (
          <Button onClick={() => setShowAnswer(true)}>Show Answer</Button>
        ) : (
          <div className="space-y-5 animate-fade-up">
            <section className="rounded-2xl border border-border bg-accent-soft/40 p-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">
                Short Interview Answer
              </h3>
              <p className="text-[15px] leading-relaxed">{question.shortAnswer}</p>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Detailed Explanation
              </h3>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
                {question.detailedAnswer}
              </p>
            </section>

            {question.example && (
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Example
                </h3>
                <pre className="code-block overflow-x-auto rounded-2xl border border-border p-4 text-sm leading-relaxed">
                  <code>{question.example}</code>
                </pre>
              </section>
            )}

            {(question.interviewTip || question.commonMistake) && (
              <div className="grid gap-3 md:grid-cols-2">
                {question.interviewTip && (
                  <div className="rounded-2xl border border-border bg-muted/50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Lightbulb className="h-4 w-4 text-warning" />
                      Interview Tip
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {question.interviewTip}
                    </p>
                  </div>
                )}
                {question.commonMistake && (
                  <div className="rounded-2xl border border-border bg-muted/50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <AlertTriangle className="h-4 w-4 text-danger" />
                      Common Mistake
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {question.commonMistake}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!compact && (
              <section className="rounded-2xl border border-dashed border-border p-4">
                <p className="mb-3 text-sm font-medium">Did you know this answer?</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={entry?.assessment === "easy" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => assess("easy")}
                  >
                    Yes, Easy
                  </Button>
                  <Button
                    variant={entry?.assessment === "almost" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => assess("almost")}
                  >
                    Almost
                  </Button>
                  <Button
                    variant={entry?.assessment === "review" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => assess("review")}
                  >
                    Need to Review
                  </Button>
                </div>
              </section>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {question.tags.map((tag) => (
            <Badge key={tag}>#{tag}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
