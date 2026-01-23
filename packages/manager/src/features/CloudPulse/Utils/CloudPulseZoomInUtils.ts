import { type Metrics, roundTo } from '@linode/utilities';

import { humanizeLargeData } from './utils';

import type { ZoomState } from '../Widget/components/useZoomController';
import type { DataSet } from 'src/components/AreaChart/AreaChart';
import type { MetricsDisplayRow } from 'src/components/LineGraph/MetricsDisplay';

interface ZoomStateData {
  /**
   * The data to be processed according to the zoom state
   */
  data: DataSet[];
  /**
   * Indicates if the unit is humanizable
   */
  isHumanizableUnit?: boolean;
  /**
   * The legend rows to be processed according to zoom state
   */
  legendRows?: MetricsDisplayRow[];

  /**
   * The unit of measurement for formatting
   */
  unit?: string;

  /**
   * The current zoom state
   */
  zoom: ZoomState;
}

/**
 * @param data The data for which to compute the zoomed-in subset
 * @param zoom The current zoom state
 * @returns The subset of data that falls within the zoomed-in range
 */
export const computeZoomedInData = ({
  data,
  zoom,
}: ZoomStateData): DataSet[] => {
  if (!data || data.length === 0) {
    return data;
  }
  if (zoom.left === 'dataMin' && zoom.right === 'dataMax') {
    return data;
  }

  const minZoom = zoom.left === 'dataMin' ? data[0].timestamp : zoom.left; // left zoom boundary
  const maxZoom =
    zoom.right === 'dataMax' ? data[data.length - 1].timestamp : zoom.right; // right zoom boundary
  return data.filter(
    ({ timestamp }) => timestamp >= minZoom && timestamp <= maxZoom
  );
};

/**
 * @param zoom The current zoom state
 * @param data The data to compute legend rows from
 * @param legendRows The original legend rows
 * @returns The computed legend rows based on the zoomed-in data
 */
export const computeLegendRowsBasedOnData = ({
  data,
  zoom,
  legendRows,
  unit,
  isHumanizableUnit,
}: ZoomStateData) => {
  if (!legendRows || !data || !data.length) return undefined;

  // If not zoomed, return original rows unchanged
  if (zoom.left === 'dataMin' && zoom.right === 'dataMax') {
    return legendRows;
  }

  const minZoom = zoom.left === 'dataMin' ? data[0].timestamp : zoom.left; // left zoom boundary
  const maxZoom =
    zoom.right === 'dataMax' ? data[data.length - 1].timestamp : zoom.right; // right zoom boundary

  return legendRows.map((legendRow) => {
    const values: number[] = [];

    for (const dataRow of data) {
      const value = dataRow[legendRow.legendTitle];
      if (
        typeof value === 'number' &&
        !Number.isNaN(value) &&
        dataRow.timestamp >= minZoom &&
        dataRow.timestamp <= maxZoom
      ) {
        values.push(value);
      }
    }

    return {
      ...legendRow,
      format: isHumanizableUnit
        ? (value: number) => `${humanizeLargeData(value)} ${unit}` // continue to humanize values
        : (value: number) => `${roundTo(value)} ${unit}`, // only round the values, units and values are already scaled up
      data: getMetricsFromDimensionData(values),
    };
  });
};

/**
 * @param data The data of the current dimension
 * @returns The max, avg, last, length, total from the data
 */
export const getMetricsFromDimensionData = (data: number[]): Metrics => {
  // If there's no data
  if (!data || !Array.isArray(data) || data.length < 1) {
    return { average: 0, last: 0, length: 0, max: 0, total: 0 };
  }

  let max = 0;
  let sum = 0;

  // The data is large, so we get everything we need in one iteration
  data.forEach((value): void => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return;
    }

    if (value > max) {
      max = value;
    }

    sum += value;
  });

  const length = data.length;

  // Safeguard against dividing by 0
  const average = length > 0 ? sum / length : 0;

  const last = data[length - 1] || 0;

  return { average, last, length, max, total: sum };
};
