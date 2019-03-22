import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { lishLaunch } from 'src/features/Lish';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

import { powerOnLinode } from './powerActions';

import { sendEvent } from 'src/utilities/analytics';

import { getLinodeConfigs } from 'src/services/linodes';

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeBackups: Linode.LinodeBackups;
  linodeStatus: string;
  noImage: boolean;
  openConfigDrawer: (
    configs: Linode.Config[],
    fn: (id: number) => void
  ) => void;
  toggleConfirmation: (
    bootOption: Linode.KebabAction,
    linodeId: number,
    linodeLabel: string
  ) => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

interface State {
  configs: Linode.Config[];
  hasMadeConfigsRequest: boolean;
  configsError?: Linode.ApiFieldError[];
}

class LinodeActionMenu extends React.Component<CombinedProps, State> {
  state: State = {
    configs: [],
    hasMadeConfigsRequest: false,
    configsError: undefined
  };

  toggleOpenActionMenu = () => {
    getLinodeConfigs(this.props.linodeId)
      .then(configs => {
        this.setState({
          configs: configs.data,
          hasMadeConfigsRequest: true,
          configsError: undefined
        });
      })
      .catch(err => {
        this.setState({ hasMadeConfigsRequest: true, configsError: err });
      });

    sendEvent({
      category: 'Linode Action Menu',
      action: 'Open Action Menu'
    });
  };

  createLinodeActions = () => {
    const {
      linodeId,
      linodeLabel,
      linodeBackups,
      linodeStatus,
      openConfigDrawer,
      toggleConfirmation,
      history: { push }
    } = this.props;
    const { configs, hasMadeConfigsRequest } = this.state;

    const noConfigs = hasMadeConfigsRequest && configs.length === 0;

    return (closeMenu: Function): Action[] => {
      const actions: Action[] = [
        {
          title: 'Launch Console',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'Launch Console'
            });
            lishLaunch(linodeId);
            e.preventDefault();
            e.stopPropagation();
          }
        },
        {
          title: 'View Graphs',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'View Linode Graphs'
            });
            push(`/linodes/${linodeId}/summary`);
            e.preventDefault();
            e.stopPropagation();
          }
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'Navigate to Resize Page'
            });
            push(`/linodes/${linodeId}/resize`);
            e.preventDefault();
            e.stopPropagation();
          }
        },
        {
          title: 'View Backups',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'Navigate to Backups Page'
            });
            push(`/linodes/${linodeId}/backup`);
            e.preventDefault();
            e.stopPropagation();
          }
        },
        {
          title: 'Settings',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'Navigate to Settings Page'
            });
            push(`/linodes/${linodeId}/settings`);
            e.preventDefault();
            e.stopPropagation();
          }
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'Delete Linode'
            });
            e.preventDefault();
            e.stopPropagation();
            toggleConfirmation('delete', linodeId, linodeLabel);
            closeMenu();
          }
        }
      ];

      if (linodeStatus === 'offline') {
        actions.unshift({
          title: 'Power On',
          disabled: !hasMadeConfigsRequest || noConfigs,
          isLoading: !hasMadeConfigsRequest,
          tooltip: this.state.configsError
            ? 'Could not load configs for this Linode'
            : noConfigs
            ? 'A config needs to be added before powering on a Linode'
            : undefined,
          onClick: e => {
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'Power On Linode'
            });
            powerOnLinode(openConfigDrawer, linodeId, linodeLabel);
            closeMenu();
          }
        });
      }

      if (linodeStatus === 'running') {
        actions.unshift(
          {
            title: 'Reboot',
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              sendEvent({
                category: 'Linode Action Menu Item',
                action: 'Reboot Linode'
              });
              e.preventDefault();
              e.stopPropagation();
              toggleConfirmation('reboot', linodeId, linodeLabel);
              closeMenu();
            }
          },
          {
            title: 'Power Off',
            onClick: e => {
              sendEvent({
                category: 'Linode Action Menu Item',
                action: 'Power Off Linode'
              });
              e.preventDefault();
              e.stopPropagation();
              toggleConfirmation('power_down', linodeId, linodeLabel);
              closeMenu();
            }
          }
        );
      }

      if (!linodeBackups.enabled) {
        actions.splice(-2, 1, {
          title: 'Enable Backups',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendEvent({
              category: 'Linode Action Menu Item',
              action: 'Enable Backups'
            });
            push({
              pathname: `/linodes/${linodeId}/backup`,
              state: { enableOnLoad: true }
            });
            e.preventDefault();
            e.stopPropagation();
          }
        });
      }

      return actions;
    };
  };

  render() {
    return (
      <ActionMenu
        toggleOpenCallback={this.toggleOpenActionMenu}
        createActions={this.createLinodeActions()}
      />
    );
  }
}

export default withRouter(LinodeActionMenu);
