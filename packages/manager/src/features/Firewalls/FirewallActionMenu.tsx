import { FirewallStatus } from 'linode-js-sdk/lib/firewalls';
import * as React from 'react';
import { compose } from 'recompose';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  firewallID: number;
  firewallLabel: string;
  firewallStatus: FirewallStatus;
  triggerEnableFirewall: (firewallID: number, firewallLabel: string) => void;
  triggerDisableFirewall: (firewallID: number, firewallLabel: string) => void;
  triggerEditFirewall: (firewallID: number, firewallLabel: string) => void;
  triggerDeleteFirewall: (firewallID: number, firewallLabel: string) => void;
}

type CombinedProps = Props;

const FirewallActionMenu: React.FC<CombinedProps> = props => {
  const {
    firewallID,
    firewallLabel,
    firewallStatus,
    triggerEnableFirewall,
    triggerDisableFirewall,
    triggerDeleteFirewall,
    triggerEditFirewall
  } = props;

  const createActions = () => {
    return (closeMenu: Function): Action[] => [
      {
        title: firewallStatus === 'disabled' ? 'Enable' : 'Disable',
        onClick: () => {
          const request = () =>
            firewallStatus === 'disabled'
              ? triggerEnableFirewall(firewallID, firewallLabel)
              : triggerDisableFirewall(firewallID, firewallLabel);

          request();

          closeMenu();
        }
      },
      {
        title: 'Edit',
        onClick: () => {
          closeMenu();
          triggerEditFirewall(firewallID, firewallLabel);
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          closeMenu();
          triggerDeleteFirewall(firewallID, firewallLabel);
        }
      }
    ];
  };

  return <ActionMenu createActions={createActions()} />;
};

export default compose<CombinedProps, Props>(React.memo)(FirewallActionMenu);
