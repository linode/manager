import {
  NODE_TYPE,
  REGION,
  RELATIVE_TIME_DURATION,
  RESOURCE_ID,
  RESOURCES,
  TAGS,
} from './constants';
import { FILTER_CONFIG } from './FilterConfig';
import { CloudPulseAvailableViews, CloudPulseSelectTypes } from './models';

import type {
  CloudPulseMetricsFilter,
  FilterValueType,
} from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseCustomSelectProps } from '../shared/CloudPulseCustomSelect';
import type { CloudPulseNodeTypeFilterProps } from '../shared/CloudPulseNodeTypeFilter';
import type { CloudPulseRegionSelectProps } from '../shared/CloudPulseRegionSelect';
import type {
  CloudPulseResources,
  CloudPulseResourcesSelectProps,
} from '../shared/CloudPulseResourcesSelect';
import type {
  CloudPulseTags,
  CloudPulseTagsSelectProps,
} from '../shared/CloudPulseTagsFilter';
import type { CloudPulseTextFilterProps } from '../shared/CloudPulseTextFilter';
import type { CloudPulseTimeRangeSelectProps } from '../shared/CloudPulseTimeRangeSelect';
import type { CloudPulseMetricsAdditionalFilters } from '../Widget/CloudPulseWidget';
import type { CloudPulseServiceTypeFilters } from './models';
import type {
  AclpConfig,
  Dashboard,
  DateTimeWithPreset,
  Filters,
  TimeDuration,
} from '@linode/api-v4';

interface CloudPulseFilterProperties {
  config: CloudPulseServiceTypeFilters;
  dashboard: Dashboard;
  dependentFilters?: CloudPulseMetricsFilter;
  isServiceAnalyticsIntegration: boolean;
  preferences?: AclpConfig;
  resource_ids?: number[] | undefined;
  shouldDisable?: boolean;
}

interface CloudPulseMandatoryFilterCheckProps {
  dashboard: Dashboard;
  filterValue: CloudPulseMetricsFilter;
  timeDuration: DateTimeWithPreset | undefined;
}

/**
 * This function helps in building the properties needed for tags selection component
 *
 * @param config - accepts a CloudPulseServiceTypeFilters of tag key
 * @param handleTagsChange - the callback when we select new tag
 * @param dashboard - the selected dashboard's service type
 * @param dependentFilters - tags are dependent on region filter, we need this for disabling the tags selection component
 * @param isServiceAnalyticsIntegration - only if this is false, we need to save preferences , else no need
 * @returns CloudPulseTagSelectProps
 */
