import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL } from '../request';
import { Params, ResourcePage as Page } from '../types';
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
 */
export const getRegions = (params?: Params) =>
  Request<Page<Region>>(
    setURL(`${API_ROOT}/regions`),
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
 *
 *
 */
export const getRegionAvailabilities = (params?: Params) =>
  Request<Page<RegionAvailability>>(
    setURL(`${API_ROOT}/regions/availability`),
    setMethod('GET'),
    setParams(params)
  );

/**
 *
 *
 */
export const getRegionAvailability = (regionId: string) =>
  Request<RegionAvailability>(
    setURL(`${API_ROOT}/regions/${encodeURIComponent(regionId)}/availability`),
    setMethod('GET')
  );
