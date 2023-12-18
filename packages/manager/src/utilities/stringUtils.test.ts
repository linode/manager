import {
  getNextLabel,
  getNumberAtEnd,
  isNumeric,
  removeNumberAtEnd,
  truncateAndJoinList,
} from './stringUtils';

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

  it('supports overriding the total amount', () => {
    // Imagine this is a response from the API with a page size of 3, but 6 results total
    const fakeApiData = {
      data: ['a', 'b', 'c'],
      results: 6,
    };
    const result = truncateAndJoinList(strList, 2, fakeApiData.results);
    expect(result).toMatch(/, plus 4 more/);
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

describe('getNumberAtEnd', () => {
  it('should return 1 when given test-1', () => {
    expect(getNumberAtEnd('test-1')).toBe(1);
  });
  it('should return null if there is no number in the string', () => {
    expect(getNumberAtEnd('test')).toBe(null);
  });
  it('should get the last number in the string', () => {
    expect(getNumberAtEnd('test-1-2-3')).toBe(3);
  });
  it('should handle a string that only contains numbers', () => {
    expect(getNumberAtEnd('123')).toBe(123);
  });
});

describe('removeNumberAtEnd', () => {
  it('should return 1 in "test-1"', () => {
    expect(removeNumberAtEnd('test-1')).toBe('test-');
  });
  it('should return the same string if there is no number at the end', () => {
    expect(removeNumberAtEnd('test')).toBe('test');
  });
  it('should return an empty string if the input is just a number', () => {
    expect(removeNumberAtEnd('123')).toBe('');
  });
  it('should not remove the first number', () => {
    expect(removeNumberAtEnd('1-2-3')).toBe('1-2-');
  });
});

describe('getNextLabel', () => {
  it('should append a number to get the next label', () => {
    expect(getNextLabel({ label: 'test' }, [{ label: 'test' }])).toBe('test-1');
  });
  it('should not duplicate labels so that the returned label is unique', () => {
    expect(getNextLabel({ label: 'test' }, [{ label: 'test-1' }])).toBe(
      'test-2'
    );
  });
});
