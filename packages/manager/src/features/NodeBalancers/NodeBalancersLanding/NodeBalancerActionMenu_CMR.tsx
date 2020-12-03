import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import InlineMenuAction from 'src/components/InlineMenuAction';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import Hidden from 'src/components/core/Hidden';

const useStyles = makeStyles(() => ({
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

  const createActions = () => (): Action[] => {
    return [
      {
        title: 'Configurations',
        onClick: () => {
          history.push(`/nodebalancers/${nodeBalancerId}/configurations`);
        }
      },
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
  };

  const inlineActions = [
    {
      actionText: 'Configurations',
      href: `/nodebalancers/${nodeBalancerId}/configurations`,
      className: classes.link
    },
    {
      actionText: 'Settings',
      href: `/nodebalancers/${nodeBalancerId}/settings`,
      className: classes.link
    },
    {
      actionText: 'Delete',
      onClick: () => {
        toggleDialog(nodeBalancerId, label);
      },
      className: classes.link
    }
  ];

  return (
    <>
      {!matchesSmDown &&
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.actionText}
              actionText={action.actionText}
              className={action.className}
              href={action.href}
              onClick={action.onClick}
            />
          );
        })}
      <Hidden mdUp>
        <ActionMenu
          className={classes.action}
          createActions={createActions()}
          ariaLabel={`Action menu for NodeBalancer ${nodeBalancerId}`}
        />
      </Hidden>
    </>
  );
};

export default withRouter(NodeBalancerActionMenu);
