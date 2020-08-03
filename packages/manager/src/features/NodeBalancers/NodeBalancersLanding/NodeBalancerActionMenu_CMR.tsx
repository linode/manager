import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import InlineMenuAction from 'src/components/InlineMenuAction/InlineMenuAction';
import { makeStyles, Theme } from 'src/components/core/styles';

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

  const { nodeBalancerId, history, toggleDialog, label } = props;

  const createActions = () => {
    return (): Action[] => {
      return [
        {
          title: 'Configurations',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            history.push(`/nodebalancers/${nodeBalancerId}/configurations`);
            e.preventDefault();
          }
        },
        {
          title: 'Settings',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            history.push(`/nodebalancers/${nodeBalancerId}/settings`);
            e.preventDefault();
          }
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            toggleDialog(nodeBalancerId, label);
          }
        }
      ];
    };
  };

  const inlineActions = [
    {
      actionText: 'Details',
      href: `/nodebalancers/${nodeBalancerId}/summary`,
      className: classes.link
    }
  ];

  return (
    <>
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
      <ActionMenu
        className={classes.action}
        createActions={createActions()}
        ariaLabel={`Action menu for NodeBalancer ${nodeBalancerId}`}
      />
    </>
  );
};

export default withRouter(NodeBalancerActionMenu);
