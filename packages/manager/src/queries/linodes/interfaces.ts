import { useQuery } from '@tanstack/react-query';

import { linodeQueries } from './linodes';

import type { APIError, LinodeInterfaces } from '@linode/api-v4';

export const useLinodeInterfacesQuery = (linodeId: number) => {
  return useQuery<LinodeInterfaces, APIError[]>(
    linodeQueries.linode(linodeId)._ctx.interfaces._ctx.interfaces
  );
};
