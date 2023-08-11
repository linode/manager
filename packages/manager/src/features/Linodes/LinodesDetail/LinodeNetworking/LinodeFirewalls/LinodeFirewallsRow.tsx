import { Firewall } from '@linode/api-v4';
import * as React from 'react';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import {
  StyledLink,
  getCountOfRules,
  getRuleString,
} from 'src/features/Firewalls/FirewallLanding/FirewallRow';
import { capitalize } from 'src/utilities/capitalize';

import { LinodeFirewallsActionMenu } from './LinodeFirewallsActionMenu';

interface LinodeFirewallsRowProps {
  firewall: Firewall;
  triggerRemoveDevice: () => void;
}

export const LinodeFirewallsRow = (props: LinodeFirewallsRowProps) => {
  const {
    firewall: { id, label, rules, status },
    triggerRemoveDevice,
  } = props;

  const count = getCountOfRules(rules);

  return (
    <TableRow
      ariaLabel={`Firewall ${label}`}
      data-qa-linode-firewall-row
      key={`firewall-${id}`}
    >
      <TableCell data-qa-firewall-label>
        <StyledLink tabIndex={0} to={`/firewalls/${id}`}>
          {label}
        </StyledLink>
      </TableCell>
      <TableCell data-qa-firewall-status statusCell>
        <StatusIcon status={status === 'enabled' ? 'active' : 'inactive'} />
        {capitalize(status)}
      </TableCell>
      <TableCell data-qa-firewall-rules>{getRuleString(count)}</TableCell>
      <TableCell actionCell>
        <LinodeFirewallsActionMenu
          firewallID={id}
          onUnassign={triggerRemoveDevice}
        />
      </TableCell>
    </TableRow>
  );
};
