import * as React from 'react';
import { compose } from 'recompose';
// import { makeStyles, Theme } from 'src/components/core/styles'

import TableRow from 'src/components/core/TableRow';
import TableCell from 'src/components/TableCell';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';

import { Props as FireProps } from 'src/containers/firewalls.container';
import { FirewallWithSequence } from 'src/store/firewalls/firewalls.reducer';

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }))

interface Props extends Omit<FireProps, 'data' | 'results' | 'getFirewalls'> {
  data: FirewallWithSequence[];
}

type CombinedProps = Props;

const FirewallTableRows: React.FC<CombinedProps> = props => {
  // const classes = useStyles();

  const {
    data: firewalls,
    loading: firewallsLoading,
    error: firewallsError,
    lastUpdated: firewallsLastUpdated,
    listOfIDsInOriginalOrder: firewallsKeys
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
      {firewalls.map(eachFirewall => (
        <TableRow key={eachFirewall.id}>
          <TableCell>{eachFirewall.label}</TableCell>
          <TableCell>{eachFirewall.status}</TableCell>
          <TableCell>Rules</TableCell>
          <TableCell>Linodes</TableCell>
          <TableCell />
        </TableRow>
      ))}
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(React.memo)(FirewallTableRows);
