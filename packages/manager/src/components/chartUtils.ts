// Pure, stateless helpers shared between AreaChart and BarChart.
import { DateTime } from 'luxon';

import type { DataSet } from './chartTypes';

// Fixed wrapperStyle for the bottom legend, shared so both charts position it identically.
export const CHART_LEGEND_STYLES = {
  bottom: 0,
  left: 0,
  width: '100%',
};

// Whether axes should be hidden because there's no data to plot.
export const getHideAxis = (data: unknown): boolean =>
  !Array.isArray(data) || data.length === 0; // in recharts 3.8.1, if there is no data, the axes are still rendered with default ticks which can be misleading, so we hide them when there is no data to display

// Formats an x-axis timestamp tick using the chart's timezone and tick format string.
export const formatXAxisTick = (
  timestamp: number,
  timezone: string,
  tickFormat: string
): string =>
  DateTime.fromMillis(timestamp, { zone: timezone }).toFormat(tickFormat);

// Type guard confirming a value is an array of DataSet points (keyed by numeric timestamp).
export const isDataSetArray = (value: unknown): value is DataSet[] => {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        entry !== null &&
        typeof entry === 'object' &&
        'timestamp' in entry &&
        typeof (entry as { timestamp: unknown }).timestamp === 'number'
    )
  );
};

/**
 * Computes an x-axis domain padded by half of the smallest timestamp gap, so the
 * first/last data points (e.g. edge bars) don't render flush against the axes.
 */
export const computeXAxisDomain = (
  data: unknown
): ['dataMin', 'dataMax'] | [number, number] => {
  const typedData = isDataSetArray(data) ? data : [];

  const timestamps = typedData
    .map((point) => point.timestamp)
    .filter((timestamp): timestamp is number => typeof timestamp === 'number')
    .sort((first, second) => first - second);

  if (timestamps.length < 2) {
    return ['dataMin', 'dataMax'];
  }

  let smallestGap = Number.POSITIVE_INFINITY;
  for (let index = 1; index < timestamps.length; index++) {
    const gap = timestamps[index] - timestamps[index - 1];
    if (gap > 0 && gap < smallestGap) {
      smallestGap = gap;
    }
  }

  if (!Number.isFinite(smallestGap)) {
    return ['dataMin', 'dataMax'];
  }

  // Pad by half of the smallest interval so the edge bars stay clear of axes.
  const edgePadding = Math.max(Math.floor(smallestGap / 2), 1);
  return [
    timestamps[0] - edgePadding,
    timestamps[timestamps.length - 1] + edgePadding,
  ];
};
