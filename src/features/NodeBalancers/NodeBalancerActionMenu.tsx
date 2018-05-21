import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  nodeBalancerId: number;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class LinodeActionMenu extends React.Component<CombinedProps> {
  createLinodeActions = () => {
    // const { nodeBalancerId } = this.props;

    return function (closeMenu: Function): Action[] {
      const actions = [
        {
          title: 'Configurations',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            closeMenu();
          },
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            closeMenu();
          },
        },
      ];
      return actions;
    };
  }

  render() {
    return (
      <ActionMenu createActions={this.createLinodeActions()} />
    );
  }
}

export default withRouter(LinodeActionMenu);
