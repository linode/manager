import { LinodeBackups, LinodeType } from '@linode/api-v4/lib/linodes';
import { Region } from '@linode/api-v4/lib/regions';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { useSpecificTypes } from 'src/queries/types';
import { useGrants } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector';
import {
  sendLinodeActionEvent,
  sendLinodeActionMenuItemEvent,
  sendMigrationNavigationEvent,
} from 'src/utilities/analytics';
import { ExtendedType, extendType } from 'src/utilities/extendType';
import { LinodeHandlers } from './LinodesLanding';

export interface Props extends LinodeHandlers {
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
  linodeType?: LinodeType;
  linodeBackups: LinodeBackups;
  linodeStatus: string;
  inListView?: boolean;
}

// When we clone a Linode from the action menu, we pass in several query string
// params so everything is selected for us when we get to the Create flow.
export const buildQueryStringForLinodeClone = (
  linodeId: number,
  linodeRegion: string,
  linodeType: string | null,
  types: ExtendedType[] | null | undefined,
  regions: Region[]
): string => {
  const params: Record<string, string> = {
    linodeID: String(linodeId),
    type: 'Clone Linode',
  };

  // If the type of this Linode is a valid (current) type, use it in the QS
  if (types && types.some((typeEntity) => typeEntity.id === linodeType)) {
    params.typeID = linodeType!;
  }

  // If the region of this Linode is a valid region, use it in the QS
  if (regions && regions.some((region) => region.id === linodeRegion)) {
    params.regionID = linodeRegion;
  }

  return new URLSearchParams(params).toString();
};

export const LinodeActionMenu: React.FC<Props> = (props) => {
  const {
    inListView,
    linodeId,
    linodeRegion,
    linodeStatus,
    linodeType,
  } = props;

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const typesQuery = useSpecificTypes(linodeType?.id ? [linodeType.id] : []);
  const type = typesQuery[0]?.data;
  const extendedType = type ? extendType(type) : undefined;
  const history = useHistory();
  const regions = useRegionsQuery().data ?? [];
  const isBareMetalInstance = linodeType?.class === 'metal';

  const { data: grants } = useGrants();

  const readOnly = getPermissionsForLinode(grants, linodeId) === 'read_only';
  const toggleOpenActionMenu = () => {
    sendLinodeActionEvent();
  };

  const handlePowerAction = () => {
    const action = linodeStatus === 'running' ? 'Power Off' : 'Power On';
    sendLinodeActionMenuItemEvent(`${action} Linode`);
    props.onOpenPowerDialog(action);
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
          disabled: !['running', 'offline'].includes(linodeStatus) || readOnly,
          onClick: handlePowerAction,
          title: linodeStatus === 'running' ? 'Power Off' : 'Power On',
          tooltip: readOnly ? noPermissionTooltipText : undefined,
        }
      : null,
    inListView || matchesSmDown
      ? {
          disabled: linodeStatus !== 'running' || readOnly,
          onClick: () => {
            sendLinodeActionMenuItemEvent('Reboot Linode');
            props.onOpenPowerDialog('Reboot');
          },
          title: 'Reboot',
          tooltip: readOnly ? noPermissionTooltipText : undefined,
          ...readOnlyProps,
        }
      : null,
    inListView || matchesSmDown
      ? {
          onClick: () => {
            sendLinodeActionMenuItemEvent('Launch Console');
            lishLaunch(linodeId);
          },
          title: 'Launch LISH Console',
          ...readOnlyProps,
        }
      : null,
    isBareMetalInstance
      ? null
      : {
          onClick: () => {
            sendLinodeActionMenuItemEvent('Clone');
            history.push({
              pathname: '/linodes/create',
              search: buildQueryStringForLinodeClone(
                linodeId,
                linodeRegion,
                linodeType?.id ?? null,
                extendedType ? [extendedType] : null,
                regions
              ),
            });
          },
          title: 'Clone',
          ...maintenanceProps,
          ...readOnlyProps,
        },
    isBareMetalInstance
      ? null
      : {
          onClick: () => {
            props.onOpenResizeDialog();
          },
          title: 'Resize',
          ...maintenanceProps,
          ...readOnlyProps,
        },
    {
      onClick: () => {
        sendLinodeActionMenuItemEvent('Navigate to Rebuild Page');
        props.onOpenRebuildDialog();
      },
      title: 'Rebuild',
      ...maintenanceProps,
      ...readOnlyProps,
    },
    {
      onClick: () => {
        sendLinodeActionMenuItemEvent('Navigate to Rescue Page');
        props.onOpenRescueDialog();
      },
      title: 'Rescue',
      ...maintenanceProps,
      ...readOnlyProps,
    },
    isBareMetalInstance
      ? null
      : {
          onClick: () => {
            sendMigrationNavigationEvent('/linodes');
            sendLinodeActionMenuItemEvent('Migrate');
            props.onOpenMigrateDialog();
          },
          title: 'Migrate',
          ...readOnlyProps,
        },
    {
      onClick: () => {
        sendLinodeActionMenuItemEvent('Delete Linode');
        props.onOpenDeleteDialog();
      },
      title: 'Delete',
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
