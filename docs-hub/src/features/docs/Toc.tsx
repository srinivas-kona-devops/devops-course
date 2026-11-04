import type { TocItem } from './types';

/** Right-hand "On this page" links. Plain anchors, so every heading is deep-linkable. */
export function Toc({ items }: { items: TocItem[] }) {
  return (
    <nav aria-label="On this page" className="sticky top-20 hidden h-fit w-56 shrink-0 xl:block">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">On this page</p>
      <ul className="space-y-1.5 border-l border-slate-200 text-sm">
        {items.map((item) => (
          <li key={`${item.id}-${item.level}`} style={{ paddingLeft: (item.level - 1) * 8 + 10 }}>
            <a href={`#${item.id}`} className="text-slate-600 hover:text-blue-600">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
