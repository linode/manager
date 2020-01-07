import { selectiveCopyObject } from './selectiveCopyObject';

const dummyObject = { a: 1, b: { c: 3, d: { e: 4 } } };

describe('selectiveCopyObject utility', () => {
  it('return an empty object if no fields are specified', () => {
    expect(selectiveCopyObject([], { ...dummyObject })).toEqual({});
  });

  it('copies specified fields', () => {
    expect(selectiveCopyObject(['a'], { ...dummyObject })).toEqual({ a: 1 });
  });

  it('handles nested fields', () => {
    expect(
      selectiveCopyObject(['a', 'b', 'c', 'd', 'e'], { ...dummyObject })
    ).toEqual(dummyObject);
  });
});
