import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

export interface ActionHandlers {
  triggerRemoveDevice: (deviceID: number, label: string) => void;
}

export interface FirewallDeviceActionMenuProps extends ActionHandlers {
  deviceEntityID: string;
  deviceID: number;
  deviceLabel: string;
  disabled: boolean;
}

const FirewallDeviceActionMenu = (props: FirewallDeviceActionMenuProps) => {
  const { deviceID, deviceLabel, disabled, triggerRemoveDevice } = props;

  return (
    <InlineMenuAction
      actionText="Remove"
      disabled={disabled}
      key="Remove"
      onClick={() => triggerRemoveDevice(deviceID, deviceLabel)}
    />
  );
};

export default React.memo(FirewallDeviceActionMenu);
