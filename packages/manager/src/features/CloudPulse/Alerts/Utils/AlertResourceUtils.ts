import {
  alertAdditionalFilterKeyMap,
  applicableAdditionalFilterKeys,
} from '../AlertsResources/constants';

import type { CloudPulseResources } from '../../shared/CloudPulseResourcesSelect';
import type { AlertInstance } from '../AlertsResources/DisplayAlertResources';
import type {
  AlertAdditionalFilterKey,
  AlertFilterKey,
  AlertFilterType,
  AlertResourceFiltersProps,
} from '../AlertsResources/types';
import type { AlertServiceType, Region } from '@linode/api-v4';
import type { CloudPulseResourceTypeMapFlag } from 'src/featureFlags';

interface FilterResourceProps {
  /**
   * Additional filters for filtering the instances
   */
  additionalFilters?: Record<
    AlertAdditionalFilterKey,
    AlertFilterType | undefined
  >;
  /**
   * The data to be filtered
   */
  data?: CloudPulseResources[];
  /**
   * The selected regions on which the data needs to be filtered and it is in format US, Newark, NJ (us-east)
   */
  filteredRegions?: string[];
  /**
   * Property to integrate and edit the resources associated with alerts
   */
  isAdditionOrDeletionNeeded?: boolean;

  /**
   * The map that holds the id of the region to Region object, helps in building the alert resources
   */
  regionsIdToRegionMap: Map<string, Region>;

  /**
   * The resources associated with the alerts
   */
  resourceIds: string[];

  /**
   * The search text with which the resources needed to be filtered
   */
  searchText?: string;

  /**
   * Property to filter out only checked resources
   */
  selectedOnly?: boolean;

  /**
   * This property helps to track the list of selected resources
   */
  selectedResources?: string[];
}

interface FilterRendererProps {
  /**
   * The filter to which the props needs to built for
   */
  filterKey: AlertFilterKey;

  /**
   * Callback to publish the selected engine type
   */
  handleFilterChange: (
    engineType: string | undefined,
    type: AlertAdditionalFilterKey
  ) => void;
  /**
   * Callback for publishing the IDs of the selected regions.
   */
  handleFilteredRegionsChange: (regions: string[]) => void;

  /**
   * The regions to be displayed according to the resources associated with alerts
   */
  regionOptions: Region[];

  /**
   * The tags to be displayed according to the resources associated with alerts
   */
  tagOptions: string[];
}

/**
 * @param regions The list of regions
 * @returns A Map of region ID to Region object. Returns an empty Map if regions is undefined.
 */
export const getRegionsIdRegionMap = (
  regions: Region[] | undefined
): Map<string, Region> => {
  if (!regions) {
    return new Map();
  }
  return new Map(regions.map((region) => [region.id, region]));
};

/**
 * @param filterProps The props required to get the region options and the filtered resources
 * @returns Array of unique regions associated with the resource ids of the alert
 */
export const getRegionOptions = (
  filterProps: FilterResourceProps
): Region[] => {
  const {
    data,
    isAdditionOrDeletionNeeded,
    regionsIdToRegionMap,
    resourceIds,
  } = filterProps;
  const isEmpty =
    !data ||
    (!isAdditionOrDeletionNeeded && !resourceIds.length) ||
    !regionsIdToRegionMap.size;
  if (isEmpty) {
    return [];
  }
  const uniqueRegions = new Set<Region>();
  data.forEach(({ id, region }) => {
    if (isAdditionOrDeletionNeeded || resourceIds.includes(String(id))) {
      const regionObject = region
        ? regionsIdToRegionMap.get(region)
        : undefined;
      if (regionObject) {
        uniqueRegions.add(regionObject);
      }
    }
  });
  return Array.from(uniqueRegions);
};

/**
 * @param aclpResourceTypeMap The launch darkly flag where supported region ids are listed
 * @param serviceType The service type associated with the alerts
 * @returns Array of supported regions associated with the resource ids of the alert
 */
export const getSupportedRegionIds = (
  aclpResourceTypeMap: CloudPulseResourceTypeMapFlag[] | undefined,
  serviceType: AlertServiceType | undefined
): string[] | undefined => {
  const resourceTypeFlag = aclpResourceTypeMap?.find(
    (item: CloudPulseResourceTypeMapFlag) => item.serviceType === serviceType
  );

  if (
    resourceTypeFlag?.supportedRegionIds === null ||
    resourceTypeFlag?.supportedRegionIds === undefined
  ) {
    return undefined;
  }

  return resourceTypeFlag.supportedRegionIds
    .split(',')
    .map((regionId: string) => regionId.trim());
};

/**
 * @param filterProps Props required to filter the resources on the table
 * @returns Filtered instances to be displayed on the table
 */
