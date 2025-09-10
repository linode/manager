import {
  type CloudPulseAlertsPayload,
  type CloudPulseServiceType,
  type DeepPartial,
  type Linode,
} from '@linode/api-v4';
import { useLinodeUpdateMutation } from '@linode/queries';

import { useServiceAlertsMutation } from './alerts';

import type { LinodeAlerts } from '@linode/api-v4/lib/cloudpulse';

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
export const useAlertsMutation = <T extends CloudPulseServiceType>(
  serviceType: T,
  entityId: string
) => {
  // linode api alerts mutation
  const { mutateAsync: updateLinode } = useLinodeUpdateMutation(
    Number(entityId)
  );
  // cloudpulse api alerts mutation
  const { mutateAsync: updateServiceAlerts } = useServiceAlertsMutation(
    serviceType,
    entityId
  );

  switch (serviceType) {
    case 'linode':
      return updateLinode;
    default:
      return updateServiceAlerts;
  }
};
