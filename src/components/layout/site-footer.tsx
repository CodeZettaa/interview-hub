import Link from "next/link";
import { BRAND } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-sm font-semibold">
            {BRAND.name} · {BRAND.product}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Built for Frontend & Backend interview mastery.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/questions" className="hover:text-foreground">
            Question Bank
          </Link>
          <Link href="/generate" className="hover:text-foreground">
            Generate Interview
          </Link>
          <Link href="/challenge" className="hover:text-foreground">
            Daily Challenge
          </Link>
          <Link href="/onboarding" className="hover:text-foreground">
            Get Started
          </Link>
        </div>
      </div>
    </footer>
  );
}
