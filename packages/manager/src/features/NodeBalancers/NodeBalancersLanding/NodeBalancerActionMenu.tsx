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

    return (): Action[] => {
      const actions = [
        {
          title: 'Summary',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            history.push(`/nodebalancers/${nodeBalancerId}/summary`);
            e.preventDefault();
          }
        },
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
      return actions;
    };
  };

  render() {
    return (
      <ActionMenu
        createActions={this.createLinodeActions()}
        ariaLabel={`Action menu for NodeBalancer ${this.props.label}`}
      />
    );
  }
}

export default withRouter(NodeBalancerActionMenu);
