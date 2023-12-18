import { act, renderHook } from '@testing-library/react';

import { useSet } from './useSet';

describe('useSet', () => {
  it('adds to the set', () => {
    const { result } = renderHook(() => useSet());
    act(() => {
      result.current.add(1);
    });
    expect(result.current.has(1)).toBe(true);
  });

  it('deletes from the set', () => {
    const { result } = renderHook(() => useSet([1]));
    act(() => {
      result.current.delete(1);
    });
    expect(result.current.has(1)).toBe(false);
  });
});
