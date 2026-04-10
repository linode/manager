import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDelayedLoadingIndicator } from './useDelayedLoadingIndicator';

describe('useDelayedLoadingIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return false initially when not loading', () => {
    const { result } = renderHook(() => useDelayedLoadingIndicator(false));

    expect(result.current).toBe(false);
  });

  it('should return false initially even when loading starts', () => {
    const { result } = renderHook(() => useDelayedLoadingIndicator(true));

    expect(result.current).toBe(false);
  });

  it('should return true after default delay (5000ms) when loading', () => {
    const { result } = renderHook(() => useDelayedLoadingIndicator(true));

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(4999);
    });

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe(true);
  });

  it('should return true after custom delay when provided', () => {
    const customDelay = 3000;
    const { result } = renderHook(() =>
      useDelayedLoadingIndicator(true, customDelay)
    );

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe(true);
  });

  it('should reset to false immediately when loading completes before delay', () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoadingIndicator(isLoading),
      { initialProps: { isLoading: true } }
    );

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current).toBe(false);

    // Loading completes before delay
    rerender({ isLoading: false });

    expect(result.current).toBe(false);
  });

  it('should reset to false immediately when loading completes after delay', () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoadingIndicator(isLoading),
      { initialProps: { isLoading: true } }
    );

    // Wait for delay to pass
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current).toBe(true);

    // Loading completes
    rerender({ isLoading: false });

    expect(result.current).toBe(false);
  });

  it('should handle rapid loading state changes correctly', () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoadingIndicator(isLoading),
      { initialProps: { isLoading: true } }
    );

    expect(result.current).toBe(false);

    // Stop loading before delay
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    rerender({ isLoading: false });

    expect(result.current).toBe(false);

    // Start loading again
    rerender({ isLoading: true });

    expect(result.current).toBe(false);

    // Wait for new delay
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current).toBe(true);
  });

  it('should clear timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useDelayedLoadingIndicator(true));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should clear timeout when isLoading changes from true to false', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { rerender } = renderHook(
      ({ isLoading }) => useDelayedLoadingIndicator(isLoading),
      { initialProps: { isLoading: true } }
    );

    rerender({ isLoading: false });

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
