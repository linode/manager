import { Firewall, FirewallDevice } from '@linode/api-v4/lib/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
import React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useFlags } from 'src/hooks/useFlags';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';
import { capitalize } from 'src/utilities/capitalize';

import { ActionHandlers, FirewallActionMenu } from './FirewallActionMenu';

export type Props = Firewall & ActionHandlers;

export const FirewallRow = React.memo((props: Props) => {
  const flags = useFlags();
  const { id, label, rules, status, ...actionHandlers } = props;

  const { data: devices, error, isLoading } = useAllFirewallDevicesQuery(id);

  let featureFlaggedDevices: FirewallDevice[] = devices ?? [];
  if (!flags.firewallNodebalancer) {
    featureFlaggedDevices =
      devices?.filter((thisDevice) => {
        return thisDevice.entity.type === 'linode';
      }) ?? [];
  }

  const count = getCountOfRules(rules);

  return (
    <TableRow
      ariaLabel={`Firewall ${label}`}
      data-testid={`firewall-row-${id}`}
    >
      <TableCell>
        <Link tabIndex={0} to={`/firewalls/${id}`}>
          {label}
        </Link>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={status === 'enabled' ? 'active' : 'inactive'} />
        {capitalize(status)}
      </TableCell>
      <Hidden smDown>
        <TableCell>{getRuleString(count)}</TableCell>
        <TableCell>
          {getDevicesCellString(
            featureFlaggedDevices ?? [],
            isLoading,
            error ?? undefined
          )}
        </TableCell>
      </Hidden>
      <TableCell sx={{ textAlign: 'end', whiteSpace: 'nowrap' }}>
        <FirewallActionMenu
          firewallID={id}
          firewallLabel={label}
          firewallStatus={status}
          {...actionHandlers}
        />
      </TableCell>
    </TableRow>
  );
});

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
  const firstThree = data.slice(0, 3);

  return (
    <>
      {firstThree.map((thisDevice, idx) => (
        <Link
          className="link secondaryLink"
          data-testid="firewall-row-link"
          key={thisDevice.id}
          to={`/linodes/${thisDevice.entity.id}`}
        >
          {idx > 0 && `, `}
          {thisDevice.entity.label}
        </Link>
      ))}
      {data.length > 3 && (
        <span>
          {`, `}plus {data.length - 3} more.
        </span>
      )}
    </>
  );
};
