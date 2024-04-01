import {
  CreateSubnetPayload,
  CreateVPCPayload,
  ModifySubnetPayload,
  Subnet,
  UpdateVPCPayload,
  VPC,
  createSubnet,
  createVPC,
  deleteSubnet,
  deleteVPC,
  getSubnet,
  getSubnets,
  getVPC,
  getVPCs,
  modifySubnet,
  updateVPC,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAllVPCsRequest } from './requests';

import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';

export const vpcQueryKey = 'vpcs';
export const subnetQueryKey = 'subnets';

// VPC queries
export const vpcQueries = createQueryKeys('vpcs', {
  vpc: (vpcId: number) => ({
    contextQueries: {
      subnet: (subnetId: number) => ({
        queryFn: () => getSubnet(vpcId, subnetId),
        queryKey: null,
      }),
      subnets: {
        paginated: (params: Params = {}, filter: Filter = {}) => ({
          queryFn: () => getSubnets(vpcId, params, filter),
          queryKey: [params, filter],
        }),
      },
    },
    queryFn: () => getVPC(vpcId),
    queryKey: [vpcId],
  }),
  vpcs: {
    contextQueries: {
      all: {
        queryFn: getAllVPCsRequest,
        queryKey: null,
      },
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getVPCs(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
});

export const useAllVPCsQuery = (enabled = true) =>
  useQuery<VPC[], APIError[]>({
    ...vpcQueries.vpcs._ctx.all,
    enabled,
  });

export const useVPCsQuery = (params: Params, filter: Filter) => {
  return useQuery<ResourcePage<VPC>, APIError[]>({
    ...vpcQueries.vpcs._ctx.paginated(params, filter),
    keepPreviousData: true,
  });
};

export const useVPCQuery = (id: number, enabled: boolean = true) =>
  useQuery<VPC, APIError[]>({
    ...vpcQueries.vpc(id),
    enabled,
  });

export const useCreateVPCMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<VPC, APIError[], CreateVPCPayload>({
    mutationFn: createVPC,
    onSuccess: (VPC) => {
      queryClient.invalidateQueries(vpcQueries.vpcs._ctx.all);
      queryClient.invalidateQueries(vpcQueries.vpcs._ctx.paginated._def);
      queryClient.setQueryData(vpcQueries.vpc(VPC.id).queryKey, VPC);
    },
  });
};

export const useUpdateVPCMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<VPC, APIError[], UpdateVPCPayload>({
    mutationFn: (data) => updateVPC(id, data),
    onSuccess: (VPC) => {
      queryClient.invalidateQueries(vpcQueries.vpcs._ctx.paginated._def);
      queryClient.setQueryData<VPC>(vpcQueries.vpc(VPC.id).queryKey, VPC);
    },
  });
};

export const useDeleteVPCMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteVPC(id),
    onSuccess: () => {
      queryClient.invalidateQueries(vpcQueries.vpcs._ctx.all);
      queryClient.invalidateQueries(vpcQueries.vpcs._ctx.paginated._def);
      queryClient.removeQueries(vpcQueries.vpc(id).queryKey);
    },
  });
};

// Subnet queries

export const useSubnetsQuery = (
  vpcID: number,
  params: Params,
  filter: Filter,
  enabled: boolean = true
) => {
  return useQuery<ResourcePage<Subnet>, APIError[]>(
    [vpcQueryKey, 'vpc', vpcID, subnetQueryKey, 'paginated', params, filter],
    () => getSubnets(vpcID, params, filter),
    { enabled, keepPreviousData: true }
  );
};

export const useSubnetQuery = (vpcID: number, subnetID: number) => {
  return useQuery<Subnet, APIError[]>(
    [vpcQueryKey, 'vpc', vpcID, subnetQueryKey, 'subnet', subnetID],
    () => getSubnet(vpcID, subnetID)
  );
};

export const useCreateSubnetMutation = (vpcID: number) => {
  const queryClient = useQueryClient();
  return useMutation<Subnet, APIError[], CreateSubnetPayload>(
    (data) => createSubnet(vpcID, data),
    {
      onSuccess: () => {
        // New subnet created --> refresh the paginated and individual VPC queries, plus the /subnets VPC query
        queryClient.invalidateQueries([vpcQueryKey, 'paginated']);
        queryClient.invalidateQueries([vpcQueryKey, 'vpc', vpcID]);
        queryClient.invalidateQueries([
          vpcQueryKey,
          'vpc',
          vpcID,
          subnetQueryKey,
        ]);
      },
    }
  );
};

export const useUpdateSubnetMutation = (vpcID: number, subnetID: number) => {
  const queryClient = useQueryClient();
  return useMutation<Subnet, APIError[], ModifySubnetPayload>(
    (data) => modifySubnet(vpcID, subnetID, data),
    {
      onSuccess: () => {
        // Subnet modified --> refresh the paginated and individual VPC queries, plus the paginated & individual subnet queries
        queryClient.invalidateQueries([vpcQueryKey, 'paginated']);
        queryClient.invalidateQueries([vpcQueryKey, 'vpc', vpcID]);
        queryClient.invalidateQueries([
          vpcQueryKey,
          'vpc',
          vpcID,
          subnetQueryKey,
        ]);
        queryClient.invalidateQueries([
          vpcQueryKey,
          'vpc',
          vpcID,
          subnetQueryKey,
          'subnet',
          subnetID,
        ]);
      },
    }
  );
};

export const useDeleteSubnetMutation = (vpcID: number, subnetID: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteSubnet(vpcID, subnetID), {
    onSuccess: () => {
      // Subnet deleted --> refresh the paginated and individual VPC queries, plus the paginated subnet query, & clear the individual subnet query
      queryClient.invalidateQueries([vpcQueryKey, 'paginated']);
      queryClient.invalidateQueries([vpcQueryKey, 'vpc', vpcID]);
      queryClient.invalidateQueries([
        vpcQueryKey,
        'vpc',
        vpcID,
        subnetQueryKey,
      ]);
      queryClient.removeQueries([
        vpcQueryKey,
        'vpc',
        vpcID,
        subnetQueryKey,
        'subnet',
        subnetID,
      ]);
    },
  });
};
