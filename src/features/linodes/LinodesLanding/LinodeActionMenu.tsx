import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import { rebootLinode, powerOffLinode, powerOnLinode } from './powerActions';

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeStatus: string;
  openConfigDrawer: (configs: Linode.Config[], fn: (id: number) => void) => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class LinodeActionMenu extends React.Component<CombinedProps> {
  createLinodeActions = () => {
    const { linodeId, linodeLabel, linodeStatus, openConfigDrawer, history: { push } } = this.props;

    return function (closeMenu: Function): Action[] {
      const actions = [
        {
          title: 'Launch Console',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linodeId}/glish`);
            e.preventDefault();
          },
        },
        {
          title: 'Reboot',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            rebootLinode(openConfigDrawer, linodeId, linodeLabel);
            closeMenu();
          },
        },
        {
          title: 'View Graphs',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linodeId}/summary`);
            e.preventDefault();
          },
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linodeId}/resize`);
            e.preventDefault();
          },
        },
        {
          title: 'View Backups',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linodeId}/backup`);
            e.preventDefault();
          },
        },
        {
          title: 'Settings',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linodeId}/settings`);
            e.preventDefault();
          },
        },
      ];

      if (linodeStatus === 'offline') {
        actions.unshift({
          title: 'Power On',
          onClick: (e) => {
            powerOnLinode(openConfigDrawer, linodeId, linodeLabel);
            closeMenu();
          },
        });
      }

      if (linodeStatus === 'running') {
        actions.unshift({
          title: 'Power Off',
          onClick: (e) => {
            powerOffLinode(linodeId, linodeLabel);
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
