import { act, renderHook } from '@testing-library/react';

import {
  TOOLTIP_POSITIONING,
  useTooltipPositioning,
} from './useTooltipPositioning';

import type { MouseHandlerDataParam } from 'recharts';

const setupMocks = (): {
  mockContainerElement: HTMLDivElement;
  mockTooltipElement: HTMLDivElement;
} => {
  const mockContainerElement = document.createElement('div');
  vi.spyOn(mockContainerElement, 'getBoundingClientRect').mockReturnValue({
    width: 800,
    height: 600,
    left: 50,
    top: 100,
    right: 850,
    bottom: 700,
    x: 50,
    y: 100,
    toJSON: () => ({}),
  });

  const mockTooltipElement = document.createElement('div');
  vi.spyOn(mockTooltipElement, 'getBoundingClientRect').mockReturnValue({
    width: 220,
    height: 100,
    left: 0,
    top: 0,
    right: 220,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1200,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 800,
  });

  return { mockContainerElement, mockTooltipElement };
};

const mockChartData: MouseHandlerDataParam = {
  activeLabel: 1000,
  activeTooltipIndex: 0,
  isTooltipActive: true,
  activeIndex: 0,
  activeDataKey: 'timestamp',
  activeCoordinate: { x: 100, y: 100 },
};

describe('useTooltipPositioning - Initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with undefined tooltip position and empty refs', () => {
    const { result } = renderHook(() => useTooltipPositioning());

    expect(result.current.tooltipPos).toBeUndefined();
    expect(result.current.chartContainerRef.current).toBeNull();
    expect(result.current.tooltipRef.current).toBeNull();
    expect(result.current.handleMouseMove).toBeDefined();
  });

  it('should return all required properties', () => {
    const { result } = renderHook(() => useTooltipPositioning());

    expect(result.current).toHaveProperty('tooltipPos');
    expect(result.current).toHaveProperty('handleMouseMove');
    expect(result.current).toHaveProperty('chartContainerRef');
    expect(result.current).toHaveProperty('tooltipRef');
  });
});

describe('useTooltipPositioning - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not update position when container ref is null', () => {
    const { result } = renderHook(() => useTooltipPositioning());

    act(() => {
      result.current.handleMouseMove(mockChartData);
    });

    expect(result.current.tooltipPos).toBeUndefined();
  });

  it('should handle undefined originalOnMouseMove gracefully', () => {
    const { result } = renderHook(() => useTooltipPositioning(undefined));
    const { mockContainerElement, mockTooltipElement } = setupMocks();

    act(() => {
      result.current.chartContainerRef.current = mockContainerElement;
      result.current.tooltipRef.current = mockTooltipElement;
    });

    expect(() => {
      act(() => {
        result.current.handleMouseMove(mockChartData);
      });
    }).not.toThrow();

    expect(result.current.tooltipPos).toBeDefined();
  });
});

describe('useTooltipPositioning - Horizontal Placement', () => {
  let mockContainerElement: HTMLDivElement;
  let mockTooltipElement: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    ({ mockContainerElement, mockTooltipElement } = setupMocks());
  });

  it('should place tooltip to the left when point is in right half of chart', () => {
    const { result } = renderHook(() => useTooltipPositioning());

    act(() => {
      result.current.chartContainerRef.current = mockContainerElement;
      result.current.tooltipRef.current = mockTooltipElement;
    });

    const { horizontalGap } = TOOLTIP_POSITIONING;

    act(() => {
      result.current.handleMouseMove({
        ...mockChartData,
        activeCoordinate: { x: 600, y: 100 },
      });
    });

    expect(result.current.tooltipPos).toBeDefined();
    expect(result.current.tooltipPos?.x).toBe(
      600 - mockTooltipElement.getBoundingClientRect().width - horizontalGap
    );
  });

  it('should place tooltip to the right when point is in left half of chart', () => {
    const { result } = renderHook(() => useTooltipPositioning());

    act(() => {
      result.current.chartContainerRef.current = mockContainerElement;
      result.current.tooltipRef.current = mockTooltipElement;
    });

    const { horizontalGap } = TOOLTIP_POSITIONING;

    act(() => {
      result.current.handleMouseMove({
        ...mockChartData,
        activeCoordinate: { x: 100, y: 100 },
      });
    });

    expect(result.current.tooltipPos).toBeDefined();
    expect(result.current.tooltipPos?.x).toBe(100 + horizontalGap);
  });
});

describe('useTooltipPositioning - Vertical Placement', () => {
  let mockContainerElement: HTMLDivElement;
  let mockTooltipElement: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    ({ mockContainerElement, mockTooltipElement } = setupMocks());
  });

  it('should place tooltip above when point is in bottom half of chart', () => {
    const { result } = renderHook(() => useTooltipPositioning());

    act(() => {
      result.current.chartContainerRef.current = mockContainerElement;
      result.current.tooltipRef.current = mockTooltipElement;
    });

    const { verticalGap } = TOOLTIP_POSITIONING;

    act(() => {
      result.current.handleMouseMove({
        ...mockChartData,
        activeCoordinate: { x: 100, y: 500 },
      });
    });

    expect(result.current.tooltipPos).toBeDefined();
    expect(result.current.tooltipPos?.y).toBe(
      500 - mockTooltipElement.getBoundingClientRect().height - verticalGap
    );
  });

  it('should place tooltip below when point is in top half of chart', () => {
    const { result } = renderHook(() => useTooltipPositioning());

    act(() => {
      result.current.chartContainerRef.current = mockContainerElement;
      result.current.tooltipRef.current = mockTooltipElement;
    });

    const { verticalGap } = TOOLTIP_POSITIONING;

    act(() => {
      result.current.handleMouseMove({
        ...mockChartData,
        activeCoordinate: { x: 100, y: 100 },
      });
    });

    expect(result.current.tooltipPos).toBeDefined();
    expect(result.current.tooltipPos?.y).toBe(100 + verticalGap);
  });
});

