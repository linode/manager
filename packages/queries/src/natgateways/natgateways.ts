import {
  addNATGatewayAddress,
  createNATGateway,
  deleteNATGateway,
  deleteNATGatewayAddress,
  getNATGateway,
  getNATGatewayAddress,
  getNATGatewayAddresses,
  getNATGatewayAddressInterfaces,
  getNATGatewayInterfaces,
  getNATGateways,
  getNATGatewaySettings,
  getNATGatewayTypes,
  updateNATGateway,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getAllNATGatewaysRequest } from './requests';

import type { EventHandlerData } from '../eventHandlers';
import type { PriceType } from '@akamai/compute-ui-core/api';
import type {
  APIError,
  CreateNATGatewayPayload,
  Filter,
  NATGateway,
  NATGatewayAddress,
  NATGatewayAddressDetail,
  NATGatewayInterface,
  NATGatewaySettings,
  Params,
  ResourcePage,
  UpdateNATGatewayPayload,
} from '@linode/api-v4';

export const natgatewayQueries = createQueryKeys('natgateways', {
  all: (filter: Filter = {}) => ({
    queryFn: () => getAllNATGatewaysRequest(filter),
    queryKey: [filter],
  }),
  natgateway: (id: number) => ({
    contextQueries: {
      addresses: {
        contextQueries: {
          address: (address: string) => ({
            contextQueries: {
              interfaces: (params: Params = {}) => ({
                queryFn: () =>
                  getNATGatewayAddressInterfaces(id, address, params),
                queryKey: [params],
              }),
            },
            queryFn: () => getNATGatewayAddress(id, address),
            queryKey: [address],
          }),
          paginated: (params: Params = {}) => ({
            queryFn: () => getNATGatewayAddresses(id, params),
            queryKey: [params],
          }),
        },
        queryKey: null,
      },
      interfaces: (params: Params = {}) => ({
        queryFn: () => getNATGatewayInterfaces(id, params),
        queryKey: [params],
      }),
    },
    queryFn: () => getNATGateway(id),
    queryKey: [id],
  }),
  paginated: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getNATGateways(params, filter),
    queryKey: [params, filter],
  }),
  settings: {
    queryFn: getNATGatewaySettings,
    queryKey: null,
  },
  types: {
    queryFn: getNATGatewayTypes,
    queryKey: null,
  },
});

interface AllNATGatewaysOptions {
  enabled?: boolean;
  filter?: Filter;
}

export const useAllNATGatewaysQuery = (options: AllNATGatewaysOptions = {}) =>
  useQuery<NATGateway[], APIError[]>({
    ...natgatewayQueries.all(options.filter),
    enabled: options.enabled ?? true,
  });

export const useNATGatewaysQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled = true,
) => {
  return useQuery<ResourcePage<NATGateway>, APIError[]>({
    ...natgatewayQueries.paginated(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });
};

export const useNATGatewayQuery = (id: number, enabled: boolean = true) =>
  useQuery<NATGateway, APIError[]>({
    ...natgatewayQueries.natgateway(id),
    enabled,
  });

export const useNATGatewayAddressesQuery = (
  id: number,
  params: Params = {},
  enabled: boolean = true,
) => {
  return useQuery<ResourcePage<NATGatewayAddressDetail>, APIError[]>({
    ...natgatewayQueries.natgateway(id)._ctx.addresses._ctx.paginated(params),
    enabled,
  });
};

export const useNATGatewayAddressQuery = (
  id: number,
  address: string,
  enabled: boolean = true,
) => {
  return useQuery<NATGatewayAddressDetail, APIError[]>({
    ...natgatewayQueries.natgateway(id)._ctx.addresses._ctx.address(address),
    enabled,
  });
};

export const useNATGatewayAddressInterfacesQuery = (
  id: number,
  address: string,
  params: Params = {},
  enabled: boolean = true,
) => {
  return useQuery<ResourcePage<NATGatewayInterface>, APIError[]>({
    ...natgatewayQueries
      .natgateway(id)
      ._ctx.addresses._ctx.address(address)
      ._ctx.interfaces(params),
    enabled,
  });
};

export const useNATGatewayInterfacesQuery = (
  id: number,
  params: Params = {},
  enabled: boolean = true,
) => {
  return useQuery<ResourcePage<NATGatewayInterface>, APIError[]>({
    ...natgatewayQueries.natgateway(id)._ctx.interfaces(params),
    enabled,
  });
};

export const useNATGatewayTypesQuery = (enabled: boolean = true) => {
  return useQuery<ResourcePage<PriceType>, APIError[]>({
    ...natgatewayQueries.types,
    enabled,
  });
};

export const useNATGatewaySettingsQuery = (enabled: boolean = true) => {
  return useQuery<NATGatewaySettings, APIError[]>({
    ...natgatewayQueries.settings,
    enabled,
  });
};

export const useCreateNATGatewayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<NATGateway, APIError[], CreateNATGatewayPayload>({
    mutationFn: createNATGateway,
    onSuccess(natgateway) {
      queryClient.invalidateQueries({
        queryKey: natgatewayQueries.all._def,
      });
      queryClient.invalidateQueries({
        queryKey: natgatewayQueries.paginated._def,
      });
      queryClient.setQueryData<NATGateway>(
        natgatewayQueries.natgateway(natgateway.id).queryKey,
        natgateway,
      );

      // If created with a VPC subnet, invalidate VPC queries
      if (natgateway.vpc_subnet) {
        queryClient.invalidateQueries({
          queryKey: ['vpcs'],
        });
      }
    },
  });
};

