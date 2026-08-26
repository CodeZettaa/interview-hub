"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/components/layout/app-state-provider";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, CheckCircle2, Link2 } from "lucide-react";
import { questionPath } from "@/lib/utils";
import type { InterviewQuestion, SelfAssessment } from "@/types/interview";

/** Bookmark, copy link, and self-assessment — keeps interactive bits client-side. */
export function QuestionActions({ question }: { question: InterviewQuestion }) {
  const { toggleBookmark, isBookmarked, markCompleted, markViewed, progress } =
    useAppState();
  const [copied, setCopied] = useState(false);
  const entry = progress.entries[question.id];
  const bookmarked = isBookmarked(question.id);

  useEffect(() => {
    markViewed(question.id);
  }, [markViewed, question.id]);

  async function copyLink() {
    const url = `${window.location.origin}${questionPath(
      question.technology,
      question.categorySlug,
      question.slug,
    )}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function assess(value: SelfAssessment) {
    markCompleted(question.id, value);
  }

  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleBookmark(question.id)}
          aria-label="Bookmark"
        >
          {bookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-accent" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {bookmarked ? "Saved" : "Save"}
        </Button>
        <Button variant="outline" size="sm" onClick={copyLink}>
          {copied ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy Link"}
        </Button>
      </div>

      <div>
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
      </div>
    </div>
  );
}
