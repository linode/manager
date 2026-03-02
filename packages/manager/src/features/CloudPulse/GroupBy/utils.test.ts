import { dashboardFactory } from 'src/factories';

import {
  defaultOption,
  getCommonDimensions,
  getCommonGroups,
  getMetricDimensions,
  useGlobalDimensions,
  useWidgetDimension,
} from './utils';

import type { Dashboard, MetricDefinition } from '@linode/api-v4';

const metricDefinitions: MetricDefinition[] = [
  {
    metric: 'Metric 1',
    dimensions: [
      { label: 'Dim 1', dimension_label: 'Dim 1', values: [] },
      { label: 'Dim 2', dimension_label: 'Dim 2', values: [] },
    ],
    available_aggregate_functions: [],
    is_alertable: false,
    label: '',
    metric_type: '',
    scrape_interval: '',
    unit: '',
  },
  {
    metric: 'Metric 2',
    dimensions: [
      { label: 'Dim 2', dimension_label: 'Dim 2', values: [] },
      { label: 'Dim 3', dimension_label: 'Dim 3', values: [] },
    ],
    available_aggregate_functions: [],
    is_alertable: false,
    label: '',
    metric_type: '',
    scrape_interval: '',
    unit: '',
  },
  {
    metric: 'Metric 3',
    dimensions: [
      { label: 'Dim 1', dimension_label: 'Dim 1', values: [] },
      { label: 'Dim 2', dimension_label: 'Dim 2', values: [] },
      { label: 'Dim 3', dimension_label: 'Dim 3', values: [] },
    ],
    available_aggregate_functions: [],
    is_alertable: false,
    label: '',
    metric_type: '',
    scrape_interval: '',
    unit: '',
  },
];

const queryMocks = vi.hoisted(() => ({
  useCloudPulseDashboardByIdQuery: vi.fn().mockReturnValue({}),
  useGetCloudPulseMetricDefinitionsByServiceType: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudpulse/dashboards', async (importActual) => ({
  ...importActual(),
  useCloudPulseDashboardByIdQuery: queryMocks.useCloudPulseDashboardByIdQuery,
}));

vi.mock('src/queries/cloudpulse/services', async (importActual) => ({
  ...importActual(),
  useGetCloudPulseMetricDefinitionsByServiceType:
    queryMocks.useGetCloudPulseMetricDefinitionsByServiceType,
}));

describe('useGlobalDimensions method test', () => {
  it('should return loading state when data is being fetched', () => {
    queryMocks.useCloudPulseDashboardByIdQuery.mockReturnValue({
      data: null,
      isLoading: true,
    });
    queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
      data: null,
      isLoading: true,
    });

    const result = useGlobalDimensions(1, 'linode');
    expect(result).toEqual({ options: [], defaultValue: [], isLoading: true });
  });

  it('should return non-empty options and defaultValue if no common dimensions', () => {
    queryMocks.useCloudPulseDashboardByIdQuery.mockReturnValue({
      data: dashboardFactory.build({ id: 1 }),
      isLoading: false,
    });
    queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
      data: {
        data: metricDefinitions,
      },
      isLoading: false,
    });
    const result = useGlobalDimensions(1, 'linode');
    expect(result).toEqual({
      options: [defaultOption, { label: 'Dim 2', value: 'Dim 2' }],
      defaultValue: [],
      isLoading: false,
    });
  });

  it('should return non-empty options and defaultValue from preferences', () => {
    queryMocks.useCloudPulseDashboardByIdQuery.mockReturnValue({
      data: dashboardFactory.build({ id: 1 }),
      isLoading: false,
    });
    queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
      data: {
        data: metricDefinitions,
      },
      isLoading: false,
    });
    const preference = ['Dim 2'];
    const result = useGlobalDimensions(1, 'linode', preference);
    expect(result).toEqual({
      options: [defaultOption, { label: 'Dim 2', value: 'Dim 2' }],
      defaultValue: [{ label: 'Dim 2', value: 'Dim 2' }],
      isLoading: false,
    });
  });

  it('should not return default option in case of endpoints-only dashboard', () => {
    queryMocks.useCloudPulseDashboardByIdQuery.mockReturnValue({
      data: dashboardFactory.build({ id: 10 }),
      isLoading: false,
    });
    queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
      data: {
        data: metricDefinitions,
      },
      isLoading: false,
    });
    const result = useGlobalDimensions(10, 'objectstorage');
    // Verify if options contain the default option - 'entityId' or not
    expect(result.options).toEqual([{ label: 'Dim 2', value: 'Dim 2' }]);
  });
});

