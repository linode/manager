import * as React from 'react';

import type { CategoricalChartState } from 'recharts/types/chart/types';

export type ZoomState = {
  left: 'dataMin' | number;
  refAreaLeft?: number;
  refAreaRight?: number;
  right: 'dataMax' | number;
};

const initialZoomState: ZoomState = {
  left: 'dataMin',
  right: 'dataMax',
  refAreaLeft: undefined,
  refAreaRight: undefined,
};

export const useZoomController = (zoomResetKey: string) => {
  const [zoom, setZoom] = React.useState<ZoomState>(initialZoomState);

  const dragStartRef = React.useRef<null | number>(null);
  const isDraggingRef = React.useRef(false);

  const onMouseDown = React.useCallback((e: CategoricalChartState) => {
    const payload = e?.activePayload?.[0]?.payload;
    if (!payload?.timestamp) return;

    // set the drag start timestamp
    dragStartRef.current = payload.timestamp;
    isDraggingRef.current = false;
  }, []);

  const onMouseMove = React.useCallback((e: CategoricalChartState) => {
    const dragStart = dragStartRef.current;
    if (dragStart === null) return;

    const payload = e?.activePayload?.[0]?.payload;
    if (!payload?.timestamp) return;

    if (!isDraggingRef.current) {
      isDraggingRef.current = true;
      setZoom((prev) => ({
        ...prev,
        refAreaLeft: dragStart,
        refAreaRight: payload.timestamp, // set initial right to show drag
      }));
      return;
    }

    setZoom((prev) => ({
      ...prev,
      refAreaRight: payload.timestamp, // set initial right to show drag
    }));
  }, []);

  const onMouseUp = React.useCallback(() => {
    if (!isDraggingRef.current) {
      dragStartRef.current = null;
      return;
    }

    isDraggingRef.current = false; // reset dragging state on completion

    setZoom((prev) => {
      if (
        !prev.refAreaLeft ||
        !prev.refAreaRight ||
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
          : [prev.refAreaRight, prev.refAreaLeft]; // handle reverse drag

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
    setZoom(initialZoomState); // on zoom out, reset to initial state
  }, []);

  // Reset when parent explicitly says so
  React.useEffect(() => {
    setZoom(initialZoomState);
  }, [zoomResetKey]); // here zoomResetKey is usually the timestamp selected from time range picker

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
