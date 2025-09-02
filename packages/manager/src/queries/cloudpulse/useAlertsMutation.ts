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

import { ServicePayloadBuilder, servicePayloadMap, useServiceAlertsMutation } from './alerts';

import type { Alert } from '@linode/api-v4/lib/cloudpulse';
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
    Alert | Linode,
    APIError[],
    CloudPulseAlertsPayload | DeepPartial<Linode>
  >;
};

/**
 * Provides information about the mutation with onSuccess handler
 */
type MutationWithOnSuccess = UseMutationResult<
  Alert | Linode,
  APIError[],
  CloudPulseAlertsPayload | DeepPartial<Linode>
> & {
  onSuccess?: (
    data: Alert | Linode,
    variables: CloudPulseAlertsPayload | DeepPartial<Linode>
  ) => void;
};

/**
 * CloudPulse‐specific mutation builder.
 */
const aclpUseMutationHook: ServiceHookBuilder = {
  useHook: (
    ...args: ServiceHookArgs
  ): UseMutationResult<
    Alert | Linode,
    APIError[],
    CloudPulseAlertsPayload | DeepPartial<Linode>
  > => {
    const [serviceType, entityId] = args as [CloudPulseServiceType, string];

    return useServiceAlertsMutation(serviceType, entityId) as UseMutationResult<
      Alert | Linode,
      APIError[],
      CloudPulseAlertsPayload | DeepPartial<Linode>
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
      useLinodeUpdateMutation(id) as UseMutationResult<
        Alert | Linode,
        APIError[],
        CloudPulseAlertsPayload | DeepPartial<Linode>
      >,
    buildArgs: (_serviceType, entityId) => [Number(entityId)],
  },
};

export const useAlertsMutation = (
  serviceType: CloudPulseServiceType,
  entityId: string,
  payloadType: ServicePayloadBuilder
) => {
  const queryClient = useQueryClient();

  // Obtain the update hook for the service
  const serviceHookBuilder: ServiceHookBuilder =
    updateHookMap[serviceType] ?? aclpUseMutationHook;

  // Create the service-specific mutation
  const serviceMutation = serviceHookBuilder.useHook(
    ...serviceHookBuilder.buildArgs(serviceType, entityId)
  );

  // Wrap with the generic mutation
  return useMutation<>({
    mutationFn: (payload: ) =>
      serviceMutation.mutateAsync(payload),

    onSuccess: (data, payload) => {
      // Forward the success handler (if present) from the underlying mutation.
      (serviceMutation as MutationWithOnSuccess).onSuccess?.(
        data,
        servicePayloadMap[serviceType]?.(payload) ?? payload
      );
      invalidateAlerts(queryClient, serviceType, entityId, payload);
    },
  });
};
