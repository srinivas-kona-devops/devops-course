import { describe, expect, it } from 'vitest';
import { findInText, neighbours } from '../features/docs/search';

describe('findInText', () => {
  it('finds a case-insensitive match and returns a snippet around it', () => {
    const hit = findInText('a', 'Install', 'Run NPM INSTALL before anything else.', 'npm install');
    expect(hit?.id).toBe('a');
    expect(hit?.snippet).toContain('NPM INSTALL');
  });

  it('returns null for no match and for queries under two characters', () => {
    expect(findInText('a', 'T', 'hello', 'zzz')).toBeNull();
    expect(findInText('a', 'T', 'hello', 'h')).toBeNull();
  });
});

describe('neighbours', () => {
  const pages = [{ id: 'one' }, { id: 'two' }, { id: 'three' }];

  it('gives previous and next in reading order', () => {
    expect(neighbours(pages, 'two')).toEqual({ prev: pages[0], next: pages[2] });
  });

  it('has no previous on the first page and no next on the last', () => {
    expect(neighbours(pages, 'one').prev).toBeUndefined();
    expect(neighbours(pages, 'three').next).toBeUndefined();
  });
});
