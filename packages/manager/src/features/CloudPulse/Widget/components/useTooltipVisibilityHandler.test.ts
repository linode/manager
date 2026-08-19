import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useTooltipVisibilityHandler } from './useTooltipVisibilityHandler';

describe('useTooltipVisibilityHandler', () => {
  it('initializes with tooltip hidden', () => {
    const { result } = renderHook(() => useTooltipVisibilityHandler());

    expect(result.current.isTooltipVisible).toBe(false);
  });

  it('sets tooltip visible when claimTooltipVisibility is called', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    const { result } = renderHook(() => useTooltipVisibilityHandler());

    act(() => {
      result.current.claimTooltipVisibility();
    });

    expect(result.current.isTooltipVisible).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });

  it('sets tooltip hidden when releaseTooltipVisibility is called', () => {
    const { result } = renderHook(() => useTooltipVisibilityHandler());

    act(() => {
      result.current.claimTooltipVisibility();
    });
    expect(result.current.isTooltipVisible).toBe(true);

    act(() => {
      result.current.releaseTooltipVisibility();
    });

    expect(result.current.isTooltipVisible).toBe(false);
  });

  it('hides the previous owner when another widget claims visibility', () => {
    const firstHook = renderHook(() => useTooltipVisibilityHandler());
    const secondHook = renderHook(() => useTooltipVisibilityHandler());

    act(() => {
      firstHook.result.current.claimTooltipVisibility();
    });

    expect(firstHook.result.current.isTooltipVisible).toBe(true);

    act(() => {
      secondHook.result.current.claimTooltipVisibility();
    });

    expect(secondHook.result.current.isTooltipVisible).toBe(true);
    expect(firstHook.result.current.isTooltipVisible).toBe(false);
  });

  it('invokes onOwnershipLost when another widget claims visibility', () => {
    const onOwnershipLost = vi.fn();
    const firstHook = renderHook(() =>
      useTooltipVisibilityHandler(onOwnershipLost)
    );
    const secondHook = renderHook(() => useTooltipVisibilityHandler());

    act(() => {
      firstHook.result.current.claimTooltipVisibility();
    });

    act(() => {
      secondHook.result.current.claimTooltipVisibility();
    });

    expect(onOwnershipLost).toHaveBeenCalledTimes(1);
  });

  it('removes the owner-change event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useTooltipVisibilityHandler());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'cloudpulse-widget-tooltip-owner-change',
      expect.any(Function)
    );
  });
});
