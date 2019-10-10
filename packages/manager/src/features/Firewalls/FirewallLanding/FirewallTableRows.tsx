import { Firewall } from 'linode-js-sdk/lib/firewalls';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
// import { makeStyles, Theme } from 'src/components/core/styles'

import TableRow from 'src/components/core/TableRow';
import TableCell from 'src/components/TableCell';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';

import { Props as FireProps } from 'src/containers/firewalls.container';
import withLinodes, {
  Props as LinodeProps
} from 'src/containers/withLinodes.container';
import { FirewallWithSequence } from 'src/store/firewalls/firewalls.reducer';
import ActionMenu, { ActionHandlers } from './FirewallActionMenu';

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }))

interface Props extends Omit<FireProps, 'data' | 'results' | 'getFirewalls'> {
  data: FirewallWithSequence[];
}

type CombinedProps = Props & LinodeProps & ActionHandlers;

const FirewallTableRows: React.FC<CombinedProps> = props => {
  // const classes = useStyles();

  const {
    data: firewalls,
    loading: firewallsLoading,
    error: firewallsError,
    lastUpdated: firewallsLastUpdated,
    listOfIDsInOriginalOrder: firewallsKeys,
    ...actionMenuHandlers
  } = props;

  if (firewallsLoading && firewallsLastUpdated === 0) {
    return <TableRowLoading colSpan={6} />;
  }

  /**
   * only display error if we don't already have data
   */
  if (firewallsError.read && firewallsLastUpdated === 0) {
    return (
      <TableRowError colSpan={6} message={firewallsError.read[0].reason} />
    );
  }

  if (firewallsLastUpdated !== 0 && firewallsKeys.length === 0) {
    return (
      <TableRowEmpty colSpan={6} message="You do not have any Firewalls" />
    );
  }

  return (
    <React.Fragment>
      {firewalls.map(eachFirewall => {
        const count = getCountOfRules(eachFirewall);
        return (
          <TableRow key={`firewall-row-${eachFirewall.id}`}>
            <TableCell>{eachFirewall.label}</TableCell>
            <TableCell>{eachFirewall.status}</TableCell>
            <TableCell>{getRuleString(count)}</TableCell>
            <TableCell>
              {getLinodesCellString(
                props.linodesData,
                props.linodesLoading && props.linodesLastUpdated === 0,
                props.linodesError,
                pathOr([], ['devices', 'linodes'], eachFirewall)
              )}
            </TableCell>
            <TableCell>
              <ActionMenu
                firewallID={eachFirewall.id}
                firewallLabel={eachFirewall.label}
                firewallStatus={eachFirewall.status}
                {...actionMenuHandlers}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </React.Fragment>
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

export const getCountOfRules = (firewall: Firewall): [number, number] => {
  return [
    (firewall.rules.inbound || []).length,
    (firewall.rules.outbound || []).length
  ];
};

const getLinodesCellString = (
  data: LinodeProps['linodesData'],
  loading: LinodeProps['linodesLoading'],
  error: LinodeProps['linodesError'],
  firewallLinodeIDs: number[]
): string => {
  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return 'Error retrieving Linodes';
  }

  return firewallLinodeIDs
    .reduce(
      (acc, eachLinodeID) => {
        const foundLinode = data.find(
          eachLinode => eachLinode.id === eachLinodeID
        );

        if (foundLinode) {
          acc.push(foundLinode.label);
        }
        return acc;
      },
      [] as string[]
    )
    .join(', ');
};

export default compose<CombinedProps, Props & ActionHandlers>(
  withLinodes(),
  React.memo
)(FirewallTableRows);
