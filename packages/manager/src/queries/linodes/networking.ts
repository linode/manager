import {
  allocateIPAddress,
  assignAddresses,
  removeIPAddress,
  removeIPv6Range,
  shareAddresses,
  updateIP,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { networkingQueries } from '../networking/networking';
import { linodeQueries } from './linodes';

import type {
  APIError,
  IPAddress,
  IPAllocationRequest,
  IPAssignmentPayload,
  IPRangeInformation,
  IPSharingPayload,
  Linode,
  LinodeIPsResponse,
} from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';

export const useLinodeIPsQuery = (
  linodeId: number,
  enabled: boolean = true
) => {
  return useQuery<LinodeIPsResponse, APIError[]>({
    ...linodeQueries.linode(linodeId)._ctx.ips,
    enabled,
  });
};

export const useLinodeIPMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IPAddress,
    APIError[],
    { address: string; rdns?: null | string }
  >({
    mutationFn: ({ address, rdns }) => updateIP(address, rdns),
    onSuccess() {
      invalidateIPsForAllLinodes(queryClient);
    },
  });
};

export const useLinodeIPDeleteMutation = (
  linodeId: number,
  address: string
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => removeIPAddress({ address, linodeID: linodeId }),
    onSuccess() {
      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(linodeId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linode(linodeId)._ctx.ips.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });

      queryClient.invalidateQueries({ queryKey: networkingQueries.ips._def });
    },
  });
};

export const useLinodeRemoveRangeMutation = (range: string) => {
  const queryClient = useQueryClient();
  return useMutation<IPRangeInformation, APIError[]>({
    mutationFn: async () => {
      const rangeDetails = await queryClient.ensureQueryData(
        networkingQueries.ipv6._ctx.range(range)
      );
      await removeIPv6Range({ range });
      return rangeDetails;
    },
    onSuccess(deletedRange) {
      // Update networking queries
      queryClient.removeQueries({
        queryKey: networkingQueries.ipv6._ctx.range(range).queryKey,
      });
      queryClient.invalidateQueries({ queryKey: networkingQueries.ips._def });
      queryClient.invalidateQueries({
        queryKey: networkingQueries.ipv6._ctx.ranges._def,
      });

      // Update Linode queries
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });

      for (const linode of deletedRange.linodes) {
        queryClient.invalidateQueries({
          exact: true,
          queryKey: linodeQueries.linode(linode).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linode)._ctx.ips.queryKey,
        });
      }
    },
  });
};

export const useLinodeShareIPMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], IPSharingPayload>({
    mutationFn: shareAddresses,
    onSuccess(response, variables) {
      invalidateIPsForAllLinodes(queryClient);

      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(variables.linode_id).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });

      queryClient.invalidateQueries({ queryKey: networkingQueries._def });
    },
  });
};

export const useAssignAdressesMutation = ({
  currentLinodeId,
}: {
  currentLinodeId: Linode['id'];
}) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], IPAssignmentPayload>({
    mutationFn: assignAddresses,
    onSuccess(_, variables) {
      for (const { linode_id } of variables.assignments) {
        queryClient.invalidateQueries({
          exact: true,
          queryKey: linodeQueries.linode(linode_id).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linode_id)._ctx.ips.queryKey,
        });
      }

      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(currentLinodeId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linode(currentLinodeId)._ctx.ips.queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });

      queryClient.invalidateQueries({ queryKey: networkingQueries._def });
    },
  });
};

export const useAllocateIPMutation = (linodeId: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], IPAllocationRequest>({
    mutationFn: (data) => allocateIPAddress(linodeId, data),
    onSuccess() {
      // Update Linode queries
      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(linodeId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linode(linodeId)._ctx.ips.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });

      // Update networking queries
      queryClient.invalidateQueries({
        queryKey: networkingQueries.ips._def,
      });
    },
  });
};

const invalidateIPsForAllLinodes = (queryClient: QueryClient) => {
  // Because IPs may be shared between Linodes, we can't simpily invalidate one store.
  // Here, we look at all of our active query keys, and invalidate any queryKey that contains 'ips'.
  queryClient.invalidateQueries({
    predicate: (query) => {
      if (Array.isArray(query.queryKey)) {
        return query.queryKey[0] === 'linodes' && query.queryKey[3] === 'ips';
      }
      return false;
    },
  });
};
