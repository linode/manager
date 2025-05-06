import { useAllFirewallDevicesQuery } from '@linode/queries';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import {
  getCountOfRules,
  getRuleString,
} from 'src/features/Firewalls/FirewallLanding/FirewallRow';

import { LinodeFirewallsActionMenu } from './LinodeFirewallsActionMenu';

import type { Firewall, FirewallDevice } from '@linode/api-v4';

interface LinodeFirewallsRowProps {
  firewall: Firewall;
  linodeID: number;
  onClickUnassign: (
    device: FirewallDevice | undefined,
    firewall: Firewall
  ) => void;
}

export const LinodeFirewallsRow = (props: LinodeFirewallsRowProps) => {
  const { firewall, linodeID, onClickUnassign } = props;

  const { id: firewallID, label, rules, status } = firewall;

  const { data: devices } = useAllFirewallDevicesQuery(firewallID);

  const firewallDevice = devices?.find(
    (device) => device.entity.type === 'linode' && device.entity.id === linodeID
  );

  const count = getCountOfRules(rules);

  return (
    <TableRow data-qa-linode-firewall-row key={`firewall-${firewallID}`}>
      <TableCell data-qa-firewall-label>
        <Link tabIndex={0} to={`/firewalls/${firewallID}`}>
          {label}
        </Link>
      </TableCell>
      <TableCell data-qa-firewall-status statusCell>
        <StatusIcon status={status === 'enabled' ? 'active' : 'inactive'} />
        {capitalize(status)}
      </TableCell>
      <TableCell data-qa-firewall-rules>{getRuleString(count)}</TableCell>
      <TableCell actionCell>
        <LinodeFirewallsActionMenu
          firewallID={firewallID}
          onUnassign={() => onClickUnassign(firewallDevice, firewall)}
        />
      </TableCell>
    </TableRow>
  );
};
