import {
  type CloudPulseAlertsPayload,
  type CloudPulseServiceType,
  type DeepPartial,
  type Linode,
} from '@linode/api-v4';
import { useLinodeUpdateMutation } from '@linode/queries';

import { queryFactory } from './queries';

import type { LinodeAlerts } from '@linode/api-v4/lib/cloudpulse';
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
 * @param queryClient The query client
 * @param serviceType The service type
 * @param entityId The entity id
 * @param payload The payload
 * @param alertEntityMap Map of alertId to entity IDs — used to determine which
 *   alerts were previously enabled for this entity so their caches can also be
 *   invalidated when they are now disabled.
 */
export const invalidateAclpAlerts = (
  queryClient: QueryClient,
  serviceType: string,
  entityId: string | undefined,
  payload: CloudPulseAlertsPayload,
  alertEntityMap?: Map<number, string[]>
) => {
  if (!entityId) return;

  // Find alerts that were previously enabled for this entity using the
  // caller-supplied alertEntityMap — avoids depending on the removed
  // entity_ids field on the Alert type.
  const oldEnabledAlertIds: number[] = [];
  if (alertEntityMap) {
    alertEntityMap.forEach((entityIds, alertId) => {
      if (entityIds.includes(entityId)) {
        oldEnabledAlertIds.push(alertId);
      }
    });
  }

  // Combine enabled user and system alert IDs from the new payload
  const newEnabledAlertIds = [
    ...(payload.user_alerts ?? []),
    ...(payload.system_alerts ?? []),
  ];

  // Deduplicated list of all alert IDs whose caches need invalidating
  const alertIdsToInvalidate = Array.from(
    new Set([...oldEnabledAlertIds, ...newEnabledAlertIds])
  );

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
