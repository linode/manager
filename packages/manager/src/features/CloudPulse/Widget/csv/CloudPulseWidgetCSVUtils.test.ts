import { describe, expect, it } from 'vitest';

import { FILTER_CONFIG } from '../../Utils/FilterConfig';
import { generateCSVData } from './CloudPulseWidgetCSVUtils';

import type { CloudPulseServiceTypeFilterMap } from '../../Utils/models';
import type { CSVDataProps } from './CloudPulseWidgetCSVUtils';

const DASHBOARD_NAME = 'Test Dashboard';
const START_TIME_LABEL = 'Start Time';
const DATA_INTERVAL_LABEL = 'Data Aggregation Interval';
const DIMENSION_FILTERS_LABEL = 'Dimension Filters';

const baseProps: CSVDataProps = {
  dashboardName: DASHBOARD_NAME,
  data: [
    { timestamp: 1718000000000, value: 42, value2: 100 },
    { timestamp: 1718003600000, value: 43, value2: 110 },
  ],
  dimensionFilters: [
    {
      dimension_label: 'test',
      operator: 'eq',
      value: 'A',
    },
  ],
  dimensionOptions: [
    { dimension_label: 'test', label: 'Test', values: ['A', 'B'] },
  ],
  duration: {
    start: '2024-06-10T00:00:00Z',
    end: '2024-06-10T01:00:00Z',
    timeZone: 'UTC',
    preset: 'Reset',
  },
  filterConfig:
    FILTER_CONFIG.get(1) ??
    vi.mockObject<CloudPulseServiceTypeFilterMap>({
      capability: 'Managed Databases',
      filters: [],
      serviceType: 'dbaas',
    }),
  filters: {
    id: {
      test: 'A',
    },
    label: {
      test: ['A', 'B'],
    },
  },
  groupBy: ['region'],
  isDataLoading: false,
  serviceType: 'dbaas',
  widget: {
    label: 'CPU Usage',
    unit: '%',
    aggregate_function: 'avg',
    time_granularity: { value: 5, unit: 'minute' },
    chart_type: 'line',
    color: '#000000',
    entity_ids: [],
    filters: [],
    metric: 'cpu_usage',
    service_type: 'dbaas',
    namespace_id: 1,
    region_id: 1,
    serviceType: 'dbaas',
    size: 12,
    time_duration: { value: 1, unit: 'hour' },
    y_label: 'cpu_usage',
  },
};

