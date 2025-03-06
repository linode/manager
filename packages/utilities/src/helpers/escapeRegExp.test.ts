import { describe, expect, it } from 'vitest';

import { escapeRegExp } from './escapeRegExp';

describe('escapeRegExp utility function', () => {
  it('escapes special characters', () => {
    expect(escapeRegExp('?')).toBe('\\?');
    expect(escapeRegExp('\\')).toBe('\\\\');
    expect(escapeRegExp('{')).toBe('\\{');
  });
  it('leaves strings without special characters untouched', () => {
    expect(escapeRegExp('hello world')).toBe('hello world');
    expect(escapeRegExp('')).toBe('');
  });
});