export const useUpdateNATGatewayMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<NATGateway, APIError[], UpdateNATGatewayPayload>({
    mutationFn: (data) => updateNATGateway(id, data),
    onSuccess(natgateway) {
      queryClient.invalidateQueries({
        queryKey: natgatewayQueries.all._def,
      });
      queryClient.invalidateQueries({
        queryKey: natgatewayQueries.paginated._def,
      });
      queryClient.setQueryData<NATGateway>(
        natgatewayQueries.natgateway(id).queryKey,
        natgateway,
      );
    },
  });
};

export const useDeleteNATGatewayMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteNATGateway(id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: natgatewayQueries.all._def,
      });
      queryClient.invalidateQueries({
        queryKey: natgatewayQueries.paginated._def,
      });
      queryClient.removeQueries({
        queryKey: natgatewayQueries.natgateway(id).queryKey,
      });

      // Invalidate VPC queries since subnet assignments may have changed
      queryClient.invalidateQueries({
        queryKey: ['vpcs'],
      });
    },
  });
};

export const useAddNATGatewayAddressMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<NATGatewayAddressDetail, APIError[], NATGatewayAddress>({
    mutationFn: (data) => addNATGatewayAddress(id, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: natgatewayQueries.natgateway(id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey:
          natgatewayQueries.natgateway(id)._ctx.addresses._ctx.paginated._def,
      });
    },
  });
};

export const useDeleteNATGatewayAddressMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], string>({
    mutationFn: (address) => deleteNATGatewayAddress(id, address),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: natgatewayQueries.natgateway(id).queryKey,
      });
      // Invalidate paginated addresses list
      queryClient.invalidateQueries({
        queryKey:
          natgatewayQueries.natgateway(id)._ctx.addresses._ctx.paginated._def,
      });
    },
  });
};

/**
 * Event handler for NAT Gateway events
 * Invalidates relevant queries when NAT Gateway-related events occur
 */
export const natgatewayEventHandler = ({
  event,
  queryClient,
}: EventHandlerData) => {
  const natgatewayId = event.entity?.id;

  // Invalidate all NAT Gateway list queries
  queryClient.invalidateQueries({
    queryKey: natgatewayQueries.all._def,
  });
  queryClient.invalidateQueries({
    queryKey: natgatewayQueries.paginated._def,
  });

  // If specific NAT Gateway is mentioned, invalidate its queries
  if (natgatewayId) {
    queryClient.invalidateQueries({
      queryKey: natgatewayQueries.natgateway(natgatewayId).queryKey,
    });
  }

  // If event involves VPC subnets, invalidate VPC queries
  if (event.secondary_entity?.type === 'vpc') {
    queryClient.invalidateQueries({
      queryKey: ['vpcs'],
    });
  }

  // Invalidate interface queries if applicable
  if (event.action?.includes('interface') || event.entity?.type === 'linode') {
    queryClient.invalidateQueries({
      queryKey: ['linodes'],
    });
  }
};
