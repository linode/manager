import {
  createAlertDefinition,
  editAlertDefinitionResources,
} from '@linode/api-v4/lib/cloudpulse';
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
  EditAlertResourcesPayload,
  NotificationChannel,
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

export const useAlertDefinitionQuery = (
  alertId: number,
  serviceType: string
) => {
  return useQuery<Alert, APIError[]>({
    ...queryFactory.alerts._ctx.alertByServiceTypeAndId(serviceType, alertId),
  });
};

export const useAlertNotificationChannelsQuery = (
  params?: Params,
  filter?: Filter
) => {
  return useQuery<NotificationChannel[], APIError[]>({
    ...queryFactory.notificationChannels._ctx.all(params, filter),
  });
};

export const useEditAlertDefinitionResources = (
  serviceType: string,
  alertId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Alert, APIError[], EditAlertResourcesPayload>({
    mutationFn: (data) =>
      editAlertDefinitionResources(data, serviceType, alertId),
    onSuccess() {
      queryClient.invalidateQueries(
        queryFactory.alerts._ctx.alertByServiceTypeAndId(serviceType, alertId)
      );
    },
  });
};
