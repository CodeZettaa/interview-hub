"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAppState } from "@/components/layout/app-state-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  TOPICS,
} from "@/lib/constants";
import { getQuestionsRepository } from "@/lib/repositories";
import {
  questionPath,
  technologyLabel,
} from "@/lib/utils";
import type {
  Difficulty,
  InterviewQuestion,
  QuestionType,
  Technology,
} from "@/types/interview";

type TrackFilter = "" | "frontend" | "backend";
type TriFilter = "" | "yes" | "no";

export default function QuestionBankPage() {
  const { progress, bookmarks, hydrated } = useAppState();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [track, setTrack] = useState<TrackFilter>("");
  const [technology, setTechnology] = useState<"" | Technology>("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<"" | Difficulty>("");
  const [type, setType] = useState<"" | QuestionType>("");
  const [completed, setCompleted] = useState<TriFilter>("");
  const [bookmarked, setBookmarked] = useState<TriFilter>("");
  const [search, setSearch] = useState("");

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

  const techOptions = useMemo(() => {
    if (!track) return TOPICS;
    return TOPICS.filter(
      (t) => t.track === track || t.track === "both",
    );
  }, [track]);

  const categoryOptions = useMemo(() => {
    const pool = technology
      ? questions.filter((q) => q.technology === technology)
      : questions;
    const map = new Map<string, string>();
    for (const q of pool) {
      map.set(q.categorySlug, q.category);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [questions, technology]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter((item) => {
      const topic = TOPICS.find((t) => t.id === item.technology);
      if (track === "frontend" && topic?.track === "backend") return false;
      if (track === "backend" && topic?.track === "frontend") return false;
      if (technology && item.technology !== technology) return false;
      if (
        category &&
        item.categorySlug !== category &&
        item.category.toLowerCase() !== category.toLowerCase()
      ) {
        return false;
      }
      if (difficulty && item.difficulty !== difficulty) return false;
      if (type && item.type !== type) return false;

      const entry = progress.entries[item.id];
      const isCompleted = !!entry?.completed;
      if (completed === "yes" && !isCompleted) return false;
      if (completed === "no" && isCompleted) return false;

      const isBookmarked = bookmarks.ids.includes(item.id);
      if (bookmarked === "yes" && !isBookmarked) return false;
      if (bookmarked === "no" && isBookmarked) return false;

      if (q) {
        const haystack = [
          item.question,
          item.shortAnswer,
          item.category,
          ...item.tags,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [
    questions,
    track,
    technology,
    category,
    difficulty,
    type,
    completed,
    bookmarked,
    search,
    progress.entries,
    bookmarks.ids,
  ]);

  return (
    <div className="surface-grid">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Question Bank
          </h1>
          <p className="mt-2 text-muted-foreground">
            Filter instantly across tracks, technologies, difficulty, and more.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1.5 text-sm">
              <span className="text-muted-foreground">Search</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search questions…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-muted-foreground">Track</span>
              <Select
                value={track}
                onChange={(e) => {
                  setTrack(e.target.value as TrackFilter);
                  setTechnology("");
                  setCategory("");
                }}
              >
                <option value="">All tracks</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
              </Select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-muted-foreground">Technology</span>
              <Select
                value={technology}
                onChange={(e) => {
                  setTechnology(e.target.value as "" | Technology);
                  setCategory("");
                }}
              >
                <option value="">All technologies</option>
                {techOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-muted-foreground">Category</span>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All categories</option>
                {categoryOptions.map(([slug, name]) => (
                  <option key={slug} value={slug}>
                    {name}
                  </option>
                ))}
              </Select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-muted-foreground">Difficulty</span>
              <Select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as "" | Difficulty)
                }
              >
                <option value="">All levels</option>
                {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </option>
                ))}
              </Select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-muted-foreground">Type</span>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as "" | QuestionType)}
              >
                <option value="">All types</option>
                {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map(
                  (t) => (
                    <option key={t} value={t}>
                      {QUESTION_TYPE_LABELS[t]}
                    </option>
                  ),
                )}
              </Select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-muted-foreground">Completed</span>
              <Select
                value={completed}
                onChange={(e) => setCompleted(e.target.value as TriFilter)}
                disabled={!hydrated}
              >
                <option value="">Any</option>
                <option value="yes">Completed</option>
                <option value="no">Not completed</option>
              </Select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-muted-foreground">Bookmarked</span>
              <Select
                value={bookmarked}
                onChange={(e) => setBookmarked(e.target.value as TriFilter)}
                disabled={!hydrated}
              >
                <option value="">Any</option>
                <option value="yes">Bookmarked</option>
                <option value="no">Not bookmarked</option>
              </Select>
            </label>
          </CardContent>
        </Card>

        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="space-y-2">
          {filtered.map((item) => {
            const entry = progress.entries[item.id];
            const saved = bookmarks.ids.includes(item.id);
            return (
              <Link
                key={item.id}
                href={questionPath(
                  item.technology,
                  item.categorySlug,
                  item.slug,
                )}
                className="block"
              >
                <Card className="transition hover:border-accent/40">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium leading-snug">{item.question}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge tone="accent">
                          {technologyLabel(item.technology)}
                        </Badge>
                        <Badge>{item.category}</Badge>
                        <Badge>{DIFFICULTY_LABELS[item.difficulty]}</Badge>
                        <Badge>{QUESTION_TYPE_LABELS[item.type]}</Badge>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      {entry?.completed && (
                        <Badge tone="success">Completed</Badge>
                      )}
                      {saved && <Badge tone="accent">Saved</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          {!loading && filtered.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No questions match these filters.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
