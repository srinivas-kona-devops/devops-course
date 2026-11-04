import { useEffect, useId, useState } from 'react';

/** Renders a ```mermaid fence to SVG. Mermaid is loaded on demand so plain pages stay small. */
export function MermaidBlock({ code }: { code: string }) {
  const id = useId().replace(/:/g, '');
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('mermaid')
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral' });
        const { svg: rendered } = await mermaid.render(`mmd-${id}`, code);
        if (!cancelled) setSvg(rendered);
      })
      .catch((err: unknown) => !cancelled && setError(err instanceof Error ? err.message : 'Diagram failed'));
    return () => {
      cancelled = true;
    };
  }, [code, id]);

  if (error) return <pre className="my-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</pre>;
  if (!svg) return <p className="my-4 text-sm text-slate-500">Rendering diagram…</p>;
  // securityLevel 'strict' makes Mermaid sanitise its own output, so the SVG is safe to inline.
  return <div className="my-4 overflow-x-auto rounded-lg border border-slate-200 p-4" dangerouslySetInnerHTML={{ __html: svg }} />;
}
