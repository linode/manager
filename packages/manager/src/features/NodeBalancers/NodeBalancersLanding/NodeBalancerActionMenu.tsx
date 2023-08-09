import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu, Action } from 'src/components/ActionMenu';
import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

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
      onClick: () => {
        toggleDialog(nodeBalancerId, label);
      },
      title: 'Delete',
    },
  ];

  return (
    <>
      {!matchesMdDown &&
        actions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              key={action.title}
              onClick={action.onClick}
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
