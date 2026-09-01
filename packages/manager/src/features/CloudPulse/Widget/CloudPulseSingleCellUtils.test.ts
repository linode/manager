import {
  calculateAggregatedValue,
  getWidgetPeriodLabel,
} from './CloudPulseSingleCellUtils';
import {
  formatDateTime,
  formatTimestamp,
} from './csv/CloudPulseWidgetCSVUtils';

import type { DateTimeWithPreset } from '@linode/api-v4';
import type { ChartData } from 'src/components/SingleKpiChart';

vi.mock('./csv/CloudPulseWidgetCSVUtils', () => ({
  formatDateTime: vi.fn((date: string) => `formatted-date-${date}`),
  formatTimestamp: vi.fn((ts: number) => `formatted-ts-${ts}`),
}));

describe('calculateAggregatedValue', () => {
  it('returns 0 when data is undefined or empty', () => {
    expect(calculateAggregatedValue(undefined)).toBe(0);
    expect(calculateAggregatedValue([])).toBe(0);
  });

  it('calculates average correctly', () => {
    const data: ChartData[] = [
      { timestamp: 100, value: 10 },
      { timestamp: 200, value: 20 },
      { timestamp: 300, value: 30 },
    ];
    expect(calculateAggregatedValue(data, 'avg')).toBe(20);
    expect(calculateAggregatedValue(data, 'AVG')).toBe(20);
  });

  it('calculates maximum value correctly', () => {
    const data: ChartData[] = [
      { timestamp: 100, value: 10 },
      { timestamp: 200, value: 50 },
      { timestamp: 300, value: 20 },
    ];
    expect(calculateAggregatedValue(data, 'max')).toBe(50);
  });

  it('calculates minimum value correctly', () => {
    const data: ChartData[] = [
      { timestamp: 100, value: 10 },
      { timestamp: 200, value: 5 },
      { timestamp: 300, value: 20 },
    ];
    expect(calculateAggregatedValue(data, 'min')).toBe(5);
  });

  it('calculates sum correctly by default or when sum is specified', () => {
    const data: ChartData[] = [
      { timestamp: 100, value: 10 },
      { timestamp: 200, value: 20 },
    ];
    expect(calculateAggregatedValue(data, 'sum')).toBe(30);
    expect(calculateAggregatedValue(data)).toBe(30);
    expect(calculateAggregatedValue(data, 'unknown_func')).toBe(30);
  });
});

describe('getWidgetPeriodLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns preset name when preset is not "Reset"', () => {
    const duration: DateTimeWithPreset = {
      preset: 'Last 24 Hours',
      timeZone: 'UTC',
      start: '2026-08-26T10:00:00Z',
      end: '2026-08-27T10:00:00Z',
    };
    expect(getWidgetPeriodLabel(duration, [])).toBe('Last 24 Hours');
  });

  it('returns "Custom" if preset is undefined and not "Reset"', () => {
    const duration = {
      timeZone: 'UTC',
    } as DateTimeWithPreset;
    expect(getWidgetPeriodLabel(duration, [])).toBe('Custom');
  });

  it('formats timestamps using first and last item when preset is "Reset" and data is present', () => {
    const duration: DateTimeWithPreset = {
      preset: 'Reset',
      timeZone: 'America/New_York',
      start: '2026-08-26T10:00:00Z',
      end: '2026-08-27T10:00:00Z',
    };
    const data: ChartData[] = [
      { timestamp: 100, value: 10 },
      { timestamp: 200, value: 20 },
      { timestamp: 300, value: 30 },
    ];

    const label = getWidgetPeriodLabel(duration, data);

    expect(formatTimestamp).toHaveBeenNthCalledWith(
      1,
      100000,
      'America/New_York'
    );
    expect(formatTimestamp).toHaveBeenNthCalledWith(
      2,
      300000,
      'America/New_York'
    );
    expect(label).toBe('formatted-ts-100000 - formatted-ts-300000');
  });

  it('formats start and end dates when preset is "Reset" but data is empty', () => {
    const duration: DateTimeWithPreset = {
      end: '2026-08-27T10:00:00Z',
      preset: 'Reset',
      start: '2026-08-27T00:00:00Z',
      timeZone: 'UTC',
    };

    const label = getWidgetPeriodLabel(duration, []);

    expect(formatDateTime).toHaveBeenNthCalledWith(
      1,
      '2026-08-27T00:00:00Z',
      'UTC',
      false
    );
    expect(formatDateTime).toHaveBeenNthCalledWith(
      2,
      '2026-08-27T10:00:00Z',
      'UTC',
      false
    );
    expect(label).toBe(
      'formatted-date-2026-08-27T00:00:00Z - formatted-date-2026-08-27T10:00:00Z'
    );
  });
});
