import Factory from 'src/factories/factoryProxy';

import type {
  AvailableMetrics,
  CloudPulseMetricsResponse,
  CloudPulseMetricsResponseData,
  Dashboard,
  Widgets,
} from '@linode/api-v4';

const color = ['blue', 'red', 'green', 'yellow'];
const chart_type = ['area', 'area', 'area', 'line'];
const scrape_interval = ['2m', '30s', '30s', '30s'];

/**
 * Factory function to create instances of the `Dashboard` model with predefined properties and values.
 *
 * @param {string} dashboardLabel - The label to assign to the dashboard instance.
 * @param {string[]} widgetLabels - An array of labels for widgets to be included in the dashboard.
 * @param {string[]} metricsLabels - An array of labels for metrics associated with the widgets.
 * @param {string[]} y_labels - An array of Y-axis labels for the metrics.
 * @param {string} service - The type of service to be assigned to the dashboard.
 *
 * @returns {Factory<Dashboard>} A Factory instance for creating `Dashboard` objects with the specified properties.
 */

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
/**
 * Factory function to create instances of the `Widgets` model with predefined properties and values.
 *
 * @param {string[]} widgetLabels - An array of labels for widgets to be created.
 * @param {string[]} metricsLabels - An array of metrics labels associated with each widget.
 * @param {string[]} y_labels - An array of Y-axis labels for the metrics.
 *
 * @returns {Factory<Widgets>} A Factory instance for creating `Widgets` objects with the specified properties.
 */
export const widgetFactory = Factory.Sync.makeFactory<Widgets>({
  aggregate_function: 'avg',
  chart_type: Factory.each((i) => chart_type[i % chart_type.length]),
  color: Factory.each((i) => color[i % color.length]),
  filters: [],
  group_by: 'region',
  label: Factory.each((i) => `widget_label_${i}`),
  metric: Factory.each((i) => `widget_metric_${i}`),
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
  unit: 'defaultUnit',
  y_label: Factory.each((i) => `y_label_${i}`),
});
/**
 * Factory function to create instances of the `AvailableMetrics` model with predefined properties and values.
 *
 * @param {string[]} widgetLabels - An array of labels for widgets that will be associated with the metrics.
 * @param {string[]} metricsLabels - An array of labels for metrics to be used in the `AvailableMetrics` instances.
 *
 * @returns {Factory<AvailableMetrics>} A Factory instance for creating `AvailableMetrics` objects with the specified properties.
 *
 */

export const dashboardMetricFactory =
  Factory.Sync.makeFactory<AvailableMetrics>({
    available_aggregate_functions: ['min', 'max', 'avg', 'sum'],
    dimensions: [],
    label: Factory.each((i) => `widget_label_${i}`), // This might be overridden
    metric: Factory.each((i) => `widget_metric_${i}`), // This might be overridden
    metric_type: 'gauge',
    scrape_interval: Factory.each(
      (i) => scrape_interval[i % scrape_interval.length]
    ),
    unit: 'defaultUnit',
  });

// Factory for CloudPulseMetricsResponseData
export const cloudPulseMetricsResponseDataFactory =
  Factory.Sync.makeFactory<CloudPulseMetricsResponseData>({
    result: [
      {
        metric: {},
        values: [], // Generate 10 data points with 1-minute interval
      },
    ],
    result_type: 'matrix', // Default result type
  });

// Factory for CloudPulseMetricsResponse
export const cloudPulseMetricsResponseFactory =
  Factory.Sync.makeFactory<CloudPulseMetricsResponse>({
    data: cloudPulseMetricsResponseDataFactory.build(), // Use the data factory here
    isPartial: false,
    stats: {
      series_fetched: 2, // Adjust based on the number of metrics
    },
    status: 'success',
  });
