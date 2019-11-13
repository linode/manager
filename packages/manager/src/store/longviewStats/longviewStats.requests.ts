import { get } from 'src/features/Longview/request';
import { createRequestThunk } from '../store.helpers';
import { requestClientStats } from './longviewStats.actions';

export const getClientStats = createRequestThunk(
  requestClientStats,
  ({ api_key }) => {
    return get(api_key, 'getLatestValue', [
      'cpu',
      'disk',
      'load',
      'memory',
      'network',
      'sysinfo'
    ]).then(response => response);
  }
);
