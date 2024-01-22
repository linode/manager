import { Theme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { useGrants } from 'src/queries/profile';
interface Props {
  label: string;
  nodeBalancerId: number;
  toggleDialog: (nodeBalancerId: number, label: string) => void;
}

export const NodeBalancerActionMenu = (props: Props) => {
  const theme = useTheme<Theme>();
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('lg'));

  const history = useHistory();
  const { data: grants } = useGrants();

  const { label, nodeBalancerId, toggleDialog } = props;
  const isRestricted = grants?.nodebalancer?.[0]?.permissions === 'read_only';

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
      disabled: isRestricted,
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
              disabled={action.disabled}
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
