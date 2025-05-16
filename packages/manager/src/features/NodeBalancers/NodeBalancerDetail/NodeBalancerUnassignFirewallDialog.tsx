import { useAllFirewallDevicesQuery, useFirewallQuery } from '@linode/queries';
import { createLazyRoute, useNavigate, useParams } from '@tanstack/react-router';
import React from 'react';

import { RemoveDeviceDialog } from 'src/features/Firewalls/FirewallDetail/Devices/RemoveDeviceDialog';

const NodeBalancerUnassignFirewallDialog = () => {
  const navigate = useNavigate();
  const { id, firewallId } = useParams({
    from: '/nodebalancers/$id/settings/unassign-firewall/$firewallId',
  });

  const {
    data: firewall,
    error: firewallError,
    isLoading: isLoadingFirewall,
  } = useFirewallQuery(firewallId);

  const { data: devices, isLoading: isLoadingDevices } =
    useAllFirewallDevicesQuery(firewallId);

  return (
    <RemoveDeviceDialog
      device={devices?.find(
        (device) =>
          device.entity.type === 'nodebalancer' && device.entity.id === id
      )}
      firewallError={firewallError}
      firewallId={firewallId}
      firewallLabel={firewall?.label ?? ''}
      isFetching={isLoadingFirewall || isLoadingDevices}
      onClose={() =>
        navigate({ to: '/nodebalancers/$id/settings', params: { id } })
      }
      onService
      open
    />
  );
};

export const nodeBalancerSettingsUnassignFirewallLazyRoute = createLazyRoute(
  '/nodebalancers/$id/settings/unassign-firewall/$firewallId'
)({
  component: NodeBalancerUnassignFirewallDialog,
});
