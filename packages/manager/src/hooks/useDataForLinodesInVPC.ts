import {
  linodeQueries,
  useAllLinodesQuery,
  useQueries,
  useSubnetQuery,
} from '@linode/queries';
import { useMemo } from 'react';

import type { APIError, LinodeIPsResponse } from '@linode/api-v4';
import type { UseQueryOptions } from '@linode/queries';

export const useGetLinodeIPAndVPCData = (props: {
  region?: string;
  subnetId?: number;
  vpcId?: null | number;
}) => {
  const { region, vpcId, subnetId } = props;

  const isSubnetSelected = useMemo(
    () => vpcId !== undefined && subnetId !== undefined,
    [vpcId, subnetId]
  );

  const {
    data: linodesData,
    error: linodesError,
    isLoading: linodesIsLoading,
  } = useAllLinodesQuery({}, { region }, region !== undefined);

  const {
    data: subnetData,
    error: subnetError,
    isLoading: subnetIsLoading,
  } = useSubnetQuery(Number(vpcId), Number(subnetId), isSubnetSelected);

  const linodeIPQueries = useQueries({
    queries:
      linodesData?.map<UseQueryOptions<LinodeIPsResponse, APIError[]>>(
        ({ id }) => ({
          ...linodeQueries.linode(id)._ctx.ips,
          enabled: isSubnetSelected,
        })
      ) ?? [],
  });

  if (region && !vpcId) {
    return {
      linodesData,
      error: linodesError,
      isLoading: linodesIsLoading,
    };
  }

  const linodeIpsData: LinodeIPsResponse[] = [];
  let isIpLoading: boolean = false;
  const ipError: APIError[] = [];

  linodeIPQueries.forEach(({ data, isLoading, error }) => {
    if (data) {
      linodeIpsData.push(data);
    }
    if (isLoading) {
      isIpLoading = true;
    }
    if (error) {
      ipError.push(...error);
    }
  });

  return {
    linodesData,
    linodeIpsData,
    error: [...(linodesError ?? []), ...(subnetError ?? []), ...ipError],
    isLoading: linodesIsLoading ?? subnetIsLoading ?? isIpLoading,
    subnetData,
  };
};
