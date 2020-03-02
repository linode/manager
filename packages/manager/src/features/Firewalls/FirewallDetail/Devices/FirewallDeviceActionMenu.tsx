import * as React from 'react';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

export type RemoveDevice = (
  deviceID: number,
  deviceLabel: string,
  firewallID: number,
  firewallLabel: string
) => void;

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
    return (closeMenu: Function): Action[] => [
      {
        title: 'Remove',
        onClick: () => {
          triggerRemoveDevice(deviceID, deviceLabel);
          closeMenu();
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
