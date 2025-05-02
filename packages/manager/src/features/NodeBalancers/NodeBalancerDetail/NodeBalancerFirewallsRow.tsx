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

import { NodeBalancerFirewallsActionMenu } from './NodeBalancerFirewallsActionMenu';

import type { Firewall, FirewallDevice } from '@linode/api-v4';

interface Props {
  devices: FirewallDevice[] | undefined;
  firewall: Firewall;
  nodeBalancerId: number;
  onClickUnassign: () => void;
}

export const NodeBalancerFirewallsRow = (props: Props) => {
  const { firewall, onClickUnassign } = props;

  const { id: firewallID, label, rules, status } = firewall;

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
        <NodeBalancerFirewallsActionMenu
          firewallID={firewallID}
          onUnassign={onClickUnassign}
        />
      </TableCell>
    </TableRow>
  );
};
