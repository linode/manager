import {
  determinePath,
  isPrototypePollutionSafe,
  isValidIndex,
  set,
} from './set';

describe('Tests for set', () => {
  it("returns the passed in 'object' as is if it's not actually a (non array) object", () => {
    expect(set([], 'path not needed', 3)).toEqual([]);
  });

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
      set(object, 'a.b.c', 'c');
      set(object2, ['a', 'b', 'c'], 'c');
      expect(object).toEqual({ a: { b: { c: 'c' } } });
      expect(object2).toEqual(object);

      set(object, 'a.b.d', 'd');
      set(object2, ['a', 'b', 'd'], 'd');
      expect(object).toEqual({
        a: { b: { c: 'c', d: 'd' } },
      });
      expect(object2).toEqual(object);

      set(object, 'e[f][g]', 'g');
      set(object2, ['e', 'f', 'g'], 'g');
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
      set(object, 'a.b.1', 'b1');
      set(object2, ['a', 'b', '1'], 'b1');
      expect(object).toEqual({ a: { b: [undefined, 'b1'] } });
      expect(object2).toEqual(object);
      set(object, 'a.b[0]', 5);
      set(object2, ['a', 'b', 0], 5);
      expect(object).toEqual({ a: { b: [5, 'b1'] } });
      expect(object2).toEqual(object);

      // If path is an array, indexes can be passed in as a string or as a number
      set(object, 'a.b.2', 'b2');
      set(object2, ['a', 'b', 2], 'b2');
      expect(object).toEqual({
        a: { b: [5, 'b1', 'b2'] },
      });
      expect(object2).toEqual(object);

      set(object, 'a.b[3].c', 'c');
      set(object2, ['a', 'b', 3, 'c'], 'c');
      expect(object).toEqual({
        a: { b: [5, 'b1', 'b2', { c: 'c' }] },
      });
      expect(object2).toEqual(object);
    });

    it('creates an empty string key', () => {
      expect(set({}, '', 'empty string')).toEqual({ '': 'empty string' });
      expect(set({}, [''], 'empty string for array')).toEqual({
        '': 'empty string for array',
      });
    });

    it('does not set anything if no path is given', () => {
      expect(set({}, [], 'should not set')).toEqual({});
    });

    it('only considers valid indexes for setting array values', () => {
      const object = {};

      expect(set(object, 'test[01].test1', 'test')).toEqual({
        test: { '01': { test1: 'test' } },
      });
      expect(set(object, 'test[01].[02]', 'test2')).toEqual({
        test: { '01': { '02': 'test2', test1: 'test' } },
      });
      expect(set(object, 'test[-01]', 'test3')).toEqual({
        test: { '-01': 'test3', '01': { '02': 'test2', test1: 'test' } },
      });
      expect(set(object, 'test[   02]', 'test4')).toEqual({
        test: {
          '   02': 'test4',
          '-01': 'test3',
          '01': { '02': 'test2', test1: 'test' },
        },
      });
      expect(set(object, 'test[00]', 'test5')).toEqual({
        test: {
          '   02': 'test4',
          '-01': 'test3',
          '00': 'test5',
          '01': { '02': 'test2', test1: 'test' },
        },
      });
    });

    it('considers numbers as keys if they are not followed by another number or if there is an already existing object', () => {
      const object = {};
      set(object, 1, 'test');
      expect(object).toEqual({ 1: 'test' });

      set(object, [2], '2');
      expect(object).toEqual({ 1: 'test', 2: '2' });

      expect(set({ test: { test1: 'test' } }, 'test[1]', 'test2')).toEqual({
        test: { '1': 'test2', test1: 'test' },
      });
    });

    it('treats numbers as array indexes if they precede some previous key (if they are valid indexes)', () => {
      const obj1 = set({}, '1[1]', 'test');
      expect(obj1).toEqual({ 1: [undefined, 'test'] });

      const obj2 = set({}, '1.2', 'test');
      expect(obj2).toEqual({ 1: [undefined, undefined, 'test'] });

      const obj3 = set({}, [3, 1], 'test');
      expect(obj3).toEqual({ 3: [undefined, 'test'] });

      const obj4 = set({}, [1, 1, 2], 'test');
      expect(obj4).toEqual({ 1: [undefined, [undefined, undefined, 'test']] });
    });

    it('can use symbols as keys', () => {
      const object = {};
      const symbolTest = Symbol('test');
      expect(set(object, symbolTest, 'test')).toEqual({
        [symbolTest]: 'test',
      });
      const symbolAt = Symbol('@');
      expect(set(object, [symbolAt], '2')).toEqual({
        [symbolAt]: '2',
        [symbolTest]: 'test',
      });
    });

    it('can replace the value at an already existing key', () => {
      const alreadyExisting = { test: 'test' };
      expect(set(alreadyExisting, 'test', 'changed')).toEqual({
        test: 'changed',
      });
      expect(set(alreadyExisting, ['test'], 'changed again')).toEqual({
        test: 'changed again',
      });
      expect(set(alreadyExisting, ['test', 'test2'], 'changed x3')).toEqual({
        test: { test2: 'changed x3' },
      });
      expect(set(alreadyExisting, 'test[test2][test3]', 'changed x4')).toEqual({
        test: { test2: { test3: 'changed x4' } },
      });
    });

    it('sets the value for nonstandard paths', () => {
      expect(set({}, 'test.[.test]', 'testing 2')).toEqual({
        test: { test: 'testing 2' },
      });
      expect(set({}, 'test.[te[st]', 'testing 3')).toEqual({
        test: { te: { st: 'testing 3' } },
      });
      expect(set({}, 'test.]test', 'testing 4')).toEqual({
        test: { test: 'testing 4' },
      });
    });

    // it will take an incredible amount of effort to get set to this level of finesse
    it.skip('sets the value for non standard paths - not working currently', () => {
      expect(set({}, 'test.[]', 'testing 5')).toEqual({
        test: { '': { '': 'testing 5' } },
      });
      expect(set({}, '[].test', 'testing 6')).toEqual({
        '': { test: 'testing 6' },
      });
      expect(set({}, '.', 'testing 7')).toEqual({
        '': { '': 'testing 7' },
      });
      expect(set({}, '[', 'testing 8')).toEqual({
        '[': 'testing 8',
      });
      expect(set({}, ']', 'testing 9')).toEqual({
        ']': 'testing 9',
      });
      expect(set({}, 'test..test', 'testing')).toEqual({
        test: { '': { test: 'testing' } },
      });
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
      let settedObject = set(object, ['test__proto__test'], 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({ test__proto__test: 1 });

      settedObject = set(object, ['__proto__.test'], 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({ '__proto__.test': 1, test__proto__test: 1 });

      settedObject = set(object, ['constructortest', 'test'], 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({
        '__proto__.test': 1,
        constructortest: { test: 1 },
        test__proto__test: 1,
      });

      settedObject = set(object, ['testprototype'], 1);
      expect(object).toBe(settedObject);
      expect(object).toEqual({
        '__proto__.test': 1,
        constructortest: { test: 1 },
        test__proto__test: 1,
        testprototype: 1,
      });
    });
  });
});

