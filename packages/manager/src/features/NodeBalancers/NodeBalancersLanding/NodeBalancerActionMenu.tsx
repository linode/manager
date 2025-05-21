import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  nodeBalancerId: number;
}

export const NodeBalancerActionMenu = (props: Props) => {
  const navigate = useNavigate();

  const { nodeBalancerId } = props;

  const isNodeBalancerReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'nodebalancer',
    id: nodeBalancerId,
  });

  const actions: Action[] = [
    {
      onClick: () => {
        navigate({
          params: {
            id: String(nodeBalancerId),
          },
          to: `/nodebalancers/$id/configurations`,
        });
      },
      title: 'Configurations',
    },
    {
      onClick: () => {
        navigate({
          params: {
            id: String(nodeBalancerId),
          },
          to: `/nodebalancers/$id/settings`,
        });
      },
      title: 'Settings',
    },
    {
      disabled: isNodeBalancerReadOnly,
      onClick: () => {
        navigate({
          params: {
            id: String(nodeBalancerId),
          },
          to: `/nodebalancers/$id/delete`,
        });
      },
      title: 'Delete',
      tooltip: isNodeBalancerReadOnly
        ? getRestrictedResourceText({
            action: 'delete',
            resourceType: 'NodeBalancers',
          })
        : undefined,
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for NodeBalancer ${nodeBalancerId}`}
    />
  );
};
