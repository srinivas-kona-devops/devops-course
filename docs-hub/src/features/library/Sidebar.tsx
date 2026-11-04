import { NavLink } from 'react-router-dom';
import { FileCode2, FileImage, FileText, FileType2, FilePlus, FileVideo, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { SearchHit } from '../docs/search';
import type { DocKind, DocMeta } from '../docs/types';
import { UploadPanel } from './UploadPanel';
import type { DocRecord } from '../docs/types';

const ICON: Record<DocKind, typeof FileText> = {
  html: FileCode2,
  pdf: FileType2,
  markdown: FileText,
  image: FileImage,
  video: FileVideo,
  code: FileCode2,
};

interface Props {
  docs: DocMeta[];
  onAdd: (records: DocRecord[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onNewPage: () => Promise<void>;
  onSearch: (query: string) => Promise<SearchHit[]>;
}

/** Left navigation: search, upload, and the document list. */
export function Sidebar({ docs, onAdd, onDelete, onNewPage, onSearch }: Props) {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);

  // Debounced full-text search across page bodies; titles are filtered instantly below.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      void onSearch(query).then((found) => !cancelled && setHits(found));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, onSearch]);

  const visible = docs.filter((d) => d.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <aside className="flex max-h-72 w-full shrink-0 flex-col gap-4 overflow-y-auto border-b border-slate-200 bg-slate-50 p-4 md:max-h-none md:w-72 md:border-b-0 md:border-r">
      <UploadPanel onAdd={onAdd} />
      <button
        type="button"
        onClick={() => void onNewPage()}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        <FilePlus size={16} /> New blank page
      </button>
      <label className="relative block">
        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter pages"
          aria-label="Filter pages"
          className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
        />
      </label>
      <nav aria-label="Documents">
        <ul className="space-y-0.5">
          {visible.map((doc) => {
            const Icon = ICON[doc.kind];
            return (
              <li key={doc.id} className="group flex items-center rounded-md hover:bg-white">
                <NavLink
                  to={`/doc/${doc.id}`}
                  className={({ isActive }) =>
                    `flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-sm ${
                      isActive ? 'font-semibold text-blue-700' : 'text-slate-700'
                    }`
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </NavLink>
                <button
                  type="button"
                  onClick={() => void onDelete(doc.id)}
                  aria-label={`Delete ${doc.title}`}
                  className="mr-1 hidden rounded p-1 text-slate-400 hover:text-rose-600 group-hover:block"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            );
          })}
        </ul>
        {visible.length === 0 && <p className="px-2 text-sm text-slate-500">No pages yet.</p>}
        {hits.length > 0 && (
          <section aria-label="Matches in page content" className="mt-4 space-y-2">
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">In page content</p>
            {hits.map((hit) => (
              <NavLink key={hit.id} to={`/doc/${hit.id}`} className="block rounded-md px-2 py-1.5 text-xs hover:bg-white">
                <span className="font-medium text-slate-800">{hit.title}</span>
                <span className="mt-0.5 block text-slate-500">{hit.snippet}</span>
              </NavLink>
            ))}
          </section>
        )}
      </nav>
    </aside>
  );
}
