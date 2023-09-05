import React from 'react';
import { useHistory } from 'react-router-dom';

import { Action, ActionMenu } from 'src/components/ActionMenu';

import type { LoadBalancerHandlers } from './LoadBalancerRow';
import type { Loadbalancer } from '@linode/api-v4';

interface Props {
  handlers: LoadBalancerHandlers;
  loadbalancer: Loadbalancer;
}

export const LoadBalancerActionsMenu = ({ handlers, loadbalancer }: Props) => {
  const history = useHistory();

  const actions: Action[] = [
    {
      onClick: () =>
        history.push(`/loadbalancers/${loadbalancer.id}/configurations`),
      title: 'Configurations',
    },
    {
      onClick: () => history.push(`/loadbalancers/${loadbalancer.id}/settings`),
      title: 'Settings',
    },
    {
      onClick: handlers.onDelete,
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
