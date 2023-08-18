import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Action, ActionMenu } from 'src/components/ActionMenu';

interface Props {
  loadBalancerId: number;
}

export const LoadBalancerActionsMenu = (props: Props) => {
  const { loadBalancerId } = props;
  const history = useHistory();

  const actions: Action[] = [
    {
      onClick: () =>
        history.push(`/loadbalancers/${loadBalancerId}/configurations`),
      title: 'Configurations',
    },
    {
      onClick: () => null,
      title: 'Clone Load Balancer',
    },
    {
      onClick: () => history.push(`/loadbalancers/${loadBalancerId}/settings`),
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
