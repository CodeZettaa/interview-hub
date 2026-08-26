"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_PREFERENCES,
  getPreferencesRepository,
} from "@/lib/storage/preferences-storage";
import { getProgressRepository } from "@/lib/storage/progress-storage";
import { getBookmarksRepository } from "@/lib/storage/bookmarks-storage";
import type {
  BookmarkState,
  ProgressState,
  SelfAssessment,
  UserPreferences,
} from "@/types/interview";

interface AppStateContextValue {
  hydrated: boolean;
  preferences: UserPreferences;
  progress: ProgressState;
  bookmarks: BookmarkState;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  markViewed: (questionId: string) => void;
  markCompleted: (questionId: string, assessment: SelfAssessment) => void;
  toggleBookmark: (questionId: string) => void;
  isBookmarked: (questionId: string) => boolean;
  resetOnboarding: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [progress, setProgress] = useState<ProgressState>({
    entries: {},
    updatedAt: new Date(0).toISOString(),
  });
  const [bookmarks, setBookmarks] = useState<BookmarkState>({
    ids: [],
    updatedAt: new Date(0).toISOString(),
  });

  useEffect(() => {
    setPreferences(getPreferencesRepository().get());
    setProgress(getProgressRepository().get());
    setBookmarks(getBookmarksRepository().get());
    setHydrated(true);
  }, []);

  const updatePreferences = useCallback((partial: Partial<UserPreferences>) => {
    const next = getPreferencesRepository().set(partial);
    setPreferences(next);
  }, []);

  const markViewed = useCallback((questionId: string) => {
    setProgress(getProgressRepository().markViewed(questionId));
  }, []);

  const markCompleted = useCallback(
    (questionId: string, assessment: SelfAssessment) => {
      setProgress(getProgressRepository().markCompleted(questionId, assessment));
    },
    [],
  );

  const toggleBookmark = useCallback((questionId: string) => {
    setBookmarks(getBookmarksRepository().toggle(questionId));
  }, []);

  const isBookmarked = useCallback(
    (questionId: string) => bookmarks.ids.includes(questionId),
    [bookmarks.ids],
  );

  const resetOnboarding = useCallback(() => {
    const next = getPreferencesRepository().set({
      onboardingComplete: false,
      careerPath: null,
      technologies: [],
      experienceLevel: null,
      preferredMode: null,
      questionCount: null,
    });
    setPreferences(next);
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      preferences,
      progress,
      bookmarks,
      updatePreferences,
      markViewed,
      markCompleted,
      toggleBookmark,
      isBookmarked,
      resetOnboarding,
    }),
    [
      hydrated,
      preferences,
      progress,
      bookmarks,
      updatePreferences,
      markViewed,
      markCompleted,
      toggleBookmark,
      isBookmarked,
      resetOnboarding,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
