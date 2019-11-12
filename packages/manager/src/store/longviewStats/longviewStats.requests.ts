import { get } from 'src/features/Longview/request';
import { LongviewPackage } from 'src/features/Longview/request.types';
import { createRequestThunk } from '../store.helpers';
import { requestClientStats } from './longviewStats.actions';

export const getClientStats = createRequestThunk(
  requestClientStats,
  async ({ api_key }) => {
    // Packages
    let packages: LongviewPackage[];
    try {
      const result = await get(api_key, 'getValues', ['packages']);
      packages = result.Packages || [];
    } catch {
      packages = [] as LongviewPackage[];
    }

    return get(api_key, 'getLatestValue', [
      'cpu',
      'disk',
      'load',
      'memory',
      'network',
      'sysinfo',
      'uptime'
    ]).then(response => ({
      ...response,
      Packages: [...packages]
    }));
  }
);
