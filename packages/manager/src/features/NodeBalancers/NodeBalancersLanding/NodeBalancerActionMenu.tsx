import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';

import { useIsNodebalancerVPCEnabled } from '../utils';

import type { Theme } from '@mui/material/styles';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  nodeBalancerId: number;
}

export const NodeBalancerActionMenu = (props: Props) => {
  const navigate = useNavigate();
  const theme = useTheme<Theme>();
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('lg'));

  const { nodeBalancerId } = props;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const { data: permissions, isLoading } = usePermissions(
    'nodebalancer',
    ['delete_nodebalancer'],
    nodeBalancerId,
    isOpen
  );

  const { premiumNodebalancer } = useFlags();
  const { isNodebalancerVPCEnabled } = useIsNodebalancerVPCEnabled();

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
      pendoId: 'NodeBalancers Landing-Configurations',
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
      pendoId: 'NodeBalancers Landing-Settings',
      title: 'Settings',
    },
    {
      hidden: !premiumNodebalancer,
      onClick: () => {
        navigate({
          params: {
            id: String(nodeBalancerId),
          },
          to: `/nodebalancers/$id/metrics`,
        });
      },
      pendoId: 'NodeBalancers Landing-Metrics',
      title: 'Metrics',
    },
    {
      disabled: !permissions.delete_nodebalancer,
      onClick: () => {
        navigate({
          params: {
            id: String(nodeBalancerId),
          },
          to: `/nodebalancers/$id/delete`,
        });
      },
      pendoId: 'NodeBalancers Landing-Delete',
      title: 'Delete',
      tooltip: !permissions.delete_nodebalancer
        ? getRestrictedResourceText({
            action: 'delete',
            resourceType: 'NodeBalancers',
          })
        : undefined,
    },
  ];

  const isInlineMenuEnabled = !matchesMdDown && !isNodebalancerVPCEnabled;

  if (isInlineMenuEnabled) {
    return actions.map((action) => {
      return (
        <InlineMenuAction
          actionText={action.title}
          disabled={action.disabled}
          key={action.title}
          onClick={action.onClick}
          tooltip={action.tooltip}
        />
      );
    });
  }
  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for NodeBalancer ${nodeBalancerId}`}
      loading={isLoading}
      onOpen={() => setIsOpen(true)}
      pendoId="NodeBalancers Landing-Action Menu"
    />
  );
};
