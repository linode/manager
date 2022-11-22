import { truncateAndJoinList, addOrdinalSuffix } from './stringUtils';

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

describe('addOrdinalSuffix', () => {
  it('returns the correct ordinal suffix for numbers ending with 1', () => {
    const suffixFor1 = addOrdinalSuffix(1);
    expect(suffixFor1).toBe('1st');

    const suffixFor21 = addOrdinalSuffix(21);
    expect(suffixFor21).toBe('21st');
  });

  it('returns the correct ordinal suffix for numbers ending with 2', () => {
    const suffixFor2 = addOrdinalSuffix(2);
    expect(suffixFor2).toBe('2nd');

    const suffixFor32 = addOrdinalSuffix(32);
    expect(suffixFor32).toBe('32nd');
  });

  it('returns the correct ordinal suffix for numbers ending with 3', () => {
    const suffixFor3 = addOrdinalSuffix(3);
    expect(suffixFor3).toBe('3rd');

    const suffixFor43 = addOrdinalSuffix(43);
    expect(suffixFor43).toBe('43rd');
  });

  it('returns the correct ordinal suffix for other numbers', () => {
    const suffixFor5 = addOrdinalSuffix(5);
    expect(suffixFor5).toBe('5th');
  });
});
