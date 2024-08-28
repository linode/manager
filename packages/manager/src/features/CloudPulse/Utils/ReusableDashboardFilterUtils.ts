import { FILTER_CONFIG } from './FilterConfig';

import type { DashboardProperties } from '../Dashboard/CloudPulseDashboard';
import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseMetricsAdditionalFilters } from '../Widget/CloudPulseWidget';
import type { Dashboard, TimeDuration } from '@linode/api-v4';

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
  filterValue: { [key: string]: FilterValueType };
  /**
   * The selected resource id
   */
  resource: number;
  /**
   * The selected time duration
   */
  timeDuration?: TimeDuration;
}

/**
 * @param props The props required for constructing the dashboard properties
 * @returns The properties compatible for rendering dashboard component
 */
export const getDashboardProperties = (
  props: ReusableDashboardFilterUtilProps
): DashboardProperties => {
  const { dashboardObj, filterValue, resource, timeDuration } = props;
  const timeDurationObj: TimeDuration = {
    unit: 'min',
    value: 30,
  };
  return {
    additionalFilters: constructDimensionFilters({
      dashboardObj,
      filterValue,
      resource,
    }),
    dashboardId: dashboardObj.id,
    duration: timeDuration ?? timeDurationObj,
    resources: [String(resource)],
    savePref: false,
  };
};

/**
 * @param props The props required for constructing the dashboard properties
 * @returns True if all mandatory filters are selected for a given service type , else false
 */
export const checkMandatoryFiltersSelected = (
  props: ReusableDashboardFilterUtilProps
): boolean => {
  const { dashboardObj, filterValue, resource, timeDuration } = props;
  const serviceTypeConfig = FILTER_CONFIG.get(dashboardObj.service_type);
  if (!timeDuration || !resource) {
    return false;
  }

  if (!serviceTypeConfig) {
    return true;
  }

  return serviceTypeConfig
    ? serviceTypeConfig.filters.every(({ configuration }) => {
        const { filterKey, neededInServicePage } = configuration;

        // If the filter is not needed, skip it
        if (!neededInServicePage) {
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
      })
    : true;
};

/**
 * @param filterKey The current filterKey for which the check needs to made against the config
 * @param serviceType The serviceType of the selected dashboard
 * @returns True, if the filter is needed in the metrics call, else false
 */
export const checkIfFilterNeededInMetricsCall = (
  filterKey: string,
  serviceType: string
): boolean => {
  const serviceTypeConfig = FILTER_CONFIG.get(serviceType);

  if (!serviceTypeConfig) {
    return false;
  }

  return serviceTypeConfig.filters.some((filter) => {
    if (!filter) {
      return false;
    }

    const { configuration } = filter;
    const {
      filterKey: configFilterKey,
      isFilterable,
      neededInServicePage,
    } = configuration;

    return (
      configFilterKey === filterKey &&
      Boolean(isFilterable) &&
      neededInServicePage // Indicates if this filter should be included in the metrics call
    );
  });
};

/**
 * @param props The props required for constructing the dashboard properties
 * @returns Array of additional filters to be passed in the metrics api call
 */
export const constructDimensionFilters = (
  props: ReusableDashboardFilterUtilProps
): CloudPulseMetricsAdditionalFilters[] => {
  const { dashboardObj, filterValue } = props;
  return Object.keys(filterValue)
    .filter((key) =>
      checkIfFilterNeededInMetricsCall(key, dashboardObj.service_type)
    )
    .map((key) => ({
      filterKey: key,
      filterValue: filterValue[key],
    }));
};
