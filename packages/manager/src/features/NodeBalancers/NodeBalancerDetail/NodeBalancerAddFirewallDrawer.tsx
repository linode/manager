import { Drawer } from '@linode/ui';
import { createLazyRoute, useNavigate, useParams } from '@tanstack/react-router';
import React from 'react';

import { AddFirewallForm } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeFirewalls/AddFirewallForm';

const NodeBalancerAddFirewallDrawer = () => {
  const { id } = useParams({
    from: '/nodebalancers/$id/settings/add-firewall',
  });
  const navigate = useNavigate();

  const onClose = () => {
    navigate({ to: '..' });
  };

  return (
    <Drawer onClose={onClose} open title="Add Firewall">
      <AddFirewallForm
        entityId={id}
        entityType="nodebalancer"
        onCancel={onClose}
      />
    </Drawer>
  );
};

export const nodeBalancerSettingsAddFirewallLazyRoute = createLazyRoute(
  '/nodebalancers/$id/settings/add-firewall'
)({
  component: NodeBalancerAddFirewallDrawer,
});
