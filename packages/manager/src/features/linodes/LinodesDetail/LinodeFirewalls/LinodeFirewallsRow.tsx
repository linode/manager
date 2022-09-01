import { Firewall, FirewallDevice } from '@linode/api-v4/lib/firewalls';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import useFirewallDevices from 'src/hooks/useFirewallDevices';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    display: 'block',
    color: theme.cmrTextColors.linkActiveLight,
    fontSize: '.875rem',
    lineHeight: '1.125rem',
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  },
  labelWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
}));

export type CombinedProps = Firewall;

export const LinodeFirewallsRow: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { id, label, rules } = props;

  const {
    devices: { error, loading, lastUpdated },
    requestDevices,
  } = useFirewallDevices(id);
  // const devices = Object.values(itemsById);

  React.useEffect(() => {
    if (lastUpdated === 0 && !(loading || error.read)) {
      requestDevices();
    }
  }, [error, lastUpdated, loading, requestDevices]);

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
        </Grid>
      </TableCell>
      {/* <TableCell>
        <StatusIcon status={status === 'enabled' ? 'active' : 'inactive'} />
        {capitalize(status)}
      </TableCell> */}
      <Hidden xsDown>
        <TableCell>{getRuleString(count)}</TableCell>
        {/* <TableCell>
          {getLinodesCellString(devices, loading, error.read)}
        </TableCell> */}
      </Hidden>
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

// const getLinodesCellString = (
//   data: FirewallDevice[],
//   loading: boolean,
//   error?: APIError[]
// ): string | JSX.Element => {
//   if (loading) {
//     return 'Loading...';
//   }

//   if (error) {
//     return 'Error retrieving Linodes';
//   }

//   if (data.length === 0) {
//     return 'None assigned';
//   }

//   return getDeviceLinks(data);
// };

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

export default compose<CombinedProps, Firewall>(React.memo)(LinodeFirewallsRow);
