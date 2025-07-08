import { useRegionsQuery } from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { getIsDistributedRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { isMTCPlan } from 'src/features/components/PlansPanel/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import {
  sendLinodeActionEvent,
  sendLinodeActionMenuItemEvent,
  sendMigrationNavigationEvent,
} from 'src/utilities/analytics/customEventAnalytics';

import { buildQueryStringForLinodeClone } from './LinodeActionMenuUtils';

import type { LinodeHandlers } from '../LinodesLanding';
import type { LinodeBackups, LinodeType } from '@linode/api-v4';
import type { ActionType } from 'src/features/Account/utils';

const NO_PERMISSION_TOOLTIP_TEXT =
  'You do not have permission to perform this action.';
const MAINTENANCE_TOOLTIP_TEXT =
  'This action is unavailable while your Linode is undergoing host maintenance.';
const DISTRIBUTED_REGION_TOOLTIP_TEXT =
  'Cloning is currently not supported for distributed region instances.';
const LINODE_MTC_RESIZING_TOOLTIP_TEXT =
  'Resizing is not supported for this plan type.';
const LINODE_STATUS_NOT_RUNNING_TOOLTIP_TEXT =
  'This action is unavailable while your Linode is offline.';
export interface LinodeActionMenuProps extends LinodeHandlers {
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
  const { linodeId, linodeRegion, linodeStatus, linodeType } = props;

  const navigate = useNavigate();
  const regions = useRegionsQuery().data ?? [];
  const isBareMetalInstance = linodeType?.class === 'metal';
  const hasHostMaintenance = linodeStatus === 'stopped';

  const { permissions } = usePermissions(
    'linode',
    [
      'shutdown_linode',
      'reboot_linode',
      'boot_linode',
      'clone_linode',
      'resize_linode',
      'rebuild_linode',
      'rescue_linode',
      'migrate_linode',
      'delete_linode',
      'generate_linode_lish_token',
    ],
    linodeId,
    true
  );

  const handlePowerAction = () => {
    const action = linodeStatus === 'running' ? 'Power Off' : 'Power On';
    sendLinodeActionMenuItemEvent(`${action} Linode`);
    props.onOpenPowerDialog(action);
  };

  const linodeIsInDistributedRegion = getIsDistributedRegion(
    regions,
    linodeRegion
  );

  const isMTCLinode = Boolean(linodeType && isMTCPlan(linodeType));
  const isLinodeRunning = linodeStatus === 'running';

