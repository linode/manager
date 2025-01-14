import {
  getFormikErrorsFromAPIErrors,
  handleAPIErrors,
  set,
} from './formikErrorUtils';

const errorWithoutField = [{ reason: 'Internal server error' }];
const errorWithField = [
  { field: 'data.card_number', reason: 'Invalid credit card number' },
];

afterEach(() => {
  vi.clearAllMocks();
});

const setFieldError = vi.fn();
const setError = vi.fn();

describe('handleAPIErrors', () => {
  it('should handle api error with a field', () => {
    handleAPIErrors(errorWithField, setFieldError, setError);
    expect(setFieldError).toHaveBeenCalledWith(
      'card_number',
      errorWithField[0].reason
    );
    expect(setError).not.toHaveBeenCalled();
  });

  it('should handle a general api error', () => {
    handleAPIErrors(errorWithoutField, setFieldError, setError);
    expect(setFieldError).not.toHaveBeenCalledWith();
    expect(setError).toHaveBeenCalledWith(errorWithoutField[0].reason);
  });
});

describe('getFormikErrorsFromAPIErrors', () => {
  it('should convert APIError[] to errors in the shape formik expects', () => {
    const testCases = [
      {
        apiErrors: [{ field: 'ip', reason: 'Incorrect IP' }],
        expected: {
          ip: 'Incorrect IP',
        },
      },
      {
        apiErrors: [
          {
            field: 'rules[1].match_condition.match_value',
            reason: 'Bad Match Value',
          },
          {
            field: 'rules[1].match_condition.match_field',
            reason: 'Bad Match Type',
          },
          {
            field: 'rules[1].service_targets[0].id',
            reason: 'Service Target does not exist',
          },
          {
            field: 'rules[1].service_targets[0].percentage',
            reason: 'Invalid percentage',
          },
          {
            field: 'rules[1].match_condition.session_stickiness_ttl',
            reason: 'Invalid TTL',
          },
          {
            field: 'rules[1].match_condition.session_stickiness_cookie',
            reason: 'Invalid Cookie',
          },
          {
            field: 'rules[1].match_condition.hostname',
            reason: 'Hostname is not valid',
          },
          {
            reason: 'A backend service is down',
          },
          {
            reason: 'You reached a rate limit',
          },
        ],
        expected: {
          rules: [
            undefined,
            {
              match_condition: {
                hostname: 'Hostname is not valid',
                match_field: 'Bad Match Type',
                match_value: 'Bad Match Value',
                session_stickiness_cookie: 'Invalid Cookie',
                session_stickiness_ttl: 'Invalid TTL',
              },
              service_targets: [
                {
                  id: 'Service Target does not exist',
                  percentage: 'Invalid percentage',
                },
              ],
            },
          ],
        },
      },
    ];

    for (const { apiErrors, expected } of testCases) {
      expect(getFormikErrorsFromAPIErrors(apiErrors)).toEqual(expected);
    }
  });
});

describe('Tests for set', () => {
  it("returns the passed in 'object' as is if it's not actually a (non array) object", () => {
    expect(set([], 'path not needed', '1')).toEqual([]);
  });

  describe('Correctly setting the value at the given path', () => {
    it('sets the value for a simple path', () => {
      const object = {};
      let settedObject = set(object, 'test', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({ test: '1' });

      settedObject = set(object, 'test2', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({ test: '1', test2: '1' });
    });

    it('sets the value for complex string paths (without indexes)', () => {
      const object = {};

      set(object, 'a.b.c', 'c');
      expect(object).toEqual({ a: { b: { c: 'c' } } });

      set(object, 'a.b.d', 'd');
      expect(object).toEqual({
        a: { b: { c: 'c', d: 'd' } },
      });

      set(object, 'e[f][g]', 'g');
      expect(object).toEqual({
        a: { b: { c: 'c', d: 'd' } },
        e: { f: { g: 'g' } },
      });
    });

    it('sets the value for complex string paths (with indexes)', () => {
      const object = {};

      set(object, 'a.b.1', 'b1');
      expect(object).toEqual({ a: { b: [undefined, 'b1'] } });
      set(object, 'a.b[0]', '5');
      expect(object).toEqual({ a: { b: ['5', 'b1'] } });

      set(object, 'a.b.2', 'b2');
      expect(object).toEqual({
        a: { b: ['5', 'b1', 'b2'] },
      });

      set(object, 'a.b[3].c', 'c');
      expect(object).toEqual({
        a: { b: ['5', 'b1', 'b2', { c: 'c' }] },
      });
    });

    it('only considers 0 or positive integers for setting array values', () => {
      const object = {};

      expect(set(object, 'test[-01].test1', 'test')).toEqual({
        test: { '-01': { test1: 'test' } },
      });
      expect(set(object, 'test[-01][-02]', 'test2')).toEqual({
        test: { '-01': { '-02': 'test2', test1: 'test' } },
      });
      expect(set(object, 'test[   02]', 'test3')).toEqual({
        test: {
          '   02': 'test3',
          '-01': { '-02': 'test2', test1: 'test' },
        },
      });
      expect(set(object, 'test[0 0]', 'test4')).toEqual({
        test: {
          '   02': 'test3',
          '-01': { '-02': 'test2', test1: 'test' },
          '0 0': 'test4',
        },
      });
    });

    it('considers numbers as keys if they are not followed by another number', () => {
      const object = {};
      set(object, '1', 'test');
      expect(object).toEqual({ 1: 'test' });

      set(object, '2', '2');
      expect(object).toEqual({ 1: 'test', 2: '2' });
    });

    it('treats numbers as array indexes if they precede some previous key (if they are valid integers >= 0)', () => {
      const obj1 = set({}, '1[1]', 'test');
      expect(obj1).toEqual({ 1: [undefined, 'test'] });

      const obj2 = set({}, '1.2', 'test');
      expect(obj2).toEqual({ 1: [undefined, undefined, 'test'] });
    });

    it('can replace the value at an already existing key', () => {
      const alreadyExisting = { test: 'test' };
      expect(set(alreadyExisting, 'test', 'changed')).toEqual({
        test: 'changed',
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
  });

  describe('Ensuring safety against prototype pollution and that the passed in and returned object are the same', () => {
    it('protects against the given string path matching a prototype pollution key', () => {
      const object = {};
      // __proto__
      let settedObject = set(object, '__proto__', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      // constructor
      settedObject = set(object, 'constructor', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      // prototype
      settedObject = set(object, 'prototype', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({});
    });

    it('protects against the given string path containing prototype pollution keys that are separated by path delimiters', () => {
      const object = {};
      // prototype pollution key separated by .
      let settedObject = set(object, 'test.__proto__.test', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      settedObject = set(object, 'test.constructor.test', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      settedObject = set(object, 'test.prototype.test', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      // prototype pollution key separated by []
      settedObject = set(object, 'test.test[__proto__]', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      settedObject = set(object, 'test.test[constructor]', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({});

      settedObject = set(object, 'test.test[prototype]', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({});
    });

    it('is not considered prototype pollution if the string paths have a key not separated by delimiters', () => {
      const object = {};
      // prototype pollution key separated by .
      let settedObject = set(object, 'test__proto__test', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({ test__proto__test: '1' });

      settedObject = set(object, 'constructortest', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({ constructortest: '1', test__proto__test: '1' });

      settedObject = set(object, 'testprototype', '1');
      expect(object).toBe(settedObject);
      expect(object).toEqual({
        constructortest: '1',
        test__proto__test: '1',
        testprototype: '1',
      });
    });
  });
});
