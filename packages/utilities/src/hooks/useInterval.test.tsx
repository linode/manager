import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { useInterval } from './useInterval';

describe('useInterval', () => {
  vi.useFakeTimers();

  test('calls the callback with a specified delay', () => {
    const callback = vi.fn();

    renderHook(() => useInterval({ callback, delay: 1000 }));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('does not call the callback when "when" is false', () => {
    const callback = vi.fn();

    renderHook(() => useInterval({ callback, delay: 1000, when: false }));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  test('stops calling the callback after being cancelled', () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useInterval({ callback, delay: 1000 }));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.cancel();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
