import { formatPercentage } from '@linode/utilities';

import {
  generateGraphData,
  generateMaxUnit,
  getDimensionName,
  getLabelName,
  getTimeDurationFromPreset,
  mapResourceIdToName,
} from './CloudPulseWidgetUtils';

import type {
  DimensionNameProperties,
  LabelNameOptionsProps,
} from './CloudPulseWidgetUtils';
import type { CloudPulseMetricsResponse } from '@linode/api-v4';
import type { MetricsDisplayRow } from 'src/components/LineGraph/MetricsDisplay';

describe('generateMaxUnit method', () => {
  it('returns the appropriate unit for mixed data values', () => {
    const legendRowsData: MetricsDisplayRow[] = [
      {
        data: { average: 1500, last: 1600, length: 3, max: 2000, total: 4500 },
        format: formatPercentage,
        legendColor: '#000',
        legendTitle: 'linode-1',
      },
      {
        data: {
          average: 2000000,
          last: 2100000,
          length: 3,
          max: 2500000,
          total: 6000000,
        },
        format: formatPercentage,
        legendColor: '#000',
        legendTitle: 'linode-2',
      },
    ];

    const result = generateMaxUnit(legendRowsData, 'Bytes');
    expect(result).toBe('MB');
  });

  it('returns correct unit for empty array', () => {
    const legendRowsData: MetricsDisplayRow[] = [];
    const result = generateMaxUnit(legendRowsData, 'Bytes');
    expect(result).toBe('B');
  });

  it('returns correct unit when max is zero', () => {
    const legendRowsData: MetricsDisplayRow[] = [
      {
        data: { average: 0, last: 0, length: 3, max: 0, total: 0 },
        format: formatPercentage,
        legendColor: '#000',
        legendTitle: 'linode-1',
      },
    ];
    const result = generateMaxUnit(legendRowsData, 'Bytes');
    expect(result).toBe('B');
  });
});

describe('getLabelName method', () => {
  const baseProps: LabelNameOptionsProps = {
    label: 'CPU Usage',
    metric: { entity_id: '123' },
    resources: [{ id: '123', label: 'linode-1' }],
    serviceType: 'linode',
    unit: '%',
  };

  it('returns resource label when all data is valid', () => {
    const result = getLabelName(baseProps);
    expect(result).toBe('linode-1');
  });

  it('returns entity_id when resource is not found in resources array', () => {
    const props: LabelNameOptionsProps = {
      ...baseProps,
      metric: { entity_id: '999' },
    };
    const result = getLabelName(props);
    expect(result).toBe('999');
  });

  it('returns empty string when entity_id is empty', () => {
    const props: LabelNameOptionsProps = {
      ...baseProps,
      metric: { entity_id: '' },
    };
    const result = getLabelName(props);
    expect(result).toBe('');
  });
});

it('test generateGraphData with metrics data', () => {
  const mockMetricsResponse: CloudPulseMetricsResponse = {
    data: {
      result: [
        {
          metric: { entity_id: '1' },
          values: [[1234567890, '50']],
        },
      ],
      result_type: 'matrix',
    },
    isPartial: false,
    stats: {
      series_fetched: 1,
    },
    status: 'success',
  };

  const result = generateGraphData({
    label: 'Graph',
    metricsList: mockMetricsResponse,
    resources: [{ id: '1', label: 'linode-1' }],
    status: 'success',
    unit: '%',
    serviceType: 'linode',
  });

  expect(result.areas[0].dataKey).toBe('linode-1');
  expect(result.dimensions).toEqual([
    {
      'linode-1': 50,
      timestamp: 1234567890000,
    },
  ]);

  expect(result.legendRowsData[0].data).toEqual({
    average: 50,
    last: 50,
    length: 1,
    max: 50,
    total: 50,
  });
  expect(result.legendRowsData[0].format).toBeDefined();
  expect(result.legendRowsData[0].legendTitle).toBe('linode-1');
  expect(result.unit).toBe('%');
});

describe('getDimensionName method', () => {
  const baseProps: DimensionNameProperties = {
    serviceType: 'linode',
    metric: { entity_id: '123' },
    resources: [{ id: '123', label: 'linode-1' }],
  };

  it('returns resource label when all data is valid', () => {
    const result = getDimensionName(baseProps);
    expect(result).toBe('linode-1');
  });

  it('returns empty string when metric is empty', () => {
    const props = {
      ...baseProps,
      metric: {},
    };
    const result = getDimensionName(props);
    expect(result).toBe('');
  });

  it('returns value directly when key does not match entity_id', () => {
    const props: DimensionNameProperties = {
      ...baseProps,
      metric: { other_key: '123' },
    };
    const result = getDimensionName(props);
    expect(result).toBe('123');
  });

  it('joins multiple metric values with separator excluding metric_name when there is only one unique metric name', () => {
    const props: DimensionNameProperties = {
      ...baseProps,
      metric: { entity_id: '123', metric_name: 'test', node_id: 'primary-1' },
      hideMetricName: true,
    };
    const result = getDimensionName(props);
    expect(result).toBe('linode-1 | primary-1');
  });

  it('joins multiple metric values with separator including metric_name when there are multiple unique metric names', () => {
    const props: DimensionNameProperties = {
      ...baseProps,
      metric: { entity_id: '123', metric_name: 'test', node_id: 'primary-1' },
    };
    const result = getDimensionName(props);
    expect(result).toBe('linode-1 | test | primary-1');
  });

  it('handles empty metric values by filtering them out', () => {
    const props: DimensionNameProperties = {
      ...baseProps,
      metric: { entity_id: '123', metric_name: '', node_id: '' },
    };
    const result = getDimensionName(props);
    expect(result).toBe('linode-1');
  });

  it('returns entity_id directly when resources array is empty', () => {
    const props: DimensionNameProperties = {
      ...baseProps,
      resources: [],
    };
    const result = getDimensionName(props);
    expect(result).toBe('123');
  });

  it('returns the transformed dimension value according to the service type', () => {
    const props: DimensionNameProperties = {
      ...baseProps,
      metric: {
        entity_id: '123',
        metric_name: 'test',
        node_id: 'primary-1',
        operation: 'read',
      },
    };
    const result = getDimensionName(props);
    expect(result).toBe('linode-1 | test | primary-1 | Read');
  });

  it('returns the actual value if dimension name is not found in the transform config', () => {
    const props: DimensionNameProperties = {
      ...baseProps,
      metric: { entity_id: '123', metric_name: 'test', node_id: 'primary-1' },
    };
    const result = getDimensionName(props);
    expect(result).toBe('linode-1 | test | primary-1');
  });
});

it('test mapResourceIdToName method', () => {
  const resources = [
    { id: '123', label: 'linode-1' },
    { id: '456', label: 'inode-2' },
  ];

  expect(mapResourceIdToName('123', resources)).toBe('linode-1');
  expect(mapResourceIdToName('999', resources)).toBe('999');
  expect(mapResourceIdToName(undefined, resources)).toBe('');
});

describe('getTimeDurationFromPreset method', () => {
  it('should return correct time duration for Last Day preset', () => {
    const result = getTimeDurationFromPreset('last day');
    expect(result).toStrictEqual({
      unit: 'days',
      value: 1,
    });
  });

  it('shoult return undefined of invalid preset', () => {
    const result = getTimeDurationFromPreset('15min');
    expect(result).toBe(undefined);
  });
});
