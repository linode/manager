import { truncateEnd, truncateMiddle } from './truncate';

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
    expect(truncateEnd('bb.txt', 54)).toBe('aa...');
  });
});
