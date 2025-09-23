import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

export interface ActionHandlers {
  handleRemoveDevice: (device: FirewallDevice) => void;
}

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { FirewallDevice } from '@linode/api-v4';

export interface FirewallDeviceActionMenuProps extends ActionHandlers {
  device: FirewallDevice;
  disabled: boolean;
}

export const FirewallDeviceActionMenu = React.memo(
  (props: FirewallDeviceActionMenuProps) => {
    const { device, disabled, handleRemoveDevice } = props;

    const { type } = device.entity;

    const { data: linodePermissions } = usePermissions(
      'linode',
      ['update_linode'],
      device?.entity.id,
      type !== 'nodebalancer'
    );

    const { data: nodebalancerPermissions } = usePermissions(
      'nodebalancer',
      ['update_nodebalancer'],
      device?.entity.id,
      type === 'nodebalancer'
    );

    const disabledDueToPermissions =
      type === 'nodebalancer'
        ? !nodebalancerPermissions?.update_nodebalancer
        : !linodePermissions?.update_linode;

    return (
      <InlineMenuAction
        actionText="Remove"
        disabled={disabled || disabledDueToPermissions}
        key="Remove"
        onClick={() => handleRemoveDevice(device)}
        tooltip={
          disabledDueToPermissions
            ? `You do not have permission to modify this ${type === 'nodebalancer' ? 'NodeBalancer' : 'Linode'}.`
            : undefined
        }
      />
    );
  }
);