export const getTagsProperties = (
  props: CloudPulseFilterProperties,
  handleTagsChange: (tags: CloudPulseTags[], savePref?: boolean) => void
): CloudPulseTagsSelectProps => {
  const { filterKey, name: label, placeholder } = props.config.configuration;
  const {
    dashboard,
    dependentFilters,
    isServiceAnalyticsIntegration,
    preferences,
  } = props;
  return {
    defaultValue: preferences?.[TAGS],
    disabled: shouldDisableFilterByFilterKey(
      filterKey,
      dependentFilters ?? {},
      dashboard,
      preferences
    ),
    handleTagsChange,
    label,
    optional: props.config.configuration.isOptional,
    placeholder,
    region: dependentFilters?.[REGION],
    resourceType: dashboard.service_type,
    savePreferences: !isServiceAnalyticsIntegration,
  };
};

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
  handleRegionChange: (
    filterKey: string,
    region: string | undefined,
    labels: string[],
    savePref?: boolean
  ) => void
): CloudPulseRegionSelectProps => {
  const { name: label, placeholder, filterKey } = props.config.configuration;
  const {
    dashboard,
    isServiceAnalyticsIntegration,
    preferences,
    dependentFilters,
    config,
    shouldDisable,
  } = props;
  return {
    defaultValue: preferences?.[filterKey],
    handleRegionChange,
    filterKey,
    label,
    placeholder,
    savePreferences: !isServiceAnalyticsIntegration,
    selectedDashboard: dashboard,
    disabled:
      shouldDisable ||
      shouldDisableFilterByFilterKey(
        filterKey,
        dependentFilters ?? {},
        dashboard
      ),
    xFilter: filterBasedOnConfig(config, dependentFilters ?? {}),
    selectedEntities: (dependentFilters?.[RESOURCE_ID] ?? []) as string[],
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
  handleResourceChange: (
    resourceId: CloudPulseResources[],
    savePref?: boolean
  ) => void
): CloudPulseResourcesSelectProps => {
  const { filterKey, name: label, placeholder } = props.config.configuration;
  const {
    config,
    dashboard,
    dependentFilters,
    isServiceAnalyticsIntegration,
    preferences,
    shouldDisable,
  } = props;
  return {
    defaultValue: preferences?.[RESOURCES],
    disabled:
      shouldDisable ||
      shouldDisableFilterByFilterKey(
        filterKey,
        dependentFilters ?? {},
        dashboard,
        preferences
      ),
    handleResourcesSelection: handleResourceChange,
    label,
    placeholder,
    resourceType: dashboard.service_type,
    savePreferences: !isServiceAnalyticsIntegration,
    xFilter: filterBasedOnConfig(config, dependentFilters ?? {}),
  };
};

export const getNodeTypeProperties = (
  props: CloudPulseFilterProperties,
  handleNodeTypeChange: (
    nodeType: string | undefined,
    label: string[],
    savePref?: boolean
  ) => void
): CloudPulseNodeTypeFilterProps => {
  const { filterKey, name: label, placeholder } = props.config.configuration;
  const {
    dashboard,
    dependentFilters,
    isServiceAnalyticsIntegration,
    preferences,
    resource_ids,
    shouldDisable,
  } = props;
  return {
    database_ids: resource_ids,
    defaultValue: preferences?.[NODE_TYPE],
    disabled:
      shouldDisable ||
      shouldDisableFilterByFilterKey(
        filterKey,
        dependentFilters ?? {},
        dashboard
      ),
    handleNodeTypeChange,
    label,
    placeholder,
    savePreferences: !isServiceAnalyticsIntegration,
  };
};

/**
 * @param props The cloudpulse filter properties selected so far
 * @param handleCustomSelectChange The callback function when a filter change happens
 * @returns {CloudPulseCustomSelectProps} Returns a property compatible for CloudPulseCustomSelect Component
 */
export const getCustomSelectProperties = (
  props: CloudPulseFilterProperties,
  handleCustomSelectChange: (
    filterKey: string,
    value: FilterValueType,
    labels: string[],
    savePref?: boolean,
    updatedPreferenceData?: {}
  ) => void
): CloudPulseCustomSelectProps => {
  const {
    apiIdField,
    apiLabelField,
    apiV4QueryKey,
    filterKey,
    filterType,
    isMultiSelect,
    maxSelections,
    name: label,
    options,
    placeholder,
    isOptional,
  } = props.config.configuration;
  const {
    dashboard,
    dependentFilters,
    isServiceAnalyticsIntegration,
    preferences,
    shouldDisable,
  } = props;
  return {
    apiResponseIdField: apiIdField,
    apiResponseLabelField: apiLabelField,
    apiV4QueryKey,
    clearDependentSelections: getDependentFiltersByFilterKey(
      filterKey,
      dashboard
    ),
    defaultValue: preferences?.[filterKey],
    disabled:
      shouldDisable ||
      shouldDisableFilterByFilterKey(
        filterKey,
        dependentFilters ?? {},
        dashboard
      ),
    filterKey,
    filterType,
    isOptional,
    handleSelectionChange: handleCustomSelectChange,
    isMultiSelect,
    label,
    maxSelections,
    options,
    placeholder,
    preferences,
    savePreferences: !isServiceAnalyticsIntegration,
    type: options
      ? CloudPulseSelectTypes.static
      : CloudPulseSelectTypes.dynamic,
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
  handleTimeRangeChange: (
    timeDuration: TimeDuration,
    timeDurationValue?: string,
    savePref?: boolean
  ) => void
): CloudPulseTimeRangeSelectProps => {
  const { name: label, placeholder } = props.config.configuration;
  const { isServiceAnalyticsIntegration, preferences } = props;

  const timeDuration = preferences?.timeDuration;
  return {
    defaultValue: timeDuration,
    handleStatsChange: handleTimeRangeChange,
    label,
    placeholder,
    savePreferences: !isServiceAnalyticsIntegration,
  };
};

/**
 * This function helps in building the properties needed for port or interface_id selection component
 *
 * @param config - accepts a CloudPulseServiceTypeFilters that has config of port or interface_id key
 * @param handleTextFilterChange - the callback when we select new value
 * @param dashboard - the actual selected dashboard
 * @param isServiceAnalyticsIntegration - only if this is false, we need to save preferences, else no need
 * @returns CloudPulseTextFilterProps
 */
export const getTextFilterProperties = (
  props: CloudPulseFilterProperties,
  handleTextFilterChange: (
    port: string,
    label: string[],
    filterKey: string,
    savePref?: boolean
  ) => void
): CloudPulseTextFilterProps => {
  const { name: label, placeholder, isOptional } = props.config.configuration;
  const {
    dashboard,
    isServiceAnalyticsIntegration,
    preferences,
    dependentFilters,
    shouldDisable,
  } = props;

  return {
    disabled:
      shouldDisable ||
      shouldDisableFilterByFilterKey(
        props.config.configuration.filterKey,
        dependentFilters ?? {},
        dashboard
      ),
    defaultValue: preferences?.[props.config.configuration.filterKey],
    handleTextFilterChange,
    label,
    placeholder,
    optional: isOptional,
    savePreferences: !isServiceAnalyticsIntegration,
    filterKey: props.config.configuration.filterKey,
  };
};

/**
 * This function helps in builder the xFilter needed to passed in a apiV4 call
 *
 * @param config - any cloudpulse service type filter config
 * @param dependentFilters - the filters that are selected so far
 * @returns - filtered dependencies based on the provided config
 */
export const filterBasedOnConfig = (
  config: CloudPulseServiceTypeFilters | undefined,
  dependentFilters: CloudPulseMetricsFilter
): CloudPulseMetricsFilter => {
  if (!config) {
    return {};
  }

  const { dependency } = config.configuration;
  const filtered: CloudPulseMetricsFilter = {};
  if (dependency) {
    dependency.forEach((key) => {
      const value = dependentFilters[key];
      if (value !== undefined) {
        filtered[key === 'engine' ? 'engineType' : key] = value;
      }
    });
    return filtered;
  }

  return {};
};

/**
 * This function checks whether we need to disable or enable a filter component based on filterKey and filters selected so far
 *
 * @param filterKey - the filterKey for which we need to check whether to disable or enable the filter component
 * @param dependentFilters - the filters selected so far
 * @param dashboard - the actual selected dashboard
 * @returns boolean | undefined
 */
export const shouldDisableFilterByFilterKey = (
  filterKey: string,
  dependentFilters: {
    [key: string]: FilterValueType | TimeDuration;
  },
  dashboard: Dashboard,
  preferences?: AclpConfig
): boolean | undefined => {
  if (dashboard?.service_type) {
    const serviceTypeConfig = FILTER_CONFIG.get(dashboard.id);
    const filters = serviceTypeConfig?.filters ?? [];

    const filter = filters.find(
      (filter) =>
        filter?.configuration.filterKey === filterKey &&
        filter.configuration.dependency
    );

    const optionalFilters = new Set(
      filters
        .filter((filter) => filter.configuration.isOptional)
        .map((filter) => filter.configuration.filterKey)
    );

    if (filter) {
      return filter.configuration.dependency?.some((dependent) => {
        const dependentFilter = dependentFilters[dependent];

        if (
          preferences &&
          preferences[dependent] &&
          (!dependentFilter ||
            (Array.isArray(dependentFilter) && dependentFilter.length === 0))
        ) {
          return true; // Since filters are set one by one, disabled will be true until the values that are defined inside the preferences are populated in the dependent filters as well
        }

        return (
          !optionalFilters.has(dependent) &&
          (!dependentFilter ||
            (Array.isArray(dependentFilter) && dependentFilter.length === 0))
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
  const serviceTypeConfig = FILTER_CONFIG?.get(dashboard.id);

  if (!serviceTypeConfig) {
    return false;
  }

  return serviceTypeConfig.filters.every((filter) => {
    if (filter.configuration.isOptional) {
      return true;
    }

    const filterKey = filter.configuration.filterKey;

    if (filterKey === RELATIVE_TIME_DURATION) {
      return Boolean(timeDuration);
    }

    const value = filterValue[filterKey];
    return value !== undefined && (!Array.isArray(value) || value.length > 0);
  });
};

/**
 * @param selectedFilters The selected filters from the global filters view from custom select component
 * @param dashboardId The ID of the dashboard
 * @returns Constructs and returns the metrics call filters based on selected filters and service type
 */
export const getMetricsCallCustomFilters = (
  selectedFilters: CloudPulseMetricsFilter,
  dashboardId?: number
): CloudPulseMetricsAdditionalFilters[] => {
  const serviceTypeConfig = dashboardId
    ? FILTER_CONFIG.get(dashboardId)
    : undefined;

  // If configuration exists, filter and map it to the desired CloudPulseMetricsAdditionalFilters format
  return (
    serviceTypeConfig?.filters
      .filter(
        ({ configuration }) =>
          configuration.isFilterable &&
          !configuration.isMetricsFilter &&
          selectedFilters[configuration.filterKey]
      )
      .map(({ configuration }) => ({
        filterKey: configuration.filterKey,
        filterValue: selectedFilters[configuration.filterKey],
      })) ?? []
  );
};

/**
 * @param additionalFilters The additional filters selected from custom select components
 * @returns The list of filters for the metric API call, based the additional custom select components
 */
export const constructAdditionalRequestFilters = (
  additionalFilters: CloudPulseMetricsAdditionalFilters[]
): Filters[] => {
  const filters: Filters[] = [];
  for (const filter of additionalFilters) {
    if (
      filter &&
      (!Array.isArray(filter.filterValue) || filter.filterValue.length > 0) // Check for empty array
    ) {
      // push to the filters
      filters.push({
        dimension_label: filter.filterKey,
        operator: Array.isArray(filter.filterValue) ? 'in' : 'eq',
        value: Array.isArray(filter.filterValue)
          ? filter.filterValue.join(',')
          : String(filter.filterValue),
      });
    }
  }
  return filters;
};

/**
 *
 * @param filterKey The filterKey of the actual filter
 * @param dashboard The selected dashboard from the global filter view
 * @returns The filterKeys that needs to be removed from the preferences
 */
const getDependentFiltersByFilterKey = (
  filterKey: string,
  dashboard: Dashboard
): string[] => {
  const serviceTypeConfig = FILTER_CONFIG.get(dashboard.id);

  if (!serviceTypeConfig) {
    return [];
  }

  return serviceTypeConfig.filters
    .filter((filter) => filter?.configuration?.dependency?.includes(filterKey))
    .map(({ configuration }) =>
      configuration.filterKey === RESOURCE_ID
        ? RESOURCES
        : configuration.filterKey
    );
};

/**
 * @param obj1 The first object to be compared
 * @param obj2 The second object to be compared
 * @returns True if, both are equal else false
 */
export const deepEqual = <T>(obj1: T, obj2: T): boolean => {
  if (obj1 === obj2) {
    return true; // Identical references or values
  }

  // If either is null or undefined, or they are not of object type, return false
  if (
    obj1 === null ||
    obj2 === null ||
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object'
  ) {
    return false;
  }

  // Handle array comparison separately
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    return compareArrays(obj1, obj2);
  }

  // Ensure both objects have the same number of keys
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  // Recursively check each key
  for (const key of keys1) {
    if (!(key in obj2)) {
      return false;
    }
    // Recursive deep equal check
    if (!deepEqual((obj1 as any)[key], (obj2 as any)[key])) {
      return false;
    }
  }

  return true;
};

/**
 * @param arr1 Array for comparison
 * @param arr2 Array for comparison
 * @returns True if, both the arrays are equal, else false
 */
export const compareArrays = <T>(arr1: T[], arr2: T[]): boolean => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (!deepEqual(arr1[i], arr2[i])) {
      return false;
    }
  }

  return true;
};

/**
 *
 * @param dashboard dashboard for which filters to render
 * @param isServiceAnalyticsIntegration boolean value to check if implementation is service analytics integration or not
 * @returns list of CloudPulseServiceTypeFilters filtered by passed parameters
 */
export const getFilters = (
  dashboard: Dashboard,
  isServiceAnalyticsIntegration: boolean
): CloudPulseServiceTypeFilters[] | undefined => {
  return FILTER_CONFIG.get(dashboard.id)?.filters.filter((config) =>
    isServiceAnalyticsIntegration
      ? config.configuration.neededInViews.includes(
          CloudPulseAvailableViews.service
        )
      : config.configuration.neededInViews.includes(
          CloudPulseAvailableViews.central
        )
  );
};

/**
 * @param data The resources for which the filter needs to be applied
 * @param dependentFilters The selected dependent filters that will be used to filter the resources
 * @returns The filtered resources
 */
export const filterUsingDependentFilters = (
  data?: CloudPulseResources[],
  dependentFilters?: CloudPulseMetricsFilter
): CloudPulseResources[] | undefined => {
  if (!dependentFilters || !data) {
    return data;
  }

  return data.filter((resource) => {
    return Object.entries(dependentFilters).every(([key, filterValue]) => {
      const resourceValue = resource[key as keyof CloudPulseResources];

      if (Array.isArray(resourceValue) && Array.isArray(filterValue)) {
        return filterValue.some((val) => resourceValue.includes(String(val)));
      } else if (Array.isArray(resourceValue)) {
        return resourceValue.includes(String(filterValue));
      } else {
        return resourceValue === filterValue;
      }
    });
  });
};
