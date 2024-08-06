import { FILTER_CONFIG } from './FilterConfig';

import type { CloudPulseServiceTypeFilters } from './models';
import type { Dashboard, Filter, TimeDuration } from '@linode/api-v4';

/**
 * This function helps in building the properties needed for region selection component
 *
 * @param config - accepts a CloudPulseServiceTypeFilters of region key
 * @param handleRegionChange - the callback when we select new region
 * @param dashboard - the actual selected dashboard
 * @param isServiceAnalyticsIntegration - only if this is false, we need to save preferences , else no need
 */
export const getRegionProperties = (
  config: CloudPulseServiceTypeFilters,
  handleRegionChange: (region: string | undefined) => void,
  dashboard: Dashboard,
  isServiceAnalyticsIntegration: boolean
) => {
  const { filterKey, placeholder } = config.configuration;
  return {
    componentKey: filterKey,
    filterKey,
    handleRegionChange,
    key: filterKey,
    placeholder,
    savePreferences: !isServiceAnalyticsIntegration,
    selectedDashboard: dashboard,
  };
};

/**
 * This function helps in building the properties needed for resources selection component
 *
 * @param config - accepts a CloudPulseServiceTypeFilters of resource_id key
 * @param handleResourceChange - the callback when we select new resource
 * @param dashboard - the actual selected dashboard
 * @param isServiceAnalyticsIntegration - only if this is false, we need to save preferences , else no need
 * @param dependentFilters - since resources are dependent on some other filters, we need this as for disabling the resources selection component
 */
export const getResourcesProperties = (
  config: CloudPulseServiceTypeFilters,
  handleResourceChange: (resourceId: number[]) => void,
  dashboard: Dashboard,
  isServiceAnalyticsIntegration: boolean,
  dependentFilters: {
    [key: string]:
      | TimeDuration
      | number
      | number[]
      | string
      | string[]
      | undefined;
  }
) => {
  const { filterKey, placeholder } = config.configuration;
  return {
    componentKey: filterKey,
    disabled: checkIfWeNeedToDisableFilterByFilterKey(
      filterKey,
      dependentFilters,
      dashboard
    ),
    filterKey,
    handleResourcesSelection: handleResourceChange,
    key: filterKey,
    placeholder,
    resourceType: dashboard.service_type,
    savePreferences: !isServiceAnalyticsIntegration,
    xFilter: buildXFilter(config, dependentFilters),
  };
};

/**
 * This function helps in building the properties needed for time duration filter
 *
 * @param config - accepts a CloudPulseServiceTypeFilters of time duration key
 * @param handleTimeRangeChange - callback whenever a time duration selection changes
 * @param isServiceAnalyticsIntegration - only if this is false, we need to save preferences , else no need
 */
export const getTimeDurationProperties = (
  config: CloudPulseServiceTypeFilters,
  handleTimeRangeChange: (timeDuration: TimeDuration) => void,
  isServiceAnalyticsIntegration: boolean
) => {
  const { filterKey, placeholder } = config.configuration;
  return {
    componentKey: filterKey,
    filterKey,
    handleStatsChange: handleTimeRangeChange,
    key: filterKey,
    placeholder,
    savePreferences: !isServiceAnalyticsIntegration,
  };
};

/**
 * This function helps in builder the xFilter needed to passed in a apiV4 call
 *
 * @param config - any cloudpulse service type filter config
 * @param dependentFilters - the filters that are selected so far
 */
export const buildXFilter = (
  config: CloudPulseServiceTypeFilters,
  dependentFilters: {
    [key: string]:
      | TimeDuration
      | number
      | number[]
      | string
      | string[]
      | undefined;
  }
) => {
  const filters: Filter[] = [];

  const { dependency } = config.configuration;
  if (dependency) {
    dependency.forEach((key) => {
      const value = dependentFilters[key];
      if (value !== undefined) {
        if (Array.isArray(value)) {
          const orCondition = value.map((val) => ({ [key]: val }));
          filters.push({ '+or': orCondition });
        } else {
          filters.push({ [key]: value });
        }
      }
    });
  }

  return { '+and': filters };
};

/**
 * This function checks whether we need to disable or enable a filter component based on filterKey and filters selected so far
 *
 * @param filterKey - the filterKey for which we need to check whether to disable or enable the filter component
 * @param dependentFilters - the filters selected so far
 * @param dashboard - the actual selected dashboard
 */
export const checkIfWeNeedToDisableFilterByFilterKey = (
  filterKey: string,
  dependentFilters: {
    [key: string]:
      | TimeDuration
      | number
      | number[]
      | string
      | string[]
      | undefined;
  },
  dashboard: Dashboard
) => {
  if (dashboard && dashboard.service_type) {
    const serviceTypeConfig = FILTER_CONFIG.get(dashboard.service_type!);
    const filters = serviceTypeConfig?.filters ?? [];

    const filter = filters.find(
      (filter) =>
        filter?.configuration.filterKey === filterKey &&
        filter.configuration.dependency
    );

    if (filter) {
      return filter.configuration.dependency?.some((dependent) => {
        const dependentFilter = dependentFilters[dependent];
        return (
          !dependentFilter ||
          (Array.isArray(dependentFilter) && dependentFilter.length === 0)
        );
      });
    }
  }
  return false;
};
