import {
  type CloudPulseAlertsPayload,
  type CloudPulseServiceType,
  type DeepPartial,
  type Linode,
} from '@linode/api-v4';
import { useLinodeUpdateMutation } from '@linode/queries';
import {
  useMutation,
  type UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { invalidateAlerts } from 'src/features/CloudPulse/Alerts/Utils/utils';

import { useServiceAlertsMutation } from './alerts';

import type { Alert, LinodeAlerts } from '@linode/api-v4/lib/cloudpulse';
import type { APIError } from '@linode/api-v4/lib/types';

/**
 * Arguments that can be passed to a service‐specific mutation hook.
 * Currently we support either:
 *  • A tuple containing the service type and entity ID for CloudPulse alerts.
 *  • A tuple containing just the numeric entity ID for Linode alerts.
 */
type ServiceHookArgs = [CloudPulseServiceType, string] | [number];

/**
 * Provides information about how to build the arguments for a
 * mutation hook (such as `useServiceAlertsMutation` or `useLinodeUpdateMutation`)
 */
type ServiceHookBuilder = {
  buildArgs: (
    serviceType: CloudPulseServiceType,
    entityId: string
  ) => ServiceHookArgs;
  useHook: (
    ...args: ServiceHookArgs
  ) => UseMutationResult<
    AlertResponse<CloudPulseServiceType>,
    APIError[],
    AlertPayload<CloudPulseServiceType>
  >;
};

/**
 * Provides information about the mutation with onSuccess handler
 */
type MutationWithOnSuccess = UseMutationResult<
  AlertResponse<CloudPulseServiceType>,
  APIError[],
  AlertPayload<CloudPulseServiceType>
> & {
  onSuccess?: (
    data: AlertResponse<CloudPulseServiceType>,
    variables: AlertPayload<CloudPulseServiceType>
  ) => void;
};

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
 * The alert type overrides for a given service type.
 * It contains the payload transformer function type and the response type.
 * This is used for types only, not to be used anywhere else.
 */
interface AlertTypeOverrides {
  linode: {
    payloadTransformerFn: (payload: LinodeAlerts) => DeepPartial<Linode>;
    response: Linode;
  };
  // Future overrides go here (e.g. dbaas, ...)
}

/**
 * The type of the payload transformer function for a given service type.
 */
type AlertPayloadTransformerFn<T extends CloudPulseServiceType> =
  T extends keyof AlertTypeOverrides
    ? AlertTypeOverrides[T]['payloadTransformerFn']
    : (payload: CloudPulseAlertsPayload) => CloudPulseAlertsPayload;

/**
 * The payload type for a given service type.
 */
type AlertPayload<T extends CloudPulseServiceType> =
  T extends keyof AlertTypeOverrides
    ? ReturnType<AlertPayloadTransformerFn<T>>
    : CloudPulseAlertsPayload;

/**
 * The mutation response type for a given service type.
 */
type AlertResponse<T extends CloudPulseServiceType> =
  T extends keyof AlertTypeOverrides
    ? AlertTypeOverrides[T]['response']
    : Alert;

/**
 * CloudPulse‐specific mutation builder.
 */
const defaultCloudPulseUseMutationBuilder: ServiceHookBuilder = {
  useHook: (
    ...args: ServiceHookArgs
  ): UseMutationResult<
    AlertResponse<CloudPulseServiceType>,
    APIError[],
    AlertPayload<CloudPulseServiceType>
  > => {
    const [serviceType, entityId] = args as [CloudPulseServiceType, string];

    return useServiceAlertsMutation(serviceType, entityId) as UseMutationResult<
      AlertResponse<CloudPulseServiceType>,
      APIError[],
      AlertPayload<CloudPulseServiceType>
    >;
  },
  buildArgs: (serviceType: CloudPulseServiceType, id: string) => [
    serviceType,
    id,
  ],
};

/**
 * CloudPulse service type to service mutation hook builder map
 */
const updateHookMap: Partial<
  Record<CloudPulseServiceType, ServiceHookBuilder>
> = {
  linode: {
    useHook: (id: number) =>
      useLinodeUpdateMutation(id) satisfies UseMutationResult<
        AlertResponse<'linode'>,
        APIError[],
        AlertPayload<'linode'>
      >,
    buildArgs: (_serviceType, entityId) => [Number(entityId)],
  },
};

export const useAlertsMutation = <T extends CloudPulseServiceType>(
  serviceType: T,
  entityId: string
) => {
  const queryClient = useQueryClient();

  // Obtain the update hook for the service or fall back to the default CloudPulse
  // alerts mutation builder.
  const serviceHookBuilder =
    updateHookMap[serviceType] ?? defaultCloudPulseUseMutationBuilder;

  // Create the service-specific mutation
  const serviceMutation = serviceHookBuilder.useHook(
    ...serviceHookBuilder.buildArgs(serviceType, entityId)
  );

  return useMutation<AlertResponse<T>, APIError[], AlertPayload<T>>({
    mutationFn: (payload: AlertPayload<T>) =>
      // mutateAsync is well-typed for the specific service mutation.
      // The explicit cast satisfies the generic parameter.
      serviceMutation.mutateAsync(payload) as Promise<AlertResponse<T>>,
    onSuccess: (data, payload: AlertPayload<T>) => {
      // Forward the success handler (if present) from the underlying mutation.
      (serviceMutation as MutationWithOnSuccess).onSuccess?.(data, payload);

      // Derive the original CloudPulseAlertsPayload for cache invalidation.
      const invalidatePayload: CloudPulseAlertsPayload =
        serviceType === 'linode'
          ? // In the linode service, payload is DeepPartial<Linode>; extract its alerts.
            ((payload as DeepPartial<Linode>).alerts as CloudPulseAlertsPayload)
          : (payload as CloudPulseAlertsPayload);

      invalidateAlerts(queryClient, serviceType, entityId, invalidatePayload);
    },
  });
};
