export interface SearchHit {
  id: string;
  title: string;
  snippet: string;
}

const RADIUS = 60;

/** Case-insensitive match in one document's text. Returns a snippet around the first hit, or null. */
export function findInText(id: string, title: string, text: string, query: string): SearchHit | null {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return null;
  const at = text.toLowerCase().indexOf(needle);
  if (at === -1) return null;
  const start = Math.max(0, at - RADIUS);
  const end = Math.min(text.length, at + needle.length + RADIUS);
  const snippet = (start > 0 ? '…' : '') + text.slice(start, end).replace(/\s+/g, ' ').trim() + (end < text.length ? '…' : '');
  return { id, title, snippet };
}

/** Previous and next page in reading order, for "read in order" navigation. */
export function neighbours<T extends { id: string }>(items: T[], id: string): { prev?: T; next?: T } {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return {};
  return { prev: items[index - 1], next: items[index + 1] };
}
