import { formatPercentage } from 'src/utilities/statMetrics';

import {
  generateGraphData,
  generateMaxUnit,
  getDimensionName,
  getLabelName,
  mapResourceIdToName,
} from './CloudPulseWidgetUtils';

import type { CloudPulseMetricsResponse } from '@linode/api-v4';

it('test generateMaxUnit method', () => {
  const legendRowsData = [
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

it('test getLabelName method', () => {
  const props = {
    flags: {
      aclpResourceTypeMap: [
        { dimensionKey: 'resource_id', serviceType: 'linode' },
      ],
    },
    label: 'CPU Usage',
    metric: { resource_id: '123' },
    resources: [{ id: '123', label: 'linode-1' }],
    serviceType: 'linode',
    unit: '%',
  };

  const result = getLabelName(props);
  expect(result).toBe('linode-1');
});

it('test generateGraphData with metrics data', () => {
  const mockMetricsResponse: CloudPulseMetricsResponse = {
    data: {
      result: [
        {
          metric: { resource_id: '1' },
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
    flags: {
      aclpResourceTypeMap: [
        { dimensionKey: 'resource_id', serviceType: 'linode' },
      ],
    },
    label: 'Graph',
    metricsList: mockMetricsResponse,
    resources: [{ id: '1', label: 'linode-1' }],
    serviceType: 'linode',
    status: 'success',
    unit: '%',
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

it('test getDimensionName method', () => {
  const props = {
    flag: { dimensionKey: 'resource_id', serviceType: 'linode' },
    metric: { resource_id: '123' },
    resources: [{ id: '123', label: 'linode-1' }],
  };

  const result = getDimensionName(props);
  expect(result).toBe('linode-1');
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
