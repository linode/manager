import type { CloudPulseResources } from '../../shared/CloudPulseResourcesSelect';
import type { Region } from '@linode/api-v4';
import { AlertInstance } from '../AlertsResources/DisplayAlertResources';

interface FilterResourceProps {
  /**
   * The data to be filtered
   */
  data?: CloudPulseResources[];
  /**
   * The selected regions on which the data needs to be filtered
   */
  filteredRegions?: string[];
  /**
   * The map that holds the id of the region to Region object, helps in building the alert resources
   */
  regionsIdToLabelMap: Map<string, Region>;
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
 * @returns A map of region id to Region object
 */
export const getRegionsIdLabelMap = (
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
  const { data, regionsIdToLabelMap, resourceIds } = filterProps;
  return Array.from(
    new Set(
      data
        ?.filter((resource) => resourceIds.includes(String(resource.id)))
        ?.map((resource) => {
          const regionId = resource.region;
          return regionId ? regionsIdToLabelMap.get(regionId) : null;
        })
    )
  ).filter((region) => region !== null && region !== undefined); // filter out undefined and null regions
};

/**
 * @param filterProps Props required to filter the resources on the table
 * @returns Filtered instances to be displayed on the table
 */
export const getFilteredResources = (
  filterProps: FilterResourceProps
): AlertInstance[] | undefined => {
  const {
    data,
    filteredRegions,
    regionsIdToLabelMap,
    resourceIds,
    searchText,
  } = filterProps;
  return data
    ?.filter(
      (resource) => resourceIds.includes(String(resource.id)) // if we can edit like add or delete no need to filter on resources associated with alerts
    )
    .filter((resource) => {
      if (filteredRegions) {
        return filteredRegions.includes(resource.region ?? '');
      }
      return true;
    })
    .map((resource) => {
      return {
        ...resource,
        region: resource.region // here replace region id with region label for regionsIdToLabelMap, formatted to Chicago, US(us-west)
          ? regionsIdToLabelMap.get(resource.region)
            ? `${regionsIdToLabelMap.get(resource.region)?.label}
               (${resource.region})`
            : resource.region
          : resource.region,
      };
    })
    .filter((resource) => {
      if (searchText) {
        return (
          resource.region
            ?.toLocaleLowerCase()
            .includes(searchText.toLocaleLowerCase()) ||
          resource.label
            .toLocaleLowerCase()
            .includes(searchText.toLocaleLowerCase())
        );
      }
      return true;
    });
};