export const getFilteredResources = (
  filterProps: FilterResourceProps
): AlertInstance[] => {
  const {
    additionalFilters,
    data,
    filteredRegions,
    isAdditionOrDeletionNeeded,
    regionsIdToRegionMap,
    resourceIds,
    searchText,
    selectedOnly,
    selectedResources,
  } = filterProps;
  if (!data || (!isAdditionOrDeletionNeeded && resourceIds.length === 0)) {
    return [];
  }
  return data // here we always use the base data from API for filtering as source of truth
    .filter(
      ({ id }) => isAdditionOrDeletionNeeded || resourceIds.includes(String(id))
    )
    .map((resource) => {
      const regionObj = resource.region
        ? regionsIdToRegionMap.get(resource.region)
        : undefined;
      return {
        ...resource,
        checked: selectedResources
          ? selectedResources.includes(resource.id)
          : false,
        region: resource.region // here replace region id, formatted to Chicago, US(us-west) compatible to display in table
          ? regionObj
            ? `${regionObj.label} (${regionObj.id})`
            : resource.region
          : '',
      };
    })
    .filter(({ checked, label, region }) => {
      const matchesSearchText =
        !searchText ||
        region.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) ||
        label.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()); // check with search text

      const matchesFilteredRegions =
        !filteredRegions?.length ||
        (region.length && filteredRegions.includes(region)); // check with filtered region

      return (
        // if selected only, show only checked, else everything
        matchesSearchText &&
        matchesFilteredRegions &&
        (!selectedOnly || checked)
      ); // match the search text and match the region selected
    })
    .filter((resource) => applyAdditionalFilter(resource, additionalFilters));
};

/**
 * Applies the additional filters on the instance that needs to be shown in the resources table
 * @param resource The instance for which the filters needs to be applied
 * @param additionalFilters The additional filters which are needed to be applied for the instances
 */
const applyAdditionalFilter = (
  resource: AlertInstance,
  additionalFilters?: Record<
    AlertAdditionalFilterKey,
    AlertFilterType | undefined
  >
): boolean => {
  if (!additionalFilters) {
    return true;
  }
  return applicableAdditionalFilterKeys.every((key) => {
    const value = additionalFilters[key];
    if (value === undefined) {
      return true;
    } // Skip if no filter value
    // Only apply filters that exist in `alertAdditionalFilterKeyMap`
    const mappedKey = alertAdditionalFilterKeyMap[key];
    const resourceValue = resource[mappedKey];

    if (Array.isArray(resourceValue) && Array.isArray(value)) {
      return value.some((obj) => resourceValue.includes(obj));
    }

    return resourceValue === value;
  });
};

/**
 * This methods scrolls to the given HTML Element
 * @param scrollToElement The HTML Element to which we need to scroll
 */
export const scrollToElement = (scrollToElement: HTMLDivElement | null) => {
  if (scrollToElement) {
    window.scrollTo({
      behavior: 'smooth',
      top: scrollToElement.getBoundingClientRect().top + window.scrollY - 40,
    });
  }
};

/**
 * @param data The list of alert instances displayed in the table.
 * @returns True if, all instances are selected else false.
 */
export const isAllPageSelected = (data: AlertInstance[]): boolean => {
  return Boolean(data?.length) && data.every(({ checked }) => checked);
};

/**
 * @param data The list of alert instances displayed in the table.
 * @returns True if, any one of instances is selected else false.
 */
export const isSomeSelected = (data: AlertInstance[]): boolean => {
  return Boolean(data?.length) && data.some(({ checked }) => checked);
};

/**
 * Checks if two sets of resource IDs contain the same elements, regardless of order.
 * @param originalResourceIds - The initial list of resource IDs.
 * @param selectedResourceIds - The updated list of resource IDs to compare.
 * @returns {boolean} - True if both sets contain the same elements, otherwise false.
 */
export const isResourcesEqual = (
  originalResourceIds: string[] | undefined,
  selectedResourceIds: string[]
): boolean => {
  if (!originalResourceIds) {
    return selectedResourceIds.length === 0;
  }

  if (originalResourceIds?.length !== selectedResourceIds.length) {
    return false;
  }

  const originalSet = new Set(originalResourceIds);
  return selectedResourceIds.every((id) => originalSet.has(id));
};

/**
 * Generates the appropriate filter props based on the provided filter key.
 *
 * This function returns the necessary props for rendering either an engine type filter
 * (`AlertsEngineOptionProps`) or a region filter (`AlertsRegionProps`), depending on the
 * `filterKey` value. It ensures that the correct handler and options are passed for
 * each filter type.
 *
 * @param {FilterRendererProps} props - The properties required to determine the filter behavior.
 * @param {AlertFilterKey} props.filterKey - The key identifying the filter type (`'engineType'` or `'region'`).
 * @param {(value: AlertFilterType, filterKey: AlertFilterKey) => void} props.handleFilterChange -
 *        Callback function for updating the selected engine type.
 * @param {(selectedRegions: string[]) => void} props.handleFilteredRegionsChange -
 *        Callback function for updating the selected regions.
 * @param {Region[]} props.regionOptions - The list of available regions for filtering.
 */
export const getAlertResourceFilterProps = ({
  filterKey,
  handleFilterChange,
  handleFilteredRegionsChange: handleSelectionChange,
  regionOptions,
  tagOptions,
}: FilterRendererProps): AlertResourceFiltersProps => {
  switch (filterKey) {
    case 'engineType':
      return { handleFilterChange };
    case 'region':
      return { handleSelectionChange, regionOptions };
    case 'tags':
      return { handleFilterChange, tagOptions };
    default:
      return { handleFilterChange };
  }
};
