import { formatPercentage } from '@linode/utilities';

import { widgetFactory } from 'src/factories';

import {
  generateGraphData,
  generateMaxUnit,
  getDimensionName,
  getEntityIds,
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
    groupBy: ['entity_id'],
  };

  it('returns resource label when all data is valid', () => {
    const result = getLabelName(baseProps);
    expect(result).toBe('linode-1');
  });

  it('returns entity_id when resource is not found in resources array', () => {
    const props = {
      ...baseProps,
      metric: { entity_id: '999' },
    };
    const result = getLabelName(props);
    expect(result).toBe('999');
  });

  it('returns empty string when entity_id is empty', () => {
    const props = {
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
    groupBy: ['entity_id'],
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
    groupBy: ['entity_id'],
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
    const props = {
      ...baseProps,
      metric: { other_key: '123' },
    };
    const result = getDimensionName(props);
    expect(result).toBe('123');
  });

  it('joins multiple metric values with separator excluding metric_name when there is only one unique metric name', () => {
    const props = {
      ...baseProps,
      metric: { entity_id: '123', metric_name: 'test', node_id: 'primary-1' },
      hideMetricName: true,
    };
    const result = getDimensionName(props);
    expect(result).toBe('linode-1 | primary-1');
  });

  it('joins multiple metric values with separator including metric_name when there are multiple unique metric names', () => {
    const props = {
      ...baseProps,
      metric: { entity_id: '123', metric_name: 'test', node_id: 'primary-1' },
    };
    const result = getDimensionName(props);
    expect(result).toBe('linode-1 | test | primary-1');
  });

  it('handles empty metric values by filtering them out', () => {
    const props = {
      ...baseProps,
      metric: { entity_id: '123', metric_name: '', node_id: '' },
    };
    const result = getDimensionName(props);
    expect(result).toBe('linode-1');
  });

  it('returns entity_id directly when resources array is empty', () => {
    const props = {
      ...baseProps,
      resources: [],
    };
    const result = getDimensionName(props);
    expect(result).toBe('123');
  });

  it('returns the associated nodebalancer label as is when key is nodebalancer_id', () => {
    const props: DimensionNameProperties = {
      ...baseProps,
      resources: [
        {
          id: '123',
          label: 'firewall-1',
          entities: { a: 'nodebalancer-1' },
        },
      ],
      serviceType: 'firewall',
      metric: { nodebalancer_id: 'a' },
    };
    const result = getDimensionName(props);
    expect(result).toBe('nodebalancer-1');
  });

  it('returns the transformed dimension value according to the service type', () => {
    const props = {
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
    const props = {
      ...baseProps,
      metric: { entity_id: '123', metric_name: 'test', node_id: 'primary-1' },
    };
    const result = getDimensionName(props);
    expect(result).toBe('linode-1 | test | primary-1');
  });

  it('returns the linode label when key is linode_id and service type is firewall', () => {
    const props: DimensionNameProperties = {
      ...baseProps,
      metric: { linode_id: '123' },
      serviceType: 'firewall',
      resources: [
        {
          id: '123',
          label: 'Firewall-1',
          entities: { '123': 'linode-1' },
        },
      ],
    };
    const result = getDimensionName(props);
    expect(result).toBe('linode-1');
  });

  it('returns the volume linode label when key is linode_id and service type is blockstorage', () => {
    const props: DimensionNameProperties = {
      ...baseProps,
      metric: { linode_id: '123' },
      serviceType: 'blockstorage',
      resources: [
        {
          id: '123',
          label: 'Volume-1',
          volumeLinodeId: '123',
          volumeLinodeLabel: 'linode-1',
        },
      ],
    };
    const result = getDimensionName(props);
    expect(result).toBe('linode-1');
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
    const result = getTimeDurationFromPreset('Last day');
    expect(result).toStrictEqual({
      unit: 'days',
      value: 1,
    });
  });

  it('should return undefined for invalid preset', () => {
    const result = getTimeDurationFromPreset('15min');
    expect(result).toBe(undefined);
  });

  describe('getEntityIds method', () => {
    it('should return entity ids for linode service type', () => {
      const result = getEntityIds(
        [{ id: '123', label: 'linode-1' }],
        ['123'],
        widgetFactory.build(),
        2
      );
      expect(result).toEqual([123]);
    });

    it('should return entity ids for objectstorage buckets dashboard', () => {
      const result = getEntityIds(
        [{ id: 'bucket-1', label: 'bucket-name-1' }],
        ['bucket-1'],
        widgetFactory.build(),
        6
      );
      expect(result).toEqual(['bucket-1']);
    });

    it('should return undefined for objectsorage endpoints dashboard', () => {
      const result = getEntityIds(
        [{ id: 'endpoint-1', label: 'endpoint-1' }],
        ['us-east-1.linodeobjects.com'],
        widgetFactory.build(),
        10
      );
      expect(result).toEqual(undefined);
    });
  });
});
