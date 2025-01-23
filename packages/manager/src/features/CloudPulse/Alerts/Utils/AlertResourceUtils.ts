import type { CloudPulseResources } from '../../shared/CloudPulseResourcesSelect';
import type { AlertInstance } from '../AlertsResources/DisplayAlertResources';
import type { Region } from '@linode/api-v4';

interface FilterResourceProps {
  /**
   * The data to be filtered
   */
  data?: CloudPulseResources[];
  /**
   * The selected regions on which the data needs to be filtered and it is in format US, Newark, NJ (us-east)
   */
  filteredRegions?: string[];
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
  const { data, regionsIdToRegionMap, resourceIds } = filterProps;
  if (!data || !resourceIds.length || !regionsIdToRegionMap.size) {
    return [];
  }
  const uniqueRegions = new Set<Region>();
  data.forEach(({ id, region }) => {
    if (resourceIds.includes(String(id))) {
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
 * @param filterProps Props required to filter the resources on the table
 * @returns Filtered instances to be displayed on the table
 */
export const getFilteredResources = (
  filterProps: FilterResourceProps
): AlertInstance[] => {
  const {
    data,
    filteredRegions,
    regionsIdToRegionMap,
    resourceIds,
    searchText,
  } = filterProps;
  if (!data || resourceIds.length === 0) {
    return [];
  }
  return data // here we always use the base data from API for filtering as source of truth
    .filter((resource) => resourceIds.includes(String(resource.id)))
    .map((resource) => {
      return {
        ...resource,
        region: resource.region // here replace region id with region label for regionsIdToLabelMap, formatted to Chicago, US(us-west) compatible to display in table
          ? regionsIdToRegionMap.get(resource.region)
            ? `${regionsIdToRegionMap.get(resource.region)?.label} (${
                regionsIdToRegionMap.get(resource.region)?.id
              })`
            : resource.region
          : '',
      };
    })
    .filter((resource) => {
      const matchesSearchText =
        !searchText ||
        resource.region
          .toLocaleLowerCase()
          .includes(searchText.toLocaleLowerCase()) ||
        resource.label
          .toLocaleLowerCase()
          .includes(searchText.toLocaleLowerCase()); // check with search text

      const matchesFilteredRegions =
        !filteredRegions?.length ||
        (resource.region.length && filteredRegions.includes(resource.region)); // check with filtered region

      return matchesSearchText && matchesFilteredRegions; // match the search text and match the region selected
    });
};

/**
 * This methods scrolls to the given HTML Element
 * @param scrollToElement The HTML Element to which we need to scroll
 */
export const scrollToElement = (scrollToElement: HTMLDivElement | null) => {
  if (!scrollToElement) {
    return;
  }
  scrollToElement.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'nearest',
  });
};
