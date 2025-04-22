import { Factory } from '@linode/utilities';

import type {
  CloudPulseMetricsResponse,
  CloudPulseMetricsResponseData,
  Dashboard,
  DimensionFilter,
  MetricDefinition,
  Widgets,
} from '@linode/api-v4';
import type { ChartVariant } from 'src/components/AreaChart/AreaChart';

const color = ['blue', 'red', 'green', 'yellow'];
const chart_type: ChartVariant[] = ['area', 'area', 'area', 'line'];
const scrape_interval = ['2m', '30s', '30s', '30s'];

export const dashboardFactory = Factory.Sync.makeFactory<Dashboard>({
  created: new Date().toISOString(),
  id: Factory.each((i) => i),
  label: Factory.each((i) => `Factory Dashboard-${i}`),
  service_type: 'linode',
  time_duration: {
    unit: 'min',
    value: 30,
  },
  updated: new Date().toISOString(),
  widgets: [],
});

export const dimensionFilterFactory = Factory.Sync.makeFactory<DimensionFilter>(
  {
    dimension_label: Factory.each((i) => `dimension_${i}`),
    operator: 'startswith',
    value: Factory.each((i) => `value_${i}`),
  }
);

export const widgetFactory = Factory.Sync.makeFactory<Widgets>({
  aggregate_function: 'avg',
  chart_type: Factory.each((i) => chart_type[i % chart_type.length]),
  color: Factory.each((i) => color[i % color.length]),
  entity_ids: Factory.each((i) => [`resource-${i}`]),
  filters: dimensionFilterFactory.buildList(3),
  group_by: 'region',
  label: Factory.each((i) => `widget_label_${i}`),
  metric: Factory.each((i) => `widget_metric_${i}`),
  namespace_id: Factory.each((i) => i % 10),
  region_id: Factory.each((i) => i % 5),
  service_type: 'default',
  serviceType: 'default',
  size: 12,
  time_duration: {
    unit: 'min',
    value: 30,
  },
  time_granularity: {
    unit: 'hour',
    value: 1,
  },
  unit: 'defaultUnit',
  y_label: Factory.each((i) => `y_label_${i}`),
});

export const dashboardMetricFactory = Factory.Sync.makeFactory<MetricDefinition>(
  {
    available_aggregate_functions: ['min', 'max', 'avg', 'sum'],
    dimensions: [
      {
        dimension_label: 'state',
        label: 'State of CPU',
        values: [
          'user',
          'system',
          'idle',
          'interrupt',
          'nice',
          'softirq',
          'steal',
          'wait',
        ],
      },
    ],
    is_alertable: true,
    label: Factory.each((i) => `widget_label_${i}`),
    metric: Factory.each((i) => `widget_metric_${i}`),
    metric_type: 'gauge',
    scrape_interval: Factory.each(
      (i) => scrape_interval[i % scrape_interval.length]
    ),
    unit: 'defaultUnit',
  }
);

export const cloudPulseMetricsResponseDataFactory = Factory.Sync.makeFactory<CloudPulseMetricsResponseData>(
  {
    result: [
      {
        metric: {},
        values: [],
      },
    ],
    result_type: 'matrix',
  }
);

export const cloudPulseMetricsResponseFactory = Factory.Sync.makeFactory<CloudPulseMetricsResponse>(
  {
    data: cloudPulseMetricsResponseDataFactory.build(),
    isPartial: false,
    stats: {
      series_fetched: 2,
    },
    status: 'success',
  }
);
