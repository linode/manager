import { splitArrayAt, splitStringAt } from './splitAt';

describe('splitArrayAt', () => {
  it('splits an array at the given index', () => {
    const result = splitArrayAt(3, [1, 2, 3, 4, 5]);
    expect(result).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
  });

  it('splits an array when index is 0', () => {
    const result = splitArrayAt(0, [1, 2, 3, 4, 5]);
    expect(result).toEqual([[], [1, 2, 3, 4, 5]]);
  });

  it('splits an array when index is the length of the array', () => {
    const result = splitArrayAt(5, [1, 2, 3, 4, 5]);
    expect(result).toEqual([[1, 2, 3, 4, 5], []]);
  });

  it('splits an array when index is the (length - 1) of the array', () => {
    const result = splitArrayAt(4, [1, 2, 3, 4, 5]);
    expect(result).toEqual([[1, 2, 3, 4], [5]]);
  });

  it('splits an empty array', () => {
    const result = splitArrayAt(0, []);
    expect(result).toEqual([[], []]);
  });

  it('splits an array of one element', () => {
    const result = splitArrayAt(1, [1]);
    expect(result).toEqual([[1], []]);
  });

  it('splits an array at the given negative index', () => {
    const result = splitArrayAt(-1, [1, 2, 3, 4, 5]);
    expect(result).toEqual([[1, 2, 3, 4], [5]]);
  });
});

describe('splitStringAt', () => {
  it('splits a string at the given index', () => {
    const result = splitStringAt(3, 'abcdefgh');
    expect(result).toEqual(['abc', 'defgh']);
  });

  it('splits a string when index is 0', () => {
    const result = splitStringAt(0, 'abcdefgh');
    expect(result).toEqual(['', 'abcdefgh']);
  });

  it('splits a string when index is the length of the string', () => {
    const result = splitStringAt(8, 'abcdefgh');
    expect(result).toEqual(['abcdefgh', '']);
  });

  it('splits a string when index is the (length - 1) of the string', () => {
    const result = splitStringAt(7, 'abcdefgh');
    expect(result).toEqual(['abcdefg', 'h']);
  });

  it('splits an empty string', () => {
    const result = splitStringAt(0, '');
    expect(result).toEqual(['', '']);
  });

  it('splits a string with one character', () => {
    const result = splitStringAt(1, 'a');
    expect(result).toEqual(['a', '']);
  });

  it('splits a string at the given negative index', () => {
    const result = splitStringAt(-1, 'abcdefgh');
    expect(result).toEqual(['abcdefg', 'h']);
  });
});
