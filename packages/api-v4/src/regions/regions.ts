import { API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { ResourcePage as Page } from '../types';
import { Region } from './types';

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
export const getRegions = () =>
  Request<Page<Region>>(setURL(`${API_ROOT}/regions`), setMethod('GET'));

/**
 * getRegion
 *
 * Return detailed information about a particular region.
 *
 * @param regionID { string } The region to be retrieved.
 *
 */
export const getRegion = (regionID: string) =>
  Request<Region>(setURL(`${API_ROOT}/regions/${regionID}`), setMethod('GET'));

export { Region };
