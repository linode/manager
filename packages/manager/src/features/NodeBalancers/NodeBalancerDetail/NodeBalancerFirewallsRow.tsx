import { Firewall, FirewallDevice } from '@linode/api-v4';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import {
  getCountOfRules,
  getRuleString,
} from 'src/features/Firewalls/FirewallLanding/FirewallRow';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';
import { capitalize } from 'src/utilities/capitalize';

import { NodeBalancerFirewallsActionMenu } from './NodeBalancerFirewallsActionMenu';

interface Props {
  firewall: Firewall;
  nodeBalancerID: number;
  onClickUnassign: (
    device: FirewallDevice | undefined,
    firewall: Firewall
  ) => void;
}

export const NodeBalancerFirewallsRow = (props: Props) => {
  const { firewall, nodeBalancerID, onClickUnassign } = props;

  const { id: firewallID, label, rules, status } = firewall;

  const { data: devices } = useAllFirewallDevicesQuery(firewallID);

  const firewallDevice = devices?.find(
    (device) =>
      device.entity.type === 'nodebalancer' &&
      device.entity.id === nodeBalancerID
  );

  const count = getCountOfRules(rules);

  return (
    <TableRow
      ariaLabel={`Firewall ${label}`}
      data-qa-linode-firewall-row
      key={`firewall-${firewallID}`}
    >
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
        <NodeBalancerFirewallsActionMenu
          firewallID={firewallID}
          onUnassign={() => onClickUnassign(firewallDevice, firewall)}
        />
      </TableCell>
    </TableRow>
  );
};
