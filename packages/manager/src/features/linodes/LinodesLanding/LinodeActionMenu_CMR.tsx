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
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { lishLaunch } from 'src/features/Lish/lishUtils';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { makeStyles, Theme } from 'src/components/core/styles';
import regionsContainer, {
  DefaultProps as WithRegionsProps
} from 'src/containers/regions.container';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { Action as BootAction } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector.ts';
import { MapState } from 'src/store/types';
import {
  sendLinodeActionEvent,
  sendLinodeActionMenuItemEvent,
  sendMigrationNavigationEvent
} from 'src/utilities/ga';

const useStyles = makeStyles((theme: Theme) => ({
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    padding: 10,
    height: 44,
    textAlign: 'center',
    '&:hover': {
      backgroundColor: '#3683dc',
      '& span': {
        color: theme.color.white
      }
    },
    '& span': {
      color: '#3683dc'
    }
  },
  action: {
    marginLeft: 10
  },
  powerOnOrOff: {
    background: 'none',
    color: theme.palette.primary.main,
    border: 'none',
    font: 'inherit',
    cursor: 'pointer',
    padding: 10,
    height: 44,
    '&:hover': {
      backgroundColor: '#3683dc',
      color: theme.color.white
    },
    '&[disabled]': {
      color: '#cdd0d5',
      cursor: 'default',
      '&:hover': {
        backgroundColor: 'inherit'
      }
    }
  }
}));

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

export const LinodeActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const [configs, setConfigs] = React.useState<Config[]>([]);
  const [configsError, setConfigsError] = React.useState<
    APIError[] | undefined
  >(undefined);
  const [hasMadeConfigsRequest, setHasMadeConfigsRequest] = React.useState<
    boolean
  >(false);

  const toggleOpenActionMenu = () => {
    getLinodeConfigs(props.linodeId)
      .then(configs => {
        setConfigs(configs.data);
        setConfigsError(undefined);
        setHasMadeConfigsRequest(true);
      })
      .catch(err => {
        setConfigsError(err);
        setHasMadeConfigsRequest(true);
      });

    sendLinodeActionEvent();
  };

  // When we clone a Linode from the action menu, we pass in several query string
  // params so everything is selected for us when we get to the Create flow.
  const buildQueryStringForLinodeClone = () => {
    const {
      linodeId,
      linodeRegion,
      linodeType,
      typesData,
      regionsData
    } = props;

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

  const createLinodeActions = () => {
    const {
      linodeId,
      linodeLabel,
      linodeBackups,
      linodeStatus,
      openDeleteDialog,
      openPowerActionDialog,
      history: { push },
      readOnly
    } = props;

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

    return (): Action[] => {
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
          title: 'Settings',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Navigate to Settings Page');
            push(`/linodes/${linodeId}/settings`);
            e.preventDefault();
            e.stopPropagation();
          }
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
          title: 'Clone',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Clone');
            push({
              pathname: '/linodes/create',
              search: buildQueryStringForLinodeClone()
            });
            e.preventDefault();
            e.stopPropagation();
          },
          ...readOnlyProps,
          ...maintenanceProps
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
        {
          title: 'Rebuild',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Navigate to Rebuild Page');
            push(`/linodes/${linodeId}/rebuild`);
            e.preventDefault();
            e.stopPropagation();
          },
          ...readOnlyProps,
          ...maintenanceProps
        },
        {
          title: 'Rescue',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Navigate to Rescue Page');
            push(`/linodes/${linodeId}/rescue`);
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
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Delete Linode');
            e.preventDefault();
            e.stopPropagation();
            openDeleteDialog(linodeId, linodeLabel);
          },
          ...readOnlyProps
        }
      ];

      if (linodeStatus === 'running') {
        actions.unshift({
          title: 'Reboot',
          disabled:
            !hasMadeConfigsRequest ||
            readOnly ||
            Boolean(configsError?.[0]?.reason),
          tooltip: readOnly
            ? "You don't have permission to modify this Linode."
            : configsError
            ? 'Could not load configs for this Linode.'
            : undefined,
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Reboot Linode');
            e.preventDefault();
            e.stopPropagation();
            openPowerActionDialog('Reboot', linodeId, linodeLabel, configs);
          },
          ...readOnlyProps
        });
      }

      return actions;
    };
  };

  const { linodeId, linodeLabel, linodeStatus, openPowerActionDialog } = props;

  return (
    <>
      <div className={classes.inlineActions}>
        <Link className={classes.link} to={`/linodes/${linodeId}`}>
          <span>Details</span>
        </Link>
        <button
          className={classes.powerOnOrOff}
          onClick={e => {
            const action =
              linodeStatus === 'running' ? 'Power Off' : 'Power On';
            sendLinodeActionMenuItemEvent(`${action} Linode`);
            e.preventDefault();
            e.stopPropagation();
            openPowerActionDialog(
              `${action}` as BootAction,
              linodeId,
              linodeLabel,
              linodeStatus === 'running' ? configs : []
            );
          }}
          disabled={!['running', 'offline'].includes(linodeStatus)}
        >
          {linodeStatus === 'running' ? 'Power Off' : 'Power On'}
        </button>
      </div>
      <ActionMenu
        className={classes.action}
        toggleOpenCallback={toggleOpenActionMenu}
        createActions={createLinodeActions()}
        ariaLabel={`Action menu for Linode ${props.linodeLabel}`}
      />
    </>
  );
};

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
