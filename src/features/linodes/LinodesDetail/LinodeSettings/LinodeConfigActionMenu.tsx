import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class ConfigActionMenu extends React.Component<CombinedProps> {
  createConfigActions = () => (closeMenu: Function): Action[] => {
    const actions = [
      {
        title: 'Edit',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.props.onEdit();
          closeMenu();
        },
      },
      {
        title: 'Delete',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.props.onDelete();
          closeMenu();
        },
      },
    ];

    return actions;
  }

  render() {
    return (
      <ActionMenu createActions={this.createConfigActions()} />
    );
  }
}

export default withRouter(ConfigActionMenu);
