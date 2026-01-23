/**
 * useZoomController
 *
 * A reusable hook to manage drag-to-zoom state for time-series charts.
 * This hook is UI-agnostic and intended to be wired into CloudPulseLineGraph component
 */
import * as React from 'react';

import type { CategoricalChartState } from 'recharts/types/chart/types';

export type ZoomState = {
  /**
   * The left boundary of the zoomed area, can be 'dataMin' or a specific timestamp
   */
  left: 'dataMin' | number;
  /**
   * The left boundary of the area being dragged for zooming, which will be cleared on mouse up
   */
  refAreaLeft?: number;
  /**
   * The right boundary of the area being dragged for zooming, which will be cleared on mouse up
   */
  refAreaRight?: number;
  /**
   * The right boundary of the zoomed area, can be 'dataMax' or a specific timestamp
   */
  right: 'dataMax' | number;
};

// Initial zoom state covering the entire data range, with left and right set to dataMin and dataMax
const initialZoomState: ZoomState = {
  left: 'dataMin',
  right: 'dataMax',
  refAreaLeft: undefined,
  refAreaRight: undefined,
};

export const useZoomController = (zoomResetKey: string) => {
  const [zoom, setZoom] = React.useState<ZoomState>(initialZoomState); // Current zoom state (dataMin/dataMax when not zoomed)

  const dragStartRef = React.useRef<null | number>(null); // Tracks the timestamp where the drag started
  const isDraggingRef = React.useRef(false); // Tracks if dragging is in progress

  const onMouseDown = React.useCallback((e: CategoricalChartState) => {
    const payload = e?.activePayload?.[0]?.payload;
    if (payload?.timestamp === undefined) return;

    // set the drag start timestamp
    dragStartRef.current = payload.timestamp;
    isDraggingRef.current = false;
  }, []);

  const onMouseMove = React.useCallback((e: CategoricalChartState) => {
    const dragStart = dragStartRef.current;
    if (dragStart === null) return;

    const payload = e?.activePayload?.[0]?.payload;
    if (payload?.timestamp === undefined) return;

    if (!isDraggingRef.current) {
      isDraggingRef.current = true;
      setZoom((prev) => ({
        ...prev,
        refAreaLeft: dragStart,
        refAreaRight: payload.timestamp, // Set initial right to show drag
      }));
      return;
    }

    setZoom((prev) => ({
      ...prev,
      refAreaRight: payload.timestamp, // Set initial right to show drag
    }));
  }, []);

  const onMouseUp = React.useCallback(() => {
    if (!isDraggingRef.current) {
      dragStartRef.current = null;
      return;
    }

    isDraggingRef.current = false; // Reset dragging state on completion

    setZoom((prev) => {
      if (
        prev.refAreaLeft === undefined ||
        prev.refAreaRight === undefined ||
        prev.refAreaLeft === prev.refAreaRight
      ) {
        return {
          ...prev,
          refAreaLeft: undefined,
          refAreaRight: undefined,
        };
      }

      const [from, to] =
        prev.refAreaLeft < prev.refAreaRight
          ? [prev.refAreaLeft, prev.refAreaRight]
          : [prev.refAreaRight, prev.refAreaLeft]; // Handle reverse drag

      return {
        ...prev,
        left: from,
        right: to,
        refAreaLeft: undefined,
        refAreaRight: undefined,
      };
    });

    dragStartRef.current = null;
  }, []);

  const zoomOut = React.useCallback(() => {
    setZoom(initialZoomState); // On zoom out, reset to initial state
  }, []);

  // Reset when parent explicitly says so
  React.useEffect(() => {
    setZoom(initialZoomState);
  }, [zoomResetKey]); // Here zoomResetKey is usually the timestamp selected from time range picker

  const isZoomed = zoom.left !== 'dataMin' || zoom.right !== 'dataMax';

  return {
    zoom,
    isZoomed,
    zoomOut,
    zoomCallbacks: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
    },
  };
};
