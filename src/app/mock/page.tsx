"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, RotateCcw, Trophy } from "lucide-react";
import { QuestionCard } from "@/components/questions/question-card";
import { useAppState } from "@/components/layout/app-state-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import {
  CAREER_PATH_TECH,
  DIFFICULTY_LABELS,
  QUESTION_COUNTS,
  TOPIC_MAP,
} from "@/lib/constants";
import { generateBalancedInterview } from "@/lib/interview/generator";
import {
  consumeSessionQuestions,
  resolveQuestionCount,
} from "@/lib/interview/session";
import { getQuestionsRepository } from "@/lib/repositories";
import { summarizeTopicProgress } from "@/lib/storage/progress-storage";
import { formatPercent, technologyLabel } from "@/lib/utils";
import type {
  InterviewQuestion,
  SelfAssessment,
  Technology,
} from "@/types/interview";

type Phase = "setup" | "running" | "summary";

const TIMER_OPTIONS = [60, 90, 120, 180] as const;

export default function MockInterviewPage() {
  const { preferences, progress, hydrated } = useAppState();
  const [phase, setPhase] = useState<Phase>("setup");
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [count, setCount] = useState<number>(20);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [queue, setQueue] = useState<InterviewQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(90);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setTechnologies(
      preferences.technologies.length > 0
        ? preferences.technologies
        : CAREER_PATH_TECH.frontend.slice(0, 3),
    );
    const resolved = resolveQuestionCount(preferences.questionCount, 50);
    setCount(resolved || 20);
  }, [hydrated, preferences]);

  useEffect(() => {
    if (!hydrated) return;
    const ids = consumeSessionQuestions();
    if (!ids?.length) return;
    let cancelled = false;
    (async () => {
      const all = await getQuestionsRepository().getQuestions();
      const map = new Map(all.map((q) => [q.id, q]));
      const selected = ids
        .map((id) => map.get(id))
        .filter((q): q is InterviewQuestion => !!q);
      if (cancelled || selected.length === 0) return;
      setQueue(selected);
      setIndex(0);
      setRemaining(timerSeconds);
      setStartedAt(new Date().toISOString());
      setPhase("running");
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, timerSeconds]);

  useEffect(() => {
    if (phase !== "running") return;
    if (remaining <= 0) return;
    const id = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, remaining, index]);

  const startMock = useCallback(async () => {
    if (technologies.length === 0) return;
    setLoading(true);
    const all = await getQuestionsRepository().getQuestions();
    const pool = all.filter((q) => technologies.includes(q.technology));
    const selected = generateBalancedInterview(pool, {
      technologies,
      count: Math.min(count, pool.length),
      experienceLevel: preferences.experienceLevel,
      preferBalancedDifficulty: true,
    });
    setQueue(selected);
    setIndex(0);
    setRemaining(timerSeconds);
    setStartedAt(new Date().toISOString());
    setPhase("running");
    setLoading(false);
  }, [technologies, count, timerSeconds, preferences.experienceLevel]);

  function toggleTech(tech: Technology) {
    setTechnologies((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech],
    );
  }

  function nextQuestion() {
    if (index >= queue.length - 1) {
      setPhase("summary");
      return;
    }
    setIndex((i) => i + 1);
    setRemaining(timerSeconds);
  }

  const summary = useMemo(() => {
    if (phase !== "summary") return null;
    let easy = 0;
    let almost = 0;
    let review = 0;
    const assessments: SelfAssessment[] = [];
    for (const q of queue) {
      const a = progress.entries[q.id]?.assessment;
      if (a === "easy") easy += 1;
      if (a === "almost") almost += 1;
      if (a === "review") review += 1;
      if (a) assessments.push(a);
    }
    const totalAssessed = easy + almost + review;
    const strong = easy;
    const almostCount = almost;
    const needsReview = review;
    const overallLabel =
      totalAssessed === 0
        ? "Incomplete"
        : easy >= almost + review
          ? "Strong"
          : review > easy
            ? "Needs Review"
            : "Almost";

    const techs = [...new Set(queue.map((q) => q.technology))];
    const mastery = techs.map((tech) =>
      summarizeTopicProgress(tech, queue, progress),
    );
    const revise = mastery
      .filter((m) => m.review > 0 || m.mastery < 55)
      .map((m) => m.technology);

    return {
      easy: strong,
      almost: almostCount,
      review: needsReview,
      overallLabel,
      mastery,
      revise,
      durationSeconds: startedAt
        ? Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
        : 0,
    };
  }, [phase, queue, progress, startedAt]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
        Loading mock interview…
      </div>
    );
  }

  if (phase === "setup") {
    return (
      <div className="surface-grid">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Mock Interview
          </h1>
          <p className="mt-2 text-muted-foreground">
            Timed questions with answers hidden until you reveal them. Assess
            yourself after each answer.
          </p>

          <Card className="mt-8">
            <CardContent className="space-y-6 p-6">
              <div>
                <p className="mb-3 text-sm font-medium">Technologies</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(TOPIC_MAP) as Technology[]).map((tech) => {
                    const active = technologies.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleTech(tech)}
                        className={`rounded-xl border px-3 py-2 text-sm transition ${
                          active
                            ? "border-accent bg-accent-soft text-accent"
                            : "border-border hover:border-accent/40"
                        }`}
                      >
                        {technologyLabel(tech)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="text-muted-foreground">Question count</span>
                  <Select
                    value={String(count)}
                    onChange={(e) => setCount(Number(e.target.value))}
                  >
                    {QUESTION_COUNTS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-muted-foreground">
                    Timer per question
                  </span>
                  <Select
                    value={String(timerSeconds)}
                    onChange={(e) => setTimerSeconds(Number(e.target.value))}
                  >
                    {TIMER_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n} seconds
                      </option>
                    ))}
                  </Select>
                </label>
              </div>

              {preferences.experienceLevel && (
                <p className="text-sm text-muted-foreground">
                  Weighted toward{" "}
                  {DIFFICULTY_LABELS[preferences.experienceLevel]}.
                </p>
              )}

              <Button
                disabled={technologies.length === 0 || loading}
                onClick={() => void startMock()}
              >
                {loading ? "Building…" : "Start Mock Interview"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "summary" && summary) {
    return (
      <div className="surface-grid">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold">
                Mock complete
              </h1>
              <p className="text-muted-foreground">
                Result:{" "}
                <span className="font-medium text-foreground">
                  {summary.overallLabel}
                </span>
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Stat label="Strong" value={summary.easy} tone="success" />
            <Stat label="Almost" value={summary.almost} tone="warning" />
            <Stat label="Needs Review" value={summary.review} tone="danger" />
          </div>

          <Card className="mb-6">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-lg font-semibold">
                Per-technology mastery
              </h2>
              {summary.mastery.map((m) => (
                <div key={m.technology} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{technologyLabel(m.technology)}</span>
                    <span>{formatPercent(m.mastery)}</span>
                  </div>
                  <ProgressBar value={m.mastery} />
                </div>
              ))}
              {summary.revise.length > 0 && (
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-sm font-medium">Suggested revise topics</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {summary.revise.map((tech) => (
                      <Link key={tech} href={`/practice/${tech}`}>
                        <Badge tone="accent">{technologyLabel(tech)}</Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Session length ~{Math.max(1, Math.round(summary.durationSeconds / 60))}{" "}
                min · {queue.length} questions
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setPhase("setup");
                setQueue([]);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              New mock
            </Button>
            <Link href="/review">
              <Button variant="outline">Open Review Mode</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const current = queue[index];
  if (!current) return null;
  const progressPct = ((index + 1) / queue.length) * 100;
  const timerUrgent = remaining <= 15;

  return (
    <div className="surface-grid">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold">
              Mock Interview
            </h1>
            <p className="text-sm text-muted-foreground">
              Question {index + 1} of {queue.length}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${
              timerUrgent
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-border bg-card"
            }`}
          >
            <Clock className="h-4 w-4" />
            {Math.floor(remaining / 60)}:
            {String(remaining % 60).padStart(2, "0")}
          </div>
        </div>
        <ProgressBar value={progressPct} className="mb-6" />

        <QuestionCard
          key={current.id}
          question={current}
          index={index + 1}
          total={queue.length}
        />

        <div className="mt-6 flex justify-end">
          <Button onClick={nextQuestion}>
            {index >= queue.length - 1 ? "Finish" : "Next question"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "danger";
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold">
          <Badge tone={tone}>{value}</Badge>
        </p>
      </CardContent>
    </Card>
  );
}
