import { tail } from './tail';

describe('tail utility function', () => {
  it('should return all but the first element of an array', () => {
    expect(tail([1, 2, 3])).toEqual([2, 3]);
    expect(tail([1])).toEqual([]);
    expect(tail([])).toEqual([]);
  });

  it('should return an empty array when passed an empty array', () => {
    expect(tail([])).toEqual([]);
  });

  it('should return an empty array when passed an array with one element', () => {
    expect(tail([1])).toEqual([]);
  });

  it('should return an empty array when passed an empty array', () => {
    expect(tail([])).toEqual([]);
  });
});
