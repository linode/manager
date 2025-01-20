import type { CloudPulseResources } from '../../shared/CloudPulseResourcesSelect';
import type { AlertInstance } from '../AlertsResources/DisplayAlertResources';
import type { Region } from '@linode/api-v4';

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
   * Property to integrate in edit the resources associated with resources
   */
  isAdditionOrDeletionNeeded?: boolean;
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

  /**
   * Property to filter out only selected resources
   */
  selectedOnly?: boolean;

  /*
   * This property helps to track the list of selected resources
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
 * @param filterProps
 * @returns
 */
export const getFilteredResources = (
  filterProps: FilterResourceProps
): AlertInstance[] | undefined => {
  const {
    data,
    filteredRegions,
    isAdditionOrDeletionNeeded,
    regionsIdToLabelMap,
    resourceIds,
    searchText,
    selectedOnly,
    selectedResources,
  } = filterProps;
  return data
    ?.filter(
      (resource) =>
        isAdditionOrDeletionNeeded || resourceIds.includes(String(resource.id)) // if it is an edit page, selections will be true, no need to filter out resources not associated with alert
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
        checked: selectedResources
          ? selectedResources.includes(Number(resource.id))
          : false, // check for selections and drive the resources
        region: resource.region
          ? regionsIdToLabelMap.get(resource.region)
            ? regionsIdToLabelMap.get(resource.region)?.label +
              ` (${resource.region})`
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
    })
    .filter((resource) => (selectedOnly ? resource.checked : true));
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
