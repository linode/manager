import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useZoomController } from './useZoomController';

import type { CategoricalChartState } from 'recharts/types/chart/types';

describe('useZoomController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should initialize with default zoom state', () => {
    const { result } = renderHook(() => useZoomController('test-key'));

    expect(result.current.zoom).toEqual({
      left: 'dataMin',
      right: 'dataMax',
    });
    expect(result.current.isZoomed).toBe(false);
  });
  it('should set refAreaLeft on mouse down with valid payload', () => {
    const { result } = renderHook(() => useZoomController('test-key'));
    const mockEvent: CategoricalChartState = {
      activePayload: [{ payload: { timestamp: 1000 } }],
    };
    act(() => {
      result.current.zoomCallbacks.onMouseDown(mockEvent);
    });
    expect(result.current.zoom.refAreaLeft).toBeUndefined();
  });
  it('should not set refAreaLeft on mouse down without payload', () => {
    const { result } = renderHook(() => useZoomController('test-key'));
    const mockEvent: CategoricalChartState = {};
    act(() => {
      result.current.zoomCallbacks.onMouseDown(mockEvent);
    });
    expect(result.current.zoom.refAreaLeft).toBeUndefined();
  });
  it('should update refAreaRight on mouse move', () => {
    const { result } = renderHook(() => useZoomController('test-key'));

    act(() => {
      result.current.zoomCallbacks.onMouseDown({
        activePayload: [{ payload: { timestamp: 1000 } }],
      });
    });

    act(() => {
      result.current.zoomCallbacks.onMouseMove({
        activePayload: [{ payload: { timestamp: 2000 } }],
      });
    });

    expect(result.current.zoom.refAreaLeft).toBe(1000);
    expect(result.current.zoom.refAreaRight).toBe(2000);
  });
  it('should apply zoom on mouse up with valid drag', () => {
    const { result } = renderHook(() => useZoomController('test-key'));
    act(() => {
      result.current.zoomCallbacks.onMouseDown({
        activePayload: [{ payload: { timestamp: 1000 } }],
      });
      result.current.zoomCallbacks.onMouseMove({
        activePayload: [{ payload: { timestamp: 2000 } }],
      });
      result.current.zoomCallbacks.onMouseUp();
    });
    expect(result.current.zoom.left).toBe(1000);
    expect(result.current.zoom.right).toBe(2000);
    expect(result.current.zoom.refAreaLeft).toBeUndefined();
    expect(result.current.zoom.refAreaRight).toBeUndefined();
    expect(result.current.isZoomed).toBe(true);
  });
  it('should handle reverse drag (right to left)', () => {
    const { result } = renderHook(() => useZoomController('test-key'));
    act(() => {
      result.current.zoomCallbacks.onMouseDown({
        activePayload: [{ payload: { timestamp: 2000 } }],
      });
      result.current.zoomCallbacks.onMouseMove({
        activePayload: [{ payload: { timestamp: 1000 } }],
      });
      result.current.zoomCallbacks.onMouseUp();
    });
    expect(result.current.zoom.left).toBe(1000);
    expect(result.current.zoom.right).toBe(2000);
  });
  it('should reset zoom on zoomOut', () => {
    const { result } = renderHook(() => useZoomController('test-key'));
    act(() => {
      result.current.zoomCallbacks.onMouseDown({
        activePayload: [{ payload: { timestamp: 1000 } }],
      });
      result.current.zoomCallbacks.onMouseMove({
        activePayload: [{ payload: { timestamp: 2000 } }],
      });
      result.current.zoomCallbacks.onMouseUp();
    });
    act(() => {
      result.current.zoomOut();
    });
    expect(result.current.zoom).toEqual({
      left: 'dataMin',
      right: 'dataMax',
    });
    expect(result.current.isZoomed).toBe(false);
  });
  it('should reset zoom when zoomResetKey changes', () => {
    const { result, rerender } = renderHook(
      ({ key }) => useZoomController(key),
      { initialProps: { key: 'key1' } }
    );
    act(() => {
      result.current.zoomCallbacks.onMouseDown({
        activePayload: [{ payload: { timestamp: 1000 } }],
      });
      result.current.zoomCallbacks.onMouseMove({
        activePayload: [{ payload: { timestamp: 2000 } }],
      });
      result.current.zoomCallbacks.onMouseUp();
    });
    rerender({ key: 'key2' });
    expect(result.current.zoom).toEqual({
      left: 'dataMin',
      right: 'dataMax',
    });
  });
  it('should clear refArea on mouse up without drag', () => {
    const { result } = renderHook(() => useZoomController('test-key'));
    act(() => {
      result.current.zoomCallbacks.onMouseDown({
        activePayload: [{ payload: { timestamp: 1000 } }],
      });
      result.current.zoomCallbacks.onMouseUp();
    });
    expect(result.current.zoom.refAreaLeft).toBeUndefined();
    expect(result.current.zoom.refAreaRight).toBeUndefined();
  });
});
