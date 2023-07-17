import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

export interface ActionHandlers {
  triggerRemoveDevice: (deviceID: number, label: string) => void;
}

export interface Props extends ActionHandlers {
  deviceEntityID: string;
  deviceID: number;
  deviceLabel: string;
  disabled: boolean;
}

type CombinedProps = Props;

const FirewallDeviceActionMenu: React.FC<CombinedProps> = (props) => {
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
