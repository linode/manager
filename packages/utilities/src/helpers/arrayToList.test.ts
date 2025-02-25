import { describe, expect, it } from 'vitest';

import { arrayToList } from './arrayToList';

describe('Array to delimiter-separated list', () => {
  it('should return a single item as an unaltered string', () => {
    expect(arrayToList(['hello'])).toEqual('hello');
  });

  it('should return a list with two items separated by "and"', () => {
    expect(arrayToList(['hello', 'goodbye'])).toEqual('hello and goodbye');
  });

  it('should return a list with three or more items as Oxford comma separated', () => {
    expect(arrayToList(['hello', 'goodbye', 'good riddance'])).toEqual(
      'hello, goodbye, and good riddance'
    );

    expect(arrayToList(['apples', 'peas', 'carrots', 'peaches'])).toEqual(
      'apples, peas, carrots, and peaches'
    );
  });

  it('should use the delimiter provided', () => {
    expect(
      arrayToList(
        ['Mumbai, IN', 'Toronto, ON', 'Sydney, AU', 'Atlanta, GA'],
        ';'
      )
    ).toEqual('Mumbai, IN; Toronto, ON; Sydney, AU; and Atlanta, GA');
  });

  it('should handle undefined input', () => {
    expect(arrayToList(undefined as any)).toEqual('');
  });
});
