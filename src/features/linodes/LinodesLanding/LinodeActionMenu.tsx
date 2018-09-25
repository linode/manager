import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { lishLaunch } from 'src/features/Lish';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

import { powerOnLinode } from './powerActions';

import { sendEvent } from 'src/utilities/analytics';

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
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'Launch Console',
            })
            lishLaunch(linodeId);
            e.preventDefault();
          },
        },
        {
          title: 'View Graphs',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'View Linode Graphs',
            })
            push(`/linodes/${linodeId}/summary`);
            e.preventDefault();
          },
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'Navigate to Resize Page',
            })
            push(`/linodes/${linodeId}/resize`);
            e.preventDefault();
          },
        },
        {
          title: 'View Backups',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'Navigate to Backups Page',
            })
            push(`/linodes/${linodeId}/backup`);
            e.preventDefault();
          },
        },
        {
          title: 'Settings',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'Navigate to Settings Page',
            })
            push(`/linodes/${linodeId}/settings`);
            e.preventDefault();
          },
        },
      ];

      if (linodeStatus === 'offline') {
        actions.unshift({
          title: 'Power On',
          onClick: (e) => {
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'Power On Linode',
            })
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
              sendEvent({
                category: 'Linode Action Menu Item',
                action: 'Reboot Linode',
              })
              e.preventDefault();
              toggleConfirmation('reboot', linodeId, linodeLabel);
              closeMenu();
            },
          },
          {
            title: 'Power Off',
            onClick: (e) => {
              sendEvent({
                category: 'Linode Action Menu Item',
                action: 'Power Off Linode',
              })
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
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'Enable Backups',
            })
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
      <ActionMenu
        toggleOpenCallback={toggleOpenActionMenu}
        createActions={this.createLinodeActions()}
      />
    );
  }
}

const toggleOpenActionMenu = () => {
  sendEvent({
    category: 'Linode Action Menu',
    action: 'Open Action Menu',
  })
}

export default withRouter(LinodeActionMenu);
