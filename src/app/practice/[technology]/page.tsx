"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QuestionCard } from "@/components/questions/question-card";
import { useAppState } from "@/components/layout/app-state-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { TOPIC_MAP } from "@/lib/constants";
import { generateBalancedInterview } from "@/lib/interview/generator";
import { resolveQuestionCount } from "@/lib/interview/session";
import { getQuestionsRepository } from "@/lib/repositories";
import { technologyLabel } from "@/lib/utils";
import type { InterviewQuestion, Technology } from "@/types/interview";

export default function PracticeTechnologyPage() {
  const params = useParams<{ technology: string }>();
  const technology = params.technology as Technology;
  const { preferences, hydrated } = useAppState();
  const [queue, setQueue] = useState<InterviewQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const valid = technology in TOPIC_MAP;

  const buildQueue = useCallback(async () => {
    if (!valid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const repo = getQuestionsRepository();
    const pool = await repo.getQuestions({ technologies: [technology] });
    const count = resolveQuestionCount(preferences.questionCount, pool.length);
    const selected = generateBalancedInterview(pool, {
      technologies: [technology],
      count,
      experienceLevel: preferences.experienceLevel,
      preferBalancedDifficulty: true,
    });
    setQueue(selected);
    setIndex(0);
    setLoading(false);
  }, [preferences.experienceLevel, preferences.questionCount, technology, valid]);

  useEffect(() => {
    if (!hydrated) return;
    void buildQueue();
  }, [hydrated, buildQueue]);

  if (!valid) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        Unknown technology.
      </div>
    );
  }

  if (!hydrated || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
        Preparing {technologyLabel(technology)} practice…
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-muted-foreground">
              No {technologyLabel(technology)} questions available yet.
            </p>
            <Link href="/practice">
              <Button variant="outline">Back to Practice</Button>
            </Link>
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
            <h1 className="font-display text-2xl font-semibold">
              Practice {technologyLabel(technology)}
            </h1>
            <p className="text-sm text-muted-foreground">
              Question {index + 1} of {queue.length}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void buildQueue()}>
            Shuffle new set
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
