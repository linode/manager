import { describe, expect, it } from 'vitest';

import { capitalize, capitalizeAllWords } from './capitalize';

describe('capitalize', () => {
  it('should return capitalized string', () => {
    expect(capitalize('hello world')).toBe('Hello world');
  });
});

describe('capitalize', () => {
  it('should return string with all words capitalized', () => {
    expect(capitalizeAllWords('hello world')).toBe('Hello World');
  });
});
