import { useEffect, useMemo, useState } from 'react';
import { getDoc } from '../library/store';
import type { DocKind, DocMeta } from './types';
import { codeLanguage, extractToc } from './parse';
import { neighbours } from './search';
import { Link } from 'react-router-dom';
import { HtmlFrame } from './HtmlFrame';
import { MarkdownView } from './MarkdownView';
import { Toc } from './Toc';

type Loaded = { kind: DocKind; url?: string; text?: string; meta: DocMeta };

/** Loads one document from IndexedDB and picks the right renderer for its kind. */
export function DocViewer({ id, meta, docs }: { id: string; meta: DocMeta; docs: DocMeta[] }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  const [pixels, setPixels] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;
    setLoaded(null);
    setFailed(false);
    getDoc(id)
      .then(async (record) => {
        if (!record) throw new Error('missing');
        if (record.kind === 'html' || record.kind === 'markdown' || record.kind === 'code') {
          if (!cancelled) setLoaded({ kind: record.kind, text: await record.body.text(), meta });
        } else {
          objectUrl = URL.createObjectURL(record.kind === 'pdf' ? new Blob([record.body], { type: 'application/pdf' }) : record.body);
          if (!cancelled) setLoaded({ kind: record.kind, url: objectUrl, meta });
        }
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, meta]);

  const toc = useMemo(
    () => (loaded?.kind === 'markdown' && loaded.text ? extractToc(loaded.text) : []),
    [loaded],
  );

  const { prev, next } = neighbours(docs, id);

  if (failed) return <p className="text-rose-700">This document could not be loaded.</p>;
  if (!loaded) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="flex flex-col gap-10 xl:flex-row">
      <article className="min-w-0 flex-1">
        <header className="mb-6 border-b border-slate-200 pb-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {loaded.meta.kind} · {loaded.meta.fileName} · {(loaded.meta.size / 1024).toFixed(1)} KB
          </p>
        </header>

        {loaded.kind === 'markdown' && <MarkdownView source={loaded.text ?? ''} />}
        {loaded.kind === 'code' && (
          <MarkdownView source={`\`\`\`\`${codeLanguage(loaded.meta.fileName)}\n${loaded.text ?? ''}\n\`\`\`\``} />
        )}
        {loaded.kind === 'html' && <HtmlFrame html={loaded.text ?? ''} title={loaded.meta.title} />}
        {loaded.kind === 'pdf' && (
          <iframe title={loaded.meta.title} src={loaded.url} className="h-[80vh] w-full rounded-lg border border-slate-200" />
        )}
        {loaded.kind === 'video' && (
          <video src={loaded.url} controls preload="metadata" className="w-full rounded-lg border border-slate-200 bg-black">
            <track kind="captions" />
          </video>
        )}
        {loaded.kind === 'image' && (
          <figure>
            <img
              src={loaded.url}
              alt={loaded.meta.title}
              className="max-w-full rounded-md border border-slate-200"
              onLoad={(e) => setPixels(`${e.currentTarget.naturalWidth}×${e.currentTarget.naturalHeight} px`)}
            />
            {pixels && <figcaption className="mt-1 font-mono text-xs text-slate-500">{pixels}</figcaption>}
          </figure>
        )}
        <nav aria-label="Reading order" className="mt-12 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 text-sm">
          {prev ? (
            <Link to={`/doc/${prev.id}`} className="rounded-lg border border-slate-200 p-3 hover:border-blue-500">
              <span className="block text-xs text-slate-500">← Previous</span>
              {prev.title}
            </Link>
          ) : <span />}
          {next && (
            <Link to={`/doc/${next.id}`} className="rounded-lg border border-slate-200 p-3 text-right hover:border-blue-500">
              <span className="block text-xs text-slate-500">Next →</span>
              {next.title}
            </Link>
          )}
        </nav>
      </article>
      {toc.length > 0 && <Toc items={toc} />}
    </div>
  );
}