describe('useWidgetDimension method test', () => {
  it('should return empty options and defaultValue', () => {
    queryMocks.useCloudPulseDashboardByIdQuery.mockReturnValue({
      data: dashboardFactory.build(),
      isLoading: false,
    });

    queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
      data: {
        data: metricDefinitions,
      },
      isLoading: false,
    });

    const result = useWidgetDimension(
      1,
      'linode',
      [
        { label: 'Dim 1', value: 'Dim 1' },
        { label: 'Dim 2', value: 'Dim 2' },
      ],
      'Metric 1'
    );

    expect(result.options).toHaveLength(0);
    expect(result.defaultValue).toHaveLength(0);
    expect(result.isLoading).toBe(false);
  });

  it('should return non-empty options and empty defaultValue', () => {
    queryMocks.useCloudPulseDashboardByIdQuery.mockReturnValue({
      data: dashboardFactory.build(),
      isLoading: false,
    });

    queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
      data: {
        data: metricDefinitions,
      },
      isLoading: false,
    });

    const result = useWidgetDimension(
      1,
      'linode',
      [{ label: 'Dim 1', value: 'Dim 1' }],
      'Metric 1'
    );

    expect(result.options).toHaveLength(1);
    expect(result.defaultValue).toHaveLength(0);
    expect(result.isLoading).toBe(false);
  });

  it('should return non-empty options and non-empty default value from preferences', () => {
    queryMocks.useCloudPulseDashboardByIdQuery.mockReturnValue({
      data: dashboardFactory.build(),
      isLoading: false,
    });

    queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
      data: {
        data: metricDefinitions,
      },
      isLoading: false,
    });
    const preferences = ['Dim 2'];
    const result = useWidgetDimension(
      1,
      'linode',
      [{ label: 'Dim 1', value: 'Dim 1' }],
      'Metric 1',
      preferences
    );

    expect(result.options).toHaveLength(1);
    expect(result.defaultValue).toHaveLength(1);
    expect(result.isLoading).toBe(false);
  });
});
describe('getCommonGroups method test', () => {
  it('should return empty list if groups or commonDimensions are empty', () => {
    const result = getCommonGroups([], []);
    expect(result).toHaveLength(0);
  });

  it('should return common groups', () => {
    const groups: string[] = ['Group 1', 'Group 2'];
    const commonDimensions = [
      { label: 'Group 1', value: 'Group 1' },
      { label: 'Group 2', value: 'Group 2' },
      { label: 'Group 3', value: 'Group 3' },
    ];
    const result = getCommonGroups(groups, commonDimensions);
    expect(result).toHaveLength(2);
    expect(result).toEqual([
      { label: 'Group 1', value: 'Group 1' },
      { label: 'Group 2', value: 'Group 2' },
    ]);
  });
});

describe('getMetricDimensions method test', () => {
  const dashboard: Dashboard = dashboardFactory.build({
    widgets: [
      {
        metric: 'Metric 1',
      },
      {
        metric: 'Metric 2',
      },
      {
        metric: 'Metric 3',
      },
    ],
  });
  it('should return empty object if metric definitions are empty', () => {
    const result = getMetricDimensions([]);
    expect(result).toEqual({});
  });

  it('should return unique dimensions from metric definitions', () => {
    const result = getMetricDimensions(metricDefinitions, dashboard);
    expect(result).toEqual({
      'Metric 1': [
        { label: 'Dim 1', dimension_label: 'Dim 1', values: [] },
        { label: 'Dim 2', dimension_label: 'Dim 2', values: [] },
      ],
      'Metric 2': [
        { label: 'Dim 2', dimension_label: 'Dim 2', values: [] },
        { label: 'Dim 3', dimension_label: 'Dim 3', values: [] },
      ],
      'Metric 3': [
        { label: 'Dim 1', dimension_label: 'Dim 1', values: [] },
        { label: 'Dim 2', dimension_label: 'Dim 2', values: [] },
        { label: 'Dim 3', dimension_label: 'Dim 3', values: [] },
      ],
    });
  });

  describe('getCommonDimensions method test', () => {
    it('should return empty list if metricDimensions is empty', () => {
      const result = getCommonDimensions({});
      expect(result).toHaveLength(0);
    });

    it('should return common dimensions across all metrics', () => {
      const metricDimensions = {
        'Metric 1': [
          { label: 'Dim 1', dimension_label: 'Dim 1', values: [] },
          { label: 'Dim 2', dimension_label: 'Dim 2', values: [] },
          { label: 'Dim 3', dimension_label: 'Dim 3', values: [] },
        ],
        'Metric 2': [
          { label: 'Dim 2', dimension_label: 'Dim 2', values: [] },
          { label: 'Dim 3', dimension_label: 'Dim 3', values: [] },
          { label: 'Dim 4', dimension_label: 'Dim 4', values: [] },
        ],
        'Metric 3': [
          { label: 'Dim 1', dimension_label: 'Dim 1', values: [] },
          { label: 'Dim 3', dimension_label: 'Dim 3', values: [] },
          { label: 'Dim 4', dimension_label: 'Dim 4', values: [] },
        ],
      };
      const result = getCommonDimensions(metricDimensions);
      expect(result).toHaveLength(1);
      expect(result).toEqual([{ label: 'Dim 3', value: 'Dim 3' }]);
    });
  });
});
