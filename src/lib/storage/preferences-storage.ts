import { STORAGE_KEYS } from "@/lib/constants";
import type { UserPreferences } from "@/types/interview";

export const DEFAULT_PREFERENCES: UserPreferences = {
  careerPath: null,
  technologies: [],
  experienceLevel: null,
  preferredMode: null,
  questionCount: null,
  onboardingComplete: false,
  theme: "system",
};

export interface PreferencesRepository {
  get(): UserPreferences;
  set(prefs: Partial<UserPreferences>): UserPreferences;
  reset(): void;
}

function read(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.preferences);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as UserPreferences) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function write(prefs: UserPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(prefs));
}

export class LocalPreferencesRepository implements PreferencesRepository {
  get(): UserPreferences {
    return read();
  }

  set(partial: Partial<UserPreferences>): UserPreferences {
    const next = { ...this.get(), ...partial };
    write(next);
    return next;
  }

  reset(): void {
    write(DEFAULT_PREFERENCES);
  }
}

let prefsRepo: PreferencesRepository | null = null;

export function getPreferencesRepository(): PreferencesRepository {
  if (!prefsRepo) prefsRepo = new LocalPreferencesRepository();
  return prefsRepo;
}
