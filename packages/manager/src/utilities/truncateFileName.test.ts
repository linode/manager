import { truncateFileName } from './truncateFileName';

describe('truncateFileName', () => {
  it('returns strings under the max unchanged', () => {
    expect(truncateFileName('hello-world.txt')).toBe('hello-world.txt');
  });

  it('adds an ellipsis to the middle of the string if over max', () => {
    expect(truncateFileName('aaaaaaaaaaaaaaaaaaaa.txt', 10)).toBe('aaa....txt');
  });

  it('works with a maxLength of 5 (minimum)', () => {
    expect(truncateFileName('bb.txt', 5)).toBe('b...t');
  });
});
