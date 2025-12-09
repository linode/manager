import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

export interface ActionHandlers {
  handleRemoveDevice: (device: FirewallDevice) => void;
}

import type { FirewallDevice } from '@linode/api-v4';

export interface FirewallDeviceActionMenuProps extends ActionHandlers {
  device: FirewallDevice;
  disabled: boolean;
  isLinodeUpdatable: boolean;
  isNodebalancerUpdatable: boolean;
  isPermissionsLoading: boolean;
}

export const FirewallDeviceActionMenu = React.memo(
  (props: FirewallDeviceActionMenuProps) => {
    const {
      device,
      disabled,
      handleRemoveDevice,
      isLinodeUpdatable,
      isNodebalancerUpdatable,
      isPermissionsLoading,
    } = props;

    const { type } = device.entity;

    const disabledDueToPermissions =
      type === 'nodebalancer' ? !isNodebalancerUpdatable : !isLinodeUpdatable;

    return (
      <InlineMenuAction
        actionText="Remove"
        disabled={disabled || disabledDueToPermissions}
        key="Remove"
        loading={isPermissionsLoading}
        onClick={() => handleRemoveDevice(device)}
        tooltip={
          disabledDueToPermissions
            ? `You do not have permission to modify this ${type === 'nodebalancer' ? 'NodeBalancer' : 'Linode'}.`
            : disabled
              ? 'You do not have permission to remove the device from this firewall.'
              : undefined
        }
      />
    );
  }
);
