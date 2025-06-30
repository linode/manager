import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

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
  isVPCLKEEnterpriseCluster: boolean;
  linode: Linode;
  showPowerButton: boolean;
  subnet: Subnet;
}

export const SubnetLinodeActionMenu = (props: Props) => {
  const {
    handlePowerActionsLinode,
    handleUnassignLinode,
    isVPCLKEEnterpriseCluster,
    isOffline,
    subnet,
    linode,
    showPowerButton,
  } = props;

  const actions: ActionMenuAction[] = [
    {
      disabled: isVPCLKEEnterpriseCluster,
      onClick: () => {
        handlePowerActionsLinode(linode, 'Reboot', subnet);
      },
      title: 'Reboot Linode',
    },
    {
      disabled: isVPCLKEEnterpriseCluster,
      onClick: () => {
        handleUnassignLinode(linode, subnet);
      },
      title: 'Unassign Linode',
    },
  ];

  if (showPowerButton) {
    actions.splice(1, 0, {
      disabled: isVPCLKEEnterpriseCluster,
      onClick: () => {
        handlePowerActionsLinode(
          linode,
          isOffline ? 'Power On' : 'Power Off',
          subnet
        );
      },
      title: isOffline ? 'Power On' : 'Power Off',
    });
  }

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Linodes in Subnet ${subnet.label}`}
    />
  );
};

export default SubnetLinodeActionMenu;
