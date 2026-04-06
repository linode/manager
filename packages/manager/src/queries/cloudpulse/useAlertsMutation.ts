import {
  type CloudPulseAlertsPayload,
  type CloudPulseServiceType,
  type DeepPartial,
  type Linode,
} from '@linode/api-v4';
import { useLinodeUpdateMutation } from '@linode/queries';

import { queryFactory } from './queries';

import type { Alert, LinodeAlerts } from '@linode/api-v4/lib/cloudpulse';
import type { QueryClient } from '@linode/queries';

/**
 * The alert type overrides for a given service type.
 * It contains the payload transformer function type and the response type.
 * This is used for types only, not to be used anywhere else.
 */
interface AlertTypeOverrides {
  linode: (basePayload: LinodeAlerts) => DeepPartial<Linode>;
  // Future overrides go here (e.g. dbaas, ...)
}

/**
 * The type of the payload transformer function for a given service type.
 */
type AlertPayloadTransformerFn<T extends CloudPulseServiceType> =
  T extends keyof AlertTypeOverrides
    ? AlertTypeOverrides[T]
    : (basePayload: CloudPulseAlertsPayload) => CloudPulseAlertsPayload;

/**
 * Type of the service payload transformer map
 */
export type ServicePayloadTransformerMap = Partial<{
  [K in CloudPulseServiceType]: AlertPayloadTransformerFn<K>;
}>;

/**
 * Service payload transformer map
 */
export const servicePayloadTransformerMap: ServicePayloadTransformerMap = {
  linode: (basePayload: LinodeAlerts) => ({ alerts: basePayload }),
  // Future transformers go here (e.g. dbaas, ...)
};

/**
 *
 * @param serviceType service type
 * @param entityId entity id
 * @returns alerts mutation
 */
export const useAlertsMutation = (
  serviceType: CloudPulseServiceType,
  entityId: string
) => {
  // linode api alerts mutation
  const { mutateAsync: updateLinode } = useLinodeUpdateMutation(
    Number(entityId)
  );

  switch (serviceType) {
    case 'linode':
      return updateLinode;
    default:
      return (_payload: CloudPulseAlertsPayload) =>
        Promise.reject(new Error('Error encountered'));
  }
};

/**
 * Invalidates the alerts cache
 * @param qc The query client
 * @param serviceType The service type
 * @param entityId The entity id
 * @param payload The payload
 */
export const invalidateAclpAlerts = (
  queryClient: QueryClient,
  serviceType: string,
  entityId: string | undefined,
  payload: CloudPulseAlertsPayload
) => {
  if (!entityId) return;

  const allAlerts = queryClient.getQueryData<Alert[]>(
    queryFactory.alerts._ctx.alertsByServiceType(serviceType).queryKey
  );

  // Get alerts previously enabled for this entity
  const oldEnabledAlertIds =
    allAlerts
      ?.filter((alert) => alert.entity_ids.includes(entityId))
      .map((alert) => alert.id) || [];

  // Combine enabled user and system alert IDs from payload
  const newEnabledAlertIds = [
    ...(payload.user_alerts ?? []),
    ...(payload.system_alerts ?? []),
  ];

  // Get unique list of all enabled alert IDs for cache invalidation
  const alertIdsToInvalidate = [...oldEnabledAlertIds, ...newEnabledAlertIds];

  queryClient.invalidateQueries({
    queryKey: queryFactory.alerts._ctx.all().queryKey,
  });

  queryClient.invalidateQueries({
    queryKey:
      queryFactory.alerts._ctx.alertsByServiceType(serviceType).queryKey,
  });

  alertIdsToInvalidate.forEach((alertId) => {
    queryClient.invalidateQueries({
      queryKey: queryFactory.alerts._ctx.alertByServiceTypeAndId(
        serviceType,
        String(alertId)
      ).queryKey,
    });
  });
};
