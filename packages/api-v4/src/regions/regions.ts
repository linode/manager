import { API_ROOT } from 'src/constants';
import Request, { setMethod, setURL } from 'src/request';
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
  Request<Page<Region>>(setURL(`${API_ROOT}/regions`), setMethod('GET')).then(
    response => response.data
  );

/**
 * getRegion
 *
 * Return detailed information about a particular region.
 *
 * @param regionID { string } The region to be retrieved.
 *
 */
export const getRegion = (regionID: string) =>
  Request<Page<Region>>(
    setURL(`${API_ROOT}/regions/${regionID}`),
    setMethod('GET')
  ).then(response => response.data);

export { Region };
