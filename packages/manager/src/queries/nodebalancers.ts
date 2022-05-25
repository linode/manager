import {
  getNodeBalancerStats,
  NodeBalancerStats,
} from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { DateTime } from 'luxon';
import { useQuery } from 'react-query';
import { parseAPIDate } from 'src/utilities/date';

const queryKey = 'nodebalancers';
export const NODEBALANCER_STATS_NOT_READY_API_MESSAGE =
  'Stats are unavailable at this time.';

const getIsTooEarlyForStats = (created?: string) => {
  if (!created) {
    return false;
  }

  return parseAPIDate(created) > DateTime.local().minus({ minutes: 5 });
};

export const useNodeBalancerStats = (id: number, created?: string) => {
  return useQuery<NodeBalancerStats, APIError[]>(
    [`${queryKey}-stats`, id],
    getIsTooEarlyForStats(created)
      ? () =>
          Promise.reject([{ reason: NODEBALANCER_STATS_NOT_READY_API_MESSAGE }])
      : () => getNodeBalancerStats(id),
    // We need to disable retries because the API will
    // error if stats are not ready. If the default retry policy
    // is used, a "stats not ready" state can't be shown because the
    // query is still trying to request.
    { refetchInterval: 20000, retry: false }
  );
};
