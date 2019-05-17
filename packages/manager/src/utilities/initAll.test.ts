import { initAll } from './initAll';

describe('initAll', () => {
  it('removes the last element of every found array', () => {
    const obj = {
      x: [1, 2, 3],
      y: {
        z: [1, 2, 3]
      }
    };
    expect(initAll(obj).x).toEqual([1, 2]);
    expect(initAll(obj).y.z).toEqual([1, 2]);
  });

  it('leaves non-arrays untouched', () => {
    const obj = {
      a: null,
      b: undefined,
      c: true,
      d: 1,
      e: 'hello',
      f: new Date(),
      g: () => null,
      h: { x: {} }
    };
    expect(initAll(obj)).toEqual(obj);
  });

  it('works with a single array', () => {
    expect(initAll([1, 2, 3])).toEqual([1, 2]);
  });
});
