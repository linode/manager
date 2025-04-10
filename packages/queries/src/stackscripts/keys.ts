import { getStackScript, getStackScripts } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getAllAccountStackScripts, getAllOCAsRequest } from './requests';

import type { Filter } from '@linode/api-v4';

export const stackscriptQueries = createQueryKeys('stackscripts', {
  all: {
    queryFn: () => getAllAccountStackScripts(),
    queryKey: null,
  },
  infinite: (filter: Filter = {}) => ({
    queryFn: ({ pageParam }) =>
      getStackScripts({ page: pageParam as number, page_size: 25 }, filter),
    queryKey: [filter],
  }),
  marketplace: {
    queryFn: () => getAllOCAsRequest(),
    queryKey: null,
  },
  stackscript: (id: number) => ({
    queryFn: () => getStackScript(id),
    queryKey: [id],
  }),
});
