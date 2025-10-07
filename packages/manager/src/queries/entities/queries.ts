import { getAccountEntities } from '@linode/api-v4';
import { getAll } from '@linode/utilities';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import type { AccountEntity, Filter, Params } from '@linode/api-v4';

// TODO: Temporary—use getAll since API can’t filter yet.
// Switch to paginated + API filtering (X-Filter) when supported.
const getAllAccountEntitiesRequest = (
  _params: Params = {},
  _filter: Filter = {}
) =>
  getAll<AccountEntity>((params) =>
    getAccountEntities({ ...params, ..._params })
  )().then((data) => data.data);

export const entitiesQueries = createQueryKeys('entities', {
  all: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAllAccountEntitiesRequest(params, filter),
    queryKey: [params, filter],
  }),
  paginated: (params: Params, filter: Filter) => ({
    queryFn: () => getAccountEntities(params),
    queryKey: [params, filter],
  }),
});
