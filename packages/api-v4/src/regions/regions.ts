import { BETA_API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';
import { Region } from './types';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type { RegionAvailability, RegionVPCAvailability } from './types';

/**
 * getRegions
 *
 * Return a list of available Regions (datacenters).
 * The response will be paginated, but the number of
 * available regions is small enough that multiple
 * pages are unlikely to be necessary.
 *
 * Filters are not included, as none of the fields
 * in a Region response object are filterable.
 *
 */
export const getRegions = (params?: Params) =>
  Request<Page<Region>>(
    setURL(`${BETA_API_ROOT}/regions`),
    setMethod('GET'),
    setParams(params),
  );

/**
 * getRegion
 *
 * Return detailed information about a particular region.
 *
 * @param regionId { string } The region to be retrieved.
 *
 */
export const getRegion = (regionId: string) =>
  Request<Region>(
    setURL(`${BETA_API_ROOT}/regions/${encodeURIComponent(regionId)}`),
    setMethod('GET'),
  );

export { Region };

/**
 * getRegionAvailabilities
 *
 * Returns the availability status for all Linode plans for all regions.
 */
export const getRegionAvailabilities = (params?: Params, filter?: Filter) =>
  Request<Page<RegionAvailability>>(
    setURL(`${BETA_API_ROOT}/regions/availability`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getRegionAvailability
 *
 * Return the availability status of Linode plans for the given region.
 *
 * @param regionId { string } The region to get the availabilities for
 */
export const getRegionAvailability = (regionId: string) =>
  Request<RegionAvailability[]>(
    setURL(
      `${BETA_API_ROOT}/regions/${encodeURIComponent(regionId)}/availability`,
    ),
    setMethod('GET'),
  );

/**
 * getRegionsVPCAvailabilities
 *
 * Returns the availability of VPC IPv6 prefix lengths for all regions.
 */
export const getRegionsVPCAvailabilities = (params?: Params, filter?: Filter) =>
  Request<Page<RegionVPCAvailability>>(
    setURL(`${BETA_API_ROOT}/regions/vpc-availability`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getRegionVPCAvailability
 *
 * Returns the availability of VPC IPv6 prefix lengths for a specified region.
 */
export const getRegionVPCAvailability = (regionId: string) =>
  Request<RegionVPCAvailability>(
    setURL(
      `${BETA_API_ROOT}/regions/${encodeURIComponent(regionId)}/vpc-availability`,
    ),
    setMethod('GET'),
  );
