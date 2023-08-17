import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu';

interface Props {
  loadBalancerId: number;
}

export const LoadBalancerActionsMenu = (props: Props) => {
  const { loadBalancerId } = props;

  const actions: Action[] = [
    {
      onClick: () => null,
      title: 'Configurations',
    },
    {
      onClick: () => null,
      title: 'Clone Load Balancer',
    },
    {
      onClick: () => null,
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
      ariaLabel={`Action menu for NodeBalancer ${loadBalancerId}`}
    />
  );
};
