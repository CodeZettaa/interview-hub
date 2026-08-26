"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppState } from "@/components/layout/app-state-provider";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/questions", label: "Question Bank" },
  { href: "/generate", label: "Generate Interview" },
  { href: "/mock", label: "Mock Interview" },
  { href: "/review", label: "Review" },
  { href: "/saved", label: "Saved" },
  { href: "/challenge", label: "Daily Challenge" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { preferences, hydrated } = useAppState();
  const [open, setOpen] = useState(false);
  const ctaHref =
    hydrated && preferences.onboardingComplete ? "/dashboard" : "/onboarding";

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Zap className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold tracking-tight">
              CodeZetta
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Interview Hub
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition",
                pathname.startsWith(link.href)
                  ? "bg-accent-soft text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href={ctaHref} className="hidden sm:block">
            <Button size="sm">
              {hydrated && preferences.onboardingComplete
                ? "Continue"
                : "Start Preparing"}
            </Button>
          </Link>
          <button
            className="rounded-lg p-2 hover:bg-muted lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  pathname.startsWith(link.href)
                    ? "bg-accent-soft text-accent"
                    : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href={ctaHref} onClick={() => setOpen(false)}>
              <Button className="mt-2 w-full" size="sm">
                Start Preparing
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
