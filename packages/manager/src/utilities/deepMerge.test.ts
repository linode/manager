import { deepMerge } from './deepMerge';

describe('deepMerge', () => {
  it('should merge two objects', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should merge two nested objects', () => {
    const target = { a: { b: 1, c: 2 } };
    const source = { a: { c: 3, d: 4 } };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: { b: 1, c: 3, d: 4 } });
  });

  it('should merge two deeply nested objects', () => {
    const target = { a: { b: { c: 1, d: 2 } } };
    const source = { a: { b: { d: 3, e: 4 } } };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: { b: { c: 1, d: 3, e: 4 } } });
  });

  it('should merge two objects and arrays', () => {
    const target = { a: [1, 2], b: 3 };
    const source = { a: [4, 5], c: 6 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: [4, 5], b: 3, c: 6 });
  });

  it('should merge two deeply nested objects and arrays', () => {
    const target = { a: { b: [1, 2], c: 3 } };
    const source = { a: { b: [4, 5], d: 6 } };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: { b: [4, 5], c: 3, d: 6 } });
  });

  it('should merge two objects with different types', () => {
    const target = { a: 1, b: 2 };
    const source = { a: [3, 4], c: 5 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: [3, 4], b: 2, c: 5 });
  });

  it('should merge two objects with different types and nested objects', () => {
    const target = { a: { b: 1, c: 2 } };
    const source = { a: [3, 4], d: 5 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: [3, 4], d: 5 });
  });
});
