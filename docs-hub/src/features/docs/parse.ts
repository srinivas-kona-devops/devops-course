import type { DocKind, TocItem } from './types';

const EXTENSION_KIND: Record<string, DocKind> = {
  html: 'html',
  htm: 'html',
  pdf: 'pdf',
  md: 'markdown',
  markdown: 'markdown',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  svg: 'image',
  webp: 'image',
  mp4: 'video',
  webm: 'video',
  ogv: 'video',
  txt: 'code',
  js: 'code',
  ts: 'code',
  tsx: 'code',
  jsx: 'code',
  json: 'code',
  css: 'code',
  py: 'code',
  sh: 'code',
  yml: 'code',
  yaml: 'code',
};

/** Fence language for a code/text file, e.g. "ts" for app.ts. */
export function codeLanguage(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? 'text';
}

export const ACCEPTED_EXTENSIONS = Object.keys(EXTENSION_KIND).map((ext) => `.${ext}`);

/** Decide how a file is rendered from its extension. Returns null when unsupported. */
export function detectKind(fileName: string): DocKind | null {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_KIND[ext] ?? null;
}

export function titleFromFileName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Untitled';
}

/** GitHub-style heading slug: lowercase, drop punctuation, spaces to dashes. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s/g, '-');
}

/** Headings from Markdown, ignoring anything inside fenced code blocks. */
export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (match) {
      const text = match[2];
      items.push({ level: match[1].length, text, id: slugify(text) });
    }
  }
  return items;
}

/** Human-readable byte size, e.g. 1.4 MB. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
