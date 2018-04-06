import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import { rebootLinode, powerOffLinode, powerOnLinode } from './powerActions';

interface Props {
  linode: Linode.Linode;
  openConfigDrawer: (configs: Linode.Config[], fn: (id: number) => void) => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class LinodeActionMenu extends React.Component<CombinedProps> {
  createLinodeActions = () => {
    const { linode, openConfigDrawer, history: { push } } = this.props;

    return function (closeMenu: Function): Action[] {
      const actions = [
        {
          title: 'Launch Console',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linode.id}/glish`);
            e.preventDefault();
          },
        },
        {
          title: 'Reboot',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            rebootLinode(openConfigDrawer, linode.id, linode.label);
            closeMenu();
          },
        },
        {
          title: 'View Graphs',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linode.id}/summary`);
            e.preventDefault();
          },
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linode.id}/resize`);
            e.preventDefault();
          },
        },
        {
          title: 'View Backups',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linode.id}/backups`);
            e.preventDefault();
          },
        },
        {
          title: 'Settings',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linode.id}/settings`);
            e.preventDefault();
          },
        },
      ];

      if (linode.status === 'offline') {
        actions.unshift({
          title: 'Power On',
          onClick: (e) => {
            powerOnLinode(openConfigDrawer, linode.id, linode.label);
            closeMenu();
          },
        });
      }

      if (linode.status === 'running') {
        actions.unshift({
          title: 'Power Off',
          onClick: (e) => {
            powerOffLinode(linode.id, linode.label);
            closeMenu();
          },
        });
      }

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
