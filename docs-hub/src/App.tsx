import { useCallback, useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { deleteDoc, getDoc, listDocs, putDoc } from './features/library/store';
import { Sidebar } from './features/library/Sidebar';
import { DocViewer } from './features/docs/DocViewer';
import { SAMPLE_DOCS } from './features/library/samples';
import type { DocMeta, DocRecord } from './features/docs/types';
import { findInText, type SearchHit } from './features/docs/search';

// HashRouter: GitHub Pages has no SPA fallback, so deep links stay on the same static file.
export default function App() {
  const library = useLibrary();

  return (
    <HashRouter>
      <div className="flex h-screen flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 px-6 py-3">
          <BookOpen className="text-blue-600" size={22} />
          <span className="text-lg font-bold">DocHub</span>
          <span className="text-sm text-slate-500">Documentation portal</span>
        </header>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <Sidebar docs={library.docs} onAdd={library.add} onDelete={library.remove} onNewPage={library.newPage} onSearch={library.search} />
          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-8">
            <Routes>
              <Route index element={<FirstDoc docs={library.docs} ready={library.ready} />} />
              <Route path="/doc/:id" element={<DocRoute docs={library.docs} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}

function useLibrary() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => setDocs(await listDocs()), []);

  useEffect(() => {
    (async () => {
      if ((await listDocs()).length === 0) {
        for (const sample of SAMPLE_DOCS) await putDoc(sample);
      }
      await refresh();
      setReady(true);
    })();
  }, [refresh]);

  const add = async (records: DocRecord[]) => {
    for (const record of records) await putDoc(record);
    await refresh();
  };

  const remove = async (id: string) => {
    await deleteDoc(id);
    await refresh();
  };

  const newPage = async () => {
    const body = new Blob(['# Untitled\n\nStart writing…\n'], { type: 'text/markdown' });
    await add([
      {
        id: crypto.randomUUID(),
        title: `Untitled ${new Date().toLocaleTimeString()}`,
        kind: 'markdown',
        fileName: 'untitled.md',
        mimeType: 'text/markdown',
        size: body.size,
        createdAt: Date.now(),
        body,
      },
    ]);
  };

  const search = useCallback(
    async (query: string): Promise<SearchHit[]> => {
      if (query.trim().length < 2) return [];
      const hits: SearchHit[] = [];
      for (const doc of docs) {
        if (doc.kind !== 'markdown' && doc.kind !== 'html' && doc.kind !== 'code') continue;
        const record = await getDoc(doc.id);
        if (!record) continue;
        const hit = findInText(doc.id, doc.title, await record.body.text(), query);
        if (hit) hits.push(hit);
      }
      return hits;
    },
    [docs],
  );

  return { docs, ready, add, remove, newPage, search };
}

function FirstDoc({ docs, ready }: { docs: DocMeta[]; ready: boolean }) {
  if (!ready) return <p className="text-slate-500">Loading…</p>;
  if (docs.length === 0) return <p className="text-slate-500">Upload a page to get started.</p>;
  return <Navigate to={`/doc/${docs[0].id}`} replace />;
}

function DocRoute({ docs }: { docs: DocMeta[] }) {
  const { id } = useParams();
  const meta = docs.find((d) => d.id === id);
  if (!meta) return <p className="text-slate-500">That page no longer exists.</p>;
  return <DocViewer id={meta.id} meta={meta} docs={docs} />;
}
