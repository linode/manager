import {
  Config,
  getLinodeConfigs,
  LinodeBackups,
  LinodeType,
} from '@linode/api-v4/lib/linodes';
import { Region } from '@linode/api-v4/lib/regions';
import { APIError } from '@linode/api-v4/lib/types';
import { stringify } from 'qs';
import { pathOr, splitAt } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { compose } from 'recompose';
import ActionMenu, {
  Action,
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme,
} from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';
import { Action as BootAction } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { useTypes } from 'src/hooks/useTypes';
import { useRegionsQuery } from 'src/queries/regions';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector.ts';
import { MapState } from 'src/store/types';
import {
  sendLinodeActionEvent,
  sendLinodeActionMenuItemEvent,
  sendMigrationNavigationEvent,
} from 'src/utilities/ga';

const useStyles = makeStyles(() => ({
  link: {
    padding: '12px 10px',
  },
  action: {
    marginLeft: 10,
  },
  powerOnOrOff: {
    borderRadius: 0,
    justifyContent: 'flex-start',
    minWidth: 83,
    whiteSpace: 'nowrap',
    '&:hover': {
      textDecoration: 'none',
    },
  },
}));

export interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
  linodeType: string | null;
  linodeBackups: LinodeBackups;
  linodeStatus: string;
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
}

export type CombinedProps = Props & StateProps;

// When we clone a Linode from the action menu, we pass in several query string
// params so everything is selected for us when we get to the Create flow.
export const buildQueryStringForLinodeClone = (
  linodeId: number,
  linodeRegion: string,
  linodeType: string | null,
  types: LinodeType[],
  regions: Region[]
) => {
  const params: Record<string, string> = {
    type: 'Clone Linode',
    linodeID: String(linodeId),
  };

  // If the type of this Linode is a valid (current) type, use it in the QS
  if (types && types.some((typeEntity) => typeEntity.id === linodeType)) {
    params.typeID = linodeType!;
  }

  // If the region of this Linode is a valid region, use it in the QS
  if (regions && regions.some((region) => region.id === linodeRegion)) {
    params.regionID = linodeRegion;
  }

  return stringify(params);
};

export const LinodeActionMenu: React.FC<CombinedProps> = (props) => {
  const { linodeRegion, linodeType } = props;
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('md'));

  const { types } = useTypes();
  const history = useHistory();
  const regions = useRegionsQuery().data ?? [];

  const [configs, setConfigs] = React.useState<Config[]>([]);
  const [configsError, setConfigsError] = React.useState<
    APIError[] | undefined
  >(undefined);
  const [
    hasMadeConfigsRequest,
    setHasMadeConfigsRequest,
  ] = React.useState<boolean>(false);

  const toggleOpenActionMenu = () => {
    getLinodeConfigs(props.linodeId)
      .then((configs) => {
        setConfigs(configs.data);
        setConfigsError(undefined);
        setHasMadeConfigsRequest(true);
      })
      .catch((err) => {
        setConfigsError(err);
        setHasMadeConfigsRequest(true);
      });

    sendLinodeActionEvent();
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

  const {
    linodeId,
    linodeLabel,
    linodeStatus,
    openPowerActionDialog,
    inlineLabel,
    inTableContext,
    openDialog,
    readOnly,
  } = props;

  const hasHostMaintenance = linodeStatus === 'stopped';
  const maintenanceProps = {
    disabled: hasHostMaintenance,
    tooltip: hasHostMaintenance
      ? 'This action is unavailable while your Linode is undergoing host maintenance.'
      : undefined,
  };

  const noPermissionTooltipText =
    "You don't have permission to modify this Linode.";

  const readOnlyProps = readOnly
    ? {
        disabled: true,
        tooltip: noPermissionTooltipText,
      }
    : {};

  const inLandingListView = matchesMdDown && inTableContext;
  const inEntityView = matchesSmDown;

  const actions = [
    inLandingListView || inEntityView || inTableContext
      ? {
          title: linodeStatus === 'running' ? 'Power Off' : 'Power On',
          className: classes.powerOnOrOff,
          disabled: !['running', 'offline'].includes(linodeStatus) || readOnly,
          tooltip: readOnly ? noPermissionTooltipText : undefined,
          onClick: handlePowerAction,
        }
      : null,
    inLandingListView || inEntityView || inTableContext
      ? {
          title: 'Reboot',
          className: classes.link,
          disabled:
            linodeStatus !== 'running' ||
            (!hasMadeConfigsRequest && matchesSmDown) ||
            readOnly ||
            Boolean(configsError?.[0]?.reason),
          tooltip: readOnly
            ? noPermissionTooltipText
            : configsError
            ? 'Could not load configs for this Linode.'
            : undefined,
          onClick: () => {
            sendLinodeActionMenuItemEvent('Reboot Linode');
            openPowerActionDialog('Reboot', linodeId, linodeLabel, configs);
          },
          ...readOnlyProps,
        }
      : null,
    inTableContext || matchesSmDown
      ? {
          title: 'Launch LISH Console',
          onClick: () => {
            sendLinodeActionMenuItemEvent('Launch Console');
            lishLaunch(linodeId);
          },
          ...readOnlyProps,
        }
      : null,
    {
      title: 'Clone',
      onClick: () => {
        sendLinodeActionMenuItemEvent('Clone');
        history.push({
          pathname: '/linodes/create',
          search: buildQueryStringForLinodeClone(
            linodeId,
            linodeRegion,
            linodeType,
            types.entities,
            regions
          ),
        });
      },
      ...maintenanceProps,
      ...readOnlyProps,
    },
    {
      title: 'Resize',
      onClick: () => {
        openDialog('resize', linodeId);
      },
      ...maintenanceProps,
      ...readOnlyProps,
    },
    {
      title: 'Rebuild',
      onClick: () => {
        sendLinodeActionMenuItemEvent('Navigate to Rebuild Page');
        openDialog('rebuild', linodeId);
      },
      ...maintenanceProps,
      ...readOnlyProps,
    },
    {
      title: 'Rescue',
      onClick: () => {
        sendLinodeActionMenuItemEvent('Navigate to Rescue Page');
        openDialog('rescue', linodeId);
      },
      ...maintenanceProps,
      ...readOnlyProps,
    },
    {
      title: 'Migrate',
      onClick: () => {
        sendMigrationNavigationEvent('/linodes');
        sendLinodeActionMenuItemEvent('Migrate');
        openDialog('migrate', linodeId);
      },
      ...readOnlyProps,
    },
    {
      title: 'Delete',
      onClick: () => {
        sendLinodeActionMenuItemEvent('Delete Linode');

        openDialog('delete', linodeId, linodeLabel);
      },
      ...readOnlyProps,
    },
  ].filter(Boolean) as ExtendedAction[];

  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;
  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  return (
    <>
      {!matchesMdDown &&
        inTableContext &&
        inlineActions.map((action) => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              className={action.className}
              disabled={action.disabled}
              onClick={action.onClick}
              tooltip={action.tooltip}
            />
          );
        })}
      <ActionMenu
        className={classes.action}
        toggleOpenCallback={toggleOpenActionMenu}
        // if inTableContext is false we're most likely in the detail header
        // where we need all of the available actions
        actionsList={inTableContext ? menuActions : actions}
        ariaLabel={`Action menu for Linode ${props.linodeLabel}`}
        inlineLabel={inlineLabel}
      />
    </>
  );
};

interface ExtendedAction extends Action {
  className?: string;
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
    ) === 'read_only',
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, Props>(connected);

export default enhanced(LinodeActionMenu);
