import { useState, type ReactNode, type ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';
import { slugify } from './parse';
import { MermaidBlock } from './MermaidBlock';

function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (typeof node === 'object' && 'props' in node) return textOf(node.props.children);
  return '';
}

function CopyablePre({ children, ...rest }: ComponentPropsWithoutRef<'pre'>) {
  const [copied, setCopied] = useState(false);
  const language = /language-(\w+)/.exec(
    (children as { props?: { className?: string } })?.props?.className ?? '',
  )?.[1];

  if (language === 'mermaid') return <MermaidBlock code={textOf(children).replace(/\n$/, '')} />;

  const copy = async () => {
    await navigator.clipboard.writeText(textOf(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative my-4">
      <div className="flex items-center justify-between rounded-t-lg bg-slate-800 px-4 py-1.5 text-xs text-slate-400">
        <span>{language ?? 'text'}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 rounded px-2 py-0.5 hover:bg-slate-700 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre {...rest} className="overflow-x-auto rounded-b-lg bg-slate-900 p-4 text-sm text-slate-100">
        {children}
      </pre>
    </div>
  );
}

function HeadingLink({ level, children }: { level: 1 | 2 | 3 | 4 | 5 | 6; children: ReactNode }) {
  const Tag = `h${level}` as const;
  const id = slugify(textOf(children));
  return (
    <Tag id={id} className="group scroll-mt-20 font-semibold tracking-tight">
      {children}
      <a href={`#${id}`} className="ml-2 text-slate-300 opacity-0 hover:text-blue-600 group-hover:opacity-100">
        #
      </a>
    </Tag>
  );
}

/** Image that shows its natural pixel size; an explicit width/height attribute still wins. */
function SizedImage({ src, alt, width, height }: ComponentPropsWithoutRef<'img'>) {
  const [natural, setNatural] = useState<string | null>(null);
  return (
    <figure className="my-4">
      <img
        src={src}
        alt={alt ?? ''}
        width={width}
        height={height}
        className="max-w-full rounded-md border border-slate-200"
        onLoad={(event) => {
          const img = event.currentTarget;
          setNatural(`${img.naturalWidth}×${img.naturalHeight}`);
        }}
      />
      <figcaption className="mt-1 text-xs text-slate-500">
        {alt}
        {natural && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 font-mono">{natural}</span>}
      </figcaption>
    </figure>
  );
}

export function MarkdownView({ source }: { source: string }) {
  return (
    <div className="prose-doc">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <HeadingLink level={1}>{p.children}</HeadingLink>,
          h2: (p) => <HeadingLink level={2}>{p.children}</HeadingLink>,
          h3: (p) => <HeadingLink level={3}>{p.children}</HeadingLink>,
          h4: (p) => <HeadingLink level={4}>{p.children}</HeadingLink>,
          pre: CopyablePre,
          img: SizedImage,
          table: (p) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-slate-200">
              <table {...p} className="min-w-full divide-y divide-slate-200 text-sm" />
            </div>
          ),
          th: (p) => <th {...p} className="bg-slate-50 px-3 py-2 text-left font-semibold" />,
          td: (p) => <td {...p} className="border-t border-slate-100 px-3 py-2" />,
          code: ({ className, children, ...rest }) =>
            className ? (
              <code className={className} {...rest}>{children}</code>
            ) : (
              <code className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-900" {...rest}>
                {children}
              </code>
            ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
