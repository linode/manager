import { Firewall, FirewallDevice } from '@linode/api-v4/lib/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import StatusIcon from 'src/components/StatusIcon';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';
import capitalize from 'src/utilities/capitalize';
import ActionMenu, { ActionHandlers } from './FirewallActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    display: 'block',
    color: theme.textColors.linkActiveLight,
    fontSize: '.875rem',
    lineHeight: '1.125rem',
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  },
}));

export type Props = Firewall & ActionHandlers;

export const FirewallRow = (props: Props) => {
  const classes = useStyles();

  const { id, label, status, rules, ...actionHandlers } = props;

  const { data: devices, isLoading, error } = useAllFirewallDevicesQuery(id);

  const count = getCountOfRules(rules);

  return (
    <TableRow
      data-testid={`firewall-row-${id}`}
      ariaLabel={`Firewall ${label}`}
    >
      <TableCell>
        <Link className={classes.link} to={`/firewalls/${id}`} tabIndex={0}>
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
          {getLinodesCellString(devices ?? [], isLoading, error ?? undefined)}
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <ActionMenu
          firewallID={id}
          firewallLabel={label}
          firewallStatus={status}
          {...actionHandlers}
        />
      </TableCell>
    </TableRow>
  );
};

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

const getLinodesCellString = (
  data: FirewallDevice[],
  loading: boolean,
  error?: APIError[]
): string | JSX.Element => {
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
          key={thisDevice.id}
          to={`/linodes/${thisDevice.entity.id}`}
          data-testid="firewall-row-link"
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

export default React.memo(FirewallRow);
