import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import { RouteComponentProps, withRouter } from 'react-router-dom';

import { lishLaunch } from 'src/features/Lish';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

import { powerOnLinode } from './powerActions';

import {
  sendLinodeActionEvent,
  sendLinodeActionMenuItemEvent
} from 'src/utilities/ga';

import { getLinodeConfigs } from 'src/services/linodes';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector.ts';
import { MapState } from 'src/store/types';

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

type CombinedProps = Props & RouteComponentProps<{}> & StateProps;

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

    sendLinodeActionEvent();
  };

  createLinodeActions = () => {
    const {
      linodeId,
      linodeLabel,
      linodeBackups,
      linodeStatus,
      openConfigDrawer,
      toggleConfirmation,
      history: { push },
      readOnly
    } = this.props;
    const { configs, hasMadeConfigsRequest } = this.state;

    const readOnlyProps = readOnly
      ? {
          disabled: true,
          tooltip: readOnly && "You don't have permission to modify this Linode"
        }
      : {};

    const noConfigs = hasMadeConfigsRequest && configs.length === 0;

    return (closeMenu: Function): Action[] => {
      const actions: Action[] = [
        {
          title: 'Launch Console',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Launch Console');
            lishLaunch(linodeId);
            e.preventDefault();
            e.stopPropagation();
          },
          ...readOnlyProps
        },
        {
          title: 'View Graphs',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('View Linode Graphs');
            push(`/linodes/${linodeId}/summary`);
            e.preventDefault();
            e.stopPropagation();
          }
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Navigate to Resize Page');
            push(`/linodes/${linodeId}/resize`);
            e.preventDefault();
            e.stopPropagation();
          },
          ...readOnlyProps
        },
        {
          title: 'View Backups',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Navigate to Backups Page');
            push(`/linodes/${linodeId}/backup`);
            e.preventDefault();
            e.stopPropagation();
          }
        },
        {
          title: 'Settings',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Navigate to Settings Page');
            push(`/linodes/${linodeId}/settings`);
            e.preventDefault();
            e.stopPropagation();
          }
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Delete Linode');
            e.preventDefault();
            e.stopPropagation();
            toggleConfirmation('delete', linodeId, linodeLabel);
            closeMenu();
          },
          ...readOnlyProps
        }
      ];

      if (linodeStatus === 'offline') {
        actions.unshift({
          title: 'Power On',
          disabled: !hasMadeConfigsRequest || noConfigs || readOnly,
          isLoading: !hasMadeConfigsRequest,
          tooltip: this.state.configsError
            ? 'Could not load configs for this Linode'
            : noConfigs
            ? 'A config needs to be added before powering on a Linode'
            : readOnly
            ? "You don't have permission to modify this Linode"
            : undefined,
          onClick: e => {
            sendLinodeActionMenuItemEvent('Power On Linode');
            powerOnLinode(openConfigDrawer, linodeId, linodeLabel);
            closeMenu();
          }
        });
      }

      if (linodeStatus === 'running') {
        actions.unshift(
          {
            title: 'Reboot',
            disabled: readOnly,
            tooltip: readOnly
              ? "You don't have permission to modify this Linode."
              : undefined,
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              sendLinodeActionMenuItemEvent('Reboot Linode');
              e.preventDefault();
              e.stopPropagation();
              toggleConfirmation('reboot', linodeId, linodeLabel);
              closeMenu();
            },
            ...readOnlyProps
          },
          {
            title: 'Power Off',
            onClick: e => {
              sendLinodeActionMenuItemEvent('Power Off Linode');
              e.preventDefault();
              e.stopPropagation();
              toggleConfirmation('power_down', linodeId, linodeLabel);
              closeMenu();
            },
            ...readOnlyProps
          }
        );
      }

      if (!linodeBackups.enabled) {
        actions.splice(-2, 1, {
          title: 'Enable Backups',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Enable Backups');
            push({
              pathname: `/linodes/${linodeId}/backup`,
              state: { enableOnLoad: true }
            });
            e.preventDefault();
            e.stopPropagation();
          },
          ...readOnlyProps
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

interface StateProps {
  readOnly: boolean;
}

const mapStateToProps: MapState<StateProps, CombinedProps> = (
  state,
  ownProps
) => ({
  readOnly:
    getPermissionsForLinode(
      pathOr(null, ['__resources', 'profile', 'data'], state),
      ownProps.linodeId
    ) === 'read_only'
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, Props>(
  connected,
  withRouter
);

export default enhanced(LinodeActionMenu);
