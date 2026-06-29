/**
 * useZoomController
 *
 * A reusable hook to manage drag-to-zoom state for time-series charts.
 * This hook is UI-agnostic and intended to be wired into CloudPulseLineGraph component
 */
import * as React from 'react';

import type { MouseHandlerDataParam } from 'recharts';

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

  const onMouseDown = React.useCallback((e: MouseHandlerDataParam) => {
    // activeLabel contains the raw X-Axis dataKey value.
    // Assuming <XAxis dataKey="timestamp" />, this is your timestamp.
    const currentTimestamp = e?.activeLabel;

    // Type narrowing: ensures it is a number and satisfies TS perfectly
    if (typeof currentTimestamp !== 'number') return;

    dragStartRef.current = currentTimestamp;
    isDraggingRef.current = false;
  }, []);

  const onMouseMove = React.useCallback((e: MouseHandlerDataParam) => {
    const dragStart = dragStartRef.current;
    if (dragStart === null) return;

    const currentTimestamp = e?.activeLabel;
    if (typeof currentTimestamp !== 'number') return;

    if (!isDraggingRef.current) {
      isDraggingRef.current = true;
      setZoom((prev) => ({
        ...prev,
        refAreaLeft: dragStart,
        // currentTimestamp is strictly narrowed to a number here
        refAreaRight: currentTimestamp,
      }));
      return;
    }

    setZoom((prev) => ({
      ...prev,
      refAreaRight: currentTimestamp,
    }));
  }, []);

  const onMouseUp = React.useCallback(() => {
    if (!isDraggingRef.current) {
      dragStartRef.current = null;
      return;
    }

    isDraggingRef.current = false;

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

      // Handle reverse drag
      const [from, to] =
        prev.refAreaLeft < prev.refAreaRight
          ? [prev.refAreaLeft, prev.refAreaRight]
          : [prev.refAreaRight, prev.refAreaLeft];

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
