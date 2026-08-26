"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Code2,
  Layers,
  Server,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { useAppState } from "@/components/layout/app-state-provider";
import {
  CAREER_PATH_TECH,
  DIFFICULTY_LABELS,
  QUESTION_COUNTS,
  TOPIC_MAP,
} from "@/lib/constants";
import { cn, technologyLabel } from "@/lib/utils";
import type {
  CareerPath,
  Difficulty,
  InterviewMode,
  QuestionCount,
  Technology,
} from "@/types/interview";

const STEPS = ["Career Path", "Technologies", "Experience", "Mode"] as const;

const PATH_OPTIONS: {
  id: CareerPath;
  title: string;
  description: string;
  icon: typeof Code2;
}[] = [
  {
    id: "frontend",
    title: "Frontend Developer",
    description: "UI fundamentals, frameworks, and browser platforms.",
    icon: Code2,
  },
  {
    id: "backend",
    title: "Backend Developer",
    description: "Runtime, APIs, Node.js, and NestJS architecture.",
    icon: Server,
  },
  {
    id: "fullstack",
    title: "Full Stack Developer",
    description: "End-to-end prep across frontend and backend stacks.",
    icon: Layers,
  },
];

const LEVELS = Object.entries(DIFFICULTY_LABELS) as [Difficulty, string][];

