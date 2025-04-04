import {
  addEntityToAlert,
  createAlertDefinition,
  deleteEntityFromAlert,
  editAlertDefinition,
} from '@linode/api-v4/lib/cloudpulse';
import { queryPresets } from '@linode/queries';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryFactory } from './queries';

import type {
  Alert,
  AlertServiceType,
  CreateAlertDefinitionPayload,
  EditAlertPayloadWithService,
  EntityAlertUpdatePayload,
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
    refetchInterval: 120000,
  });
};

export const useAlertDefinitionByServiceTypeQuery = (serviceType: string) => {
  return useQuery<Alert[], APIError[]>({
    ...queryFactory.alerts._ctx.alertsByServiceType(serviceType),
    refetchInterval: 120000,
  });
};

export const useAlertDefinitionQuery = (
  alertId: string,
  serviceType: string
) => {
  return useQuery<Alert, APIError[]>({
    ...queryFactory.alerts._ctx.alertByServiceTypeAndId(serviceType, alertId),
    refetchInterval: 120000,
  });
};

export const useAllAlertNotificationChannelsQuery = (
  params?: Params,
  filter?: Filter
) => {
  return useQuery<NotificationChannel[], APIError[]>({
    ...queryFactory.notificationChannels._ctx.all(params, filter),
  });
};

export const useEditAlertDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation<Alert, APIError[], EditAlertPayloadWithService>({
    mutationFn: ({ alertId, serviceType, ...data }) =>
      editAlertDefinition(data, serviceType, alertId),

    onSuccess(data) {
      const allAlertsQueryKey = queryFactory.alerts._ctx.all().queryKey;
      queryClient.cancelQueries({ queryKey: allAlertsQueryKey });
      queryClient.setQueryData<Alert[]>(allAlertsQueryKey, (oldData) => {
        return (
          oldData?.map((alert) => {
            return alert.id === data.id ? data : alert;
          }) ?? [data]
        );
      });

      queryClient.invalidateQueries({
        queryKey: queryFactory.alerts._ctx.alertByServiceTypeAndId(
          data.service_type,
          String(data.id)
        ).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: queryFactory.alerts._ctx.alertsByServiceType(
          data.service_type
        ).queryKey,
      });
    },
  });
};

export const useAddEntityToAlert = () => {
  const queryClient = useQueryClient();

  // Todo: Will update the type of api response once it is finalized
  return useMutation<{}, APIError[], EntityAlertUpdatePayload>({
    mutationFn: (payload: EntityAlertUpdatePayload) => {
      const { alert, entityId } = payload;
      const { id: alertId, service_type: serviceType } = alert;
      return addEntityToAlert(serviceType, entityId, {
        'alert-definition-id': alertId,
      });
    },

    onSuccess(_data, variable) {
      const { alert, entityId } = variable;
      const { id: alertId, service_type: serviceType } = alert;

      alert.entity_ids.push(entityId);
      queryClient.setQueryData(
        queryFactory.alerts._ctx.alertByServiceTypeAndId(
          serviceType,
          String(alertId)
        ).queryKey,
        alert
      );
      queryClient.invalidateQueries({
        queryKey: queryFactory.alerts._ctx.alertsByServiceType(serviceType)
          .queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: queryFactory.alerts._ctx.all().queryKey,
      });
    },
  });
};
export const useRemoveEntityFromAlert = () => {
  const queryClient = useQueryClient();

  // Todo: Will update the type of api response once it is finalized
  return useMutation<{}, APIError[], EntityAlertUpdatePayload>({
    mutationFn: (payload: EntityAlertUpdatePayload) => {
      const { alert, entityId } = payload;
      const { id: alertId, service_type: serviceType } = alert;
      return deleteEntityFromAlert(serviceType, entityId, alertId);
    },
    onSuccess(_data, variable) {
      const { alert, entityId } = variable;
      const { id: alertId, service_type: serviceType } = alert;

      const index = alert.entity_ids.indexOf(entityId);
      if (index > -1) {
        alert.entity_ids.splice(index, 1);
      }
      queryClient.setQueryData(
        queryFactory.alerts._ctx.alertByServiceTypeAndId(
          serviceType,
          String(alertId)
        ).queryKey,
        alert
      );
      queryClient.invalidateQueries({
        queryKey: queryFactory.alerts._ctx.alertsByServiceType(serviceType)
          .queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: queryFactory.alerts._ctx.all().queryKey,
      });
    },
  });
};
