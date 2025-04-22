import {
  firewallQueries,
  linodeQueries,
  useAddFirewallDeviceMutation,
  useRemoveFirewallDeviceMutation,
} from '@linode/queries';
import { ModifyLinodeInterfaceSchema } from '@linode/validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { number } from 'yup';

import type { APIError, Firewall } from '@linode/api-v4';

export const EditLinodeInterfaceFormSchema = ModifyLinodeInterfaceSchema.shape({
  firewall_id: number().nullable(),
});

export const useUpdateLinodeInterfaceFirewallMutation = (
  linodeId: number,
  interfaceId: number
) => {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteFirewallDevice } =
    useRemoveFirewallDeviceMutation();
  const { mutateAsync: createFirewallDevice } = useAddFirewallDeviceMutation();

  return useMutation<
    false | null | number, // Null means the firewall was removed, false means nothing changed, number means firewall was set to that Firewall ID
    APIError[],
    { firewall_id: null | number | undefined }
  >({
    async mutationFn({ firewall_id }) {
      // Get the interfaces Firewalls
      const interfaceFirewalls = await queryClient.ensureQueryData(
        linodeQueries
          .linode(linodeId)
          ._ctx.interfaces._ctx.interface(interfaceId)._ctx.firewalls
      );

      // For now, assume the first Firewall is the Interface's firewall.
      // (we are not supporting multiple firewalls per interface right now)
      const currentFirewall = interfaceFirewalls.data[0] as
        | Firewall
        | undefined;

      // 1. User is changing the firewall
      if (
        firewall_id &&
        currentFirewall &&
        firewall_id !== currentFirewall.id
      ) {
        // Fetch the current Firewall's devices so we can find the Device ID to delete.
        const devices = await queryClient.ensureQueryData(
          firewallQueries.firewall(currentFirewall.id)._ctx.devices
        );
        // Find the Firewall device by checking the entity
        const device = devices.find(
          (d) => d.entity.id === interfaceId && d.entity.type === 'interface'
        );
        if (device) {
          await deleteFirewallDevice({
            firewallId: currentFirewall.id,
            deviceId: device.id,
          });
          await createFirewallDevice({
            firewallId: firewall_id,
            id: interfaceId,
            type: 'interface',
          });
        } else {
          return Promise.reject([
            { reason: "Unable to find this Interface's Firewall device." },
          ]);
        }
        return firewall_id;
      }

      // 2. Interface does not have a Firewall and the user is assigning one
      if (!currentFirewall && firewall_id) {
        await createFirewallDevice({
          firewallId: firewall_id,
          id: interfaceId,
          type: 'interface',
        });

        return firewall_id;
      }

      // 3. Interface has a firewall and the user is removing it
      if (currentFirewall && !firewall_id) {
        // Fetch the current Firewall's devices so we can find the Device ID to delete.
        const devices = await queryClient.ensureQueryData(
          firewallQueries.firewall(currentFirewall.id)._ctx.devices
        );
        // Find the Firewall device by checking the entity
        const device = devices.find(
          (d) => d.entity.id === interfaceId && d.entity.type === 'interface'
        );
        if (device) {
          await deleteFirewallDevice({
            firewallId: currentFirewall.id,
            deviceId: device.id,
          });
        } else {
          return Promise.reject([
            { reason: "Unable to find this Interface's Firewall device." },
          ]);
        }

        return null;
      }

      return false;
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: linodeQueries
          .linode(linodeId)
          ._ctx.interfaces._ctx.interface(interfaceId)._ctx.firewalls.queryKey,
      });
    },
  });
};
