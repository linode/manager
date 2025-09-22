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

    const { data: linodePermissions } = usePermissions(
      'linode',
      ['update_linode'],
      device?.entity.id
    );

    return (
      <InlineMenuAction
        actionText="Remove"
        disabled={disabled || !linodePermissions?.update_linode}
        key="Remove"
        onClick={() => handleRemoveDevice(device)}
        tooltip={
          !linodePermissions?.update_linode
            ? 'You do not have permission to modify this Linode.'
            : undefined
        }
      />
    );
  }
);
