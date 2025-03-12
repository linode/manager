import { describe, expect, it } from 'vitest';

import { truncate, truncateEnd, truncateMiddle } from './truncate';

describe('truncate', () => {
  const stringOver140 = truncate(
    `hello world hello world hello world hello world hello world hello world hello world 
    hello world hello world hello world hello world hello world hello world hello world 
    hello world hello world hello world hello world hello world hello world hello world
    hello world hello world hello world hello world hello world hello world hello world`,
    140
  );

  const stringUnder140 = truncate(
    'hello world hello world hello world hello world',
    140
  );

  it('string over 140 + 4 chars should contain an ellipses as last 3 chars', () => {
    expect(stringOver140.substr(stringOver140.length - 3)).toBe('...');
  });

  it('string under 140 + 4 chars should not contain an ellipses as last 3 chars', () => {
    expect(stringUnder140.substr(stringUnder140.length - 3)).not.toBe('...');
  });
});

describe('truncateMiddle', () => {
  it('returns strings under the max unchanged', () => {
    expect(truncateMiddle('hello-world.txt')).toBe('hello-world.txt');
  });

  it('adds an ellipsis to the middle of the string if over max', () => {
    expect(truncateMiddle('aaaaaaaaaaaaaaaaaaaa.txt', 10)).toBe('aaa....txt');
  });

  it('works with a maxLength of 5 (minimum)', () => {
    expect(truncateMiddle('bb.txt', 5)).toBe('b...t');
  });
});

describe('truncateEnd', () => {
  it('returns strings under the max unchanged', () => {
    expect(truncateEnd('hello-world.txt')).toBe('hello-world.txt');
  });

  it('adds an ellipsis to the middle of the string if over max', () => {
    expect(truncateEnd('aaaaaaaaaaaaaaaaaaaa.txt', 10)).toBe('aaaaaaa...');
  });

  it('works with a maxLength of 4 (minimum)', () => {
    expect(truncateEnd('bb.txt', 4)).toBe('b...');
  });
});
