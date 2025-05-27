import { Hidden } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

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
            id: nodeBalancerId,
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
            id: nodeBalancerId,
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
            id: nodeBalancerId,
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
    <>
      {!matchesMdDown &&
        actions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              disabled={action.disabled}
              key={action.title}
              onClick={action.onClick}
              tooltip={action.tooltip}
            />
          );
        })}
      <Hidden lgUp>
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for NodeBalancer ${nodeBalancerId}`}
        />
      </Hidden>
    </>
  );
};
