import { selectiveCopyObject } from './selectiveCopyObject';

const dummyObject = { a: 1, b: { c: 3, d: { e: 4 } } };

describe('selectiveCopyObject utility', () => {
  it('return the original object if no fields are specified', () => {
    expect(selectiveCopyObject([], { ...dummyObject })).toEqual(dummyObject);
  });

  it('ignores specified fields', () => {
    expect(
      selectiveCopyObject(['b', 'c', 'd', 'e'], { ...dummyObject })
    ).toEqual({ a: 1 });
  });

  it('handles nested fields', () => {
    expect(
      selectiveCopyObject(['a', 'b', 'c', 'd', 'e'], { ...dummyObject })
    ).toEqual({});
  });
});
