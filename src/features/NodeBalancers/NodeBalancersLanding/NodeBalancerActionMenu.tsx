import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  nodeBalancerId: number;
  toggleDialog: (nodeBalancerId: number, label: string) => void;
  label: string;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class NodeBalancerActionMenu extends React.Component<CombinedProps> {
  createLinodeActions = () => {
    const { nodeBalancerId, history, toggleDialog, label } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Summary',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            history.push(`/nodebalancers/${nodeBalancerId}/summary`);
            e.preventDefault();
            closeMenu();
          }
        },
        {
          title: 'Configurations',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            history.push(`/nodebalancers/${nodeBalancerId}/configurations`);
            e.preventDefault();
            closeMenu();
          }
        },
        {
          title: 'Settings',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            history.push(`/nodebalancers/${nodeBalancerId}/settings`);
            e.preventDefault();
            closeMenu();
          }
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            toggleDialog(nodeBalancerId, label);
            closeMenu();
          }
        }
      ];
      return actions;
    };
  };

  render() {
    return <ActionMenu createActions={this.createLinodeActions()} />;
  }
}

export default withRouter(NodeBalancerActionMenu);
