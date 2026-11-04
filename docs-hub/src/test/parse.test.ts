import { describe, expect, it } from 'vitest';
import { buildFrameDocument } from '../features/docs/HtmlFrame';
import { detectKind, extractToc, formatBytes, slugify, titleFromFileName } from '../features/docs/parse';

describe('detectKind', () => {
  it('maps supported extensions case-insensitively', () => {
    expect(detectKind('guide.HTML')).toBe('html');
    expect(detectKind('paper.pdf')).toBe('pdf');
    expect(detectKind('README.md')).toBe('markdown');
    expect(detectKind('diagram.svg')).toBe('image');
    expect(detectKind('demo.MP4')).toBe('video');
    expect(detectKind('demo.webm')).toBe('video');
  });

  it('returns null for unsupported files instead of guessing', () => {
    expect(detectKind('setup.exe')).toBeNull();
    expect(detectKind('noextension')).toBeNull();
  });
});

describe('slugify', () => {
  it('matches GitHub-style heading anchors', () => {
    expect(slugify('Getting Started!')).toBe('getting-started');
    expect(slugify('Upload → Render')).toBe('upload--render');
  });
});

describe('extractToc', () => {
  it('reads headings and ignores # lines inside fenced code', () => {
    const md = ['# Title', '```bash', '# not a heading', '```', '## Commands'].join('\n');
    expect(extractToc(md)).toEqual([
      { level: 1, text: 'Title', id: 'title' },
      { level: 2, text: 'Commands', id: 'commands' },
    ]);
  });
});

describe('titleFromFileName and formatBytes', () => {
  it('turns file names into readable titles', () => {
    expect(titleFromFileName('release_notes-v2.pdf')).toBe('release notes v2');
  });

  it('formats sizes with the right unit', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB');
  });
});

describe('buildFrameDocument', () => {
  it('injects the enhancer before </body> and keeps the uploaded markup', () => {
    const out = buildFrameDocument('<body><pre>npm test</pre></body>');
    expect(out.indexOf('<script>')).toBeGreaterThan(out.indexOf('<pre>'));
    expect(out.endsWith('</body>')).toBe(true);
  });

  it('appends the enhancer when the upload has no body tag', () => {
    expect(buildFrameDocument('<p>hi</p>').startsWith('<p>hi</p><script>')).toBe(true);
  });
});
