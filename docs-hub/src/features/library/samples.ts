import type { DocRecord } from '../docs/types';

const README = `# Getting started

DocHub renders uploaded **HTML**, **PDF**, **Markdown** and **image** files in one place.

## Commands

Every code block has a copy button:

\`\`\`bash
npm install
npm run dev     # local server on http://localhost:5173
npm test        # unit tests
npm run build   # static output in dist/
\`\`\`

## Supported files

| Type     | Extensions                 | Rendering                              |
|----------|----------------------------|----------------------------------------|
| HTML     | .html, .htm                | Sandboxed frame, scripts allowed, no portal access |
| PDF      | .pdf                       | Native browser viewer                  |
| Markdown | .md, .markdown             | GFM tables, code, TOC, anchors         |
| Image    | .png, .jpg, .gif, .svg, .webp | Shows natural pixel size            |

## Images

The image below shows its natural size as a badge under the caption.

The sample image is stored as its own page; open **Architecture sketch** in the sidebar.

## Diagrams

Fenced \`mermaid\` blocks render as diagrams:

\`\`\`mermaid
flowchart LR
  Upload --> Store[(IndexedDB)]
  Store --> Render
  Render --> Share
\`\`\`

## Deploying

Pushing to the default branch runs \`.github/workflows/pages.yml\`, which builds the site and publishes it to GitHub Pages.
`;

function sampleRecord(id: string, title: string, fileName: string, type: string, text: string): DocRecord {
  const body = new Blob([text], { type });
  return {
    id,
    title,
    kind: type.startsWith('image') ? 'image' : 'markdown',
    fileName,
    mimeType: type,
    size: body.size,
    createdAt: 0,
    body,
  };
}

/** Seeded on first visit so an empty portal still shows what it can render. */
const SKETCH = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120"><rect width="320" height="120" rx="8" fill="#EFF6FF" stroke="#2563EB"/><text x="160" y="66" font-family="sans-serif" font-size="18" text-anchor="middle" fill="#0F172A">Upload → Render → Share</text></svg>';

export const SAMPLE_DOCS: DocRecord[] = [
  sampleRecord('sample-readme', 'Getting started', 'README.md', 'text/markdown', README),
  sampleRecord('sample-sketch', 'Architecture sketch', 'architecture-sketch.svg', 'image/svg+xml', SKETCH),
];
