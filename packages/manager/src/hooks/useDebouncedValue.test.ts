import { act, renderHook } from '@testing-library/react';

import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  it('debounces the provided value by the given delay', () => {
    vi.useFakeTimers();

    const { rerender, result } = renderHook(
      ({ value }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'test' } }
    );

    expect(result.current).toBe('test');

    rerender({ value: 'test-1' });

    expect(result.current).toBe('test');

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe('test');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('test-1');
  });
});
