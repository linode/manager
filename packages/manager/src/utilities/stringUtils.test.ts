import { isNumeric, truncateAndJoinList } from './stringUtils';

describe('truncateAndJoinList', () => {
  const strList = ['a', 'b', 'c'];

  const bigStrList: string[] = [];
  for (let i = 0; i < 1000; i++) {
    bigStrList.push('a');
  }
  it('joins full lists less than max', () => {
    const result = truncateAndJoinList(strList, 5);
    expect(result).toBe('a, b, c');
  });

  it('truncates lists greater than max', () => {
    const result = truncateAndJoinList(strList, 2);
    expect(result).toBe('a, b, plus 1 more');
  });

  it('works with large lists ', () => {
    const result = truncateAndJoinList(bigStrList, 3);
    expect(result).toBe('a, a, a, plus 997 more');
  });

  it('defaults to a max of 100', () => {
    const result = truncateAndJoinList(bigStrList);
    expect(result).toMatch(/, plus 900 more/);
  });
});

describe('isNumeric', () => {
  it('should return true for a number', () => {
    expect(isNumeric('12456')).toBe(true);
  });
  it('should return false for a number with a decimal', () => {
    expect(isNumeric('1.2456')).toBe(false);
  });
  it('should return false for text', () => {
    expect(isNumeric('my-linode')).toBe(false);
  });
});
