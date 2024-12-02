import { createAlertDefinition } from '@linode/api-v4/lib/cloudpulse';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryPresets } from '../base';
import { queryFactory } from './queries';

import type {
  Alert,
  AlertServiceType,
  CreateAlertDefinitionPayload,
} from '@linode/api-v4/lib/cloudpulse';
import type { APIError, Filter, Params } from '@linode/api-v4/lib/types';

export const useCreateAlertDefinition = (serviceType: AlertServiceType) => {
  const queryClient = useQueryClient();
  return useMutation<Alert, APIError[], CreateAlertDefinitionPayload>({
    mutationFn: (data) => createAlertDefinition(data, serviceType),
    onSuccess() {
      queryClient.invalidateQueries(queryFactory.alerts);
    },
  });
};

export const useAllAlertDefinitionsQuery = (
  params?: Params,
  filter?: Filter,
  enabled: boolean = true
) => {
  return useQuery<Alert[], APIError[]>({
    ...queryFactory.alerts._ctx.all(params, filter),
    ...queryPresets.longLived,
    enabled,
    placeholderData: keepPreviousData,
  });
};
