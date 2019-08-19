import { shallowCompareProps } from './shallowCompareProps';

interface MockProps {
  a: number;
  b: number;
  c: number[];
}

describe('shallowCompareProps', () => {
  const prevProps: MockProps = {
    a: 1,
    b: 2,
    c: [3, 4]
  };

  it('should return `true` if the given props are shallowly equal.', () => {
    const nextProps: MockProps = {
      a: 1,
      b: 2,
      c: [3, 4]
    };
    const result1 = shallowCompareProps<MockProps>(['a'], prevProps, nextProps);
    const result2 = shallowCompareProps<MockProps>(
      ['a', 'b'],
      prevProps,
      nextProps
    );
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });

  it('should return `false`` if the given props are NOT shallowly equal.', () => {
    const nextProps: MockProps = {
      a: 10,
      b: 20,
      c: [3, 4]
    };
    const result1 = shallowCompareProps<MockProps>(['a'], prevProps, nextProps);
    const result2 = shallowCompareProps<MockProps>(
      ['a', 'b'],
      prevProps,
      nextProps
    );
    const result3 = shallowCompareProps<MockProps>(['c'], prevProps, nextProps);
    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });
});
