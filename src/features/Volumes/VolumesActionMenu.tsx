import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onShowConfig: () => void;
  onEdit: () => void;
  onResize: () => void;
  onClone: () => void;
  attached: boolean;
  onAttach: () => void;
  onDetach: () => void;
  poweredOff: boolean;
  onDelete: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class VolumesActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const {
      onShowConfig,
      onEdit,
      onResize,
      onClone,
      attached,
      onAttach,
      onDetach,
      poweredOff,
      onDelete,
    } = this.props;

    return function (closeMenu: Function): Action[] {
      const actions = [
        {
          title: 'Show Configuration',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onShowConfig();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Edit Label',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onEdit();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onResize();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Clone',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onClone();
            closeMenu();
            e.preventDefault();
          },
        },
      ];

      if (!attached) {
        actions.push({
          title: 'Attach',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onAttach();
            closeMenu();
            e.preventDefault();
          },
        });
      } else {
        actions.push({
          title: 'Detach',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDetach();
            closeMenu();
            e.preventDefault();
          },
        });
      }

      if ((!attached) || poweredOff) {
        actions.push({
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDelete();
            closeMenu();
            e.preventDefault();
          },
        });
      }

      return actions;
    };
  }

  render() {
    return (
      <ActionMenu createActions={this.createActions()} />
    );
  }
}

export default withRouter(VolumesActionMenu);