describe('Tests for determinePath', () => {
  const symbol = Symbol();
  it('returns array paths as is', () => {
    expect(determinePath([])).toEqual([]);
    expect(determinePath([symbol, '1', 1])).toEqual([symbol, '1', 1]);
  });

  it('determines string paths, parsing them as needed', () => {
    expect(determinePath('')).toEqual(['']);
    expect(determinePath('test')).toEqual(['test']);
    expect(determinePath('test.test')).toEqual(['test', 'test']);
    expect(determinePath('test[1]')).toEqual(['test', '1']);
    expect(determinePath('a.b[1]')).toEqual(['a', 'b', '1']);
    expect(determinePath('a.b[1].c')).toEqual(['a', 'b', '1', 'c']);
    expect(determinePath('a.__proto__.c')).toEqual(['a', '__proto__', 'c']);
    expect(determinePath('a.__proto__[2]')).toEqual(['a', '__proto__', '2']);
  });

  it('returns symbol and number paths inside an array', () => {
    expect(determinePath(symbol)).toEqual([symbol]);
    expect(determinePath(1)).toEqual([1]);
  });
});

describe('Tests for isPrototypePollutionSafe', () => {
  it('determines that given array is prototype pollution safe', () => {
    expect(isPrototypePollutionSafe([])).toBe(true);
    expect(isPrototypePollutionSafe(['', 'test'])).toBe(true);
    expect(isPrototypePollutionSafe(['', 1])).toBe(true);
  });

  it('determines that the given array is not prototype pollution safe', () => {
    expect(isPrototypePollutionSafe(['__proto__'])).toBe(false);
    expect(isPrototypePollutionSafe(['', 'test', 'prototype'])).toBe(false);
    expect(isPrototypePollutionSafe(['', 1, 'constructor'])).toBe(false);
    expect(isPrototypePollutionSafe(['', 1, 'constructor', '__proto__'])).toBe(
      false
    );
  });
});

describe('Tests for isValidIndex', () => {
  it('is a valid index', () => {
    expect(isValidIndex(0)).toBe(true);
    expect(isValidIndex(1)).toBe(true);
    expect(isValidIndex('0')).toBe(true);
    expect(isValidIndex('0')).toBe(true);
    expect(isValidIndex(2432)).toBe(true);
    expect(isValidIndex('2432')).toBe(true);
  });

  it('is not a valid index', () => {
    expect(isValidIndex(Symbol(1))).toBe(false);
    expect(isValidIndex(-1)).toBe(false);
    expect(isValidIndex('00')).toBe(false);
    expect(isValidIndex('abcd')).toBe(false);
    expect(isValidIndex('-1')).toBe(false);
    expect(isValidIndex('01')).toBe(false);
    expect(isValidIndex('-01')).toBe(false);
    expect(isValidIndex('00001')).toBe(false);
    expect(isValidIndex('1 1')).toBe(false);
    expect(isValidIndex('1 ')).toBe(false);
    expect(isValidIndex(' 1 ')).toBe(false);
    expect(isValidIndex(' 1')).toBe(false);
    expect(isValidIndex('abcd')).toBe(false);
  });
});
