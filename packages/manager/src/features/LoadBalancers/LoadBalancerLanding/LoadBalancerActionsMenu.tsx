import React from 'react';
import { useHistory } from 'react-router-dom';

import { Action, ActionMenu } from 'src/components/ActionMenu';

import type { Loadbalancer } from '@linode/api-v4';

interface Props {
  loadbalancer: Loadbalancer;
}

export const LoadBalancerActionsMenu = ({ loadbalancer }: Props) => {
  const history = useHistory();

  const actions: Action[] = [
    {
      onClick: () =>
        history.push(`/loadbalancers/${loadbalancer.id}/configurations`),
      title: 'Configurations',
    },
    {
      onClick: () => null,
      title: 'Clone Load Balancer',
    },
    {
      onClick: () => history.push(`/loadbalancers/${loadbalancer.id}/settings`),
      title: 'Settings',
    },
    {
      onClick: () => null,
      title: 'Delete',
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Load Balancer ${loadbalancer.label}`}
    />
  );
};
