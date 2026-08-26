"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QuestionCard } from "@/components/questions/question-card";
import { useAppState } from "@/components/layout/app-state-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { generateBalancedInterview } from "@/lib/interview/generator";
import {
  consumeSessionQuestions,
  resolveQuestionCount,
} from "@/lib/interview/session";
import { getQuestionsRepository } from "@/lib/repositories";
import type { InterviewQuestion, Technology } from "@/types/interview";

export default function PracticePage() {
  const { preferences, hydrated } = useAppState();
  const [queue, setQueue] = useState<InterviewQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    const repo = getQuestionsRepository();
    const all = await repo.getQuestions();
    const sessionIds = consumeSessionQuestions();

    let selected: InterviewQuestion[];
    if (sessionIds?.length) {
      const map = new Map(all.map((q) => [q.id, q]));
      selected = sessionIds
        .map((id) => map.get(id))
        .filter((q): q is InterviewQuestion => !!q);
    } else {
      const techs =
        preferences.technologies.length > 0
          ? preferences.technologies
          : (["javascript"] as Technology[]);
      const pool = all.filter((q) => techs.includes(q.technology));
      const count = resolveQuestionCount(preferences.questionCount, pool.length);
      selected = generateBalancedInterview(pool, {
        technologies: techs,
        count,
        experienceLevel: preferences.experienceLevel,
        preferBalancedDifficulty: true,
      });
    }

    if (selected.length === 0) {
      setError(
        "No questions available for your selected stack yet. Try JavaScript or generate a new set.",
      );
    }
    setQueue(selected);
    setIndex(0);
    setLoading(false);
  }, [preferences]);

  useEffect(() => {
    if (!hydrated) return;
    void buildQueue();
  }, [hydrated, buildQueue]);

  if (!hydrated || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
        Preparing practice session…
      </div>
    );
  }

  if (error || queue.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-muted-foreground">
              {error ?? "No questions in this session."}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/generate">
                <Button>Generate Interview</Button>
              </Link>
              <Link href="/questions/javascript">
                <Button variant="outline">Browse JavaScript</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const current = queue[index]!;
  const progress = ((index + 1) / queue.length) * 100;

  return (
    <div className="surface-grid">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold">Practice</h1>
            <p className="text-sm text-muted-foreground">
              Question {index + 1} of {queue.length}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void buildQueue()}>
            New session
          </Button>
        </div>
        <ProgressBar value={progress} className="mb-6" />

        <QuestionCard
          key={current.id}
          question={current}
          index={index + 1}
          total={queue.length}
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
            disabled={index >= queue.length - 1}
            onClick={() => setIndex((i) => Math.min(queue.length - 1, i + 1))}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
