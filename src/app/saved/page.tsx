"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useAppState } from "@/components/layout/app-state-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
} from "@/lib/constants";
import { getQuestionsRepository } from "@/lib/repositories";
import { questionPath, technologyLabel } from "@/lib/utils";
import type { InterviewQuestion } from "@/types/interview";

export default function SavedPage() {
  const { bookmarks, hydrated, toggleBookmark } = useAppState();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
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

  const saved = useMemo(() => {
    const set = new Set(bookmarks.ids);
    return questions.filter((q) => set.has(q.id));
  }, [questions, bookmarks.ids]);

  if (!hydrated || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
        Loading saved questions…
      </div>
    );
  }

  return (
    <div className="surface-grid">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-2 inline-flex items-center gap-2 text-accent">
          <Bookmark className="h-5 w-5" />
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Saved Questions
        </h1>
        <p className="mt-2 text-muted-foreground">
          {saved.length} bookmarked question{saved.length === 1 ? "" : "s"}.
        </p>

        {saved.length === 0 ? (
          <Card className="mt-8">
            <CardContent className="space-y-4 p-8 text-center">
              <p className="text-muted-foreground">
                No bookmarks yet. Save questions from practice or the question
                bank.
              </p>
              <Link href="/questions">
                <Button variant="outline">Browse Question Bank</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 space-y-2">
            {saved.map((q) => (
              <Card key={q.id} className="transition hover:border-accent/40">
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <Link
                    href={questionPath(q.technology, q.categorySlug, q.slug)}
                    className="min-w-0 flex-1"
                  >
                    <p className="font-medium leading-snug">{q.question}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="accent">
                        {technologyLabel(q.technology)}
                      </Badge>
                      <Badge>{q.category}</Badge>
                      <Badge>{DIFFICULTY_LABELS[q.difficulty]}</Badge>
                      <Badge>{QUESTION_TYPE_LABELS[q.type]}</Badge>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(q.id)}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
