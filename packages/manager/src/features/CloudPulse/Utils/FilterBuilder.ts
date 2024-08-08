import { RELATIVE_TIME_DURATION } from './constants';
import { FILTER_CONFIG } from './FilterConfig';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseRegionSelectProps } from '../shared/CloudPulseRegionSelect';
import type {
  CloudPulseResources,
  CloudPulseResourcesSelectProps,
} from '../shared/CloudPulseResourcesSelect';
import type { CloudPulseTimeRangeSelectProps } from '../shared/CloudPulseTimeRangeSelect';
import type { CloudPulseServiceTypeFilters } from './models';
import type { Dashboard, Filter, TimeDuration } from '@linode/api-v4';

interface CloudPulseFilterProperties {
  config: CloudPulseServiceTypeFilters;
  dashboard: Dashboard;
  dependentFilters?: {
    [key: string]: FilterValueType;
  };
  isServiceAnalyticsIntegration: boolean;
}

interface CloudPulseMandatoryFilterCheckProps {
  dashboard: Dashboard;
  filterValue: {
    [key: string]: FilterValueType;
  };
  timeDuration: TimeDuration | undefined;
}

/**
 * This function helps in building the properties needed for region selection component
 *
 * @param config - accepts a CloudPulseServiceTypeFilters of region key
 * @param handleRegionChange - the callback when we select new region
 * @param dashboard - the actual selected dashboard
 * @param isServiceAnalyticsIntegration - only if this is false, we need to save preferences , else no need
 * @returns CloudPulseRegionSelectProps
 */
export const getRegionProperties = (
  props: CloudPulseFilterProperties,
  handleRegionChange: (region: string | undefined) => void
): CloudPulseRegionSelectProps => {
  const { placeholder } = props.config.configuration;
  const { dashboard, isServiceAnalyticsIntegration } = props;
  return {
    handleRegionChange,
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
 * @returns CloudPulseResourcesSelectProps
 */
export const getResourcesProperties = (
  props: CloudPulseFilterProperties,
  handleResourceChange: (resourceId: CloudPulseResources[]) => void
): CloudPulseResourcesSelectProps => {
  const { filterKey, placeholder } = props.config.configuration;
  const {
    config,
    dashboard,
    dependentFilters,
    isServiceAnalyticsIntegration,
  } = props;
  return {
    disabled: checkIfWeNeedToDisableFilterByFilterKey(
      filterKey,
      dependentFilters ?? {},
      dashboard
    ),
    handleResourcesSelection: handleResourceChange,
    placeholder,
    resourceType: dashboard.service_type,
    savePreferences: !isServiceAnalyticsIntegration,
    xFilter: buildXFilter(config, dependentFilters ?? {}),
  };
};

/**
 * This function helps in building the properties needed for time duration filter
 *
 * @param config - accepts a CloudPulseServiceTypeFilters of time duration key
 * @param handleTimeRangeChange - callback whenever a time duration selection changes
 * @param isServiceAnalyticsIntegration - only if this is false, we need to save preferences , else no need
 * @returns CloudPulseTimeRangeSelectProps
 */
export const getTimeDurationProperties = (
  props: CloudPulseFilterProperties,
  handleTimeRangeChange: (timeDuration: TimeDuration) => void
): CloudPulseTimeRangeSelectProps => {
  const { placeholder } = props.config.configuration;
  const { isServiceAnalyticsIntegration } = props;
  return {
    handleStatsChange: handleTimeRangeChange,
    placeholder,
    savePreferences: !isServiceAnalyticsIntegration,
  };
};

/**
 * This function helps in builder the xFilter needed to passed in a apiV4 call
 *
 * @param config - any cloudpulse service type filter config
 * @param dependentFilters - the filters that are selected so far
 * @returns - a xFilter type of apiV4
 */
export const buildXFilter = (
  config: CloudPulseServiceTypeFilters,
  dependentFilters: {
    [key: string]: FilterValueType | TimeDuration;
  }
): Filter => {
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
 * @returns boolean | undefined
 */
export const checkIfWeNeedToDisableFilterByFilterKey = (
  filterKey: string,
  dependentFilters: {
    [key: string]: FilterValueType | TimeDuration;
  },
  dashboard: Dashboard
): boolean | undefined => {
  if (dashboard?.service_type) {
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

/**
 *
 * @param dashboard - The actual selected dashboard
 * @param filterValue - The filter value selected from various filter components
 * @param timeDuration - The time duration selected
 * @returns boolean if all the mandatory filters listed in the service config are selected else false
 */
export const checkIfAllMandatoryFiltersAreSelected = (
  mandatoryFilterObj: CloudPulseMandatoryFilterCheckProps
): boolean => {
  const { dashboard, filterValue, timeDuration } = mandatoryFilterObj;
  const serviceTypeConfig = FILTER_CONFIG?.get(dashboard.service_type);

  if (!serviceTypeConfig) {
    return false;
  }

  return serviceTypeConfig.filters.every((filter) => {
    const filterKey = filter.configuration.filterKey;

    if (filterKey === RELATIVE_TIME_DURATION) {
      return Boolean(timeDuration);
    }

    const value = filterValue[filterKey];
    return value !== undefined && (!Array.isArray(value) || value.length > 0);
  });
};
