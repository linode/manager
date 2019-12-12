import { get, getLastUpdated } from 'src/features/Longview/request';
import { LongviewPackage } from 'src/features/Longview/request.types';
import { createRequestThunk } from '../store.helpers';
import { requestClientStats } from './longviewStats.actions';

export const getClientStats = createRequestThunk(
  requestClientStats,
  async ({ api_key }) => {
    /**
     * To calculate the number of packages in need
     * of updating, we need the full list of available
     * packages (from getValues rather than getLatestValue).
     *
     * We therefore have to make a separate request to retrieve
     * the data. This data is then shoehorned into our getLatestValue
     * response.
     */
    let packages: LongviewPackage[];
    try {
      const result = await get(api_key, 'getValues', { fields: ['packages'] });
      packages = result.Packages || [];
    } catch {
      packages = [];
    }

    /**
     * The getLatestValue request we're about to make will always return a
     * value, no matter how old it is, as long as the server has ever
     * returned data.
     *
     * Since we use this request to populate "live" data, we don't actually
     * want to make this request if lastUpdated is more than ~30 minutes.
     */
    let lastUpdated = 0;
    try {
      lastUpdated = await getLastUpdated(api_key).then(
        response => response.updated || 0
      );
    } catch {
      return Promise.resolve({});
    }

    if (Date.now() / 1000 - lastUpdated > 60 * 30) {
      return Promise.resolve({});
    }

    return get(api_key, 'getLatestValue', {
      fields: ['cpu', 'disk', 'load', 'memory', 'network', 'sysinfo', 'uptime']
    }).then(response => ({
      ...response,
      Packages: [...packages]
    }));
  }
);
