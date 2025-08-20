import { useCloudPulseDashboardByIdQuery } from 'src/queries/cloudpulse/dashboards';
import { useGetCloudPulseMetricDefinitionsByServiceType } from 'src/queries/cloudpulse/services';

import type { GroupByOption } from './CloudPulseGroupByDrawer';
import type {
  CloudPulseServiceType,
  Dimension,
  MetricDefinition,
} from '@linode/api-v4';

const defaultOption: GroupByOption = {
  label: 'Entity Id',
  value: 'entity_id',
};

interface GroupByDimension {
  defaultValue: GroupByOption[];
  isLoading: boolean;
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
  const commonDimensions = getCommonDimensions(metricDimensions);

  const commonGroups = getCommonGroups(
    dashboard?.group_by ?? [],
    commonDimensions
  );
  return {
    options: [defaultOption, ...commonDimensions],
    defaultValue: [defaultOption, ...commonGroups],
    isLoading: false,
  };
};

const getCommonGroups = (
  groupBy: string[],
  commonDimensions: GroupByOption[]
): GroupByOption[] => {
  if (groupBy.length === 0 || commonDimensions.length === 0) return [];

  return commonDimensions.filter((group) => {
    return groupBy.includes(group.value);
  });
};

const getMetricDimensions = (
  metricDefinition: MetricDefinition[]
): MetricDimension => {
  return metricDefinition.reduce((acc, { metric, dimensions }) => {
    return {
      ...acc,
      [metric]: dimensions,
    };
  }, {});
};

const getCommonDimensions = (
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
