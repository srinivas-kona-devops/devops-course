# DocHub — feature status

Living doc. Update it in the same change as any feature work.

## What exists

| Area | Feature | Where |
|---|---|---|
| Upload | Drag-drop or pick HTML, PDF, Markdown, images; unsupported files reported | `src/features/library/UploadPanel.tsx` |
| Storage | Files kept in browser IndexedDB (`dochub` / `docs`) | `src/features/library/store.ts` |
| Render HTML | Sandboxed `<iframe sandbox="allow-scripts">`, no `allow-same-origin`, auto height | `src/features/docs/HtmlFrame.tsx` |
| Render PDF | Native browser viewer via object URL | `src/features/docs/DocViewer.tsx` |
| Render Markdown | GFM tables (scroll-wrapped), code, heading anchors | `src/features/docs/MarkdownView.tsx` |
| Code | Copy button on every block (portal Markdown and uploaded HTML) | `MarkdownView.tsx`, `HtmlFrame.tsx` |
| Images | Caption + natural pixel size badge; honours width/height attributes | `MarkdownView.tsx` |
| TOC | "On this page" from Markdown headings, skips fenced code | `Toc.tsx`, `parse.ts` |
| Navigation | Sidebar with title filter, delete, deep links `#/doc/<id>` | `Sidebar.tsx`, `App.tsx` |
| Video | mp4, webm, ogv in native player | `DocViewer.tsx` |
| Code files | txt, js, ts, tsx, json, css, py, sh, yml as highlighted, copyable blocks | `DocViewer.tsx` |
| Diagrams | ```` ```mermaid ```` fences render to SVG (Mermaid, loaded on demand) | `MermaidBlock.tsx` |
| Blank page | "New blank page" creates an editable Markdown page | `Sidebar.tsx`, `App.tsx` |
| Full-text search | Debounced search across page bodies with snippets, plus title filter | `search.ts`, `Sidebar.tsx` |
| Reading order | Previous / Next links at the foot of each page | `search.ts`, `DocViewer.tsx` |
| Responsive | Sidebar stacks above content below `md`; TOC moves below content below `xl` | `App.tsx`, `DocViewer.tsx` |
| Seed | Getting-started README and an SVG sample page on first visit | `samples.ts` |
| Deploy | `.github/workflows/pages.yml`: test, build, `.nojekyll`, Pages deploy | repo root `.github/` |

## Cost

- Static bundle about 112 KB gzip JS.
- No server, no database, no accounts.

## Deliberately not done

- **Uploads are per browser.** GitHub Pages has no write backend, so another person will not see your uploads. Shared docs must be committed to the repo.
- No auth. Anyone with the URL reads the committed docs.
- HTML uploads are not sanitised into the page. They run only inside the sandbox.
- Search reads each page's text on every query. Fine for dozens of pages; not for thousands.
- No relative asset resolution: an uploaded HTML page that links `style.css` or `img/x.png` by path will not load them.
- Markdown data-URI images are blocked by react-markdown's URL policy; use uploaded image pages instead.
- No paywall or licence checks exist, so every feature is available to every visitor.
- No versioning, comments or editing in the browser.
- No Confluence import or export.

## Still on the user's hands

- Repo Settings → Pages → Source = "GitHub Actions".
- Push to `main` (not done by the assistant). Then check the `Deploy` job logs.
- Decide whether shared docs live in `docs-hub/public/` or another committed folder (not wired yet).
- Run `npm audit` review: install reported 2 critical and 1 high advisories.
- Stitch design: the design system (project 2530597163425749685) was generated, but its tokens were not wired into the code. Colours are Tailwind defaults that match its palette.
- Remote images in Markdown load from the viewer's browser (IP and referrer leak).
