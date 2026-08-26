import type { InterviewQuestion } from "@/types/interview";
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from "@/lib/constants";
import { technologyLabel } from "@/lib/utils";

/** Fully server-rendered Q&A so crawlers index answers (not client-gated). */
export function QuestionArticle({ question }: { question: InterviewQuestion }) {
  return (
    <article className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <header className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {technologyLabel(question.technology)} · {question.category} ·{" "}
          {DIFFICULTY_LABELS[question.difficulty]} ·{" "}
          {QUESTION_TYPE_LABELS[question.type]}
        </p>
        <h1 className="font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
          {question.question}
        </h1>
      </header>

      <section aria-labelledby="short-answer-heading">
        <h2
          id="short-answer-heading"
          className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent"
        >
          Short Interview Answer
        </h2>
        <p className="text-[15px] leading-relaxed">{question.shortAnswer}</p>
      </section>

      <section aria-labelledby="detailed-answer-heading">
        <h2
          id="detailed-answer-heading"
          className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Detailed Explanation
        </h2>
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
          {question.detailedAnswer}
        </p>
      </section>

      {question.example && (
        <section aria-labelledby="example-heading">
          <h2
            id="example-heading"
            className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Example
          </h2>
          <pre className="code-block overflow-x-auto rounded-2xl border border-border p-4 text-sm leading-relaxed">
            <code>{question.example}</code>
          </pre>
        </section>
      )}

      {question.interviewTip && (
        <section aria-labelledby="tip-heading">
          <h2
            id="tip-heading"
            className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Interview Tip
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {question.interviewTip}
          </p>
        </section>
      )}

      {question.commonMistake && (
        <section aria-labelledby="mistake-heading">
          <h2
            id="mistake-heading"
            className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Common Mistake
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {question.commonMistake}
          </p>
        </section>
      )}
    </article>
  );
}
