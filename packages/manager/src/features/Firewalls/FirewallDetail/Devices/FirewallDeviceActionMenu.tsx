import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

export interface ActionHandlers {
  handleRemoveDevice: (device: FirewallDevice) => void;
}

import type { FirewallDevice } from '@linode/api-v4';

export interface FirewallDeviceActionMenuProps extends ActionHandlers {
  device: FirewallDevice;
  disabled: boolean;
}

export const FirewallDeviceActionMenu = React.memo(
  (props: FirewallDeviceActionMenuProps) => {
    const { device, disabled, handleRemoveDevice } = props;

    return (
      <InlineMenuAction
        actionText="Remove"
        disabled={disabled}
        key="Remove"
        onClick={() => handleRemoveDevice(device)}
      />
    );
  }
);
