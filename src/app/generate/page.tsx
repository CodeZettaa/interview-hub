"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { useAppState } from "@/components/layout/app-state-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  CAREER_PATH_TECH,
  DIFFICULTY_LABELS,
  QUESTION_COUNTS,
  TOPIC_MAP,
} from "@/lib/constants";
import { generateBalancedInterview } from "@/lib/interview/generator";
import {
  resolveQuestionCount,
  storeSessionQuestions,
} from "@/lib/interview/session";
import { getQuestionsRepository } from "@/lib/repositories";
import { cn, technologyLabel } from "@/lib/utils";
import type {
  CareerPath,
  Difficulty,
  InterviewQuestion,
  QuestionCount,
  Technology,
} from "@/types/interview";

const COUNT_OPTIONS: { value: QuestionCount; label: string }[] = [
  ...QUESTION_COUNTS.map((n) => ({ value: n as QuestionCount, label: String(n) })),
  { value: "full", label: "Full Topic" },
  { value: "random-mix", label: "Random Mix" },
];

export default function GenerateInterviewPage() {
  const router = useRouter();
  const { preferences, hydrated } = useAppState();
  const [careerPath, setCareerPath] = useState<CareerPath>("frontend");
  const [level, setLevel] = useState<Difficulty>("mid");
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [questionCount, setQuestionCount] = useState<QuestionCount>(20);
  const [preview, setPreview] = useState<InterviewQuestion[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setCareerPath(preferences.careerPath ?? "frontend");
    setLevel(preferences.experienceLevel ?? "mid");
    setTechnologies(
      preferences.technologies.length > 0
        ? preferences.technologies
        : CAREER_PATH_TECH.frontend.slice(0, 4),
    );
    setQuestionCount(preferences.questionCount ?? 20);
  }, [hydrated, preferences]);

  const available = useMemo(
    () => CAREER_PATH_TECH[careerPath],
    [careerPath],
  );

  function toggleTech(tech: Technology) {
    setTechnologies((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech],
    );
  }

  async function generate() {
    if (technologies.length === 0) return;
    setGenerating(true);
    const all = await getQuestionsRepository().getQuestions();
    const pool = all.filter((q) => technologies.includes(q.technology));
    const count = resolveQuestionCount(questionCount, pool.length);
    const selected = generateBalancedInterview(pool, {
      technologies,
      count,
      experienceLevel: level,
      preferBalancedDifficulty: true,
    });
    setPreview(selected);
    storeSessionQuestions(selected.map((q) => q.id));
    setGenerating(false);
  }

  function start(mode: "practice" | "mock") {
    if (preview.length === 0) return;
    storeSessionQuestions(preview.map((q) => q.id));
    router.push(mode === "practice" ? "/practice" : "/mock");
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
        Loading generator…
      </div>
    );
  }

  return (
    <div className="surface-grid">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-2 inline-flex items-center gap-2 text-accent">
          <Wand2 className="h-5 w-5" />
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Generate My Interview
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pick path, level, and stack — we balance technologies, categories, and
          difficulty for a realistic set.
        </p>

        <Card className="mt-8">
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm">
                <span className="text-muted-foreground">Career path</span>
                <Select
                  value={careerPath}
                  onChange={(e) => {
                    const path = e.target.value as CareerPath;
                    setCareerPath(path);
                    const allowed = new Set(CAREER_PATH_TECH[path]);
                    setTechnologies((prev) => prev.filter((t) => allowed.has(t)));
                  }}
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="fullstack">Full Stack</option>
                </Select>
              </label>

              <label className="space-y-1.5 text-sm">
                <span className="text-muted-foreground">Experience level</span>
                <Select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Difficulty)}
                >
                  {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                    <option key={d} value={d}>
                      {DIFFICULTY_LABELS[d]}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">Stack</p>
              <div className="flex flex-wrap gap-2">
                {available.map((tech) => {
                  const active = technologies.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTech(tech)}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-sm transition",
                        active
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-border hover:border-accent/40",
                      )}
                    >
                      <span
                        className="mr-2 inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: TOPIC_MAP[tech].color }}
                      />
                      {technologyLabel(tech)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">Question count</p>
              <div className="flex flex-wrap gap-2">
                {COUNT_OPTIONS.map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => setQuestionCount(option.value)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm font-medium transition",
                      questionCount === option.value
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border hover:border-accent/40",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              disabled={technologies.length === 0 || generating}
              onClick={() => void generate()}
            >
              {generating ? "Generating…" : "Generate balanced set"}
            </Button>
          </CardContent>
        </Card>

        {preview.length > 0 && (
          <Card className="mt-6">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    {preview.length} questions ready
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Stored in session — start practice or mock next.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => start("practice")}>Start Practice</Button>
                  <Button variant="outline" onClick={() => start("mock")}>
                    Start Mock
                  </Button>
                </div>
              </div>
              <ol className="space-y-2 text-sm">
                {preview.map((q, i) => (
                  <li
                    key={q.id}
                    className="rounded-xl border border-border bg-muted/30 px-3 py-2"
                  >
                    <span className="text-muted-foreground">{i + 1}. </span>
                    {q.question}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({technologyLabel(q.technology)})
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
