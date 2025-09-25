import { defaultTimeDuration } from './CloudPulseDateTimePickerUtils';
import { FILTER_CONFIG } from './FilterConfig';
import { CloudPulseAvailableViews } from './models';

import type { DashboardProperties } from '../Dashboard/CloudPulseDashboard';
import type { CloudPulseMetricsFilter } from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseMetricsAdditionalFilters } from '../Widget/CloudPulseWidget';
import type { Dashboard, DateTimeWithPreset } from '@linode/api-v4';

/**
 * This interface is used to get method parameters for this utility
 */
interface ReusableDashboardFilterUtilProps {
  /**
   * The selected dashboard object
   */
  dashboardObj: Dashboard;
  /**
   * The selected filter values
   */
  filterValue: CloudPulseMetricsFilter;
  /**
   * The selected grouping criteria
   */
  groupBy: string[];
  /**
   * The selected region
   */
  region?: string;
  /**
   * The selected resource id
   */
  resource: number;
  /**
   * The selected time duration
   */
  timeDuration?: DateTimeWithPreset;
}

/**
 * @param props The props required for constructing the dashboard properties
 * @returns The properties compatible for rendering dashboard component
 */
export const getDashboardProperties = (
  props: ReusableDashboardFilterUtilProps
): DashboardProperties => {
  const { dashboardObj, filterValue, resource, timeDuration, groupBy, region } =
    props;
  return {
    additionalFilters: constructDimensionFilters({
      dashboardObj,
      filterValue,
      resource,
      groupBy,
    }),
    dashboardId: dashboardObj.id,
    duration: timeDuration ?? defaultTimeDuration(),
    resources: [String(resource)],
    savePref: false,
    groupBy,
    region,
  };
};

/**
 * @param props The props required for checking the mandatory filter selection
 * @returns True if all mandatory filters are selected for a given service type , else false
 */
export const checkMandatoryFiltersSelected = (
  props: ReusableDashboardFilterUtilProps
): boolean => {
  const { dashboardObj, filterValue, resource, timeDuration, region } = props;
  const serviceTypeConfig = FILTER_CONFIG.get(dashboardObj.id);

  if (!serviceTypeConfig) {
    return true;
  }

  if (!timeDuration || !resource) {
    return false;
  }

  if (dashboardObj.id === 6 && !region) {
    return false;
  }

  return serviceTypeConfig.filters.every(({ configuration }) => {
    const { filterKey, neededInViews } = configuration;

    // If the filter is not needed or optional, skip it
    if (
      !neededInViews.includes(CloudPulseAvailableViews.service) ||
      configuration.isOptional
    ) {
      return true;
    }

    const filterValueForKey = filterValue[filterKey];

    // Check if the filter value is defined and has a valid selection
    return (
      filterValueForKey !== undefined &&
      (Array.isArray(filterValueForKey)
        ? Boolean(filterValueForKey.length)
        : true)
    );
  });
};

/**
 * @param filterKey The current filterKey for which the check needs to made against the config
 * @param dashboardId The ID of the dashboard
 * @returns True, if the filter is needed in the metrics call, else false
 */
export const checkIfFilterNeededInMetricsCall = (
  filterKey: string,
  dashboardId: number
): boolean => {
  const serviceTypeConfig = FILTER_CONFIG.get(dashboardId);

  if (!serviceTypeConfig) {
    return false;
  }

  return serviceTypeConfig.filters.some(({ configuration }) => {
    const {
      filterKey: configFilterKey,
      isFilterable,
      isMetricsFilter,
      neededInViews,
    } = configuration;

    return (
      // Indicates if this filter should be included in the metrics call
      configFilterKey === filterKey &&
      Boolean(isFilterable) &&
      !isMetricsFilter &&
      neededInViews.includes(CloudPulseAvailableViews.service)
    );
  });
};

/**
 * @param props The props required for building the dimension filters
 * @returns Array of additional filters to be passed in the metrics api call
 */
export const constructDimensionFilters = (
  props: ReusableDashboardFilterUtilProps
): CloudPulseMetricsAdditionalFilters[] => {
  const { dashboardObj, filterValue } = props;
  return Object.keys(filterValue)
    .filter((key) => checkIfFilterNeededInMetricsCall(key, dashboardObj.id))
    .map((key) => ({
      filterKey: key,
      filterValue: filterValue[key],
    }));
};

/**
 * @param dashboard The dashboard that needs to be rendered
 * @returns True if some filter is needed in service provider page, else false
 */
export const checkIfFilterBuilderNeeded = (dashboard?: Dashboard): boolean => {
  if (!dashboard) {
    return false;
  }

  const serviceTypeConfig = FILTER_CONFIG.get(dashboard.id);

  if (!serviceTypeConfig) {
    return false;
  }

  return serviceTypeConfig.filters.some(({ configuration }) =>
    configuration.neededInViews.includes(CloudPulseAvailableViews.service)
  );
};