describe('generateCSVData', () => {
  it('should generate CSV with all sections', () => {
    const csv = generateCSVData(baseProps);

    expect(csv[0]).toEqual(['Dashboard', 'Test Dashboard']);
    expect(csv.some((row) => row[0] === 'Group By')).toBe(true);
    expect(csv.some((row) => row[0] === 'Aggregation Function')).toBe(true);
    expect(csv.some((row) => row[0] === DATA_INTERVAL_LABEL)).toBe(true);
    expect(csv.some((row) => row[0] === 'Metric')).toBe(true);
    expect(csv.some((row) => row[0] === 'Unit')).toBe(true);
    expect(
      csv.some((row) => Array.isArray(row) && row.includes('time (UTC)'))
    ).toBe(true);
    expect(csv.some((row) => Array.isArray(row) && row.includes(100))).toBe(
      true
    );
  });

  it('should handle empty data', () => {
    const csv = generateCSVData({ ...baseProps, data: [] });
    expect(
      csv.some((row) => Array.isArray(row) && row.includes('time (UTC)'))
    ).toBe(false);
  });

  it('should handle no groupBy', () => {
    const csv = generateCSVData({ ...baseProps, groupBy: [] });
    expect(csv.some((row) => row[0] === 'Group By')).toBe(false);
  });

  it('should handle no aggregation function', () => {
    const csv = generateCSVData({
      ...baseProps,
      widget: { ...baseProps.widget, aggregate_function: '' },
    });
    expect(csv.some((row) => row[0] === 'Aggregation Function')).toBe(false);
  });

  it('should include dimension filters', () => {
    const csv = generateCSVData({
      ...baseProps,
      dimensionFilters: [
        {
          dimension_label: 'test',
          operator: 'eq',
          value: 'A',
        },
      ],
    });
    expect(csv.some((row) => row[0] === DIMENSION_FILTERS_LABEL)).toBe(true);
    expect(
      csv.some((row) =>
        row[1] ? row[1].toString().includes('Test,eq,A') : false
      )
    ).toBe(true);
  });

  it('should format timestamps using the correct timezone', () => {
    const csv = generateCSVData({
      ...baseProps,
      duration: {
        ...baseProps.duration,
        timeZone: 'America/New_York',
      },
    });
    expect(
      csv.some((row) => Array.isArray(row) && row.includes('time (EDT)'))
    ).toBe(true);
    // The formatted timestamp should include the correct hour for New York and timezone abbreviation
    const dataRow = csv.find((row) => Array.isArray(row) && row.includes(42));
    expect(dataRow?.[0]).toMatch('Jun 10, 2024, 2:13 AM');
  });

  it('should handle empty dimensionFilters', () => {
    const csv = generateCSVData({
      ...baseProps,
      dimensionFilters: [],
    });
    expect(csv.some((row) => row[0] === DIMENSION_FILTERS_LABEL)).toBe(false);
  });

  it('should handle missing filter values gracefully', () => {
    const csv = generateCSVData({
      ...baseProps,
      filters: {
        id: {},
        label: {},
      },
    });
    expect(csv.some((row) => row[0] === 'Region')).toBe(false);
  });

  it('should filter data based on zoom range when zoomed', () => {
    const csv = generateCSVData({
      ...baseProps,
      zoomRange: {
        left: 1718000000000, // First timestamp
        right: 1718000000000, // First timestamp only
      },
    });
    // Should only include the first data point
    const dataRows = csv.filter(
      (row) => Array.isArray(row) && typeof row[1] === 'number' && row[1] === 42
    );
    expect(dataRows.length).toBe(1);
    expect(dataRows[0]).toContain(42);
  });

  it('should include all data when zoom range is dataMin/dataMax', () => {
    const csv = generateCSVData({
      ...baseProps,
      zoomRange: {
        left: 'dataMin',
        right: 'dataMax',
      },
    });
    // Should include all data points
    expect(csv.some((row) => Array.isArray(row) && row.includes(42))).toBe(
      true
    );
    expect(csv.some((row) => Array.isArray(row) && row.includes(43))).toBe(
      true
    );
  });

  it('should include all data when no zoom range is provided', () => {
    const csv = generateCSVData(baseProps);
    // Should include all data points
    expect(csv.some((row) => Array.isArray(row) && row.includes(42))).toBe(
      true
    );
    expect(csv.some((row) => Array.isArray(row) && row.includes(43))).toBe(
      true
    );
  });

  it('should show preset name instead of start/end times for relative durations', () => {
    const csv = generateCSVData({
      ...baseProps,
      duration: {
        ...baseProps.duration,
        preset: 'Last 1 Hour',
      },
    });
    expect(
      csv.some((row) => row[0] === 'Time Range' && row[1] === 'Last 1 Hour')
    ).toBe(true);
    expect(csv.some((row) => row[0] === START_TIME_LABEL)).toBe(false);
    expect(csv.some((row) => row[0] === 'End Time')).toBe(false);
  });

  it('should show start/end times for custom/absolute time ranges', () => {
    const csv = generateCSVData({
      ...baseProps,
      duration: {
        start: '2024-06-10T00:00:00Z',
        end: '2024-06-10T01:00:00Z',
        timeZone: 'UTC',
        preset: 'Reset',
      },
    });
    expect(csv.some((row) => row[0] === START_TIME_LABEL)).toBe(true);
    expect(csv.some((row) => row[0] === 'End Time')).toBe(true);
    expect(csv.some((row) => row[0] === 'Time Range')).toBe(false);
  });

  it('should handle Auto time granularity correctly', () => {
    const csv = generateCSVData({
      ...baseProps,
      widget: {
        ...baseProps.widget,
        time_granularity: { value: -1, unit: 'Auto' },
      },
    });

    const intervalRow = csv.find((row) => row[0] === DATA_INTERVAL_LABEL);
    expect(intervalRow?.[1]).toBe('Auto');
  });

  it('should handle regular time granularity correctly', () => {
    const csv = generateCSVData({
      ...baseProps,
      widget: {
        ...baseProps.widget,
        time_granularity: { value: 30, unit: 'seconds' },
      },
    });

    const intervalRow = csv.find(
      (row) => row[0] === 'Data Aggregation Interval'
    );
    expect(intervalRow?.[1]).toBe('30 seconds');
  });

  it('should handle multiple dimension filters', () => {
    const csv = generateCSVData({
      ...baseProps,
      dimensionFilters: [
        { dimension_label: 'test', operator: 'eq', value: 'A' },
        { dimension_label: 'test', operator: 'eq', value: 'B' },
      ],
      dimensionOptions: [
        { dimension_label: 'test', label: 'Test Label', values: ['A', 'B'] },
      ],
    });

    const filterRow = csv.find((row) => row[0] === DIMENSION_FILTERS_LABEL);
    expect(filterRow?.[1]).toContain('Test Label,eq,A;Test Label,eq,B');
  });

  it('should include zoom range times when zoomed', () => {
    const csv = generateCSVData({
      ...baseProps,
      zoomRange: {
        left: 1718000000000,
        right: 1718003600000,
      },
    });

    expect(csv.some((row) => row[0] === 'Zoom Start Time')).toBe(true);
    expect(csv.some((row) => row[0] === 'Zoom End Time')).toBe(true);
  });
});
