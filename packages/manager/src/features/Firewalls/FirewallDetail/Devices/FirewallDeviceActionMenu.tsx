import * as React from 'react';
import InlineMenuAction from 'src/components/InlineMenuAction';

export interface ActionHandlers {
  triggerRemoveDevice: (deviceID: number, label: string) => void;
}

export interface Props extends ActionHandlers {
  deviceID: number;
  deviceLabel: string;
  deviceEntityID: string;
  disabled: boolean;
}

type CombinedProps = Props;

const FirewallDeviceActionMenu: React.FC<CombinedProps> = (props) => {
  const { deviceID, deviceLabel, disabled, triggerRemoveDevice } = props;

  return (
    <InlineMenuAction
      key="Remove"
      actionText="Remove"
      disabled={disabled}
      onClick={() => triggerRemoveDevice(deviceID, deviceLabel)}
    />
  );
};

export default React.memo(FirewallDeviceActionMenu);
