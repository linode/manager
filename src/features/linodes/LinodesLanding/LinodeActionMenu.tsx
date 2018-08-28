import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { lishLaunch } from 'src/features/Lish';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

import { powerOnLinode } from './powerActions';

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeBackups: Linode.LinodeBackups;
  linodeStatus: string;
  openConfigDrawer: (configs: Linode.Config[], fn: (id: number) => void) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
    linodeId: number, linodeLabel: string) => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class LinodeActionMenu extends React.Component<CombinedProps> {
  createLinodeActions = () => {
    const { linodeId, linodeLabel, linodeBackups, linodeStatus,
       openConfigDrawer, toggleConfirmation, history: { push } } = this.props;
    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Launch Console',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            lishLaunch(linodeId);
            e.preventDefault();
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
        actions.unshift(
          {
            title: 'Reboot',
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              e.preventDefault();
              toggleConfirmation('reboot', linodeId, linodeLabel);
              closeMenu();
            },
          },
          {
            title: 'Power Off',
            onClick: (e) => {
              toggleConfirmation('power_down', linodeId, linodeLabel);
              closeMenu();
            },
          }
        );
      }

      if (!linodeBackups.enabled) {
        actions.splice(-2, 1, {
          title: 'Enable Backups',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push({
              pathname: `/linodes/${linodeId}/backup`,
              state: { enableOnLoad: true }
            });
            e.preventDefault();
          },
        })
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
