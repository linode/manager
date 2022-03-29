import {
  Config,
  getLinodeConfigs,
  LinodeBackups,
  LinodeType,
} from '@linode/api-v4/lib/linodes';
import { Region } from '@linode/api-v4/lib/regions';
import { APIError } from '@linode/api-v4/lib/types';
import { stringify } from 'qs';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import { Action as BootAction } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { useTypes } from 'src/hooks/useTypes';
import { useGrants } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import {
  sendLinodeActionEvent,
  sendLinodeActionMenuItemEvent,
  sendMigrationNavigationEvent,
} from 'src/utilities/ga';

export interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
  linodeType?: ExtendedType;
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
  inListView?: boolean;
}

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

export const LinodeActionMenu: React.FC<Props> = (props) => {
  const {
    linodeId,
    linodeLabel,
    linodeRegion,
    linodeStatus,
    linodeType,
    openPowerActionDialog,
    inListView,
    openDialog,
  } = props;

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { types } = useTypes();
  const history = useHistory();
  const regions = useRegionsQuery().data ?? [];
  const isBareMetalInstance = linodeType?.class === 'metal';

  const { data: grants } = useGrants();

  const readOnly = getPermissionsForLinode(grants, linodeId) === 'read_only';

  const [configs, setConfigs] = React.useState<Config[]>([]);
  const [configsError, setConfigsError] = React.useState<
    APIError[] | undefined
  >(undefined);
  const [
    hasMadeConfigsRequest,
    setHasMadeConfigsRequest,
  ] = React.useState<boolean>(false);

  const toggleOpenActionMenu = () => {
    if (!isBareMetalInstance) {
      // Bare metal Linodes don't have configs that can be retrieved
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
    }

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

  const actions = [
    inListView || matchesSmDown
      ? {
          title: linodeStatus === 'running' ? 'Power Off' : 'Power On',
          disabled: !['running', 'offline'].includes(linodeStatus) || readOnly,
          tooltip: readOnly ? noPermissionTooltipText : undefined,
          onClick: handlePowerAction,
        }
      : null,
    inListView || matchesSmDown
      ? {
          title: 'Reboot',
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
    inListView || matchesSmDown
      ? {
          title: 'Launch LISH Console',
          onClick: () => {
            sendLinodeActionMenuItemEvent('Launch Console');
            lishLaunch(linodeId);
          },
          ...readOnlyProps,
        }
      : null,
    isBareMetalInstance
      ? null
      : {
          title: 'Clone',
          onClick: () => {
            sendLinodeActionMenuItemEvent('Clone');
            history.push({
              pathname: '/linodes/create',
              search: buildQueryStringForLinodeClone(
                linodeId,
                linodeRegion,
                linodeType?.id ?? null,
                types.entities,
                regions
              ),
            });
          },
          ...maintenanceProps,
          ...readOnlyProps,
        },
    isBareMetalInstance
      ? null
      : {
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
    isBareMetalInstance
      ? null
      : {
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

  return (
    <ActionMenu
      toggleOpenCallback={toggleOpenActionMenu}
      actionsList={actions}
      ariaLabel={`Action menu for Linode ${props.linodeLabel}`}
    />
  );
};

interface ExtendedAction extends Action {
  className?: string;
}

export default LinodeActionMenu;
