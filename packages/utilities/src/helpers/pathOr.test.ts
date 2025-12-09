import { describe, expect, it } from 'vitest';

import { pathOr } from './pathOr';

describe('pathOr helper function', () => {
  it('should return the value for a valid key in a simple object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(pathOr(0, ['b'], obj)).toBe(2);
  });

  it('should return the default value if the key is missing in a simple object', () => {
    const obj = { a: 1, b: 2 };
    expect(pathOr(0, ['c'], obj)).toBe(0);
  });

  it('should return a value from a deeply nested object', () => {
    const obj = { a: { b: { c: { d: 5 } } } };
    expect(pathOr(0, ['a', 'b', 'c', 'd'], obj)).toBe(5);
  });

  it('should return the default value if a nested path is invalid', () => {
    const obj = { a: { b: { c: { d: 5 } } } };
    expect(pathOr(0, ['a', 'b', 'x', 'y'], obj)).toBe(0);
  });

  it('should access values inside an array of objects', () => {
    const obj = [{ id: 1 }, { id: 2, name: 'Test' }];
    expect(pathOr('N/A', [1, 'name'], obj)).toBe('Test');
  });

  it('should return the default value for missing keys in an array of objects', () => {
    const obj = [{ id: 1 }, { id: 2 }];
    expect(pathOr('N/A', [1, 'name'], obj)).toBe('N/A');
  });

  it('should access values in an object containing arrays', () => {
    const obj = { a: [10, 20, 30], b: [40, 50] };
    expect(pathOr(0, ['a', 1], obj)).toBe(20);
  });

  it('should return the default value if the index is out of bounds', () => {
    const obj = { a: [10, 20] };
    expect(pathOr(-1, ['a', 5], obj)).toBe(-1);
  });

  it('should access elements in a pure array', () => {
    const obj = [100, 200, 300];
    expect(pathOr(0, [2], obj)).toBe(300);
  });

  it('should return the default value for out-of-bounds array access', () => {
    const obj = [100, 200, 300];
    expect(pathOr(0, [5], obj)).toBe(0);
  });

  it('should return the default value when the object is undefined', () => {
    expect(pathOr('default', ['a', 'b'], undefined)).toBe('default');
  });

  it('should return the entire object if the path is empty', () => {
    const obj = { a: 1 };
    expect(pathOr('default', [], obj)).toEqual(obj);
  });

  it('should return the default value when encountering null in the path', () => {
    const obj = { a: { b: null } };
    expect(pathOr('default', ['a', 'b', 'c'], obj)).toBe('default');
  });

  it('should return the default value for non-existent nested properties', () => {
    const obj = { a: { b: { c: 10 } } };
    expect(pathOr('not found', ['a', 'x', 'y'], obj)).toBe('not found');
  });
});
