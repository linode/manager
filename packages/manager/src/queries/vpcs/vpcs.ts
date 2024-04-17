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

// VPC queries
export const vpcQueries = createQueryKeys('vpcs', {
  all: {
    queryFn: getAllVPCsRequest,
    queryKey: null,
  },
  paginated: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getVPCs(params, filter),
    queryKey: [params, filter],
  }),
  vpc: (vpcId: number) => ({
    contextQueries: {
      subnets: {
        contextQueries: {
          paginated: (params: Params = {}, filter: Filter = {}) => ({
            queryFn: () => getSubnets(vpcId, params, filter),
            queryKey: [params, filter],
          }),
          subnet: (subnetId: number) => ({
            queryFn: () => getSubnet(vpcId, subnetId),
            queryKey: [subnetId],
          }),
        },
        queryKey: null,
      },
    },
    queryFn: () => getVPC(vpcId),
    queryKey: [vpcId],
  }),
});

export const useAllVPCsQuery = (enabled = true) =>
  useQuery<VPC[], APIError[]>({
    ...vpcQueries.all,
    enabled,
  });

export const useVPCsQuery = (
  params: Params,
  filter: Filter,
  enabled = true
) => {
  return useQuery<ResourcePage<VPC>, APIError[]>({
    ...vpcQueries.paginated(params, filter),
    enabled,
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
      queryClient.invalidateQueries(vpcQueries.all.queryKey);
      queryClient.invalidateQueries(vpcQueries.paginated._def);
      queryClient.setQueryData(vpcQueries.vpc(VPC.id).queryKey, VPC);
    },
  });
};

export const useUpdateVPCMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<VPC, APIError[], UpdateVPCPayload>({
    mutationFn: (data) => updateVPC(id, data),
    onSuccess: (VPC) => {
      queryClient.invalidateQueries(vpcQueries.paginated._def);
      queryClient.setQueryData<VPC>(vpcQueries.vpc(VPC.id).queryKey, VPC);
    },
  });
};

export const useDeleteVPCMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteVPC(id),
    onSuccess: () => {
      queryClient.invalidateQueries(vpcQueries.all.queryKey);
      queryClient.invalidateQueries(vpcQueries.paginated._def);
      queryClient.removeQueries(vpcQueries.vpc(id).queryKey);
    },
  });
};

// Subnet queries
export const useSubnetsQuery = (
  vpcId: number,
  params: Params,
  filter: Filter,
  enabled: boolean = true
) =>
  useQuery<ResourcePage<Subnet>, APIError[]>({
    ...vpcQueries.vpc(vpcId)._ctx.subnets._ctx.paginated(params, filter),
    enabled,
    keepPreviousData: true,
  });

export const useCreateSubnetMutation = (vpcId: number) => {
  const queryClient = useQueryClient();
  return useMutation<Subnet, APIError[], CreateSubnetPayload>({
    mutationFn: (data) => createSubnet(vpcId, data),
    onSuccess: () => {
      // New subnet created --> refresh the VPC queries (all, paginated, & individual), plus the /subnets VPC query
      queryClient.invalidateQueries(vpcQueries.all.queryKey);
      queryClient.invalidateQueries(vpcQueries.paginated._def);
      queryClient.invalidateQueries(vpcQueries.vpc(vpcId).queryKey);
      queryClient.invalidateQueries(
        vpcQueries.vpc(vpcId)._ctx.subnets.queryKey
      );
    },
  });
};

export const useUpdateSubnetMutation = (vpcId: number, subnetId: number) => {
  const queryClient = useQueryClient();
  return useMutation<Subnet, APIError[], ModifySubnetPayload>({
    mutationFn: (data) => modifySubnet(vpcId, subnetId, data),
    onSuccess: () => {
      // New subnet created --> refresh the VPC queries (all, paginated, & individual), plus the /subnets VPC query
      queryClient.invalidateQueries(vpcQueries.all.queryKey);
      queryClient.invalidateQueries(vpcQueries.paginated._def);
      queryClient.invalidateQueries(vpcQueries.vpc(vpcId).queryKey);
      queryClient.invalidateQueries(
        vpcQueries.vpc(vpcId)._ctx.subnets.queryKey
      );
    },
  });
};

export const useDeleteSubnetMutation = (vpcId: number, subnetId: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteSubnet(vpcId, subnetId),
    onSuccess: () => {
      // New subnet created --> refresh the VPC queries (all, paginated, & individual), plus the /subnets VPC query
      queryClient.invalidateQueries(vpcQueries.all.queryKey);
      queryClient.invalidateQueries(vpcQueries.paginated._def);
      queryClient.invalidateQueries(vpcQueries.vpc(vpcId).queryKey);
      queryClient.invalidateQueries(
        vpcQueries.vpc(vpcId)._ctx.subnets.queryKey
      );
    },
  });
};
