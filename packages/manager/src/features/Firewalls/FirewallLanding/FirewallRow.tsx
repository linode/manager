import { Firewall, FirewallDevice } from '@linode/api-v4/lib/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';
import { capitalize } from 'src/utilities/capitalize';

import { ActionHandlers, FirewallActionMenu } from './FirewallActionMenu';
import { StyledTableCell } from './FirewallRow.styles';

type CombinedProps = Firewall & ActionHandlers;

export const FirewallRow = React.memo((props: CombinedProps) => {
  const { id, label, rules, status, ...actionHandlers } = props;

  const { data: devices, error, isLoading } = useAllFirewallDevicesQuery(id);

  const count = getCountOfRules(rules);

  return (
    <TableRow
      ariaLabel={`Firewall ${label}`}
      data-testid={`firewall-row-${id}`}
    >
      <TableCell>
        <StyledLink tabIndex={0} to={`/firewalls/${id}`}>
          {label}
        </StyledLink>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={status === 'enabled' ? 'active' : 'inactive'} />
        {capitalize(status)}
      </TableCell>
      <Hidden smDown>
        <TableCell>{getRuleString(count)}</TableCell>
        <TableCell>
          {getDevicesCellString(devices ?? [], isLoading, error ?? undefined)}
        </TableCell>
      </Hidden>
      <StyledTableCell actionCell>
        <FirewallActionMenu
          firewallID={id}
          firewallLabel={label}
          firewallStatus={status}
          {...actionHandlers}
          style={{ border: '0', padding: '0' }}
        />
      </StyledTableCell>
    </TableRow>
  );
});

export const StyledLink = styled(Link, { label: 'StyledLink' })(() => ({
  '&:hover, &:focus': {
    textDecoration: 'underline',
  },
  display: 'block',
  fontSize: '.875rem',
  lineHeight: '1.125rem',
}));

/**
 *
 * outputs either
 *
 * 1 Inbound / 2 Outbound
 *
 * 1 Inbound
 *
 * 3 Outbound
 */
export const getRuleString = (count: [number, number]): string => {
  const [inbound, outbound] = count;

  let string = '';

  if (inbound !== 0 && outbound !== 0) {
    return `${inbound} Inbound / ${outbound} Outbound`;
  } else if (inbound !== 0) {
    string = `${inbound} Inbound`;
  } else if (outbound !== 0) {
    string += `${outbound} Outbound`;
  }
  return string || 'No rules';
};

export const getCountOfRules = (rules: Firewall['rules']): [number, number] => {
  return [(rules.inbound || []).length, (rules.outbound || []).length];
};

const getDevicesCellString = (
  data: FirewallDevice[],
  loading: boolean,
  error?: APIError[]
): JSX.Element | string => {
  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return 'Error retrieving Linodes';
  }

  if (data.length === 0) {
    return 'None assigned';
  }

  return getDeviceLinks(data);
};

export const getDeviceLinks = (data: FirewallDevice[]): JSX.Element => {
  const firstThree = data.slice(0, 8);
  return (
    <>
      {firstThree.map((thisDevice, idx) => (
        <Link
          className="link secondaryLink"
          data-testid="firewall-row-link"
          key={thisDevice.id}
          to={`/${thisDevice.entity.type}s/${thisDevice.entity.id}`}
        >
          {idx > 0 && `, `}
          {thisDevice.entity.label}
        </Link>
      ))}
      {data.length > 8 && (
        <span>
          {`, `}+ {data.length - 8}
        </span>
      )}
    </>
  );
};
