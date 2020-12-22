import { Firewall, FirewallDevice } from '@linode/api-v4/lib/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import StatusIcon from 'src/components/StatusIcon';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import useFirewallDevices from 'src/hooks/useFirewallDevices';
import { capitalize } from 'src/utilities/capitalize';
import ActionMenu, { ActionHandlers } from './FirewallActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    display: 'block',
    fontFamily: theme.font.bold,
    color: theme.cmrTextColors.linkActiveLight,
    fontSize: '.875rem',
    lineHeight: '1.125rem',
    '&:hover, &:focus': {
      textDecoration: 'underline'
    }
  },
  labelWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap'
  },
  actionCell: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: 0,
    '&.MuiTableCell-root': {
      paddingRight: 0
    }
  }
}));

export type CombinedProps = Firewall & ActionHandlers;

export const FirewallRow: React.FC<CombinedProps> = props => {
  const { id, label, status, rules, ...actionHandlers } = props;
  const classes = useStyles();

  const {
    devices: { itemsById, error, loading, lastUpdated },
    requestDevices
  } = useFirewallDevices(id);
  const devices = Object.values(itemsById);

  React.useEffect(() => {
    if (lastUpdated === 0 && !loading) {
      requestDevices();
    }
  }, [lastUpdated, loading, requestDevices]);

  const count = getCountOfRules(rules);

  return (
    <TableRow
      key={`firewall-row-${id}`}
      data-testid={`firewall-row-${id}`}
      ariaLabel={`Firewall ${label}`}
    >
      <TableCell>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <div className={classes.labelWrapper}>
              <Link
                className={classes.link}
                to={`/firewalls/${id}`}
                tabIndex={0}
              >
                {label}
              </Link>
            </div>
          </Grid>
        </Grid>{' '}
      </TableCell>
      <TableCell>
        <StatusIcon status={status === 'enabled' ? 'active' : 'inactive'} />
        {capitalize(status)}
      </TableCell>
      <Hidden xsDown>
        <TableCell>{getRuleString(count)}</TableCell>
        <TableCell>
          {getLinodesCellString(devices, loading, error.read)}
        </TableCell>
      </Hidden>
      <TableCell className={classes.actionCell}>
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
export const getRuleString = (count: [number, number]) => {
  const [inbound, outbound] = count;

  let string = '';

  if (inbound !== 0 && outbound !== 0) {
    return `${inbound} Inbound / ${outbound} Outbound`;
  } else if (inbound !== 0) {
    string = `${inbound} Inbound`;
  } else if (outbound !== 0) {
    string += `${outbound} Outbound`;
  }
  return string;
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

export default compose<CombinedProps, ActionHandlers & Firewall>(React.memo)(
  FirewallRow
);
