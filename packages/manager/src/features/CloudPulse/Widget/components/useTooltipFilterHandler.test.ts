import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useTooltipFilterHandler } from './useTooltipFilterHandler';

describe('useTooltipFilterHandler', () => {
  it('initializes without tooltip filter', () => {
    const { result } = renderHook(() => useTooltipFilterHandler());

    expect(result.current.tooltipFilter).toBeUndefined();
  });

  it('pins metric on active-dot click', () => {
    const { result } = renderHook(() => useTooltipFilterHandler());

    act(() => {
      result.current.handleActiveDotClick('cpu');
    });

    expect(result.current.tooltipFilter).toEqual({ dataKey: 'cpu' });
  });

  it('toggles off pinned metric when clicking the same key again', () => {
    const { result } = renderHook(() => useTooltipFilterHandler());

    act(() => {
      result.current.handleActiveDotClick('cpu');
    });
    expect(result.current.tooltipFilter).toEqual({ dataKey: 'cpu' });

    act(() => {
      result.current.handleActiveDotClick('cpu');
    });

    expect(result.current.tooltipFilter).toBeUndefined();
  });

  it('uses hovered metric while pinned and keeps last hovered key on mouse leave', () => {
    const { result } = renderHook(() => useTooltipFilterHandler());

    act(() => {
      result.current.handleActiveDotClick('cpu');
    });
    expect(result.current.tooltipFilter).toEqual({ dataKey: 'cpu' });

    act(() => {
      result.current.handleActiveDotMouseEnter('memory');
    });
    expect(result.current.tooltipFilter).toEqual({ dataKey: 'memory' });

    act(() => {
      result.current.handleActiveDotMouseLeave();
    });
    expect(result.current.tooltipFilter).toEqual({ dataKey: 'memory' });
  });

  it('does not hover-select when nothing is pinned', () => {
    const { result } = renderHook(() => useTooltipFilterHandler());

    act(() => {
      result.current.handleActiveDotMouseEnter('memory');
    });

    expect(result.current.tooltipFilter).toBeUndefined();
  });

  it('clears pinned state on chart mouse down', () => {
    const { result } = renderHook(() => useTooltipFilterHandler());

    act(() => {
      result.current.handleActiveDotClick('cpu');
    });
    expect(result.current.tooltipFilter).toEqual({ dataKey: 'cpu' });

    act(() => {
      result.current.handleTooltipFilterOnChartClick();
    });

    expect(result.current.tooltipFilter).toBeUndefined();
  });

  it('restores full tooltip only on second click of the same key', () => {
    const { result } = renderHook(() => useTooltipFilterHandler());

    act(() => {
      result.current.handleActiveDotClick('cpu');
    });
    expect(result.current.tooltipFilter).toEqual({ dataKey: 'cpu' });

    act(() => {
      result.current.handleTooltipFilterOnChartClick();
      result.current.handleActiveDotClick('cpu');
    });

    expect(result.current.tooltipFilter).toBeUndefined();
  });

  it('keeps full tooltip on hover after second click until another click enables filtering', () => {
    const { result } = renderHook(() => useTooltipFilterHandler());

    act(() => {
      result.current.handleActiveDotClick('cpu');
    });

    act(() => {
      result.current.handleActiveDotClick('cpu');
    });

    expect(result.current.tooltipFilter).toBeUndefined();

    act(() => {
      result.current.handleActiveDotMouseEnter('memory');
    });

    expect(result.current.tooltipFilter).toBeUndefined();

    act(() => {
      result.current.handleActiveDotClick('disk');
    });

    expect(result.current.tooltipFilter).toEqual({ dataKey: 'disk' });
  });

  it('resets pinned and hovered keys back to full tooltip mode', () => {
    const { result } = renderHook(() => useTooltipFilterHandler());

    act(() => {
      result.current.handleActiveDotClick('cpu');
    });

    act(() => {
      result.current.handleActiveDotMouseEnter('memory');
    });

    expect(result.current.tooltipFilter).toEqual({ dataKey: 'memory' });

    act(() => {
      result.current.resetTooltipFilter();
    });

    expect(result.current.tooltipFilter).toBeUndefined();

    act(() => {
      result.current.handleActiveDotMouseEnter('disk');
    });

    expect(result.current.tooltipFilter).toBeUndefined();
  });
});
