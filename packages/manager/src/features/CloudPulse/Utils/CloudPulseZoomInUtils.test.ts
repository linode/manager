import { describe, expect, it } from 'vitest';

import {
  computeLegendRowsBasedOnData,
  computeZoomedInData,
  getMetricsFromDimensionData,
} from './CloudPulseZoomInUtils';
import { formatToolTip } from './unitConversion';

import type { ZoomState } from '../Widget/components/useZoomController';
import type { DataSet } from 'src/components/AreaChart/AreaChart';
import type { MetricsDisplayRow } from 'src/components/LineGraph/MetricsDisplay';

describe('computeZoomedInData', () => {
  const mockData: DataSet[] = [
    { timestamp: 1000, metric1: 10, metric2: 20 },
    { timestamp: 2000, metric1: 15, metric2: 25 },
    { timestamp: 3000, metric1: 20, metric2: 30 },
    { timestamp: 4000, metric1: 25, metric2: 35 },
    { timestamp: 5000, metric1: 30, metric2: 40 },
  ];

  it('should return original data when zoom is at default (dataMin/dataMax)', () => {
    const zoom: ZoomState = { left: 'dataMin', right: 'dataMax' };
    const result = computeZoomedInData({ data: mockData, zoom });
    expect(result).toBe(mockData);
  });

  it('should return empty array when data is empty', () => {
    const zoom: ZoomState = { left: 1000, right: 3000 };
    const result = computeZoomedInData({ data: [], zoom });
    expect(result).toEqual([]);
  });

  it('should filter data based on zoom range', () => {
    const zoom: ZoomState = { left: 2000, right: 4000 };
    const result = computeZoomedInData({ data: mockData, zoom });
    expect(result).toHaveLength(3);
    expect(result[0].timestamp).toBe(2000);
    expect(result[2].timestamp).toBe(4000);
  });

  it('should handle zoom with dataMin as left', () => {
    const zoom: ZoomState = { left: 'dataMin', right: 3000 };
    const result = computeZoomedInData({ data: mockData, zoom });
    expect(result).toHaveLength(3);
    expect(result[0].timestamp).toBe(1000);
    expect(result[2].timestamp).toBe(3000);
  });

  it('should handle zoom with dataMax as right', () => {
    const zoom: ZoomState = { left: 3000, right: 'dataMax' };
    const result = computeZoomedInData({ data: mockData, zoom });
    expect(result).toHaveLength(3);
    expect(result[0].timestamp).toBe(3000);
    expect(result[2].timestamp).toBe(5000);
  });

  it('should return empty array when left is greater than right', () => {
    const zoom: ZoomState = { left: 4000, right: 2000 };
    const result = computeZoomedInData({ data: mockData, zoom });
    expect(result).toEqual([]);
  });
});

describe('getMetricsFromDimensionData', () => {
  it('should return zeros for empty data', () => {
    const result = getMetricsFromDimensionData([]);
    expect(result).toEqual({
      average: 0,
      last: 0,
      length: 0,
      max: 0,
      total: 0,
    });
  });

  it('should calculate metrics correctly for valid data', () => {
    const data = [10, 20, 30, 40, 50];
    const result = getMetricsFromDimensionData(data);
    expect(result).toEqual({
      average: 30,
      last: 50,
      length: 5,
      max: 50,
      total: 150,
    });
  });

  it('should handle single value', () => {
    const data = [42];
    const result = getMetricsFromDimensionData(data);
    expect(result).toEqual({
      average: 42,
      last: 42,
      length: 1,
      max: 42,
      total: 42,
    });
  });

  it('should ignore NaN values', () => {
    const data = [10, NaN, 30, NaN, 50];
    const result = getMetricsFromDimensionData(data);
    expect(result.total).toBe(90);
    expect(result.max).toBe(50);
  });
  it('should return 0 as last when last value is NaN', () => {
    const data = [10, 20, NaN];
    const result = getMetricsFromDimensionData(data);

    expect(result.last).toBe(0);
  });
});

describe('computeLegendRowsBasedOnData', () => {
  const mockData: DataSet[] = [
    { timestamp: 1000, cpu: 10, memory: 20 },
    { timestamp: 2000, cpu: 15, memory: 25 },
    { timestamp: 3000, cpu: 20, memory: 30 },
  ];
  const failMessage = 'Result should not be undefined';

  const mockLegendRows: MetricsDisplayRow[] = [
    {
      legendTitle: 'cpu',
      legendColor: 'blue',
      data: { average: 0, last: 0, length: 0, max: 0, total: 0 },
      format: (value: number) => formatToolTip(value, 'MB'),
    },
    {
      legendTitle: 'memory',
      legendColor: 'red',
      data: { average: 0, last: 0, length: 0, max: 0, total: 0 },
      format: (value: number) => formatToolTip(value, 'MB'),
    },
  ];

  it('should return undefined when legendRows is undefined', () => {
    const zoom: ZoomState = { left: 'dataMin', right: 'dataMax' };
    const result = computeLegendRowsBasedOnData({
      zoom,
      data: mockData,
    });
    expect(result).toBeUndefined();
  });

  it('should return original rows when not zoomed', () => {
    const zoom: ZoomState = { left: 'dataMin', right: 'dataMax' };
    const result = computeLegendRowsBasedOnData({
      zoom,
      data: mockData,
      legendRows: mockLegendRows,
    });
    expect(result).toEqual(mockLegendRows);
  });

  it('should compute metrics based on zoomed data', () => {
    const zoom: ZoomState = { left: 2000, right: 3000 };
    const result = computeLegendRowsBasedOnData({
      zoom,
      data: mockData,
      legendRows: mockLegendRows,
    });

    if (result) {
      expect(result).toHaveLength(2);
      expect(result[0].legendTitle).toBe('cpu');
      expect(result[0].data.total).toBe(35);
      expect(result[0].data.max).toBe(20);
      expect(result[0].data.last).toBe(20);
      expect(result[1].legendTitle).toBe('memory');
      expect(result[1].data.total).toBe(55);
      expect(result[1].data.average).toBe(27.5);
      expect(result[1].data.last).toBe(30);
    } else {
      expect.fail(failMessage);
    }
  });

  it('should preserve legend colors and titles', () => {
    const zoom: ZoomState = { left: 1000, right: 2000 };
    const result = computeLegendRowsBasedOnData({
      zoom,
      data: mockData,
      legendRows: mockLegendRows,
    });

    if (!result) {
      expect.fail(failMessage);
    }

    expect(result[0].legendColor).toBe('blue');
    expect(result[1].legendColor).toBe('red');
  });

  it('should handle missing values in data', () => {
    const dataWithMissing: DataSet[] = [
      { timestamp: 1000, cpu: 10 },
      { timestamp: 2000, memory: 25 },
    ];
    const zoom: ZoomState = { left: 1000, right: 2000 };
    const result = computeLegendRowsBasedOnData({
      zoom,
      data: dataWithMissing,
      legendRows: mockLegendRows,
    });

    if (!result) {
      expect.fail(failMessage);
    }

    expect(result[0].data.total).toBe(10);
    expect(result[1].data.total).toBe(25);
  });
});
