import { mergeQueryKeys } from '@lukemorales/query-key-factory';

import { accountQueries } from './account/queries';
import { betaQueries } from './betas';
import { profileQueries } from './profile';
import { regionQueries } from './regions/regions';

/**
 * `queries` contains *all* query keys for Cloud Manager.
 *
 * @example
 * import { queries } from 'src/queries';
 *
 * queryClient.invalidateQueries(queries.account.settings.queryKey);
 */
export const queries = mergeQueryKeys(
  profileQueries,
  accountQueries,
  betaQueries,
  regionQueries
);
