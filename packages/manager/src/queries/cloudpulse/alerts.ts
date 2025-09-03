import {
  addEntityToAlert,
  createAlertDefinition,
  deleteAlertDefinition,
  deleteEntityFromAlert,
  editAlertDefinition,
  updateServiceAlerts,
} from '@linode/api-v4/lib/cloudpulse';
import { queryPresets } from '@linode/queries';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { invalidateAlerts } from 'src/features/CloudPulse/Alerts/Utils/utils';

import { queryFactory } from './queries';

import type {
  Alert,
  CloudPulseAlertsPayload,
  CreateAlertDefinitionPayload,
  DeleteAlertPayload,
  EditAlertPayloadWithService,
  EntityAlertUpdatePayload,
  NotificationChannel,
} from '@linode/api-v4/lib/cloudpulse';
import type { APIError, Filter, Params } from '@linode/api-v4/lib/types';


export const useCreateAlertDefinition = (serviceType: string) => {
  const queryClient = useQueryClient();
  return useMutation<Alert, APIError[], CreateAlertDefinitionPayload>({
    mutationFn: (data) => createAlertDefinition(data, serviceType),
    onSuccess: async (newAlert) => {
      const allAlertsKey = queryFactory.alerts._ctx.all().queryKey;
      const oldAlerts = queryClient.getQueryData<Alert[]>(allAlertsKey);

      // Use cached alerts list if available to avoid refetching from API.
      if (oldAlerts) {
        queryClient.setQueryData<Alert[]>(allAlertsKey, [
          ...oldAlerts,
          newAlert,
        ]);
      }
      queryClient.setQueryData(
        queryFactory.alerts._ctx.alertByServiceTypeAndId(
          newAlert.service_type,
          String(newAlert.id)
        ).queryKey,
        newAlert
      );

      queryClient.invalidateQueries({
        queryKey: queryFactory.alerts._ctx.alertsByServiceType(
          newAlert.service_type
        ).queryKey,
      });
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
      const allAlertsKey = queryFactory.alerts._ctx.all().queryKey;

      queryClient.setQueryData<Alert[] | undefined>(allAlertsKey, (prev) => {
        // nothing cached yet
        if (!prev) return prev;

        const idx = prev.findIndex((a) => a.id === data.id);
        if (idx === -1) return prev;

        // if no change keep referential equality
        if (prev[idx] === data) return prev;

        const next = prev.slice();
        next[idx] = data;
        return next;
      });

      queryClient.setQueryData<Alert>(
        queryFactory.alerts._ctx.alertByServiceTypeAndId(
          data.service_type,
          String(data.id)
        ).queryKey,
        data
      );

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
        queryKey:
          queryFactory.alerts._ctx.alertsByServiceType(serviceType).queryKey,
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
        queryKey:
          queryFactory.alerts._ctx.alertsByServiceType(serviceType).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: queryFactory.alerts._ctx.all().queryKey,
      });
    },
  });
};

export const useDeleteAlertDefinitionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Alert, APIError[], DeleteAlertPayload>({
    mutationFn: ({ serviceType, alertId }) => {
      return deleteAlertDefinition(serviceType, alertId);
    },
    onSuccess(_data, { serviceType, alertId }) {
      queryClient.cancelQueries({
        queryKey: queryFactory.alerts._ctx.all().queryKey,
      });
      queryClient.setQueryData<Alert[]>(
        queryFactory.alerts._ctx.all().queryKey,
        (oldData) => {
          return oldData?.filter(({ id }) => id !== alertId) ?? [];
        }
      );
      queryClient.invalidateQueries({
        queryKey:
          queryFactory.alerts._ctx.alertsByServiceType(serviceType).queryKey,
      });
      queryClient.removeQueries({
        queryKey: queryFactory.alerts._ctx.alertByServiceTypeAndId(
          serviceType,
          String(alertId)
        ).queryKey,
      });
    },
  });
};

export const useServiceAlertsMutation = (
  serviceType: string,
  entityId: string
) => {
  const queryClient = useQueryClient();
  return useMutation<Alert, APIError[], CloudPulseAlertsPayload>({
    mutationFn: (payload: CloudPulseAlertsPayload) => {
      return updateServiceAlerts(serviceType, entityId, payload);
    },
    onSuccess(_, payload) {
      invalidateAlerts(queryClient, serviceType, entityId, payload);
    },
  });
};
