import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import Hidden from 'src/components/core/Hidden';
import { useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import InlineMenuAction from 'src/components/InlineMenuAction';

interface Props {
  nodeBalancerId: number;
  toggleDialog: (nodeBalancerId: number, label: string) => void;
  label: string;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const NodeBalancerActionMenu: React.FC<CombinedProps> = (props) => {
  const theme = useTheme<Theme>();
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('lg'));

  const { nodeBalancerId, history, toggleDialog, label } = props;

  const actions: Action[] = [
    {
      title: 'Configurations',
      onClick: () => {
        history.push(`/nodebalancers/${nodeBalancerId}/configurations`);
      },
    },
    {
      title: 'Settings',
      onClick: () => {
        history.push(`/nodebalancers/${nodeBalancerId}/settings`);
      },
    },
    {
      title: 'Delete',
      onClick: () => {
        toggleDialog(nodeBalancerId, label);
      },
    },
  ];

  return (
    <>
      {!matchesMdDown &&
        actions.map((action) => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
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

export default withRouter(NodeBalancerActionMenu);
