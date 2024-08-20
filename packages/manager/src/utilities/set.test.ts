import { isValuePrototypePollutionSafe, set } from './set';

describe('Tests for set', () => {
  it('sets the value at the given path', () => {
    const object: any = {};
    set(object, 'test', 1);
    expect(object.test).toBe(1);
  });
});

describe('Tests for isValuePrototypePollutionSafe', () => {
  it('checks if the given array is prototype pollution safe', () => {
    expect(isValuePrototypePollutionSafe([])).toBe(true);
  });
});

// there will definitely be (A LOT) more tests
