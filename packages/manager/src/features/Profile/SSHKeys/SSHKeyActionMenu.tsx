import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  id: number;
  label: string;
  onDelete: (id: number, label: string) => void;
}

type CombinedProps = Props;

class SSHKeyActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const { id, label, onDelete } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDelete(id, label);
            closeMenu();
            e.preventDefault();
          }
        }
      ];

      return actions;
    };
  };

  render() {
    return (
      <ActionMenu
        createActions={this.createActions()}
        ariaLabel={`Action menu for SSH Key ${this.props.label}`}
      />
    );
  }
}

export default SSHKeyActionMenu;
