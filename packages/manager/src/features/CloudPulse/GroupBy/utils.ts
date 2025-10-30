import { useCloudPulseDashboardByIdQuery } from 'src/queries/cloudpulse/dashboards';
import { useGetCloudPulseMetricDefinitionsByServiceType } from 'src/queries/cloudpulse/services';

import type { GroupByOption } from './CloudPulseGroupByDrawer';
import type {
  CloudPulseServiceType,
  Dashboard,
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

/**
 *
 * @param dashboardId The ID of the dashboard being queried
 * @param serviceType The type of cloud service (e.g., 'linode', 'dbaas')
 * @returns A GroupByDimension object containing available options, default values, and loading state
 */
export const useGlobalDimensions = (
  dashboardId: number | undefined,
  serviceType: CloudPulseServiceType | undefined,
  preference?: string[]
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
  const metricDimensions = getMetricDimensions(
    metricDefinition?.data ?? [],
    dashboard
  );
  const commonDimensions = [
    defaultOption,
    ...getCommonDimensions(metricDimensions),
  ];

  const commonGroups = getCommonGroups(
    preference ? preference : (dashboard?.group_by ?? []),
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
  const commonGroups: GroupByOption[] = [];
  // To maintain the order of groupBy from dashboard config or preferences
  for (let index = 0; index < groupBy.length; index++) {
    const group = groupBy[index];
    const commonGroup = commonDimensions.find(
      (dimension) => dimension.value === group
    );
    if (commonGroup) {
      commonGroups.push(commonGroup);
    }
  }
  return commonGroups;
};

/**
 *
 * @param dashboardId The ID of the dashboard being queried
 * @param serviceType The type of cloud service (e.g., 'linode', 'dbaas')
 * @param globalDimensions - Common dimensions that are already selected at the dashboard level
 * @param metric - The specific metric for which to retrieve available dimensions
 * @returns A GroupByDimension object containing available options, default values, and loading state
 */
export const useWidgetDimension = (
  dashboardId: number | undefined,
  serviceType: CloudPulseServiceType | undefined,
  globalDimensions: GroupByOption[],
  metric: string | undefined,
  preference?: string[]
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

  const metricDimensions: GroupByOption[] =
    metricDefinition?.data
      .find((def) => def.metric === metric)
      ?.dimensions?.map(({ label, dimension_label }) => ({
        label,
        value: dimension_label,
      })) ?? [];
  const defaultGroupBy = preference
    ? preference
    : (dashboard?.widgets.find((widget) => widget.metric === metric)
        ?.group_by ?? []);

  const options = metricDimensions.filter(
    (metricDimension) =>
      !globalDimensions.some(
        (dimension) => dimension.label === metricDimension.label
      )
  );

  // To maintain the order of groupBy from dashboard config or preferences
  const defaultValue: GroupByOption[] = [];

  for (let index = 0; index < defaultGroupBy.length; index++) {
    const groupBy = defaultGroupBy[index];

    const defaultOption = options.find((option) => option.value === groupBy);
    if (defaultOption) {
      defaultValue.push(defaultOption);
    }
  }

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
  metricDefinition: MetricDefinition[],
  dashboard?: Dashboard
): MetricDimension => {
  if (!dashboard) {
    return {};
  }
  const dashboardMetrics =
    dashboard.widgets.map((widget) => widget.metric) ?? [];
  return metricDefinition
    .filter(({ metric }) => dashboardMetrics.includes(metric))
    .reduce((acc, { metric, dimensions }) => {
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

  // filter dimensions that exist in all metrics
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
