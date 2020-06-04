import { FirewallStatus } from '@linode/api-v4/lib/firewalls';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

export interface ActionHandlers {
  triggerEnableFirewall: (firewallID: number, firewallLabel: string) => void;
  triggerDisableFirewall: (firewallID: number, firewallLabel: string) => void;
  triggerDeleteFirewall: (firewallID: number, firewallLabel: string) => void;
}

interface Props extends ActionHandlers {
  firewallID: number;
  firewallLabel: string;
  firewallStatus: FirewallStatus;
}

type CombinedProps = Props;

const FirewallActionMenu: React.FC<CombinedProps> = props => {
  const {
    firewallID,
    firewallLabel,
    firewallStatus,
    triggerEnableFirewall,
    triggerDisableFirewall,
    triggerDeleteFirewall
  } = props;
  const history = useHistory();

  const createActions = () => {
    return (): Action[] => [
      {
        title: firewallStatus === 'disabled' ? 'Enable' : 'Disable',
        onClick: () => {
          const request = () =>
            firewallStatus === 'disabled'
              ? triggerEnableFirewall(firewallID, firewallLabel)
              : triggerDisableFirewall(firewallID, firewallLabel);

          request();
        }
      },
      {
        title: 'Edit',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          history.push(`/firewalls/${firewallID}/rules`);
          e.preventDefault();
          e.stopPropagation();
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          triggerDeleteFirewall(firewallID, firewallLabel);
        }
      }
    ];
  };

  return (
    <ActionMenu
      createActions={createActions()}
      ariaLabel={`Action menu for Firewall ${props.firewallLabel}`}
    />
  );
};

export default React.memo(FirewallActionMenu);
