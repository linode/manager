import {
  addEntityToAlert,
  createAlertDefinition,
  deleteEntityFromAlert,
  editAlertDefinition,
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
  });
};

export const useAlertDefinitionByServiceTypeQuery = (serviceType: string) => {
  return useQuery<Alert[], APIError[]>({
    ...queryFactory.alerts._ctx.alertsByServiceType(serviceType),
  });
};

export const useAlertDefinitionQuery = (
  alertId: string,
  serviceType: string
) => {
  return useQuery<Alert, APIError[]>({
    ...queryFactory.alerts._ctx.alertByServiceTypeAndId(serviceType, alertId),
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
    onSuccess() {
      queryClient.invalidateQueries(queryFactory.alerts);
    },
  });
};

export const useAddEntityToAlert = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], EntityAlertUpdatePayload>({
    mutationFn: (payload: EntityAlertUpdatePayload) => {
      const { alertId, entityId, serviceType } = payload;
      return addEntityToAlert(serviceType, entityId, {
        'alert-definition-id': alertId,
      });
    },
    onError(_error, payload, context: { previousData: Alert[] }) {
      const { serviceType } = payload;
      const { previousData } = context;
      queryClient.setQueryData(
        queryFactory.alerts._ctx.alertsByServiceType(serviceType).queryKey,
        previousData
      );
    },
    onMutate(payload) {
      const { alertId, entityId, serviceType } = payload;

      queryClient.cancelQueries({
        queryKey: queryFactory.alerts._ctx.alertsByServiceType(serviceType)
          .queryKey,
      });

      const previousData = queryClient.getQueryData(
        queryFactory.alerts._ctx.alertsByServiceType(serviceType).queryKey
      );

      queryClient.setQueryData(
        queryFactory.alerts._ctx.alertsByServiceType(serviceType).queryKey,
        (alerts: Alert[]) => {
          return alerts?.map((alert) => {
            if (alert.id !== alertId) {
              return alert;
            }

            alert.entity_ids.push(entityId);

            return alert;
          });
        }
      );

      return { previousData };
    },
    onSettled() {
      queryClient.invalidateQueries(queryFactory.alerts);
    },
  });
};
export const useRemoveEntityFromAlert = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], EntityAlertUpdatePayload>({
    mutationFn: (payload: EntityAlertUpdatePayload) => {
      const { alertId, entityId, serviceType } = payload;
      return deleteEntityFromAlert(serviceType, entityId, alertId);
    },

    onError(_error, payload, context: { previousData: Alert[] }) {
      const { serviceType } = payload;
      const { previousData } = context;
      queryClient.setQueryData(
        queryFactory.alerts._ctx.alertsByServiceType(serviceType).queryKey,
        previousData
      );
    },
    onMutate(payload) {
      const { alertId, entityId, serviceType } = payload;

      queryClient.cancelQueries({
        queryKey: queryFactory.alerts._ctx.alertsByServiceType(serviceType)
          .queryKey,
      });

      const previousData = queryClient.getQueryData(
        queryFactory.alerts._ctx.alertsByServiceType(serviceType).queryKey
      );

      queryClient.setQueryData(
        queryFactory.alerts._ctx.alertsByServiceType(serviceType).queryKey,
        (alerts: Alert[]) => {
          return alerts?.map((alert) => {
            if (alert.id !== alertId) {
              return alert;
            }

            const index = alert.entity_ids.indexOf(entityId);
            if (index > -1) {
              alert.entity_ids.splice(index, 1);
            }

            return alert;
          });
        }
      );

      return { previousData };
    },
    onSettled() {
      queryClient.invalidateQueries(queryFactory.alerts);
    },
  });
};
