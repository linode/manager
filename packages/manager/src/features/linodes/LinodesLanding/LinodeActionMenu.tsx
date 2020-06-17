import {
  Config,
  getLinodeConfigs,
  LinodeBackups
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { stringify } from 'qs';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import { RouteComponentProps, withRouter } from 'react-router-dom';

import { lishLaunch } from 'src/features/Lish/lishUtils';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

import {
  sendLinodeActionEvent,
  sendLinodeActionMenuItemEvent
} from 'src/utilities/ga';

import regionsContainer, {
  DefaultProps as WithRegionsProps
} from 'src/containers/regions.container';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector.ts';
import { MapState } from 'src/store/types';

import { Action as BootAction } from 'src/features/linodes/PowerActionsDialogOrDrawer';

import { sendMigrationNavigationEvent } from 'src/utilities/ga';

export interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
  linodeType: string | null;
  linodeBackups: LinodeBackups;
  linodeStatus: string;
  noImage: boolean;
  openDeleteDialog: (linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: BootAction,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
}

export type CombinedProps = Props &
  RouteComponentProps<{}> &
  StateProps &
  WithTypesProps &
  WithRegionsProps;

interface State {
  configs: Config[];
  hasMadeConfigsRequest: boolean;
  configsError?: APIError[];
}

export class LinodeActionMenu extends React.Component<CombinedProps, State> {
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

  // When we clone a Linode from the action menu, we pass in several query string
  // params so everything is selected for us when we get to the Create flow.
  buildQueryStringForLinodeClone = () => {
    const {
      linodeId,
      linodeRegion,
      linodeType,
      typesData,
      regionsData
    } = this.props;

    const params: Record<string, string> = {
      type: 'My Images',
      subtype: 'Clone Linode',
      linodeID: String(linodeId)
    };

    // If the type of this Linode is a valid (current) type, use it in the QS
    if (typesData && typesData.some(type => type.id === linodeType)) {
      params.typeID = linodeType!;
    }

    // If the region of this Linode is a valid region, use it in the QS
    if (regionsData && regionsData.some(region => region.id === linodeRegion)) {
      params.regionID = linodeRegion;
    }

    return stringify(params);
  };

  createLinodeActions = () => {
    const {
      linodeId,
      linodeLabel,
      linodeBackups,
      linodeStatus,
      openDeleteDialog,
      openPowerActionDialog,
      history: { push },
      readOnly
    } = this.props;
    const { configs, hasMadeConfigsRequest } = this.state;

    const readOnlyProps = readOnly
      ? {
          disabled: true,
          tooltip: "You don't have permission to modify this Linode"
        }
      : {};

    const hasHostMaintenance = linodeStatus === 'stopped';
    const maintenanceProps = {
      disabled: hasHostMaintenance,
      tooltip: hasHostMaintenance
        ? 'This action is unavailable while your Linode is undergoing host maintenance.'
        : undefined
    };

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
          ariaDescribedBy: 'new-window',
          ...readOnlyProps
        },
        {
          title: 'Clone',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Clone');
            push({
              pathname: '/linodes/create',
              search: this.buildQueryStringForLinodeClone()
            });
            e.preventDefault();
            e.stopPropagation();
          },
          ...readOnlyProps,
          ...maintenanceProps
        },
        {
          title: 'Migrate',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendMigrationNavigationEvent('/linodes');
            sendLinodeActionMenuItemEvent('Migrate');
            push({
              pathname: `/linodes/${linodeId}/migrate`
            });
            e.preventDefault();
            e.stopPropagation();
          },
          ...readOnlyProps
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Navigate to Resize Page');
            push(`/linodes/${linodeId}/resize`);
            e.preventDefault();
            e.stopPropagation();
          },
          ...readOnlyProps,
          ...maintenanceProps
        },
        linodeBackups.enabled
          ? {
              title: 'View Backups',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                sendLinodeActionMenuItemEvent('Navigate to Backups Page');
                push(`/linodes/${linodeId}/backup`);
                e.preventDefault();
                e.stopPropagation();
              }
            }
          : {
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
            openDeleteDialog(linodeId, linodeLabel);
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
            ? 'Could not load configs for this Linode.'
            : noConfigs
            ? 'A config needs to be added before powering on a Linode'
            : readOnly
            ? "You don't have permission to modify this Linode"
            : undefined,
          onClick: e => {
            sendLinodeActionMenuItemEvent('Power On Linode');
            openPowerActionDialog(
              'Power On',
              linodeId,
              linodeLabel,
              this.state.configs
            );
            closeMenu();
          }
        });
      }

      if (linodeStatus === 'running') {
        actions.unshift(
          {
            title: 'Reboot',
            disabled: !hasMadeConfigsRequest || readOnly,
            isLoading: !hasMadeConfigsRequest,
            tooltip: readOnly
              ? "You don't have permission to modify this Linode."
              : this.state.configsError
              ? 'Could not load configs for this Linode.'
              : undefined,
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              sendLinodeActionMenuItemEvent('Reboot Linode');
              e.preventDefault();
              e.stopPropagation();
              openPowerActionDialog(
                'Reboot',
                linodeId,
                linodeLabel,
                this.state.configs
              );
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
              openPowerActionDialog('Power Off', linodeId, linodeLabel, []);
              closeMenu();
            },
            ...readOnlyProps
          }
        );
      }

      return actions;
    };
  };

  render() {
    return (
      <ActionMenu
        toggleOpenCallback={this.toggleOpenActionMenu}
        createActions={this.createLinodeActions()}
        ariaLabel={`Action menu for Linode ${this.props.linodeLabel}`}
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
const withRegions = regionsContainer();

const enhanced = compose<CombinedProps, Props>(
  connected,
  withTypes,
  withRegions,
  withRouter
);

export default enhanced(LinodeActionMenu);
