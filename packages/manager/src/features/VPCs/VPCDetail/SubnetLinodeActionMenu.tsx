import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { Linode, Subnet } from '@linode/api-v4';
import type { Action as ActionMenuAction } from 'src/components/ActionMenu/ActionMenu';
import type { Action as PowerAction } from 'src/features/Linodes/PowerActionsDialogOrDrawer';

interface SubnetLinodeActionHandlers {
  handlePowerActionsLinode: (
    linode: Linode,
    action: PowerAction,
    subnet: Subnet
  ) => void;
  handleUnassignLinode: (linode: Linode, subnet?: Subnet) => void;
}

interface Props extends SubnetLinodeActionHandlers {
  isOffline: boolean;
  isRebootNeeded: boolean;
  linode: Linode;
  showPowerButton: boolean;
  subnet: Subnet;
  vpcId?: number;
}

export const SubnetLinodeActionMenu = (props: Props) => {
  const {
    handlePowerActionsLinode,
    handleUnassignLinode,
    isOffline,
    isRebootNeeded,
    subnet,
    linode,
    showPowerButton,
    vpcId,
  } = props;

  const { data: permissions } = usePermissions('vpc', ['update_vpc'], vpcId);
  // TODO: change 'delete_linode' to 'delete_linode_config_profile_interface' once it's available
  const { data: linodePermissions } = usePermissions(
    'linode',
    ['reboot_linode', 'boot_linode', 'shutdown_linode', 'delete_linode'],
    linode.id
  );

  const actions: ActionMenuAction[] = [];
  if (isRebootNeeded) {
    actions.push({
      onClick: () => {
        handlePowerActionsLinode(linode, 'Reboot', subnet);
      },
      title: 'Reboot',
      disabled: !(linodePermissions?.reboot_linode && permissions?.update_vpc),
      tooltip: !(linodePermissions?.reboot_linode && permissions?.update_vpc)
        ? 'You do not have permission to reboot this Linode.'
        : undefined,
    });
  }

  if (showPowerButton) {
    actions.push({
      onClick: () => {
        handlePowerActionsLinode(
          linode,
          isOffline ? 'Power On' : 'Power Off',
          subnet
        );
      },
      disabled: isOffline
        ? !(linodePermissions?.boot_linode && permissions?.update_vpc)
        : !(linodePermissions?.shutdown_linode && permissions?.update_vpc),
      tooltip: !(linodePermissions?.boot_linode && permissions?.update_vpc)
        ? 'You do not have permission to power on this Linode.'
        : !(linodePermissions?.shutdown_linode && permissions?.update_vpc)
          ? 'You do not have permission to power off this Linode.'
          : undefined,
      title: isOffline ? 'Power On' : 'Power Off',
    });
  }

  actions.push({
    onClick: () => {
      handleUnassignLinode(linode, subnet);
    },
    title: 'Unassign Linode',
    disabled: !(linodePermissions?.delete_linode && permissions?.update_vpc),
    tooltip: !(linodePermissions?.delete_linode && permissions?.update_vpc)
      ? 'You do not have permission to unassign this Linode.'
      : undefined,
  });

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Linodes in Subnet ${subnet.label}`}
    />
  );
};