  const actionConfigs: ActionConfig[] = [
    {
      condition: true,
      disabled:
        !['offline', 'running'].includes(linodeStatus) ||
        (isLinodeRunning && !permissions.shutdown_linode) ||
        (!isLinodeRunning && !permissions.boot_linode),
      isReadOnly: !permissions.shutdown_linode,
      onClick: handlePowerAction,
      title: isLinodeRunning ? 'Power Off' : 'Power On',
      tooltipAction: 'modify',
      tooltipText: !permissions.shutdown_linode
        ? NO_PERMISSION_TOOLTIP_TEXT
        : undefined,
    },
    {
      condition: true,
      disabled: !isLinodeRunning || !permissions.reboot_linode,
      isReadOnly: !permissions.reboot_linode,
      onClick: () => {
        sendLinodeActionMenuItemEvent('Reboot Linode');
        props.onOpenPowerDialog('Reboot');
      },
      title: 'Reboot',
      tooltipAction: 'reboot',
      tooltipText: !permissions.reboot_linode
        ? NO_PERMISSION_TOOLTIP_TEXT
        : !isLinodeRunning
          ? LINODE_STATUS_NOT_RUNNING_TOOLTIP_TEXT
          : undefined,
    },
    {
      condition: true,
      disabled: !permissions.generate_linode_lish_token,
      isReadOnly: !permissions.generate_linode_lish_token,
      onClick: () => {
        sendLinodeActionMenuItemEvent('Launch Console');
        lishLaunch(linodeId);
      },
      title: 'Launch LISH Console',
      tooltipAction: 'edit',
      tooltipText: !permissions.generate_linode_lish_token
        ? NO_PERMISSION_TOOLTIP_TEXT
        : undefined,
    },
    {
      condition: !isBareMetalInstance,
      disabled:
        !permissions.clone_linode ||
        hasHostMaintenance ||
        linodeIsInDistributedRegion,
      isReadOnly: !permissions.clone_linode,
      onClick: () => {
        sendLinodeActionMenuItemEvent('Clone');
        navigate({
          to: '/linodes/create',
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
      tooltipText: !permissions.clone_linode
        ? NO_PERMISSION_TOOLTIP_TEXT
        : linodeIsInDistributedRegion
          ? DISTRIBUTED_REGION_TOOLTIP_TEXT
          : hasHostMaintenance
            ? MAINTENANCE_TOOLTIP_TEXT
            : undefined,
    },
    {
      condition: !isBareMetalInstance,
      disabled: !permissions.resize_linode || hasHostMaintenance || isMTCLinode,
      isReadOnly: !permissions.resize_linode,
      onClick: props.onOpenResizeDialog,
      title: 'Resize',
      tooltipAction: 'resize',
      tooltipText: !permissions.resize_linode
        ? NO_PERMISSION_TOOLTIP_TEXT
        : isMTCLinode
          ? LINODE_MTC_RESIZING_TOOLTIP_TEXT
          : hasHostMaintenance
            ? MAINTENANCE_TOOLTIP_TEXT
            : undefined,
    },
    {
      condition: true,
      disabled: !permissions.rebuild_linode || hasHostMaintenance,
      isReadOnly: !permissions.rebuild_linode,
      onClick: props.onOpenRebuildDialog,
      title: 'Rebuild',
      tooltipAction: 'rebuild',
      tooltipText: !permissions.rebuild_linode
        ? NO_PERMISSION_TOOLTIP_TEXT
        : hasHostMaintenance
          ? MAINTENANCE_TOOLTIP_TEXT
          : undefined,
    },
    {
      condition: true,
      disabled: !permissions.rescue_linode || hasHostMaintenance,
      isReadOnly: !permissions.rescue_linode,
      onClick: props.onOpenRescueDialog,
      title: 'Rescue',
      tooltipAction: 'rescue',
      tooltipText: !permissions.rescue_linode
        ? NO_PERMISSION_TOOLTIP_TEXT
        : hasHostMaintenance
          ? MAINTENANCE_TOOLTIP_TEXT
          : undefined,
    },
    {
      condition: !isBareMetalInstance,
      disabled: !permissions.migrate_linode || hasHostMaintenance,
      isReadOnly: !permissions.migrate_linode,
      onClick: () => {
        sendMigrationNavigationEvent('/linodes');
        sendLinodeActionMenuItemEvent('Migrate');
        props.onOpenMigrateDialog();
      },
      title: 'Migrate',
      tooltipAction: 'migrate',
      tooltipText: !permissions.migrate_linode
        ? NO_PERMISSION_TOOLTIP_TEXT
        : hasHostMaintenance
          ? MAINTENANCE_TOOLTIP_TEXT
          : undefined,
    },
    {
      condition: true,
      disabled: !permissions.delete_linode || hasHostMaintenance,
      isReadOnly: !permissions.delete_linode,
      onClick: () => {
        sendLinodeActionMenuItemEvent('Delete Linode');
        props.onOpenDeleteDialog();
      },
      title: 'Delete',
      tooltipAction: 'delete',
      tooltipText: !permissions.delete_linode
        ? NO_PERMISSION_TOOLTIP_TEXT
        : hasHostMaintenance
          ? MAINTENANCE_TOOLTIP_TEXT
          : undefined,
    },
  ];

  const actions = createActionMenuItems(actionConfigs);

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Linode ${props.linodeLabel}`}
      onOpen={sendLinodeActionEvent}
    />
  );
};

export const createActionMenuItems = (configs: ActionConfig[]) =>
  configs
    .filter(({ condition }) => condition)
    .map(({ disabled, onClick, title, tooltipAction, tooltipText }) => {
      const defaultTooltipText = disabled
        ? getRestrictedResourceText({
            action: tooltipAction,
            includeContactInfo: false,
            resourceType: 'Linodes',
          })
        : undefined;

      return {
        disabled,
        onClick,
        title,
        tooltip: tooltipText || defaultTooltipText,
      };
    });
