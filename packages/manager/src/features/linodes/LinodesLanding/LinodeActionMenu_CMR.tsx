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
import { useHistory } from 'react-router-dom';

import { lishLaunch } from 'src/features/Lish/lishUtils';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import { DialogType } from 'src/features/linodes/types';
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
import InlineMenuAction from 'src/components/InlineMenuAction/InlineMenuAction';

const useStyles = makeStyles((theme: Theme) => ({
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  link: {
    padding: '12px 10px'
  },
  action: {
    marginLeft: 10
  },
  powerOnOrOff: {
    height: '100%',
    minWidth: 'auto',
    whiteSpace: 'nowrap'
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
  openDialog: (
    type: DialogType,
    linodeID: number,
    linodeLabel?: string
  ) => void;
  openPowerActionDialog: (
    bootAction: BootAction,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  inlineLabel?: string;
  inTableContext?: boolean;
  inLandingDetailContext?: boolean;
}

export type CombinedProps = Props & StateProps;

export const LinodeActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { types } = useTypes();
  const history = useHistory();
  const regions = useRegions().entities;

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
      type: 'Clone Linode',
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

  const handlePowerAction = () => {
    const action = linodeStatus === 'running' ? 'Power Off' : 'Power On';
    sendLinodeActionMenuItemEvent(`${action} Linode`);
    openPowerActionDialog(
      `${action}` as BootAction,
      linodeId,
      linodeLabel,
      linodeStatus === 'running' ? configs : []
    );
  };

  const createLinodeActions = () => {
    const {
      linodeId,
      linodeLabel,
      linodeBackups,
      linodeStatus,
      openDialog,
      openPowerActionDialog,
      readOnly,
      inLandingDetailContext
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
        // inLandingDetailContext && {
        //   title: 'Settings',
        //   onClick: () => {
        //     sendLinodeActionMenuItemEvent('Navigate to Settings Page');
        //     history.push(`/linodes/${linodeId}/settings`);
        //   }
        // },
        // linodeBackups.enabled
        //   ? {
        //       title: 'View Backups',
        //       onClick: () => {
        //         sendLinodeActionMenuItemEvent('Navigate to Backups Page');
        //         history.push(`/linodes/${linodeId}/backup`);
        //       }
        //     }
        //   : {
        //       title: 'Enable Backups',
        //       onClick: () => {
        //         sendLinodeActionMenuItemEvent('Enable Backups');
        //         openDialog('enable_backups', linodeId);
        //       },
        //       ...readOnlyProps
        //     },
        {
          title: 'Clone',
          onClick: () => {
            sendLinodeActionMenuItemEvent('Clone');
            history.push({
              pathname: '/linodes/create',
              search: buildQueryStringForLinodeClone()
            });
          },
          ...maintenanceProps,
          ...readOnlyProps
        },
        {
          title: 'Resize',
          onClick: () => {
            openDialog('resize', linodeId);
          },
          ...maintenanceProps,
          ...readOnlyProps
        },
        {
          title: 'Rebuild',
          onClick: () => {
            sendLinodeActionMenuItemEvent('Navigate to Rebuild Page');
            openDialog('rebuild', linodeId);
          },
          ...maintenanceProps,
          ...readOnlyProps
        },
        {
          title: 'Rescue',
          onClick: () => {
            sendLinodeActionMenuItemEvent('Navigate to Rescue Page');
            openDialog('rescue', linodeId);
          },
          ...maintenanceProps,
          ...readOnlyProps
        },
        {
          title: 'Migrate',
          onClick: () => {
            sendMigrationNavigationEvent('/linodes');
            sendLinodeActionMenuItemEvent('Migrate');
            openDialog('migrate', linodeId);
          },
          ...readOnlyProps
        },
        {
          title: 'Delete',
          onClick: () => {
            sendLinodeActionMenuItemEvent('Delete Linode');

            openDialog('delete', linodeId, linodeLabel);
          },
          ...readOnlyProps
        }
      ];

      if (
        linodeStatus === 'running' ||
        (linodeStatus === 'running' && !inTableContext && matchesSmDown)
      ) {
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
          onClick: () => {
            sendLinodeActionMenuItemEvent('Reboot Linode');
            openPowerActionDialog('Reboot', linodeId, linodeLabel, configs);
          },
          ...readOnlyProps
        });
      }

      if (matchesSmDown || inTableContext) {
        actions.unshift({
          title: 'Launch Console',
          onClick: () => {
            sendLinodeActionMenuItemEvent('Launch Console');
            lishLaunch(linodeId);
          },
          ...readOnlyProps
        });
      }

      if (matchesSmDown && inTableContext) {
        actions.unshift({
          title: linodeStatus === 'running' ? 'Power Off' : 'Power On',
          onClick: handlePowerAction,
          disabled: !['running', 'offline'].includes(linodeStatus)
        });
      }

      if (
        (matchesSmDown && inLandingDetailContext) ||
        (matchesSmDown && inTableContext)
      ) {
        actions.unshift({
          title: 'Details',
          onClick: () => {
            history.push({
              pathname: `/linodes/${linodeId}`
            });
          }
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

  const inlineActions = [
    {
      actionText: 'Details',
      className: classes.link,
      href: `/linodes/${linodeId}`
    },
    {
      actionText: linodeStatus === 'running' ? 'Power Off' : 'Power On',
      disabled: !['running', 'offline'].includes(linodeStatus),
      className: classes.powerOnOrOff,
      onClick: handlePowerAction
    }
  ];

  return (
    <>
      {!matchesSmDown &&
        inTableContext &&
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.actionText}
              actionText={action.actionText}
              className={action.className}
              href={action.href}
              disabled={action.disabled}
              onClick={action.onClick}
            />
          );
        })}
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
