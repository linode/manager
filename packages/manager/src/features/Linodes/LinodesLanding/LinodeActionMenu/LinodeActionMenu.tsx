import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { getIsDistributedRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useRegionsQuery } from '@linode/queries';
import {
  sendLinodeActionEvent,
  sendLinodeActionMenuItemEvent,
  sendMigrationNavigationEvent,
} from 'src/utilities/analytics/customEventAnalytics';

import { buildQueryStringForLinodeClone } from './LinodeActionMenuUtils';

import type { LinodeHandlers } from '../LinodesLanding';
import type { LinodeBackups, LinodeType } from '@linode/api-v4';
import type { ActionType } from 'src/features/Account/utils';

export interface LinodeActionMenuProps extends LinodeHandlers {
  inListView?: boolean;
  linodeBackups: LinodeBackups;
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
  linodeStatus: string;
  linodeType?: LinodeType;
}

interface ActionConfig {
  condition: boolean;
  disabled: boolean;
  isReadOnly: boolean;
  onClick: () => void;
  title: string;
  tooltipAction: ActionType;
  tooltipText?: string;
}

export const LinodeActionMenu = (props: LinodeActionMenuProps) => {
  const { inListView, linodeId, linodeRegion, linodeStatus, linodeType } =
    props;

  const history = useHistory();
  const regions = useRegionsQuery().data ?? [];
  const isBareMetalInstance = linodeType?.class === 'metal';
  const hasHostMaintenance = linodeStatus === 'stopped';
  const theme = useTheme();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const isVisible = inListView || matchesSmDown;

  const isLinodeReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: linodeId,
  });

  const maintenanceTooltipText =
    hasHostMaintenance && !isLinodeReadOnly
      ? 'This action is unavailable while your Linode is undergoing host maintenance.'
      : undefined;

  const handlePowerAction = () => {
    const action = linodeStatus === 'running' ? 'Power Off' : 'Power On';
    sendLinodeActionMenuItemEvent(`${action} Linode`);
    props.onOpenPowerDialog(action);
  };

  const linodeIsInDistributedRegion = getIsDistributedRegion(
    regions,
    linodeRegion
  );

  const distributedRegionTooltipText =
    'Cloning is currently not supported for distributed region instances.';

  const actionConfigs: ActionConfig[] = [
    {
      condition: isVisible,
      disabled:
        !['offline', 'running'].includes(linodeStatus) || isLinodeReadOnly,
      isReadOnly: isLinodeReadOnly,
      onClick: handlePowerAction,
      title: linodeStatus === 'running' ? 'Power Off' : 'Power On',
      tooltipAction: 'modify',
    },
    {
      condition: isVisible,
      disabled: linodeStatus !== 'running' || isLinodeReadOnly,
      isReadOnly: isLinodeReadOnly,
      onClick: () => {
        sendLinodeActionMenuItemEvent('Reboot Linode');
        props.onOpenPowerDialog('Reboot');
      },
      title: 'Reboot',
      tooltipAction: 'reboot',
      tooltipText:
        !isLinodeReadOnly && linodeStatus !== 'running'
          ? 'This action is unavailable while your Linode is offline.'
          : undefined,
    },
    {
      condition: isVisible,
      disabled: isLinodeReadOnly,
      isReadOnly: isLinodeReadOnly,
      onClick: () => {
        sendLinodeActionMenuItemEvent('Launch Console');
        lishLaunch(linodeId);
      },
      title: 'Launch LISH Console',
      tooltipAction: 'edit',
    },
    {
      condition: !isBareMetalInstance,
      disabled:
        isLinodeReadOnly || hasHostMaintenance || linodeIsInDistributedRegion,
      isReadOnly: isLinodeReadOnly,
      onClick: () => {
        sendLinodeActionMenuItemEvent('Clone');
        history.push({
          pathname: '/linodes/create',
          search: buildQueryStringForLinodeClone(
            linodeId,
            linodeRegion,
            linodeType?.id ?? null,
            linodeType ? [linodeType] : undefined,
            regions
          ),
        });
      },
      title: 'Clone',
      tooltipAction: 'clone',
      tooltipText: linodeIsInDistributedRegion
        ? distributedRegionTooltipText
        : maintenanceTooltipText,
    },
    {
      condition: !isBareMetalInstance,
      disabled: isLinodeReadOnly || hasHostMaintenance,
      isReadOnly: isLinodeReadOnly,
      onClick: props.onOpenResizeDialog,
      title: 'Resize',
      tooltipAction: 'resize',
      tooltipText: maintenanceTooltipText,
    },
    {
      condition: true,
      disabled: isLinodeReadOnly || hasHostMaintenance,
      isReadOnly: isLinodeReadOnly,
      onClick: props.onOpenRebuildDialog,
      title: 'Rebuild',
      tooltipAction: 'rebuild',
      tooltipText: maintenanceTooltipText,
    },
    {
      condition: true,
      disabled: isLinodeReadOnly || hasHostMaintenance,
      isReadOnly: isLinodeReadOnly,
      onClick: props.onOpenRescueDialog,
      title: 'Rescue',
      tooltipAction: 'rescue',
      tooltipText: maintenanceTooltipText,
    },
    {
      condition: !isBareMetalInstance,
      disabled: isLinodeReadOnly || hasHostMaintenance,
      isReadOnly: isLinodeReadOnly,
      onClick: () => {
        sendMigrationNavigationEvent('/linodes');
        sendLinodeActionMenuItemEvent('Migrate');
        props.onOpenMigrateDialog();
      },
      title: 'Migrate',
      tooltipAction: 'migrate',
      tooltipText: maintenanceTooltipText,
    },
    {
      condition: true,
      disabled: isLinodeReadOnly || hasHostMaintenance,
      isReadOnly: isLinodeReadOnly,
      onClick: () => {
        sendLinodeActionMenuItemEvent('Delete Linode');
        props.onOpenDeleteDialog();
      },
      title: 'Delete',
      tooltipAction: 'delete',
      tooltipText: maintenanceTooltipText,
    },
  ];

  const actions = createActionMenuItems(actionConfigs, isLinodeReadOnly);

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Linode ${props.linodeLabel}`}
      onOpen={sendLinodeActionEvent}
    />
  );
};

export const createActionMenuItems = (
  configs: ActionConfig[],
  isReadOnly: boolean
) =>
  configs
    .filter(({ condition }) => condition)
    .map(({ disabled, onClick, title, tooltipAction, tooltipText }) => {
      const defaultTooltipText = isReadOnly
        ? getRestrictedResourceText({
            action: tooltipAction,
            includeContactInfo: false,
            resourceType: 'Linodes',
          })
        : undefined;

      return {
        disabled: disabled || isReadOnly,
        onClick,
        title,
        tooltip: tooltipText || defaultTooltipText,
      };
    });
