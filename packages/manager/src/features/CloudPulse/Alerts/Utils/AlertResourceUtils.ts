import type { CloudPulseResources } from '../../shared/CloudPulseResourcesSelect';
import type { Region } from '@linode/api-v4';

interface FilterResourceProps {
  /*
   * The data to be filtered
   */
  data?: CloudPulseResources[];
  /*
   * The selected regions on which the data needs to be filtered
   */
  filteredRegions?: string[];
  /**
   * Property to integrate in edit the resources associated with resources
   */
  isAdditionOrDeletionNeeded?: boolean;
  /*
   * The map that holds the id of the region to Region object, helps in building the alert resources
   */
  regionsIdToLabelMap: Map<string, Region>;
  /*
   * The resources associated with the alerts
   */
  resourceIds: string[];

  /*
   * The search text with which the resources needed to be filtered
   */
  searchText?: string;

  /**
   * If it set to true,  only show selected resources
   */
  selectedOnly?: boolean;

  /*
   * This property helps to be track the list of selected resources
   */
  selectedResources?: number[];
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
  ).filter(
    (region): region is Region => region !== null && region !== undefined
  );
};