describe('useTooltipPositioning - Viewport Boundary Handling', () => {
  let mockContainerElement: HTMLDivElement;
  let mockTooltipElement: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    ({ mockContainerElement, mockTooltipElement } = setupMocks());
  });

  it('should adjust horizontal placement to avoid viewport overflow on right', () => {
    const { result } = renderHook(() => useTooltipPositioning());

    vi.spyOn(mockContainerElement, 'getBoundingClientRect').mockReturnValue({
      width: 800,
      height: 600,
      left: 400,
      top: 100,
      right: 1200,
      bottom: 700,
      x: 400,
      y: 100,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.chartContainerRef.current = mockContainerElement;
      result.current.tooltipRef.current = mockTooltipElement;
    });

    act(() => {
      result.current.handleMouseMove({
        ...mockChartData,
        activeCoordinate: { x: 700, y: 100 },
      });
    });

    expect(result.current.tooltipPos).toBeDefined();
    expect(result.current.tooltipPos?.x).toBeLessThan(400 + 700);
  });

  it('should handle corner case: chart at viewport edges', () => {
    const { result } = renderHook(() => useTooltipPositioning());

    vi.spyOn(mockContainerElement, 'getBoundingClientRect').mockReturnValue({
      width: 800,
      height: 600,
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.chartContainerRef.current = mockContainerElement;
      result.current.tooltipRef.current = mockTooltipElement;
    });

    act(() => {
      result.current.handleMouseMove({
        ...mockChartData,
        activeCoordinate: { x: 50, y: 50 },
      });
    });

    expect(result.current.tooltipPos).toBeDefined();
    expect(result.current.tooltipPos?.x).toBeGreaterThanOrEqual(0);
    expect(result.current.tooltipPos?.y).toBeGreaterThanOrEqual(0);
  });
});

describe('useTooltipPositioning - Callback Chaining', () => {
  let mockContainerElement: HTMLDivElement;
  let mockTooltipElement: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    ({ mockContainerElement, mockTooltipElement } = setupMocks());
  });

  it('should chain original onMouseMove callback', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useTooltipPositioning(mockCallback));

    act(() => {
      result.current.chartContainerRef.current = mockContainerElement;
      result.current.tooltipRef.current = mockTooltipElement;
    });

    act(() => {
      result.current.handleMouseMove(mockChartData);
    });

    expect(mockCallback).toHaveBeenCalledWith(mockChartData);
  });
});

describe('useTooltipPositioning - State Updates', () => {
  let mockContainerElement: HTMLDivElement;
  let mockTooltipElement: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    ({ mockContainerElement, mockTooltipElement } = setupMocks());
  });

  it('should use default tooltip dimensions when element is not measured', () => {
    const { result } = renderHook(() => useTooltipPositioning());

    vi.spyOn(mockTooltipElement, 'getBoundingClientRect').mockReturnValue({
      width: 0,
      height: 0,
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.chartContainerRef.current = mockContainerElement;
      result.current.tooltipRef.current = mockTooltipElement;
    });

    act(() => {
      result.current.handleMouseMove(mockChartData);
    });

    expect(result.current.tooltipPos).toBeDefined();
    expect(typeof result.current.tooltipPos?.x).toBe('number');
    expect(typeof result.current.tooltipPos?.y).toBe('number');
  });

  it('should update position on multiple handleMouseMove calls', () => {
    const { result } = renderHook(() => useTooltipPositioning());

    act(() => {
      result.current.chartContainerRef.current = mockContainerElement;
      result.current.tooltipRef.current = mockTooltipElement;
    });

    act(() => {
      result.current.handleMouseMove({
        ...mockChartData,
        activeCoordinate: { x: 100, y: 100 },
      });
    });

    const firstPos = result.current.tooltipPos;

    act(() => {
      result.current.handleMouseMove({
        ...mockChartData,
        activeCoordinate: { x: 500, y: 300 },
      });
    });

    expect(result.current.tooltipPos).toBeDefined();
    expect(result.current.tooltipPos).not.toEqual(firstPos);
  });
});

describe('useTooltipPositioning - Constants', () => {
  it('should respect TOOLTIP_POSITIONING constants', () => {
    expect(TOOLTIP_POSITIONING.edgePadding).toBe(10);
    expect(TOOLTIP_POSITIONING.horizontalGap).toBe(8);
    expect(TOOLTIP_POSITIONING.verticalGap).toBe(8);
    expect(TOOLTIP_POSITIONING.sideBarWidthAdjustment).toBe(250);
  });
});
