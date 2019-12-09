import { get } from 'src/features/Longview/request';
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

    return get(api_key, 'getLatestValue', {
      fields: ['cpu', 'disk', 'load', 'memory', 'network', 'sysinfo', 'uptime']
    }).then(response => ({
      ...response,
      Packages: [...packages]
    }));
  }
);
