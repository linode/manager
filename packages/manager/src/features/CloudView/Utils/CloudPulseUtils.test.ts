import {
  getDimensionName,
  getResourceIDsPayload,
  mapResourceIdToName,
} from './CloudPulseUtils';

it('test map id to instance name method', () => {
  const result = mapResourceIdToName('8', [
    { id: '8', label: 'test' },
    { id: '10', label: '10test' },
  ]);

  expect(result).toBe('test');
});

it('test map id to instance name method with empty resources', () => {
  const result = mapResourceIdToName('8', []);

  expect(result).toBe('8');
});

it('test map id to instance name method with undefined resources', () => {
  const result = mapResourceIdToName('8', undefined!);

  expect(result).toBe('8');
});

it('test map id to instance name method with undefined id', () => {
  const result = mapResourceIdToName(undefined!, undefined!);

  expect(result).toBe(undefined);
});

it('test getResourceIDsPayload happy path', () => {
  const resourcesData = {
    data: [
      {
        id: 1,
      },
      {
        id: 2,
      },
      {
        id: 3,
      },
    ],
  };
  const result = getResourceIDsPayload(resourcesData);

  expect(result.resource_id.length).toBe(3);
});

it('test getResourceIDsPayload undefined resources', () => {
  const result = getResourceIDsPayload(undefined);

  expect(result.resource_id.length).toBe(0);
});

it('test getResourceIDsPayload empty resources', () => {
  const result = getResourceIDsPayload([]);

  expect(result.resource_id.length).toBe(0);
});

it('test getDimensionName happy path', () => {
  let metric = {
    LINODE_ID: '87666',
  };

  const flag = {
    metricKey: 'LINODE_ID',
  };

  const resources = [
    {
      id: '87666',
      label: 'test',
    },
    {
      id: '87667',
      label: 'tester',
    },
  ];

  let result = getDimensionName(metric, flag, resources);

  expect(result).toBe('test');

  metric = {
    LINODE_ID: '87667',
  };

  result = getDimensionName(metric, flag, resources);

  expect(result).toBe('tester');
});

it('test getDimensionName non matching use case', () => {
  const metric = {
    LINODE_ID: '87668',
  };

  const flag = {
    metricKey: 'LINODE_ID',
  };

  const resources = [
    {
      id: '87666',
      label: 'test',
    },
    {
      id: '87667',
      label: 'tester',
    },
  ];

  const result = getDimensionName(metric, flag, resources);

  expect(result).toBe('87668'); // whatever the ID may be will be metric key
});

it('test getDimensionName non matching use case with flag', () => {
  const metric = {
    state: 'Country',
  };

  const flag = {
    metricKey: 'LINODE_ID',
  };

  const resources = [
    {
      id: '87666',
      label: 'test',
    },
    {
      id: '87667',
      label: 'tester',
    },
  ];

  const result = getDimensionName(metric, flag, resources);

  expect(result).toBe('Country'); // whatever the metric key
});

it('test getDimensionName matching use case with multiple metrics', () => {
  const metric = {
    LINODE_ID: '87666',
    state: 'Country',
  };

  const flag = {
    metricKey: 'LINODE_ID',
  };

  const resources = [
    {
      id: '87666',
      label: 'test',
    },
    {
      id: '87667',
      label: 'tester',
    },
  ];

  const result = getDimensionName(metric, flag, resources);

  expect(result).toBe('test_Country'); // whatever the metric key
});

it('test getDimensionName matching use case with multiple metrics in which something is undefined', () => {
  const metric = {
    LINODE_ID: '87666',
    state: undefined,
  };

  const flag = {
    metricKey: 'LINODE_ID',
  };

  const resources = [
    {
      id: '87666',
      label: 'test',
    },
    {
      id: '87667',
      label: 'tester',
    },
  ];

  const result = getDimensionName(metric, flag, resources);

  expect(result).toBe('test'); // whatever the metric key which are not undefined
});

it('test getDimensionName matching use case with multiple metrics in which id is undefined', () => {
  const metric = {
    LINODE_ID: undefined!,
    state: 'Country',
  };

  const flag = {
    metricKey: 'LINODE_ID',
  };

  const resources = [
    {
      id: '87666',
      label: 'test',
    },
    {
      id: '87667',
      label: 'tester',
    },
  ];

  const result = getDimensionName(metric, flag, resources);

  expect(result).toBe('Country'); // whatever the metric key which are not undefined
});