const COUNT_OPTIONS: { value: QuestionCount; label: string }[] = [
  ...QUESTION_COUNTS.map((n) => ({ value: n as QuestionCount, label: String(n) })),
  { value: "full", label: "Full Topic" },
  { value: "random-mix", label: "Random Mix" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { preferences, updatePreferences, hydrated } = useAppState();
  const [step, setStep] = useState(0);
  const [careerPath, setCareerPath] = useState<CareerPath | null>(
    preferences.careerPath,
  );
  const [technologies, setTechnologies] = useState<Technology[]>(
    preferences.technologies,
  );
  const [experienceLevel, setExperienceLevel] = useState<Difficulty | null>(
    preferences.experienceLevel,
  );
  const [preferredMode, setPreferredMode] = useState<InterviewMode | null>(
    preferences.preferredMode ?? "practice",
  );
  const [questionCount, setQuestionCount] = useState<QuestionCount | null>(
    preferences.questionCount ?? 20,
  );

  useEffect(() => {
    if (!hydrated) return;
    if (preferences.careerPath) setCareerPath(preferences.careerPath);
    if (preferences.technologies.length) setTechnologies(preferences.technologies);
    if (preferences.experienceLevel) setExperienceLevel(preferences.experienceLevel);
    if (preferences.preferredMode) setPreferredMode(preferences.preferredMode);
    if (preferences.questionCount !== null) setQuestionCount(preferences.questionCount);
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const availableTech = useMemo(
    () => (careerPath ? CAREER_PATH_TECH[careerPath] : []),
    [careerPath],
  );

  const techGroups = useMemo(() => {
    const fundamentals = availableTech.filter(
      (t) => TOPIC_MAP[t].group === "fundamentals",
    );
    const frameworks = availableTech.filter(
      (t) => TOPIC_MAP[t].group === "frameworks",
    );
    const backend = availableTech.filter((t) => TOPIC_MAP[t].group === "backend");
    return { fundamentals, frameworks, backend };
  }, [availableTech]);

  function toggleTech(tech: Technology) {
    setTechnologies((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech],
    );
  }

  function selectPath(path: CareerPath) {
    setCareerPath(path);
    const allowed = new Set(CAREER_PATH_TECH[path]);
    setTechnologies((prev) => prev.filter((t) => allowed.has(t)));
  }

  function canContinue() {
    if (step === 0) return !!careerPath;
    if (step === 1) return technologies.length > 0;
    if (step === 2) return !!experienceLevel;
    if (step === 3) return !!preferredMode && questionCount !== null;
    return false;
  }

  function finish() {
    if (!careerPath || !experienceLevel || !preferredMode || questionCount === null) {
      return;
    }
    updatePreferences({
      careerPath,
      technologies,
      experienceLevel,
      preferredMode,
      questionCount,
      onboardingComplete: true,
    });
    router.push("/dashboard");
  }

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
        Loading your setup…
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="surface-grid min-h-[calc(100vh-8rem)]">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Guided setup
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {step === 0 && "Which path are you preparing for?"}
            {step === 1 && "Select your technologies"}
            {step === 2 && "What level are you preparing for?"}
            {step === 3 && "Interview setup"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
          <div className="mt-5">
            <ProgressBar value={progress} />
            <div className="mt-3 flex justify-between gap-2">
              {STEPS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    "flex-1 truncate text-left text-xs font-medium transition",
                    i === step
                      ? "text-accent"
                      : i < step
                        ? "text-foreground hover:text-accent"
                        : "text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            {PATH_OPTIONS.map((option) => {
              const selected = careerPath === option.id;
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectPath(option.id)}
                  className="text-left"
                >
                  <Card
                    className={cn(
                      "h-full transition hover:-translate-y-0.5",
                      selected
                        ? "border-accent ring-2 ring-accent/30"
                        : "hover:border-accent/40",
                    )}
                  >
                    <CardContent className="space-y-3 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-display text-lg font-semibold">
                          {option.title}
                        </h2>
                        {selected && (
                          <span className="rounded-full bg-accent p-1 text-accent-foreground">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {option.description}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && careerPath && (
          <div className="space-y-6">
            {(careerPath === "frontend" || careerPath === "fullstack") && (
              <>
                <TechGroup
                  title="Fundamentals"
                  techs={techGroups.fundamentals}
                  selected={technologies}
                  onToggle={toggleTech}
                />
                <TechGroup
                  title="Frameworks"
                  techs={techGroups.frameworks}
                  selected={technologies}
                  onToggle={toggleTech}
                />
              </>
            )}
            {(careerPath === "backend" || careerPath === "fullstack") && (
              <TechGroup
                title={careerPath === "backend" ? "Backend stack" : "Backend"}
                techs={
                  careerPath === "backend" ? availableTech : techGroups.backend
                }
                selected={technologies}
                onToggle={toggleTech}
              />
            )}
            <p className="text-sm text-muted-foreground">
              {technologies.length} selected
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {LEVELS.map(([id, label]) => {
              const selected = experienceLevel === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setExperienceLevel(id)}
                  className="text-left"
                >
                  <Card
                    className={cn(
                      "transition hover:-translate-y-0.5",
                      selected
                        ? "border-accent ring-2 ring-accent/30"
                        : "hover:border-accent/40",
                    )}
                  >
                    <CardContent className="flex items-center justify-between gap-3 p-5">
                      <div>
                        <p className="font-display font-semibold">{label}</p>
                        <p className="mt-1 text-xs capitalize text-muted-foreground">
                          {id} level weighting
                        </p>
                      </div>
                      {selected && (
                        <span className="rounded-full bg-accent p-1 text-accent-foreground">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="mb-3 font-display text-lg font-semibold">
                Preferred mode
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    {
                      id: "practice" as const,
                      title: "Practice",
                      body: "Reveal answers at your pace and self-assess mastery.",
                    },
                    {
                      id: "mock" as const,
                      title: "Mock Interview",
                      body: "Timed questions with answers hidden until you finish each one.",
                    },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPreferredMode(mode.id)}
                    className="text-left"
                  >
                    <Card
                      className={cn(
                        "h-full transition",
                        preferredMode === mode.id
                          ? "border-accent ring-2 ring-accent/30"
                          : "hover:border-accent/40",
                      )}
                    >
                      <CardContent className="p-5">
                        <p className="font-display font-semibold">{mode.title}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {mode.body}
                        </p>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-display text-lg font-semibold">
                Question count
              </h2>
              <div className="flex flex-wrap gap-2">
                {COUNT_OPTIONS.map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => setQuestionCount(option.value)}
                    className={cn(
                      "rounded-xl border px-4 py-2.5 text-sm font-medium transition",
                      questionCount === option.value
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border bg-card hover:border-accent/40",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button disabled={!canContinue()} onClick={next}>
            {step === STEPS.length - 1 ? "Go to Dashboard" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TechGroup({
  title,
  techs,
  selected,
  onToggle,
}: {
  title: string;
  techs: Technology[];
  selected: Technology[];
  onToggle: (tech: Technology) => void;
}) {
  if (techs.length === 0) return null;
  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {techs.map((tech) => {
          const active = selected.includes(tech);
          const topic = TOPIC_MAP[tech];
          return (
            <button
              key={tech}
              type="button"
              onClick={() => onToggle(tech)}
              className="text-left"
            >
              <Card
                className={cn(
                  "transition",
                  active
                    ? "border-accent ring-2 ring-accent/30"
                    : "hover:border-accent/40",
                )}
              >
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <div
                      className="mb-2 h-1.5 w-8 rounded-full"
                      style={{ backgroundColor: topic.color }}
                    />
                    <p className="font-medium">{technologyLabel(tech)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {topic.description}
                    </p>
                  </div>
                  {active && (
                    <span className="rounded-full bg-accent p-1 text-accent-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
