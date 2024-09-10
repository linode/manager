import Factory from 'src/factories/factoryProxy';

import type {
  AvailableMetrics,
  Dashboard,
  MetricDefinitions,
  Widgets,
} from '@linode/api-v4';

const units = ['%', '%', 'Bytes', 'OPS'];
const color = ['blue', 'red', 'green', 'yellow'];
const chart_type = ['area', 'area', 'area', 'line'];
const scrape_interval = ['2m', '30s', '30s', '30s'];
const units_interval = ['percent', 'byte', 'byte', 'ops_per_second'];

/* export const dashboardFactory1 = Factory.Sync.makeFactory<Dashboard>({
  created: new Date().toISOString(),
  id: Factory.each((i) => i),
  label: 'Linode Dashboard',
  service_type: 'linode',
  time_duration: {
    unit: 'min',
    value: 30,
  },
  updated: new Date().toISOString(),
  widgets: Factory.each(() => widgetFactory.buildList(4)), // Create a list of 1 widgets
});*/
export const dashboardFactory = (
  dashboardLabel: string,
  widgetLabels: string[],
  metricsLabels: string[],
  y_labels: string[]
) => {
  return Factory.Sync.makeFactory<Dashboard>({
    created: new Date().toISOString(),
    id: Factory.each((i) => i),
    label: dashboardLabel,
    service_type: 'linode',
    time_duration: {
      unit: 'min',
      value: 30,
    },
    updated: new Date().toISOString(),
    widgets: Factory.each(() =>
      widgetFactory(widgetLabels, metricsLabels, y_labels).buildList(
        widgetLabels.length
      )
    ),
  });
};

export const widgetFactory = (
  widgetLabels: string[],
  metricsLabels: string[],
  y_labels: string[]
) => {
  return Factory.Sync.makeFactory<Widgets>({
    aggregate_function: 'avg',
    chart_type: Factory.each((i) => chart_type[i % chart_type.length]),
    color: Factory.each((i) => color[i % color.length]),
    filters: [],
    group_by: 'region',
    label: Factory.each((i) => widgetLabels[i % widgetLabels.length]),
    metric: Factory.each((i) => metricsLabels[i % metricsLabels.length]),
    namespace_id: Factory.each((i) => i % 10),
    region_id: Factory.each((i) => i % 5),
    resource_id: Factory.each((i) => [`resource-${i}`]),
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
    unit: Factory.each((i) => units[i % units.length]),
    y_label: Factory.each((i) => y_labels[i % y_labels.length]),
  });
};
export const metricDefinitionsFactory = (
  widgetLabels: string[],
  metricsLabels: string[]
) => {
  return Factory.Sync.makeFactory<MetricDefinitions>({
    data: Factory.each(() => [
      dashboardMetricFactory(widgetLabels, metricsLabels).build(), // Pass widgetLabels and metricsLabels
    ]),
  });
};
const dashboardMetricFactory = (
  widgetLabels: string[],
  metricsLabels: string[]
) => {
  return Factory.Sync.makeFactory<AvailableMetrics>({
    available_aggregate_functions: ['min', 'max', 'avg', 'sum'],
    dimensions: [],
    label: Factory.each((i) => widgetLabels[i % widgetLabels.length]),
    metric: Factory.each((i) => metricsLabels[i % metricsLabels.length]),
    metric_type: 'gauge',
    scrape_interval: Factory.each(
      (i) => scrape_interval[i % scrape_interval.length]
    ),
    unit: Factory.each((i) => units_interval[i % units_interval.length]),
  });
};
