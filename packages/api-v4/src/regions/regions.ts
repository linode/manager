import { API_ROOT, BETA_API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';
import { Filter, Params, ResourcePage as Page } from '../types';
import { Region, RegionAvailability } from './types';

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
 * @TODO LKE-E: Remove useBetaEndpoint after LKE-5868 is done as it will no longer be needed.
 */
export const getRegions = (params?: Params, useBetaEndpoint?: boolean) =>
  Request<Page<Region>>(
    setURL(`${useBetaEndpoint ? BETA_API_ROOT : API_ROOT}/regions`),
    setMethod('GET'),
    setParams(params)
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
    setURL(`${API_ROOT}/regions/${encodeURIComponent(regionId)}`),
    setMethod('GET')
  );

export { Region };

/**
 * getRegionAvailabilities
 *
 * Returns the availability status for all Linode plans for all regions.
 */
export const getRegionAvailabilities = (params?: Params, filter?: Filter) =>
  Request<Page<RegionAvailability>>(
    setURL(`${API_ROOT}/regions/availability`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
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
    setURL(`${API_ROOT}/regions/${encodeURIComponent(regionId)}/availability`),
    setMethod('GET')
  );
