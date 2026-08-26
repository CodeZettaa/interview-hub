import Link from "next/link";
import { ArrowRight, Play, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { formatPercent, technologyLabel } from "@/lib/utils";
import type { TopicProgressSummary } from "@/types/interview";
import { TOPIC_MAP } from "@/lib/constants";

export function TopicCard({ summary }: { summary: TopicProgressSummary }) {
  const topic = TOPIC_MAP[summary.technology];
  const hasProgress = summary.completed > 0 || summary.viewed > 0;

  return (
    <Card className="group transition hover:-translate-y-0.5 hover:border-accent/40">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="mb-3 h-2 w-10 rounded-full"
              style={{ backgroundColor: topic.color }}
            />
            <h3 className="font-display text-lg font-semibold">
              {technologyLabel(summary.technology)}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {topic.description}
            </p>
          </div>
          <span className="rounded-xl bg-muted px-2.5 py-1 text-xs font-medium">
            {summary.total} Q
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-muted/60 p-2">
            <p className="text-xs text-muted-foreground">Questions</p>
            <p className="font-semibold">{summary.total}</p>
          </div>
          <div className="rounded-xl bg-muted/60 p-2">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="font-semibold">
              {summary.completed} / {summary.total || 0}
            </p>
          </div>
          <div className="rounded-xl bg-muted/60 p-2">
            <p className="text-xs text-muted-foreground">Mastery</p>
            <p className="font-semibold">{formatPercent(summary.mastery)}</p>
          </div>
        </div>
        <ProgressBar value={summary.mastery} />
        <div className="flex flex-wrap gap-2">
          <Link href={`/practice/${summary.technology}`}>
            <Button size="sm">
              <Play className="h-3.5 w-3.5" />
              {hasProgress ? "Continue" : "Start Practice"}
            </Button>
          </Link>
          <Link href={`/questions/${summary.technology}`}>
            <Button size="sm" variant="outline">
              <Eye className="h-3.5 w-3.5" />
              View Questions
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
