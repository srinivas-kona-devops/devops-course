import { useRef, useState, type DragEvent } from 'react';
import { Upload } from 'lucide-react';
import { ACCEPTED_EXTENSIONS, detectKind, formatBytes, titleFromFileName } from '../docs/parse';
import type { DocRecord } from '../docs/types';

interface Props {
  onAdd: (records: DocRecord[]) => Promise<void>;
}

const ACCEPT = ACCEPTED_EXTENSIONS.join(',');

/** Drag-and-drop or pick files. Unsupported files are reported, not silently dropped. */
export function UploadPanel({ onAdd }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    const records: DocRecord[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(files)) {
      const kind = detectKind(file.name);
      if (!kind) {
        rejected.push(file.name);
        continue;
      }
      records.push({
        id: crypto.randomUUID(),
        title: titleFromFileName(file.name),
        kind,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        createdAt: Date.now(),
        body: file,
      });
    }
    if (records.length) await onAdd(records);
    setMessage(
      [
        records.length ? `Added ${records.length} (${formatBytes(records.reduce((n, r) => n + r.size, 0))})` : '',
        rejected.length ? `Skipped unsupported: ${rejected.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('. '),
    );
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void handle(event.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`rounded-lg border-2 border-dashed p-4 text-center text-sm transition ${
        dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300'
      }`}
    >
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700"
      >
        <Upload size={16} /> Upload
      </button>
      <p className="mt-2 text-slate-500">HTML, PDF, Markdown, images or video. Drop files here.</p>
      {message && <p className="mt-2 text-xs text-slate-600" role="status">{message}</p>}
      <input
        ref={input}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          void handle(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
