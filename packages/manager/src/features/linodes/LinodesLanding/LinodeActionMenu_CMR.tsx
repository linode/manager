import {
  Config,
  getLinodeConfigs,
  LinodeBackups
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
// eslint-disable-next-line no-restricted-imports
import { useTheme } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { stringify } from 'qs';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Link, useHistory } from 'react-router-dom';

import { lishLaunch } from 'src/features/Lish/lishUtils';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import { useTypes } from 'src/hooks/useTypes';
import { useRegions } from 'src/hooks/useRegions';
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
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  link: {
    padding: '12px 10px',
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
    ...theme.applyLinkStyles,
    height: '100%',
    minWidth: 'auto',
    padding: '12px 10px',
    whiteSpace: 'nowrap',
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
  inlineLabel?: string;
  inTableContext?: boolean;
  openLinodeResize: (linodeID: number) => void;
}

export type CombinedProps = Props & StateProps;

export const LinodeActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  const { types } = useTypes();
  const history = useHistory();
  const regions = useRegions();

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
    const { linodeId, linodeRegion, linodeType } = props;

    const params: Record<string, string> = {
      type: 'My Images',
      subtype: 'Clone Linode',
      linodeID: String(linodeId)
    };

    // If the type of this Linode is a valid (current) type, use it in the QS
    if (
      types.entities &&
      types.entities.some(typeEntity => typeEntity.id === linodeType)
    ) {
      params.typeID = linodeType!;
    }

    // If the region of this Linode is a valid region, use it in the QS
    if (regions && regions.some(region => region.id === linodeRegion)) {
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
      readOnly,
      openLinodeResize
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
          title: 'Settings',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Navigate to Settings Page');
            history.push(`/linodes/${linodeId}/settings`);
            e.preventDefault();
            e.stopPropagation();
          }
        },
        linodeBackups.enabled
          ? {
              title: 'View Backups',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                sendLinodeActionMenuItemEvent('Navigate to Backups Page');
                history.push(`/linodes/${linodeId}/backup`);
                e.preventDefault();
                e.stopPropagation();
              }
            }
          : {
              title: 'Enable Backups',
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                sendLinodeActionMenuItemEvent('Enable Backups');
                history.push({
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
            history.push({
              pathname: '/linodes/create',
              search: buildQueryStringForLinodeClone()
            });
            e.preventDefault();
            e.stopPropagation();
          },
          ...maintenanceProps,
          ...readOnlyProps
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            openLinodeResize(linodeId);
            e.preventDefault();
            e.stopPropagation();
          },
          ...maintenanceProps,
          ...readOnlyProps
        },
        {
          title: 'Rebuild',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Navigate to Rebuild Page');
            history.push(`/linodes/${linodeId}/rebuild`);
            e.preventDefault();
            e.stopPropagation();
          },
          ...maintenanceProps,
          ...readOnlyProps
        },
        {
          title: 'Rescue',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Navigate to Rescue Page');
            history.push(`/linodes/${linodeId}/rescue`);
            e.preventDefault();
            e.stopPropagation();
          },
          ...maintenanceProps,
          ...readOnlyProps
        },
        {
          title: 'Migrate',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendMigrationNavigationEvent('/linodes');
            sendLinodeActionMenuItemEvent('Migrate');
            history.push({
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

      if (matches) {
        actions.unshift({
          title: 'Details',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            history.push({
              pathname: `/linodes/${linodeId}`
            });
            e.preventDefault();
          }
        });
        actions.unshift({
          title: linodeStatus === 'running' ? 'Power Off' : 'Power On',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
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
          },
          disabled: !['running', 'offline'].includes(linodeStatus)
        });
      }

      if (inTableContext === true) {
        actions.unshift({
          title: 'Launch Console',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            sendLinodeActionMenuItemEvent('Launch Console');
            lishLaunch(linodeId);
            e.preventDefault();
            e.stopPropagation();
          },
          ...readOnlyProps
        });
      }

      return actions;
    };
  };

  const {
    linodeId,
    linodeLabel,
    linodeStatus,
    openPowerActionDialog,
    inlineLabel,
    inTableContext
  } = props;

  return (
    <>
      {inTableContext && (
        <div className={classes.inlineActions}>
          <Link className={classes.link} to={`/linodes/${linodeId}`}>
            <span>Details</span>
          </Link>
          <Button
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
          </Button>
        </div>
      )}
      <ActionMenu
        className={classes.action}
        toggleOpenCallback={toggleOpenActionMenu}
        createActions={createLinodeActions()}
        ariaLabel={`Action menu for Linode ${props.linodeLabel}`}
        inlineLabel={inlineLabel}
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

const enhanced = compose<CombinedProps, Props>(connected);

export default enhanced(LinodeActionMenu);
