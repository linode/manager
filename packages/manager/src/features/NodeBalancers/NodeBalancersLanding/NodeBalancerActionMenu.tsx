import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

import type { Theme } from '@mui/material/styles';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  label: string;
  nodeBalancerId: number;
  toggleDialog: (nodeBalancerId: number, label: string) => void;
}

export const NodeBalancerActionMenu = (props: Props) => {
  const theme = useTheme<Theme>();
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('lg'));
  const history = useHistory();

  const { label, nodeBalancerId, toggleDialog } = props;

  const isNodeBalancerReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'nodebalancer',
    id: nodeBalancerId,
  });

  const actions: Action[] = [
    {
      onClick: () => {
        history.push(`/nodebalancers/${nodeBalancerId}/configurations`);
      },
      title: 'Configurations',
    },
    {
      onClick: () => {
        history.push(`/nodebalancers/${nodeBalancerId}/settings`);
      },
      title: 'Settings',
    },
    {
      disabled: isNodeBalancerReadOnly,
      onClick: () => {
        toggleDialog(nodeBalancerId, label);
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
