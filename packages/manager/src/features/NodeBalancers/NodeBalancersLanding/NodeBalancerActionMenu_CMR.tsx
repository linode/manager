import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import InlineMenuAction from 'src/components/InlineMenuAction/InlineMenuAction';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import Hidden from 'src/components/core/Hidden';

const useStyles = makeStyles((theme: Theme) => ({
  inlineActions: {
    display: 'flex',
    alignItems: 'center'
  },
  link: {
    padding: '12px 10px'
  },
  action: {
    marginLeft: 10
  }
}));

interface Props {
  nodeBalancerId: number;
  toggleDialog: (nodeBalancerId: number, label: string) => void;
  label: string;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const NodeBalancerActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { nodeBalancerId, history, toggleDialog, label } = props;

  const createActions = () => {
    return (): Action[] => {
      const actions = [
        {
          title: 'Settings',
          onClick: () => {
            history.push(`/nodebalancers/${nodeBalancerId}/settings`);
          }
        },
        {
          title: 'Delete',
          onClick: () => {
            toggleDialog(nodeBalancerId, label);
          }
        }
      ];

      if (matchesSmDown) {
        actions.unshift(
          {
            title: 'Details',
            onClick: () => {
              history.push(`/nodebalancers/${nodeBalancerId}/summary`);
            }
          },
          {
            title: 'Configurations',
            onClick: () => {
              history.push(`/nodebalancers/${nodeBalancerId}/configurations`);
            }
          }
        );
      }

      return actions;
    };
  };

  const inlineActions = [
    {
      actionText: 'Details',
      href: `/nodebalancers/${nodeBalancerId}/summary`,
      className: classes.link
    },
    {
      actionText: 'Configurations',
      href: `/nodebalancers/${nodeBalancerId}/configurations`,
      className: classes.link
    }
  ];

  return (
    <>
      <Hidden smDown>
        {inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.actionText}
              actionText={action.actionText}
              href={action.href}
              className={action.className}
            />
          );
        })}
      </Hidden>
      <ActionMenu
        className={classes.action}
        createActions={createActions()}
        ariaLabel={`Action menu for NodeBalancer ${nodeBalancerId}`}
      />
    </>
  );
};

export default withRouter(NodeBalancerActionMenu);
