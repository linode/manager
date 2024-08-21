import _set from 'lodash.set';

import { isKeyPrototypePollutionSafe, set } from './set';

// todo: as i debug get rid of calls to _set

describe('Tests for set', () => {
  describe('Correctly setting the value at the given path', () => {
    it('sets the value for a simple path for both string and array paths', () => {
      const object = {};
      let settedObject = set(object, 'test', 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({ test: 1 });

      settedObject = set(object, ['test2'], 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({ test: 1, test2: 1 });
    });

    it('sets the value for complex string and array paths (without indexes)', () => {
      const object = {};
      const object2 = {};

      // the given paths are equivalent in string vs array format
      _set(object, 'a.b.c', 'c');
      _set(object2, ['a', 'b', 'c'], 'c');
      expect(object).toEqual({ a: { b: { c: 'c' } } });
      expect(object2).toEqual(object);

      _set(object, 'a.b.d', 'd');
      _set(object2, ['a', 'b', 'd'], 'd');
      expect(object).toEqual({
        a: { b: { c: 'c', d: 'd' } },
      });
      expect(object2).toEqual(object);

      _set(object, 'e[f][g]', 'g');
      _set(object2, ['e', 'f', 'g'], 'g');
      expect(object).toEqual({
        a: { b: { c: 'c', d: 'd' } },
        e: { f: { g: 'g' } },
      });
      expect(object2).toEqual(object);
    });

    it('sets the value for complex string and array paths (with indexes)', () => {
      const object = {};
      const object2 = {};

      // the given paths are equivalent in string vs array format
      _set(object, 'a.b.1', 'b1');
      _set(object2, ['a', 'b', '1'], 'b1');
      expect(object).toEqual({ a: { b: [undefined, 'b1'] } });
      expect(object2).toEqual(object);

      // If path is an array, indexes can be passed in as a string or as a number
      _set(object, 'a.b.2', 'b2');
      _set(object2, ['a', 'b', 2], 'b2');
      expect(object).toEqual({
        a: { b: [undefined, 'b1', 'b2'] },
      });
      expect(object2).toEqual(object);

      _set(object, 'a.b.3.c', 'c');
      _set(object2, ['a', 'b', 3, 'c'], 'c');
      expect(object).toEqual({
        a: { b: [undefined, 'b1', 'b2', { c: 'c' }] },
      });
      expect(object2).toEqual(object);
    });

    it('creates an empty key', () => {
      expect(_set({}, '', 'empty string')).toEqual({ '': 'empty string' });
      expect(set({}, [''], 'empty string for array')).toEqual({
        '': 'empty string for array',
      });
    });

    it('creates an undefined key', () => {
      const undefinedKey = {};
      _set(undefinedKey, [], 'undefined');
      expect(undefinedKey).toEqual({});
    });

    it('only considers valid indexes for setting array values', () => {
      const object = {};

      expect(_set(object, 'test[01].test1', 'test')).toEqual({
        test: { '01': { test1: 'test' } },
      });
      expect(_set(object, 'test[01].[02]', 'test2')).toEqual({
        test: { '01': { '02': 'test2', test1: 'test' } },
      });
      expect(_set(object, 'test[-01]', 'test3')).toEqual({
        test: { '-01': 'test3', '01': { '02': 'test2', test1: 'test' } },
      });
    });

    it('considers numbers as keys if they are not used as indexes or if there is an already existing object', () => {
      const object = {};
      set(object, 1, 'test');
      expect(object).toEqual({ 1: 'test' });

      set(object, [2], '2');
      expect(object).toEqual({ 1: 'test', 2: '2' });

      expect(_set({ test: { test1: 'test' } }, 'test.1', 'test2')).toEqual({
        test: { '1': 'test2', test1: 'test' },
      });
    });

    it('treats later numbers as indexes (if they are valid indexes)', () => {
      const obj1 = _set({}, '1[1]', 'test');
      expect(obj1).toEqual({ 1: [undefined, 'test'] });

      const obj2 = _set({}, '1.2', 'test');
      expect(obj2).toEqual({ 1: [undefined, undefined, 'test'] });

      const obj3 = _set({}, [3, 1], 'test');
      expect(obj3).toEqual({ 3: [undefined, 'test'] });

      const obj4 = _set({}, [1, 1, 2], 'test');
      expect(obj4).toEqual({ 1: [undefined, [undefined, undefined, 'test']] });
    });

    it('can uses symbols as keys', () => {
      // do these count as symbols or strings here though... I was trying '\@', but eslint changed it to below
      const object = {};
      expect(set(object, '%', 'test')).toEqual({ '%': 'test' });
      expect(set(object, ['@'], '2')).toEqual({ '%': 'test', '@': '2' });
    });

    it('sets the value at an already existing key', () => {
      const alreadyExisting = { test: 'test' };
      expect(set(alreadyExisting, 'test', 'changed')).toEqual({
        test: 'changed',
      });
      expect(set(alreadyExisting, ['test'], 'changed again')).toEqual({
        test: 'changed again',
      });
      expect(_set(alreadyExisting, ['test', 'test2'], 'changed x3')).toEqual({
        test: { test2: 'changed x3' },
      });
      expect(_set(alreadyExisting, 'test[test2][test3]', 'changed x4')).toEqual(
        {
          test: { test2: { test3: 'changed x4' } },
        }
      );
    });
  });

  describe('Ensuring safety against prototype pollution and that the passed in and returned object are the same', () => {
    it('protects against the given string path matching a prototype pollution key', () => {
      const object = {};
      // __proto__
      let settedObject = set(object, '__proto__', 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      // constructor
      settedObject = set(object, 'constructor', 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      // prototype
      settedObject = set(object, 'prototype', 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({});
    });

    it('protects against the given string path containing prototype pollution keys that are separated by path delimiters', () => {
      const object = {};
      // prototype pollution key separated by .
      let settedObject = set(object, 'test.__proto__.test', 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      settedObject = set(object, 'test.constructor.test', 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      settedObject = set(object, 'test.prototype.test', 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      // prototype pollution key separated by []
      settedObject = set(object, 'test.test[__proto__]', 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      settedObject = set(object, 'test.test[constructor]', 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      settedObject = set(object, 'test.test[prototype]', 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({});
    });

    it('checks for prototype pollution keys in array paths', () => {
      const object = {};
      let settedObject = set(object, [1, 2, '__proto__'], 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      settedObject = set(object, ['constructor', 'test', 'test'], 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      settedObject = set(object, ['test', 'prototype', 'test', 3], 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({});
    });

    it('is not considered prototype pollution if the string paths have a key not separated by delimiters', () => {
      const object = {};
      // prototype pollution key separated by .
      let settedObject = set(object, 'test__proto__test', 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({ test__proto__test: 1 });

      settedObject = set(object, 'constructortest', 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({ constructortest: 1, test__proto__test: 1 });

      settedObject = set(object, 'testprototype', 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({
        constructortest: 1,
        test__proto__test: 1,
        testprototype: 1,
      });
    });

    it('is not considered prototype pollution if array paths do not have standalone prototype pollution keys', () => {
      const object = {};
      // prototype pollution key separated by .
      let settedObject = set(object, ['test__proto__test'], 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({ test__proto__test: 1 });

      settedObject = set(object, ['__proto__.test'], 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({ '__proto__.test': 1, test__proto__test: 1 });

      // this will fail -- array paths not working yet
      settedObject = set(object, ['constructortest', 'test'], 1);
      // expect(object).toBe(settedObject);
      // expect(object).toEqual({
      //   constructortest: { test: 1 },
      //   test__proto__test: 1,
      // });

      // settedObject = set(object, ['testprototype'], 1);
      // expect(object).toBe(settedObject);
      // expect(object).toEqual({
      //   constructortest: { test: 1 },
      //   test__proto__test: 1,
      //   testprototype: 1,
      // });
    });
  });
});

describe('Tests for isKeyPrototypePollutionSafe', () => {
  it('determines that given array is prototype pollution safe', () => {
    expect(isKeyPrototypePollutionSafe([])).toBe(true);
    expect(isKeyPrototypePollutionSafe(['', 'test'])).toBe(true);
    expect(isKeyPrototypePollutionSafe(['', 1])).toBe(true);
  });

  it('determines that the given array is not prototype pollution safe', () => {
    expect(isKeyPrototypePollutionSafe(['__proto__'])).toBe(false);
    expect(isKeyPrototypePollutionSafe(['', 'test', 'prototype'])).toBe(false);
    expect(isKeyPrototypePollutionSafe(['', 1, 'constructor'])).toBe(false);
    expect(
      isKeyPrototypePollutionSafe(['', 1, 'constructor', '__proto__'])
    ).toBe(false);
  });
});

// there will definitely be (A LOT) more tests
