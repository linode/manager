import { describe, expect, it } from 'vitest';

import { deepStringTransform } from './deepStringTransform';

describe('deepStringTransform utility function', () => {
  const fn = (s: string) => s.toUpperCase();

  const _deepStringTransform = (value: any) => deepStringTransform(value, fn);

  it('applies transformation function to plain strings', () => {
    expect(_deepStringTransform('hello-world')).toBe('HELLO-WORLD');
  });

  it('does not apply transform function to other types of values', () => {
    expect(_deepStringTransform(10)).toBe(10);
    expect(_deepStringTransform(true)).toBe(true);
    expect(_deepStringTransform(null)).toBe(null);
    expect(_deepStringTransform(undefined)).toBe(undefined);
  });

  it('applies transformation function to each string in an array', () => {
    expect(_deepStringTransform(['hello', 10])).toEqual(['HELLO', 10]);
    expect(_deepStringTransform([])).toEqual([]);
  });

  it('applies transformation function to each string value in an object', () => {
    const input = {
      key1: 'Hello',
      key2: {
        key3: 'World',
        key4: true,
      },
    };
    expect(_deepStringTransform(input)).toEqual({
      key1: 'HELLO',
      key2: {
        key3: 'WORLD',
        key4: true,
      },
    });
  });
});
