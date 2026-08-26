import { STORAGE_KEYS } from "@/lib/constants";
import type { BookmarkState } from "@/types/interview";

const EMPTY: BookmarkState = { ids: [], updatedAt: new Date(0).toISOString() };

export interface BookmarksRepository {
  get(): BookmarkState;
  set(state: BookmarkState): void;
  toggle(questionId: string): BookmarkState;
  isBookmarked(questionId: string): boolean;
  clear(): void;
}

function read(): BookmarkState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.bookmarks);
    if (!raw) return EMPTY;
    return JSON.parse(raw) as BookmarkState;
  } catch {
    return EMPTY;
  }
}

function write(state: BookmarkState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEYS.bookmarks,
    JSON.stringify({ ...state, updatedAt: new Date().toISOString() }),
  );
}

export class LocalBookmarksRepository implements BookmarksRepository {
  get(): BookmarkState {
    return read();
  }

  set(state: BookmarkState): void {
    write(state);
  }

  toggle(questionId: string): BookmarkState {
    const current = this.get();
    const exists = current.ids.includes(questionId);
    const ids = exists
      ? current.ids.filter((id) => id !== questionId)
      : [...current.ids, questionId];
    const next = { ids, updatedAt: new Date().toISOString() };
    this.set(next);
    return next;
  }

  isBookmarked(questionId: string): boolean {
    return this.get().ids.includes(questionId);
  }

  clear(): void {
    this.set(EMPTY);
  }
}

let bookmarksRepo: BookmarksRepository | null = null;

export function getBookmarksRepository(): BookmarksRepository {
  if (!bookmarksRepo) bookmarksRepo = new LocalBookmarksRepository();
  return bookmarksRepo;
}
