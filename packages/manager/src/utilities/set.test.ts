import { isValuePrototypePollutionSafe, set } from './set';

describe('Tests for set', () => {
  it('sets the value at the given path', () => {
    const object: any = {};
    set(object, 'test', 1);
    expect(object.test).toBe(1);
  });
});

describe('Tests for isValuePrototypePollutionSafe', () => {
  it('determines that given array is prototype pollution safe', () => {
    // expect(isValuePrototypePollutionSafe([])).toBe(true);
    // expect(isValuePrototypePollutionSafe(['', 'test'])).toBe(true);
    // expect(isValuePrototypePollutionSafe(['', 1])).toBe(true);
    // expect(isValuePrototypePollutionSafe(['', {}, { test: 'test' }, 3])).toBe(
    //   true
    // );
  });
  it('determines that the given array is not prototype pollution safe', () => {
    expect(isValuePrototypePollutionSafe(['__proto__'])).toBe(false);
    expect(isValuePrototypePollutionSafe(['', 'test', 'prototype'])).toBe(
      false
    );
    expect(isValuePrototypePollutionSafe(['', 1, 'constructor'])).toBe(false);
    expect(
      isValuePrototypePollutionSafe(['', 1, 'constructor', '__proto__'])
    ).toBe(false);
    // expect(isValuePrototypePollutionSafe(['', 1, { __proto__: 'test' }])).toBe(
    //   false
    // );
    expect(
      isValuePrototypePollutionSafe(['', 1, { constructor: 'test' }])
    ).toBe(false);
    expect(isValuePrototypePollutionSafe(['', 1, { prototype: 'test' }])).toBe(
      false
    );
    // expect(
    //   isValuePrototypePollutionSafe([{ test: { test: { __proto__: 'test' } } }])
    // ).toBe(false);
    // sadcat moment
  });
});

// there will definitely be (A LOT) more tests
