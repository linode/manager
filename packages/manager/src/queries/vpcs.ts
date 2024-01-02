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
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export const vpcQueryKey = 'vpcs';
export const subnetQueryKey = 'subnets';

// VPC queries
export const useVPCsQuery = (
  params: Params,
  filter: Filter,
  enabled: boolean = true
) => {
  return useQuery<ResourcePage<VPC>, APIError[]>(
    [vpcQueryKey, 'paginated', params, filter],
    () => getVPCs(params, filter),
    {
      enabled,
      keepPreviousData: true,
    }
  );
};

export const useVPCQuery = (id: number, enabled: boolean = true) => {
  return useQuery<VPC, APIError[]>([vpcQueryKey, 'vpc', id], () => getVPC(id), {
    enabled,
  });
};

export const useCreateVPCMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<VPC, APIError[], CreateVPCPayload>(createVPC, {
    onSuccess: (VPC) => {
      queryClient.invalidateQueries([vpcQueryKey, 'paginated']);
      queryClient.setQueryData([vpcQueryKey, 'vpc', VPC.id], VPC);
    },
  });
};

export const useUpdateVPCMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<VPC, APIError[], UpdateVPCPayload>(
    (data) => updateVPC(id, data),
    {
      onSuccess: (VPC) => {
        queryClient.invalidateQueries([vpcQueryKey, 'paginated']);
        queryClient.setQueryData<VPC>([vpcQueryKey, 'vpc', VPC.id], VPC);
      },
    }
  );
};

export const useDeleteVPCMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteVPC(id), {
    onSuccess: () => {
      queryClient.invalidateQueries([vpcQueryKey, 'paginated']);
      queryClient.removeQueries([vpcQueryKey, 'vpc', id]);
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
