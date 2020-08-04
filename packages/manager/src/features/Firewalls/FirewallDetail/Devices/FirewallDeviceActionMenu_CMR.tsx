import * as React from 'react';

import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';

export interface ActionHandlers {
  triggerRemoveDevice: (deviceID: number, label: string) => void;
}

export interface Props extends ActionHandlers {
  deviceID: number;
  deviceLabel: string;
}

type CombinedProps = Props;

const FirewallDeviceActionMenu: React.FC<CombinedProps> = props => {
  const { deviceID, deviceLabel, triggerRemoveDevice } = props;

  const createActions = () => {
    return (): Action[] => [
      {
        title: 'Remove',
        onClick: () => {
          triggerRemoveDevice(deviceID, deviceLabel);
        }
      }
    ];
  };

  return (
    <ActionMenu
      createActions={createActions()}
      ariaLabel={`Action menu for Firewall Device ${deviceLabel}`}
    />
  );
};

export default React.memo(FirewallDeviceActionMenu);
