import { useCloudPulseDashboardByIdQuery } from 'src/queries/cloudpulse/dashboards';
import { useGetCloudPulseMetricDefinitionsByServiceType } from 'src/queries/cloudpulse/services';

import type { GroupByOption } from './CloudPulseGroupByDrawer';
import type {
  CloudPulseServiceType,
  Dimension,
  MetricDefinition,
} from '@linode/api-v4';

export const defaultOption: GroupByOption = {
  label: 'Entity Id',
  value: 'entity_id',
};

interface GroupByDimension {
  /**
   * The default grouping options to use
   */
  defaultValue: GroupByOption[];
  /**
   * Indicates if the grouping options are currently loading
   */
  isLoading: boolean;
  /**
   * Available grouping options
   */
  options: GroupByOption[];
}

interface MetricDimension {
  [metric: string]: Dimension[];
}

export const useGlobalDimensions = (
  dashboardId: number | undefined,
  serviceType: CloudPulseServiceType | undefined
): GroupByDimension => {
  const { data: dashboard, isLoading: dashboardLoading } =
    useCloudPulseDashboardByIdQuery(dashboardId);
  const { data: metricDefinition, isLoading: metricLoading } =
    useGetCloudPulseMetricDefinitionsByServiceType(
      serviceType,
      serviceType !== undefined
    );

  if (metricLoading || dashboardLoading) {
    return { options: [], defaultValue: [], isLoading: true };
  }
  const metricDimensions = getMetricDimensions(metricDefinition?.data ?? []);
  const commonDimensions = [
    defaultOption,
    ...getCommonDimensions(metricDimensions),
  ];

  const commonGroups = getCommonGroups(
    dashboard?.group_by ?? [],
    commonDimensions
  );
  return {
    options: commonDimensions,
    defaultValue: commonGroups,
    isLoading: false,
  };
};

/**
 *
 * @param groupBy Default group by list from dashboard
 * @param commonDimensions The available common dimensions across all metrics
 * @returns An array of GroupByOption objects that exist in both the dashboard config and common dimensions
 */
export const getCommonGroups = (
  groupBy: string[],
  commonDimensions: GroupByOption[]
): GroupByOption[] => {
  if (groupBy.length === 0 || commonDimensions.length === 0) return [];

  return commonDimensions.filter((group) => {
    return groupBy.includes(group.value);
  });
};

export const useWidgetDimension = (
  dashboardId: number | undefined,
  serviceType: CloudPulseServiceType | undefined,
  globalDimensions: GroupByOption[],
  metric: string | undefined
) => {
  const { data: dashboard, isLoading: dashboardLoading } =
    useCloudPulseDashboardByIdQuery(dashboardId);
  const { data: metricDefinition, isLoading: metricLoading } =
    useGetCloudPulseMetricDefinitionsByServiceType(
      serviceType,
      serviceType !== undefined
    );

  if (metricLoading || dashboardLoading) {
    return { options: [], defaultValue: [], isLoading: true };
  }

  const metricDimensions: GroupByOption[] =
    metricDefinition?.data
      .find((def) => def.metric === metric)
      ?.dimensions?.map(({ label, dimension_label }) => ({
        label,
        value: dimension_label,
      })) ?? [];
  const defaultGroupBy =
    dashboard?.widgets.find((widget) => widget.metric === metric)?.group_by ??
    [];
  const options = metricDimensions.filter(
    (metricDimension) =>
      !globalDimensions.some(
        (dimension) => dimension.label === metricDimension.label
      )
  );

  const defaultValue = options.filter((options) =>
    defaultGroupBy.includes(options.value)
  );

  return {
    options,
    defaultValue,
    isLoading: false,
  };
};

/**
 *
 * @param metricDefinition List of metric definitions, each containing a metric name and its associated dimensions.
 * @returns transform dimension object with metric as key and dimensions as value
 */
export const getMetricDimensions = (
  metricDefinition: MetricDefinition[]
): MetricDimension => {
  return metricDefinition.reduce((acc, { metric, dimensions }) => {
    return {
      ...acc,
      [metric]: dimensions,
    };
  }, {});
};

/**
 *
 * @param metricDimensions An object where keys are metric names and values are arrays of dimensions associated with those metrics.
 * @returns list of common dimensions across all metrics
 */
export const getCommonDimensions = (
  metricDimensions: MetricDimension
): GroupByOption[] => {
  const metrics = Object.keys(metricDimensions);
  if (metrics.length === 0) {
    return [];
  }

  // Get dimensions from first metric
  const firstMetricDimensions = metricDimensions[metrics[0]];

  // Find dimensions that exist in all metrics
  return firstMetricDimensions
    .filter(({ dimension_label: queried }) => {
      return metrics.every((metric) => {
        return metricDimensions[metric].some(
          ({ dimension_label }) => dimension_label === queried
        );
      });
    })
    .map(({ label, dimension_label }) => {
      return {
        label,
        value: dimension_label,
      };
    });
};
