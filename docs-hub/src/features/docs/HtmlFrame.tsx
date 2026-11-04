import { useEffect, useRef, useState } from 'react';

// Runs inside the sandboxed iframe: adds a Copy button to every <pre> and reports its height to the parent.
// Kept as a function so it is type-checked here and serialised into the srcdoc.
function frameEnhancer() {
  const copyText = (text: string) =>
    navigator.clipboard
      ? navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
      : Promise.resolve(fallbackCopy(text));
  const fallbackCopy = (text: string) => {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  };
  document.querySelectorAll('pre').forEach((pre) => {
    pre.style.position = 'relative';
    const button = document.createElement('button');
    button.textContent = 'Copy';
    button.setAttribute('style', 'position:absolute;top:6px;right:6px;font:12px sans-serif;padding:2px 8px;border-radius:6px;border:1px solid #475569;background:#1e293b;color:#e2e8f0;cursor:pointer');
    button.addEventListener('click', () => {
      // Skip the button's own "Copy" label when collecting the command text.
      const text = Array.from(pre.childNodes)
        .filter((node) => node !== button)
        .map((node) => node.textContent)
        .join('');
      copyText(text).then(() => {
        button.textContent = 'Copied';
        setTimeout(() => (button.textContent = 'Copy'), 1500);
      });
    });
    pre.appendChild(button);
  });
  const report = () =>
    parent.postMessage({ dochubHeight: document.documentElement.scrollHeight }, '*');
  new ResizeObserver(report).observe(document.body);
  report();
}

const ENHANCER = `<script>(${frameEnhancer.toString()})()</script>`;

/** Wraps uploaded HTML so it can run its own scripts but cannot touch the portal's origin. */
export function buildFrameDocument(html: string): string {
  return /<\/body>/i.test(html)
    ? html.replace(/<\/body>/i, `${ENHANCER}</body>`)
    : `${html}${ENHANCER}`;
}

export function HtmlFrame({ html, title }: { html: string; title: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(600);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      const reported = event.data?.dochubHeight;
      if (typeof reported === 'number') setHeight(reported);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <iframe
      ref={frameRef}
      title={title}
      // allow-scripts only. No allow-same-origin: the document gets an opaque origin and cannot read
      // IndexedDB, cookies or the portal's DOM.
      sandbox="allow-scripts"
      srcDoc={buildFrameDocument(html)}
      style={{ height }}
      className="w-full border-0"
    />
  );
}
